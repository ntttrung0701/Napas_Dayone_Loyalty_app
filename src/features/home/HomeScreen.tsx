import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '../../shared/components/BrandLogo';
import { BottomNav } from '../../shared/components/BottomNav';
import { TransactionRow } from '../../shared/components/TransactionRow';
import { colors } from '../../theme/colors';
import type { AppScreen, Transaction } from '../../types';
import { formatPoints } from '../../utils/format';

type HomeScreenProps = {
  points: number;
  transactions: Transaction[];
  unreadNotifications: number;
  onNavigate: (screen: AppScreen) => void;
  onSelectTransaction: (transaction: Transaction) => void;
};

type IconName = ComponentProps<typeof Ionicons>['name'];

const quickActions: Array<{ label: string; icon: IconName; route: AppScreen; color: string }> = [
  { label: 'Đổi điểm', icon: 'gift-outline', route: 'offers', color: colors.success },
  { label: 'Tặng điểm', icon: 'paper-plane-outline', route: 'transfer', color: colors.warning },
  {
    label: 'Thông báo',
    icon: 'notifications-outline',
    route: 'notifications',
    color: colors.purple,
  },
  { label: 'Voucher của tôi', icon: 'wallet-outline', route: 'voucher-wallet', color: colors.purple },
  { label: 'Liên kết', icon: 'card-outline', route: 'cards', color: colors.primary },
  { label: 'Mua sắm', icon: 'cart-outline', route: 'payment', color: colors.gold },
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
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>GOLD</Text>
          </View>
        </View>

        <LinearGradient
  colors={['#2C79B8', '#0A4F91', '#063A73', '#052B58']}
  end={{ x: 1, y: 1 }}
  locations={[0, 0.32, 0.72, 1]}
  start={{ x: 0, y: 0 }}
  style={styles.pointsCard}
>
  <LinearGradient
    colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.08)', 'transparent']}
    end={{ x: 1, y: 1 }}
    start={{ x: 0, y: 0 }}
    style={styles.pointsTopShine}
  />

  <LinearGradient
    colors={['transparent', 'rgba(255,255,255,0.28)', 'transparent']}
    end={{ x: 1, y: 1 }}
    start={{ x: 0, y: 0 }}
    style={styles.pointsDiagonalShine}
  />

  <View style={styles.pointsGlowRight} />
  <View style={styles.pointsGlowLeft} />
  <View style={styles.pointsBorderGlow} />

  <View style={styles.pointsHeader}>
    <View>
      <Text style={styles.pointsLabel}>ĐIỂM KHẢ DỤNG</Text>

      <View style={styles.pointsRow}>
        <Text style={styles.pointsValue}>{formatPoints(points)}</Text>
        <Text style={styles.pointsUnit}>pts</Text>
      </View>
    </View>

    <View style={styles.napasLogoBox}>
      <BrandLogo width={82} />
    </View>
  </View>

  <View style={styles.pointsDivider} />

  <View style={styles.pointsMetaRow}>
    <View style={styles.pointsMetaItem}>
      <LinearGradient
        colors={['rgba(255,255,255,0.32)', 'rgba(255,255,255,0.12)']}
        style={styles.pointsMetaIcon}
      >
        <Ionicons color="#EAF6FF" name="time-outline" size={16} />
      </LinearGradient>

      <View style={styles.pointsMetaCopy}>
        <Text style={styles.pointsMetaLabel}>Điểm chờ xác nhận:</Text>
        <Text style={styles.pointsMetaValue}>2.400 điểm</Text>
      </View>
    </View>

    <Pressable
      onPress={() => onNavigate('offers')}
      style={({ pressed }) => [styles.pointsMetaItem, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={['rgba(244,204,88,0.45)', 'rgba(244,204,88,0.16)']}
        style={styles.pointsMetaIcon}
      >
        <Ionicons color="#FFE58D" name="hourglass-outline" size={16} />
      </LinearGradient>

      <View style={styles.pointsMetaCopy}>
        <Text style={styles.pointsMetaLabel}>Điểm sắp hết hạn:</Text>
        <Text style={styles.pointsMetaValue}>8.000 điểm</Text>
      </View>
    </Pressable>
  </View>
</LinearGradient>

        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              onPress={() => onNavigate(action.route)}
              style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
            >
              <View
                style={[
                  styles.quickIcon,
                  { borderColor: `${action.color}26`, backgroundColor: `${action.color}12` },
                ]}
              >
                <Ionicons color={action.color} name={action.icon} size={30} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
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
    borderWidth: 1,
    borderColor: '#E9D8A6',
    borderRadius: 999,
    backgroundColor: '#FFFDF5',
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  rankText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '900',
  },
  pointsCard: {
  position: 'relative',
  overflow: 'hidden',
  marginHorizontal: 20,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.35)',
  borderRadius: 20,
  paddingHorizontal: 16,
  paddingTop: 18,
  paddingBottom: 14,
  minHeight: 166,
  shadowColor: '#072C57',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.38,
  shadowRadius: 24,
  elevation: 12,
},

pointsTopShine: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 72,
  opacity: 0.8,
},

pointsDiagonalShine: {
  position: 'absolute',
  top: -42,
  left: '35%',
  width: 92,
  height: 230,
  opacity: 0.9,
  transform: [{ rotate: '22deg' }],
},

pointsGlowRight: {
  position: 'absolute',
  top: -42,
  right: -42,
  width: 158,
  height: 158,
  borderRadius: 79,
  backgroundColor: 'rgba(111,183,235,0.34)',
},

pointsGlowLeft: {
  position: 'absolute',
  bottom: -64,
  left: -38,
  width: 150,
  height: 150,
  borderRadius: 75,
  backgroundColor: 'rgba(1,31,77,0.42)',
},

pointsBorderGlow: {
  position: 'absolute',
  top: 1,
  left: 1,
  right: 1,
  bottom: 1,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.14)',
  borderRadius: 19,
},

pointsHeader: {
  position: 'relative',
  zIndex: 2,
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
},

pointsLabel: {
  color: '#D8ECFF',
  fontSize: 12,
  fontWeight: '800',
  letterSpacing: 0.8,
},

pointsRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
  marginTop: 6,
},

pointsValue: {
  color: colors.white,
  fontSize: 30,
  fontWeight: '900',
  letterSpacing: -1.4,
  textShadowColor: 'rgba(0,0,0,0.22)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 5,
},

pointsUnit: {
  marginLeft: 7,
  color: '#F2FAFF',
  fontSize: 24,
  fontWeight: '500',
},

napasLogoBox: {
  minWidth: 92,
  alignItems: 'flex-end',
  marginTop: -2,
},

pointsDivider: {
  position: 'relative',
  zIndex: 2,
  height: 1,
  marginTop: 22,
  marginBottom: 13,
  backgroundColor: 'rgba(221,240,255,0.27)',
},

pointsMetaRow: {
  position: 'relative',
  zIndex: 2,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

pointsMetaItem: {
  width: '48%',
  flexDirection: 'row',
  alignItems: 'center',
},

pointsMetaIcon: {
  width: 36,
  height: 36,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.14)',
  borderRadius: 13,
},

pointsMetaCopy: {
  flex: 1,
  marginLeft: 8,
},

pointsMetaLabel: {
  color: '#D8ECFF',
  fontSize: 11,
  fontWeight: '700',
  lineHeight: 15,
},

pointsMetaValue: {
  marginTop: 2,
  color: colors.white,
  fontSize: 13,
  fontWeight: '900',
  lineHeight: 17,
  textShadowColor: 'rgba(0,0,0,0.18)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
},
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 8,
    paddingTop: 22,
  },
  quickAction: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 18,
  },
  quickIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 17,
  },
  quickLabel: {
    marginTop: 7,
    textAlign: 'center',
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
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
