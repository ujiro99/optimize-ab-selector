import { ExperimentInCookie, ExperimentType } from "@/@types/googleOptimize.d";
import { EXPERIMENT_TYPE, ExperimentExpireDefault } from "@/utils/constants";
import Log from "@/services/log";
import Cookie from "@/services/cookie";

/** Key name of Google Optimize cookie */
const GO_COOKIE_KEY = "_gaexp";

/** Prefix value added to the Google Optimize cookie value */
const GO_PREFIX_12 = "GAX1.2.";
const GO_PREFIX_13 = "GAX1.3.";

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

  return experiments;
}

/**
 * Switch a patterns of experiment.
 *
 * @param {string} url Target page url.
 * @param {ExperimentInCookie[]} switchPatterns New patterns.
 */
export async function switchPatterns(
  url: string,
  switchPatterns: ExperimentInCookie[]
) {
  // Log.d(`set Pattern: ${url} ${testId} ${patternNumber}`);

  // Get pattern number.
  const { value, domain } = await Cookie.get({
    url: url,
    name: GO_COOKIE_KEY,
  });
  const experiments = parseGaexp(value);

  // update experiments to new patterns.
  switchPatterns.forEach((sw) => {
    const target = experiments.find((exp) => exp.testId === sw.testId);
    if (target) {
      target.pattern = sw.pattern;
    } else {
      experiments.push({
        testId: sw.testId,
        type: undefined,
        expire: ExperimentExpireDefault,
        pattern: sw.pattern,
      });
    }
  });

  // Generate new cookie value.
  const prefix = parsePrefix(value)
  let generated = experiments
    .map((exp) => `${exp.testId}.${exp.expire}.${exp.pattern}`)
    .join("!");
  generated = prefix + generated;

  Log.d(`set Cookie: ${generated}`);
  return Cookie.set({
    name: GO_COOKIE_KEY,
    domain: domain,
    value: generated,
    url: url,
  });
}

/**
 * Parse a prefix of _gaexp on cookie.
 */
function parsePrefix(value: string): string {
  const m = value.match(new RegExp(`${GO_PREFIX_12}|${GO_PREFIX_13}`))
  return m[0]
}

/**
 * Parse a value of _gaexp on cookie.
 */
function parseGaexp(value: string): ExperimentInCookie[] {
  //
  // value example:
  //  - GAX1.3.-f48SgmLRl2mLm7ERqfkUg.19059.1
  //  - GAX1.3.-f48SgmLRl2mLm7ERqfkUg.19059.1!FEJwvaarSEWFcD8-VljYcA.19059.1
  //  - GAX1.2.6VCqQqb7TgaiXm97jv8fWg.19062.1!k8OcJx9eT-m4yZBVMSB0bg.19063.1
  //
  const prefix = parsePrefix(value)
  value = value.slice(value.indexOf(prefix) + prefix.length);
  return value.split("!").map((e) => {
    const es = e.split(".");
    let experimentType: ExperimentType = EXPERIMENT_TYPE.AB;
    if (es[2].indexOf("-") > 0) {
      experimentType = EXPERIMENT_TYPE.MVT;
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
