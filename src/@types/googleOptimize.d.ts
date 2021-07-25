import { ExperimentStatus } from "@/constants";

/**
 * Information of an experiment
 */
interface Experiment {
  testId: string;
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
  name: string;
  number: number;
}

/**
 * Experiment status type.
 */
type ExperimentStatus = typeof ExperimentStatus[keyof typeof ExperimentStatus];
