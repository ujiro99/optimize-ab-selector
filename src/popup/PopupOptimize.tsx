import React, { useState } from "react";
import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d";
import { ExperimentStatus } from "@/constants";
import { equalsOptimizeUrl } from "@/googleOptimize";
import { TableBody } from "@/popup/Popup";

import "./Popup.scss";
import Log from "../log";

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

  function Table(props: any) {
    const experiments = props.experiments;
    const title = props.title;
    return (
      <table className="experiments-table">
        <caption className="experiments-table__caption">{title}</caption>
        <thead>
          <tr>
            <th className="experiments-table__name">Name</th>
            <th className="experiments-table__target-url">Editor Page</th>
            <th className="experiments-table__pattern">Patterns</th>
          </tr>
        </thead>
        <TableBody
          url={url}
          experiments={experiments}
          experimentPatternsComponent={ExperimentPatterns}
        />
      </table>
    );
  }

  /**
   * Delete all saved data.
   */
  function clearStorage() {
    chrome.runtime.sendMessage(
      {
        command: "clearStorage",
      },
      () => {
        Log.d("clearStorage finished");
      }
    );
  }

  // Show popup window.
  return (
    <div className="popupContainer">
      <Table title="Saved Experiments" experiments={activeExperiments} />
      <Table title="Finished Experiments" experiments={finishedExperiments} />
      <button className="experiments-update" onClick={clearStorage}>
        Clear
      </button>
    </div>
  );
}
