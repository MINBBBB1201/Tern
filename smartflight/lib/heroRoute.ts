import { getAirport } from "./airportData";

export type HeroRouteEnd = { iata: string; city: string; lat: number; lon: number };

const listeners = new Set<() => void>();

/**
 * Live route for the hero globe and boarding pass. SearchBar writes on
 * every origin/destination change; HeroGlobe polls `version` once per
 * frame and rebuilds the drawn arc when it moves. Deliberately NOT React
 * state: the main consumer is a per-frame WebGL loop, and routing a
 * text-field keystroke through the React tree into the canvas would
 * re-render the page for something only a shader-adjacent buffer cares
 * about. DOM consumers that do need reactivity (the static boarding
 * pass) subscribe via `subscribe` + `version` (useSyncExternalStore).
 *
 * Defaults match SearchBar's initial ICN → LHR so everything is correct
 * before the user touches anything.
 */
export const heroRoute = {
  version: 0,
  from: { iata: "ICN", city: "Seoul", lat: 37.469, lon: 126.451 } as HeroRouteEnd,
  to: { iata: "LHR", city: "London", lat: 51.47, lon: -0.454 } as HeroRouteEnd,
  /** Update from IATA codes; unknown codes keep the last valid route. */
  set(fromIata: string, toIata: string) {
    const from = fromIata.trim().toUpperCase();
    const to = toIata.trim().toUpperCase();
    if (from === this.from.iata && to === this.to.iata) return;
    const f = getAirport(from);
    const t = getAirport(to);
    if (!f || !t || from === to) return;
    this.from = { iata: from, city: f.city, lat: f.lat, lon: f.lon };
    this.to = { iata: to, city: t.city, lat: t.lat, lon: t.lon };
    this.version++;
    listeners.forEach((l) => l());
  },
  /** Change notification for DOM consumers (returns unsubscribe). */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
