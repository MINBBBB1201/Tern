"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Civil Twilight signature sequence.
 *
 * A low-poly translucent glass Arctic Tern crosses the hero along a
 * great-circle arc; its wingtrail condenses into the floating glass
 * boarding pass — one continuous object changing form, not two cuts.
 *
 * Raw Three.js, following the renderer/lighting/resize/cleanup
 * conventions established in components/AirplaneCursor.tsx (no R3F).
 * Mounted client-only via dynamic(..., { ssr: false }) in app/page.tsx,
 * so browser APIs are safe in lazy useState initializers.
 */

type PathPoint = { x: number; y: number };

// Great-circle-style arc in fractional hero coordinates (0..1, y-down):
// enters high over the "night" band, crests, and descends to the point
// where the boarding pass crystallizes.
const KEYPOINTS: PathPoint[] = [
  { x: -0.06, y: 0.36 },
  { x: 0.22, y: 0.16 },
  { x: 0.5, y: 0.13 },
  { x: 0.72, y: 0.26 },
];
const SETTLE = KEYPOINTS[KEYPOINTS.length - 1];

const FLIGHT_MS = 2600;
const HANDOFF_MS = 1400;
const HANDOFF_T = 0.84; // path fraction where the hand-off begins

const CONTRAIL = new THREE.Color("#8FE0E8");
const PASS_W = 1.9;
const PASS_H = 0.85;
const TRAIL_N = 120;

/** Catmull-Rom sample through the flight-path keypoints. */
function samplePath(points: PathPoint[], t: number): PathPoint {
  const n = points.length - 1;
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * n;
  const i = Math.min(Math.floor(scaled), n - 1);
  const localT = scaled - i;
  const p0 = points[Math.max(0, i - 1)];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[Math.min(n, i + 2)];
  const t2 = localT * localT;
  const t3 = t2 * localT;
  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * localT + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * localT + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

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
 *  Tern's deeply forked tail; +x is forward. */
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
  const FL = [-1.04, 0.18, 0.15];
  const FR = [-1.04, 0.18, -0.15];
  const tris = [
    [N, H, SL], [N, SR, H],
    [N, SL, C], [N, C, SR],
    [H, SL, K], [H, K, SR],
    [C, SL, B], [C, B, SR],
    [K, SL, RL], [K, RR, SR],
    [SL, B, RL], [B, SR, RR],
    [K, RL, T], [K, T, RR],
    [B, RL, T], [B, T, RR],
    [T, RL, FL], [T, FR, RR],
  ];
  const positions = new Float32Array(tris.flat(2));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Long, slender, swept wing (sign = 1 left / -1 right), origin at shoulder. */
function buildWing(sign: number): THREE.BufferGeometry {
  const S0 = [0.05, 0, 0];
  const S1 = [-0.3, 0, 0.02 * sign];
  const E = [0.02, 0.02, 0.58 * sign];
  const W = [-0.28, 0.01, 0.52 * sign];
  const TIP = [-0.55, 0.03, 1.18 * sign];
  const tris = [[S0, E, S1], [S1, E, W], [E, TIP, W]];
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
      <div style={{ position: "absolute", left: "50%", top: "9%", transform: "translateX(-50%)" }}>
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

/* ── WebGL scene ── */

export default function HeroSceneTern() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isStatic] = useState(
    () =>
      window.innerWidth < 768 ||
      (navigator.hardwareConcurrency ?? 8) <= 4 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (isStatic || !mountRef.current) return;
    const mountEl = mountRef.current;
    let disposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, Math.max(mountEl.clientWidth / Math.max(mountEl.clientHeight, 1), 0.5), 0.1, 1000);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountEl.appendChild(renderer.domElement);

    // Civil-twilight lighting: warm horizon key from below, cool sky rim.
    scene.add(new THREE.AmbientLight(0x2a3a66, 1.4));
    const warm = new THREE.DirectionalLight(0xf2934d, 1.7);
    warm.position.set(2, -3, 4);
    scene.add(warm);
    const cool = new THREE.DirectionalLight(0x8fe0e8, 1.3);
    cool.position.set(-3, 4, 2);
    scene.add(cool);
    const front = new THREE.DirectionalLight(0xffffff, 0.55);
    front.position.set(0, 0, 5);
    scene.add(front);

    // Fractional hero coords → world point on the z=0 plane (resize-safe).
    const raycaster = new THREE.Raycaster();
    const zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const unproject = (p: PathPoint, out: THREE.Vector3) => {
      ndc.set(p.x * 2 - 1, 1 - p.y * 2);
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(zPlane, out);
      return out;
    };

    // ── One glass material language for tern AND pass ──
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfeef5,
      metalness: 0.05,
      roughness: 0.12,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      flatShading: true,
      depthWrite: false,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: CONTRAIL, transparent: true, opacity: 0.85 });

    // ── Tern ──
    const tern = new THREE.Group();
    const bodyGeo = buildTernBody();
    const bodyMesh = new THREE.Mesh(bodyGeo, glassMat);
    const bodyEdges = new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo, 12), edgeMat);
    tern.add(bodyMesh, bodyEdges);

    const wingGeos: THREE.BufferGeometry[] = [];
    const wingGroups: THREE.Group[] = [];
    for (const sign of [1, -1]) {
      const geo = buildWing(sign);
      wingGeos.push(geo);
      const wing = new THREE.Group();
      wing.position.set(0.12, 0.1, 0.14 * sign);
      wing.add(new THREE.Mesh(geo, glassMat));
      wing.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 12), edgeMat));
      wingGroups.push(wing);
      tern.add(wing);
    }
    const TERN_SCALE = 0.6;
    tern.scale.setScalar(TERN_SCALE);
    scene.add(tern);

    // ── Wingtrail ──
    const trailPos = new Float32Array(TRAIL_N * 3);
    const trailCol = new Float32Array(TRAIL_N * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));
    const trailMat = new THREE.PointsMaterial({
      size: 0.075,
      sizeAttenuation: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const trail = new THREE.Points(trailGeo, trailMat);
    trail.frustumCulled = false;
    trail.visible = false;
    scene.add(trail);
    let trailFilled = 0;
    const trailSnapshot = new Float32Array(TRAIL_N * 3);

    // ── Boarding pass — crystallized light from the tern's path ──
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
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    const passEdgeMat = new THREE.LineBasicMaterial({ color: CONTRAIL, transparent: true, opacity: 0 });
    const slabEdges = new THREE.LineSegments(new THREE.EdgesGeometry(slabGeo, 30), passEdgeMat);
    pass.add(slab, slabEdges);

    const faceCanvas = document.createElement("canvas");
    drawPassFace(faceCanvas);
    const faceTex = new THREE.CanvasTexture(faceCanvas);
    faceTex.colorSpace = THREE.SRGBColorSpace;
    faceTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // Redraw once the real display/mono webfonts are ready.
    document.fonts?.ready.then(() => {
      if (disposed) return;
      drawPassFace(faceCanvas);
      faceTex.needsUpdate = true;
    });
    const faceMat = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, opacity: 0, depthWrite: false });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(PASS_W, PASS_H), faceMat);
    face.position.z = 0.032;
    pass.add(face);
    pass.visible = false;
    scene.add(pass);

    // ── Animation ──
    let animId = 0;
    const start = performance.now();
    const posA = new THREE.Vector3();
    const posB = new THREE.Vector3();
    const settleWorld = new THREE.Vector3();
    const tailLocal = new THREE.Vector3();
    let flapPhase = 0;
    let lastNow = start;
    let snapshotTaken = false;

    const orientTern = (t: number) => {
      unproject(samplePath(KEYPOINTS, t), posA);
      unproject(samplePath(KEYPOINTS, Math.min(1, t + 0.015)), posB);
      const heading = Math.atan2(posB.y - posA.y, posB.x - posA.x);
      tern.position.copy(posA);
      tern.rotation.set(
        Math.max(-0.5, Math.min(0.5, -(posB.y - posA.y) * 2.4)), // bank into the curve
        -0.38, // 3/4 view so the facets catch light
        heading,
        "ZYX"
      );
      return heading;
    };

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const elapsed = now - start;
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;
      unproject(SETTLE, settleWorld);

      if (elapsed < FLIGHT_MS) {
        // Phase A — flight along the great-circle arc
        const p = easeInOutSine(clamp01(elapsed / FLIGHT_MS));
        orientTern(p * HANDOFF_T);
        flapPhase += dt * (11 - 5 * p);
        const amp = 0.62 - 0.25 * p;
        wingGroups[0].rotation.x = Math.sin(flapPhase) * amp - 0.12;
        wingGroups[1].rotation.x = -(Math.sin(flapPhase) * amp - 0.12);

        // emit trail from the tail
        tailLocal.set(-0.9, 0.1, 0).applyEuler(tern.rotation).multiplyScalar(TERN_SCALE).add(tern.position);
        trailPos.copyWithin(3, 0, (TRAIL_N - 1) * 3);
        trailPos[0] = tailLocal.x;
        trailPos[1] = tailLocal.y;
        trailPos[2] = tailLocal.z;
        trailFilled = Math.min(trailFilled + 1, TRAIL_N);
        for (let i = 0; i < TRAIL_N; i++) {
          const fade = i < trailFilled ? Math.pow(1 - i / TRAIL_N, 2.2) : 0;
          trailCol[i * 3] = 0.62 * fade;
          trailCol[i * 3 + 1] = 0.92 * fade;
          trailCol[i * 3 + 2] = 0.96 * fade;
        }
        trail.visible = true;
        trailGeo.attributes.position.needsUpdate = true;
        trailGeo.attributes.color.needsUpdate = true;
      } else if (elapsed < FLIGHT_MS + HANDOFF_MS) {
        // Phase B — the hand-off: trail condenses, tern folds into the pass
        const q = easeOutCubic(clamp01((elapsed - FLIGHT_MS) / HANDOFF_MS));

        const heading = orientTern(HANDOFF_T + q * (1 - HANDOFF_T));
        // fold wings, shrink and dissolve as the pass takes over
        const fold = smoothstep(q, 0.05, 0.6);
        wingGroups[0].rotation.x = -0.12 * (1 - fold);
        wingGroups[1].rotation.x = 0.12 * (1 - fold);
        wingGroups[0].scale.z = 1 - 0.75 * fold;
        wingGroups[1].scale.z = 1 - 0.75 * fold;
        tern.scale.setScalar(TERN_SCALE * (1 - 0.94 * smoothstep(q, 0.25, 0.95)));
        const dissolve = 1 - smoothstep(q, 0.4, 0.92);
        glassMat.opacity = 0.34 * dissolve;
        edgeMat.opacity = 0.85 * dissolve;
        tern.visible = dissolve > 0.01;

        if (!snapshotTaken) {
          trailSnapshot.set(trailPos);
          snapshotTaken = true;
        }
        // trail particles converge onto the pass outline — crystallizing
        for (let i = 0; i < TRAIL_N; i++) {
          const s = smoothstep(q, 0.04 + 0.5 * (i / TRAIL_N), 0.44 + 0.5 * (i / TRAIL_N));
          const o = outlinePoint(i / TRAIL_N * 2.0 + 0.13, PASS_W, PASS_H);
          const tx = settleWorld.x + o.x;
          const ty = settleWorld.y + o.y;
          trailPos[i * 3] = trailSnapshot[i * 3] + (tx - trailSnapshot[i * 3]) * s;
          trailPos[i * 3 + 1] = trailSnapshot[i * 3 + 1] + (ty - trailSnapshot[i * 3 + 1]) * s;
          trailPos[i * 3 + 2] = trailSnapshot[i * 3 + 2] * (1 - s);
          const base = i < trailFilled ? Math.pow(1 - i / TRAIL_N, 2.2) : 0;
          const glow = base * (1 - s) + (i < trailFilled ? 0.85 * s * (1 - q) : 0);
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
        // Phase C — settled: slow float + gentle rotation, faint text pulse
        if (tern.visible) tern.visible = false;
        if (trail.visible) trail.visible = false;
        pass.visible = true;
        const ti = (elapsed - FLIGHT_MS - HANDOFF_MS) / 1000;
        pass.scale.set(1, 1, 1);
        pass.position.set(settleWorld.x, settleWorld.y + Math.sin(ti * 0.9) * 0.05, 0);
        pass.rotation.set(-0.06 + Math.sin(ti * 0.27) * 0.04, -0.18 + Math.sin(ti * 0.35) * 0.12, 0);
        slabMat.opacity = 0.15;
        passEdgeMat.opacity = 0.8;
        faceMat.opacity = 0.9 + 0.1 * Math.sin(ti * 1.3);
      }

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      camera.aspect = mountEl.clientWidth / Math.max(mountEl.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
      bodyGeo.dispose();
      wingGeos.forEach((g) => g.dispose());
      trailGeo.dispose();
      slabGeo.dispose();
      face.geometry.dispose();
      [glassMat, edgeMat, trailMat, slabMat, passEdgeMat, faceMat].forEach((m) => m.dispose());
      faceTex.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.LineSegments) obj.geometry.dispose();
      });
      renderer.dispose();
    };
  }, [isStatic]);

  if (isStatic) return <StaticBoardingPass />;

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2, pointerEvents: "none" }}
    />
  );
}
