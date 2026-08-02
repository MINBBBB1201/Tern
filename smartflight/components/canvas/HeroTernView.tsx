"use client";
/* eslint-disable react-hooks/refs --
   Imperative three.js scene graph: objects are constructed once (lazy ref
   init, sanctioned by the React docs) and mutated per-frame inside
   useFrame callbacks, which is how react-three-fiber animation works.
   The React Compiler rules assume render-path data flow that does not
   apply to a WebGL scene graph. */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { View, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import HeroGlobe, { globeShared } from "./HeroGlobe";
import { heroRoute } from "../../lib/heroRoute";
import { useQuality } from "./quality";

/**
 * Civil Twilight signature sequence — R3F port of the original raw-Three
 * HeroSceneTern (same keypoints, phase timings, materials, and math).
 *
 * A low-poly translucent glass Arctic Tern crosses the hero along a
 * great-circle arc; its wingtrail condenses into the floating glass
 * boarding pass — one continuous object changing form, not two cuts.
 *
 * Rendered as a drei <View> into the site-wide canvas (GlobalCanvasInner)
 * instead of owning a WebGL context: one GPU pipeline for the whole site,
 * and the settled pass can react to page scroll (Phase C drifts with the
 * hero as it leaves the viewport, handing motion off to the sections
 * below). Mounted client-only via dynamic(..., { ssr: false }).
 */

type PathPoint = { x: number; y: number };

/** Where the boarding pass settles (fractional hero coords). Raised from
 *  0.26 when the route ticker lengthened the copy block below it. */
const SETTLE: PathPoint = { x: 0.72, y: 0.225 };

/**
 * One continuous cinematic beat (Stage 1.5 update #2): the tern swoops in
 * from off-screen, circles the globe once along the same ICN→LHR
 * great-circle route drawn on its surface, then breaks off toward the
 * camera and condenses into the boarding pass. Circle the world → become
 * your ticket.
 */
const ENTRY_MS = 800;
const ORBIT_MS = 3600;
const FLIGHT_MS = ENTRY_MS + ORBIT_MS; // total pre-handoff flight time
const HANDOFF_MS = 1400;
const ORBIT_ALT = 1.16; // orbit radius over the unit globe sphere

/**
 * Phase D — ambient shuttle. After the signature sequence settles, a
 * second, much quieter tern fades in and endlessly commutes between the
 * two searched airports along the route's great circle: the searched
 * route stays visibly alive without competing with the settled pass.
 */
const AMBIENT_DELAY_MS = 1200; // beat of calm after the pass settles
const AMBIENT_FADE_MS = 600;
const AMBIENT_ALT = 1.09; // just above the drawn route line
const AMBIENT_RATE = 0.35; // rad/s along the arc (legs scale with span)
const AMBIENT_MIN_LEG_MS = 3000;
// Distant background actor: ~7% of the globe's on-screen diameter
// (bird length ≈ 2.36 world × 0.6 × 0.2 ≈ 0.28 ≈ 41px vs globe 540px).
const AMBIENT_SCALE = 0.2;

const CONTRAIL = new THREE.Color("#8FE0E8");
const PASS_W = 1.9;
const PASS_H = 0.85;
const PASS_R = 0.09; // boarding-pass slab corner radius — glint targets derive from it
const TRAIL_N = 120;
const TERN_SCALE = 0.6;

/**
 * Portrait composition transform, written once per frame by
 * PortraitComposition and read by TernSequence.
 *
 * Why this has to exist (I7): TernSequence computes positions in WORLD space
 * — the orbit comes from `spin.localToWorld` and the pass's settle point from
 * unprojecting a screen coordinate through the camera. But tern/trail/pass/
 * sparks are all children of `root`, which now sits inside a scaled+lifted
 * group. Assigning a world vector to a child's `.position` treats it as a
 * LOCAL value, so the whole flock rendered at scale*p + offset instead of p:
 * the tern floated away from the globe and route it is supposed to follow.
 * That was invisible before the group existed, when local == world.
 *
 * Converting at the few world-space PRODUCERS (rather than the many consumers)
 * keeps every downstream mix — tail emission, breakaway control points, the
 * radial/tangent frames — in one consistent space.
 */
const heroComp = { scale: 1, offsetY: 0 };

/**
 * The portrait transform as a pure function of view aspect — the single
 * source of truth for both the group that applies it and the sequence that
 * has to invert it. Deliberately NOT a "parent writes, child reads" handoff:
 * R3F runs useFrame callbacks in subscription order, which follows mount
 * order, and children mount before parents — so the child would have read a
 * one-frame-stale transform. Both sides recomputing from the same aspect on
 * the same frame has no ordering hazard at all.
 *
 * 0 at landscape (aspect >= 0.95), ramping to 1 at phone portrait (<= 0.45).
 */
const portraitTransform = (aspect: number) => {
  const t = THREE.MathUtils.clamp((0.95 - aspect) / 0.5, 0, 1);
  return {
    scale: THREE.MathUtils.lerp(1, 0.44, t),
    offsetY: THREE.MathUtils.lerp(0, 1.35, t),
  };
};

const viewAspect = (state: { camera: THREE.Camera; size: { width: number; height: number } }) => {
  const cam = state.camera as THREE.PerspectiveCamera;
  return cam.isPerspectiveCamera ? cam.aspect : state.size.width / Math.max(state.size.height, 1);
};

/** World → composition-local. Uniform scale plus a y-only lift, so the
 *  inverse is a subtract-then-divide. Mutates and returns `v`. */
const compToLocal = (v: THREE.Vector3) => {
  v.y -= heroComp.offsetY;
  return v.multiplyScalar(1 / heroComp.scale);
};

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const smoothstep = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
// Slight overshoot so the pass "pops" as it crystallizes.
const easeOutBackSoft = (t: number) => {
  const c = 1.2;
  const x = t - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

/* ── Arctic tern model — Sterna paradisaea ──────────────────────────
   Streamlined lofted body (smooth-shaded, not faceted), black cap over
   the crown, dusk-lit bill (--horizon-500: the real bill is deep red;
   the token orange reads as that red under this palette), deep forked
   streamer tail, and long swept two-segment wings (arm + hand) so the
   wingbeat can articulate at the wrist like a real seabird. +x forward.
   Proportions land in the same ~[-1.32, +1.06] x-extent as the previous
   model so every phase offset/scale keeps working. */

/** Fuselage: lathe of a tern profile — deep chest, slim tail cone,
 *  distinct head bulge; axis rotated to +x, slightly narrowed in z. */
function buildTernBodyGeo(): THREE.BufferGeometry {
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0.004, -1.02),
    new THREE.Vector2(0.028, -0.78),
    new THREE.Vector2(0.055, -0.5),
    new THREE.Vector2(0.085, -0.2),
    new THREE.Vector2(0.102, 0.02),
    new THREE.Vector2(0.098, 0.22),
    new THREE.Vector2(0.078, 0.42),
    new THREE.Vector2(0.072, 0.5),
    new THREE.Vector2(0.086, 0.6),
    new THREE.Vector2(0.068, 0.7),
    new THREE.Vector2(0.02, 0.76),
    new THREE.Vector2(0.004, 0.78),
  ];
  const geo = new THREE.LatheGeometry(profile, 20);
  geo.rotateZ(-Math.PI / 2); // axis → +x, head at +x
  geo.scale(1, 1, 0.88);
  geo.computeVertexNormals();
  return geo;
}

/** Black cap: a dome hugging the crown from forehead to nape. */
function buildCapGeo(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.098, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.58);
  geo.scale(1.3, 0.9, 0.94);
  geo.rotateZ(-0.22); // crown tipped forward over the forehead
  geo.translate(0.575, 0.02, 0);
  return geo;
}

/** Bill: slim cone, pointing forward with the tern's slight downlook. */
function buildBillGeo(): THREE.BufferGeometry {
  const geo = new THREE.ConeGeometry(0.024, 0.3, 10);
  geo.rotateZ(-Math.PI / 2); // apex → +x
  geo.rotateZ(-0.05);
  geo.translate(0.88, 0.0, 0);
  return geo;
}

/** Deep forked tail: two long thin streamers + a small central web. */
function buildTailGeo(): THREE.BufferGeometry {
  const tris: number[][][] = [];
  for (const s of [1, -1]) {
    tris.push([
      [-0.88, 0.02, 0.012 * s],
      [-0.98, 0.03, 0.055 * s],
      [-1.3, 0.09, 0.165 * s],
    ]);
  }
  tris.push([
    [-0.86, 0.02, 0.04],
    [-0.86, 0.02, -0.04],
    [-1.04, 0.045, 0],
  ]);
  const positions = new Float32Array(tris.flat(2));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Inner wing (arm): shoulder → wrist panel, broad chord. Local origin
 *  at the shoulder; span along ±z. */
function buildArmGeo(sign: number): THREE.BufferGeometry {
  const s = (v: number[]) => [v[0], v[1], v[2] * sign];
  const le0 = s([0.13, 0, 0.01]);
  const te0 = s([-0.22, 0, 0.05]);
  // secondaries: a soft trailing-edge bulge mid-arm, so the inner wing
  // reads as a feathered surface instead of a rectangular panel
  const tm = s([-0.25, 0.005, 0.25]);
  const le1 = s([0.07, 0.012, 0.46]);
  const te1 = s([-0.14, 0.007, 0.45]);
  const tris = [
    [le0, le1, tm],
    [le0, tm, te0],
    [tm, le1, te1],
  ];
  const positions = new Float32Array(tris.flat(2));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Outer wing (hand): long swept blade to a sharp point, two shallow
 *  primary notches on the trailing edge. Local origin at the wrist. */
function buildHandGeo(sign: number): THREE.BufferGeometry {
  const s = (v: number[]) => [v[0], v[1], v[2] * sign];
  const le0 = s([0.07, 0.012, 0]);
  const te0 = s([-0.14, 0.007, 0]);
  const tip = s([-0.62, 0.03, 0.8]);
  const n1 = s([-0.26, 0.01, 0.5]);
  const tip2 = s([-0.5, 0.02, 0.6]);
  const n2 = s([-0.33, 0.006, 0.3]);
  const tris = [
    [le0, tip, n1],
    [n1, tip2, n2],
    [n2, s([-0.42, 0.012, 0.4]), te0],
  ];
  const positions = new Float32Array(tris.flat(2));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Real seabird wingbeat: flap bursts alternating with glides (gait
 * envelope), and the hand lagging the arm in phase so the wing snakes
 * instead of see-sawing. `glide` biases toward soaring (ambient bird).
 */
function applyWingbeat(
  shoulders: THREE.Group[],
  wrists: THREE.Group[],
  a: { flapPhase: number; gaitPhase: number },
  dt: number,
  speed: number,
  glide: number
) {
  a.gaitPhase += dt * 0.85;
  const gaitS = 0.5 + 0.5 * Math.sin(a.gaitPhase);
  // envelope: ~half the cycle flapping, half gliding; `glide` shrinks it
  const env = (0.08 + 0.92 * smoothstep(gaitS, 0.35, 0.62)) * (1 - glide * 0.85);
  a.flapPhase += dt * speed * (0.2 + 0.8 * env);
  const sh = Math.sin(a.flapPhase) * 0.55 * env;
  const wr = Math.sin(a.flapPhase - 0.85) * 0.4 * env;
  // Glide pose: the seabird gull-wing — arms raised in a shallow
  // dihedral, hands drooped at the wrist — with a slow soaring sway.
  const glidePose = 0.15 + Math.sin(a.gaitPhase * 1.7) * 0.035;
  const base = glidePose * (1 - env) - 0.1 * env;
  shoulders[0].rotation.x = sh + base;
  shoulders[1].rotation.x = -(sh + base);
  wrists[0].rotation.x = wr - 0.14 * (1 - env);
  wrists[1].rotation.x = -(wr - 0.14 * (1 - env));
}

function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Point on the pass rectangle outline at perimeter fraction f — the
 *  targets the wingtrail condenses onto. */
function outlinePoint(f: number, w: number, h: number): { x: number; y: number } {
  const per = 2 * (w + h);
  let d = ((f % 1) + 1) % 1 * per;
  if (d < w) return { x: -w / 2 + d, y: -h / 2 };
  d -= w;
  if (d < h) return { x: w / 2, y: -h / 2 + d };
  d -= h;
  if (d < w) return { x: w / 2 - d, y: h / 2 };
  d -= w;
  return { x: -w / 2, y: h / 2 - d };
}

/** Boarding-pass face: route text, perforation, stub, barcode — drawn so
 *  the object is unmistakably a travel document, not an abstract slab.
 *  The route is LIVE: it reads heroRoute (the same store the globe arc
 *  and search bar share) and is redrawn whenever the search changes. */
function drawPassFace(canvas: HTMLCanvasElement) {
  const W = 1024;
  const H = 458;
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  if (!g) return;
  const rootStyle = getComputedStyle(document.documentElement);
  const mono = rootStyle.getPropertyValue("--font-jetbrains-mono").trim() || "ui-monospace, Menlo, monospace";
  const display = rootStyle.getPropertyValue("--font-space-grotesk").trim() || "ui-sans-serif, system-ui";
  const paper = "rgba(246,248,251,";
  const cyan = "rgba(143,224,232,";

  g.clearRect(0, 0, W, H);
  const sheen = g.createLinearGradient(0, 0, 0, H);
  sheen.addColorStop(0, "rgba(255,255,255,0.08)");
  sheen.addColorStop(0.6, "rgba(255,255,255,0.02)");
  sheen.addColorStop(1, cyan + "0.05)");
  g.fillStyle = sheen;
  g.fillRect(0, 0, W, H);

  // Header
  g.textBaseline = "alphabetic";
  g.textAlign = "left";
  g.fillStyle = paper + "0.85)";
  g.font = `700 40px ${display}`;
  g.fillText("TERN", 60, 88);
  g.textAlign = "right";
  g.font = `600 23px ${mono}`;
  g.fillStyle = paper + "0.55)";
  g.fillText("B O A R D I N G  P A S S", 700, 86);

  // FROM / TO labels
  g.font = `600 21px ${mono}`;
  g.fillStyle = cyan + "0.8)";
  g.textAlign = "left";
  g.fillText("FROM", 60, 158);
  g.textAlign = "right";
  g.fillText("TO", 700, 158);

  // IATA codes — glowing faintly, split-flap style — from the live route
  const fromCode = heroRoute.from.iata;
  const toCode = heroRoute.to.iata;
  g.font = `700 92px ${mono}`;
  g.fillStyle = paper + "0.96)";
  g.shadowColor = cyan + "0.85)";
  g.shadowBlur = 20;
  g.textAlign = "left";
  g.fillText(fromCode, 60, 252);
  g.textAlign = "right";
  g.fillText(toCode, 700, 252);
  g.shadowBlur = 0;

  // Route line: dot ── plane glyph ── dot
  const ry = 222;
  const x0 = 262;
  const x1 = 498;
  g.strokeStyle = cyan + "0.7)";
  g.fillStyle = cyan + "0.95)";
  g.lineWidth = 2.5;
  g.shadowColor = cyan + "0.8)";
  g.shadowBlur = 10;
  g.beginPath();
  g.arc(x0, ry, 5, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(x1, ry, 5, 0, Math.PI * 2);
  g.fill();
  const mid = (x0 + x1) / 2;
  g.beginPath();
  g.moveTo(x0 + 12, ry);
  g.lineTo(mid - 22, ry);
  g.moveTo(mid + 22, ry);
  g.lineTo(x1 - 12, ry);
  g.stroke();
  // small tern glyph mid-route
  g.beginPath();
  g.moveTo(mid - 14, ry + 4);
  g.lineTo(mid + 16, ry);
  g.lineTo(mid - 6, ry - 2);
  g.lineTo(mid - 10, ry - 10);
  g.closePath();
  g.fill();
  g.shadowBlur = 0;

  // Cities — clamped so long names never collide mid-face
  const cityLabel = (c: string) => c.toUpperCase().slice(0, 16);
  g.font = `500 22px ${mono}`;
  g.fillStyle = paper + "0.55)";
  g.textAlign = "left";
  g.fillText(cityLabel(heroRoute.from.city), 60, 300);
  g.textAlign = "right";
  g.fillText(cityLabel(heroRoute.to.city), 700, 300);

  // Data row
  g.font = `600 23px ${mono}`;
  g.fillStyle = paper + "0.6)";
  g.textAlign = "left";
  g.fillText("FLIGHT TN·001", 60, 396);
  g.fillText("DEP 19:42", 330, 396);
  g.fillText("ALT 35,000FT", 508, 396);

  // Perforation between body and stub
  g.strokeStyle = cyan + "0.4)";
  g.lineWidth = 2;
  g.setLineDash([10, 12]);
  g.beginPath();
  g.moveTo(748, 36);
  g.lineTo(748, H - 36);
  g.stroke();
  g.setLineDash([]);

  // Stub: gate / seat / barcode
  g.textAlign = "left";
  g.font = `600 20px ${mono}`;
  g.fillStyle = cyan + "0.75)";
  g.fillText("GATE", 796, 120);
  g.fillText("SEAT", 796, 236);
  g.font = `700 58px ${mono}`;
  g.fillStyle = paper + "0.92)";
  g.fillText("22", 796, 182);
  g.fillText("14A", 796, 298);
  // deterministic barcode
  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  g.fillStyle = paper + "0.6)";
  let bx = 780;
  while (bx < 972) {
    const bw = 2 + Math.floor(rand() * 4);
    if (rand() > 0.35) g.fillRect(bx, 342, bw, 78);
    bx += bw + 3;
  }
}

/* ── Static settled pass (low-power / reduced-motion fallback) ── */

const BARCODE = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2];

function StaticBoardingPass() {
  // Same live route the 3D pass draws — the static fallback subscribes so
  // a search edit updates this card too (useSyncExternalStore over the
  // non-React heroRoute store).
  useSyncExternalStore(
    heroRoute.subscribe,
    () => heroRoute.version,
    () => heroRoute.version
  );
  const cityLabel = (c: string) => c.toUpperCase().slice(0, 12);
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
      <div className="boarding-pass-static-wrap" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        <div className="boarding-pass-static" style={{ width: "min(86vw, 380px)", padding: "16px 20px 14px", color: "var(--paper-50)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="hero-headline" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "0.02em" }}>TERN</span>
            <span className="data-mono" style={{ fontSize: 9, letterSpacing: "0.32em", color: "rgba(246,248,251,0.6)" }}>BOARDING PASS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <div>
              <div className="data-mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(143,224,232,0.85)" }}>FROM</div>
              <div className="data-mono" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>{heroRoute.from.iata}</div>
              <div className="data-mono" style={{ fontSize: 9, color: "rgba(246,248,251,0.55)" }}>{cityLabel(heroRoute.from.city)}</div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--contrail-300)", boxShadow: "var(--contrail-glow)" }} />
              <span style={{ flex: 1, height: 1, background: "rgba(143,224,232,0.55)" }} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--contrail-300)"><path d="M2 15 L22 9 L12 12 L9 5 L7 6 L9 13 Z" /></svg>
              <span style={{ flex: 1, height: 1, background: "rgba(143,224,232,0.55)" }} />
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--contrail-300)", boxShadow: "var(--contrail-glow)" }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="data-mono" style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(143,224,232,0.85)" }}>TO</div>
              <div className="data-mono" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>{heroRoute.to.iata}</div>
              <div className="data-mono" style={{ fontSize: 9, color: "rgba(246,248,251,0.55)" }}>{cityLabel(heroRoute.to.city)}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, borderTop: "1px dashed rgba(143,224,232,0.4)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="data-mono" style={{ fontSize: 9, color: "rgba(246,248,251,0.6)", letterSpacing: "0.08em" }}>TN·001 · GATE 22 · SEAT 14A</span>
            <span style={{ display: "inline-flex", gap: 2, alignItems: "flex-end" }}>
              {BARCODE.map((w, i) => (
                <span key={i} style={{ width: w, height: 14, background: "rgba(246,248,251,0.55)" }} />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── The animated scene ── */

/** Imperative scene assembly, ported verbatim from the raw-Three version.
 *  Called once per mount (lazy ref init) — everything it returns is
 *  mutable per-frame state, which is why it lives outside React's
 *  memoization (three.js objects are mutated in useFrame by design). */
function buildScene() {
  // Bird materials: still the glass family, but with real value contrast
  // so the FORM reads — pale body, grey-blue wing, near-ink cap, dusk-lit
  // bill. Smooth shading everywhere (the faceted look was the "crude"
  // tell); clearcoat keeps the lacquered twilight response.
  const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0xe9f3f8,
      metalness: 0.02,
      roughness: 0.28,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
      transparent: true,
      opacity: 0.62,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const capMat = new THREE.MeshPhysicalMaterial({
      color: 0x0e1626, // between --ink-900 and --dusk-700
      metalness: 0.05,
      roughness: 0.4,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
      transparent: true,
      opacity: 0.92,
      // The cap is an open dome (partial sphere): when the tern orbits the
      // far side of the globe we see it from behind/underneath, where only
      // interior faces point at the camera — single-sided they get culled
      // and the cap vanishes while the DoubleSide body stays visible.
      side: THREE.DoubleSide,
      depthWrite: false,
      // Defensive contrast: a faint cool emissive so the near-ink cap keeps
      // an edge-lit read against the darkest ink-900 sky rather than
      // threatening to merge into it. Not the core far-side fix (that is
      // DoubleSide, from A3) — hardening confirmed by A/B capture.
      emissive: new THREE.Color(0x16223c),
      emissiveIntensity: 0.55,
    });
    const billMat = new THREE.MeshPhysicalMaterial({
      color: 0xf2934d, // --horizon-500: the deep-red bill, dusk-lit
      metalness: 0.05,
      roughness: 0.3,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    // Wings: grey-blue upper glass with the warm sheen backscatter (the
    // "thin membrane backlit by sunset" read at grazing angles).
    const wingMat = new THREE.MeshPhysicalMaterial({
      color: 0xa9c0d2,
      metalness: 0.02,
      roughness: 0.24,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      sheen: 1.0,
      sheenColor: new THREE.Color(0xf2934d), // --horizon-500
      sheenRoughness: 0.45,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    // Brand glint: contrail edge lines on the silhouette-critical blades
    // only (wings + tail) — the smooth body carries itself with shading.
    const edgeMat = new THREE.LineBasicMaterial({ color: CONTRAIL, transparent: true, opacity: 0.4 });

    const tern = new THREE.Group();
    const bodyGeo = buildTernBodyGeo();
    const capGeo = buildCapGeo();
    const billGeo = buildBillGeo();
    const tailGeo = buildTailGeo();
    tern.add(new THREE.Mesh(bodyGeo, bodyMat));
    // Every bird material is transparent with depthWrite off, so paint
    // order decides what survives. Three sorts transparent meshes
    // back-to-front by object depth: seen from behind (the far-side
    // orbit pose) the cap sorts farther than the body, so the pale
    // DoubleSide body glass painted after it washed the cap out —
    // A3's DoubleSide fixed the culling half; this fixes the ordering
    // half. Explicit renderOrder keeps head details on top of the body
    // at every viewing angle.
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.renderOrder = 2;
    tern.add(capMesh);
    const billMesh = new THREE.Mesh(billGeo, billMat);
    billMesh.renderOrder = 3;
    tern.add(billMesh);
    const tailMesh = new THREE.Mesh(tailGeo, bodyMat);
    tern.add(tailMesh);
    tern.add(new THREE.LineSegments(new THREE.EdgesGeometry(tailGeo, 20), edgeMat));

    const wingGeos: THREE.BufferGeometry[] = [];
    const wingGroups: THREE.Group[] = []; // shoulders (flap root)
    const wristGroups: THREE.Group[] = []; // hands (phase-lagged)
    for (const sign of [1, -1]) {
      const armGeo = buildArmGeo(sign);
      const handGeo = buildHandGeo(sign);
      wingGeos.push(armGeo, handGeo);
      const shoulder = new THREE.Group();
      shoulder.position.set(0.18, 0.07, 0.09 * sign);
      shoulder.add(new THREE.Mesh(armGeo, wingMat));
      shoulder.add(new THREE.LineSegments(new THREE.EdgesGeometry(armGeo, 20), edgeMat));
      const wrist = new THREE.Group();
      wrist.position.set(0, 0.012, 0.46 * sign);
      wrist.add(new THREE.Mesh(handGeo, wingMat));
      wrist.add(new THREE.LineSegments(new THREE.EdgesGeometry(handGeo, 20), edgeMat));
      shoulder.add(wrist);
      wingGroups.push(shoulder);
      wristGroups.push(wrist);
      tern.add(shoulder);
    }
    tern.scale.setScalar(TERN_SCALE);

    // One knob for every phase's bird fade (flight fade, dissolve,
    // ambient dimming) — per-material base opacities live here only.
    const setBirdFade = (f: number) => {
      bodyMat.opacity = 0.62 * f;
      capMat.opacity = 0.92 * f;
      billMat.opacity = 0.95 * f;
      wingMat.opacity = 0.52 * f;
      edgeMat.opacity = 0.4 * f;
    };

    // Wingtrail
    const trailPos = new Float32Array(TRAIL_N * 3);
    const trailCol = new Float32Array(TRAIL_N * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));
    const trailMat = new THREE.PointsMaterial({
      size: 0.095,
      sizeAttenuation: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const trail = new THREE.Points(trailGeo, trailMat);
    trail.frustumCulled = false;
    trail.visible = false;

    // Boarding pass — crystallized light from the tern's path
    const pass = new THREE.Group();
    const slabGeo = new THREE.ExtrudeGeometry(roundedRectShape(PASS_W, PASS_H, PASS_R), {
      depth: 0.045,
      bevelEnabled: false,
    });
    slabGeo.translate(0, 0, -0.0225);
    const slabMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.22,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const passEdgeMat = new THREE.LineBasicMaterial({ color: CONTRAIL, transparent: true, opacity: 0 });
    pass.add(new THREE.Mesh(slabGeo, slabMat));
    pass.add(new THREE.LineSegments(new THREE.EdgesGeometry(slabGeo, 30), passEdgeMat));

    const faceCanvas = document.createElement("canvas");
    drawPassFace(faceCanvas);
    const faceTex = new THREE.CanvasTexture(faceCanvas);
    faceTex.colorSpace = THREE.SRGBColorSpace;
    const faceMat = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, opacity: 0, depthWrite: false });
    const faceGeo = new THREE.PlaneGeometry(PASS_W, PASS_H);
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.z = 0.032;
    pass.add(face);
    pass.visible = false;

  // Corner sparks — four points of light that seat into the pass's
  // rounded corners as it assembles, top-left → bottom-right, each a
  // brief contrail flare. The premium read of "the ticket clicks into
  // place", not a burst: only four marks, staggered, gone in a beat.
  // Seat point = the rounded corner's own 45° vertex, so a glint lands
  // exactly on the frame corner instead of floating inside it. The arc
  // center sits at (±(W/2−R), ±(H/2−R)); its outermost diagonal point is
  // R·(1−1/√2) further in from the raw half-extent. (E1: the old flat 0.14
  // inset — larger than R itself — seated the glints well inside the frame.)
  // Order defines the stagger (TL, TR, BL, BR).
  const CORNER_INSET = PASS_R * (1 - Math.SQRT1_2);
  const cornerOffsets = [
    [-PASS_W / 2 + CORNER_INSET, PASS_H / 2 - CORNER_INSET],
    [PASS_W / 2 - CORNER_INSET, PASS_H / 2 - CORNER_INSET],
    [-PASS_W / 2 + CORNER_INSET, -PASS_H / 2 + CORNER_INSET],
    [PASS_W / 2 - CORNER_INSET, -PASS_H / 2 + CORNER_INSET],
  ];
  const sparkPos = new Float32Array(4 * 3);
  const sparkCol = new Float32Array(4 * 3);
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkCol, 3));
  // Soft radial sprite so the sparks read as glints, not the default
  // square point. White→transparent gradient; additive blending turns
  // the transparent falloff into a smooth glow, vertexColors tints it.
  const sparkSprite = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.35, "rgba(255,255,255,0.6)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const sparkMat = new THREE.PointsMaterial({
    size: 0.34,
    map: sparkSprite,
    sizeAttenuation: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  sparks.visible = false;

  const root = new THREE.Group();
  root.add(tern, trail, pass, sparks);

  return {
    root, tern, wingGroups, wristGroups, wingGeos,
    bodyGeo, capGeo, billGeo, tailGeo,
    trail, trailGeo, trailPos, trailCol, trailMat,
    pass, slabGeo, slabMat, passEdgeMat, faceGeo, faceMat, faceTex, faceCanvas,
    sparks, sparkGeo, sparkMat, sparkSprite, sparkPos, sparkCol, cornerOffsets,
    bodyMat, capMat, billMat, wingMat, edgeMat, setBirdFade,
  };
}

function TernSequence() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  // Lazy ref init: refs are the mutable container React sanctions, and
  // this entire object graph is per-frame-mutable three.js state.
  const builtRef = useRef<ReturnType<typeof buildScene> | null>(null);
  if (builtRef.current === null) builtRef.current = buildScene();
  const built = builtRef.current;

  // Anisotropy needs the live renderer; fonts redraw the face when ready;
  // route edits redraw it live (the pass always shows the actual search).
  useEffect(() => {
    built.faceTex.anisotropy = gl.capabilities.getMaxAnisotropy();
    built.faceTex.needsUpdate = true;
    let disposed = false;
    const redraw = () => {
      if (disposed) return;
      drawPassFace(built.faceCanvas);
      built.faceTex.needsUpdate = true;
    };
    document.fonts?.ready.then(redraw);
    const unsubscribeRoute = heroRoute.subscribe(redraw);
    return () => {
      disposed = true;
      unsubscribeRoute();
      built.bodyGeo.dispose();
      built.capGeo.dispose();
      built.billGeo.dispose();
      built.tailGeo.dispose();
      built.wingGeos.forEach((g) => g.dispose());
      built.trailGeo.dispose();
      built.slabGeo.dispose();
      built.faceGeo.dispose();
      built.sparkGeo.dispose();
      [built.bodyMat, built.capMat, built.billMat, built.wingMat, built.edgeMat, built.trailMat, built.slabMat, built.passEdgeMat, built.faceMat, built.sparkMat].forEach((m) => m.dispose());
      built.faceTex.dispose();
      built.sparkSprite.dispose();
      built.root.traverse((obj) => {
        if (obj instanceof THREE.LineSegments) obj.geometry.dispose();
      });
    };
  }, [built, gl]);

  // Animation state (refs, not React state — mutated per frame)
  const anim = useRef({
    start: -1,
    lastNow: 0,
    flapPhase: 0,
    gaitPhase: 0.9, // start inside a flap burst so the entry beats wings
    trailFilled: 0,
    snapshotTaken: false,
    trailSnapshot: new Float32Array(TRAIL_N * 3),
    heroEl: null as Element | null,
    theta0: NaN, // orbit insertion/breakaway angle, chosen on first frame
    freezeAt: -1, // verification: pin `elapsed` to this ms when >= 0
    // Phase D (ambient shuttle) state
    ambientInit: false,
    ambientLegT: 0, // 0..1 progress along the current leg
    ambientDir: 1, // +1 = from → to, −1 = back
    ambientSpan: 0, // great-circle span (rad) currently flown
  });

  // Replay hook (same precedent as __ternGlobeSunOverride): resets the
  // sequence clock so the flight can be re-watched/verified on demand —
  // `__ternReplay()` from the top, `__ternReplay(2500)` seeks 2.5s in.
  useEffect(() => {
    const w = window as unknown as { __ternReplay?: (offsetMs?: number) => void };
    w.__ternReplay = (offsetMs = 0, freeze = false) => {
      const a = anim.current;
      a.start = performance.now() - offsetMs;
      a.lastNow = performance.now();
      a.freezeAt = freeze ? offsetMs : -1;
      a.trailFilled = 0;
      a.snapshotTaken = false;
      a.theta0 = NaN;
      a.ambientInit = false;
      a.gaitPhase = 0.9;
      built.setBirdFade(1);
      built.tern.visible = true;
      built.tern.scale.setScalar(TERN_SCALE);
      built.wingGroups.forEach((g) => { g.scale.z = 1; });
      built.wristGroups.forEach((g) => { g.rotation.x = 0; });
      built.pass.visible = false;
      built.slabMat.opacity = 0;
      built.passEdgeMat.opacity = 0;
      built.faceMat.opacity = 0;
      built.sparks.visible = false;
      built.sparkMat.opacity = 0;
    };
    // Freeze the clock at its current point (call after letting the
    // sequence run so the trail has real history), or unfreeze with -1.
    (w as unknown as { __ternFreeze?: (at?: number) => number }).__ternFreeze = (at?: number) => {
      const a = anim.current;
      a.freezeAt = at !== undefined ? at : performance.now() - a.start;
      return a.freezeAt;
    };
    (w as unknown as { __ternState?: () => object }).__ternState = () => ({
      pos: built.tern.position.toArray().map((n) => +n.toFixed(3)),
      quat: built.tern.quaternion.toArray().map((n) => +n.toFixed(3)),
      visible: built.tern.visible,
      scale: +built.tern.scale.x.toFixed(3),
      glassOpacity: built.bodyMat.opacity,
      elapsedMs: anim.current.start < 0 ? -1 : Math.round(performance.now() - anim.current.start),
      theta0: anim.current.theta0,
      spinRegistered: !!globeShared.spin,
      // `pos` above is LOCAL, which cannot tell a correct portrait layout from
      // the I7 bug — under a scaled group both are "some vector". The orbit
      // invariant is world-space: while circling, the tern sits ORBIT_ALT
      // (1.16) globe-radii from the globe's centre, at every aspect ratio.
      // `ratio` is that number, so it is the one figure that proves the bird
      // is riding the globe it is drawn against rather than floating free.
      orbit: (() => {
        const spin = globeShared.spin;
        if (!spin) return null;
        const world = built.tern.getWorldPosition(new THREE.Vector3());
        const center = spin.getWorldPosition(new THREE.Vector3());
        const radius = spin.getWorldScale(new THREE.Vector3()).x;
        const dist = world.distanceTo(center);
        return {
          world: world.toArray().map((n) => +n.toFixed(3)),
          center: center.toArray().map((n) => +n.toFixed(3)),
          radius: +radius.toFixed(3),
          dist: +dist.toFixed(3),
          ratio: radius > 0 ? +(dist / radius).toFixed(3) : null,
        };
      })(),
    });
    return () => {
      delete w.__ternReplay;
      delete (w as unknown as { __ternState?: () => object }).__ternState;
    };
  }, [built]);

  // Cursor-reactive settled pass (Phase C only): raw pointer NDC written by
  // the listener, smoothed per-frame so the pass leans toward the cursor
  // like an object on a string, not a 1:1 tracker. Desktop-only by the
  // pointer:fine gate; reduced-motion users never mount this component.
  const pointerRef = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const p = pointerRef.current;
    const onMove = (e: PointerEvent) => {
      p.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  const tmpRef = useRef<{
    posA: THREE.Vector3; posB: THREE.Vector3; settleWorld: THREE.Vector3;
    tailLocal: THREE.Vector3; raycaster: THREE.Raycaster; zPlane: THREE.Plane; ndc: THREE.Vector2;
    tangent: THREE.Vector3; toSettle: THREE.Vector3; radial: THREE.Vector3;
    globeCenter: THREE.Vector3; sideAxis: THREE.Vector3; upAxis: THREE.Vector3;
    entryStart: THREE.Vector3; entryCtrl: THREE.Vector3;
    fe1: THREE.Vector3; fe2: THREE.Vector3;
    ae1: THREE.Vector3; ae2: THREE.Vector3;
    b1: THREE.Vector3; b2: THREE.Vector3; breakP0: THREE.Vector3; breakF0: THREE.Vector3;
    basisM: THREE.Matrix4; qTarget: THREE.Quaternion; qBank: THREE.Quaternion;
    sparkLocal: THREE.Vector3;
  } | null>(null);
  if (tmpRef.current === null) {
    tmpRef.current = {
      posA: new THREE.Vector3(),
      posB: new THREE.Vector3(),
      settleWorld: new THREE.Vector3(),
      tailLocal: new THREE.Vector3(),
      raycaster: new THREE.Raycaster(),
      zPlane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      ndc: new THREE.Vector2(),
      tangent: new THREE.Vector3(),
      toSettle: new THREE.Vector3(),
      radial: new THREE.Vector3(),
      globeCenter: new THREE.Vector3(),
      sideAxis: new THREE.Vector3(),
      upAxis: new THREE.Vector3(),
      entryStart: new THREE.Vector3(),
      entryCtrl: new THREE.Vector3(),
      fe1: new THREE.Vector3(),
      fe2: new THREE.Vector3(),
      ae1: new THREE.Vector3(),
      ae2: new THREE.Vector3(),
      b1: new THREE.Vector3(),
      b2: new THREE.Vector3(),
      breakP0: new THREE.Vector3(),
      breakF0: new THREE.Vector3(),
      basisM: new THREE.Matrix4(),
      qTarget: new THREE.Quaternion(),
      qBank: new THREE.Quaternion(),
      sparkLocal: new THREE.Vector3(),
    };
  }
  const {
    posA, posB, settleWorld, tailLocal, raycaster, zPlane, ndc,
    tangent, toSettle, radial, globeCenter, sideAxis, upAxis,
    entryStart, entryCtrl, fe1, fe2, ae1, ae2, b1, b2, breakP0, breakF0, basisM, qTarget, qBank,
    sparkLocal,
  } = tmpRef.current;

  useFrame((state) => {
    // Refresh the composition transform from THIS frame's aspect before any
    // world→local mapping below (see portraitTransform for why it is not
    // handed down from the parent group).
    const comp = portraitTransform(viewAspect(state));
    heroComp.scale = comp.scale;
    heroComp.offsetY = comp.offsetY;

    const a = anim.current;
    const {
      tern, wingGroups, wristGroups, trail, trailGeo, trailPos, trailCol, trailMat,
      pass, slabMat, passEdgeMat, faceMat, setBirdFade,
      sparks, sparkMat, sparkPos, sparkCol, cornerOffsets,
    } = built;

    const now = performance.now();
    if (a.start < 0) {
      a.start = now;
      a.lastNow = now;
    }
    const elapsed = a.freezeAt >= 0 ? a.freezeAt : now - a.start;
    const dt = Math.min((now - a.lastNow) / 1000, 0.05);
    a.lastNow = now;

    // Fractional hero coords → world point on the z=0 plane (resize-safe).
    const unproject = (p: PathPoint, out: THREE.Vector3) => {
      ndc.set(p.x * 2 - 1, 1 - p.y * 2);
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(zPlane, out);
      // Screen-anchored target, so it must stay put on screen: mapping it
      // into composition-local keeps the pass at the intended screen point
      // while the group's scale shrinks the slab itself.
      return compToLocal(out);
    };

    // Scroll-out, shared with the globe (item 4): 0 = hero fully on
    // screen, 1 = fully scrolled past. Computed once per frame here (the
    // one place that already tracked it) and published on globeShared so
    // every 3D element fades from the same value — no second tracker.
    if (!a.heroEl?.isConnected) {
      a.heroEl = document.querySelector(".hero-twilight");
    }
    let scrollOut = 0;
    if (a.heroEl) {
      const r = a.heroEl.getBoundingClientRect();
      scrollOut = clamp01(-r.top / Math.max(r.height, 1));
    }
    globeShared.scrollOut = scrollOut;
    // Flight-phase fade (same curve as the globe): the bird and its trail
    // dim out instead of getting sliced at the viewport edge mid-flight.
    const flightFade = 1 - smoothstep(scrollOut, 0.05, 0.5);

    // Orbit sampling in the globe's spinning frame: the same circle the
    // route line lives on. fe1/fe2 are frozen at flight start so a live
    // route edit mid-flight retargets the globe's arc without teleporting
    // the bird; the next replay picks the new basis up.
    const spin = globeShared.spin;
    const orbitWorld = (theta: number, out: THREE.Vector3) => {
      out
        .copy(fe1)
        .multiplyScalar(Math.cos(theta))
        .addScaledVector(fe2, Math.sin(theta))
        .multiplyScalar(ORBIT_ALT);
      // spin is inside the composition group, so localToWorld already carries
      // the portrait scale/lift — map back down so the tern rides the orbit
      // the globe is actually drawn on.
      return compToLocal(spin ? spin.localToWorld(out) : out);
    };

    // Forward + up-hint → tern orientation (+x forward, +y up), with an
    // extra roll around forward so it banks into the curve.
    const orientAlong = (F: THREE.Vector3, upHint: THREE.Vector3, bank: number) => {
      sideAxis.crossVectors(F, upHint).normalize();
      upAxis.crossVectors(sideAxis, F).normalize();
      basisM.makeBasis(F, upAxis, sideAxis);
      qTarget.setFromRotationMatrix(basisM);
      if (bank !== 0) {
        qBank.setFromAxisAngle(F, bank);
        qTarget.premultiply(qBank);
      }
      return qTarget;
    };

    unproject(SETTLE, settleWorld);

    if (elapsed < FLIGHT_MS) {
      if (!spin) return; // globe not registered yet (first frame at most)

      // Choose the breakaway angle once: the orbit point whose travel
      // direction best aims at where the pass will settle, so the tern
      // departs the circle tangentially instead of veering off.
      if (Number.isNaN(a.theta0)) {
        fe1.copy(globeShared.e1); // freeze the route basis for this flight
        fe2.copy(globeShared.e2);
        let best = -Infinity;
        let bestTheta = 0;
        for (let i = 0; i < 64; i++) {
          const th = (i / 64) * Math.PI * 2;
          orbitWorld(th, posA);
          orbitWorld(th + 0.02, posB);
          tangent.subVectors(posB, posA).normalize();
          toSettle.subVectors(settleWorld, posA).normalize();
          const s = tangent.dot(toSettle);
          if (s > best) {
            best = s;
            bestTheta = th;
          }
        }
        a.theta0 = bestTheta;
      }

      compToLocal(spin.getWorldPosition(globeCenter));
      // Radius in the same (local) units as globeCenter, so the entry-swoop
      // offsets below stay proportional to the globe as drawn.
      const globeR = spin.getWorldScale(radial).x / heroComp.scale;
      const p = clamp01(elapsed / FLIGHT_MS);

      if (elapsed < ENTRY_MS) {
        // Phase A0 — swoop in from off-screen upper-left, arriving at the
        // orbit insertion point (which is also the future breakaway point,
        // so the orbit is exactly one revolution).
        const t = easeInOutSine(clamp01(elapsed / ENTRY_MS));
        orbitWorld(a.theta0, posB); // insertion
        // Swoop stays below the nav bar: entry apex ≈ 1.15 globe radii
        // above center (the old 1.6–1.75 clipped behind the nav).
        entryStart.set(globeCenter.x - globeR * 2.6, globeCenter.y + globeR * 1.05, 0.5);
        entryCtrl.set(globeCenter.x - globeR * 0.7, globeCenter.y + globeR * 1.18, posB.z * 0.5 + 0.4);
        const u = 1 - t;
        tern.position
          .copy(entryStart)
          .multiplyScalar(u * u)
          .addScaledVector(entryCtrl, 2 * u * t)
          .addScaledVector(posB, t * t);
        // quadratic bezier derivative
        toSettle.subVectors(posB, entryCtrl);
        tangent
          .subVectors(entryCtrl, entryStart)
          .multiplyScalar(2 * u)
          .addScaledVector(toSettle, 2 * t)
          .normalize();
        radial.set(0, 1, 0);
        tern.quaternion.copy(orientAlong(tangent, radial, 0));
      } else {
        // Phase A1 — one full revolution along the drawn route's circle.
        const t = (elapsed - ENTRY_MS) / ORBIT_MS;
        const theta = a.theta0 + t * Math.PI * 2;
        orbitWorld(theta, posA);
        orbitWorld(theta + 0.02, posB);
        tern.position.copy(posA);
        tangent.subVectors(posB, posA).normalize();
        radial.subVectors(posA, globeCenter).normalize();
        tern.quaternion.copy(orientAlong(tangent, radial, -0.24));
      }
      breakF0.copy(tangent); // keep the latest travel direction for Phase B

      // Slight presence boost while it circles the globe (the near side of
      // the orbit is close to the camera and needs none — perspective does
      // the work; this mostly helps the far/edge sections read).
      const scaleBoost = 1.12 - 0.12 * smoothstep(p, 0.82, 1);
      tern.scale.setScalar(TERN_SCALE * scaleBoost);

      // Wingbeat: hard flapping on entry, easing toward the flap-glide
      // rhythm as the orbit settles in.
      applyWingbeat(wingGroups, wristGroups, a, dt, 10.5 - 3.5 * p, elapsed < ENTRY_MS ? 0 : 0.3 * p);

      // emit trail from the tail
      tailLocal.set(-1.0, 0.05, 0).applyQuaternion(tern.quaternion).multiplyScalar(tern.scale.x).add(tern.position);
      trailPos.copyWithin(3, 0, (TRAIL_N - 1) * 3);
      trailPos[0] = tailLocal.x;
      trailPos[1] = tailLocal.y;
      trailPos[2] = tailLocal.z;
      a.trailFilled = Math.min(a.trailFilled + 1, TRAIL_N);
      for (let i = 0; i < TRAIL_N; i++) {
        const fade = i < a.trailFilled ? Math.pow(1 - i / TRAIL_N, 2.2) : 0;
        trailCol[i * 3] = 0.62 * fade;
        trailCol[i * 3 + 1] = 0.92 * fade;
        trailCol[i * 3 + 2] = 0.96 * fade;
      }
      trail.visible = true;
      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.attributes.color.needsUpdate = true;

      // scroll-out fade (item 4): dim, never slice
      setBirdFade(flightFade);
      trailMat.opacity = flightFade;
      tern.visible = flightFade > 0.01;
    } else if (elapsed < FLIGHT_MS + HANDOFF_MS) {
      // Phase B — the breakaway: the tern leaves the orbit tangentially,
      // sweeps toward the settle point, and the trail condenses into the
      // pass. Position runs on a cubic bezier seeded with the orbit-exit
      // velocity so there is no kink at the transition.
      const q = easeOutCubic(clamp01((elapsed - FLIGHT_MS) / HANDOFF_MS));

      if (!a.snapshotTaken) {
        a.trailSnapshot.set(trailPos);
        a.snapshotTaken = true;
        breakP0.copy(tern.position);
        b1.copy(breakP0).addScaledVector(breakF0, 1.5);
        b2.copy(settleWorld).add(posB.set(-1.0, 0.45, 0.4));
      }

      // cubic bezier position + derivative
      const uq = 1 - q;
      tern.position
        .copy(breakP0)
        .multiplyScalar(uq * uq * uq)
        .addScaledVector(b1, 3 * uq * uq * q)
        .addScaledVector(b2, 3 * uq * q * q)
        .addScaledVector(settleWorld, q * q * q);
      tangent
        .subVectors(b1, breakP0)
        .multiplyScalar(3 * uq * uq)
        .addScaledVector(toSettle.subVectors(b2, b1), 6 * uq * q)
        .addScaledVector(posA.subVectors(settleWorld, b2), 3 * q * q);
      if (tangent.lengthSq() > 1e-8) tangent.normalize();
      const heading = Math.atan2(tangent.y, tangent.x);

      // level out: ease from the banked orbit pose toward the travel pose
      radial.set(0, 1, 0);
      tern.quaternion.slerp(orientAlong(tangent, radial, 0), Math.min(1, q * 2));

      // The transformation happens AT the pass, not en route (item 3):
      // the bird arrives mostly intact — wings folding on approach — and
      // only cross-fades out right where the pass cross-fades in, so both
      // read as one object changing form at one screen point.
      const fold = smoothstep(q, 0.45, 0.8);
      wingGroups[0].rotation.x = -0.12 * (1 - fold);
      wingGroups[1].rotation.x = 0.12 * (1 - fold);
      wristGroups[0].rotation.x = 0.05 * (1 - fold);
      wristGroups[1].rotation.x = -0.05 * (1 - fold);
      wingGroups[0].scale.z = 1 - 0.75 * fold;
      wingGroups[1].scale.z = 1 - 0.75 * fold;
      tern.scale.setScalar(TERN_SCALE * (1 - 0.94 * smoothstep(q, 0.6, 0.95)));
      const dissolve = 1 - smoothstep(q, 0.7, 0.94);
      setBirdFade(dissolve * flightFade);
      trailMat.opacity = flightFade;
      tern.visible = dissolve * flightFade > 0.01;

      // trail particles converge onto the pass outline — crystallizing
      for (let i = 0; i < TRAIL_N; i++) {
        const s = smoothstep(q, 0.2 + 0.42 * (i / TRAIL_N), 0.56 + 0.42 * (i / TRAIL_N));
        const o = outlinePoint(i / TRAIL_N * 2.0 + 0.13, PASS_W, PASS_H);
        const tx = settleWorld.x + o.x;
        const ty = settleWorld.y + o.y;
        trailPos[i * 3] = a.trailSnapshot[i * 3] + (tx - a.trailSnapshot[i * 3]) * s;
        trailPos[i * 3 + 1] = a.trailSnapshot[i * 3 + 1] + (ty - a.trailSnapshot[i * 3 + 1]) * s;
        trailPos[i * 3 + 2] = a.trailSnapshot[i * 3 + 2] * (1 - s);
        const base = i < a.trailFilled ? Math.pow(1 - i / TRAIL_N, 2.2) : 0;
        const glow = base * (1 - s) + (i < a.trailFilled ? 0.85 * s * (1 - q) : 0);
        trailCol[i * 3] = 0.62 * glow;
        trailCol[i * 3 + 1] = 0.92 * glow;
        trailCol[i * 3 + 2] = 0.96 * glow;
      }
      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.attributes.color.needsUpdate = true;
      trail.visible = q < 0.995;

      // pass grows from a sliver, timed to meet the arriving bird: it
      // starts materializing just before the cross-fade and lands with it
      const g = clamp01((q - 0.55) / 0.45);
      if (g > 0) {
        pass.visible = true;
        const grow = easeOutBackSoft(g);
        pass.position.copy(settleWorld);
        pass.scale.set(0.08 + 0.92 * grow, 0.05 + 0.95 * easeOutBackSoft(clamp01(g * 1.18)), 1);
        const align = 1 - easeOutCubic(g);
        pass.rotation.set(-0.06 * (1 - align), -0.5 * align - 0.18 * (1 - align), heading * align);
        const passDim = 1 - smoothstep(scrollOut, 0.35, 0.9);
        slabMat.opacity = 0.15 * g * passDim;
        passEdgeMat.opacity = 0.8 * g * passDim;
        faceMat.opacity = Math.pow(g, 1.4) * passDim;

        // Corner sparks — light seating into each corner as the pass
        // lands. Staggered TL→BR; each darts in from just outside its
        // corner along the diagonal and flares once (sin envelope), the
        // outward reach decaying to exactly 0 at seat so the glint lands
        // precisely on the frame corner. Because the pass is still growing
        // and rotating while it assembles, each glint rides the pass's live
        // transform (scale → rotation → position) instead of a detached
        // flat plane, so it tracks the real moving corner every frame. All
        // four seat by q≈0.99 — gone before the settled pass in Phase C.
        // passDim/flightFade fade the whole set out on scroll.
        let anyFlare = false;
        const OVERSHOOT = 0.16; // local-space dart distance, before pass scale
        for (let i = 0; i < 4; i++) {
          const local = (q - (0.70 + i * 0.045)) / 0.15;
          const flare = local > 0 && local < 1 ? Math.sin(local * Math.PI) : 0;
          if (flare > 0.001) anyFlare = true;
          const cx = cornerOffsets[i][0];
          const cy = cornerOffsets[i][1];
          const out = OVERSHOOT * (1 - clamp01(local * 1.6));
          sparkLocal
            .set(cx + Math.sign(cx) * out, cy + Math.sign(cy) * out, 0.05)
            .multiply(pass.scale)
            .applyEuler(pass.rotation)
            .add(pass.position);
          sparkPos[i * 3] = sparkLocal.x;
          sparkPos[i * 3 + 1] = sparkLocal.y;
          sparkPos[i * 3 + 2] = sparkLocal.z;
          const b = flare * 1.2;
          sparkCol[i * 3] = 0.62 * b;
          sparkCol[i * 3 + 1] = 0.92 * b;
          sparkCol[i * 3 + 2] = 0.96 * b;
        }
        built.sparkGeo.attributes.position.needsUpdate = true;
        built.sparkGeo.attributes.color.needsUpdate = true;
        sparks.visible = anyFlare;
        sparkMat.opacity = anyFlare ? passDim * flightFade : 0;
      }
    } else {
      // Phase C — settled: slow float + gentle rotation, faint text pulse,
      // plus a scroll hand-off: as the hero leaves the viewport the pass
      // rises a touch faster than the page and dims, passing motion to the
      // scroll-driven sections below.
      if (trail.visible) trail.visible = false;
      if (sparks.visible) { sparks.visible = false; sparkMat.opacity = 0; }
      pass.visible = true;

      const ti = (elapsed - FLIGHT_MS - HANDOFF_MS) / 1000;
      // Smooth the pointer toward its target — frame-rate-independent lerp.
      const pt = pointerRef.current;
      const k = 1 - Math.exp(-dt * 4);
      pt.sx += (pt.x - pt.sx) * k;
      pt.sy += (pt.y - pt.sy) * k;
      pass.scale.set(1, 1, 1);
      // Gentle rise with scroll (was 1.6x and rocketed off-screen before
      // the dim even began) — the pass now leaves mostly by fading.
      pass.position.set(
        settleWorld.x,
        settleWorld.y + Math.sin(ti * 0.9) * 0.05 + scrollOut * 0.6,
        0
      );
      pass.rotation.set(
        -0.06 + Math.sin(ti * 0.27) * 0.04 - scrollOut * 0.35 + pt.sy * 0.07,
        -0.18 + Math.sin(ti * 0.35) * 0.12 + pt.sx * 0.12,
        0
      );
      const dim = 1 - smoothstep(scrollOut, 0.22, 0.68);
      slabMat.opacity = 0.15 * dim;
      passEdgeMat.opacity = 0.8 * dim;
      faceMat.opacity = (0.9 + 0.1 * Math.sin(ti * 1.3)) * dim;

      // Phase D — ambient shuttle: a quieter tern commuting between the
      // searched airports along the route's great circle, forever. The
      // hero bird became the ticket; this one is a background echo — half
      // scale, low opacity, no trail, never competing with the pass.
      const ambientT = elapsed - FLIGHT_MS - HANDOFF_MS - AMBIENT_DELAY_MS;
      if (ambientT > 0 && spin) {
        if (!a.ambientInit) {
          // Spawn on the current route at the origin airport.
          ae1.copy(globeShared.e1);
          ae2.copy(globeShared.e2);
          a.ambientSpan = globeShared.routeSpanRad;
          a.ambientLegT = 0;
          a.ambientDir = 1;
          a.ambientInit = true;
        } else {
          // Live route edits: converge the flown basis toward the drawn
          // one (frame-rate-independent), re-orthonormalizing — the bird
          // glides onto the new route instead of teleporting. Time
          // constant ~0.7s: brisk enough to feel responsive, slow enough
          // that a hemisphere-scale retarget reads as a banked glide.
          const kb = 1 - Math.exp(-dt * 1.5);
          ae1.lerp(globeShared.e1, kb).normalize();
          ae2.lerp(globeShared.e2, kb);
          ae2.addScaledVector(ae1, -ae1.dot(ae2)).normalize();
          a.ambientSpan += (globeShared.routeSpanRad - a.ambientSpan) * kb;
        }

        // Leg progress: constant angular pace, eased per leg so the bird
        // decelerates into each airport and banks back out.
        const legMs = Math.max(AMBIENT_MIN_LEG_MS, (a.ambientSpan / AMBIENT_RATE) * 1000);
        a.ambientLegT += (dt * 1000) / legMs;
        if (a.ambientLegT >= 1) {
          a.ambientLegT -= 1;
          a.ambientDir *= -1;
        }
        const legEase = easeInOutSine(a.ambientLegT);
        const frac = a.ambientDir > 0 ? legEase : 1 - legEase;
        const theta = frac * a.ambientSpan;

        const ambientPoint = (th: number, out: THREE.Vector3) => {
          out
            .copy(ae1)
            .multiplyScalar(Math.cos(th))
            .addScaledVector(ae2, Math.sin(th))
            .multiplyScalar(AMBIENT_ALT);
          return compToLocal(spin.localToWorld(out));
        };
        ambientPoint(theta, posA);
        ambientPoint(theta + 0.015 * a.ambientDir, posB);
        tern.position.copy(posA);
        tangent.subVectors(posB, posA);
        if (tangent.lengthSq() > 1e-10) tangent.normalize();

        compToLocal(spin.getWorldPosition(globeCenter));
        radial.subVectors(posA, globeCenter).normalize();
        // Rate-limited slerp instead of copy: at the endpoints the tangent
        // reverses, and the lag turns the snap into a banking turnaround.
        const kq = 1 - Math.exp(-dt * 6);
        tern.quaternion.slerp(orientAlong(tangent, radial, -0.18 * a.ambientDir), kq);

        // Distant-seabird gait: mostly gliding, flap bursts near mid-leg.
        wingGroups[0].scale.z = 1;
        wingGroups[1].scale.z = 1;
        applyWingbeat(wingGroups, wristGroups, a, dt, 5.5 + 3 * Math.sin(Math.PI * a.ambientLegT), 0.55);

        const ambientFade = smoothstep(ambientT, 0, AMBIENT_FADE_MS);
        tern.scale.setScalar(TERN_SCALE * AMBIENT_SCALE * (0.7 + 0.3 * ambientFade));
        setBirdFade(0.75 * ambientFade * flightFade);
        // At ~40px the GL edge lines alias into sparkle — the distant
        // bird reads by its plumage values alone.
        built.edgeMat.opacity *= 0.15;
        tern.visible = ambientFade * flightFade > 0.01;
      } else if (tern.visible) {
        tern.visible = false;
      }
    }
  });

  return <primitive object={built.root} />;
}

/**
 * Portrait composition.
 *
 * The scene was laid out for a landscape hero: the globe's radius is a
 * fraction of the view plane's HEIGHT (GLOBE_R_FRAC in HeroGlobe), and the
 * pass is a fixed 1.9 world units wide. On a 390x844 phone that makes the
 * globe's diameter ~1.3x the viewport WIDTH and the pass ~83% of it, both
 * centered — they sat straight on top of the headline and the hero copy
 * became unreadable (docs/screenshots/i6b-after-mobile-hero.png, first cut).
 *
 * Rather than re-authoring the scene per breakpoint, the whole thing is
 * scaled down and lifted as the view gets narrower, so the globe and pass
 * settle into the upper area and the centered copy below them stays clear.
 * Landscape is untouched: t = 0 at aspect >= 0.95, so desktop keeps the
 * exact composition it had.
 *
 * This reads viewport shape for LAYOUT, which is what it is actually good
 * for — it is not the capability gate that I6-b2 removed.
 */
function PortraitComposition({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const { scale, offsetY } = portraitTransform(viewAspect(state));
    g.scale.setScalar(scale);
    g.position.y = offsetY;
  });

  return <group ref={group}>{children}</group>;
}

/* ── Public component: gate + View ── */

export default function HeroTernView() {
  // Was: innerWidth < 768 || hardwareConcurrency <= 4 || reduced-motion.
  // The first two refused the scene to every phone and to any device
  // reporting four cores, on no measured evidence — a high-end iPhone can
  // report 4 while a slow 8-core tablet passes. Capability is now decided
  // by measured frame time (quality.ts); only the stated user preference
  // remains a hard gate. Note this is reactive, not a one-shot useState:
  // the tier can drop mid-session and the hero has to follow it down.
  const quality = useQuality();
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const isStatic = reduced || quality === "static";

  // Static branch marker: lets CSS keep the hero copy centered when the
  // globe/3D scene is not mounted (reduced-motion, or demoted to static).
  useEffect(() => {
    if (!isStatic) return;
    const hero = document.querySelector(".hero-twilight");
    hero?.setAttribute("data-hero-static", "1");
    return () => hero?.removeAttribute("data-hero-static");
  }, [isStatic]);

  // Star-layer cursor parallax: the stars drift a few px opposite the
  // cursor — atmospheric depth behind the 3D scene. quickTo gives the
  // eased follow; the 1.04 scale hides the layer's edges while it moves.
  // Only in this animated branch: static/reduced-motion heroes stay still.
  useEffect(() => {
    if (isStatic || !window.matchMedia("(pointer: fine)").matches) return;
    const stars = document.querySelector<HTMLElement>(".hero-stars");
    if (!stars) return;
    gsap.set(stars, { scale: 1.04 });
    const xTo = gsap.quickTo(stars, "x", { duration: 1.1, ease: "power2.out" });
    const yTo = gsap.quickTo(stars, "y", { duration: 1.1, ease: "power2.out" });
    const onMove = (e: PointerEvent) => {
      xTo(((e.clientX / window.innerWidth) * 2 - 1) * -7);
      yTo(((e.clientY / window.innerHeight) * 2 - 1) * -5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf(stars);
      gsap.set(stars, { clearProps: "transform" });
    };
  }, [isStatic]);

  if (isStatic) return <StaticBoardingPass />;

  return (
    // The <View>'s DOM box IS the 3D stage: drei tracks this rect and drives
    // the view camera's aspect from it, and every composition number in this
    // file (portraitTransform, SETTLE) plus the globe's radius/placement are
    // functions of that aspect.
    //
    // The box itself lives in globals.css (.hero-stage) rather than here,
    // because it needs a `100vh` declaration followed by a `100svh` one — a
    // fallback pair an inline style object cannot express, and without it a
    // browser that does not know `svh` drops the whole height and collapses
    // the stage to zero.
    //
    // I12: it used to be `inset: 0` — the whole hero. On desktop the hero is
    // exactly one viewport (900px), so stage == screen and the composition was
    // authored correctly. On a phone the hero is its CONTENT: headline, copy,
    // ticker, the search bar (which stacks vertically at <768px) and the
    // SmartPicks strip stack up to ~1382px against an 844px screen. The stage
    // was therefore 390x1382 — aspect 0.28 — and the scene composed itself for
    // a frame two thirds of which the user cannot see: globe diameter came out
    // at 106% of the screen width and the boarding pass was pushed off the
    // right edge. Pinning the stage to the visible viewport makes phone and
    // desktop agree that the stage is one screen. `min()` keeps a hero that is
    // SHORTER than a viewport from claiming space it does not have; on desktop
    // both terms are 900px, so landscape is byte-for-byte unchanged.
    <View aria-hidden="true" className="hero-stage">
      <PerspectiveCamera makeDefault fov={45} position={[0, 0, 6]} near={0.1} far={1000} />
      {/* Civil-twilight lighting: warm horizon key from below, cool sky rim. */}
      <ambientLight color={0x2a3a66} intensity={1.4} />
      <directionalLight color={0xf2934d} intensity={1.7} position={[2, -3, 4]} />
      <directionalLight color={0x8fe0e8} intensity={1.3} position={[-3, 4, 2]} />
      <directionalLight color={0xffffff} intensity={0.55} position={[0, 0, 5]} />
      <PortraitComposition>
        <TernSequence />
        {/* Civil-twilight globe: real terminator, behind the flight plane so
            the tern crosses in front of it (see HeroGlobe for the math). */}
        <HeroGlobe />
      </PortraitComposition>
      {/* No EffectComposer here, deliberately: bloom was trialled (Stage 4)
          and rejected on screenshots — inside a scissored drei View it
          bloomed the trail points into blobs, washed out the pass face
          text, and produced compositing artifacts over the transparent
          canvas. The contrail's glow comes from additive blending + the
          face texture's shadowBlur, which already reads as bloom. */}
    </View>
  );
}
