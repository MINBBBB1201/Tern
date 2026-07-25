import { ImageResponse } from "next/og";
import { ogCard, ogSize, ogContentType } from "../lib/og";

export const alt = "Tern — compare flights by price, speed, delay risk, and points value";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return new ImageResponse(
    ogCard({
      kicker: "Compare flights",
      title: "Chase the horizon.",
      subtitle:
        "Cheapest, fastest, earliest, AI-balanced, and lowest delay-risk fares — side by side, with points-vs-cash value.",
    }),
    { ...size }
  );
}
