import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import classnames from "classnames";

import "@/scss/notification.scss";

import Storage, { STORAGE_KEY } from "@/services/storage";

function sleep(msec: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, msec));
}

type NotificationProps = {
  title: string;
  message: string;
};

type _NotificationProps = {
  title: string;
  message: string;
  options: Object;
};

let visible = false;

function Notification(props: _NotificationProps): JSX.Element {
  const [classObj, setClassObj] = useState<Object>({
    "notification--hidden": true,
  });

  useEffect(() => {
    const setClass = async () => {
      await sleep(500);
      show();
      await sleep(5000);
      hide();
    };
    setClass();
  }, [props.options]);
  // It checks for changes in props.options,
  // because there is a case it runs multiple times on a page.

  async function show() {
    visible = true;
    setClassObj({
      "notification--visible": true,
    });
    await sleep(350);
    setClassObj({});
  }

  async function hide() {
    if (!visible) return;
    visible = false;
    setClassObj({
      "notification--visible-to-hidden": true,
    });
    await sleep(250);
    setClassObj({
      "notification--hidden": true,
    });
  }

  return (
    <div className={classnames("notification", classObj)} onClick={hide}>
      <div className="notification__icon">
        <img src="https://github.com/ujiro99/optimize-ab-selector/blob/master/public/img/icon128.png?raw=true" />
      </div>
      <div className="notification__content">
        <h2 className="notification__title">{props.title}</h2>
        <p className="notification__message">{props.message}</p>
      </div>
    </div>
  );
}

export function showNotification(
  elementId: string,
  options: NotificationProps
) {
  Storage.get(STORAGE_KEY.options).then((data) => {
    if (data.show_notification) {
      ReactDOM.render(
        <Notification
          options={options}
          title={options.title}
          message={options.message}
        />,
        document.getElementById(elementId)
      );
    }
  });
}
