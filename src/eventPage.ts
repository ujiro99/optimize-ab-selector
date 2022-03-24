import { Experiment, ExperimentInCookie } from "@/@types/googleOptimize.d";
import * as EventPage from "@/@types/eventPage.d";
import { IconStatus } from "@/utils/constants";

import Log from "@/services/log";
import Storage, { STORAGE_KEY } from "@/services/storage";
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
    Optimize.list(param.url, param.tabId).then((experiments) => {
      sendResponse(experiments);
    });
    return true;
  },

  /**
   * Switch a pattern of experiment.
   */
  switchPatterns(param: EventPage.switchPatternsParam, sendResponse: Function) {
    const url = param.url;
    const tabId = param.tabId;
    const switchPatterns: ExperimentInCookie[] = param.patterns;

    Optimize.switchPatterns(url, tabId, switchPatterns).then(() => {
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
    chrome.action.setIcon({
      path: {
        "16": "img/icon16.png",
        "48": "img/icon48.png",
        "128": "img/icon128.png",
      },
    });

    // save experiment to chrome storage.
    const newExperiment = param.experiment;
    Storage.get(STORAGE_KEY.experiments).then((experiments: Experiment[]) => {
      experiments = experiments || [];
      const old = experiments.find((e) => e.testId === newExperiment.testId);
      const isNew = old == null;
      if (!isNew) {
        experiments = experiments.filter(
          (e) => e.testId !== newExperiment.testId
        );
      }
      experiments.push(newExperiment);
      Storage.set(STORAGE_KEY.experiments, experiments).then(() => {
        const changed = isNew || newExperiment.status !== old.status
        sendResponse(changed);
      });
    });

    return true;
  },

  /**
   * Get saved experiments form chrome storage.
   */
  getSavedExperiments(_: any, sendResponse: Function) {
    Storage.get(STORAGE_KEY.experiments).then((experiments) => {
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

    const text: string = param.text;
    if (text) {
      chrome.action.setBadgeText({
        text: text,
      });
      chrome.action.setBadgeBackgroundColor({
        color: "#555555",
      });
    }
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
