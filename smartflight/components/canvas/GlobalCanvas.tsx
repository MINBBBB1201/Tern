"use client";
import { useSyncExternalStore } from "react";
import GlobalCanvasInner from "./GlobalCanvasInner";

const emptySubscribe = () => () => {};

/**
 * Client-only mount WITHOUT next/dynamic: in this Next.js version,
 * back/forward navigation re-suspends a dynamic({ ssr: false }) boundary
 * in the layout and never resolves it — the canvas subtree gets replaced
 * by a stranded <template> and the WebGL layer disappears for the rest
 * of the session (verified via Puppeteer DOM probes; dev server).
 *
 * useSyncExternalStore with distinct server/client snapshots renders
 * null on the server and the real canvas after hydration — no lazy
 * boundary to strand, and the 3D layer stays off the SSR/first-paint
 * critical path.
 */
export default function GlobalCanvas() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  if (!isClient) return null;
  return <GlobalCanvasInner />;
}
