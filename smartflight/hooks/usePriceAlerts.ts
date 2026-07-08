"use client";

import { useCallback, useEffect, useState } from "react";
import type { PriceAlert } from "../lib/offerUtils";

type UsePriceAlertsParams = {
  from: string;
  to: string;
};

export function usePriceAlerts({ from, to }: UsePriceAlertsParams) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertPrice, setAlertPrice] = useState("");
  const [matchedAlert, setMatchedAlert] = useState<PriceAlert | null>(null);

  useEffect(() => {
    const savedAlerts = localStorage.getItem("priceAlerts");
    if (savedAlerts) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable post-mount; reading it in the initializer would cause an SSR/hydration mismatch
        setAlerts(JSON.parse(savedAlerts));
      } catch {
        setAlerts([]);
      }
    }
  }, []);

  const addAlert = () => {
    if (!alertPrice || isNaN(Number(alertPrice))) return;
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      from,
      to,
      targetPrice: Number(alertPrice),
      setDate: new Date().toLocaleDateString("en-US"),
    };
    const updated = [...alerts, newAlert];
    setAlerts(updated);
    localStorage.setItem("priceAlerts", JSON.stringify(updated));
    setAlertPrice("");
  };

  const deleteAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    localStorage.setItem("priceAlerts", JSON.stringify(updated));
  };

  const checkMatch = useCallback(
    (currentMinPrice: number | null) => {
      if (currentMinPrice === null) return;
      const match = alerts.find((a) => a.from === from && a.to === to && currentMinPrice <= a.targetPrice);
      if (match) setMatchedAlert(match);
    },
    [alerts, from, to]
  );

  return { alerts, alertPrice, setAlertPrice, matchedAlert, addAlert, deleteAlert, checkMatch };
}
