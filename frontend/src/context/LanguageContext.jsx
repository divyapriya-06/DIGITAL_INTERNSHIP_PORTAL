import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('app_language') || 'en');

  const setLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('app_language', newLang);
  };

  const t = (key) => {
    return (translations[lang] && translations[lang][key]) || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
