import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';

export interface DropdownOption {
  label: string;
  value: string;
  subtitle?: string;
}

export interface FICDropdownModalProps {
  visible: boolean;
  title: string;
  options: (DropdownOption | string)[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const FICDropdownModal: React.FC<FICDropdownModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const { colors, isDark } = useTheme();

  const normalizedOptions: DropdownOption[] = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.contentContainer,
                {
                  backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
                  borderTopWidth: isDark ? 1 : 0,
                  borderTopColor: colors.border,
                },
              ]}
            >
              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View
                  style={[
                    styles.dragHandle,
                    { backgroundColor: isDark ? colors.border : '#CBD5E1' },
                  ]}
                />
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={[
                      styles.closeBtn,
                      { backgroundColor: isDark ? colors.surface : '#F8FAFC' },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                {normalizedOptions.map(item => {
                  const isSelected = item.value === selectedValue;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.optionRow,
                        { backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF' },
                        isSelected && [
                          styles.optionRowSelected,
                          { backgroundColor: isDark ? colors.surface : '#EFF6FF' },
                        ],
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelect(item.value);
                        onClose();
                      }}
                    >
                      <View style={styles.optionTextCol}>
                        <Text
                          style={[
                            styles.optionLabel,
                            { color: colors.text },
                            isSelected && { color: colors.primary, fontWeight: '700' },
                          ]}
                        >
                          {item.label}
                        </Text>
                        {item.subtitle ? (
                          <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </View>
                      {isSelected && (
                        <Icon name="check-circle" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  contentContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
  },
  optionsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 3,
  },
  optionRowSelected: {},
  optionTextCol: {
    flex: 1,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
