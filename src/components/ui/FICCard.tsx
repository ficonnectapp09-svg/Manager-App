import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { theme } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

export interface FICCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: TouchableOpacityProps['onPress'];
}

export const FICCard: React.FC<FICCardProps> = ({ children, style, onPress }) => {
  const { colors, theme: activeTheme } = useTheme();

  const cardDynamicStyle = [
    styles.card,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      ...activeTheme.elevation.card,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={cardDynamicStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardDynamicStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
  },
});
