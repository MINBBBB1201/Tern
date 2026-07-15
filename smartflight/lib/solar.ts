/**
 * Solar position approximation — no dependencies.
 *
 * Spencer (1971) Fourier series for solar declination and the equation of
 * time (the same series NOAA's solar calculator uses for its quick form):
 * declination accurate to ~0.01°–0.2°, EoT to ~0.6 min across the year.
 * That is far tighter than one pixel of terminator position on a small
 * hero globe, so no astronomy library is warranted.
 *
 * Consumers: HeroGlobe (civil-twilight terminator), and eventually the
 * airport-guide local-sky background (Stage 1.5 item 4).
 */

export type SubsolarPoint = {
  /** Geographic latitude of the subsolar point, degrees (= solar declination). */
  latDeg: number;
  /** Geographic longitude of the subsolar point, degrees east-positive. */
  lonDeg: number;
  /** Equation of time in minutes (true solar time − mean solar time). */
  eotMinutes: number;
};

/** The point on Earth where the sun is at zenith right now. */
export function subsolarPoint(date: Date): SubsolarPoint {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - yearStart) / 86_400_000); // 0-based
  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Fractional year (radians); Spencer's series is phased from Jan 1.
  const g = ((2 * Math.PI) / 365) * (dayOfYear + (utcHours - 12) / 24);

  const declRad =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);

  const eotMinutes =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));

  // Subsolar meridian: where true solar time is 12:00. True solar time at
  // Greenwich is UTC + EoT, and the sun moves west at 15°/h, so the
  // subsolar longitude (east-positive) is:
  let lonDeg = (12 - (utcHours + eotMinutes / 60)) * 15;
  lonDeg = ((lonDeg + 540) % 360) - 180; // normalize to (-180, 180]

  return { latDeg: (declRad * 180) / Math.PI, lonDeg, eotMinutes };
}

/**
 * Sine of the sun's elevation at a geographic point — positive in
 * daylight, in [−sin(6°), 0) during civil twilight, below that at night.
 */
export function sinSolarElevation(latDeg: number, lonDeg: number, date: Date): number {
  const sp = subsolarPoint(date);
  const lat = (latDeg * Math.PI) / 180;
  const sLat = (sp.latDeg * Math.PI) / 180;
  const dLon = ((lonDeg - sp.lonDeg) * Math.PI) / 180;
  return Math.sin(lat) * Math.sin(sLat) + Math.cos(lat) * Math.cos(sLat) * Math.cos(dLon);
}
