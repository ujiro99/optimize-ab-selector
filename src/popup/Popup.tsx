import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d";
import { ExperimentStatus } from "@/constants";

import React, { useState } from "react";

import "@/popup/Popup.scss";
import {
  ExperimentsTable,
  ExperimentPatternProps,
} from "@/components/ExperimentsTable";
import Tabs from "@/tabs";
import Log from "@/log";

/**
 * Patterns of experiment.
 */
function ExperimentPatterns(props: ExperimentPatternProps) {
  const patterns: ExperimentPattern[] = props.patterns;
  const selected: number = props.selected;
  if (patterns.length === 1) {
    const expe = patterns[0];
    return (
      <input
        name={expe.testId}
        type="text"
        value={expe.number}
        onChange={props.onChangePattern}
      />
    );
  } else if (patterns.length > 1) {
    const id = patterns[0].testId;
    return (
      <select
        name={id}
        value={selected}
        className="experiments-table__select"
        onChange={props.onChangePattern}
      >
        <option>----</option>
        {patterns.map((p) => (
          <option key={p.name || p.number} value={p.number}>
            {p.name || p.number}
          </option>
        ))}
      </select>
    );
  } else {
    Log.w("Pattern not found");
    return <div></div>;
  }
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
        command: "switchPatterns",
        parameter: {
          url: parsed.origin,
          patterns: selectedPatterns,
        },
      },
      () => {
        // Reload to reflect the changed cookie in the test.
        Tabs.reload(tabId);
        window.close();
      }
    );
  }

  function changePattern(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const copied: ExperimentPattern[] = Object.assign([], selectedPatterns);
    const pattern = copied.find((p) => p.testId === e.target.name);
    if (pattern) {
      pattern.number = parseInt(e.target.value);
    } else {
      copied.push({
        testId: e.target.name,
        name: undefined,
        number: parseInt(e.target.value),
      });
    }
    setSelectedPatterns(copied);
  }

  // Show popup window.
  return (
    <div className="popupContainer">
      <ExperimentsTable
        url={url}
        experiments={savedExperiments}
        patterns={selectedPatterns}
        onChangePattern={changePattern}
        experimentPatterns={ExperimentPatterns}
      />
      <button className="experiments-update" onClick={requestUpdate}>
        Apply
      </button>
    </div>
  );
}
