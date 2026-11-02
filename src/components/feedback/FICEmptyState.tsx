import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { FICButton } from '../ui/FICButton';

export interface FICEmptyStateProps {
  title?: string;
  description?: string;
  message?: string;
  actionTitle?: string;
  onAction?: () => void;
  onActionPress?: () => void;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const FICEmptyState: React.FC<FICEmptyStateProps> = ({
  title = 'No Records Found',
  description,
  message,
  actionTitle,
  onAction,
  onActionPress,
  style,
  icon,
}) => {
  const { colors } = useTheme();
  const descText = message || description || 'There are no items matching your filter or assigned scope.';
  const actionHandler = onActionPress || onAction;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{descText}</Text>
      {actionTitle && actionHandler && (
        <FICButton title={actionTitle} onPress={actionHandler} style={styles.button} size="sm" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginVertical: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...theme.typography.bodySmall,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});
