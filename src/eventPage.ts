import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d";
import { IconStatus } from "@/utils/constants";

import Log from "@/services/log";
import Storage from "@/services/storage";
import * as Optimize from "@/services/googleOptimize";

type IconStatus = typeof IconStatus[keyof typeof IconStatus];

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
  switchPatterns(param: any, sendResponse: Function) {
    const url = param.url;
    const patterns: ExperimentPattern[] = param.patterns;
    let switchPatterns: Optimize.SwitchPattern[] = patterns.map((p) => {
      return {
        testId: p.testId,
        sectionName: p.sectionName,
        patternNumber: p.number,
      };
    });

    Optimize.switchPatterns(url, switchPatterns).then(() => {
      sendResponse(true);
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
    chrome.action.setBadgeText({
      text: "!",
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#555555",
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
   * Set extension icon status.
   */
  setIconStatus(param: any, sendResponse: Function) {
    const status: IconStatus = param.status;
    if (status === IconStatus.Active) {
      chrome.action.setIcon(
        {
          path: {
            "16": "img/icon16.png",
            "48": "img/icon48.png",
            "128": "img/icon128.png",
          },
        },
        () => {
          sendResponse();
        }
      );
    } else {
      chrome.action.setIcon(
        {
          path: {
            "16": "img/icon_gray16.png",
            "48": "img/icon_gray48.png",
            "128": "img/icon_gray128.png",
          },
        },
        () => {
          sendResponse();
        }
      );
    }
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

  /**
   * Remove text from extension badge.
   */
  clearBadge(_: any, __: Function) {
    chrome.action.setBadgeText({
      text: "",
    });
    chrome.action.setBadgeBackgroundColor({
      color: "",
    });
    return false;
  },
};

chrome.tabs.onActivated.addListener(function (event) {
  chrome.action.setBadgeText({
    text: "",
  });
  chrome.tabs.sendMessage(event.tabId, "checkBadge");
});
