import Log from "./log";
import * as Optimize from "./googleOptimize";

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.optimizeList) {
    Log.d(request.url);
    Optimize.list(request.url).then((experiments) => {
      sendResponse(experiments);
    });
  }

  // onMessage must return "true" if response is async.
  return true;
});
