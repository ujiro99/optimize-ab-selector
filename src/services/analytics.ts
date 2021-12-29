import Log from "@/services/log";

type GaEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
};

export const Analytics = {
  init(appName: string, trackingId: string) {
    const service = analytics.getService(appName);
    window.tracker = service.getTracker(trackingId);
  },

  sendEvent(params: GaEvent) {
    if (!window.tracker) return;
    if (params == null) return;
    window.tracker.sendEvent(
      params.category,
      params.action,
      params.label,
      params.value
    );
    Log.d(`GA: sendEvent ${params.category} ${params.action} ${params.label} ${params.value}`)
  },

  sendScreenView(description: string) {
    if (!window.tracker) return;
    if (description == null) return;
    window.tracker.sendAppView(description);
    Log.d(`GA: sendScreenView ${description}`)
  },
};
