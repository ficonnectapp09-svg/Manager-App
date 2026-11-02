import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

export interface FICListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const FICListItem: React.FC<FICListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.divider,
        },
        style,
      ]}
    >
      {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
      <View style={styles.contentWrapper}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: theme.spacing.touchTargetMin,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
  },
  leftIconWrapper: {
    marginRight: theme.spacing.md,
  },
  contentWrapper: {
    flex: 1,
  },
  title: {
    ...theme.typography.body,
  },
  subtitle: {
    ...theme.typography.caption,
    marginTop: 2,
  },
  rightIconWrapper: {
    marginLeft: theme.spacing.md,
  },
});
