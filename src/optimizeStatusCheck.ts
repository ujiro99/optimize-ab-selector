import { IconStatus } from "@/constants";
import Log from "./log";

chrome.runtime.sendMessage(
  {
    command: "currentExperiments",
    parameter: {
      url: location.href,
    },
  },
  function (currentExperiments) {
    if (currentExperiments.length === 0) {
      Log.d("experiments not found");
      chrome.runtime.sendMessage({
        command: "setIconStatus",
        parameter: {
          status: IconStatus.Unavailable,
        },
      });
    } else {
      Log.d("experiments found");
      chrome.runtime.sendMessage({
        command: "setIconStatus",
        parameter: {
          status: IconStatus.Active,
        },
      });
    }
  }
);
