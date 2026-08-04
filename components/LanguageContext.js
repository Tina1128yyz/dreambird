'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('zh');

  useEffect(() => {
    const savedLang = localStorage.getItem('dreamBird_lang');
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'zh' ? 'en' : 'zh';
    setLang(nextLang);
    localStorage.setItem('dreamBird_lang', nextLang);
  };

  const t = (key, params = {}) => {
    let text = translations[lang]?.[key] || translations['zh']?.[key] || key;
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(`{${paramKey}}`, params[paramKey]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

// ✅ 加上这句，防范任何导出/导入不匹配的问题
export default LanguageProvider;