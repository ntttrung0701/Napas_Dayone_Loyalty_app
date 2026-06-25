import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '../../shared/components/BottomNav';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab } from '../../types';
import { formatPoints } from '../../utils/format';

type ProfileScreenProps = {
  activeTab: MainTab;
  points: number;
  onLogout: () => void;
  onNavigate: (screen: AppScreen) => void;
};

type IconName = ComponentProps<typeof Ionicons>['name'];

const settings: Array<{ label: string; value: string; icon: IconName; route?: AppScreen }> = [
  { label: 'Liên kết Thẻ & Ví', value: '1 thẻ đã liên kết', icon: 'card-outline', route: 'cards' },
  { label: 'Bảo mật sinh trắc học', value: 'Đang bật', icon: 'finger-print-outline' },
  { label: 'Thông báo giao dịch', value: 'Đang bật', icon: 'notifications-outline' },
  { label: 'Ngôn ngữ', value: 'Tiếng Việt', icon: 'language-outline' },
  { label: 'Trợ giúp & hỗ trợ', value: '', icon: 'help-circle-outline' },
];

const privileges: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: 'trending-up-outline',
    title: 'Hệ số tích điểm x1.5',
    description: 'Tích lũy nhanh hơn cho giao dịch thanh toán hợp lệ qua Napas.',
  },
  {
    icon: 'gift-outline',
    title: 'Ưu đãi độc quyền Hạng Vàng',
    description: 'Mở khóa kho voucher dành riêng và quà sinh nhật thành viên.',
  },
  {
    icon: 'headset-outline',
    title: 'Hỗ trợ ưu tiên',
    description: 'Yêu cầu của bạn được tiếp nhận trên luồng chăm sóc ưu tiên.',
  },
];

export function ProfileScreen({
  activeTab,
  points,
  onLogout,
  onNavigate,
}: ProfileScreenProps) {
  const openSetting = (setting: (typeof settings)[number]) => {
    if (setting.route) {
      onNavigate(setting.route);
      return;
    }
    Alert.alert(setting.label, 'Chức năng đã được ghi nhận trong môi trường demo.');
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Tài khoản" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identityRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>NA</Text>
          </View>
          <View style={styles.identityInfo}>
            <Text style={styles.name}>Nguyễn Văn Anh</Text>
            <Text style={styles.phone}>0987 654 321 • Loyalty ID 5829</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons color={colors.success} name="checkmark-circle" size={17} />
          </View>
        </View>

        <View style={styles.goldCard}>
          <View pointerEvents="none" style={styles.goldGlow} />
          <View pointerEvents="none" style={styles.goldShine} />
          <View style={styles.goldTopRow}>
            <View>
              <Text style={styles.goldEyebrow}>HẠNG HIỆN TẠI</Text>
              <Text style={styles.goldTitle}>Hạng Vàng</Text>
            </View>
            <View style={styles.sparkleBadge}>
              <Ionicons color={colors.white} name="sparkles" size={24} />
            </View>
          </View>
          <View style={styles.goldBottomRow}>
            <View>
              <Text style={styles.goldName}>Nguyễn Văn Anh</Text>
              <Text style={styles.goldPoints}>{formatPoints(points)} điểm khả dụng</Text>
            </View>
            <View style={styles.goldMemberBadge}>
              <Text style={styles.goldMemberText}>GOLD MEMBER</Text>
            </View>
          </View>
        </View>
        <Pressable
  onPress={() => onNavigate('membership')}
  style={({ pressed }) => [styles.membershipButton, pressed && styles.pressed]}
>
  <Ionicons color={colors.primary} name="analytics-outline" size={18} />
  <Text style={styles.membershipButtonText}>Xem tổng quan điểm & hạng thành viên</Text>
  <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
</Pressable>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <Ionicons color={colors.purple} name="ribbon-outline" size={21} />
              <Text style={styles.progressTitle}>Mục tiêu tiếp theo: Hạng Bạch Kim</Text>
            </View>
            <Text style={styles.progressPercent}>75% đạt</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressValue} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Vàng (15.000 pts)</Text>
            <Text style={styles.progressLabel}>Bạch Kim (25.000 pts)</Text>
          </View>
          <View style={styles.goalInfo}>
            <Ionicons color={colors.purple} name="information-circle-outline" size={20} />
            <Text style={styles.goalText}>
              Chi tiêu thêm <Text style={styles.goalStrong}>5.250.000 VND</Text> hoặc thực hiện
              thêm <Text style={styles.goalStrong}>3 giao dịch thanh toán NAPAS</Text> để thăng
              hạng.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>ĐẶC QUYỀN HẠNG VÀNG</Text>
        <View style={styles.privilegesCard}>
          {privileges.map((privilege) => (
            <View key={privilege.title} style={styles.privilegeRow}>
              <View style={styles.privilegeIcon}>
                <Ionicons color="#F18A00" name={privilege.icon} size={22} />
              </View>
              <View style={styles.privilegeInfo}>
                <Text style={styles.privilegeTitle}>{privilege.title}</Text>
                <Text style={styles.privilegeDescription}>{privilege.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeading}>CÀI ĐẶT TÀI KHOẢN</Text>
        <View style={styles.settingsCard}>
          {settings.map((setting) => (
            <Pressable
              accessibilityRole="button"
              key={setting.label}
              onPress={() => openSetting(setting)}
              style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
            >
              <View style={styles.settingIcon}>
                <Ionicons color={colors.primary} name={setting.icon} size={19} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{setting.label}</Text>
                {setting.value ? <Text style={styles.settingValue}>{setting.value}</Text> : null}
              </View>
              <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.danger} name="log-out-outline" size={18} />
          <Text style={styles.logoutText}>Đăng xuất tài khoản demo</Text>
        </Pressable>
      </ScrollView>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 28 },
  pressed: { opacity: 0.68 },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  avatarText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  identityInfo: { flex: 1, marginLeft: 12 },
  name: { color: colors.text, fontSize: 16, fontWeight: '900' },
  phone: { marginTop: 4, color: colors.textMuted, fontSize: 10 },
  verifiedBadge: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.successSoft,
  },
  goldCard: {
    overflow: 'hidden',
    minHeight: 166,
    justifyContent: 'space-between',
    borderRadius: 24,
    backgroundColor: '#F5A000',
    padding: 20,
    shadowColor: '#B66300',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 9,
  },
  goldGlow: {
    position: 'absolute',
    top: -68,
    right: -38,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,229,128,0.35)',
  },
  goldShine: {
    position: 'absolute',
    top: -70,
    left: 65,
    width: 46,
    height: 300,
    backgroundColor: 'rgba(255,255,255,0.10)',
    transform: [{ rotate: '28deg' }],
  },
  goldTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  goldEyebrow: { color: '#FFF7D6', fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  goldTitle: { marginTop: 7, color: colors.white, fontSize: 25, fontWeight: '900' },
  sparkleBadge: {
    width: 49,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  goldBottomRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  goldName: { color: colors.white, fontSize: 13, fontWeight: '900' },
  goldPoints: { marginTop: 4, color: '#FFF7D6', fontSize: 10 },
  goldMemberBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  goldMemberText: { color: colors.white, fontSize: 8, fontWeight: '900' },
  progressCard: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 17,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  membershipButton: {
  minHeight: 48,
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 14,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 14,
  backgroundColor: colors.primarySoft,
  paddingHorizontal: 14,
},

membershipButtonText: {
  flex: 1,
  marginLeft: 10,
  color: colors.primary,
  fontSize: 12,
  fontWeight: '900',
},
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  progressTitle: { marginLeft: 8, color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  progressPercent: { marginLeft: 8, color: colors.success, fontSize: 9, fontWeight: '900' },
  progressTrack: {
    height: 9,
    overflow: 'hidden',
    marginTop: 15,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  progressValue: { width: '75%', height: '100%', borderRadius: 5, backgroundColor: colors.success },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  progressLabel: { color: colors.textMuted, fontSize: 9 },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#E7E8F8',
    borderRadius: 14,
    backgroundColor: '#F8F8FF',
    padding: 12,
  },
  goalText: { flex: 1, marginLeft: 9, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  goalStrong: { color: colors.primaryDark, fontWeight: '900' },
  sectionHeading: {
    marginBottom: 10,
    marginTop: 22,
    marginLeft: 3,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  privilegesCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  privilegeRow: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 14,
  },
  privilegeIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B5',
    borderRadius: 22,
    backgroundColor: '#FFF7EA',
  },
  privilegeInfo: { flex: 1, marginLeft: 13 },
  privilegeTitle: { color: colors.text, fontSize: 12, fontWeight: '800' },
  privilegeDescription: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    borderRadius: 18,
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
  securityInfo: { flex: 1, marginLeft: 12 },
  securityTitle: { color: colors.success, fontSize: 13, fontWeight: '900' },
  securityText: { marginTop: 3, color: '#397A5E', fontSize: 10 },
  settingsCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  settingRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 15,
  },
  settingIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  settingInfo: { flex: 1 },
  settingLabel: { color: colors.text, fontSize: 12, fontWeight: '800' },
  settingValue: { marginTop: 3, color: colors.textMuted, fontSize: 9 },
  logoutButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#F4C9CC',
    borderRadius: 15,
    backgroundColor: '#FFF7F7',
  },
  logoutText: { marginLeft: 7, color: colors.danger, fontSize: 12, fontWeight: '800' },
  version: { marginTop: 18, textAlign: 'center', color: colors.textMuted, fontSize: 9 },
});
