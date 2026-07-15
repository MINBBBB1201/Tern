"use client";
/* eslint-disable react-hooks/immutability, react-hooks/refs --
   Imperative three.js scene graph: objects are constructed once (lazy ref
   init, sanctioned by the React docs) and mutated per-frame inside
   useFrame callbacks, which is how react-three-fiber animation works.
   The React Compiler rules assume render-path data flow that does not
   apply to a WebGL scene graph. */
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { View, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import HeroGlobe, { globeShared } from "./HeroGlobe";

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

/** Where the boarding pass settles (fractional hero coords). */
const SETTLE: PathPoint = { x: 0.72, y: 0.26 };

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

const CONTRAIL = new THREE.Color("#8FE0E8");
const PASS_W = 1.9;
const PASS_H = 0.85;
const TRAIL_N = 120;
const TERN_SCALE = 0.6;

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

/** Faceted low-poly tern body — stylized silhouette with the Arctic
 *  Tern's deeply forked streamer tail; +x is forward.
 *  Silhouette reference: Sterna paradisaea in flight — small head, short
 *  neck, slender body, and the two long thin tail streamers (fork depth
 *  roughly a body-length behind the tail root, swallow-like). */
function buildTernBody(): THREE.BufferGeometry {
  const N = [0.98, 0.0, 0];
  const H = [0.52, 0.16, 0];
  const C = [0.3, -0.14, 0];
  const K = [-0.02, 0.18, 0];
  const B = [-0.1, -0.1, 0];
  const T = [-0.62, 0.08, 0];
  const SL = [0.2, 0.02, 0.17];
  const SR = [0.2, 0.02, -0.17];
  const RL = [-0.3, 0.03, 0.12];
  const RR = [-0.3, 0.03, -0.12];
  // Streamers: long, thin, well separated — each a narrow triangle from
  // the tail root past a mid knuckle so the fork reads at a glance.
  const ML = [-0.98, 0.12, 0.1];
  const MR = [-0.98, 0.12, -0.1];
  const FL = [-1.38, 0.17, 0.24];
  const FR = [-1.38, 0.17, -0.24];
  const tris = [
    [N, H, SL], [N, SR, H],
    [N, SL, C], [N, C, SR],
    [H, SL, K], [H, K, SR],
    [C, SL, B], [C, B, SR],
    [K, SL, RL], [K, RR, SR],
    [SL, B, RL], [B, SR, RR],
    [K, RL, T], [K, T, RR],
    [B, RL, T], [B, T, RR],
    // fork: root → mid knuckle → streamer tip, one thin blade per side
    [T, RL, ML], [T, MR, RR],
    [RL, FL, ML], [RR, MR, FR],
  ];
  const positions = new Float32Array(tris.flat(2));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Long, slender, swept wing (sign = 1 left / -1 right), origin at the
 *  shoulder. Arm → wrist, then three separated primary-feather blades
 *  sweeping back to points: the notched wingtip that reads "tern", not
 *  "paper plane". */
function buildWing(sign: number): THREE.BufferGeometry {
  const s = (v: number[]) => [v[0], v[1], v[2] * sign];
  // arm + mid-wing panels
  const S0 = s([0.05, 0, 0]);
  const S1 = s([-0.3, 0, 0.02]);
  const Ele = s([0.06, 0.02, 0.42]);
  const Ete = s([-0.26, 0.01, 0.38]);
  const Wle = s([-0.02, 0.03, 0.78]);
  const Wte = s([-0.3, 0.02, 0.7]);
  // primary feather bases along the trailing edge of the hand
  const A1 = s([-0.3, 0.04, 1.0]);
  const A2 = s([-0.4, 0.03, 0.86]);
  // primary tips — outermost longest, stepping shorter inward
  const P1 = s([-0.74, 0.06, 1.32]);
  const P2 = s([-0.82, 0.045, 1.1]);
  const P3 = s([-0.85, 0.03, 0.92]);
  const tris = [
    [S0, Ele, S1], [S1, Ele, Ete],
    [Ele, Wle, Ete], [Ete, Wle, Wte],
    // hand: three separated feather blades (gaps = tip notches)
    [Wle, P1, A1],
    [A1, P2, A2],
    [A2, P3, Wte],
  ];
  const positions = new Float32Array(tris.flat(2));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
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
 *  Route matches the search card below it: FROM ICN ●──✈──● TO LHR. */
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

  // IATA codes — glowing faintly, split-flap style
  g.font = `700 92px ${mono}`;
  g.fillStyle = paper + "0.96)";
  g.shadowColor = cyan + "0.85)";
  g.shadowBlur = 20;
  g.textAlign = "left";
  g.fillText("ICN", 60, 252);
  g.textAlign = "right";
  g.fillText("LHR", 700, 252);
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

  // Cities
  g.font = `500 22px ${mono}`;
  g.fillStyle = paper + "0.55)";
  g.textAlign = "left";
  g.fillText("SEOUL INCHEON", 60, 300);
  g.textAlign = "right";
  g.fillText("LONDON HEATHROW", 700, 300);

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
              <div className="data-mono" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>ICN</div>
              <div className="data-mono" style={{ fontSize: 9, color: "rgba(246,248,251,0.55)" }}>SEOUL</div>
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
              <div className="data-mono" style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>LHR</div>
              <div className="data-mono" style={{ fontSize: 9, color: "rgba(246,248,251,0.55)" }}>LONDON</div>
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
  const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfeef5,
      metalness: 0.05,
      roughness: 0.12,
      // Clearcoat picks up the twilight key/rim lights as a lacquered
      // sheen — PBR polish without an HDR environment download.
      clearcoat: 0.6,
      clearcoatRoughness: 0.3,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      flatShading: true,
      depthWrite: false,
    });
    // Wings: thinner glass with a warm sheen term — sheen backscatters at
    // grazing angles, so when the dusk key light is behind the bird the
    // wing membranes catch a horizon-colored edge glow (the "thin feather
    // backlit by sunset" read) instead of going flat.
    const wingMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfeef5,
      metalness: 0.02,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.18,
      sheen: 1.0,
      sheenColor: new THREE.Color(0xf2934d), // --horizon-500
      sheenRoughness: 0.45,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      flatShading: true,
      depthWrite: false,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: CONTRAIL, transparent: true, opacity: 0.85 });

    const tern = new THREE.Group();
    const bodyGeo = buildTernBody();
    tern.add(new THREE.Mesh(bodyGeo, glassMat));
    tern.add(new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo, 12), edgeMat));

    const wingGeos: THREE.BufferGeometry[] = [];
    const wingGroups: THREE.Group[] = [];
    for (const sign of [1, -1]) {
      const geo = buildWing(sign);
      wingGeos.push(geo);
      const wing = new THREE.Group();
      wing.position.set(0.12, 0.1, 0.14 * sign);
      wing.add(new THREE.Mesh(geo, wingMat));
      // 25° threshold: outline the silhouette and feather blades, not
      // every interior facet of the denser wing mesh.
      wing.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), edgeMat));
      wingGroups.push(wing);
      tern.add(wing);
    }
    tern.scale.setScalar(TERN_SCALE);

    // Wingtrail
    const trailPos = new Float32Array(TRAIL_N * 3);
    const trailCol = new Float32Array(TRAIL_N * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));
    const trailMat = new THREE.PointsMaterial({
      size: 0.11,
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
    const slabGeo = new THREE.ExtrudeGeometry(roundedRectShape(PASS_W, PASS_H, 0.09), {
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

  const root = new THREE.Group();
  root.add(tern, trail, pass);

  return {
    root, tern, wingGroups, wingGeos, bodyGeo,
    trail, trailGeo, trailPos, trailCol, trailMat,
    pass, slabGeo, slabMat, passEdgeMat, faceGeo, faceMat, faceTex, faceCanvas,
    glassMat, wingMat, edgeMat,
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

  // Anisotropy needs the live renderer; fonts redraw the face when ready.
  useEffect(() => {
    built.faceTex.anisotropy = gl.capabilities.getMaxAnisotropy();
    built.faceTex.needsUpdate = true;
    let disposed = false;
    document.fonts?.ready.then(() => {
      if (disposed) return;
      drawPassFace(built.faceCanvas);
      built.faceTex.needsUpdate = true;
    });
    return () => {
      disposed = true;
      built.bodyGeo.dispose();
      built.wingGeos.forEach((g) => g.dispose());
      built.trailGeo.dispose();
      built.slabGeo.dispose();
      built.faceGeo.dispose();
      [built.glassMat, built.wingMat, built.edgeMat, built.trailMat, built.slabMat, built.passEdgeMat, built.faceMat].forEach((m) => m.dispose());
      built.faceTex.dispose();
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
    trailFilled: 0,
    snapshotTaken: false,
    trailSnapshot: new Float32Array(TRAIL_N * 3),
    heroEl: null as Element | null,
    theta0: NaN, // orbit insertion/breakaway angle, chosen on first frame
    freezeAt: -1, // verification: pin `elapsed` to this ms when >= 0
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
      built.glassMat.opacity = 0.34;
      built.wingMat.opacity = 0.3;
      built.edgeMat.opacity = 0.85;
      built.tern.visible = true;
      built.tern.scale.setScalar(TERN_SCALE);
      built.wingGroups.forEach((g) => { g.scale.z = 1; });
      built.pass.visible = false;
      built.slabMat.opacity = 0;
      built.passEdgeMat.opacity = 0;
      built.faceMat.opacity = 0;
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
      glassOpacity: built.glassMat.opacity,
      elapsedMs: anim.current.start < 0 ? -1 : Math.round(performance.now() - anim.current.start),
      theta0: anim.current.theta0,
      spinRegistered: !!globeShared.spin,
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
    b1: THREE.Vector3; b2: THREE.Vector3; breakP0: THREE.Vector3; breakF0: THREE.Vector3;
    basisM: THREE.Matrix4; qTarget: THREE.Quaternion; qBank: THREE.Quaternion;
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
      b1: new THREE.Vector3(),
      b2: new THREE.Vector3(),
      breakP0: new THREE.Vector3(),
      breakF0: new THREE.Vector3(),
      basisM: new THREE.Matrix4(),
      qTarget: new THREE.Quaternion(),
      qBank: new THREE.Quaternion(),
    };
  }
  const {
    posA, posB, settleWorld, tailLocal, raycaster, zPlane, ndc,
    tangent, toSettle, radial, globeCenter, sideAxis, upAxis,
    entryStart, entryCtrl, b1, b2, breakP0, breakF0, basisM, qTarget, qBank,
  } = tmpRef.current;

  useFrame(() => {
    const a = anim.current;
    const {
      tern, wingGroups, trail, trailGeo, trailPos, trailCol,
      pass, slabMat, passEdgeMat, faceMat, glassMat, wingMat, edgeMat,
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
      return out;
    };

    // Orbit sampling in the globe's spinning frame: the same circle the
    // route line lives on (globeShared.e1/e2), lifted to ORBIT_ALT.
    const spin = globeShared.spin;
    const orbitWorld = (theta: number, out: THREE.Vector3) => {
      out
        .copy(globeShared.e1)
        .multiplyScalar(Math.cos(theta))
        .addScaledVector(globeShared.e2, Math.sin(theta))
        .multiplyScalar(ORBIT_ALT);
      return spin ? spin.localToWorld(out) : out;
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

      spin.getWorldPosition(globeCenter);
      const globeR = spin.getWorldScale(radial).x; // uniform scale
      const p = clamp01(elapsed / FLIGHT_MS);

      if (elapsed < ENTRY_MS) {
        // Phase A0 — swoop in from off-screen upper-left, arriving at the
        // orbit insertion point (which is also the future breakaway point,
        // so the orbit is exactly one revolution).
        const t = easeInOutSine(clamp01(elapsed / ENTRY_MS));
        orbitWorld(a.theta0, posB); // insertion
        entryStart.set(globeCenter.x - globeR * 2.6, globeCenter.y + globeR * 1.6, 0.5);
        entryCtrl.set(globeCenter.x - globeR * 0.7, globeCenter.y + globeR * 1.75, posB.z * 0.5 + 0.4);
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

      a.flapPhase += dt * (11 - 5 * p);
      const amp = 0.62 - 0.25 * p;
      wingGroups[0].rotation.x = Math.sin(a.flapPhase) * amp - 0.12;
      wingGroups[1].rotation.x = -(Math.sin(a.flapPhase) * amp - 0.12);

      // emit trail from the tail
      tailLocal.set(-0.9, 0.1, 0).applyQuaternion(tern.quaternion).multiplyScalar(tern.scale.x).add(tern.position);
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

      // fold wings, shrink and dissolve as the pass takes over
      const fold = smoothstep(q, 0.05, 0.6);
      wingGroups[0].rotation.x = -0.12 * (1 - fold);
      wingGroups[1].rotation.x = 0.12 * (1 - fold);
      wingGroups[0].scale.z = 1 - 0.75 * fold;
      wingGroups[1].scale.z = 1 - 0.75 * fold;
      tern.scale.setScalar(TERN_SCALE * (1 - 0.94 * smoothstep(q, 0.25, 0.95)));
      const dissolve = 1 - smoothstep(q, 0.4, 0.92);
      glassMat.opacity = 0.34 * dissolve;
      wingMat.opacity = 0.3 * dissolve;
      edgeMat.opacity = 0.85 * dissolve;
      tern.visible = dissolve > 0.01;
      // trail particles converge onto the pass outline — crystallizing
      for (let i = 0; i < TRAIL_N; i++) {
        const s = smoothstep(q, 0.04 + 0.5 * (i / TRAIL_N), 0.44 + 0.5 * (i / TRAIL_N));
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

      // pass grows from a sliver aligned with the flight direction
      const g = clamp01((q - 0.1) / 0.9);
      if (g > 0) {
        pass.visible = true;
        const grow = easeOutBackSoft(g);
        pass.position.copy(settleWorld);
        pass.scale.set(0.08 + 0.92 * grow, 0.05 + 0.95 * easeOutBackSoft(clamp01(g * 1.18)), 1);
        const align = 1 - easeOutCubic(g);
        pass.rotation.set(-0.06 * (1 - align), -0.5 * align - 0.18 * (1 - align), heading * align);
        slabMat.opacity = 0.15 * g;
        passEdgeMat.opacity = 0.8 * g;
        faceMat.opacity = Math.pow(g, 1.6);
      }
    } else {
      // Phase C — settled: slow float + gentle rotation, faint text pulse,
      // plus a scroll hand-off: as the hero leaves the viewport the pass
      // rises a touch faster than the page and dims, passing motion to the
      // scroll-driven sections below.
      if (tern.visible) tern.visible = false;
      if (trail.visible) trail.visible = false;
      pass.visible = true;

      if (!a.heroEl?.isConnected) {
        a.heroEl = document.querySelector(".hero-twilight");
      }
      let scrollOut = 0; // 0 = hero fully on screen, 1 = fully scrolled past
      if (a.heroEl) {
        const r = a.heroEl.getBoundingClientRect();
        scrollOut = clamp01(-r.top / Math.max(r.height, 1));
      }

      const ti = (elapsed - FLIGHT_MS - HANDOFF_MS) / 1000;
      // Smooth the pointer toward its target — frame-rate-independent lerp.
      const pt = pointerRef.current;
      const k = 1 - Math.exp(-dt * 4);
      pt.sx += (pt.x - pt.sx) * k;
      pt.sy += (pt.y - pt.sy) * k;
      pass.scale.set(1, 1, 1);
      pass.position.set(
        settleWorld.x,
        settleWorld.y + Math.sin(ti * 0.9) * 0.05 + scrollOut * 1.6,
        0
      );
      pass.rotation.set(
        -0.06 + Math.sin(ti * 0.27) * 0.04 - scrollOut * 0.35 + pt.sy * 0.07,
        -0.18 + Math.sin(ti * 0.35) * 0.12 + pt.sx * 0.12,
        0
      );
      const dim = 1 - smoothstep(scrollOut, 0.35, 0.9);
      slabMat.opacity = 0.15 * dim;
      passEdgeMat.opacity = 0.8 * dim;
      faceMat.opacity = (0.9 + 0.1 * Math.sin(ti * 1.3)) * dim;
    }
  });

  return <primitive object={built.root} />;
}

/* ── Public component: gate + View ── */

export default function HeroTernView() {
  const [isStatic] = useState(
    () =>
      window.innerWidth < 768 ||
      (navigator.hardwareConcurrency ?? 8) <= 4 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Static branch marker: lets CSS keep the hero copy centered when the
  // globe/3D scene never mounts (mobile, reduced-motion, low-core).
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
    <View
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <PerspectiveCamera makeDefault fov={45} position={[0, 0, 6]} near={0.1} far={1000} />
      {/* Civil-twilight lighting: warm horizon key from below, cool sky rim. */}
      <ambientLight color={0x2a3a66} intensity={1.4} />
      <directionalLight color={0xf2934d} intensity={1.7} position={[2, -3, 4]} />
      <directionalLight color={0x8fe0e8} intensity={1.3} position={[-3, 4, 2]} />
      <directionalLight color={0xffffff} intensity={0.55} position={[0, 0, 5]} />
      <TernSequence />
      {/* Civil-twilight globe: real terminator, behind the flight plane so
          the tern crosses in front of it (see HeroGlobe for the math). */}
      <HeroGlobe />
      {/* No EffectComposer here, deliberately: bloom was trialled (Stage 4)
          and rejected on screenshots — inside a scissored drei View it
          bloomed the trail points into blobs, washed out the pass face
          text, and produced compositing artifacts over the transparent
          canvas. The contrail's glow comes from additive blending + the
          face texture's shadowBlur, which already reads as bloom. */}
    </View>
  );
}
