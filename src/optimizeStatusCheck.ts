import { IconStatus } from "@/utils/constants";
import Log from "@/services/log";

/**
 * Check if the experiments exists, and update the extension icon.
 */
function checkBadge() {
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
