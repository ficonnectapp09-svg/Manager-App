import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

export interface FICDividerProps {
  style?: ViewStyle;
}

export const FICDivider: React.FC<FICDividerProps> = ({ style }) => {
  const { colors } = useTheme();

  return <View style={[styles.divider, { backgroundColor: colors.divider }, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginVertical: theme.spacing.sm,
  },
});
