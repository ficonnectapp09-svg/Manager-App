import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

export interface FICSectionHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const FICSectionHeader: React.FC<FICSectionHeaderProps> = ({
  title,
  subtitle,
  rightAction,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textWrapper}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightAction}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    ...theme.typography.title,
    fontSize: 16,
  },
  subtitle: {
    ...theme.typography.caption,
    marginTop: 2,
  },
});
