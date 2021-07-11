import { Experiment } from "@/@types/googleOptimize.d"
import { ExperimentStatus } from "@/constants";
import Log from "@/log";
import Cookie from "@/cookie";

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
export async function list(url: string): Promise<Experiment[]> {
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
    Log.d(
      `id: ${expe.testId}, pattern: ${expe.patterns[0].number}`
    );
  }

  // if (typeof dataLayer !== "undefined") {
  //   initializeOtimizeCallback();
  // }

  return experiments;
}

/**
 * Switch a pattern of experiment.
 *
 * @param {string} url Target page url.
 * @param {string} testId Test id on Google Optimize.
 * @param {number} patternNumber Pattern No on Google Optimize.
 */
export async function switchPattern(
  url: string,
  testId: string,
  patternNumber: number
) {
  Log.d(`set Pattern: ${url} ${testId} ${patternNumber}`);

  // Set pattern number.
  const { value, domain } = await Cookie.get({
    url: url,
    name: GO_COOKIE_KEY,
  });
  const experiments = parseGaexp(value);
  const target = experiments.find((exp) => exp.testId === testId);
  target.patterns = [
    {
      testId: testId,
      name: undefined,
      number: patternNumber,
    },
  ];

  // Generate new cookie value.
  let generated = experiments
    .map((expe) => `${expe.testId}.${expe.expire}.${expe.patterns[0].number}`)
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
function parseGaexp(value: string): Experiment[] {
  value = value.slice(value.indexOf(GO_PREFIX) + GO_PREFIX.length);
  return value.split("!").map((e) => {
    const es = e.split(".");
    return {
      testId: es[0],
      name: "",
      patterns: [
        {
          testId: es[0],
          name: undefined,
          number: +es[2], // to be number
        },
      ],
      expire: +es[1], // to be number
      targetUrl: undefined,
      optimizeUrl: undefined,
      editorPageUrl: undefined,
      status: ExperimentStatus.Running
    };
  });
}

/**
 * Determine if the URL of the Google Optimize page is the same page.
 * @param {string} a First url.
 * @param {string} b Second url.
 */
export function equalsOptimizeUrl(a:string, b:string) {
  if (!a || !b) { return false; }
  const hashA = (new URL(a)).hash.replace("/report", "");
  const hashB = (new URL(b)).hash.replace("/report", "");
  return hashA === hashB
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
