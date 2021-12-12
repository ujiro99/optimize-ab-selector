import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d";
import { EXPERIMENT_STATUS, EXPERIMENT_TYPE } from "@/utils/constants";

import * as i18n from "@/services/i18n";
import Log from "@/services/log";

import { showNotification } from "@/components/Notification";

const notificationElmId = "optimize-ab-selector-notification";

/**
 * Parse the DOM and extract Experiment information.
 */
function parse(): Experiment {
  const experiment: Experiment = {
    name: undefined,
    type: undefined,
    testId: undefined,
    patterns: undefined,
    expire: undefined,
    targetUrl: undefined,
    optimizeUrl: undefined,
    editorPageUrl: undefined,
    status: EXPERIMENT_STATUS.None,
  };

  const idDom = document.querySelector(".opt-ga-tracking-id");
  if (idDom != null) {
    experiment.testId = idDom.innerHTML.trim();
    Log.d("experiment id: " + idDom.innerHTML);
  } else {
    // stop parse.
    return;
  }

  const titleDom = document.querySelector("#suite-top-nav .opt-edit-text");
  if (titleDom != null) {
    experiment.name = titleDom.innerHTML.trim();
    Log.d("name: " + experiment.name);
  }

  // patterns - A/B
  const patternDoms = document.querySelectorAll(".opt-variation-name");
  const patterns: ExperimentPattern[] = [];
  patternDoms.forEach((p, index) => {
    patterns.push({
      testId: experiment.testId,
      sectionName: undefined,
      name: p.innerHTML.trim(),
      number: index,
    });
    Log.d("pattern name: " + p.innerHTML);
  });
  experiment.patterns = patterns;
  experiment.type = EXPERIMENT_TYPE.AB;

  // patterns - MVT
  if (patterns.length === 0) {
    experiment.type = EXPERIMENT_TYPE.MVT;

    // parse sections
    const mvtSections = document.querySelectorAll("opt-mvt-section");
    mvtSections.forEach((mvt) => {
      const sectionNameElm = mvt.querySelector(".opt-section-name");
      const sectionName = sectionNameElm.innerHTML.trim();
      Log.d("section name: " + sectionName);

      // parse patterns
      const mvtPatternElms = mvt.querySelectorAll(".opt-mvt-variation-name");
      mvtPatternElms.forEach((p, index) => {
        patterns.push({
          testId: experiment.testId,
          sectionName: sectionName,
          name: p.innerHTML.trim(),
          number: index,
        });
        Log.d("pattern name: " + p.innerHTML.trim());
      });
    });
  }

  // targetUrl
  const targetDom: HTMLElement = document.querySelector(".opt-predicate-value");
  if (targetDom != null) {
    experiment.targetUrl = targetDom.innerText.trim();
    Log.d("target: " + targetDom.innerText);
  }

  // editorPageUrl
  const editorPageUrldom: HTMLElement = document.querySelector(
    ".opt-experience-editor-url .opt-ellide"
  );
  if (editorPageUrldom != null) {
    experiment.editorPageUrl = editorPageUrldom.innerText.trim();
    Log.d("editor page url: " + experiment.editorPageUrl);
  }

  // optimizeUrl
  experiment.optimizeUrl = location.href;

  // status
  const statusDefine = [
    { status: EXPERIMENT_STATUS.Ended, iconName: "ic_status_ended_white" },
    { status: EXPERIMENT_STATUS.Archived, iconName: "archive" },
    { status: EXPERIMENT_STATUS.Draft, iconName: "error_outline" },
    { status: EXPERIMENT_STATUS.Scheduled, iconName: "access_time" },
    { status: EXPERIMENT_STATUS.Running, iconName: "ic_status_running_white" },
  ];

  for (let i = 0; i < statusDefine.length; i++) {
    const icon = document.querySelector(
      '[md-svg-icon="' + statusDefine[i].iconName + '"]'
    );
    if (icon != null) {
      experiment.status = statusDefine[i].status;
      Log.d("status: " + experiment.status);
      break;
    }
  }

  return experiment;
}

function tryParse() {
  const navLink = document.querySelector("#suite-top-nav .md-nav-bar a");
  if (navLink != null) {
    // The DOM is updated asynchronously.
    // Monitor the loading dialog, and parse after the DOM is updated.
    const dialog = document.getElementsByClassName("opt-busy-dialog")[0];
    if (dialog != null) {
      Log.d("start dialog observer.");
      dialogObserver.observe(dialog, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  } else {
    Log.d("nav-bar not found");
  }
}

/**
 * Types of notifications.
 */
const NOTIFICATION_TYPE = {
  DETECT_RUNNING: "DETECT_RUNNING",
  DETECT_ENDED: "DETECT_ENDED",
} as const;
type NotificationType =
  typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];

const NOTIFICATION_TITLE = {
  [NOTIFICATION_TYPE.DETECT_RUNNING]: i18n.t("detectSucceed"),
  [NOTIFICATION_TYPE.DETECT_ENDED]: i18n.t("detectEnded"),
};

/**
 * Show a notification on the page.
 *
 * @param {string} message Message displayed above the notification.
 */
function showNotify(type: NotificationType, message: string) {
  const n = document.getElementById(notificationElmId);
  if (n == null) {
    const elm = document.createElement("div");
    elm.id = notificationElmId;
    document.body.insertAdjacentElement("beforeend", elm);
  }
  showNotification(notificationElmId, {
    title: NOTIFICATION_TITLE[type],
    message: message,
  });
}

/**
 * Check the element is hidden.
 *
 * @param {Node} el
 */
function isHidden(el: Node) {
  var style = window.getComputedStyle(el as Element);
  return style.display === "none";
}

const dialogObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (isHidden(mutation.target)) {
      // When the loading dialog disappears, start parsing.
      const experiment = parse();
      if (experiment != null) {
        chrome.runtime.sendMessage(
          {
            command: "addExperiment",
            parameter: {
              experiment: experiment,
            },
          },
          (changed) => {
            if (!changed) {
              // No change detected.
              return;
            }
            switch (experiment.status) {
              case EXPERIMENT_STATUS.Running:
                // if detect a new experiment, show a notification.
                showNotify(NOTIFICATION_TYPE.DETECT_RUNNING, experiment.name);
                break;
              case EXPERIMENT_STATUS.Ended:
              case EXPERIMENT_STATUS.Archived:
                // if detect a ended experiment, show a notification.
                showNotify(NOTIFICATION_TYPE.DETECT_ENDED, experiment.name);
                break;
              default:
                Log.d("experiment added");
                break;
            }
          }
        );
      }
    }
  });
});

window.addEventListener("hashchange", function () {
  Log.d("The hash has changed.");
  chrome.runtime.sendMessage({
    command: "clearBadge",
  });
  tryParse(), false;
});

tryParse();
