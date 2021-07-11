import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d"
import { ExperimentStatus } from "@/constants"

import Log from "./log";

/**
 * Parse the DOM and extract Experiment information.
 */
function parse(): Experiment {
  const experiment: Experiment = {
    name: undefined,
    testId: undefined,
    patterns: undefined,
    expire: undefined,
    targetUrl: undefined,
    optimizeUrl: undefined,
    editorPageUrl: undefined,
    status: ExperimentStatus.None,
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

  // patterns
  const patternDoms = document.querySelectorAll(".opt-variation-name");
  const patterns: ExperimentPattern[] = [];
  patternDoms.forEach((p, index) => {
    patterns.push({
      testId: experiment.testId,
      name: p.innerHTML.trim(),
      number: index,
    });
    Log.d("pattern name: " + p.innerHTML);
  });
  experiment.patterns = patterns;

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
    { status: ExperimentStatus.Finished, iconName: "ic_status_ended_white" },
    { status: ExperimentStatus.Archived, iconName: "archive" },
    { status: ExperimentStatus.Draft, iconName: "error_outline" },
    { status: ExperimentStatus.Scheduled, iconName: "access_time" },
    { status: ExperimentStatus.Running, iconName: "ic_status_running_white" },
  ];

  for (let i = 0; i < statusDefine.length; i++) {
    const icon = document.querySelector(
      '[md-svg-icon="' + statusDefine[i].iconName + '"]'
    );
    if (icon != null) {
      experiment.status = statusDefine[i].status;
      Log.d("scheduled: " + experiment.name);
      break;
    }
  }

  return experiment;
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

let isFound = false;
const dialogObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (isHidden(mutation.target) && !isFound) {
      const experiment = parse();
      if (experiment != null) {
        chrome.runtime.sendMessage({
          command: "addExperiment",
          parameter: {
            experiment: experiment,
          },
        });
        isFound = true;
        dialogObserver.disconnect();
      }
    }
  });
});

window.addEventListener(
  "hashchange",
  function () {
    Log.d("The hash has changed.");
    const navLink = document.querySelector("#suite-top-nav .md-nav-bar a");
    if (navLink != null) {
      if (navLink.className.match(/md-active/) != null) {
        // The DOM is updated asynchronously.
        // Monitor the loading dialog, and parse after the DOM is updated.
        const dialog = document.getElementsByClassName("opt-busy-dialog")[0];
        if (dialog != null) {
          Log.d("start dialog observer.");
          isFound = false;
          dialogObserver.observe(dialog, {
            attributes: true,
            attributeFilter: ["class"],
          });
        }
      }
    }
  },
  false
);
