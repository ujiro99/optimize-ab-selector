import React, { useState } from "react";

import "./Popup.scss";
import Log from "../log";

export default function PopupOptimize(props: any) {
  const url = props.url;
  const tabId = props.tabId;
  const savedExperiments: Experiment[] = props.saved || [];
  const activeExperiments: Experiment[] = savedExperiments
    .filter((s) => !s.finished)
    .sort((a, b) => {
      Log.d(url.match(a.optimizeUrl));
      Log.d(url.match(b.optimizeUrl));
      if (url.match(a.optimizeUrl) != null) return -1;
      if (url.match(b.optimizeUrl) != null) return 1;
      return 0;
    });

  Log.d(url);
  Log.d(activeExperiments);

  function Patterns(props: any) {
    const patterns: ExperimentPattern[] = props.patterns;
    return (
      <ol>
        {patterns.map((p) => (
          <li key={p.name || p.number}>
            {p.number} {p.name}
          </li>
        ))}
      </ol>
    );
  }

  // Construct Google Optimize's information table.
  const tableBody = [];
  for (const expe of activeExperiments) {
    tableBody.push(
      <tr key={expe.testId}>
        <td>{expe.testId}</td>
        <td>{expe.name}</td>
        <td>
          <Patterns patterns={expe.patterns} />
        </td>
      </tr>
    );
  }

  // Show popup window.
  return (
    <div className="popupContainer">
      <table className="experiments-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>name</th>
            <th>pattern</th>
          </tr>
        </thead>
        <tbody>{tableBody}</tbody>
      </table>
    </div>
  );
}
