"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { subsolarPoint } from "../../lib/solar";

/**
 * Civil-twilight globe — the brand name as a literal, functioning object.
 *
 * A small graticule globe (same translucent-glass-with-contrail-edges
 * object language as the tern) shaded by the REAL day/night terminator:
 * the sun direction is computed from the actual current UTC time
 * (lib/solar.ts, hand-verified against almanac values), and the civil
 * twilight band (solar elevation 0° to −6°) glows --horizon-500 exactly
 * where civil twilight is happening on Earth right now.
 *
 * The ICN→LHR great-circle route — the same route on the boarding pass —
 * is drawn as a true 3D surface curve. Terminator shading is computed in
 * the EARTH frame (sun uniform in object space), so day/night stays
 * geographically correct while the decorative spin only turns the
 * display object; it never desynchronizes geography from the terminator.
 *
 * Sits behind the flight plane (z = GLOBE_Z) so the tern crosses in
 * front of it and the settled glass pass can overlap it — layered depth,
 * secondary to the pass by design. Renders only in the hero's animated
 * branch: reduced-motion / mobile / low-core users never mount it, and
 * the shared canvas's rAF loop already stops on backgrounded tabs.
 */

const INK = new THREE.Color("#0A0F1E"); //   --ink-900
const DUSK = new THREE.Color("#1B2A52"); //  --dusk-700
const HORIZON = new THREE.Color("#F2934D"); // --horizon-500
const CONTRAIL = new THREE.Color("#8FE0E8"); // --contrail-300

const NIGHT_COLOR = INK.clone().lerp(DUSK, 0.5);
const DAY_COLOR = DUSK.clone().lerp(CONTRAIL, 0.3);

const ICN = { lat: 37.469, lon: 126.451 };
const LHR = { lat: 51.47, lon: -0.454 };

// Placement: fractional hero coords (x right, y down from top-left) on the
// GLOBE_Z plane; radius as a fraction of that plane's visible height.
const GLOBE_FRAC_X = 0.52;
const GLOBE_FRAC_Y = 0.232;
const GLOBE_Z = -1.4;
const GLOBE_R_FRAC = 0.082;
const CAM_Z = 6; // hero View camera z (HeroTernView PerspectiveCamera)
const FOV_DEG = 45;

const SPIN_RATE = 0.07; // rad/s — one revolution ≈ 90 s
const SUN_UPDATE_MS = 1000;

/** lat/lon (deg, east-positive) → unit vector. Y-up; lon 0 on +X, east
 *  toward −Z. Route, subsolar point, and shader all share this frame. */
function latLonToVec(latDeg: number, lonDeg: number): THREE.Vector3 {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);
  return new THREE.Vector3(
    Math.cos(lat) * Math.cos(lon),
    Math.sin(lat),
    -Math.cos(lat) * Math.sin(lon)
  );
}

const globeVertex = /* glsl */ `
  varying vec3 vObjNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  void main() {
    vObjNormal = normal;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const globeFragment = /* glsl */ `
  uniform vec3 uSunDir;    // earth/object frame, unit
  uniform vec3 uNight;
  uniform vec3 uDay;
  uniform vec3 uTwilight;
  uniform vec3 uLine;
  varying vec3 vObjNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vec3 n = normalize(vObjNormal);
    // sin of solar elevation at this surface point
    float sunDot = dot(n, uSunDir);

    // Day/night base
    float dayF = smoothstep(-0.06, 0.20, sunDot);
    vec3 base = mix(uNight, uDay, dayF);

    // Civil twilight band: solar elevation 0° .. −6° → sunDot −0.1045 .. 0.
    // Soft shoulders so the band reads as a glow, not a hard stripe.
    float tw = smoothstep(-0.21, -0.1045, sunDot) * (1.0 - smoothstep(0.0, 0.10, sunDot));
    base += uTwilight * tw * 0.75;

    // Graticule: 15° cells from the sphere UVs, AA'd with fwidth.
    vec2 coord = vec2(vUv.x * 24.0, vUv.y * 12.0);
    vec2 distToLine = abs(fract(coord - 0.5) - 0.5);
    vec2 fw = fwidth(coord) * 1.4;
    vec2 lineMask = vec2(1.0) - smoothstep(vec2(0.0), fw, distToLine);
    float grid = max(lineMask.x, lineMask.y);
    base = mix(base, uLine, grid * (0.08 + 0.12 * dayF));

    // Fresnel rim — the depth cue that makes it an object, not a disc.
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float rim = pow(1.0 - clamp(dot(viewDir, normalize(vWorldNormal)), 0.0, 1.0), 2.6);
    base += uLine * rim * 0.5;

    gl_FragColor = vec4(base, 1.0);
  }
`;

// Soft additive halo just outside the sphere — atmosphere, not neon.
const haloVertex = /* glsl */ `
  varying vec3 vViewNormal;
  void main() {
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vViewNormal;
  void main() {
    float intensity = pow(0.62 - dot(vViewNormal, vec3(0.0, 0.0, 1.0)), 4.0);
    gl_FragColor = vec4(uColor, 1.0) * max(intensity, 0.0) * 0.55;
  }
`;

export default function HeroGlobe() {
  const outerRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const lastSunUpdate = useRef(0);
  const bornAt = useRef(-1);

  const globeMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: globeVertex,
        fragmentShader: globeFragment,
        uniforms: {
          uSunDir: { value: latLonToVec(0, 0) },
          uNight: { value: NIGHT_COLOR },
          uDay: { value: DAY_COLOR },
          uTwilight: { value: HORIZON },
          uLine: { value: CONTRAIL },
        },
      }),
    []
  );

  const haloMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: haloVertex,
        fragmentShader: haloFragment,
        uniforms: { uColor: { value: CONTRAIL } },
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  // ICN→LHR great circle on the surface: slerp between the endpoint unit
  // vectors, lifted slightly so the line never z-fights the sphere.
  const { routeGeo, icnPos, lhrPos, initialSpinY } = useMemo(() => {
    const a = latLonToVec(ICN.lat, ICN.lon);
    const b = latLonToVec(LHR.lat, LHR.lon);
    const angle = a.angleTo(b);
    const sinA = Math.sin(angle);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const w1 = Math.sin((1 - t) * angle) / sinA;
      const w2 = Math.sin(t * angle) / sinA;
      const p = a.clone().multiplyScalar(w1).add(b.clone().multiplyScalar(w2)).normalize();
      pts.push(p.multiplyScalar(1.015 + 0.03 * Math.sin(Math.PI * t)));
    }
    const mid = pts[32].clone().normalize();
    // Start with the route's midpoint facing the camera (+Z side).
    const spinY = Math.atan2(mid.x, mid.z) * -1;
    return {
      routeGeo: new THREE.BufferGeometry().setFromPoints(pts),
      icnPos: a.clone().multiplyScalar(1.015),
      lhrPos: b.clone().multiplyScalar(1.015),
      initialSpinY: spinY,
    };
  }, []);

  const routeMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: CONTRAIL,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const endpointGeo = useMemo(() => new THREE.SphereGeometry(0.022, 12, 12), []);
  const endpointMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: CONTRAIL }),
    []
  );

  // THREE.Line via <primitive>: R3F's <line> JSX collides with the SVG
  // element type, so the object is constructed directly.
  const routeLine = useMemo(() => new THREE.Line(routeGeo, routeMaterial), [routeGeo, routeMaterial]);

  useEffect(() => {
    return () => {
      globeMaterial.dispose();
      haloMaterial.dispose();
      routeGeo.dispose();
      routeMaterial.dispose();
      endpointGeo.dispose();
      endpointMaterial.dispose();
    };
  }, [globeMaterial, haloMaterial, routeGeo, routeMaterial, endpointGeo, endpointMaterial]);

  useFrame((state, delta) => {
    const outer = outerRef.current;
    const spin = spinRef.current;
    if (!outer || !spin) return;

    // Resize-safe placement on the GLOBE_Z plane.
    const planeH = 2 * (CAM_Z - GLOBE_Z) * Math.tan(THREE.MathUtils.degToRad(FOV_DEG / 2));
    const planeW = planeH * (state.size.width / state.size.height);
    outer.position.set(
      (GLOBE_FRAC_X - 0.5) * planeW,
      (0.5 - GLOBE_FRAC_Y) * planeH,
      GLOBE_Z
    );

    // Gentle scale-in on first appearance so the globe doesn't pop.
    const now0 = performance.now();
    if (bornAt.current < 0) bornAt.current = now0;
    const born = Math.min((now0 - bornAt.current) / 1200, 1);
    const bornEase = 1 - Math.pow(1 - born, 3);
    outer.scale.setScalar(planeH * GLOBE_R_FRAC * (0.6 + 0.4 * bornEase));

    // Decorative spin only — terminator math lives in the earth frame.
    spin.rotation.y += delta * SPIN_RATE;

    // Real-time sun direction, throttled to ~1 Hz.
    const now = performance.now();
    if (now - lastSunUpdate.current > SUN_UPDATE_MS) {
      lastSunUpdate.current = now;
      const dbg = window as unknown as {
        __ternGlobeSunOverride?: { latDeg: number; lonDeg: number };
        __ternGlobeDebug?: Record<string, number>;
      };
      // Verification hook: tests can pin the sun to a known point and
      // compare the render against the prediction (see DESIGN_BRIEF 1.5.1).
      const sp = dbg.__ternGlobeSunOverride ?? subsolarPoint(new Date());
      (globeMaterial.uniforms.uSunDir.value as THREE.Vector3).copy(
        latLonToVec(sp.latDeg, sp.lonDeg)
      );
      // Report which earth point currently faces the camera, so a test
      // can aim the override sun straight at (or away from) the viewer.
      const q = spin.getWorldQuaternion(new THREE.Quaternion()).invert();
      const v = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
      dbg.__ternGlobeDebug = {
        subsolarLat: sp.latDeg,
        subsolarLon: sp.lonDeg,
        eotMinutes: (sp as { eotMinutes?: number }).eotMinutes ?? NaN,
        camFacingLat: THREE.MathUtils.radToDeg(Math.asin(THREE.MathUtils.clamp(v.y, -1, 1))),
        camFacingLon: THREE.MathUtils.radToDeg(Math.atan2(-v.z, v.x)),
      };
    }
  });

  return (
    // rotation.x tips the north pole toward the camera: the ICN→LHR great
    // circle is an arctic route (midpoint ~62°N) — the Arctic Tern's sky.
    <group ref={outerRef} rotation={[0.42, 0, -0.12]}>
      <group ref={spinRef} rotation={[0, initialSpinY, 0]}>
        <mesh material={globeMaterial}>
          <sphereGeometry args={[1, 48, 32]} />
        </mesh>
        <primitive object={routeLine} />
        <mesh geometry={endpointGeo} material={endpointMaterial} position={icnPos} />
        <mesh geometry={endpointGeo} material={endpointMaterial} position={lhrPos} />
      </group>
      <mesh material={haloMaterial} scale={1.12}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
    </group>
  );
}
