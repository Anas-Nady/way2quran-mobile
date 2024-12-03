import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./../locales/ar.json";
import en from "./../locales/en.json";
import * as Localization from "expo-localization";

const languageResources = {
  en: { translation: en },
  ar: { translation: ar },
};

export const getDefaultLanguage = () => {
  const getLocales = Localization.getLocales();
  const deviceLanguage = getLocales[0].languageCode;

  return deviceLanguage === "ar" ? "ar" : "en";
};

const intiInfo = {
  compatibilityJSON: "v3",
  lng: getDefaultLanguage(),
  fallbackLng: ["en", "ar"],
  debug: false,
  resources: languageResources,
  interpolation: {
    escapeValue: false,
  },
};

i18n.use(initReactI18next).init(intiInfo);

export default i18n;
