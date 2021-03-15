import Log from "./log";
import Cookie from "./cookie";

/** Key name of Google Optimize cookie */
const GO_COOKIE_KEY = "_gaexp";

/** Prefix value added to the Google Optimize cookie value */
const GO_PREFIX = "GAX1.2.";

/**
 * Information of an experiment
 */
interface Experiment {
  name: string;
  testId: string;
  pattern: number;
  expire: number;
}

/**
 * Returns Lists of experiment.
 * @returns Experiment[]
 */
export async function list(url: string): Promise<Experiment[]> {
  const { value } = await Cookie.get({
    url: url,
    name: GO_COOKIE_KEY,
  });

  const experiments = parseGaexp(value);
  for (const expe of experiments) {
    Log.d(`id: ${expe.testId}, pattern: ${expe.pattern}, name: ${expe.name}`);
  }

  // if (typeof dataLayer !== "undefined") {
  //   initializeOtimizeCallback();
  // }

  return experiments;
}

/**
 * Set a pattern no of experiment.
 * @param testId Test id on Google Optimize.
 * @param pattern Pattern No on Google Optimize.
 */
export async function set(testId: string, pattern: number) {
  // Set pattern number.
  const { value, domain } = await Cookie.get({
    url: location.href,
    name: GO_COOKIE_KEY,
  });
  const experiments = parseGaexp(value);
  const target = experiments.find((exp) => exp.testId === testId);
  target.pattern = pattern;

  // Generate new cookie value.
  let generated = experiments
    .map((expe) => `${expe.testId}.${expe.expire}.${expe.pattern}`)
    .join("!");
  generated = GO_PREFIX + generated;

  Cookie.set({
    name: GO_COOKIE_KEY,
    domain: domain,
    value: generated,
    url: location.href,
  });
}

// export function setName(testId, name) {}

function parseGaexp(value: string): Experiment[] {
  value = value.slice(value.indexOf(GO_PREFIX) + GO_PREFIX.length);
  return value.split("!").map((e) => {
    const es = e.split(".");
    return {
      name: "",
      testId: es[0],
      expire: +es[1], // to be number
      pattern: +es[2], // to be number
    };
  });
}

function initializeOtimizeCallback() {
  Log.d("start initializeOtimizeCallback.");

  function implementManyExperiments(value: string, name: string) {
    Log.d("value: " + value + " name: " + name);
  }
  function gtag(_: string, __: string, ___: object) {
    dataLayer.push(arguments);
  }
  gtag("event", "optimize.callback", {
    callback: implementManyExperiments,
  });

  if (typeof google_optimize !== "undefined") {
    initializeGoogleOptimize();
  }
}

function initializeGoogleOptimize() {
  Log.d("start initializeGoogleOptimize.");

  function delayedInitialization() {
    var value = google_optimize && google_optimize.get("<experiment_id_A>");
  }

  var hideEnd = dataLayer.hide.end;
  if (hideEnd) {
    dataLayer.hide.end = function () {
      delayedInitialization();
      hideEnd();
    };
  } else {
    delayedInitialization();
  }
}
