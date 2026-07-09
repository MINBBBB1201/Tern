"use client";
import dynamic from "next/dynamic";

// Client-only: the global 3D layer must never block first paint or SSR —
// same rule the hero scene already follows in app/page.tsx.
const GlobalCanvasInner = dynamic(() => import("./GlobalCanvasInner"), {
  ssr: false,
});

export default function GlobalCanvas() {
  return <GlobalCanvasInner />;
}
