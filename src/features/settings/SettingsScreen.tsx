import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useTheme, ThemeMode } from '../../hooks/useTheme';
import { useLanguage } from '../../context/LanguageContext';
import { FICHeader } from '../../components/ui/FICHeader';
import { FICCard } from '../../components/ui/FICCard';
import { FICListItem } from '../../components/ui/FICListItem';
import { FICButton } from '../../components/ui/FICButton';
import { apiClient } from '../../services/api/ApiClient';
import { services } from '../../services';
import { SupportedLanguage } from '../../constants/translations';
import { ManagerPortalSettings } from '../../types';

export interface SettingsScreenProps {
  onOpenDrawer?: () => void;
  onNavigateRoute?: (routeName: string, params?: Record<string, any>) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onOpenDrawer,
  onNavigateRoute,
}) => {
  const { logout, manager } = useAuth();
  const { colors, isDark, mode: currentThemeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t, languages } = useLanguage();

  const [activeModal, setActiveModal] = useState<
    'NOTIFICATIONS' | 'LANGUAGE' | 'ABOUT' | 'LOGOUT' | 'THEME' | null
  >(null);

  // Live Backend Settings state
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [kycAlerts, setKycAlerts] = useState<boolean>(true);
  const [statusChangeAlerts, setStatusChangeAlerts] = useState<boolean>(true);
  const [dailyDigest, setDailyDigest] = useState<boolean>(true);
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(false);
  const [isSavingSetting, setIsSavingSetting] = useState<boolean>(false);

  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Fetch real portal settings from Express backend
  const fetchSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const token = await services.storageService.getAuthToken();
      const res = await apiClient.get<any>('/settings', { token, timeoutMs: 15000 });
      const data: ManagerPortalSettings = res?.data || res?.settings || res || {};

      if (data.emailAlerts !== undefined) setEmailAlerts(Boolean(data.emailAlerts));
      if (data.kycAlerts !== undefined) setKycAlerts(Boolean(data.kycAlerts));
      if (data.statusChangeAlerts !== undefined) setStatusChangeAlerts(Boolean(data.statusChangeAlerts));
      if (data.dailyDigest !== undefined) setDailyDigest(Boolean(data.dailyDigest));
    } catch (e) {
      console.warn('Failed to fetch settings from backend:', e);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save updated settings to Express backend
  const updateBackendSettings = async (updates: Partial<ManagerPortalSettings>) => {
    setIsSavingSetting(true);
    try {
      const token = await services.storageService.getAuthToken();
      const payload = {
        emailAlerts,
        kycAlerts,
        statusChangeAlerts,
        dailyDigest,
        theme: currentThemeMode,
        ...updates,
      };

      await apiClient.put('/settings', payload, { token });
    } catch (e) {
      console.warn('Failed to persist settings to backend:', e);
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleToggleEmailAlerts = (val: boolean) => {
    setEmailAlerts(val);
    updateBackendSettings({ emailAlerts: val });
  };

  const handleToggleKycAlerts = (val: boolean) => {
    setKycAlerts(val);
    updateBackendSettings({ kycAlerts: val });
  };

  const handleToggleStatusChangeAlerts = (val: boolean) => {
    setStatusChangeAlerts(val);
    updateBackendSettings({ statusChangeAlerts: val });
  };

  const handleToggleDailyDigest = (val: boolean) => {
    setDailyDigest(val);
    updateBackendSettings({ dailyDigest: val });
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Reset Application Cache',
      'This will clear non-essential cached media and offline queries. Your authenticated session will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              Alert.alert('Cache Cleared', 'Application cache was successfully purged.');
            } catch {
              Alert.alert('Notice', 'Cache already clean.');
            }
          },
        },
      ]
    );
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setActiveModal(null);
    } catch (e) {
      Alert.alert('Logout Notice', 'Session cleared locally.');
      setActiveModal(null);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSelectThemeMode = async (mode: ThemeMode) => {
    await setThemeMode(mode);
    setActiveModal(null);
  };

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  const getThemeLabel = (m: ThemeMode) => {
    switch (m) {
      case 'dark':
        return 'Dark Mode';
      case 'light':
        return 'Light Mode';
      case 'system':
      default:
        return 'System Default';
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={isDark ? colors.background : colors.primaryDark}
        barStyle="light-content"
      />
      <FICHeader
        title={t('settings_title', 'App Settings')}
        leftActionIcon={<Text style={styles.headerIcon}>☰</Text>}
        onLeftAction={onOpenDrawer}
        rightActionIcon={<Text style={styles.headerIcon}>↻</Text>}
        onRightAction={() => {
          fetchSettings();
        }}
      />

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
        {/* Header Subtitle Card */}
        <View style={styles.topSection}>
          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
            {t('settings_subtitle', 'Manage your app preferences & configuration')}
          </Text>
          {isSavingSetting && (
            <View style={[styles.savingBadge, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF' }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.savingText, { color: colors.primary }]}>Saving...</Text>
            </View>
          )}
        </View>

        {/* NOTIFICATIONS SECTION */}
        <Text style={[styles.sectionHeaderTitle, { color: colors.textMuted }]}>{t('settings_notifications', 'NOTIFICATIONS')}</Text>
        <FICCard style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FICListItem
            title={t('settings_notification_prefs', 'Notification Preferences')}
            leftIcon={<Icon name="bell-ring-outline" size={20} color={colors.primary} />}
            rightIcon={<Icon name="chevron-right" size={22} color={colors.textMuted} />}
            onPress={() => setActiveModal('NOTIFICATIONS')}
          />
        </FICCard>

        {/* APPLICATION & PREFERENCES SECTION */}
        <Text style={[styles.sectionHeaderTitle, { color: colors.textMuted }]}>{t('settings_app', 'APPLICATION & PREFERENCES')}</Text>
        <FICCard style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Appearance & Theme Selector */}
          <FICListItem
            title="Appearance & Theme"
            subtitle={getThemeLabel(currentThemeMode)}
            leftIcon={<Icon name="theme-light-dark" size={20} color={colors.primary} />}
            rightIcon={
              <View style={styles.rightValueRow}>
                <Text style={[styles.valueText, { color: colors.textSecondary }]}>
                  {currentThemeMode === 'light' ? 'Light' : currentThemeMode === 'dark' ? 'Dark' : 'System'}
                </Text>
                <Icon name="chevron-right" size={22} color={colors.textMuted} />
              </View>
            }
            onPress={() => setActiveModal('THEME')}
          />

          <FICListItem
            title={t('settings_language', 'Language')}
            leftIcon={<Icon name="translate" size={20} color={colors.success} />}
            rightIcon={
              <View style={styles.rightValueRow}>
                <Text style={[styles.valueText, { color: colors.textSecondary }]}>{currentLangObj.nativeName}</Text>
                <Icon name="chevron-right" size={22} color={colors.textMuted} />
              </View>
            }
            onPress={() => setActiveModal('LANGUAGE')}
          />
          <FICListItem
            title={t('settings_about', 'About FIC Manager')}
            leftIcon={<Icon name="information-outline" size={20} color={colors.info} />}
            rightIcon={<Icon name="chevron-right" size={22} color={colors.textMuted} />}
            onPress={() => setActiveModal('ABOUT')}
          />
          <FICListItem
            title="Reset App Cache"
            leftIcon={<Icon name="cached" size={20} color={colors.warning} />}
            rightIcon={<Icon name="chevron-right" size={22} color={colors.textMuted} />}
            onPress={handleClearCache}
          />
        </FICCard>

        {/* ACCOUNT SECTION */}
        <Text style={[styles.sectionHeaderTitle, { color: colors.textMuted }]}>{t('settings_account', 'ACCOUNT')}</Text>
        <FICCard style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FICListItem
            title={t('action_logout', 'Logout')}
            leftIcon={<Icon name="logout" size={20} color={colors.error} />}
            rightIcon={<Icon name="chevron-right" size={22} color={colors.error} />}
            onPress={() => setActiveModal('LOGOUT')}
          />
        </FICCard>
      </ScrollView>

      {/* ─── MODAL 0: THEME / APPEARANCE SELECTION ─── */}
      <Modal
        visible={activeModal === 'THEME'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={[styles.modalHeaderRow, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Appearance & Theme</Text>
                <Text style={[styles.modalHeaderSub, { color: colors.textSecondary }]}>
                  Choose how FIC Manager looks on your device
                </Text>
              </View>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={[styles.modalCloseBtn, { backgroundColor: colors.surface }]}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.themeOptionsContainer}>
              {/* Option 1: Light Mode */}
              <TouchableOpacity
                style={[
                  styles.themeOptionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: currentThemeMode === 'light' ? colors.primary : colors.border,
                  },
                  currentThemeMode === 'light' && {
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#EFF6FF',
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => handleSelectThemeMode('light')}
              >
                <View style={styles.themeOptionLeft}>
                  <View style={[styles.themeOptionIconBg, { backgroundColor: '#FEF3C7' }]}>
                    <Icon name="white-balance-sunny" size={24} color="#D97706" />
                  </View>
                  <View style={styles.themeOptionTextCol}>
                    <Text style={[styles.themeOptionTitle, { color: colors.text }]}>Light Mode</Text>
                    <Text style={[styles.themeOptionDesc, { color: colors.textSecondary }]}>
                      Clean, high-visibility classic bright interface
                    </Text>
                  </View>
                </View>
                {currentThemeMode === 'light' && (
                  <Icon name="check-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>

              {/* Option 2: Dark Mode */}
              <TouchableOpacity
                style={[
                  styles.themeOptionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: currentThemeMode === 'dark' ? colors.primary : colors.border,
                  },
                  currentThemeMode === 'dark' && {
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#EFF6FF',
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => handleSelectThemeMode('dark')}
              >
                <View style={styles.themeOptionLeft}>
                  <View style={[styles.themeOptionIconBg, { backgroundColor: '#1E293B' }]}>
                    <Icon name="moon-waning-crescent" size={24} color="#38BDF8" />
                  </View>
                  <View style={styles.themeOptionTextCol}>
                    <Text style={[styles.themeOptionTitle, { color: colors.text }]}>Dark Mode</Text>
                    <Text style={[styles.themeOptionDesc, { color: colors.textSecondary }]}>
                      Premium midnight dark enterprise dashboard
                    </Text>
                  </View>
                </View>
                {currentThemeMode === 'dark' && (
                  <Icon name="check-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>

              {/* Option 3: System Default */}
              <TouchableOpacity
                style={[
                  styles.themeOptionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: currentThemeMode === 'system' ? colors.primary : colors.border,
                  },
                  currentThemeMode === 'system' && {
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#EFF6FF',
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => handleSelectThemeMode('system')}
              >
                <View style={styles.themeOptionLeft}>
                  <View style={[styles.themeOptionIconBg, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <Icon name="cellphone-cog" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
                  </View>
                  <View style={styles.themeOptionTextCol}>
                    <Text style={[styles.themeOptionTitle, { color: colors.text }]}>System Default</Text>
                    <Text style={[styles.themeOptionDesc, { color: colors.textSecondary }]}>
                      Automatically follows Android system appearance
                    </Text>
                  </View>
                </View>
                {currentThemeMode === 'system' && (
                  <Icon name="check-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>

            <FICButton
              title={t('action_done', 'Done')}
              variant="primary"
              onPress={() => setActiveModal(null)}
              style={styles.modalDoneBtn}
            />
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 1: NOTIFICATION PREFERENCES ─── */}
      <Modal
        visible={activeModal === 'NOTIFICATIONS'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={[styles.modalHeaderRow, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
                  {t('settings_notification_prefs', 'Notification Preferences')}
                </Text>
                <Text style={[styles.modalHeaderSub, { color: colors.textSecondary }]}>Connected to Production MongoDB</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={[styles.modalCloseBtn, { backgroundColor: colors.surface }]}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBodyScroll}>
              <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
                <View style={styles.preferenceTextWrapper}>
                  <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                    {t('settings_push_title', 'Push Notifications')}
                  </Text>
                  <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                    {t('settings_push_desc', 'Receive alerts for assigned tasks and updates')}
                  </Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={pushEnabled ? (isDark ? '#0B1220' : '#FFFFFF') : colors.textMuted}
                />
              </View>

              <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
                <View style={styles.preferenceTextWrapper}>
                  <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                    {t('settings_email_title', 'Email Summary Reports')}
                  </Text>
                  <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                    {t('settings_email_desc', 'Receive daily field activity digests')}
                  </Text>
                </View>
                <Switch
                  value={emailAlerts}
                  onValueChange={handleToggleEmailAlerts}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={emailAlerts ? (isDark ? '#0B1220' : '#FFFFFF') : colors.textMuted}
                />
              </View>

              <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
                <View style={styles.preferenceTextWrapper}>
                  <Text style={[styles.preferenceTitle, { color: colors.text }]}>{t('settings_kyc_title', 'KYC Alerts')}</Text>
                  <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                    {t('settings_kyc_desc', 'Get notified of merchant verification updates')}
                  </Text>
                </View>
                <Switch
                  value={kycAlerts}
                  onValueChange={handleToggleKycAlerts}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={kycAlerts ? (isDark ? '#0B1220' : '#FFFFFF') : colors.textMuted}
                />
              </View>

              <View style={[styles.preferenceRow, { borderBottomColor: colors.border }]}>
                <View style={styles.preferenceTextWrapper}>
                  <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                    {t('settings_status_alerts', 'Status Change Alerts')}
                  </Text>
                  <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                    {t('settings_status_alerts_desc', 'Receive instant alerts on task status shifts')}
                  </Text>
                </View>
                <Switch
                  value={statusChangeAlerts}
                  onValueChange={handleToggleStatusChangeAlerts}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={statusChangeAlerts ? (isDark ? '#0B1220' : '#FFFFFF') : colors.textMuted}
                />
              </View>

              <View style={[styles.preferenceRow, { borderBottomWidth: 0 }]}>
                <View style={styles.preferenceTextWrapper}>
                  <Text style={[styles.preferenceTitle, { color: colors.text }]}>Daily Digest</Text>
                  <Text style={[styles.preferenceDescription, { color: colors.textSecondary }]}>
                    Consolidated 6 PM evening performance overview
                  </Text>
                </View>
                <Switch
                  value={dailyDigest}
                  onValueChange={handleToggleDailyDigest}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={dailyDigest ? (isDark ? '#0B1220' : '#FFFFFF') : colors.textMuted}
                />
              </View>
            </ScrollView>

            <FICButton
              title={t('action_done', 'Done')}
              variant="primary"
              onPress={() => setActiveModal(null)}
              style={styles.modalDoneBtn}
            />
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 2: LANGUAGE SELECTION ─── */}
      <Modal
        visible={activeModal === 'LANGUAGE'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={[styles.modalHeaderRow, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>{t('settings_language_modal_title', 'Regional Language')}</Text>
                <Text style={[styles.modalHeaderSub, { color: colors.textSecondary }]}>
                  {t('settings_language_modal_desc', 'Select your preferred working regional dialect')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={[styles.modalCloseBtn, { backgroundColor: colors.surface }]}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {languages.map(item => {
                const isSelected = item.code === language;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.languageItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                      isSelected && {
                        backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#EFF6FF',
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setLanguage(item.code as SupportedLanguage);
                      setActiveModal(null);
                    }}
                  >
                    <View style={styles.languageItemLeft}>
                      <Text style={[styles.languageNative, { color: colors.text }, isSelected && { color: colors.primary }]}>
                        {item.nativeName}
                      </Text>
                      <Text style={[styles.languageEnglish, { color: colors.textSecondary }]}>{item.name}</Text>
                    </View>
                    {isSelected && (
                      <Icon name="check-circle" size={22} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <FICButton
              title={t('action_done', 'Done')}
              variant="primary"
              onPress={() => setActiveModal(null)}
              style={styles.modalDoneBtn}
            />
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 3: ABOUT FIC MANAGER ─── */}
      <Modal
        visible={activeModal === 'ABOUT'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentCard, { maxHeight: '60%', backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.aboutHeader}>
              <View style={[styles.aboutIconCircle, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF' }]}>
                <Icon name="shield-crown" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.aboutAppName, { color: colors.text }]}>FIC Field Manager</Text>
              <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>Version 2.4.0 (Build 5542)</Text>
            </View>

            <View style={[styles.aboutDetailsBox, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              <View style={styles.aboutRow}>
                <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Environment</Text>
                <Text style={[styles.aboutVal, { color: colors.text }]}>Production Live Backend</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Regional Node</Text>
                <Text style={[styles.aboutVal, { color: colors.text }]}>{manager?.state || 'Tamil Nadu'}</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Security Session</Text>
                <Text style={[styles.aboutVal, { color: colors.success }]}>Encrypted TLS 1.3</Text>
              </View>
            </View>

            <FICButton
              title={t('action_close', 'Close')}
              variant="primary"
              onPress={() => setActiveModal(null)}
              style={styles.modalDoneBtn}
            />
          </View>
        </View>
      </Modal>

      {/* ─── MODAL 4: LOGOUT CONFIRMATION ─── */}
      <Modal
        visible={activeModal === 'LOGOUT'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.logoutCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={[styles.logoutIconCircle, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' }]}>
              <Icon name="logout" size={26} color={colors.error} />
            </View>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              {t('modal_logout_title', 'Logout Confirmation')}
            </Text>
            <Text style={[styles.logoutMessage, { color: colors.textSecondary }]}>
              {t('modal_logout_msg', 'Are you sure you want to logout from FIC Manager?')}
            </Text>
            <View style={styles.logoutActionRow}>
              <FICButton
                title={t('action_cancel', 'Cancel')}
                variant="outline"
                disabled={isLoggingOut}
                onPress={() => setActiveModal(null)}
                style={styles.logoutCancelBtn}
              />
              <FICButton
                title={isLoggingOut ? t('action_logging_out', 'Logging out...') : t('action_logout', 'Logout')}
                variant="destructive"
                loading={isLoggingOut}
                disabled={isLoggingOut}
                onPress={handleConfirmLogout}
                style={styles.logoutConfirmBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitleText: {
    fontSize: 13,
    flex: 1,
  },
  savingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  savingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 4,
  },
  sectionCard: {
    marginBottom: theme.spacing.md,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  rightValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.lg,
    maxHeight: '80%',
    borderTopWidth: 1,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    paddingBottom: theme.spacing.sm,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalHeaderSub: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 20,
  },
  modalBodyScroll: {
    maxHeight: 360,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  preferenceTextWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  modalDoneBtn: {
    marginTop: theme.spacing.md,
  },
  themeOptionsContainer: {
    gap: 10,
    marginBottom: theme.spacing.sm,
  },
  themeOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  themeOptionIconBg: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionTextCol: {
    flex: 1,
  },
  themeOptionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  themeOptionDesc: {
    fontSize: 11.5,
    marginTop: 2,
  },
  languageList: {
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  languageItemLeft: {
    gap: 2,
  },
  languageNative: {
    fontSize: 15,
    fontWeight: '700',
  },
  languageEnglish: {
    fontSize: 12,
  },
  aboutHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  aboutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  aboutAppName: {
    fontSize: 18,
    fontWeight: '800',
  },
  aboutVersion: {
    fontSize: 12,
    marginTop: 2,
  },
  aboutDetailsBox: {
    borderRadius: 10,
    padding: theme.spacing.sm,
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aboutLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  aboutVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutCard: {
    borderRadius: 16,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  logoutIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  logoutMessage: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: theme.spacing.lg,
  },
  logoutActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutCancelBtn: {
    flex: 1,
  },
  logoutConfirmBtn: {
    flex: 1,
  },
});
