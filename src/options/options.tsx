import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";

import { ToggleSwitch } from "@/components/ToggleSwitch";

import "@/scss/options.scss";

import * as i18n from "@/services/i18n";
import Storage, { STORAGE_KEY } from "@/services/storage";

function init() {
  ReactDOM.render(<Options />, document.getElementById("app"));
}

/**
 * default options.
 */
const DEFAULTS = {
  show_notification: true,
};

function Options(): JSX.Element {
  const [options, setOptions] = useState<any>({});

  // restore options
  useEffect(() => {
    const init = async () => {
      const options = (await Storage.get(STORAGE_KEY.options)) || DEFAULTS;
      setOptions(options);
    };
    init();
  }, []);

  // save options to storage
  useEffect(() => {
    console.log("option changed");
    Storage.set(STORAGE_KEY.options, options);
  }, [options]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({
      ...options,
      [e.target.name]: e.target.checked,
    });
  };

  return (
    <section className="options-container">
      <div className="option-item">
        <p className="option-item__name">{i18n.t("optionEnableNotification")}</p>
        <div className="option-item__input">
          <ToggleSwitch
            name="show_notification"
            default={options.show_notification}
            onChange={onChange}
          />
        </div>
      </div>
    </section>
  );
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});
