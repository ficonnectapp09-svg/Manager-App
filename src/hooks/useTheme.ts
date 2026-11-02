import { useThemeContext, ThemeContextValue } from '../context/ThemeContext';

export const useTheme = (): ThemeContextValue => {
  return useThemeContext();
};

export type { ThemeMode, ThemeContextValue } from '../context/ThemeContext';
