import React, { useState } from "react";

import "./Popup.scss";
import Tabs from "../tabs";
import Log from "../log";

export default function Popup(props: any) {
  const url = props.url;
  const tabId = props.tabId;
  const currentExperiments: Experiment[] = props.current || [];
  let savedExperiments: Experiment[] = props.saved || [];

  // Narrow down to experiments that not finished.
  savedExperiments = savedExperiments.filter((e) => !e.finished);

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

  Log.d(selectedPatterns);
  Log.d(savedExperiments);

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

  // Construct Google Optimize's information table.
  const tableBody = [];
  for (const expe of savedExperiments) {
    const selected = selectedPatterns.find((s) => s.testId === expe.testId);

    let targetUrl = expe.targetUrl;
    if (targetUrl != null && targetUrl.startsWith("/")) {
      let parsed = new URL(url);
      targetUrl = parsed.origin + targetUrl;
    }

    if (selected) {
      tableBody.push(
        <tr key={expe.testId}>
          <td>
            <a
              className="experiments-table__optimize-url"
              href={expe.optimizeUrl}
              target="_blank"
            >
              <span className="experiments-table__testId">{expe.testId}</span>
              <span className="experiments-table__testName">{expe.name}</span>
            </a>
          </td>
          <td>
            <a
              className="experiments-table__target-url"
              href={targetUrl}
              target="_blank"
            >
              {expe.targetUrl}
            </a>
          </td>
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
            <th className="experiments-table__name">Name</th>
            <th className="experiments-table__target-url">Target url</th>
            <th className="experiments-table__pattern">Pattern</th>
          </tr>
        </thead>
        <tbody>{tableBody}</tbody>
      </table>
      <button className="experiments-update" onClick={requestUpdate}>Update</button>
      {/*  <button onClick={clearStorage}>Clear</button> */}
    </div>
  );
}
