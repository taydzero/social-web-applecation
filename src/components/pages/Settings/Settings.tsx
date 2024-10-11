import React from "react";
import { useTheme } from '../../../ThemeContext';

// Импортируем фоны
import lightBg1 from '../../../assets/lightBg1.gif';
import lightBg2 from '../../../assets/lightBg2.gif';
import darkBg1 from '../../../assets/darkBg1.gif';
import darkBg2 from '../../../assets/darkBg2.gif';
import lightBg3 from '../../../assets/lightBg3.gif';
import darkBg3 from '../../../assets/darkBg3.gif';
import neutralBg1 from '../../../assets/neutralBg1.gif'; // Фоны для нейтральной темы
import neutralBg2 from '../../../assets/neutralBg2.gif';
import neutralBg3 from '../../../assets/neutralBg3.gif';

const Settings = () => {
  const { theme, backgrounds, setBackground, toggleTheme } = useTheme();

  const handleBackgroundChange = (themeType: 'light' | 'dark' | 'neutral', bg: string) => {
    setBackground(themeType, bg);
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">Настройки</h2>

      {/* Кнопка переключения темы */}
      <div className="mb-6">
        <button
          onClick={toggleTheme}
          className="mb-4 dark:hover:text-white dark:text-blue-500 hover:text-rose-500 transition-all duration-200 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
        >
          Переключить тему (Текущая: {theme})
        </button>
      </div>

      {/* Выбор фона для светлой темы */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Фон для светлой темы</h3>
        <div className="flex gap-4">
          <img
            src={lightBg1}
            alt="Светлый фон 1"
            className={`w-32 h-32 cursor-pointer border-4 ${backgrounds.light === lightBg1 ? 'border-rose-500 shadow-lg shadow-rose-500' : 'border-transparent'}`}
            onClick={() => handleBackgroundChange('light', lightBg1)}
          />
          <img
            src={lightBg2}
            alt="Светлый фон 2"
            className={`w-32 h-32 cursor-pointer border-4 ${backgrounds.light === lightBg2 ? 'border-rose-500 shadow-lg shadow-rose-500' : 'border-transparent'}`}
            onClick={() => handleBackgroundChange('light', lightBg2)}
          />
          <img
            src={lightBg3}
            alt="Светлый фон 3"
            className={`w-32 h-32 cursor-pointer border-4 ${backgrounds.light === lightBg3 ? 'border-rose-500 shadow-lg shadow-rose-500' : 'border-transparent'}`}
            onClick={() => handleBackgroundChange('light', lightBg3)}
          />
        </div>
      </div>

      {/* Выбор фона для тёмной темы */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Фон для тёмной темы</h3>
        <div className="flex gap-4">
          <img
            src={darkBg1}
            alt="Тёмный фон 1"
            className={`w-32 h-32 cursor-pointer border-4 ${backgrounds.dark === darkBg1 ? 'border-blue-500 shadow-lg shadow-blue-500' : 'border-transparent'}`}
            onClick={() => handleBackgroundChange('dark', darkBg1)}
          />
          <img
            src={darkBg2}
            alt="Тёмный фон 2"
            className={`w-32 h-32 cursor-pointer border-4 ${backgrounds.dark === darkBg2 ? 'border-blue-500 shadow-lg shadow-blue-500' : 'border-transparent'}`}
            onClick={() => handleBackgroundChange('dark', darkBg2)}
          />
          <img
            src={darkBg3}
            alt="Тёмный фон 3"
            className={`w-32 h-32 cursor-pointer border-4 ${backgrounds.dark === darkBg3 ? 'border-blue-500 shadow-lg shadow-blue-500' : 'border-transparent'}`}
            onClick={() => handleBackgroundChange('dark', darkBg3)}
          />
        </div>
      </div>

      {/* Выбор фона, не зависящего от темы */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Нейтральный фон (не зависит от темы)</h3>
        <div className="flex gap-4">
          <img
            src={neutralBg1}
            alt="Нейтральный фон 1"
            className={`w-32 h-32 cursor-pointer border-4 ${backgrounds.neutral === neutralBg1 ? 'border-green-500 shadow-lg shadow-green-500' : 'border-transparent'}`}
            onClick={() => handleBackgroundChange('neutral', neutralBg1)}
          />
          <img
            src={neutralBg2}
            alt="Нейтральный фон 2"
            className={`w-32 h-32 cursor-pointer border-4 ${backgrounds.neutral === neutralBg2 ? 'border-green-500 shadow-lg shadow-green-500' : 'border-transparent'}`}
            onClick={() => handleBackgroundChange('neutral', neutralBg2)}
          />
          <img
            src={neutralBg3}
            alt="Нейтральный фон 3"
            className={`w-32 h-32 cursor-pointer border-4 ${backgrounds.neutral === neutralBg3 ? 'border-green-500 shadow-lg shadow-green-500' : 'border-transparent'}`}
            onClick={() => handleBackgroundChange('neutral', neutralBg3)}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
