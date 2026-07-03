"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function BackgroundParticles() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: "transparent" },

      fpsLimit: 60,

      particles: {
        number: {
          value: 80, // 🔥 더 풍성하게
        },

        color: {
          value: ["#ffffff", "#e0e7ff", "#bfdbfe"], // 🔥 더 밝은 별
        },

        opacity: {
          value: { min: 0.3, max: 0.7 }, // 🔥 확실히 보이게
        },

        size: {
          value: { min: 1, max: 4 }, // 🔥 깊이 핵심
        },

        move: {
          enable: true,
          speed: 0.2, // 🔥 부드럽게
          direction: "none" as const,
          random: true,
          straight: false,
          outModes: {
            default: "out" as const,
          },
        },

        links: {
          enable: false,
        },
      },

      detectRetina: true,
    }),
    []
  );

  if (!init) return null;

  return (
    <Particles
      id="hero-particles"
      options={options}
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}
