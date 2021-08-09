const Tabs = {
  /**
   * 表示中のタブオブジェクトを取得する
   */
  getCurrentTab: (): Promise<chrome.tabs.Tab> => {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        resolve(tabs[0]);
      });
    });
  },

  /**
   * 指定したタブを再読み込みする
   *
   * @param {number} tabId 対象タブのID
   */
  reload: (tabId: number) => {
    chrome.tabs.reload(tabId, {
      bypassCache: true, // bypass local caching.
    });
  },
};

export default Tabs;
