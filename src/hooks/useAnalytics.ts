import { useEffect, useState } from "react";
import { Analytics } from "@/services/analytics";

type GaEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
};

export function useGaEvent() {
  const [params, setParam] = useState<GaEvent>(null);
  useEffect(() => {
    Analytics.sendEvent(params);
  }, [params]);
  return setParam;
}

export function useGaView(description: string) {
  useEffect(() => {
    Analytics.sendScreenView(description);
  }, []);
}
