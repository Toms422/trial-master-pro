import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'he' ? 'en' : 'he';
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    localStorage.setItem('language', newLang);
  };

  const isHebrew = i18n.language === 'he';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-900"
      title={isHebrew ? 'Switch to English' : 'עבור לעברית'}
      aria-label="Toggle language"
    >
      <Globe className="h-4 w-4" />
      <span>{isHebrew ? 'EN' : 'עברית'}</span>
    </button>
  );
}
