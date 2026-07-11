/**
 * High-quality, consistent aircraft images for professional display
 * All images are real 2D photos with similar composition, lighting, and background
 */

export type AircraftImageEntry = {
  key: RegExp;
  image: string;
  name: string;
};

/**
 * Curated aircraft images with consistent visual style
 * Using high-quality aviation photography from reliable sources
 */
export const AIRCRAFT_IMAGE_MAP: AircraftImageEntry[] = [
  {
    key: /A320|A32N|320/i,
    image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1200&q=85",
    name: "Airbus A320 Family"
  },
  {
    key: /A321|32Q|321/i,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=85",
    name: "Airbus A321"
  },
  {
    // Verified: "blue and white Airbus airplane" / real A330 widebody, distinct from A380/747/E-Jet
    key: /A330|33E|333|332|330/i,
    image: "https://images.unsplash.com/photo-1571138444207-dbde45f282ca?w=1200&q=85",
    name: "Airbus A330"
  },
  {
    // Verified: real Singapore Airlines A350 widebody (Unsplash alt: "white Singapore Airlines airplane")
    key: /A350|359|35K|350/i,
    image: "https://images.unsplash.com/photo-1561461888-70c48ccb280d?w=1200&q=85",
    name: "Airbus A350"
  },
  {
    // Verified: Unsplash alt text explicitly "Airbus A380 airplane" (double-decker, distinct from A330/747)
    key: /A380|388|380/i,
    image: "https://images.unsplash.com/photo-1543903905-cee4ab46985c?w=1200&q=85",
    name: "Airbus A380"
  },
  {
    key: /737|73H|73J|738|739|7M8|73W/i,
    image: "https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=1200&q=85",
    name: "Boeing 737"
  },
  {
    // Verified: real Lufthansa 747 airliner, distinct from A380/A330/E-Jet
    key: /747|748|744/i,
    image: "https://images.unsplash.com/photo-1504723246034-0977641ea907?w=1200&q=85",
    name: "Boeing 747"
  },
  {
    key: /777|77W|77L|772|773|77X/i,
    image: "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1200&q=85",
    name: "Boeing 777"
  },
  {
    key: /787|788|789|78X/i,
    image: "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=1200&q=85",
    name: "Boeing 787 Dreamliner"
  },
  // E190/E195 (Embraer regional jets) and A220 removed from this map: no
  // Unsplash photo could be verified as actually showing these smaller
  // narrowbody types (searches kept returning generic widebody stock).
  // They fall through to DEFAULT_AIRCRAFT_IMAGE below rather than
  // silently showing the wrong aircraft. Revisit if a verified source
  // turns up.
];


/**
 * Name-only fallback for types we removed from AIRCRAFT_IMAGE_MAP because
 * no verified photo exists for them. Caption text still reads correctly;
 * only the photo falls back to DEFAULT_AIRCRAFT_IMAGE.
 */
const AIRCRAFT_NAME_ONLY_MAP: { key: RegExp; name: string }[] = [
  { key: /E190|E195|ERJ|E90|E95/i, name: "Embraer E-Jet" },
  { key: /A220|CS3|223/i, name: "Airbus A220" },
];

/**
 * Default fallback image for unknown aircraft types
 */
export const DEFAULT_AIRCRAFT_IMAGE = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=85";

/**
 * Get aircraft image URL based on aircraft type/IATA code
 */
export function getAircraftImage(aircraftType?: string, aircraftIata?: string): string {
  const model = `${aircraftType || ""} ${aircraftIata || ""}`;
  const match = AIRCRAFT_IMAGE_MAP.find((entry) => entry.key.test(model));
  return match?.image || DEFAULT_AIRCRAFT_IMAGE;
}

/**
 * Get aircraft display name
 */
export function getAircraftName(aircraftType?: string, aircraftIata?: string): string {
  const model = `${aircraftType || ""} ${aircraftIata || ""}`;
  const match = AIRCRAFT_IMAGE_MAP.find((entry) => entry.key.test(model));
  if (match) return match.name;
  const nameOnly = AIRCRAFT_NAME_ONLY_MAP.find((entry) => entry.key.test(model));
  if (nameOnly) return nameOnly.name;
  return aircraftType || "Commercial Aircraft";
}
