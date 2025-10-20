
import { useContext } from 'react';
// Similarly to useAuth, this re-exports the hook from the context file.
import { ThemeProvider, useTheme as useThemeFromContext } from '../contexts/ThemeContext';

/**
 * Custom hook to access theme context.
 * This is a convenience hook that forwards to the implementation in ThemeContext.
 */
export const useTheme = useThemeFromContext;
