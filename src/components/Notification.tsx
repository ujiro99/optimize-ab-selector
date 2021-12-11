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

function Notification(props: NotificationProps): JSX.Element {
  const [classObj, setClassObj] = useState<Object>({
    "notification--hidden": true,
  });

  useEffect(() => {
    const setClass = async () => {
      await sleep(1000);
      show();
      await sleep(5000);
      hide();
    };
    setClass();
  }, []);

  async function show() {
    setClassObj({
      "notification--visible": true,
    });
    await sleep(350);
    setClassObj({});
  }

  async function hide() {
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
        <Notification title={options.title} message={options.message} />,
        document.getElementById(elementId)
      );
    }
  });
}
