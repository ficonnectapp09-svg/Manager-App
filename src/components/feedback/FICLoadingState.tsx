import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

export interface FICLoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export const FICLoadingState: React.FC<FICLoadingStateProps> = ({
  message = 'Loading details...',
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  message: {
    ...theme.typography.bodySmall,
    marginTop: theme.spacing.md,
  },
});
