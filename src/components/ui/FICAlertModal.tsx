import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface FICAlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  cancelable?: boolean;
}

export const FICAlertModal: React.FC<FICAlertModalProps> = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
  cancelable = true,
}) => {
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  // Determine icon and theme color based on title & message
  const lowerTitle = (title || '').toLowerCase();
  const lowerMsg = (message || '').toLowerCase();

  let iconName = 'information-outline';
  let iconColor = isDark ? '#38BDF8' : '#1D4ED8';
  let iconBg = isDark ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF';
  let iconBorder = isDark ? '#0284C7' : '#BFDBFE';
  let primaryBtnBg = isDark ? '#0284C7' : '#1D4ED8';

  if (
    lowerTitle.includes('resolved') ||
    lowerTitle.includes('success') ||
    lowerTitle.includes('completed') ||
    lowerTitle.includes('saved') ||
    lowerTitle.includes('accepted') ||
    lowerTitle.includes('resumed')
  ) {
    iconName = 'check-circle-outline';
    iconColor = colors.success;
    iconBg = isDark ? 'rgba(34, 197, 94, 0.15)' : '#ECFDF5';
    iconBorder = isDark ? '#16A34A' : '#A7F3D0';
    primaryBtnBg = isDark ? '#16A34A' : '#059669';
  } else if (
    lowerTitle.includes('error') ||
    lowerTitle.includes('failed') ||
    lowerTitle.includes('blocked') ||
    lowerTitle.includes('rejected') ||
    lowerTitle.includes('declined') ||
    lowerTitle.includes('delete') ||
    lowerTitle.includes('logout')
  ) {
    iconName = 'alert-circle-outline';
    iconColor = colors.error;
    iconBg = isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2';
    iconBorder = isDark ? '#DC2626' : '#FECACA';
    primaryBtnBg = colors.error;
  } else if (
    lowerTitle.includes('warning') ||
    lowerTitle.includes('required') ||
    lowerTitle.includes('validation') ||
    lowerTitle.includes('decision') ||
    lowerTitle.includes('offline')
  ) {
    iconName = 'alert-outline';
    iconColor = colors.warning;
    iconBg = isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB';
    iconBorder = isDark ? '#D97706' : '#FDE68A';
    primaryBtnBg = colors.warning;
  }

  const effectiveButtons: AlertButton[] =
    buttons && buttons.length > 0 ? buttons : [{ text: 'OK', style: 'default' }];

  const handleButtonPress = (btn: AlertButton) => {
    if (onDismiss) onDismiss();
    if (btn.onPress) {
      setTimeout(() => {
        btn.onPress?.();
      }, 50);
    }
  };

  const handleBackdropPress = () => {
    if (cancelable && onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleBackdropPress}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Icon */}
              <View style={[styles.iconCircle, { backgroundColor: iconBg, borderColor: iconBorder }]}>
                <Icon name={iconName} size={32} color={iconColor} />
              </View>

              {/* Title */}
              {title ? (
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              ) : null}

              {/* Message */}
              {message ? (
                <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
              ) : null}

              {/* Buttons */}
              <View style={effectiveButtons.length === 2 ? styles.buttonRow : styles.buttonCol}>
                {effectiveButtons.map((btn, index) => {
                  const isCancel = btn.style === 'cancel';
                  const isDestructive = btn.style === 'destructive';

                  let btnStyle = styles.primaryBtn;
                  let btnTextStyle: any = styles.primaryBtnText;
                  let dynamicBg = { backgroundColor: primaryBtnBg };

                  if (isCancel) {
                    btnStyle = [
                      styles.cancelBtn,
                      {
                        backgroundColor: isDark ? colors.surface : '#F1F5F9',
                        borderColor: colors.border,
                      },
                    ];
                    btnTextStyle = [styles.cancelBtnText, { color: colors.textSecondary }];
                    dynamicBg = { backgroundColor: isDark ? colors.surface : '#F1F5F9' };
                  } else if (isDestructive) {
                    dynamicBg = { backgroundColor: colors.error };
                  }

                  return (
                    <TouchableOpacity
                      key={`alert_btn_${index}`}
                      style={[
                        styles.buttonBase,
                        btnStyle,
                        dynamicBg,
                        effectiveButtons.length === 2 ? { flex: 1 } : null,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleButtonPress(btn)}
                    >
                      <Text style={[styles.btnTextBase, btnTextStyle]}>
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 1,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  buttonCol: {
    width: '100%',
    gap: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  buttonBase: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {},
  cancelBtn: {
    borderWidth: 1,
  },
  btnTextBase: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryBtnText: {
    color: '#FFFFFF',
  },
  cancelBtnText: {},
});
