import { ExperimentStatus, ExperimentType } from "@/utils/constants";

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
interface ExperimentInCookie {
  testId: string;
  type: ExperimentType;
  expire: number;
  pattern: string;
}

/**
 * Experiment status type.
 */
type ExperimentStatus = typeof ExperimentStatus[keyof typeof ExperimentStatus];

/**
 * Experiment type type.
 */
type ExperimentType = typeof ExperimentType[keyof typeof ExperimentType];
