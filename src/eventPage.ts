import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d";

import Log from "@/log";
import Storage from "@/storage";
import * as Optimize from "@/googleOptimize";

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  // do not use async/await here !

  const command = request.command;
  const param = request.parameter;

  Log.d("command: " + command);
  Log.d(param);

  // onMessage must return "true" if response is async.
  let func = onMessageFuncs[command];
  if (func) {
    return func(param, sendResponse);
  }
  Log.w("command not found: " + command);

  return false;
});

const onMessageFuncs = {
  /**
   * Returns Lists of experiment founds in Cookie.
   */
  currentExperiments(param: any, sendResponse: Function) {
    // find experiments in Cookie.
    Optimize.list(param.url).then((experiments) => {
      sendResponse(experiments);
    });
    return true;
  },

  /**
   * Switch a pattern of experiment.
   */
  switchPattern(param: any, sendResponse: Function) {
    const url = param.url;
    const patterns = param.patterns;
    let p: Promise<any> = Promise.resolve();
    patterns.forEach((pattern: ExperimentPattern) => {
      p = p.then(() => {
        Optimize.switchPattern(url, pattern.testId, pattern.number);
        sendResponse(true);
      });
    });

    return true;
  },

  /**
   * Add and save experiment to chrome storage.
   */
  addExperiment(param: any, sendResponse: Function) {
    if (param == null) {
      Log.w("experiment is null");
    }

    // show icon
    chrome.browserAction.setBadgeText({
      text: "!",
    });

    // save experiment to chrome storage.
    const newExperiment = param.experiment;
    Storage.get("experiments").then((experiments: Experiment[]) => {
      experiments = experiments || [];
      experiments = experiments.filter(
        (e) => e.testId !== newExperiment.testId
      );
      experiments.push(newExperiment);
      Storage.set("experiments", experiments).then(() => {
        sendResponse(true);
      });
    });

    return true;
  },

  /**
   * Get saved experiments form chrome storage.
   */
  getSavedExperiments(_: any, sendResponse: Function) {
    Storage.get("experiments").then((experiments) => {
      sendResponse(experiments);
    });

    return true;
  },

  /**
   * Remove all data in chrome storage.
   */
  clearStorage(_: any, sendResponse: Function) {
    Storage.clear().then((res) => {
      sendResponse(res);
    });

    return true;
  },
};

chrome.tabs.onActivated.addListener(function () {
  chrome.browserAction.setBadgeText({
    text: "",
  });
});
