import * as React from "react";
import * as ReactDOM from "react-dom";
import Tabs from "@/tabs";
import Popup from "@/popup/Popup";
import PopupOptimize from "@/popup/PopupOptimize";

async function initPopup() {
  const tab = await Tabs.getCurrentTab();

  const inOptimize = tab.url.match(/optimize.google.com/) != null;

  if (inOptimize) {
    chrome.runtime.sendMessage(
      {
        command: "getSavedExperiments",
      },
      function (savedExperiments) {
        ReactDOM.render(
          <PopupOptimize
            url={tab.url}
            tabId={tab.id}
            saved={savedExperiments}
          />,
          document.getElementById("popup")
        );
      }
    );
  } else {
    chrome.runtime.sendMessage(
      {
        command: "currentExperiments",
        parameter: {
          url: tab.url,
        },
      },
      function (currentExperiments) {
        chrome.runtime.sendMessage(
          {
            command: "getSavedExperiments",
          },
          function (savedExperiments) {
            ReactDOM.render(
              <Popup
                url={tab.url}
                tabId={tab.id}
                current={currentExperiments}
                saved={savedExperiments}
              />,
              document.getElementById("popup")
            );
          }
        );
      }
    );
  }
}

initPopup();
