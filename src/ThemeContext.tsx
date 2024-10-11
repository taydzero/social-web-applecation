import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Импортируем фоны
import lightBg1 from './assets/lightBg1.gif';
import lightBg2 from './assets/lightBg2.gif';
import lightBg3 from './assets/lightBg3.gif';
import darkBg1 from './assets/darkBg1.gif';
import darkBg2 from './assets/darkBg2.gif';
import darkBg3 from './assets/darkBg3.gif';
import neutralBg1 from './assets/neutralBg1.gif';  // Добавляем нейтральные фоны
import neutralBg2 from './assets/neutralBg2.gif';
import neutralBg3 from './assets/neutralBg3.gif';

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  backgrounds: {
    light: string;
    dark: string;
    neutral: string; // Добавляем нейтральный фон
  };
  setBackground: (theme: 'light' | 'dark' | 'neutral', bg: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [backgrounds, setBackgrounds] = useState<{ light: string; dark: string; neutral: string }>({
    light: lightBg1,
    dark: darkBg1,
    neutral: neutralBg1, // начальный нейтральный фон
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }

    const savedBackgrounds = localStorage.getItem('backgrounds');
    if (savedBackgrounds) {
      setBackgrounds(JSON.parse(savedBackgrounds));
    }
  }, []);

  useEffect(() => {
    if (backgrounds.neutral) {
      document.body.style.backgroundImage = `url(${backgrounds.neutral})`; // Если выбран нейтральный фон
    } else {
      document.body.style.backgroundImage = `url(${backgrounds[theme]})`; // В противном случае выбираем фон в зависимости от темы
    }
    document.body.className = ''; // Удаляем предыдущие классы
    document.body.classList.add(theme);
}, [theme, backgrounds]);



  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setBackground = (themeType: 'light' | 'dark' | 'neutral', bg: string) => {
    if (themeType === 'neutral') {
      // Применяем нейтральный фон и очищаем фон тем
      setBackgrounds(prev => ({
        ...prev,
        neutral: bg,
      }));
    } else {
      // Очищаем нейтральный фон при выборе темы
      setBackgrounds(prev => ({
        ...prev,
        [themeType]: bg,
        neutral: '',
      }));
    }
};



  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, backgrounds, setBackground }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
