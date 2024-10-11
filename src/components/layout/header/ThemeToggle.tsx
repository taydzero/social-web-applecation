import React from 'react';
import { useTheme } from '../../../ThemeContext';

const ThemeToggle: React.FC = () => {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="dark:hover:text-white dark:text-blue-500 hover:text-rose-500 transition-all duration-200"
    >
      switch
    </button>
  );
};

export default ThemeToggle;