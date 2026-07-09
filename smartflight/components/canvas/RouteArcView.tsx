"use client";
/* eslint-disable react-hooks/immutability, react-hooks/refs --
   Imperative three.js objects mutated per-frame in useFrame (see
   HeroTernView.tsx for the rationale). */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { View, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * "Explore Top Destinations" connected 3D element: a great-circle route
 * arc drawn in ink (--dusk-700) over the daylight paper, traced on by
 * scroll; a small glass tern glyph flies the arc as the section scrolls
 * through the viewport (ScrollTrigger scrub → progress ref → useFrame).
 *
 * Ink on paper, not additive glow: additive materials disappear over
 * white and speckle over cards (verified in Stage 2) — this section sits
 * on daylight, so it uses the same ink language as the WHY TERN glyph.
 */

const INK = new THREE.Color("#1B2A52");
const SIGNAL = new THREE.Color("#2F6FED");
const ARC_SEGMENTS = 128;

function buildArc() {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-4.4, -0.9, -0.6),
    new THREE.Vector3(0, 1.6, 0.7),
    new THREE.Vector3(4.4, -0.7, -0.6)
  );
  const points = curve.getPoints(ARC_SEGMENTS);
  const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
  const arcMat = new THREE.LineDashedMaterial({
    color: INK,
    transparent: true,
    opacity: 0.45,
    dashSize: 0.16,
    gapSize: 0.1,
  });
  const arc = new THREE.Line(arcGeo, arcMat);
  arc.computeLineDistances();
  arc.geometry.setDrawRange(0, 0);

  // Endpoint dots: origin (ink) and destination (signal blue)
  const dotGeo = new THREE.CircleGeometry(0.07, 24);
  const originMat = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.55 });
  const destMat = new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0 });
  const origin = new THREE.Mesh(dotGeo, originMat);
  origin.position.copy(points[0]);
  const dest = new THREE.Mesh(dotGeo, destMat);
  dest.position.copy(points[points.length - 1]);
  origin.scale.setScalar(1);
  dest.scale.setScalar(1);

  // Tern glyph — same silhouette family as the WHY TERN svg, kept tiny
  const glyphShape = new THREE.Shape();
  glyphShape.moveTo(-0.16, -0.05);
  glyphShape.lineTo(0.2, 0.02);
  glyphShape.lineTo(-0.04, 0.0);
  glyphShape.lineTo(-0.08, 0.09);
  glyphShape.closePath();
  const glyphGeo = new THREE.ShapeGeometry(glyphShape);
  const glyphMat = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const glyph = new THREE.Mesh(glyphGeo, glyphMat);
  glyph.scale.setScalar(2.2);

  const root = new THREE.Group();
  root.add(arc, origin, dest, glyph);

  return { root, curve, arc, arcGeo, arcMat, dotGeo, origin, dest, originMat, destMat, glyph, glyphGeo, glyphMat };
}

/** Re-span the curve to the live View viewport (the strip is very wide
 *  relative to its height, so world width ≈ 10× world height — fixed
 *  coordinates would occupy a fraction of the strip). */
function layoutArc(built: ReturnType<typeof buildArc>, viewportWidth: number) {
  const half = viewportWidth * 0.42;
  built.curve.v0.set(-half, -1.1, -0.6);
  built.curve.v1.set(0, 1.7, 0.7);
  built.curve.v2.set(half, -0.9, -0.6);
  const pts = built.curve.getPoints(ARC_SEGMENTS);
  built.arcGeo.setFromPoints(pts);
  built.arc.computeLineDistances();
  built.origin.position.copy(pts[0]);
  built.dest.position.copy(pts[pts.length - 1]);
}

function ArcScene({ progress }: { progress: { p: number } }) {
  const builtRef = useRef<ReturnType<typeof buildArc> | null>(null);
  if (builtRef.current === null) builtRef.current = buildArc();
  const built = builtRef.current;

  const tmpRef = useRef({ pos: new THREE.Vector3(), tan: new THREE.Vector3(), smoothed: 0, lastW: 0 });

  useFrame((state, delta) => {
    const { curve, arc, destMat, glyph } = built;
    const t = tmpRef.current;

    // World width at z=0 from the view rect + camera geometry — drei's
    // portal injects the tracked rect as `size`, but `viewport` is not
    // view-scoped (verified empirically), so derive the width ourselves:
    // worldH = 2·camZ·tan(fov/2); worldW = worldH · rectAspect.
    const worldH = 2 * 6 * Math.tan(THREE.MathUtils.degToRad(45 / 2));
    const vpw = worldH * (state.size.width / Math.max(state.size.height, 1));
    if (Math.abs(vpw - t.lastW) > 0.5) {
      layoutArc(built, vpw);
      t.lastW = vpw;
    }

    t.smoothed = THREE.MathUtils.damp(t.smoothed, progress.p, 6, Math.min(delta, 0.05));
    const p = THREE.MathUtils.clamp(t.smoothed, 0, 1);

    arc.geometry.setDrawRange(0, Math.max(2, Math.floor(p * (ARC_SEGMENTS + 1))));

    const tp = THREE.MathUtils.clamp(p, 0.001, 0.999);
    curve.getPointAt(tp, t.pos);
    curve.getTangentAt(tp, t.tan);
    glyph.position.copy(t.pos);
    glyph.position.y += 0.06;
    glyph.rotation.z = Math.atan2(t.tan.y, t.tan.x) * 0.7;
    glyph.visible = p > 0.01;

    destMat.opacity = 0.9 * THREE.MathUtils.clamp((p - 0.92) / 0.08, 0, 1);
  });

  return <primitive object={built.root} />;
}

export default function RouteArcView() {
  const holderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef({ p: 0 });

  useGSAP(
    () => {
      const section = holderRef.current?.closest("section");
      if (!section) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 78%",
          end: "center 42%",
          scrub: 0.6,
          onUpdate: (self) => {
            progressRef.current.p = self.progress;
          },
        });
      });
    },
    { scope: holderRef }
  );

  return (
    <div
      ref={holderRef}
      aria-hidden="true"
      style={{ position: "relative", height: 110, marginTop: -16, marginBottom: 8, pointerEvents: "none" }}
    >
      <View style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <PerspectiveCamera makeDefault fov={45} position={[0, 0, 6]} near={0.1} far={100} />
        <ArcScene progress={progressRef.current} />
      </View>
    </div>
  );
}
