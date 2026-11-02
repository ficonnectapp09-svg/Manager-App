import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { AppProviders } from './providers/AppProviders';
import { AuthGuard } from '../navigation/guards/AuthGuard';
import { useTheme } from '../hooks/useTheme';

const MainAppContent: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={isDark ? colors.background : colors.primaryDark}
        barStyle="light-content"
        translucent={false}
      />
      <AuthGuard />
    </View>
  );
};

const App: React.FC = () => {
  return (
    <AppProviders>
      <MainAppContent />
    </AppProviders>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
