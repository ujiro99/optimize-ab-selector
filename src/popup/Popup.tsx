import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d";
import { ExperimentStatus } from "@/constants";

import React, { useState } from "react";

import "@/popup/Popup.scss";
import Tabs from "@/tabs";
import Log from "@/log";

/**
 * Name of experiment.
 *
 * @param props.experiment {Experiment} Experiment Object to display.
 */
function ExperimentName(props: any) {
  const experiment: Experiment = props.experiment;
  return (
    <a
      className="experiments-table__optimize-url"
      href={experiment.optimizeUrl}
      target="_blank"
    >
      <span className="experiments-table__testId">{experiment.testId}</span>
      <span className="experiments-table__testName">{experiment.name}</span>
    </a>
  );
}

/**
 * Editor url of experiment.
 *
 * @param props.experiment {Experiment} Experiment Object to display.
 * @param props.url {string} URL of current tab.
 */
function ExperimentTarget(props: any) {
  const experiment: Experiment = props.experiment;
  const url: string = props.url;

  let editorPageUrl = experiment.editorPageUrl;
  if (editorPageUrl != null && editorPageUrl.startsWith("/")) {
    let parsed = new URL(url);
    editorPageUrl = parsed.origin + editorPageUrl;
  }
  return (
    <a
      className="experiments-table__target-url"
      href={editorPageUrl}
      target="_blank"
    >
      {editorPageUrl}
    </a>
  );
}

/**
 * Patterns of experiment.
 *
 * @param props.patterns {ExperimentPattern[]} Information of patterns of experiment.
 * @param props.selected {number} Pattern number.
 * @param props.onChange {Function} Callback function to be executed when pattern is selected.
 */
function ExperimentPatterns(props: any) {
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
      <select
        name={id}
        onChange={props.onChange}
        value={selected}
        className="experiments-table__select"
      >
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
export function TableBody(props: any) {
  const experiments: Experiment[] = props.experiments || [];
  const selectedPatterns: ExperimentPattern[] = props.patterns || [];
  const url: string = props.url;
  const ExperimentPatterns = props.experimentPatternsComponent;
  const onChangePattern: Function = props.changePattern;
  const tableBody = [];
  for (const expe of experiments) {
    const selected = selectedPatterns.find((s) => s.testId === expe.testId);
    if (selected) {
      tableBody.push(
        <tr key={expe.testId}>
          <td className="table-body__name">
            <ExperimentName experiment={expe} />
          </td>
          <td>
            <ExperimentTarget experiment={expe} url={url} />
          </td>
          <td>
            <ExperimentPatterns
              patterns={expe.patterns}
              selected={selected.number}
              onChange={onChangePattern}
            />
          </td>
        </tr>
      );
    } else {
      tableBody.push(
        <tr key={expe.testId}>
          <td className="table-body__name">
            <ExperimentName experiment={expe} />
          </td>
          <td>
            <ExperimentTarget experiment={expe} url={url} />
          </td>
          <td>
            <ExperimentPatterns patterns={expe.patterns} />
          </td>
        </tr>
      );
    }
  }
  return <tbody>{tableBody}</tbody>;
}

export default function Popup(props: any) {
  const url = props.url;
  const tabId = props.tabId;
  const currentExperiments: Experiment[] = props.current || [];
  let savedExperiments: Experiment[] = props.saved || [];

  // Narrow down to experiments that not finished.
  savedExperiments = savedExperiments.filter(
    (e) => e.status === ExperimentStatus.Running
  );

  // Merge experiments found in cookies
  for (const expe of currentExperiments) {
    const found = savedExperiments.find((a) => a.testId === expe.testId);
    if (found == null) {
      savedExperiments.push(expe);
    }
  }

  Log.d(savedExperiments);

  const [selectedPatterns, setSelectedPatterns] = useState(
    currentExperiments.map((c) => c.patterns[0])
  );

  Log.d(selectedPatterns);

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

  function changePattern(e: any) {
    const copied: ExperimentPattern[] = Object.assign([], selectedPatterns);
    const pattern = copied.find((p) => p.testId === e.target.name);
    pattern.number = e.target.value;
    setSelectedPatterns(copied);
  }

  // Show popup window.
  return (
    <div className="popupContainer">
      <table className="experiments-table">
        <thead>
          <tr>
            <th className="experiments-table__name">Name</th>
            <th className="experiments-table__target-url">Editor Page</th>
            <th className="experiments-table__pattern">Pattern</th>
          </tr>
        </thead>
        <TableBody
          url={url}
          experiments={savedExperiments}
          patterns={selectedPatterns}
          changePattern={changePattern}
          experimentPatternsComponent={ExperimentPatterns}
        />
      </table>
      <button className="experiments-update" onClick={requestUpdate}>
        Apply
      </button>
    </div>
  );
}
