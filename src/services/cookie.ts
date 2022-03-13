const Cookie = {
  get: (
    details: chrome.cookies.Details,
    tabId: number
  ): Promise<chrome.cookies.Cookie> => {

    return new Promise((resolve) => {
      chrome.cookies.getAllCookieStores((stores) => {
        const store = stores.find((s) => s.tabIds.some((t) => t === tabId));
        if (store) {
          details.storeId = store.id;
          chrome.cookies.get(details, (cookie: chrome.cookies.Cookie) => {
            if (cookie) resolve(cookie);
          });
        }
      });
    });
  },

  set: (details: chrome.cookies.SetDetails): Promise<chrome.cookies.Cookie> => {
    return new Promise((resolve) => {
      chrome.cookies.set(details, (cookie: chrome.cookies.Cookie) => {
        resolve(cookie);
      });
    });
  },
};

export default Cookie;
