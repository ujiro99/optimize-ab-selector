import { useState } from "react";
import { Experiment, ExperimentPattern } from "@/@types/googleOptimize.d";
import { EXPERIMENT_STATUS, EXPERIMENT_TYPE } from "@/utils/constants";

import {
  ExperimentsTable,
  ExperimentPatternProps,
} from "@/components/ExperimentsTable";
import { Help } from "@/components/Help";
import { Accordion } from "@/components/Accordion";

import { equalsOptimizeUrl } from "@/services/googleOptimize";
import Log from "@/services/log";
import Storage, { STORAGE_KEY } from "@/services/storage";
import * as i18n from "@/services/i18n";

import "@/popup/Popup.scss";

import { useGaEvent, useGaView } from "@/hooks/useAnalytics";

/**
 * ExperimentPatterns component
 */
export function ExperimentPatterns(props: ExperimentPatternProps) {
  const patterns: ExperimentPattern[] = props.patterns;
  const type = props.type;
  if (type === EXPERIMENT_TYPE.MVT) {
    // group by sectionName
    let sections = patterns.reduce((acc, cur) => {
      let section = cur.sectionName;
      if (!acc[section]) acc[section] = [];
      acc[section].push({
        key: cur.name || cur.number,
        name: cur.name,
      });
      return acc;
    }, {});

    const sectionInners = Object.keys(sections).map((key) => {
      let exps = sections[key];
      return (
        <li className="sections__list" key={key}>
          <span className="sections__name">{key}</span>
          <ol className="patterns">
            {exps.map((p: any) => (
              <li key={p.key}>{p.name}</li>
            ))}
          </ol>
        </li>
      );
    });
    return <ul className="sections">{sectionInners.map((s) => s)}</ul>;
  } else if (type === EXPERIMENT_TYPE.AB) {
    return (
      <ol className="patterns">
        {patterns.map((p) => (
          <li key={p.name || p.number}>{p.name}</li>
        ))}
      </ol>
    );
  } else if (type === EXPERIMENT_TYPE.PERSONALIZATION) {
    return <div className="test-type">{i18n.t("typePersonalization")}</div>;
  } else {
    return <div></div>;
  }
}

export default function PopupOptimize(props: any) {
  useGaView("PopupOptimize");
  const sendEvent = useGaEvent()

  const url = props.url;

  const savedExperiments: Experiment[] = props.saved || [];
  const experienceSaved = savedExperiments.length === 0;
  const activeExperiments: Experiment[] = savedExperiments
    .filter((s) => s.status === EXPERIMENT_STATUS.Running)
    .sort((a) => (equalsOptimizeUrl(url, a.optimizeUrl) ? -1 : 1));
  const finishedExperiments: Experiment[] = savedExperiments
    .filter(
      (s) =>
        s.status === EXPERIMENT_STATUS.Archived ||
        s.status === EXPERIMENT_STATUS.Ended
    )
    .sort((a) => (equalsOptimizeUrl(url, a.optimizeUrl) ? -1 : 1));

  Log.d("url: " + url);

  const [helpVisible, setHelpVisible] = useState(false);
  const [endedVisible, setEndedVisible] = useState(false);

  function toggleHelp() {
    setHelpVisible(!helpVisible);
    if (!helpVisible) sendEvent({ category: "click", action: "showHelp"})
  }

  /**
   * Delete all saved data.
   */
  function clearStorage() {
    if (window.confirm(i18n.t("labelClear"))) {
      Storage.remove(STORAGE_KEY.experiments).then(() => {
        Log.d("clearStorage finished");
        window.close();
      });
    }
  }

  // Show popup window.
  return (
    <div className="popupContainer in-optimize">
      {experienceSaved ? (
        <p className="message">
          <span>
            <svg className="icon message__icon">
              <use xlinkHref="/img/icons.svg#icon-info" />
            </svg>
            {i18n.t("msgGoogleOptimizeNotSaved")}
          </span>
        </p>
      ) : null}

      <div className="active-experiments">
        <span className="experiments-table__caption">Active</span>
        <ExperimentsTable
          url={url}
          experiments={activeExperiments}
          experimentPatterns={ExperimentPatterns}
        />
      </div>

      <div
        className="finished-experiments"
        onClick={() => setEndedVisible(!endedVisible)}
      >
        <svg
          className={
            "icon experiments-table__caption-icon " +
            (endedVisible ? "mod-rotate-180" : "")
          }
        >
          <use xlinkHref="/img/icons.svg#icon-expand-more" />
        </svg>
        <span className="experiments-table__caption">Ended</span>
        <Accordion isOpen={endedVisible}>
          <ExperimentsTable
            url={url}
            experiments={finishedExperiments}
            experimentPatterns={ExperimentPatterns}
          />
        </Accordion>
      </div>

      <div className="experiments-buttons">
        <button className="experiments-help" onClick={toggleHelp}>
          {i18n.t("btnHelp")}
        </button>
        <button className="experiments-update" onClick={clearStorage}>
          {i18n.t("btnClear")}
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
