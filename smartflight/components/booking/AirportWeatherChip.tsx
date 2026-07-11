"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type AirportWeatherChipProps = {
  iataCode?: string;
};

type WeatherData = {
  tempC: number;
  condition: string;
  icon: string;
};

export function AirportWeatherChip({ iataCode }: AirportWeatherChipProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!iataCode) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off the weather fetch on iataCode change; loading must reset synchronously before the fetch starts
    setLoading(true);

    fetch(`/api/airport-weather?iata=${iataCode}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch(() => {
        if (!cancelled) setWeather(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [iataCode]);

  if (!iataCode || loading || !weather) return null;

  return (
    <span className="glass-chip data-mono inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-muted">
      <Image
        src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
        alt={weather.condition}
        width={16}
        height={16}
        unoptimized
      />
      {weather.tempC}°C
    </span>
  );
}
