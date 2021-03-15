import React, { useState, useEffect } from "react";
import "./Popup.scss";
import Tabs from "../tabs";

export default function Popup() {
  const [experiments, setExperiments] = useState([]);

  /** 表示中のタブオブジェクト */
  let currentTab: chrome.tabs.Tab;

  useEffect(() => {
    Tabs.getCurrentTab().then((tab) => {
      currentTab = tab;
      // CookieからのOptimize情報取得を要求
      chrome.runtime.sendMessage(
        {
          optimizeList: true,
          url: tab.url,
        },
        (res) => {
          // 応答メッセージをstateに格納
          setExperiments(res);
        }
      );
    });
  }, [experiments]);

  /**
   * パターンを変更する
   */
  function updatePattern() {
    chrome.runtime.sendMessage(
      {
        command: "switchPattern",
        parameter: experiments,
      },
      (res) => {
        // 変更したCookieをテスト状態に反映するためリロード
        Tabs.reload(currentTab.id);
      }
    );
  }

  // Optimize情報の更新処理
  const tableBody = [];
  for (const expe of experiments) {
    tableBody.push(
      <tr key={expe.testId}>
        <td>{expe.testId}</td>
        <td>{expe.name}</td>
        <td>{expe.pattern}</td>
      </tr>
    );
  }

  // popupウィンドウの表示
  return (
    <div className="popupContainer">
      <table className="experiments-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>name</th>
            <th>pattern</th>
          </tr>
        </thead>
        <tbody>{tableBody}</tbody>
      </table>
      <button onClick={updatePattern}>Update</button>
    </div>
  );
}
