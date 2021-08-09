import { ExperimentStatus, ExperimentType } from "@/utils/constants";

/**
 * Information of an experiment
 */
interface Experiment {
  testId: string;
  type: ExperimentType,
  name: string;
  patterns: ExperimentPattern[];
  expire: number;
  targetUrl: string;
  optimizeUrl: string;
  editorPageUrl: string;
  status: ExperimentStatus;
}

/**
 * Information of an pattern of experiment
 */
interface ExperimentPattern {
  testId: string;
  sectionName: string;
  name: string;
  number: number;
}

/**
 * Experiment status type.
 */
type ExperimentStatus = typeof ExperimentStatus[keyof typeof ExperimentStatus];

/**
 * Experiment type type.
 */
type ExperimentType = typeof ExperimentType[keyof typeof ExperimentType]
