import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface FICAvatarProps {
  name: string;
  sourceUrl?: string;
  size?: number;
  style?: ViewStyle;
}

export const FICAvatar: React.FC<FICAvatarProps> = ({
  name,
  sourceUrl,
  size = 40,
  style,
}) => {
  const { colors, isDark } = useTheme();

  const getInitials = (str: string) => {
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  if (sourceUrl) {
    const imageStyle: ImageStyle = {
      width: size,
      height: size,
      borderRadius: size / 2,
    };
    return (
      <Image
        source={{ uri: sourceUrl }}
        style={[styles.avatar, { backgroundColor: colors.divider }, imageStyle]}
      />
    );
  }

  return (
    <View
      style={[
        styles.initialsContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isDark ? colors.surfaceElevated : colors.primary,
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? colors.border : 'transparent',
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initialsText,
          {
            fontSize: size * 0.4,
            color: isDark ? colors.goldAccent || '#F2A900' : colors.accent,
          },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#E2E8F0',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontWeight: '700',
  },
});
