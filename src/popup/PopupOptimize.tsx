import React, { useState } from "react";
import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d";
import { ExperimentStatus } from "@/constants";
import { equalsOptimizeUrl } from "@/googleOptimize";
import { ExperimentsTable } from "@/components/ExperimentsTable";
import { Help } from "@/components/Help";
import { Accordion } from "@/components/Accordion";
import Log from "@/log";
import * as i18n from "@/i18n";

import "@/popup/Popup.scss";

export default function PopupOptimize(props: any) {
  const url = props.url;

  const savedExperiments: Experiment[] = props.saved || [];
  const activeExperiments: Experiment[] = savedExperiments
    .filter((s) => s.status === ExperimentStatus.Running)
    .sort((a) => (equalsOptimizeUrl(url, a.optimizeUrl) ? -1 : 1));
  const finishedExperiments: Experiment[] = savedExperiments
    .filter(
      (s) =>
        s.status === ExperimentStatus.Archived ||
        s.status === ExperimentStatus.Ended
    )
    .sort((a) => (equalsOptimizeUrl(url, a.optimizeUrl) ? -1 : 1));

  Log.d("url: " + url);

  const [helpVisible, setHelpVisible] = useState(false);

  function ExperimentPatterns(props: any) {
    const patterns: ExperimentPattern[] = props.patterns;
    return (
      <ol className="patterns__list">
        {patterns.map((p) => (
          <li key={p.name || p.number}>{p.name}</li>
        ))}
      </ol>
    );
  }

  function toggleHelp() {
    setHelpVisible(!helpVisible);
  }

  /**
   * Delete all saved data.
   */
  function clearStorage() {
    if (window.confirm(i18n.t("labelClear"))) {
      chrome.runtime.sendMessage(
        {
          command: "clearStorage",
        },
        () => {
          Log.d("clearStorage finished");
          window.close();
        }
      );
    }
  }

  // Show popup window.
  return (
    <div className="popupContainer">
      <div className="active-experiments">
        <svg className="icon experiments-table__caption-icon">
          <use xlinkHref="/img/icons.svg#icon-sunny-outline" />
        </svg>
        <span className="experiments-table__caption">Active Experiments</span>
        <ExperimentsTable
          url={url}
          experiments={activeExperiments}
          experimentPatterns={ExperimentPatterns}
        />
      </div>

      <div className="finished-experiments">
        <svg className="icon experiments-table__caption-icon">
          <use xlinkHref="/img/icons.svg#icon-check-circle" />
        </svg>
        <span className="experiments-table__caption">Finished Experiments</span>
        <ExperimentsTable
          url={url}
          experiments={finishedExperiments}
          experimentPatterns={ExperimentPatterns}
        />
      </div>

      <div className="experiments-buttons">
        <button className="experiments-help" onClick={toggleHelp}>
          {i18n.t("btnHelp")}
        </button>
        <button className="experiments-update" onClick={clearStorage}>
          {i18n.t("btnClear")}
        </button>
      </div>

      <Accordion isOpen={helpVisible}>
        <Help />
        <button
          className="experiments-help__close"
          onClick={() => setHelpVisible(false)}
        >
          {i18n.t("btnHelpClose")}
        </button>
      </Accordion>
    </div>
  );
}
