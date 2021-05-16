import React, { useState } from "react";

import "./Popup.scss";
import Tabs from "../tabs";
import Log from "../log";

export default function Popup(props: any) {
  const url = props.url;
  const tabId = props.tabId;
  const currentExperiments: Experiment[] = props.current || [];
  let savedExperiments: Experiment[] = props.saved || [];

  // Narrow down to experiments that currently target URLs
  savedExperiments = savedExperiments.filter((e) => {
    return url.match(e.targetUrl) != null && !e.finished;
  });

  // Merge experiments found in cookies
  for (const expe of currentExperiments) {
    const found = savedExperiments.find((a) => a.testId === expe.testId);
    if (found == null) {
      savedExperiments.push(expe);
    }
  }

  const [selectedPatterns, setSelectedPatterns] = useState(
    currentExperiments.map((c) => c.patterns[0])
  );

  /**
   * Request update a pattern.
   */
  function requestUpdate() {
    let parsed = new URL(url);
    chrome.runtime.sendMessage(
      {
        command: "switchPattern",
        parameter: {
          url: parsed.origin,
          patterns: selectedPatterns,
        },
      },
      () => {
        // Reload to reflect the changed cookie in the test.
        Tabs.reload(tabId);
      }
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

  function changePattern(e: any) {
    const copied: ExperimentPattern[] = Object.assign([], selectedPatterns);
    const pattern = copied.find((p) => p.testId === e.target.name);
    pattern.number = e.target.value;
    setSelectedPatterns(copied);
  }

  function Patterns(props: any) {
    const patterns: ExperimentPattern[] = props.patterns;
    const selected: number = props.selected;
    if (patterns.length === 1) {
      const expe = patterns[0];
      return (
        <input
          name={expe.testId}
          type="text"
          value={expe.number}
          onChange={props.onChange}
        />
      );
    } else if (patterns.length > 1) {
      const id = patterns[0].testId;
      return (
        <select name={id} onChange={props.onChange} value={selected}>
          {patterns.map((p) => (
            <option key={p.name || p.number} value={p.number}>
              {p.name || p.number}
            </option>
          ))}
        </select>
      );
    } else {
      Log.w("Pattern not found");
    }
  }

  Log.d(savedExperiments);
  Log.d(selectedPatterns);

  // Construct Google Optimize's information table.
  const tableBody = [];
  for (const expe of savedExperiments) {
    const selected = selectedPatterns.find((s) => s.testId === expe.testId);
    if (selected) {
      tableBody.push(
        <tr key={expe.testId}>
          <td>{expe.testId}</td>
          <td>{expe.name}</td>
          <td>
            <Patterns
              patterns={expe.patterns}
              selected={selected.number}
              onChange={changePattern}
            />
          </td>
        </tr>
      );
    }
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
      <button onClick={requestUpdate}>Update</button>
      <button onClick={clearStorage}>Clear</button>
    </div>
  );
}
