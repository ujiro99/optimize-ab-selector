import * as ReactDOM from "react-dom";
import Popup from "@/popup/Popup";
import PopupOptimize from "@/popup/PopupOptimize";
import PopupOther from "@/popup/PopupOther";

import "@/utils/workaround";

import { Experiment, ExperimentInCookie } from "@/@types/googleOptimize.d";

import Tabs from "@/services/tabs";
import Storage, { STORAGE_KEY } from "@/services/storage";
import { Analytics } from "@/services/analytics";

import { AppName, TrackingId } from "@/utils/constants";
import { checkOptimizeOpen } from "@/utils/utility";

async function initPopup() {
  // initialize google analytics
  const options = await Storage.get(STORAGE_KEY.options);
  Analytics.init(AppName, TrackingId, options.tracking_permitted);

  const tab = await Tabs.getCurrentTab();

  const inOptimize = checkOptimizeOpen(tab.url);

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
              tabId: tab.id
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
