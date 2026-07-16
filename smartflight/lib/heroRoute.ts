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
  /** Update from IATA codes. Each end resolves independently: an unknown
   *  code keeps that end's last valid airport instead of vetoing the whole
   *  update, so a stale/invalid value in one field can never block a valid
   *  change in the other. */
  set(fromIata: string, toIata: string) {
    const from = fromIata.trim().toUpperCase();
    const to = toIata.trim().toUpperCase();
    const f = getAirport(from);
    const t = getAirport(to);
    const nextFrom: HeroRouteEnd = f ? { iata: from, city: f.city, lat: f.lat, lon: f.lon } : this.from;
    const nextTo: HeroRouteEnd = t ? { iata: to, city: t.city, lat: t.lat, lon: t.lon } : this.to;
    if (nextFrom.iata === nextTo.iata) return; // degenerate route
    if (nextFrom.iata === this.from.iata && nextTo.iata === this.to.iata) return;
    this.from = nextFrom;
    this.to = nextTo;
    this.version++;
    listeners.forEach((l) => l());
  },
  /** Change notification for DOM consumers (returns unsubscribe). */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
