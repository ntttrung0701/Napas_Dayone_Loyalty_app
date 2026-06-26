import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BottomNav } from '../../shared/components/BottomNav';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { TransactionRow } from '../../shared/components/TransactionRow';
import { colors } from '../../theme/colors';
import type {
  AppScreen,
  LoyaltyNotification,
  NotificationCategory,
  Transaction,
} from '../../types';
import {
  ActivityFeed,
  type ActivityFilter,
} from './domain/ActivityFeed';
import { NotificationRecord } from './domain/NotificationCenter';

type IconName = ComponentProps<typeof Ionicons>['name'];

type NotificationsScreenProps = {
  notifications: LoyaltyNotification[];
  transactions: Transaction[];
  onNavigate: (screen: AppScreen) => void;
  onMarkAllRead: () => void;
  onMarkRead: (notificationId: string) => void;
  onSelectTransaction: (transaction: Transaction) => void;
};

const filters: ReadonlyArray<{ id: ActivityFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'earned', label: 'Tích điểm' },
  { id: 'redeemed', label: 'Đổi điểm' },
  { id: 'pending', label: 'Đang chờ' },
  { id: 'offer', label: 'Ưu đãi' },
  { id: 'system', label: 'Hệ thống' },
];

const categoryStyle: Record<
  NotificationCategory,
  { icon: IconName; color: string; background: string }
> = {
  transaction: {
    icon: 'swap-horizontal-outline',
    color: colors.primary,
    background: colors.primarySoft,
  },
  offer: {
    icon: 'gift-outline',
    color: colors.warning,
    background: colors.warningSoft,
  },
  system: {
    icon: 'shield-checkmark-outline',
    color: colors.success,
    background: colors.successSoft,
  },
};

export function NotificationsScreen({
  notifications,
  transactions,
  onNavigate,
  onMarkAllRead,
  onMarkRead,
  onSelectTransaction,
}: NotificationsScreenProps) {
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const feed = useMemo(
    () => new ActivityFeed(transactions, notifications),
    [notifications, transactions],
  );
  const groups = useMemo(
    () => feed.group(feed.query(activeFilter, searchQuery)),
    [activeFilter, feed, searchQuery],
  );
  const unreadCount = notifications.filter(
    (notification) => notification.category !== 'transaction' && !notification.isRead,
  ).length;

  const resetFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
  rightContent={
    unreadCount ? (
      <Pressable onPress={onMarkAllRead} style={({ pressed }) => pressed && styles.pressed}>
        <Text style={styles.markAll}>Đọc tất cả</Text>
      </Pressable>
    ) : null
  }
  title="Thông báo"
/>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchBox}>
          <Ionicons color={colors.textMuted} name="search-outline" size={20} />
          <TextInput
            accessibilityLabel="Tìm kiếm giao dịch và thông báo"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchQuery}
            placeholder="Nhập mã hoặc nội dung..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
          />
          {searchQuery ? (
            <Pressable
              accessibilityLabel="Xóa nội dung tìm kiếm"
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons color={colors.textMuted} name="close-circle" size={20} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          accessibilityRole="tablist"
          contentContainerStyle={styles.filters}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {filters.map((filter) => {
            const selected = activeFilter === filter.id;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                style={({ pressed }) => [
                  styles.filter,
                  selected && styles.filterSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {groups.length ? (
          groups.map((group) => (
            <View key={group.key} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.feedCard}>
                {group.items.map((item) =>
                  item.type === 'transaction' ? (
                    <TransactionRow
                      key={item.id}
                      onPress={onSelectTransaction}
                      transaction={item.transaction}
                    />
                  ) : (
                    <NotificationItem
                      key={item.id}
                      notification={item.notification}
                      onPress={() => onMarkRead(item.notification.id)}
                    />
                  ),
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons color={colors.primary} name="notifications-off-outline" size={28} />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy nội dung</Text>
            <Text style={styles.emptyText}>Hãy thử từ khóa khác hoặc xóa bộ lọc hiện tại.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={resetFilters}
              style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
            >
              <Text style={styles.resetButtonText}>Xóa bộ lọc</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <BottomNav active="notifications" onNavigate={onNavigate} />
    </View>
  );
}

function NotificationItem({
  notification,
  onPress,
}: {
  notification: LoyaltyNotification;
  onPress: () => void;
}) {
  const presentation = categoryStyle[notification.category];
  const record = new NotificationRecord(notification);

  return (
    <Pressable
      accessibilityHint="Đánh dấu thông báo đã đọc"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.notificationRow,
        !notification.isRead && styles.notificationUnread,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: presentation.background }]}>
        <Ionicons color={presentation.color} name={presentation.icon} size={20} />
      </View>
      <View style={styles.notificationInfo}>
        <View style={styles.notificationMeta}>
          <Text style={[styles.categoryLabel, { color: presentation.color }]}>
            {record.categoryLabel}
          </Text>
          {!notification.isRead ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text numberOfLines={1} style={styles.notificationTitle}>
          {notification.title}
        </Text>
        <Text numberOfLines={2} style={styles.notificationMessage}>
          {notification.message}
        </Text>
        <Text style={styles.notificationDate}>{notification.date}</Text>
      </View>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={17} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  pressed: { opacity: 0.68 },
  markAll: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 30 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  pageTitle: { color: colors.primaryDark, fontSize: 20, fontWeight: '900' },
  pageSubtitle: { marginTop: 4, color: colors.textMuted, fontSize: 10 },
  unreadBadge: {
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  unreadBadgeText: { color: colors.primary, fontSize: 9, fontWeight: '900' },
  searchBox: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    marginHorizontal: 9,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
  },
  filters: { paddingVertical: 16, paddingRight: 8 },
  filter: {
    minHeight: 38,
    justifyContent: 'center',
    marginRight: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 17,
  },
  filterSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  filterTextSelected: { color: colors.white, fontWeight: '900' },
  group: { marginBottom: 22 },
  groupLabel: {
  marginBottom: 10,
  marginLeft: 4,
  color: colors.textMuted,
  fontSize: 10,
  fontWeight: '900',
  letterSpacing: 0.9,
},
  feedCard: {
  overflow: 'visible',
  borderWidth: 0,
  borderColor: 'transparent',
  borderRadius: 0,
  backgroundColor: 'transparent',
  paddingHorizontal: 0,
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
},
  notificationRow: {
  minHeight: 104,
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 18,
  backgroundColor: colors.surface,
  paddingHorizontal: 14,
  paddingVertical: 13,
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 1,
},
  notificationUnread: {
  borderColor: 'rgba(0, 91, 170, 0.22)',
  backgroundColor: '#F7FBFF',
},
  categoryIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  notificationInfo: { flex: 1, marginHorizontal: 12 },
  notificationMeta: { flexDirection: 'row', alignItems: 'center' },
  categoryLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.4 },
  unreadDot: {
    width: 6,
    height: 6,
    marginLeft: 6,
    borderRadius: 3,
    backgroundColor: colors.danger,
  },
  notificationTitle: { marginTop: 3, color: colors.text, fontSize: 12, fontWeight: '800' },
  notificationMessage: { marginTop: 3, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  notificationDate: { marginTop: 4, color: colors.textMuted, fontSize: 9 },
  emptyState: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 34,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: colors.primarySoft,
  },
  emptyTitle: { marginTop: 13, color: colors.text, fontSize: 14, fontWeight: '800' },
  emptyText: { marginTop: 5, textAlign: 'center', color: colors.textMuted, fontSize: 11 },
  resetButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  resetButtonText: { color: colors.white, fontSize: 11, fontWeight: '800' },
});
