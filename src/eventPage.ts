import Log from "./log";
import Storage from "./storage";
import * as Optimize from "./googleOptimize";

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  // do not use async/await here !

  const command = request.command;
  const param = request.parameter;

  Log.d("command: " + command);
  Log.d(param);

  // onMessage must return "true" if response is async.
  let isAsync = false;

  if (command === "currentExperiments") {
    // find experiments in Cookie.
    Optimize.list(param.url).then((experiments) => {
      sendResponse(experiments);
    });

    isAsync = true;
  } else if (command === "switchPattern") {
    const url = param.url;
    const patterns = param.patterns;
    let p: Promise<any> = Promise.resolve();
    patterns.forEach((pattern: ExperimentPattern) => {
      p = p.then(() =>
        Optimize.setPattern(url, pattern.testId, pattern.number)
      );
    });

    sendResponse(true);
    isAsync = true;
  } else if (command == "addExperiment") {
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

    isAsync = true;
  } else if (command == "getSavedExperiments") {
    Storage.get("experiments").then((experiments) => {
      sendResponse(experiments);
    });

    isAsync = true;
  } else if (command == "clearStorage") {
    Storage.clear().then((res) => {
      sendResponse(res);
    });

    isAsync = true;
  }

  return isAsync;
});

chrome.tabs.onActivated.addListener(function () {
  chrome.browserAction.setBadgeText({
    text: "",
  });
});
