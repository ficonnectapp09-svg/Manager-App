/**
 * Central Theme System Export
 * Provides Light and Dark Theme definitions
 */
import { lightColors, darkColors, colors, ThemeColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { elevation, darkElevation } from './elevation';

export const createTheme = (colorPalette: ThemeColors, isDark: boolean) => ({
  colors: colorPalette,
  isDark,
  typography,
  spacing,
  radius,
  elevation: isDark ? darkElevation : elevation,
});

export const lightTheme = createTheme(lightColors, false);
export const darkTheme = createTheme(darkColors, true);

// Default export preserved for backward-compatibility
export const theme = lightTheme;

export type Theme = typeof lightTheme;
export { lightColors, darkColors, colors, typography, spacing, radius, elevation };
export type { ThemeColors };
