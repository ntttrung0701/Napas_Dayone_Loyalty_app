import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
const goldCardBackground = require('../../../assets/GoldCard.png');

const settings: Array<{ label: string; value: string; icon: IconName; route?: AppScreen }> = [
  { label: 'Liên kết Thẻ & Ví', value: '1 thẻ đã liên kết', icon: 'card-outline', route: 'cards' },
  { label: 'Bảo mật sinh trắc học', value: 'Đang bật', icon: 'finger-print-outline' },
  { label: 'Thông báo giao dịch', value: 'Đang bật', icon: 'notifications-outline' },
  { label: 'Ngôn ngữ', value: 'Tiếng Việt', icon: 'language-outline' },
  { label: 'Trợ giúp & hỗ trợ', value: '', icon: 'help-circle-outline' },
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

        <Pressable
  onPress={() => onNavigate('membership')}
  style={({ pressed }) => [styles.goldCardPressable, pressed && styles.pressed]}
>
  <ImageBackground
    source={goldCardBackground}
    resizeMode="stretch"
    style={styles.goldCard}
    imageStyle={styles.goldCardImage}
  >
    <View style={styles.goldTopRow}>
      <View>
        <Text style={styles.goldEyebrow}>HẠNG HIỆN TẠI</Text>
        <Text style={styles.goldTitle}>Hạng Vàng</Text>
      </View>

      <View style={styles.goldMemberBadge}>
        <Text style={styles.goldMemberText}>GOLD MEMBER</Text>
      </View>
    </View>

    <View style={styles.goldBottomRow}>
      <View>
        <Text style={styles.goldName}>Nguyễn Văn Anh</Text>
        <Text style={styles.goldPoints}>{formatPoints(points)} điểm khả dụng</Text>
      </View>

      <Ionicons color="#FFF7D6" name="chevron-forward" size={22} />
    </View>
  </ImageBackground>
</Pressable>

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
  minHeight: 176,
  justifyContent: 'space-between',
  borderRadius: 24,
  padding: 20,
  shadowColor: '#B66300',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 9,
},
goldCardImage: {
  borderRadius: 24,
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
  
  goldCardPressable: {
  borderRadius: 24,
  marginBottom: 18,
},

  sectionHeading: {
    marginBottom: 10,
    marginTop: 22,
    marginLeft: 3,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
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
