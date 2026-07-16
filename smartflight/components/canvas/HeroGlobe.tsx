"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { subsolarPoint } from "../../lib/solar";
import { heroRoute } from "../../lib/heroRoute";

/**
 * Civil-twilight globe — the brand name as a literal, functioning object.
 *
 * A real Earth (NASA Blue Marble day map + Black Marble city lights,
 * both public domain, served from /public/textures) shaded by the REAL
 * day/night terminator: the sun direction is computed from the actual
 * current UTC time (lib/solar.ts, hand-verified against almanac values),
 * day and night imagery are blended by the same subsolar dot product
 * (the classic three.js earth technique), and the civil twilight band
 * (solar elevation 0° to −6°) glows --horizon-500 exactly where civil
 * twilight is happening on Earth right now. A faint graticule and
 * contrail fresnel rim remain as a thin brand overlay. Until the
 * textures stream in (or if they fail), the shader falls back to the
 * original procedural dusk-palette shading via uTexMix.
 *
 * The route arc is LIVE: it follows SearchBar's origin/destination
 * (lib/heroRoute.ts) and retargets in real time as the user edits the
 * search — the globe reflects what the user is doing, not a demo.
 *
 * Terminator shading is computed in the EARTH frame (sun uniform in
 * object space), so day/night stays geographically correct while the
 * decorative spin only turns the display object.
 *
 * Renders only in the hero's animated branch: reduced-motion / mobile /
 * low-core users never mount it, and the shared canvas's rAF loop
 * already stops on backgrounded tabs.
 */

const INK = new THREE.Color("#0A0F1E"); //   --ink-900
const DUSK = new THREE.Color("#1B2A52"); //  --dusk-700
const HORIZON = new THREE.Color("#F2934D"); // --horizon-500
const CONTRAIL = new THREE.Color("#8FE0E8"); // --contrail-300

const NIGHT_COLOR = INK.clone().lerp(DUSK, 0.5);
const DAY_COLOR = DUSK.clone().lerp(CONTRAIL, 0.3);

// Placement: fractional hero coords (x right, y down from top-left) on the
// GLOBE_Z plane; radius as a fraction of that plane's visible height.
// Stage 1.5 update #2: the globe is a primary compositional element —
// large, left-positioned (the pass anchors the right), continuously
// spinning. The hero copy moves right to give it room (see .hero-copy).
const GLOBE_FRAC_X = 0.26;
const GLOBE_FRAC_Y = 0.5;
const GLOBE_Z = -1.4;
const GLOBE_R_FRAC = 0.3;
const CAM_Z = 6; // hero View camera z (HeroTernView PerspectiveCamera)
const FOV_DEG = 45;

const SPIN_RATE = 0.07; // rad/s — one revolution ≈ 90 s
const SUN_UPDATE_MS = 1000;
const ROUTE_SEGMENTS = 64;

/** Placement of the globe on its z-plane for a given canvas size — one
 *  deterministic function shared with TernSequence so the tern's orbit and
 *  the globe never disagree about geometry. */
export function globePlacement(sizeW: number, sizeH: number) {
  const planeH = 2 * (CAM_Z - GLOBE_Z) * Math.tan(THREE.MathUtils.degToRad(FOV_DEG / 2));
  const planeW = planeH * (sizeW / sizeH);
  return {
    center: new THREE.Vector3(
      (GLOBE_FRAC_X - 0.5) * planeW,
      (0.5 - GLOBE_FRAC_Y) * planeH,
      GLOBE_Z
    ),
    radius: planeH * GLOBE_R_FRAC,
  };
}

/**
 * Live handles for the unified tern→globe→pass sequence: TernSequence
 * orbits the tern along the same great-circle route that is drawn on the
 * globe's surface, in the globe's own (spinning) frame. `spin` is the
 * rotating earth-frame group; e1/e2 span the current route's great-circle
 * plane in that frame, so orbitPoint(θ) = (e1·cosθ + e2·sinθ) · r, mapped
 * through spin.localToWorld, follows the drawn route exactly. Updated by
 * applyRoute() whenever heroRoute changes; TernSequence freezes its own
 * copy at flight start so a mid-flight search edit never teleports the
 * bird. `scrollOut` is written once per frame by TernSequence (0 = hero
 * fully on screen, 1 = scrolled past) and read here to fade the globe.
 */
export const globeShared = (() => {
  const a = latLonToVec(heroRoute.from.lat, heroRoute.from.lon);
  const b = latLonToVec(heroRoute.to.lat, heroRoute.to.lon);
  return {
    spin: null as THREE.Object3D | null,
    e1: a.clone(),
    e2: b.clone().addScaledVector(a, -a.dot(b)).normalize(),
    /** Spin-local angle of origin (θ=0) → destination along the circle. */
    routeSpanRad: a.angleTo(b),
    scrollOut: 0,
  };
})();

/** lat/lon (deg, east-positive) → unit vector. Y-up; lon 0 on +X, east
 *  toward −Z. This matches three.js SphereGeometry UVs with a standard
 *  equirectangular Earth map (Greenwich at u=0.5, north at the top), so
 *  route endpoints, the subsolar point, and the textures all agree on
 *  where geography is. Route, solar math, and shader share this frame. */
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
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform float uTexMix;   // 0 = procedural fallback, 1 = NASA imagery
  uniform float uFade;     // scroll-out fade, 1 = fully visible
  varying vec3 vObjNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vec3 n = normalize(vObjNormal);
    // sin of solar elevation at this surface point
    float sunDot = dot(n, uSunDir);

    // Real Earth, graded into the dusk palette: the night side sits on
    // the ink/dusk base with the city lights lifted warm out of the
    // black; the day side keeps its natural continents/oceans.
    vec3 dayTex = texture2D(uDayMap, vUv).rgb;
    vec3 nightTex = texture2D(uNightMap, vUv).rgb;
    vec3 dayReal = dayTex;
    vec3 nightReal = uNight * 0.6 + nightTex * vec3(1.5, 1.3, 0.95);
    vec3 dayCol = mix(uDay, dayReal, uTexMix);
    vec3 nightCol = mix(uNight, nightReal, uTexMix);

    float dayF = smoothstep(-0.18, 0.22, sunDot);
    vec3 base = mix(nightCol, dayCol, dayF);

    // Civil twilight: not a painted stripe but warm light grazing the
    // terminator. Wide shoulders (~±20° elevation), and the warmth
    // mostly MULTIPLIES the surface (dusk light on ground and clouds)
    // with only a whisper of additive glow — it reads as lighting, not
    // as an orange band laid over the planet.
    float tw = smoothstep(-0.42, -0.1, sunDot) * (1.0 - smoothstep(-0.02, 0.3, sunDot));
    base = base * (vec3(1.0) + uTwilight * tw * 0.9) + uTwilight * tw * 0.1;

    // Graticule: a whisper over the real surface (was the whole surface
    // pre-texture; stays stronger while the fallback shading shows).
    vec2 coord = vec2(vUv.x * 24.0, vUv.y * 12.0);
    vec2 distToLine = abs(fract(coord - 0.5) - 0.5);
    vec2 fw = fwidth(coord) * 1.4;
    vec2 lineMask = vec2(1.0) - smoothstep(vec2(0.0), fw, distToLine);
    float grid = max(lineMask.x, lineMask.y);
    base = mix(base, uLine, grid * (0.02 + 0.04 * dayF) * mix(3.0, 1.0, uTexMix));

    // Fresnel rim — the depth cue that makes it an object, not a disc.
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float rim = pow(1.0 - clamp(dot(viewDir, normalize(vWorldNormal)), 0.0, 1.0), 2.6);
    base += uLine * rim * 0.5;

    gl_FragColor = vec4(base, uFade);
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
  uniform float uFade;
  varying vec3 vViewNormal;
  void main() {
    float intensity = pow(0.62 - dot(vViewNormal, vec3(0.0, 0.0, 1.0)), 4.0);
    gl_FragColor = vec4(uColor, 1.0) * max(intensity, 0.0) * 0.55 * uFade;
  }
`;

export default function HeroGlobe() {
  const outerRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const fromMarkerRef = useRef<THREE.Mesh>(null);
  const toMarkerRef = useRef<THREE.Mesh>(null);
  const lastSunUpdate = useRef(0);
  const bornAt = useRef(-1);
  const routeVersion = useRef(-1);
  const texMix = useRef({ value: 0, target: 0 });
  const gl = useThree((s) => s.gl);

  // 1×1 placeholders so the shader compiles before the NASA maps arrive.
  const placeholderTex = useMemo(() => {
    const tex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const globeMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: globeVertex,
        fragmentShader: globeFragment,
        transparent: true, // uFade drives scroll-out
        uniforms: {
          uSunDir: { value: latLonToVec(0, 0) },
          uNight: { value: NIGHT_COLOR },
          uDay: { value: DAY_COLOR },
          uTwilight: { value: HORIZON },
          uLine: { value: CONTRAIL },
          uDayMap: { value: placeholderTex },
          uNightMap: { value: placeholderTex },
          uTexMix: { value: 0 },
          uFade: { value: 1 },
        },
      }),
    [placeholderTex]
  );

  const haloMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: haloVertex,
        fragmentShader: haloFragment,
        uniforms: { uColor: { value: CONTRAIL }, uFade: { value: 1 } },
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  // NASA Blue Marble (day) + Black Marble city lights (night), public
  // domain, self-hosted. Loaded off the critical path; on failure the
  // procedural fallback simply remains.
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let disposed = false;
    const loaded: THREE.Texture[] = [];
    Promise.all([
      loader.loadAsync("/textures/earth-day.jpg"),
      loader.loadAsync("/textures/earth-night.jpg"),
    ])
      .then(([day, night]) => {
        if (disposed) {
          day.dispose();
          night.dispose();
          return;
        }
        for (const tex of [day, night]) {
          tex.wrapS = THREE.RepeatWrapping; // hide the dateline seam
          tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
          loaded.push(tex);
        }
        globeMaterial.uniforms.uDayMap.value = day;
        globeMaterial.uniforms.uNightMap.value = night;
        texMix.current.target = 1; // fade the imagery in
      })
      .catch(() => {});
    return () => {
      disposed = true;
      loaded.forEach((t) => t.dispose());
    };
  }, [globeMaterial, gl]);

  // Route line: fixed-size buffer, refilled in place whenever heroRoute
  // changes (65 points — cheap enough to rebuild on every keystroke).
  const routeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array((ROUTE_SEGMENTS + 1) * 3), 3)
    );
    return g;
  }, []);

  /** Rebuild arc + endpoint markers + the shared orbit basis from the
   *  current heroRoute. Runs on mount and on version change (useFrame). */
  const applyRoute = () => {
    const a = latLonToVec(heroRoute.from.lat, heroRoute.from.lon);
    const b = latLonToVec(heroRoute.to.lat, heroRoute.to.lon);
    const angle = a.angleTo(b);
    const sinA = Math.sin(angle);
    if (sinA < 1e-3) return; // degenerate (same/antipodal): keep last arc
    const attr = routeGeo.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i <= ROUTE_SEGMENTS; i++) {
      const t = i / ROUTE_SEGMENTS;
      const w1 = Math.sin((1 - t) * angle) / sinA;
      const w2 = Math.sin(t * angle) / sinA;
      let x = a.x * w1 + b.x * w2;
      let y = a.y * w1 + b.y * w2;
      let z = a.z * w1 + b.z * w2;
      const len = Math.sqrt(x * x + y * y + z * z);
      const alt = (1.015 + 0.03 * Math.sin(Math.PI * t)) / len;
      x *= alt;
      y *= alt;
      z *= alt;
      attr.setXYZ(i, x, y, z);
    }
    attr.needsUpdate = true;
    routeGeo.computeBoundingSphere();
    fromMarkerRef.current?.position.copy(a).multiplyScalar(1.015);
    toMarkerRef.current?.position.copy(b).multiplyScalar(1.015);
    globeShared.e1.copy(a);
    globeShared.e2.copy(b).addScaledVector(a, -a.dot(b)).normalize();
    globeShared.routeSpanRad = angle;
    routeVersion.current = heroRoute.version;
  };

  // Face the initial route's midpoint toward the camera (+Z side) at load.
  const initialSpinY = useMemo(() => {
    const a = latLonToVec(heroRoute.from.lat, heroRoute.from.lon);
    const b = latLonToVec(heroRoute.to.lat, heroRoute.to.lon);
    const mid = a.add(b).normalize();
    return Math.atan2(mid.x, mid.z) * -1;
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
    () => new THREE.MeshBasicMaterial({ color: CONTRAIL, transparent: true }),
    []
  );

  // THREE.Line via <primitive>: R3F's <line> JSX collides with the SVG
  // element type, so the object is constructed directly.
  const routeLine = useMemo(() => new THREE.Line(routeGeo, routeMaterial), [routeGeo, routeMaterial]);

  useEffect(() => {
    globeShared.spin = spinRef.current;
    applyRoute(); // markers exist now; also seeds globeShared for the orbit
    return () => {
      globeShared.spin = null;
      placeholderTex.dispose();
      globeMaterial.dispose();
      haloMaterial.dispose();
      routeGeo.dispose();
      routeMaterial.dispose();
      endpointGeo.dispose();
      endpointMaterial.dispose();
    };
    // applyRoute is stable in behavior (reads module state, writes refs).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholderTex, globeMaterial, haloMaterial, routeGeo, routeMaterial, endpointGeo, endpointMaterial]);

  useFrame((state, delta) => {
    const outer = outerRef.current;
    const spin = spinRef.current;
    if (!outer || !spin) return;

    // Live route: retarget the arc when SearchBar's origin/destination
    // changes (heroRoute bumps its version).
    if (routeVersion.current !== heroRoute.version) applyRoute();

    // Resize-safe placement on the GLOBE_Z plane (shared with the orbit).
    const { center, radius } = globePlacement(state.size.width, state.size.height);
    outer.position.copy(center);

    // Gentle scale-in on first appearance so the globe doesn't pop.
    const now0 = performance.now();
    if (bornAt.current < 0) bornAt.current = now0;
    const born = Math.min((now0 - bornAt.current) / 1200, 1);
    const bornEase = 1 - Math.pow(1 - born, 3);

    // Scroll-out (item 4): written per-frame by TernSequence from the
    // hero's bounding rect — fade + slight shrink, no visibility snap.
    const fade = 1 - THREE.MathUtils.smoothstep(globeShared.scrollOut, 0.05, 0.5);
    globeMaterial.uniforms.uFade.value = fade;
    haloMaterial.uniforms.uFade.value = fade;
    routeMaterial.opacity = 0.95 * fade;
    endpointMaterial.opacity = fade;
    outer.visible = fade > 0.005;

    outer.scale.setScalar(radius * (0.6 + 0.4 * bornEase) * (1 - 0.12 * globeShared.scrollOut));

    // Decorative spin only — terminator math lives in the earth frame.
    spin.rotation.y += delta * SPIN_RATE;

    // Fade the NASA imagery in once loaded.
    const tm = texMix.current;
    if (tm.value !== tm.target) {
      tm.value = Math.min(tm.target, tm.value + delta * 1.4);
      globeMaterial.uniforms.uTexMix.value = tm.value;
    }

    // Real-time sun direction, throttled to ~1 Hz.
    const now = performance.now();
    if (now - lastSunUpdate.current > SUN_UPDATE_MS) {
      lastSunUpdate.current = now;
      const dbg = window as unknown as {
        __ternGlobeSunOverride?: { latDeg: number; lonDeg: number };
        __ternGlobeDebug?: Record<string, number | string>;
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
        route: `${heroRoute.from.iata}->${heroRoute.to.iata}`,
        texMix: tm.value,
        scrollOut: globeShared.scrollOut,
      };
    }
  });

  return (
    // rotation.x tips the north pole toward the camera: long-haul routes
    // out of ICN mostly arc through high latitudes — the Arctic Tern's sky.
    <group ref={outerRef} rotation={[0.42, 0, -0.12]}>
      <group ref={spinRef} rotation={[0, initialSpinY, 0]}>
        <mesh material={globeMaterial}>
          <sphereGeometry args={[1, 48, 32]} />
        </mesh>
        <primitive object={routeLine} />
        <mesh ref={fromMarkerRef} geometry={endpointGeo} material={endpointMaterial} />
        <mesh ref={toMarkerRef} geometry={endpointGeo} material={endpointMaterial} />
      </group>
      <mesh material={haloMaterial} scale={1.12}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
    </group>
  );
}
