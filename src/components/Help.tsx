import React from "react";
import "@/scss/help.scss";

import * as i18n from "@/i18n";

export function Help() {
  return (
    <div className="help accordion">
      <h2 className="help__title">{i18n.t("helpTitle")}</h2>
      <p className="help__item mod-step-1">
        <span className="help__number">1.</span>
        <span>{i18n.t("helpStep1")}</span>
        <img src="/img/help/optimize_open.png"></img>
      </p>
      <p className="help__item mod-step-2">
        <span className="help__number">2.</span>
        <span>{i18n.t("helpStep2")}</span>
        <img src="/img/help/extension_icon_found.png"></img>
      </p>
      <p className="help__item mod-step-3">
        <span className="help__number">3.</span>
        <span>{i18n.t("helpStep3")}</span>
        <img src="/img/help/extension_experiment_page.png"></img>
      </p>
      <p className="help__item mod-step-4">
        <span className="help__number">4.</span>
        <span>{i18n.t("helpStep4")}</span>
        <img src="/img/help/extension_editor_page.png"></img>
      </p>
    </div>
  );
}
