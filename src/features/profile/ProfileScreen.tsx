import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '../../shared/components/BottomNav';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab } from '../../types';

type ProfileScreenProps = {
  activeTab: MainTab;
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (screen: AppScreen) => void;
};

const settings: Array<readonly [string, string]> = [
  ['Liên kết Thẻ & Ví', '1 thẻ đã liên kết'],
  ['Bảo mật sinh trắc học', 'Đang bật'],
  ['Thông báo giao dịch', 'Đang bật'],
  ['Ngôn ngữ', 'Tiếng Việt'],
  ['Trợ giúp & hỗ trợ', ''],
];

const settingIcons = [
  'card-outline',
  'finger-print-outline',
  'notifications-outline',
  'language-outline',
  'help-circle-outline',
] as const;

export function ProfileScreen({
  activeTab,
  onBack,
  onLogout,
  onNavigate,
}: ProfileScreenProps) {
  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Tài khoản" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MA</Text>
          </View>
          <Text style={styles.name}>Nguyễn Minh Anh</Text>
          <Text style={styles.phone}>0987 654 321</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberText}>HỘI VIÊN GOLD</Text>
          </View>
        </View>

        <View style={styles.securityCard}>
          <View style={styles.shield}>
            <Ionicons color={colors.white} name="shield-checkmark-outline" size={23} />
          </View>
          <View style={styles.securityInfo}>
            <Text style={styles.securityTitle}>Trạng thái bảo mật tốt</Text>
            <Text style={styles.securityText}>Thiết bị này đang dùng chế độ demo cục bộ.</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          {settings.map(([label, value], index) => (
            <Pressable
              key={label}
              onPress={index === 0 ? () => onNavigate('cards') : undefined}
              style={styles.settingRow}
            >
              <View style={styles.settingIcon}>
                <Ionicons
                  color={colors.primary}
                  name={settingIcons[index] ?? 'settings-outline'}
                  size={19}
                />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{label}</Text>
                {value ? <Text style={styles.settingValue}>{value}</Text> : null}
              </View>
              <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={onLogout} style={styles.logoutButton}>
          <Ionicons color={colors.danger} name="log-out-outline" size={18} />
          <Text style={styles.logoutText}>Đăng xuất tài khoản demo</Text>
        </Pressable>
        <Text style={styles.version}>Napas DayOne Prototype • Expo SDK 54</Text>
      </ScrollView>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    paddingBottom: 28,
  },
  profileCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 24,
  },
  avatar: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 38,
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.white,
    fontSize: 23,
    fontWeight: '900',
  },
  name: {
    marginTop: 14,
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  phone: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 12,
  },
  memberBadge: {
    marginTop: 13,
    borderRadius: 999,
    backgroundColor: '#FFF7DD',
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  memberText: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '900',
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    borderRadius: 17,
    backgroundColor: colors.successSoft,
    padding: 15,
  },
  shield: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.success,
  },
  securityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '900',
  },
  securityText: {
    marginTop: 3,
    color: '#397A5E',
    fontSize: 10,
  },
  settingsCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  settingRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  settingValue: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 10,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 22,
  },
  logoutButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F4C9CC',
    borderRadius: 14,
    backgroundColor: '#FFF7F7',
  },
  logoutText: {
    marginLeft: 7,
    color: colors.danger,
    fontSize: 13,
    fontWeight: '800',
  },
  version: {
    marginTop: 18,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 9,
  },
});
