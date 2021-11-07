import * as React from "react";
import * as ReactDOM from "react-dom";
import Popup from "@/popup/Popup";
import PopupOptimize from "@/popup/PopupOptimize";
import PopupOther from "@/popup/PopupOther";

import "@/utils/workaround";

import { Experiment, ExperimentInCookie } from "@/@types/googleOptimize.d";

import Tabs from "@/services/tabs";

async function initPopup() {
  const tab = await Tabs.getCurrentTab();

  const inOptimize = tab.url.match(/optimize.google.com/) != null;

  const renderOptimize = (savedExperiments: Experiment[]) => {
    ReactDOM.render(
      <PopupOptimize url={tab.url} tabId={tab.id} saved={savedExperiments} />,
      document.getElementById("popup")
    );
  };

  const renderOther = (savedExperiments: Experiment[]) => {
    ReactDOM.render(
      <PopupOther url={tab.url} tabId={tab.id} saved={savedExperiments} />,
      document.getElementById("popup")
    );
  };

  const renderPopup = (
    savedExperiments: Experiment[],
    currentExperiments: ExperimentInCookie[]
  ) => {
    ReactDOM.render(
      <Popup
        url={tab.url}
        tabId={tab.id}
        saved={savedExperiments}
        current={currentExperiments}
      />,
      document.getElementById("popup")
    );
  };

  chrome.runtime.sendMessage(
    {
      command: "getSavedExperiments",
    },
    function (savedExperiments) {
      if (inOptimize) {
        renderOptimize(savedExperiments);
      } else {
        chrome.runtime.sendMessage(
          {
            command: "currentExperiments",
            parameter: {
              url: tab.url,
            },
          },
          function (currentExperiments) {
            if (currentExperiments && currentExperiments.length > 0) {
              renderPopup(savedExperiments, currentExperiments);
            } else {
              renderOther(savedExperiments);
            }
          }
        );
      }
    }
  );
}

initPopup();
