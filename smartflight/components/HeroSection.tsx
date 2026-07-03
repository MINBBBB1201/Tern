"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

type TripType = "oneway" | "roundtrip" | "multicity";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  tripType: TripType;
  onTripTypeChange: (type: TripType) => void;
  airplane: ReactNode;
  searchPanel: ReactNode;
  error?: string;
}

const tripTypes: Array<{ value: TripType; label: string }> = [
  { value: "oneway", label: "One Way" },
  { value: "roundtrip", label: "Round Trip" },
  { value: "multicity", label: "Multi City" },
];

function HeroParticles() {
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
          value: 22,
          density: {
            enable: true,
            width: 1440,
            height: 900,
          },
        },
        color: {
          value: ["#f8fbff", "#dbeafe", "#c7d2fe", "#bfdbfe"],
        },
        opacity: {
          value: { min: 0.08, max: 0.18 },
        },
        size: {
          value: { min: 1, max: 2.2 },
        },
        move: {
          enable: true,
          speed: 0.08,
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
      className="absolute inset-0 h-full w-full"
      options={options}
    />
  );
}

export default function HeroSection({
  title,
  subtitle,
  tripType,
  onTripTypeChange,
  airplane,
  searchPanel,
  error,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const blobLayerRef = useRef<HTMLDivElement>(null);
  const pathLayerRef = useRef<HTMLDivElement>(null);
  const decorLayerRef = useRef<HTMLDivElement>(null);
  const airplaneLayerRef = useRef<HTMLDivElement>(null);

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      targetRef.current.x = (x - 0.5) * 2;
      targetRef.current.y = (y - 0.5) * 2;
    };

    const onMouseLeave = () => {
      targetRef.current.x = 0;
      targetRef.current.y = 0;
    };

    section.addEventListener("mousemove", onMouseMove);
    section.addEventListener("mouseleave", onMouseLeave);

    let rafId = 0;
    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.055;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.055;

      const x = currentRef.current.x;
      const y = currentRef.current.y;

      if (blobLayerRef.current) {
        blobLayerRef.current.style.transform = `translate3d(${x * 10}px, ${y * 8}px, 0)`;
      }
      if (pathLayerRef.current) {
        pathLayerRef.current.style.transform = `translate3d(${x * 14}px, ${y * 12}px, 0)`;
      }
      if (decorLayerRef.current) {
        decorLayerRef.current.style.transform = `translate3d(${x * 18}px, ${y * 16}px, 0)`;
      }
      if (airplaneLayerRef.current) {
        airplaneLayerRef.current.style.transform = `perspective(1000px) rotateX(${y * -2}deg) rotateY(${x * 3.2}deg) translate3d(${x * 8}px, ${y * 6}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen pt-16 overflow-hidden"
      style={{
        background:
          "linear-gradient(165deg, #24385f 0%, #35568a 26%, #4f79b2 52%, #82a2d8 76%, #bfd0f0 100%)",
      }}
    >
      {/* Added: subtle particle depth */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <HeroParticles />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {/* Added: soft atmospheric wash */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(244,251,255,0.42),transparent_33%),radial-gradient(circle_at_86%_10%,rgba(222,215,255,0.34),transparent_28%),radial-gradient(circle_at_72%_76%,rgba(255,220,232,0.2),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.02)_35%,rgba(20,39,74,0.12)_100%)]" />

        {/* Layer 1: Soft gradient blobs */}
        <div ref={blobLayerRef} className="absolute inset-0 will-change-transform transition-transform duration-200">
          <div className="absolute -top-24 -left-28 h-[460px] w-[460px] rounded-full bg-[#75b8ff]/30 blur-[105px]" />
          <div className="absolute top-10 right-[-120px] h-[500px] w-[500px] rounded-full bg-[#b9a5ff]/25 blur-[112px]" />
          <div className="absolute bottom-[-140px] left-[8%] h-[420px] w-[420px] rounded-full bg-[#73d7ff]/20 blur-[105px]" />
          <div className="absolute bottom-[-120px] right-[14%] h-[390px] w-[390px] rounded-full bg-[#ffc2cf]/18 blur-[98px]" />
          <div className="absolute top-[40%] left-[38%] h-[280px] w-[280px] rounded-full bg-[#eff5ff]/20 blur-[90px]" />

          {/* broad depth haze */}
          <div className="absolute left-[-8%] top-[34%] h-40 w-[58%] rounded-[999px] bg-white/14 blur-2xl" />
          <div className="absolute right-[-8%] top-[46%] h-44 w-[54%] rounded-[999px] bg-white/12 blur-2xl" />
          <div className="absolute left-[18%] bottom-[22%] h-32 w-[46%] rounded-[999px] bg-[#dff0ff]/12 blur-2xl" />
        </div>

        {/* Layer 2: Flight path + soft constellation overlay */}
        <div ref={pathLayerRef} className="absolute inset-0 will-change-transform transition-transform duration-200 opacity-[0.52]">
          <svg viewBox="0 0 1440 900" className="h-full w-full">
            {/* Curved flight routes (soft but visible) */}
            <path className="hero-route" d="M-40 318C180 182 414 224 620 346C812 460 1012 470 1258 334C1342 288 1402 246 1470 206" stroke="#d7e6ff" strokeOpacity="0.44" strokeWidth="2.15" fill="none" strokeLinecap="round" strokeDasharray="7 10" />
            <path className="hero-route" d="M-30 606C162 552 332 476 518 500C722 526 902 680 1118 634C1246 604 1360 528 1468 436" stroke="#cfe9ff" strokeOpacity="0.41" strokeWidth="2.05" fill="none" strokeLinecap="round" strokeDasharray="6 11" />
            <path className="hero-route" d="M248 872C396 694 620 640 820 674C984 702 1176 728 1452 628" stroke="#ddd6ff" strokeOpacity="0.39" strokeWidth="2.05" fill="none" strokeLinecap="round" strokeDasharray="9 12" />

            {/* Additional routes for stronger mid-layer presence */}
            <path className="hero-route" d="M118 96C280 132 398 208 500 286C610 370 760 404 906 354C1018 316 1106 238 1218 196" stroke="#dff0ff" strokeOpacity="0.35" strokeWidth="1.95" fill="none" strokeLinecap="round" strokeDasharray="6 10" />
            <path className="hero-route" d="M-12 742C160 666 318 646 494 670C672 694 830 760 1008 742C1174 726 1318 646 1460 562" stroke="#e7dcff" strokeOpacity="0.33" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeDasharray="8 12" />
            <path className="hero-route" d="M862 80C958 150 1032 240 1040 334C1048 430 1000 520 908 594" stroke="#e4edff" strokeOpacity="0.31" strokeWidth="1.85" fill="none" strokeLinecap="round" strokeDasharray="5 10" />

            {/* Route waypoints */}
            <circle className="hero-node" cx="620" cy="346" r="5.8" fill="#d2e1ff" fillOpacity="0.86" />
            <circle className="hero-node" cx="1118" cy="634" r="5.6" fill="#c8ecff" fillOpacity="0.82" />
            <circle className="hero-node" cx="518" cy="500" r="5" fill="#d9ccff" fillOpacity="0.8" />
            <circle className="hero-node" cx="1258" cy="334" r="4.8" fill="#ffe1ea" fillOpacity="0.82" />
            <circle className="hero-node" cx="906" cy="354" r="4.6" fill="#e8f2ff" fillOpacity="0.76" />
            <circle className="hero-node" cx="494" cy="670" r="4.4" fill="#f0e4ff" fillOpacity="0.74" />

            {/* Constellation clusters (minimal, organic) */}
            <g>
              <path className="hero-constellation-link" d="M136 156L186 132L244 164L294 142" />
              <circle className="hero-constellation-dot" cx="136" cy="156" r="2.1" />
              <circle className="hero-constellation-dot" cx="186" cy="132" r="1.8" />
              <circle className="hero-constellation-dot" cx="244" cy="164" r="2.2" />
              <circle className="hero-constellation-dot" cx="294" cy="142" r="1.9" />
            </g>

            <g>
              <path className="hero-constellation-link" d="M1018 106L1068 136L1112 122L1154 156" />
              <circle className="hero-constellation-dot" cx="1018" cy="106" r="1.9" />
              <circle className="hero-constellation-dot" cx="1068" cy="136" r="2.1" />
              <circle className="hero-constellation-dot" cx="1112" cy="122" r="1.8" />
              <circle className="hero-constellation-dot" cx="1154" cy="156" r="2" />
            </g>

            <g>
              <path className="hero-constellation-link" d="M226 704L274 672L328 696" />
              <circle className="hero-constellation-dot" cx="226" cy="704" r="1.7" />
              <circle className="hero-constellation-dot" cx="274" cy="672" r="1.9" />
              <circle className="hero-constellation-dot" cx="328" cy="696" r="1.8" />
            </g>

            <g>
              <path className="hero-constellation-link" d="M1262 234L1302 214L1340 236L1372 214" />
              <circle className="hero-constellation-dot" cx="1262" cy="234" r="1.9" />
              <circle className="hero-constellation-dot" cx="1302" cy="214" r="1.7" />
              <circle className="hero-constellation-dot" cx="1340" cy="236" r="2" />
              <circle className="hero-constellation-dot" cx="1372" cy="214" r="1.8" />
            </g>
          </svg>
        </div>

        {/* Layer 3: Decorative cloud depth (edge-focused) */}
        <div ref={decorLayerRef} className="absolute inset-0 will-change-transform transition-transform duration-200">
          {/* back layer: large natural clouds */}
          <div className="absolute left-[-6%] top-[10%] h-52 w-[22rem]">
            <span className="absolute left-0 bottom-0 h-28 w-52 rounded-full bg-white/30 shadow-[0_24px_46px_rgba(61,90,140,0.24)]" />
            <span className="absolute left-12 bottom-10 h-30 w-44 rounded-full bg-white/38" />
            <span className="absolute left-28 bottom-2 h-24 w-40 rounded-full bg-[#edf6ff]/30" />
          </div>

          <div className="absolute right-[-7%] top-[48%] h-44 w-[19rem]">
            <span className="absolute right-0 bottom-0 h-24 w-44 rounded-full bg-[#eaf3ff]/30 shadow-[0_20px_40px_rgba(57,88,139,0.24)]" />
            <span className="absolute right-10 bottom-8 h-26 w-36 rounded-full bg-[#f2f8ff]/34" />
            <span className="absolute right-24 bottom-1 h-20 w-32 rounded-full bg-white/26" />
          </div>

          {/* front layer: small soft clouds */}
          <div className="absolute left-[6%] bottom-[8%] h-14 w-28 rounded-full bg-white/22 shadow-[0_12px_24px_rgba(63,94,146,0.2)]" />
          <div className="absolute right-[11%] bottom-[7%] h-12 w-24 rounded-full bg-white/20 shadow-[0_10px_22px_rgba(63,94,146,0.18)]" />
          <div className="absolute left-[22%] top-[64%] h-10 w-20 rounded-full bg-[#eef6ff]/16" />

          {/* moon */}
          <div className="absolute right-[22%] top-[8%] h-16 w-16 rounded-full bg-[#f4f8ff]/95 shadow-[inset_-8px_-10px_18px_rgba(179,201,235,0.45),0_10px_20px_rgba(53,85,138,0.32)]">
            <span className="absolute right-3 top-2 h-3 w-3 rounded-full bg-[#d9e8ff]/70" />
            <span className="absolute left-3 bottom-3 h-2.5 w-2.5 rounded-full bg-[#d7e5ff]/65" />
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Layer 5: Foreground content (left clean reading area) */}
          <div className="lg:col-span-5">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                {title}
              </h1>
              <p className="text-base md:text-lg text-blue-100/90 mt-4 max-w-lg">
                {subtitle}
              </p >
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {tripTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onTripTypeChange(type.value)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    tripType === type.value
                      ? "bg-primary text-white shadow-[0_12px_30px_rgba(37,99,235,0.3)]"
                      : "bg-white/92 backdrop-blur border border-white/75 text-muted hover:text-foreground shadow-[0_10px_24px_rgba(66,92,140,0.3)]"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="mt-5 relative z-30 w-full max-w-[1240px] lg:max-w-[1420px]">
              {searchPanel}
            </div>

            {error && <p className="mt-4 text-red-500 text-sm">{error}</p >}
          </div>

          {/* Layer 4: Airplane visual (right) */}
          <div className="lg:col-span-7 relative min-h-[420px] md:min-h-[520px] lg:min-h-[590px]">
            <div className="absolute inset-0 rounded-[44px] border border-[#d6e6ff]/45 bg-[linear-gradient(180deg,rgba(188,215,248,0.14)_0%,rgba(120,157,219,0.16)_44%,rgba(63,96,160,0.2)_100%)] shadow-[0_34px_110px_rgba(26,44,84,0.46)]" />

            {/* Added: inside-scene glow and atmosphere */}
            <div className="absolute inset-0 overflow-hidden rounded-[44px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_8%,rgba(244,250,255,0.5),transparent_36%),radial-gradient(circle_at_20%_24%,rgba(201,225,255,0.22),transparent_44%),radial-gradient(circle_at_82%_30%,rgba(170,205,255,0.2),transparent_46%),linear-gradient(180deg,rgba(238,248,255,0.38)_0%,rgba(169,201,245,0.26)_34%,rgba(98,132,196,0.3)_68%,rgba(44,67,123,0.36)_100%)]" />

              {/* background clouds: smaller + much blurrier */}
              <div className="absolute right-[6%] top-[6%] h-24 w-44 blur-[18px] opacity-65">
                <span className="absolute left-[10%] top-[28%] h-10 w-22 rounded-full bg-[#edf6ff]/26" />
                <span className="absolute left-[34%] top-[18%] h-11 w-20 rounded-full bg-white/22" />
                <span className="absolute left-[54%] top-[34%] h-9 w-18 rounded-full bg-[#eaf3ff]/20" />
              </div>
              <div className="absolute left-[8%] top-[20%] h-24 w-40 blur-[20px] opacity-60">
                <span className="absolute left-[6%] top-[34%] h-10 w-20 rounded-full bg-white/22" />
                <span className="absolute left-[28%] top-[22%] h-11 w-18 rounded-full bg-[#eef6ff]/20" />
                <span className="absolute left-[50%] top-[38%] h-9 w-16 rounded-full bg-white/18" />
              </div>

              {/* mid clouds (behind airplane): irregular silhouette */}
              <div className="absolute left-[16%] top-[46%] h-24 w-52 blur-[2.2px]">
                <span className="absolute left-0 top-[38%] h-12 w-24 rounded-full bg-white/20" />
                <span className="absolute left-[18%] top-[24%] h-14 w-26 rounded-full bg-white/24" />
                <span className="absolute left-[42%] top-[32%] h-12 w-24 rounded-full bg-[#eef6ff]/20" />
                <span className="absolute left-[62%] top-[40%] h-10 w-20 rounded-full bg-[#e7f2ff]/18" />
              </div>
              <div className="absolute right-[18%] top-[54%] h-24 w-52 blur-[2.4px]">
                <span className="absolute right-0 top-[36%] h-12 w-24 rounded-full bg-[#eef6ff]/20" />
                <span className="absolute right-[18%] top-[22%] h-14 w-26 rounded-full bg-white/24" />
                <span className="absolute right-[42%] top-[30%] h-12 w-24 rounded-full bg-[#edf6ff]/20" />
                <span className="absolute right-[62%] top-[40%] h-10 w-20 rounded-full bg-white/16" />
              </div>

              <svg viewBox="0 0 900 600" className="absolute inset-0 h-full w-full opacity-[0.62]">
                <path
                  d="M120 420C240 345 350 325 470 330C585 334 665 310 770 235"
                  stroke="#dce8ff"
                  strokeOpacity="0.44"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="8 9"
                />
                <path
                  d="M80 356C196 302 300 294 404 316C518 340 620 348 732 308C786 288 836 258 880 224"
                  stroke="#cfe4ff"
                  strokeOpacity="0.36"
                  strokeWidth="1.9"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="6 10"
                />
                <path
                  d="M168 502C284 444 388 420 510 428C620 436 704 416 804 366"
                  stroke="#e5dcff"
                  strokeOpacity="0.32"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="8 11"
                />
                <circle cx="468" cy="330" r="6" fill="#d6e3ff" fillOpacity="0.84" />
                <circle cx="770" cy="235" r="5.4" fill="#ffffff" fillOpacity="0.8" />
                <circle cx="404" cy="316" r="4.8" fill="#d9e9ff" fillOpacity="0.72" />
                <circle cx="510" cy="428" r="4.6" fill="#e8deff" fillOpacity="0.68" />
              </svg>

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,255,255,0.22),transparent_44%),radial-gradient(circle_at_50%_110%,rgba(31,55,108,0.24),transparent_44%)]" />
            </div>

            <div
              ref={airplaneLayerRef}
              className="absolute inset-0 will-change-transform transition-transform duration-200"
            >
              <div className="relative h-full w-full rounded-[44px] overflow-hidden p-3 md:p-4 lg:p-5">
                {/* softer layered glow behind airplane */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_46%,rgba(232,243,255,0.56),transparent_30%),radial-gradient(circle_at_55%_52%,rgba(168,198,246,0.36),transparent_44%)]" />
                  <div className="absolute left-[16%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-[#eef5ff]/24 blur-[110px]" />
                  <div className="absolute right-[10%] bottom-[12%] h-[24rem] w-[24rem] rounded-full bg-[#8cb5ff]/18 blur-[102px]" />
                  <div className="absolute left-[34%] top-[30%] h-56 w-56 rounded-full bg-white/16 blur-[68px]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_45%,rgba(239,246,255,0.26),transparent_42%),radial-gradient(circle_at_56%_72%,rgba(110,151,226,0.2),transparent_38%)]" />
                </div>

                <div className="relative h-full w-full transform-gpu scale-[0.95] md:scale-[0.94] origin-center">
                  {airplane}
                </div>

                {/* subtle shadow under airplane */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 bottom-[18%] h-12 w-[46%] -translate-x-1/2 rounded-full bg-[#2b3f6a]/14 blur-[16px]" />
                </div>

                {/* foreground clouds (in front of airplane): larger + clearer */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-[6%] top-[34%] h-28 w-56">
                    <span className="absolute left-0 top-[44%] h-14 w-28 rounded-full bg-white/34 shadow-[0_12px_24px_rgba(124,154,210,0.2)]" />
                    <span className="absolute left-[16%] top-[24%] h-16 w-32 rounded-full bg-white/40 shadow-[0_8px_16px_rgba(124,154,210,0.14)]" />
                    <span className="absolute left-[46%] top-[36%] h-14 w-28 rounded-full bg-[#f4f9ff]/32" />
                    <span className="absolute left-[64%] top-[48%] h-11 w-22 rounded-full bg-white/28" />
                  </div>
                  <div className="absolute right-[8%] top-[58%] h-24 w-46">
                    <span className="absolute right-0 top-[42%] h-12 w-24 rounded-full bg-[#f1f7ff]/30 shadow-[0_10px_20px_rgba(124,154,210,0.18)]" />
                    <span className="absolute right-[20%] top-[24%] h-14 w-26 rounded-full bg-white/34" />
                    <span className="absolute right-[44%] top-[38%] h-11 w-22 rounded-full bg-[#edf6ff]/26" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-node {
          animation: heroPulse 3.2s ease-in-out infinite;
          transform-origin: center;
        }
        .hero-route {
          animation: heroRouteFloat 8s ease-in-out infinite;
        }
        .hero-constellation-dot {
          fill: #f5f9ff;
          fill-opacity: 0.82;
          animation: heroConstellationTwinkle 6.4s ease-in-out infinite;
          transform-origin: center;
        }
        .hero-constellation-link {
          stroke: #e7efff;
          stroke-opacity: 0.48;
          stroke-width: 1.35;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        @keyframes heroPulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.35);
          }
        }
        @keyframes heroConstellationTwinkle {
          0%,
          100% {
            opacity: 0.68;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        @keyframes heroRouteFloat {
          0%,
          100% {
            opacity: 0.86;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
