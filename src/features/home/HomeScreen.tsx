import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
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

        <View style={styles.pointsCard}>
          <View pointerEvents="none" style={styles.pointsGlowLarge} />
          <View pointerEvents="none" style={styles.pointsGlowSmall} />
          <View style={styles.pointsTopRow}>
            <Text style={styles.pointsLabel}>ĐIỂM KHẢ DỤNG</Text>
            <View style={styles.secureBadge}>
              <Ionicons color={colors.white} name="shield-checkmark" size={14} />
              <Text style={styles.secureText}>Đã xác thực</Text>
            </View>
          </View>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsValue}>{formatPoints(points)}</Text>
            <Text style={styles.pointsUnit}>pts</Text>
          </View>
          <View style={styles.pendingRow}>
            <Ionicons color={colors.white} name="time-outline" size={16} />
            <Text style={styles.pendingText}>2.400 điểm đang chờ xác nhận</Text>
          </View>
          <Pressable onPress={() => onNavigate('offers')} style={styles.expiryRow}>
            <Ionicons color="#FFD788" name="warning-outline" size={16} />
            <Text style={styles.expiryText}>8.000 điểm sắp hết hạn trong 30 ngày</Text>
            <Ionicons color="#FFD788" name="chevron-forward" size={17} />
          </Pressable>
        </View>

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
    overflow: 'hidden',
    marginHorizontal: 20,
    borderRadius: 22,
    backgroundColor: colors.primary,
    padding: 20,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 7,
  },
  pointsGlowLarge: {
    position: 'absolute',
    top: -76,
    right: -54,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  pointsGlowSmall: {
    position: 'absolute',
    bottom: -66,
    left: -34,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(27,160,220,0.28)',
  },
  pointsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  secureText: {
    marginLeft: 4,
    color: colors.white,
    fontSize: 8,
    fontWeight: '800',
  },
  pointsLabel: {
    color: '#CDE7FA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 18,
    marginTop: 5,
  },
  pointsValue: {
    color: colors.white,
    fontSize: 31,
    fontWeight: '900',
  },
  pointsUnit: {
    marginLeft: 6,
    color: '#CDE7FA',
    fontSize: 13,
    fontWeight: '700',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 11,
  },
  pendingText: {
    marginLeft: 8,
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,200,80,0.28)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,181,33,0.13)',
    padding: 11,
  },
  expiryText: {
    flex: 1,
    marginLeft: 8,
    color: '#FFD788',
    fontSize: 11,
    fontWeight: '700',
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
