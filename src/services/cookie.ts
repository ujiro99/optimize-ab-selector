const Cookie = {
  get: (details: chrome.cookies.Details): Promise<chrome.cookies.Cookie> => {
    return new Promise(resolve => {
      chrome.cookies.get(details, (cookie: chrome.cookies.Cookie) => {
        resolve(cookie);
      });
    });
  },

  set: (details: chrome.cookies.SetDetails): Promise<chrome.cookies.Cookie> => {
    return new Promise(resolve => {
      chrome.cookies.set(details, (cookie: chrome.cookies.Cookie) => {
        resolve(cookie);
      });
    });
  }
};

export default Cookie;
