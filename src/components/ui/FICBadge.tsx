import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

export interface FICBadgeProps {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const FICBadge: React.FC<FICBadgeProps> = ({
  label,
  backgroundColor,
  textColor,
  icon,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const finalBg = backgroundColor || colors.divider;
  const finalTextColor = textColor || colors.textSecondary;

  return (
    <View style={[styles.badge, { backgroundColor: finalBg }, style]}>
      {icon}
      <Text style={[styles.text, { color: finalTextColor }, icon ? { marginLeft: 4 } : null, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
});
