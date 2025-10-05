import React from 'react';
import { GameMode } from '../types';
import { useAppContext } from '../AppContext';
import { SunIcon, MoonIcon, LanguageIcon } from '../constants';

interface HeaderProps {
    activeMode: GameMode | null;
    onBackToMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeMode, onBackToMenu }) => {
  const { theme, setTheme, language, setLanguage, t } = useAppContext();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg shadow-blue-500/10 p-4 flex justify-between items-center sticky top-0 z-50">
      <h1 className="text-xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-wider">
        <span className="text-slate-800 dark:text-white">{t('exoplanets')}</span> {t('challenge')}
      </h1>
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            {theme === 'light' ? <MoonIcon className="w-6 h-6 text-slate-700" /> : <SunIcon className="w-6 h-6 text-yellow-400" />}
        </button>
        <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 font-semibold text-sm">
            <LanguageIcon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            <span className="text-slate-700 dark:text-slate-300">{language === 'en' ? 'AR' : 'EN'}</span>
        </button>
        {activeMode && (
          <button
            onClick={onBackToMenu}
            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:bg-blue-500/20 dark:hover:bg-blue-500/40 dark:text-blue-300 font-bold py-2 px-4 rounded-lg transition-colors duration-300 border border-blue-500/30 dark:border-blue-500/50 ltr:ml-2 rtl:mr-2"
          >
            &larr; {t('main_menu')}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;