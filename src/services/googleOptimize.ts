import { ExperimentInCookie } from "@/@types/googleOptimize.d";
import { ExperimentType } from "@/utils/constants";
import Log from "@/services/log";
import Cookie from "@/services/cookie";

/** Key name of Google Optimize cookie */
const GO_COOKIE_KEY = "_gaexp";

/** Prefix value added to the Google Optimize cookie value */
const GO_PREFIX = "GAX1.2.";

/**
 * Returns Lists of experiment founds in Cookie.
 *
 * @param {string} url Target page url.
 * @returns {Promise<Experiment[]>}
 */
export async function list(url: string): Promise<ExperimentInCookie[]> {
  const cookie = await Cookie.get({
    url: url,
    name: GO_COOKIE_KEY,
  });

  if (cookie == null) {
    // Google optimize experiments doesn't exist on this page.
    return [];
  }

  const experiments = parseGaexp(cookie.value);
  for (const expe of experiments) {
    Log.d(`id: ${expe.testId}, pattern: ${expe.pattern}`);
  }

  // if (typeof dataLayer !== "undefined") {
  //   initializeOtimizeCallback();
  // }

  return experiments;
}

/**
 * @typedef {Object} SwitchPattern
 * @param {string} testId Test id on Google Optimize.
 * @param {string} sectionName Section name on Google Optimize.
 * @param {number} patternNumber Pattern no on Google Optimize.
 */
export type SwitchPattern = {
  testId: string;
  sectionName: string;
  patternNumber: number | string;
};

/**
 * Switch a patterns of experiment.
 *
 * @param {string} url Target page url.
 * @param {SwitchPattern[]} switchPatterns New patterns.
 */
export async function switchPatterns(
  url: string,
  switchPatterns: SwitchPattern[]
) {
  // Log.d(`set Pattern: ${url} ${testId} ${patternNumber}`);

  // Get pattern number.
  const { value, domain } = await Cookie.get({
    url: url,
    name: GO_COOKIE_KEY,
  });
  const experiments = parseGaexp(value);

  // For MVT, concat pattern numbers, group by testId and sectionName.
  switchPatterns = switchPatterns.reduce((acc, cur) => {
    const found = acc.find(
      (a) => a.testId === cur.testId && a.sectionName === cur.sectionName
    );
    if (found) {
      found.patternNumber += "-" + cur.patternNumber;
    } else {
      acc.push(cur);
    }
    return acc;
  }, []);

  // generate new patterns.
  let newExperiments = switchPatterns.map((sw) => {
    const target = experiments.find((exp) => exp.testId === sw.testId);
    if (target) {
      return {
        testId: sw.testId,
        expire: target.expire,
        patternNumber: sw.patternNumber,
      };
    } else {
      return {
        testId: sw.testId,
        expire: 18926,
        patternNumber: sw.patternNumber,
      };
    }
  });

  // Generate new cookie value.
  let generated = newExperiments
    .map((exp) => `${exp.testId}.${exp.expire}.${exp.patternNumber}`)
    .join("!");
  generated = GO_PREFIX + generated;

  Log.d(`set Cookie: ${generated}`);
  return Cookie.set({
    name: GO_COOKIE_KEY,
    domain: domain,
    value: generated,
    url: url,
  });
}

/**
 * Parse a value of _gaexp on cookie.
 */
function parseGaexp(value: string): ExperimentInCookie[] {
  value = value.slice(value.indexOf(GO_PREFIX) + GO_PREFIX.length);
  return value.split("!").map((e) => {
    const es = e.split(".");
    let experimentType = ExperimentType.AB;
    if (es[2].indexOf("-") > 0) {
      experimentType = ExperimentType.MVT;
    }
    return {
      testId: es[0],
      expire: +es[1], // to be number
      pattern: es[2],
      type: experimentType,
    };
  });
}

/**
 * Determine if the URL of the Google Optimize page is the same page.
 * @param {string} a First url.
 * @param {string} b Second url.
 */
export function equalsOptimizeUrl(a: string, b: string) {
  if (!a || !b) {
    return false;
  }
  const hashA = new URL(a).hash.replace("/report", "");
  const hashB = new URL(b).hash.replace("/report", "");
  return hashA === hashB;
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
