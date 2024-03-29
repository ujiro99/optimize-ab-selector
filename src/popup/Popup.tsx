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

import { useGaEvent, useGaView } from "@/hooks/useAnalytics";

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
  } else if (type === EXPERIMENT_TYPE.PERSONALIZATION) {
    return <div className="test-type">{i18n.t("typePersonalization")}</div>;
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
  const patternInCookie = props.selected;
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => props.onChangePattern(e, EXPERIMENT_TYPE.AB);

  const id = patterns[0].testId;
  if (patterns.length > 1) {
    return (
      <select
        name={id}
        value={patternInCookie.pattern}
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
        value={patternInCookie.pattern}
        className="experiments-table__input"
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
  const patternInCookie = props.selected;
  const id = patterns[0].testId;

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => props.onChangePattern(e, EXPERIMENT_TYPE.MVT);

  let formList: JSX.Element[];

  if (patterns[0].sectionName && patternInCookie.pattern) {
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
      const s = patternInCookie.pattern.split("-")[index];

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
          value={patternInCookie.pattern}
          className="experiments-table__input"
          onChange={onChange}
        />
      </li>,
    ];
  }

  return <ul className="experiments-table__section">{formList}</ul>;
}

export type ChangedValueType = {
  testId: string;
  value: string;
};

type StateType = {
  selectedPatterns: ExperimentInCookie[];
  changedValues: ChangedValueType[];
};

const reducerFunc = (state: StateType, action: any) => {
  switch (action.type) {
    case "setPattern": {
      // Update changedValues.
      const index = state.changedValues.findIndex(
        (x: ChangedValueType) => x.testId === action.testId
      );
      if (index < 0) {
        state.changedValues.push({
          testId: action.testId,
          value: action.value,
        });
      } else {
        state.changedValues[index].value = action.value;
      }

      // Update selectedPatterns.
      let selectedPatterns: ExperimentInCookie[] = state.selectedPatterns;
      const experiment = selectedPatterns.find(
        (p) => p.testId === action.testId
      );

      let expire = ExperimentExpireDefault;
      if (experiment) {
        expire = experiment.expire;
        selectedPatterns = selectedPatterns.filter(
          (p) => p.testId !== action.testId
        );
      }

      selectedPatterns.push({
        testId: action.testId,
        type: action.testType,
        expire: expire,
        pattern: action.value,
      });

      return {
        ...state,
        selectedPatterns: selectedPatterns,
        changedValues: state.changedValues,
      };
    }
    default:
      Log.w("action not found", action);
      return state;
  }
};

export default function Popup(props: any) {
  useGaView("Popup")
  const sendEvent = useGaEvent()

  const url = props.url;
  const tabId = props.tabId;
  const experimentInCookie: ExperimentInCookie[] = props.current || [];
  let savedExperiments: Experiment[] = props.saved || [];
  const experienceEmpty = savedExperiments.length === 0;

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

  const initialState: StateType = {
    selectedPatterns: experimentInCookie,
    changedValues: [],
  };
  const [state, dispatch] = useReducer(reducerFunc, initialState);
  Log.d(state.selectedPatterns);

  const [helpVisible, setHelpVisible] = useState(experienceEmpty);

  /**
   * Request update a pattern.
   */
  function requestUpdate() {
    if (state.changedValues.length === 0) {
      return
    }

    let parsed = new URL(url);

    const params: EventPage.switchPatternsParam = {
      url: parsed.origin,
      tabId: tabId,
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
    sendEvent({ category: "click", action: "apply"})
  }

  function toggleHelp() {
    setHelpVisible(!helpVisible);
    if (!helpVisible) sendEvent({ category: "click", action: "showHelp"})
  }

  function changePattern(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    type: ExperimentType
  ) {
    const testId = e.target.name.split(NameSeparator)[0];
    const experiment = state.selectedPatterns.find(
      (p: ExperimentInCookie) => p.testId === testId
    );

    let newVal = e.target.value;
    if (e.target instanceof HTMLSelectElement) {
      if (type === EXPERIMENT_TYPE.MVT) {
        // For MVT, set a value that joins multiple patterns with a hyphen.
        // e.g.) 0-2-1
        let patterns = experiment.pattern.split("-");
        const indexInSection = e.target.name.split(NameSeparator)[1];
        patterns[indexInSection] = e.target.value;
        newVal = patterns.join("-");
      }
    }

    dispatch({
      type: "setPattern",
      testId: testId,
      testType: type,
      value: newVal,
    });
  }

  const changedIds = state.changedValues.map((x) => x.testId);
  let changedTxt = "";
  for (const v of state.changedValues) {
    changedTxt += v.testId + v.value;
  }

  // Show popup window.
  return (
    <div className="popupContainer">
      {experienceEmpty ? (
        <p className="message">
          <span>
            <svg className="icon message__icon">
              <use xlinkHref="/img/icons.svg#icon-info" />
            </svg>
            {i18n.t("msgGoogleOptimizeNotSaved")}
          </span>
          <a href="https://optimize.google.com/optimize/home" target="_blank">
            https://optimize.google.com/optimize/
          </a>
          <span>{i18n.t("msgPleasReadHelp")}</span>
        </p>
      ) : null}

      <ExperimentsTable
        url={url}
        experiments={savedExperiments}
        patterns={state.selectedPatterns}
        onChangePattern={changePattern}
        experimentPatterns={ExperimentPatterns}
        changed={changedIds}
      />

      <pre className="debug-popup-data">
        <code>{changedTxt}</code>
      </pre>

      <div className="experiments-buttons">
        <button className="experiments-help" onClick={toggleHelp}>
          {i18n.t("btnHelp")}
        </button>
        <button
          className={
            "experiments-update" +
            (state.changedValues.length > 0 ? " mod-changed" : "")
          }
          onClick={requestUpdate}
        >
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
