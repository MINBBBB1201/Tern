import type { ReactElement } from "react";

/**
 * Shared Civil-Twilight OG card for the App Router `opengraph-image` routes
 * (home, blog posts, airport guides). Self-contained — the tern glyph is
 * inline SVG and the type uses next/og's built-in font, so nothing is
 * fetched at generation time. 1200×630, the standard share-preview size.
 *
 * Palette (tokens mirrored from globals.css):
 *   ink #0A0F1E · dusk #1B2A52 · horizon #F2934D · contrail #8FE0E8 · paper #F6F8FB
 */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const PAPER = "#F6F8FB";
const CONTRAIL = "#8FE0E8";

export function ogCard({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}): ReactElement {
  // Ease the headline down a step when it's long so it never overflows.
  const titleSize = title.length > 46 ? 60 : title.length > 30 ? 70 : 82;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "76px",
        background: "linear-gradient(135deg, #0A0F1E 0%, #16234A 58%, #1B2A52 100%)",
        position: "relative",
      }}
    >
      {/* Warm horizon glow rising from the bottom edge. */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "300px",
          background:
            "radial-gradient(80% 130% at 50% 145%, rgba(242,147,77,0.30) 0%, rgba(242,147,77,0) 70%)",
        }}
      />

      {/* Wordmark: tern glyph + TERN */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <svg width="54" height="54" viewBox="0 0 24 24">
          <path d="M2 15 L22 8 L12 12.5 L9.5 4.5 L7.5 5.5 L9 13.5 Z" fill={CONTRAIL} />
        </svg>
        <div style={{ fontSize: 42, fontWeight: 700, color: PAPER, letterSpacing: "0.06em" }}>
          TERN
        </div>
      </div>

      {/* Kicker + headline + optional subtitle */}
      <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: CONTRAIL,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            color: PAPER,
            lineHeight: 1.04,
            maxWidth: "1010px",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontSize: 31,
              color: "rgba(246,248,251,0.72)",
              lineHeight: 1.32,
              maxWidth: "940px",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Footer host */}
      <div style={{ fontSize: 25, color: "rgba(246,248,251,0.62)", letterSpacing: "0.04em" }}>
        flytern.site
      </div>
    </div>
  );
}
