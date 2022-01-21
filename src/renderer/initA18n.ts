import a18n from 'a18n';
import locales_en from './locales/en-US.json';
import locales_zh from './locales/zh-CN.json';

const LANGUAGE_NAME_EN = 'en-US';
const LANGUAGE_NAME_ZH = 'zh-CN';

a18n.addLocaleResource(LANGUAGE_NAME_EN, locales_en);
a18n.addLocaleResource(LANGUAGE_NAME_ZH, locales_zh);

function calcValidLanguage(lang: string) {
  if (/^zh\b/.test(lang)) {
    return LANGUAGE_NAME_ZH;
  }
  return LANGUAGE_NAME_EN;
}

let locale = calcValidLanguage(
  window.localStorage.getItem('lang') ||
    window.navigator.language ||
    LANGUAGE_NAME_ZH
);
a18n.setLocale(locale);

export function setLocale(lang: string) {
  locale = calcValidLanguage(lang);
  window.localStorage.setItem('lang', locale);
  a18n.setLocale(locale);
  window.location.reload();
}

export function getLocale() {
  return locale;
}
