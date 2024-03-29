import React, { useState } from "react";
import { Experiment } from "@/@types/googleOptimize.d";
import { EXPERIMENT_STATUS } from "@/utils/constants";

import { ExperimentsTable } from "@/components/ExperimentsTable";
import { Help } from "@/components/Help";
import { Accordion } from "@/components/Accordion";

import { ExperimentPatterns } from "@/popup/PopupOptimize";

import { equalsOptimizeUrl } from "@/services/googleOptimize";
import Log from "@/services/log";
import * as i18n from "@/services/i18n";

import { useGaEvent, useGaView } from "@/hooks/useAnalytics";

import "@/popup/Popup.scss";

export default function PopupOther(props: any) {
  useGaView("PopupOther");
  const sendEvent = useGaEvent()

  const url = props.url;
  const savedExperiments: Experiment[] = props.saved || [];
  const experienceEmpty = savedExperiments.length === 0;
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
  const finishedExperienceEmpty = finishedExperiments.length === 0;

  Log.d("url: " + url);

  const [helpVisible, setHelpVisible] = useState(experienceEmpty);
  const [endedVisible, setEndedVisible] = useState(false);

  function toggleHelp() {
    setHelpVisible(!helpVisible);
    if (!helpVisible) sendEvent({ category: "click", action: "showHelp"})
  }

  // Show popup window.
  return (
    <div className="popupContainer">
      <p className="message">
        <span>
          <svg className="icon message__icon">
            <use xlinkHref="/img/icons.svg#icon-info" />
          </svg>
          {i18n.t("msgGoogleOptimizeNotActive")}
        </span>
        {experienceEmpty ? (
          <>
            <span>
              <svg className="icon message__icon">
                <use xlinkHref="/img/icons.svg#icon-info" />
              </svg>
              {i18n.t("msgGoogleOptimizeNotSaved")}
            </span>
            <a href="https://optimize.google.com/optimize/home" target="_blank">
              https://optimize.google.com/optimize/home
            </a>
            <span>{i18n.t("msgPleasReadHelp")}</span>
          </>
        ) : null}
      </p>

      {!experienceEmpty ? (
        <div className="active-experiments">
          <span className="experiments-table__caption">Active</span>
          <ExperimentsTable
            url={url}
            experiments={activeExperiments}
            experimentPatterns={ExperimentPatterns}
          />
        </div>
      ) : null}

      {!finishedExperienceEmpty ? (
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
      ) : null}

      <div className="experiments-buttons">
        <button className="experiments-help" onClick={toggleHelp}>
          {i18n.t("btnHelp")}
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
