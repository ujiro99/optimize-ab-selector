import { ExperimentInCookie } from "@/@types/googleOptimize.d";
import { IconStatus } from "@/utils/constants";
import * as Optimize from "@/services/googleOptimize";
import Log from "@/services/log";

/**
 * Check if the experiments exists, and update the extension icon.
 */
function checkBadge() {
  const currentExperiments = getCurrentExperiment();
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

// When page is loaded
checkBadge();

// When tab is changed
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message === "checkBadge") {
    checkBadge();
    sendResponse();
  }
});

function getCookie(key: string) {
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    let cArray = c.split("=");
    cArray[0] = cArray[0].trim()
    if (cArray[0] == key) {
      return cArray[1];
    }
  }
}

function getCurrentExperiment(): ExperimentInCookie[] {
  const exp = getCookie(Optimize.GO_COOKIE_KEY);
  if (exp == null) return []
  return Optimize.parseGaexp(exp);
}
