import React, { useState } from "react";

import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d";
import { ExperimentStatus } from "@/constants";
import "@/popup/Popup.scss";
import {
  ExperimentsTable,
  ExperimentPatternProps,
} from "@/components/ExperimentsTable";
import { Help } from "@/components/Help";
import { Accordion } from "@/components/Accordion";
import Tabs from "@/tabs";
import Log from "@/log";
import * as i18n from "@/i18n";

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

  // Merge experiments found in cookies
  for (const expe of currentExperiments) {
    const found = savedExperiments.find((a) => a.testId === expe.testId);
    if (found == null) {
      savedExperiments.push(expe);
    }
  }

  // Narrow down to experiments that not finished.
  savedExperiments = savedExperiments.filter(
    (e) => e.status === ExperimentStatus.Running
  );
  Log.d(savedExperiments);

  const [selectedPatterns, setSelectedPatterns] = useState(
    currentExperiments.map((c) => c.patterns[0])
  );
  Log.d(selectedPatterns);

  const [helpVisible, setHelpVisible] = useState(false);

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

  function toggleHelp() {
    setHelpVisible(!helpVisible);
  }

  function changePattern(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const copied: ExperimentPattern[] = Object.assign([], selectedPatterns);
    const pattern = copied.find((p) => p.testId === e.target.name);

    let newVal: any;
    if (e.target instanceof HTMLSelectElement) {
      newVal = parseInt(e.target.value);
    } else {
      newVal = e.target.value;
    }

    if (pattern) {
      pattern.number = newVal;
    } else {
      copied.push({
        testId: e.target.name,
        name: undefined,
        number: newVal,
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

      <div className="experiments-buttons">
        <button className="experiments-help" onClick={toggleHelp}>
          {i18n.t("btnHelp")}
        </button>
        <button className="experiments-update" onClick={requestUpdate}>
          {i18n.t("btnApply")}
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
