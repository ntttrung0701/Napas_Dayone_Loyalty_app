import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '../../shared/components/BottomNav';
import { HeaderIconButton } from '../../shared/components/HeaderIconButton';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { clamp, getBottomNavOffset } from '../../shared/layout';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab } from '../../types';
import { formatPoints } from '../../utils/format';

type ProfileScreenProps = {
  activeTab: MainTab;
  points: number;
  unreadNotifications: number;
  onLogout: () => void;
  onNavigate: (screen: AppScreen) => void;
};

type IconName = ComponentProps<typeof Ionicons>['name'];
const goldCardBackground = require('../../../assets/goldCard.png');
const silverCardBackground = require('../../../assets/silverCard.png');


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
  unreadNotifications,
  onLogout,
  onNavigate,
}: ProfileScreenProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const goldCardHeight = clamp(width * 0.5, 190, 220);
  const goldCardPadding = width < 380 ? 18 : 24;
  const goldMemberBadgeWidth = clamp(width * 0.34, 106, 142);

  const openSetting = (setting: (typeof settings)[number]) => {
    if (setting.route) {
      onNavigate(setting.route);
      return;
    }
    Alert.alert(setting.label, 'Chức năng đã được ghi nhận trong môi trường demo.');
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        rightContent={
          <HeaderIconButton
            accessibilityLabel={`${unreadNotifications} thông báo chưa đọc`}
            badgeCount={unreadNotifications}
            icon="notifications-outline"
            onPress={() => onNavigate('notifications')}
          />
        }
        title="Tài khoản"
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getBottomNavOffset(insets.bottom) + 22 },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <Pressable
  onPress={() => onNavigate('membership')}
  style={({ pressed }) => [styles.goldCardPressable, pressed && styles.pressed]}
>
  <ImageBackground
    source={goldCardBackground}
    resizeMode="stretch"
    style={[styles.goldCard, { minHeight: goldCardHeight, padding: goldCardPadding }]}
    imageStyle={styles.goldCardImage}
  >
    <View style={styles.goldTopRow}>
      <View style={styles.goldTitleBlock}>
        <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.goldEyebrow}>HẠNG HIỆN TẠI</Text>
        <Text adjustsFontSizeToFit maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.goldTitle}>Hạng Vàng</Text>
      </View>

      <View style={[styles.goldMemberBadge, { maxWidth: goldMemberBadgeWidth }]}>
        <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.goldMemberText}>GOLD MEMBER</Text>
      </View>
    </View>

    <View style={styles.goldBottomRow}>
      <View style={styles.goldBottomCopy}>
        <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.goldName}>Nguyễn Văn Anh</Text>
        <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.goldPoints}>{formatPoints(points)} điểm khả dụng</Text>
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
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: {
  paddingHorizontal: 20,
  paddingTop: 20,
},
  pressed: { opacity: 0.68 },
  goldCard: {
  overflow: 'hidden',
  minHeight: 220,
  justifyContent: 'space-between',
  borderRadius: 30,
  padding: 24,
  shadowColor: '#000000',
  shadowOffset: { width: 8, height: 18 },
  shadowOpacity: 0.22,
  shadowRadius: 22,
  elevation: 12,
},
goldCardImage: {
  borderRadius: 30,
},
 
  goldTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  goldTitleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  
  goldEyebrow: {
  color: '#FFF7D6',
  fontSize: 11,
  fontWeight: '900',
  letterSpacing: 0.8,
},

  goldTitle: {
  marginTop: 8,
  color: colors.white,
  fontSize: 28,
  fontWeight: '600',
},

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
  goldBottomCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  goldName: {
  color: colors.white,
  fontSize: 16,
  fontWeight: '900',
},

  goldPoints: {
  marginTop: 6,
  color: '#FFF7D6',
  fontSize: 13,
  fontWeight: '700',
},

goldCardPressable: {
  borderRadius: 30,
  marginBottom: 24,
  },
  goldMemberBadge: {
  maxWidth: 150,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.42)',
  borderRadius: 10,
  backgroundColor: 'rgba(255,255,255,0.18)',
  paddingHorizontal: 12,
  paddingVertical: 8,
},
  
goldMemberText: {
  color: colors.white,
  fontSize: 9,
  fontWeight: '900',
},

  sectionHeading: {
  marginBottom: 10,
  marginTop: 2,
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
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 2,
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
