import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { Theme, ThemeColors, lightTheme, darkTheme } from '../theme';
import { services } from '../services';
import { apiClient } from '../services/api/ApiClient';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const STORAGE_KEY_THEME_MODE = 'APP_THEME_MODE';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  // Bootstrap theme preference from persistent storage
  useEffect(() => {
    let isMounted = true;
    const loadPersistedTheme = async () => {
      try {
        const stored = await services.storageService.getItem(STORAGE_KEY_THEME_MODE);
        if (isMounted && stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
          setMode(stored as ThemeMode);
        }
      } catch (err) {
        console.warn('[ThemeContext] Error restoring persisted theme:', err);
      }
    };
    loadPersistedTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for device system appearance toggles (Android / iOS)
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Compute active theme scheme
  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const activeTheme = isDark ? darkTheme : lightTheme;

  // Persist and apply selected theme mode
  const setThemeMode = useCallback(async (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      await services.storageService.setItem(STORAGE_KEY_THEME_MODE, newMode);
    } catch (e) {
      console.warn('[ThemeContext] Failed to save theme mode persistently:', e);
    }

    // Non-blocking server preference sync
    (async () => {
      try {
        const token = await services.storageService.getAuthToken();
        if (token) {
          await apiClient.put('/settings', { theme: newMode }, { token, timeoutMs: 5000 });
        }
      } catch {
        // Silent catch for offline or non-blocking sync
      }
    })();
  }, []);

  const value: ThemeContextValue = {
    theme: activeTheme,
    colors: activeTheme.colors,
    isDark,
    mode,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if invoked outside provider
    return {
      theme: lightTheme,
      colors: lightTheme.colors,
      isDark: false,
      mode: 'light',
      setThemeMode: async () => {},
    };
  }
  return context;
};

