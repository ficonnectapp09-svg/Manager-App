import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

export interface FICTextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  isPasswordToggleable?: boolean;
}

export const FICTextInput: React.FC<FICTextInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  secureTextEntry = false,
  isPasswordToggleable = false,
  ...rest
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setIsSecure(prev => !prev);
  };

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? colors.inputBackground : colors.surface,
            borderColor: getBorderColor(),
          },
          isFocused && { backgroundColor: isDark ? colors.inputBackground : colors.surface },
          disabled && { backgroundColor: colors.divider, borderColor: colors.border },
        ]}
      >
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
        <RNTextInput
          style={[
            styles.input,
            { color: colors.text },
            inputStyle,
            disabled && { color: colors.textMuted },
          ]}
          placeholderTextColor={colors.textMuted}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          accessibilityLabel={label}
          {...rest}
        />
        {isPasswordToggleable ? (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.toggleButton}
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
            accessibilityRole="button"
          >
            <Text style={[styles.toggleText, { color: colors.primary }]}>{isSecure ? 'SHOW' : 'HIDE'}</Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconWrapper}>{rightIcon}</View>
        ) : null}
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]} accessibilityRole="alert">
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    minHeight: theme.spacing.touchTargetMin,
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    paddingVertical: theme.spacing.sm,
  },
  leftIconWrapper: {
    marginRight: theme.spacing.xs,
  },
  rightIconWrapper: {
    marginLeft: theme.spacing.xs,
  },
  toggleButton: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  toggleText: {
    ...theme.typography.caption,
    fontWeight: '700',
  },
  errorText: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    ...theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
});
