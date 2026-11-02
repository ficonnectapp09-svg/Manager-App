import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../context/LanguageContext';

export interface FICBottomTabBarProps {
  currentRoute: string;
  onNavigate: (routeName: string) => void;
  onOpenDrawer?: () => void;
}

export const FICBottomTabBar: React.FC<FICBottomTabBarProps> = ({
  currentRoute,
  onNavigate,
  onOpenDrawer,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 4);

  const activeColor = colors.primary;
  const inactiveColor = colors.textMuted;

  const isHomeActive = currentRoute === 'Dashboard';
  const isTasksActive = currentRoute === 'Tasks' || currentRoute === 'TaskDetail';
  const isVendorsActive =
    currentRoute === 'Vendors' ||
    currentRoute === 'VendorDetail' ||
    currentRoute === 'VendorVisit' ||
    currentRoute === 'AddVendor' ||
    currentRoute === 'FieldManagers' ||
    currentRoute === 'ManagersDirectory' ||
    currentRoute === 'ManagerDetail' ||
    currentRoute === 'Directory' ||
    currentRoute === 'DirectoryHome' ||
    currentRoute === 'FieldAgents';
  const isReportsActive =
    currentRoute === 'Reports' ||
    currentRoute === 'DailyReport' ||
    currentRoute === 'SubordinateReports' ||
    currentRoute === 'ReportDetail' ||
    currentRoute === 'ExceptionReportForm';
  const isProfileActive =
    currentRoute === 'Profile' ||
    currentRoute === 'Settings' ||
    currentRoute === 'More' ||
    currentRoute === 'MoreMenu';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
          borderTopColor: colors.border,
          paddingBottom: bottomInset,
          height: 56 + bottomInset,
        },
      ]}
    >
      {/* Tab 1: Home */}
      <TouchableOpacity
        style={styles.tabButton}
        activeOpacity={0.7}
        onPress={() => onNavigate('Dashboard')}
        accessibilityRole="tab"
        accessibilityState={{ selected: isHomeActive }}
        accessibilityLabel={t('nav_home', 'Home')}
      >
        <Icon
          name="home"
          size={22}
          color={isHomeActive ? activeColor : inactiveColor}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.label,
            { color: inactiveColor },
            isHomeActive && { color: activeColor, fontWeight: '700' },
          ]}
        >
          {t('nav_home', 'Home')}
        </Text>
        {isHomeActive && (
          <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />
        )}
      </TouchableOpacity>

      {/* Tab 2: Tasks */}
      <TouchableOpacity
        style={styles.tabButton}
        activeOpacity={0.7}
        onPress={() => onNavigate('Tasks')}
        accessibilityRole="tab"
        accessibilityState={{ selected: isTasksActive }}
        accessibilityLabel={t('nav_tasks', 'Tasks')}
      >
        <Icon
          name="checkbox-marked-circle-outline"
          size={22}
          color={isTasksActive ? activeColor : inactiveColor}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.label,
            { color: inactiveColor },
            isTasksActive && { color: activeColor, fontWeight: '700' },
          ]}
        >
          {t('nav_tasks', 'Tasks')}
        </Text>
        {isTasksActive && (
          <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />
        )}
      </TouchableOpacity>

      {/* Tab 3: Vendors Directory */}
      <TouchableOpacity
        style={styles.tabButton}
        activeOpacity={0.7}
        onPress={() => onNavigate('Vendors')}
        accessibilityRole="tab"
        accessibilityState={{ selected: isVendorsActive }}
        accessibilityLabel={t('nav_vendors', 'Vendors')}
      >
        <Icon
          name="storefront-outline"
          size={22}
          color={isVendorsActive ? activeColor : inactiveColor}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.label,
            { color: inactiveColor },
            isVendorsActive && { color: activeColor, fontWeight: '700' },
          ]}
        >
          {t('nav_vendors', 'Vendors')}
        </Text>
        {isVendorsActive && (
          <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />
        )}
      </TouchableOpacity>

      {/* Tab 4: Reports */}
      <TouchableOpacity
        style={styles.tabButton}
        activeOpacity={0.7}
        onPress={() => onNavigate('Reports')}
        accessibilityRole="tab"
        accessibilityState={{ selected: isReportsActive }}
        accessibilityLabel={t('nav_reports', 'Reports')}
      >
        <Icon
          name="file-document-outline"
          size={22}
          color={isReportsActive ? activeColor : inactiveColor}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.label,
            { color: inactiveColor },
            isReportsActive && { color: activeColor, fontWeight: '700' },
          ]}
        >
          {t('nav_reports', 'Reports')}
        </Text>
        {isReportsActive && (
          <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />
        )}
      </TouchableOpacity>

      {/* Tab 5: Profile */}
      <TouchableOpacity
        style={styles.tabButton}
        activeOpacity={0.7}
        onPress={() => onNavigate('Profile')}
        accessibilityRole="tab"
        accessibilityState={{ selected: isProfileActive }}
        accessibilityLabel={t('nav_profile', 'Profile')}
      >
        <Icon
          name="account-circle-outline"
          size={22}
          color={isProfileActive ? activeColor : inactiveColor}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.label,
            { color: inactiveColor },
            isProfileActive && { color: activeColor, fontWeight: '700' },
          ]}
        >
          {t('nav_profile', 'Profile')}
        </Text>
        {isProfileActive && (
          <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  tabIcon: {
    marginBottom: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 2,
  },
});
