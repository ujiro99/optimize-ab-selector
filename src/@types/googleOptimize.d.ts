/**
 * Information of an experiment
 */
interface Experiment {
  testId: string;
  name: string;
  patterns: ExperimentPattern[];
  expire: number;
  targetUrl: string;
  finished: boolean;
  optimizeUrl: string;
}

/**
 * Information of an pattern of experiment
 */
interface ExperimentPattern {
  testId: string;
  name: string;
  number: number;
}
