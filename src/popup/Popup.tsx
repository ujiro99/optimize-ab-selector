import React, { useState } from "react";

import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d";
import { ExperimentStatus, ExperimentType } from "@/utils/constants";
import "@/popup/Popup.scss";

import {
  ExperimentsTable,
  ExperimentPatternProps,
} from "@/components/ExperimentsTable";
import { Help } from "@/components/Help";
import { Accordion } from "@/components/Accordion";

import Tabs from "@/services/tabs";
import Log from "@/services/log";
import * as i18n from "@/services/i18n";

const NameSeparator = "$$";

/**
 * Patterns of experiment.
 */
function ExperimentPatterns(props: ExperimentPatternProps) {
  const type = props.type;
  if (type === ExperimentType.AB) {
    return ExperimentPatternsAB(props);
  } else if (type === ExperimentType.MVT) {
    return ExperimentPatternsMVT(props)
  } else {
    Log.w("Pattern not found");
    return <div></div>;
  }
}

/**
 * Patterns of experiment for A/B and Redirect.
 */
function ExperimentPatternsAB(props: ExperimentPatternProps) {
  const patterns: ExperimentPattern[] = props.patterns;
  const selected: ExperimentPattern[] = props.selected;
  if (patterns.length > 1) {
    const id = patterns[0].testId;
    return (
      <select
        name={id}
        value={selected[0].number}
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
    const expe = patterns[0];
    return (
      <input
        name={expe.testId}
        type="text"
        value={expe.number}
        onChange={props.onChangePattern}
      />
    );
  }
}

/**
 * Patterns of experiment for MVT.
 */
function ExperimentPatternsMVT(props: ExperimentPatternProps) {
  const patterns: ExperimentPattern[] = props.patterns;
  const selected: ExperimentPattern[] = props.selected;
  const id = patterns[0].testId;

  // group by sectionName
  let sections = patterns.reduce((acc, cur) => {
    let section = cur.sectionName;
    if (!acc[section]) acc[section] = [];
    acc[section].push(cur);
    return acc;
  }, {});

  // create multiple select elements.
  let selectList = Object.keys(sections).map((section, index) => {
    const patternsInSection = sections[section];
    const s = selected[index];
    return (
      <li key={section}>
        <label className="experiments-table__section-label">{section}</label>
        <select
          name={id + NameSeparator + index}
          value={s.number}
          className="experiments-table__select"
          onChange={props.onChangePattern}
        >
          <option>----</option>
          {patternsInSection.map((p: ExperimentPattern) => (
            <option key={p.name || p.number} value={p.number}>
              {p.name || p.number}
            </option>
          ))}
        </select>
      </li>
    );
  });

  return <ul className="experiments-table__section">{selectList}</ul>;
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
    currentExperiments.reduce((a, c) => a.concat(c.patterns), [])
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
    const testId = e.target.name.split(NameSeparator)[0];
    const sectionIndex = e.target.name.split(NameSeparator)[1];
    const patterns = copied.filter((p) => p.testId === testId);
    let pattern = patterns[0];
    if (patterns.length > 0 && sectionIndex) {
      // This experiment is MVT
      pattern = patterns[sectionIndex];
    }

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
        sectionName: undefined,
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
