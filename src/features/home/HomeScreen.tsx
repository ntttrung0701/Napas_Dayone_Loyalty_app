import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '../../shared/components/BrandLogo';
import { BottomNav } from '../../shared/components/BottomNav';
import { TransactionRow } from '../../shared/components/TransactionRow';
import { colors } from '../../theme/colors';
import type { AppScreen, Transaction } from '../../types';
import { formatPoints } from '../../utils/format';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

type HomeScreenProps = {
  points: number;
  transactions: Transaction[];
  unreadNotifications: number;
  onNavigate: (screen: AppScreen) => void;
  onSelectTransaction: (transaction: Transaction) => void;
};

type IconName = ComponentProps<typeof Ionicons>['name'];
const pointCardBackground = require('../../../assets/Card.png');

const quickActions: Array<{ label: string; icon: IconName; route: AppScreen }> = [
  { label: 'Đổi điểm', icon: 'sync-outline', route: 'offers' },
  { label: 'Tặng điểm', icon: 'gift-outline', route: 'transfer' },
  { label: 'Thông báo', icon: 'notifications-outline', route: 'notifications' },
  { label: 'Voucher của tôi', icon: 'ticket-outline', route: 'voucher-wallet' },
  { label: 'Liên kết', icon: 'link-outline', route: 'cards' },
  { label: 'Mua sắm', icon: 'bag-outline', route: 'payment' },
];

export function HomeScreen({
  points,
  transactions,
  unreadNotifications,
  onNavigate,
  onSelectTransaction,
}: HomeScreenProps) {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>NA</Text>
          </View>
          <View style={styles.brand}>
            <BrandLogo width={92} />
            
          </View>
          <Pressable
            accessibilityLabel={`${unreadNotifications} thông báo chưa đọc`}
            accessibilityRole="button"
            onPress={() => onNavigate('notifications')}
            style={({ pressed }) => [styles.notification, pressed && styles.pressed]}
          >
            <Ionicons color={colors.primaryDark} name="notifications-outline" size={20} />
            {unreadNotifications ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.hello}>Xin chào,</Text>
            <Text style={styles.name}>Nguyễn Văn Anh</Text>
          </View>
          
        </View>

        <ImageBackground
  source={pointCardBackground}
  resizeMode="stretch"
  style={styles.pointsCard}
  imageStyle={styles.pointsCardImage}
>
  <View style={styles.pointsTopRow}>
    <Text style={styles.pointsLabel}>ĐIỂM KHẢ DỤNG</Text>
    <View style={styles.rankBadge}>
            <Text style={styles.rankText}>GOLD</Text>
          </View>
  </View>

  <View style={styles.pointsRow}>
    <Text style={styles.pointsValue}>{formatPoints(points)}</Text>
    <Text style={styles.pointsUnit}>pts</Text>
  </View>

  <View style={styles.pointsDivider} />

  <View style={styles.pointsMetaRow}>
    <View style={styles.pointsMetaItem}>
      <View style={styles.pointsMetaIcon}>
        <Ionicons color="#EAF6FF" name="time-outline" size={16} />
      </View>

      <View style={styles.pointsMetaCopy}>
        <Text style={styles.pointsMetaLabel}>Điểm chờ xác nhận:</Text>
        <Text style={styles.pointsMetaValue}>2.400 điểm</Text>
      </View>
    </View>

    <Pressable
      onPress={() => onNavigate('offers')}
      style={({ pressed }) => [styles.pointsMetaItem, pressed && styles.pressed]}
    >
      <View style={[styles.pointsMetaIcon, styles.pointsMetaIconGold]}>
        <Ionicons color="#FFE58A" name="hourglass-outline" size={16} />
      </View>

      <View style={styles.pointsMetaCopy}>
        <Text style={styles.pointsMetaLabel}>Điểm sắp hết hạn:</Text>
        <Text style={styles.pointsMetaValue}>8.000 điểm</Text>
      </View>
    </Pressable>
  </View>
</ImageBackground>

        <View style={styles.quickGrid}>
  {quickActions.map((action) => (
    <Pressable
      key={action.label}
      onPress={() => onNavigate(action.route)}
      style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
    >
      <View style={styles.quickButton}>
        <View pointerEvents="none" style={styles.quickButtonShine} />
        <Ionicons color="#EAF6FF" name={action.icon} size={25} />
        <Text style={styles.quickButtonLabel}>{action.label}</Text>
      </View>
    </Pressable>
  ))}
</View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tiến trình thăng hạng</Text>
            <Text style={styles.goldText}>GOLD → PLATINUM</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressValue} />
          </View>
          <Text style={styles.progressText}>
            Chỉ cần <Text style={styles.progressStrong}>15.000 điểm</Text> nữa để thăng hạng.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
            
            <Pressable onPress={() => onNavigate('history')}>
              <Text style={styles.link}>Xem tất cả</Text>
            </Pressable>
          </View>
          {transactions.slice(0, 2).map((transaction) => (
            <TransactionRow
              key={transaction.id}
              onPress={onSelectTransaction}
              transaction={transaction}
            />
          ))}
        </View>
      </ScrollView>
      <BottomNav active="home" onNavigate={onNavigate} />
    </View>
  );
}
function PointsCardBackground() {
  return (
    <Svg
      height="100%"
      pointerEvents="none"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFillObject}
      viewBox="0 0 335 158"
      width="100%"
    >
      <Defs>
        <LinearGradient id="pointsBg" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#2D75AF" />
          <Stop offset="0.38" stopColor="#0E5797" />
          <Stop offset="0.72" stopColor="#073C77" />
          <Stop offset="1" stopColor="#052D5E" />
        </LinearGradient>

        <LinearGradient id="shine" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.32" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect fill="url(#pointsBg)" height="158" rx="18" width="335" x="0" y="0" />
      <Circle cx="292" cy="22" fill="#7AB8E7" opacity="0.22" r="95" />
      <Circle cx="28" cy="162" fill="#043063" opacity="0.42" r="86" />
      <Path d="M214 -42 L260 -42 L188 203 L142 203 Z" fill="url(#shine)" opacity="0.82" />
      <Rect
        fill="none"
        height="156"
        rx="17"
        stroke="#D9EEFF"
        strokeOpacity="0.36"
        strokeWidth="1"
        width="333"
        x="1"
        y="1"
      />
    </Svg>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  topBar: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  brand: {
    flex: 1,
    alignItems: 'center',
  },
  notification: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -4,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 9,
    backgroundColor: colors.danger,
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '900',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 20,
  },
  hello: {
    color: colors.textMuted,
    fontSize: 12,
  },
  name: {
    marginTop: 2,
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  rankBadge: {
    paddingHorizontal: 1,
    paddingVertical: 1,
  },
  rankText: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '500',
  },
  pointsCard: {
  overflow: 'hidden',
  height: 178,
  marginHorizontal: 20,
  borderRadius: 20,
  paddingHorizontal: 18,
  paddingTop: 18,
  paddingBottom: 14,
  shadowColor: '#062C57',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.28,
  shadowRadius: 18,
  elevation: 9,
},
pointsCardImage: {
  borderRadius: 20,
},
pointsTopRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
},


pointsCardContent: {
  position: 'relative',
  zIndex: 1,
  flex: 1,
  paddingHorizontal: 18,
  paddingTop: 18,
  paddingBottom: 13,
},

pointsHeader: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
},
pointsLabel: {
  color: '#D9ECFB',
  fontSize: 12,
  fontWeight: '700',
  letterSpacing: 0.7,
},

pointsRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
  marginTop: 5,
},

pointsValue: {
  color: colors.white,
  fontSize: 40,
  fontWeight: '800',
  letterSpacing: -1.2,
  textShadowColor: 'rgba(0,0,0,0.22)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
},

pointsUnit: {
  marginLeft: 8,
  color: '#F2FAFF',
  fontSize: 24,
  fontWeight: '400',
},

pointsDivider: {
  height: 1,
  marginTop: 20,
  marginBottom: 12,
  backgroundColor: 'rgba(218,238,255,0.28)',
},

pointsMetaRow: {
  flexDirection: 'row',
  alignItems: 'center',
},

pointsMetaItem: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
},

pointsMetaIcon: {
  width: 34,
  height: 34,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.16)',
},

pointsMetaIconGold: {
  backgroundColor: 'rgba(255,220,98,0.20)',
},

pointsMetaCopy: {
  flex: 1,
  marginLeft: 8,
},

pointsMetaLabel: {
  color: '#D8ECFF',
  fontSize: 12,
  fontWeight: '600',
  lineHeight: 15,
},

pointsMetaValue: {
  marginTop: 2,
  color: colors.white,
  fontSize: 14,
  fontWeight: '800',
  lineHeight: 17,
},

quickGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingTop: 14,
  paddingBottom: 10,
},

quickAction: {
  width: '31%',
  marginBottom: 12,
},

quickButton: {
  position: 'relative',
  overflow: 'hidden',
  height: 66,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(216,236,255,0.26)',
  backgroundColor: '#0A4F91',
  shadowColor: '#062C57',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.26,
  shadowRadius: 10,
  elevation: 7,
},

quickButtonShine: {
  position: 'absolute',
  top: -26,
  right: -18,
  width: 78,
  height: 78,
  borderRadius: 39,
  backgroundColor: 'rgba(255,255,255,0.13)',
},

quickButtonLabel: {
  marginTop: 6,
  textAlign: 'center',
  color: colors.white,
  fontSize: 11,
  fontWeight: '800',
},
  sectionCard: {
    marginBottom: 14,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  goldText: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressValue: {
    width: '64%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  progressText: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 11,
  },
  progressStrong: {
    color: colors.text,
    fontWeight: '800',
  },
  link: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
});
