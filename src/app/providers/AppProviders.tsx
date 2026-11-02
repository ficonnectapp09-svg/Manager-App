import React, { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthProvider } from '../../store/AuthContext';
import { AlertProvider } from '../../context/AlertContext';
import { LanguageProvider } from '../../context/LanguageContext';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AlertProvider>
            <AuthProvider>{children}</AuthProvider>
          </AlertProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};
