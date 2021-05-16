import Log from "./log";

const Storage = {
  /**
   * Get a item from local storage.
   *
   * @param {string} key of item in storage.
   */
  get: (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, function (result) {
        Log.d("storage get: " + key);
        if (chrome.runtime.lastError != null) {
          reject(chrome.runtime.lastError);
        } else {
          Log.d(result[key]);
          resolve(result[key]);
        }
      });
    });
  },

  /**
   * Set a item to local storage.
   *
   * @param {string} key key of item.
   * @param {any} value item.
   */
  set: (key: string, value: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, function () {
        Log.d("storage set: " + key);
        if (chrome.runtime.lastError != null) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Remove a item in local storage.
   *
   * @param {string} key key of item.
   */
  remove: (key: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, function () {
        Log.d("storage remove: " + key);
        if (chrome.runtime.lastError != null) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Clear all items in local storage.
   */
  clear: (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(function () {
        Log.d("clear");
        if (chrome.runtime.lastError != null) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  },
};

export default Storage;
