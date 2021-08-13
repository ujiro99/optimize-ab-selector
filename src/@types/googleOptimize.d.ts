import { EXPERIMENT_STATUS, EXPERIMENT_TYPE } from "@/utils/constants";

/**
 * Experiment status type.
 */
type ExperimentStatus = typeof EXPERIMENT_STATUS[keyof typeof EXPERIMENT_STATUS];

/**
 * Experiment type type.
 */
type ExperimentType = typeof EXPERIMENT_TYPE[keyof typeof EXPERIMENT_TYPE];

/**
 * Information of an experiment.
 */
interface Experiment {
  testId: string;
  type: ExperimentType;
  expire: number;
  patterns: ExperimentPattern[];
  name: string;
  targetUrl: string;
  optimizeUrl: string;
  editorPageUrl: string;
  status: ExperimentStatus;
}

/**
 * Information of an pattern of experiment.
 */
interface ExperimentPattern {
  testId: string;
  sectionName: string;
  name: string;
  number: number | string;
}

/**
 * Information of an experiment in the cookie.
 */
export interface ExperimentInCookie {
  testId: string;
  type: ExperimentType;
  expire: number;
  pattern: string;
}
