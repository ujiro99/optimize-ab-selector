/**
 * Experiment status.
 */
export const EXPERIMENT_STATUS = {
  None: "None",
  Running: "Running",
  Scheduled: "Scheduled",
  Draft: "Draft",
  Ended: "Ended",
  Archived: "Archived",
};

/**
 * Experiment type.
 */
export const EXPERIMENT_TYPE = {
  AB: "AB",
  MVT: "MVT",
  PERSONALIZATION: "PERSONALIZATION",
} as const;

/**
 * Extension icon status.
 */
export const IconStatus = {
  Active: "Active",
  Unavailable: "Unavailable",
};

/**
 * Default expire time.
 */
export const ExperimentExpireDefault = 18926;

/** Google Analytics Tracking Id */
export const TrackingId = "UA-32234486-9"

/** App name */
export const AppName = "optimize-ab-selector"
