import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { FICButton } from '../ui/FICButton';

export interface FICErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const FICErrorState: React.FC<FICErrorStateProps> = ({
  title = 'Service Unavailable',
  message = 'Failed to load data. Please check your network connection and try again.',
  onRetry,
  style,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : colors.errorLight,
          borderColor: colors.error,
        },
        style,
      ]}
    >
      <Text style={[styles.iconPlaceholder, { color: colors.error }]}>⚠</Text>
      <Text style={[styles.title, { color: colors.error }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <FICButton title="Retry Request" onPress={onRetry} variant="outline" size="sm" style={styles.button} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginVertical: theme.spacing.md,
  },
  iconPlaceholder: {
    fontSize: 28,
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.title,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.bodySmall,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  button: {},
});
