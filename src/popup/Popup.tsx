import React, { useState, useReducer } from "react";

import {
  Experiment,
  ExperimentPattern,
  ExperimentInCookie,
  ExperimentType,
} from "@/@types/googleOptimize.d";
import * as EventPage from "@/@types/eventPage.d";
import {
  EXPERIMENT_STATUS,
  EXPERIMENT_TYPE,
  ExperimentExpireDefault,
} from "@/utils/constants";
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
  if (type === EXPERIMENT_TYPE.AB) {
    return ExperimentPatternsAB(props);
  } else if (type === EXPERIMENT_TYPE.MVT) {
    return ExperimentPatternsMVT(props);
  } else {
    Log.w("ExperimentType not defined: ", props);
    return <div></div>;
  }
}

/**
 * Patterns of experiment for A/B and Redirect.
 */
function ExperimentPatternsAB(props: ExperimentPatternProps) {
  const patterns = props.patterns;
  const inCookies = props.selected;
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => props.onChangePattern(e, EXPERIMENT_TYPE.AB);

  const id = patterns[0].testId;
  if (patterns.length > 1) {
    return (
      <select
        name={id}
        value={inCookies.pattern}
        className="experiments-table__select"
        onChange={onChange}
      >
        <option disabled>----</option>
        {patterns.map((p) => (
          <option key={p.name || p.number} value={p.number}>
            {p.name || p.number}
          </option>
        ))}
      </select>
    );
  } else {
    // This experiment isn't parsed on the Google Optimize experiment page.
    return (
      <input
        name={id}
        type="text"
        value={inCookies.pattern}
        onChange={onChange}
      />
    );
  }
}

/**
 * Patterns of experiment for MVT.
 */
function ExperimentPatternsMVT(props: ExperimentPatternProps) {
  const patterns = props.patterns;
  const inCookies = props.selected;
  const id = patterns[0].testId;

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => props.onChangePattern(e, EXPERIMENT_TYPE.MVT);

  let formList: JSX.Element[];

  if (patterns[0].sectionName) {
    // This experiment is parsed.

    // group by sectionName
    let sections = patterns.reduce((acc, cur) => {
      let section = cur.sectionName;
      if (!acc[section]) acc[section] = [];
      acc[section].push(cur);
      return acc;
    }, {});

    // create multiple select elements.
    formList = Object.keys(sections).map((section, index) => {
      const patternsInSection = sections[section];
      const s = inCookies.pattern.split("-")[index];

      return (
        <li key={section}>
          <label className="experiments-table__section-label">{section}</label>
          <select
            name={id + NameSeparator + index}
            value={s}
            className="experiments-table__select"
            onChange={onChange}
          >
            <option disabled>----</option>
            {patternsInSection.map((p: ExperimentPattern) => (
              <option key={p.name || p.number} value={p.number}>
                {p.name || p.number}
              </option>
            ))}
          </select>
        </li>
      );
    });
  } else {
    // This experiment isn't parsed on the Google Optimize experiment page.

    // create input elements.
    formList = [
      <li key="---">
        <input
          name={id}
          type="text"
          value={inCookies.pattern}
          className="experiments-table__input"
          onChange={onChange}
        />
      </li>,
    ];
  }

  return <ul className="experiments-table__section">{formList}</ul>;
}

const reducerFunc = (state, action) => {
  switch (action.type) {
    case "setSelectedPatterns": {
      return { ...state, selectedPatterns: action.value };
    }
    default:
      Log.w("action not found", action);
      return state;
  }
};

export default function Popup(props: any) {
  const url = props.url;
  const tabId = props.tabId;
  const experimentInCookie: ExperimentInCookie[] = props.current || [];
  let savedExperiments: Experiment[] = props.saved || [];

  // Merge experiments found in cookies
  for (const expe of experimentInCookie) {
    const found = savedExperiments.find((a) => a.testId === expe.testId);
    if (found == null) {
      savedExperiments.push({
        testId: expe.testId,
        type: expe.type,
        name: undefined,
        patterns: [
          {
            testId: expe.testId,
            sectionName: undefined,
            name: undefined,
            number: expe.pattern,
          },
        ],
        expire: expe.expire,
        targetUrl: undefined,
        optimizeUrl: undefined,
        editorPageUrl: undefined,
        status: EXPERIMENT_STATUS.Running,
      });
    }
  }

  // Narrow down to experiments that not finished.
  savedExperiments = savedExperiments.filter(
    (e) => e.status === EXPERIMENT_STATUS.Running
  );
  Log.d(savedExperiments);

  const initialState = {
    selectedPatterns: experimentInCookie,
  };
  const [state, dispatch] = useReducer(reducerFunc, initialState);
  Log.d(state.selectedPatterns);

  const [helpVisible, setHelpVisible] = useState(false);

  /**
   * Request update a pattern.
   */
  function requestUpdate() {
    let parsed = new URL(url);

    const params: EventPage.switchPatternsParam = {
      url: parsed.origin,
      patterns: state.selectedPatterns,
    };

    chrome.runtime.sendMessage(
      {
        command: "switchPatterns",
        parameter: params,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    type: ExperimentType
  ) {
    const selectedPatterns: ExperimentInCookie[] = state.selectedPatterns;
    const testId = e.target.name.split(NameSeparator)[0];
    const indexInSection = e.target.name.split(NameSeparator)[1];
    const experiment = selectedPatterns.find((p) => p.testId === testId);

    Log.d(experiment);

    let newVal = e.target.value;;
    if (e.target instanceof HTMLSelectElement) {
      if (type === EXPERIMENT_TYPE.MVT) {
        let patterns = experiment.pattern.split("-");
        patterns[indexInSection] = e.target.value;
        newVal = patterns.join("-");
      }
    }

    if (experiment) {
      experiment.pattern = newVal;
    } else {
      // This experiment isn't started yet.
      selectedPatterns.push({
        testId: testId,
        type: type,
        expire: ExperimentExpireDefault,
        pattern: newVal,
      });
    }

    Log.d(selectedPatterns);
    dispatch({ type: "setSelectedPatterns", value: selectedPatterns });
  }

  // Show popup window.
  return (
    <div className="popupContainer">
      <ExperimentsTable
        url={url}
        experiments={savedExperiments}
        patterns={state.selectedPatterns}
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
