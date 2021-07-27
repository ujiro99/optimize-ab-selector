export function getUILanguage() {
  return chrome.i18n.getUILanguage();
}

export function t(key: string, params?: string[]) {
  return chrome.i18n.getMessage(key, params);
}
