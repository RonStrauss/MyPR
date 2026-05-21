import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import he from "./locales/he.json";
import en from "./locales/en.json";

const STORAGE_KEY = "mypr-lang";

export type Lang = "he" | "en";

export function getStoredLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "he") return stored;
  return "he";
}

export function setDocumentLang(lang: Lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
}

i18n.use(initReactI18next).init({
  resources: {
    he: { translation: he },
    en: { translation: en },
  },
  lng: getStoredLang(),
  fallbackLng: "he",
  interpolation: { escapeValue: false },
});

setDocumentLang(getStoredLang());

const PAGE_TITLES: Record<Lang, string> = {
  he: "MyPR — מעקב שיאים אישיים",
  en: "MyPR — Gym Personal Records",
};

export function changeLanguage(lang: Lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  setDocumentLang(lang);
  document.title = PAGE_TITLES[lang];
  return i18n.changeLanguage(lang);
}

export default i18n;
