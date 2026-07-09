"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

/**
 * Ambient backdrop for the global canvas: the civil-twilight lighting rig
 * (same key/rim colors as the hero scene, so every future 3D object on the
 * site sits in one consistent light) plus a sparse field of drifting
 * contrail motes. Additive blending makes the motes read over the dark
 * twilight hero and fade to almost nothing over daylight paper sections —
 * no per-section gating needed.
 *
 * Camera parallax is a gentle lerp toward the pointer, never user-steerable
 * rotation. Reduced-motion users never mount this scene at all (gated in
 * GlobalCanvasInner), so animation here can assume motion is allowed.
 */

const CONTRAIL = new THREE.Color("#8FE0E8");

/** Deterministic LCG so the mote field is stable across mounts. */
function makeRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const FIELD = { x: 5.5, y: 3.2, zNear: 1, zFar: -2.5 };

function ContrailMotes({ count }: { count: number }) {
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  // The motes belong to the twilight: they track how much of the
  // .hero-twilight section is on screen and vanish over daylight paper
  // (verified: additive points stay visibly speckled over white cards,
  // which would cost booking-results scan speed).
  const heroRef = useRef<Element | null>(null);

  const { positions, colors, velocities } = useMemo(() => {
    const rand = makeRand(1201);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() * 2 - 1) * FIELD.x;
      positions[i * 3 + 1] = (rand() * 2 - 1) * FIELD.y;
      positions[i * 3 + 2] = FIELD.zFar + rand() * (FIELD.zNear - FIELD.zFar);
      // Slow, loosely shared drift up-and-right — reads as high-altitude wind.
      velocities[i * 2] = 0.02 + rand() * 0.05;
      velocities[i * 2 + 1] = 0.008 + rand() * 0.03;
      const glow = 0.25 + rand() * 0.75;
      colors[i * 3] = CONTRAIL.r * glow;
      colors[i * 3 + 1] = CONTRAIL.g * glow;
      colors[i * 3 + 2] = CONTRAIL.b * glow;
    }
    return { positions, colors, velocities };
  }, [count]);

  useFrame((_, delta) => {
    const geo = geoRef.current;
    const mat = matRef.current;
    if (!geo || !mat) return;
    const dt = Math.min(delta, 0.05);

    if (!heroRef.current?.isConnected) {
      heroRef.current = document.querySelector(".hero-twilight");
    }
    let heroVisible = 0;
    if (heroRef.current) {
      const r = heroRef.current.getBoundingClientRect();
      const overlap = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      heroVisible = Math.max(0, Math.min(1, overlap / window.innerHeight));
    }
    mat.opacity = THREE.MathUtils.damp(mat.opacity, 0.55 * heroVisible, 4, dt);
    mat.visible = mat.opacity > 0.01;
    if (!mat.visible) return;

    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 2] * dt;
      pos[i * 3 + 1] += velocities[i * 2 + 1] * dt;
      if (pos[i * 3] > FIELD.x) pos[i * 3] = -FIELD.x;
      if (pos[i * 3 + 1] > FIELD.y) pos[i * 3 + 1] = -FIELD.y;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.055}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Lerp-based pointer parallax on the camera — subtle, non-steerable. */
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    g.position.x = THREE.MathUtils.damp(g.position.x, target.current.x * 0.3, 2.5, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, -target.current.y * 0.18, 2.5, delta);
  });

  return <group ref={group}>{children}</group>;
}

export default function AmbientScene({ lite }: { lite: boolean }) {
  return (
    <>
      <ParallaxRig>
        <PerspectiveCamera makeDefault fov={45} position={[0, 0, 6]} near={0.1} far={100} />
      </ParallaxRig>

      {/* Civil-twilight rig — matches HeroSceneTern's key/rim colors */}
      <ambientLight color={0x2a3a66} intensity={1.4} />
      <directionalLight color={0xf2934d} intensity={1.7} position={[2, -3, 4]} />
      <directionalLight color={0x8fe0e8} intensity={1.3} position={[-3, 4, 2]} />

      <ContrailMotes count={lite ? 60 : 140} />
    </>
  );
}
