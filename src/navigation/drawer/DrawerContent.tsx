import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { services } from '../../services';
import { FICAvatar } from '../../components/ui/FICAvatar';
import { ASSETS } from '../../assets/logo';

export interface DrawerContentProps {
  currentRoute: string;
  onNavigate: (routeName: string) => void;
}

export interface DrawerItemConfig {
  key: string;
  label: string;
  iconName: string;
  badge?: string;
}

export interface DrawerSectionConfig {
  sectionTitle?: string;
  items: DrawerItemConfig[];
}

export const DRAWER_SECTIONS: DrawerSectionConfig[] = [
  {
    items: [
      { key: 'Dashboard', label: 'Home / Dashboard', iconName: 'view-dashboard-outline' },
      { key: 'Tasks', label: 'Tasks', iconName: 'checkbox-marked-circle-outline' },
    ],
  },
  {
    sectionTitle: 'TERRITORY DIRECTORIES',
    items: [
      {
        key: 'Vendors',
        label: 'Vendor Directory',
        iconName: 'storefront-outline',
        badge: 'Merchants',
      },
      {
        key: 'FieldManagers',
        label: 'Manager Directory',
        iconName: 'account-tie-outline',
        badge: 'Supervisors',
      },
      {
        key: 'FieldAgents',
        label: 'Agent Directory',
        iconName: 'account-group-outline',
        badge: 'Ground Force',
      },
    ],
  },
  {
    sectionTitle: 'REPORTS & PERFORMANCE',
    items: [
      { key: 'Reports', label: 'Daily & Field Reports', iconName: 'file-document-outline' },
      { key: 'Leaderboard', label: 'Territory Leaderboard', iconName: 'trophy-outline' },
    ],
  },
  {
    sectionTitle: 'MANAGEMENT & SETTINGS',
    items: [
      { key: 'Issues', label: 'Issues & Escalations', iconName: 'alert-circle-outline' },
      { key: 'Notifications', label: 'Notifications', iconName: 'bell-outline' },
      { key: 'Profile', label: 'My Profile', iconName: 'account-outline' },
      { key: 'Settings', label: 'Settings', iconName: 'cog-outline' },
    ],
  },
];

// Flat export for backwards compatibility
export const DRAWER_MENU_ITEMS = DRAWER_SECTIONS.flatMap(section =>
  section.items.map(item => ({
    key: item.key,
    label: item.label,
    icon: item.iconName,
  }))
);

export const DrawerContent: React.FC<DrawerContentProps> = ({ currentRoute, onNavigate }) => {
  const { manager, logout } = useAuth();
  const { colors, isDark } = useTheme();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const loadUnreadCount = async () => {
      try {
        const count = await services.notificationRepository.getUnreadCount(manager?.id || 'mgr-001');
        if (isMounted) {
          setUnreadCount(count);
        }
      } catch {
        // Ignore failure
      }
    };
    loadUnreadCount();
    return () => {
      isMounted = false;
    };
  }, [manager, currentRoute]);

  const territoryScope =
    manager?.territoryName ||
    (manager?.stateId === 'st-tn-01' ? 'Tamil Nadu' : 'Indore District');

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
      {/* Top Brand Logo Bar */}
      <View
        style={[
          styles.brandBar,
          {
            backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Image
          source={ASSETS.logo}
          style={styles.brandLogo}
          resizeMode="contain"
          accessibilityLabel="Forge India Connect Logo"
        />
      </View>

      {/* Header Profile Summary */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? colors.surfaceElevated : '#0B4A8B',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <FICAvatar
          name={manager?.name || 'Manager'}
          sourceUrl={manager?.avatarUrl || manager?.profileImage}
          size={48}
        />
        <View style={styles.profileText}>
          <Text style={styles.name} numberOfLines={1}>
            {manager?.name || 'Manager'}
          </Text>
          <Text style={styles.role}>
            {manager?.role ? String(manager.role).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'FIELD MANAGER'}
          </Text>
          <Text style={[styles.territoryScopeText, { color: isDark ? colors.textSecondary : '#E2E8F0' }]} numberOfLines={1}>
            📍 {territoryScope}
          </Text>
        </View>
      </View>

      {/* Navigation Sections */}
      <ScrollView
        style={[styles.menuList, { backgroundColor: isDark ? colors.background : '#FFFFFF' }]}
        showsVerticalScrollIndicator={false}
      >
        {DRAWER_SECTIONS.map((section, sIdx) => (
          <View key={`section-${sIdx}`} style={[styles.sectionContainer, { borderBottomColor: colors.border }]}>
            {section.sectionTitle ? (
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitleText, { color: colors.textMuted }]}>{section.sectionTitle}</Text>
              </View>
            ) : null}

            {section.items.map(item => {
              const isActive = currentRoute === item.key;
              const isNotificationItem = item.key === 'Notifications';
              const isDirectorySection = section.sectionTitle === 'TERRITORY DIRECTORIES';

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.menuItem,
                    isActive && [
                      styles.activeItem,
                      {
                        backgroundColor: isDark ? colors.surfaceElevated : '#EFF6FF',
                        borderLeftColor: colors.primary,
                      },
                    ],
                    isDirectorySection && !isActive && [
                      styles.directoryItem,
                      { backgroundColor: isDark ? 'transparent' : '#FAFCFF' },
                    ],
                  ]}
                  activeOpacity={0.7}
                  onPress={() => onNavigate(item.key)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isDark ? colors.surfaceElevated : '#F1F5F9' },
                      isActive && [styles.activeIconCircle, { backgroundColor: colors.primary }],
                      isDirectorySection && !isActive && [
                        styles.directoryIconCircle,
                        { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#DBEAFE' },
                      ],
                    ]}
                  >
                    <Icon
                      name={item.iconName}
                      size={20}
                      color={
                        isActive
                          ? (isDark ? '#0B1220' : '#FFFFFF')
                          : isDirectorySection
                          ? colors.primary
                          : colors.textSecondary
                      }
                    />
                  </View>

                  <View style={styles.itemTextCol}>
                    <Text
                      style={[
                        styles.itemLabel,
                        { color: colors.text },
                        isActive && [styles.activeLabel, { color: colors.primary }],
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>

                  {item.badge && !isActive ? (
                    <View
                      style={[
                        styles.tagBadge,
                        {
                          backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF',
                          borderColor: isDark ? colors.border : '#DBEAFE',
                        },
                      ]}
                    >
                      <Text style={[styles.tagBadgeText, { color: colors.primary }]}>{item.badge}</Text>
                    </View>
                  ) : null}

                  {isNotificationItem && unreadCount > 0 ? (
                    <View style={styles.badgeCircle}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  ) : null}

                  <Icon
                    name="chevron-right"
                    size={16}
                    color={isActive ? colors.primary : colors.textMuted}
                    style={styles.chevron}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Footer Logout */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF',
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FEE2E2',
            },
          ]}
          activeOpacity={0.75}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <Icon name="logout" size={18} color={colors.error} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  brandBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.md,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  brandLogo: {
    width: 150,
    height: 38,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  profileText: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  role: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F2A900',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  territoryScopeText: {
    fontSize: 11,
    marginTop: 2,
  },
  menuList: {
    flex: 1,
  },
  sectionContainer: {
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  sectionHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitleText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 1,
    borderRadius: 10,
  },
  directoryItem: {},
  activeItem: {
    borderLeftWidth: 3,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  directoryIconCircle: {},
  activeIconCircle: {},
  itemTextCol: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  activeLabel: {
    fontWeight: '700',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeCircle: {
    backgroundColor: '#EF4444',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 4,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
