"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function AirplaneCursor() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetRot = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;
    const mountEl = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    mountEl.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 2);
    dir.position.set(5, 10, 5);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xffffff, 0.8);
    fill.position.set(-5, 0, 5);
    scene.add(fill);

    // Load GLB model
    let airplane: THREE.Object3D | null = null;
    const loader = new GLTFLoader();
    loader.load(
      "/models/airplane.glb",
      (gltf) => {
        airplane = gltf.scene;

        // Center and scale model
        const box = new THREE.Box3().setFromObject(airplane);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 8 / maxDim;

        airplane.scale.setScalar(scale);
        airplane.position.sub(center.multiplyScalar(scale));
        airplane.rotation.y = Math.PI;

        scene.add(airplane);
      },
      undefined,
      (error) => console.error("GLB load error:", error)
    );

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = mountEl.getBoundingClientRect();
      if (!rect) return;
      const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const rawY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mousePos.current.x = rawX;
      mousePos.current.y = rawY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (airplane) {
        // Smooth mouse follow (restore wider original angle feel)
        targetRot.current.x += (mousePos.current.y * 0.3 - targetRot.current.x) * 0.05;
        targetRot.current.y += (mousePos.current.x * 0.4 - targetRot.current.y) * 0.05;

        airplane.rotation.x = targetRot.current.x;
        airplane.rotation.z = -targetRot.current.y * 0.4;
        airplane.rotation.y = Math.PI + targetRot.current.y * 0.3;

        // Gentle float (restore original feel)
        airplane.position.y = Math.sin(t * 0.8) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = mountEl.clientWidth / mountEl.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
    />
  );
}
