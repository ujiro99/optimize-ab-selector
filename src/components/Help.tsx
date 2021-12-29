import "@/scss/help.scss";

import * as i18n from "@/services/i18n";

export function Help() {
  return (
    <div className="help">
      <h2 className="help__title">{i18n.t("helpTitle")}</h2>

      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/95XLR8RRLGw?rel=0"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>

      <p className="help__item mod-step-1">
        <span className="help__number">1.</span>
        <span>{i18n.t("helpStep1")}</span>
        <img src="/img/help/select-test.png" width="2234" height="1258"></img>
      </p>
      <p className="help__item mod-step-2">
        <span className="help__number">2.</span>
        <span>{i18n.t("helpStep2")}</span>
        <img src="/img/help/optimize_open.png" width="380" height="220"></img>
      </p>
      <p className="help__item mod-step-3">
        <span className="help__number">3.</span>
        <span>{i18n.t("helpStep3")}</span>
        <img src="/img/help/extension_icon_found.png" width="140" height="80"></img>
      </p>
      <p className="help__item mod-step-4">
        <span className="help__number">4.</span>
        <span>{i18n.t("helpStep4")}</span>
        <img src="/img/help/extension_experiment_page.png" width="1420" height="242"></img>
      </p>
      <p className="help__item mod-step-5">
        <span className="help__number">5.</span>
        <span>{i18n.t("helpStep5")}</span>
        <img src="/img/help/extension_editor_page.png" width="1418" height="190"></img>
      </p>
    </div>
  );
}
