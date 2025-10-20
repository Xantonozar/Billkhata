import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <>
            <SunIcon className="w-5 h-5 mr-2 text-yellow-400" />
            <span className="text-sm font-medium">Light Mode</span>
        </>
      ) : (
        <>
            <MoonIcon className="w-5 h-5 mr-2 text-gray-700" />
            <span className="text-sm font-medium">Dark Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
