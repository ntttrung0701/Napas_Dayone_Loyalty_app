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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { AppScreen, LoyaltyNotification, NotificationCategory } from '../../types';

type IconName = ComponentProps<typeof Ionicons>['name'];

type NotificationFilter = 'all' | 'unread' | NotificationCategory;

type NotificationsScreenProps = {
  notifications: LoyaltyNotification[];
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  onMarkAllRead: () => void;
  onMarkRead: (notificationId: string) => void;
};

type NotificationPresentation = {
  icon: IconName;
  label: string;
  color: string;
  background: string;
};

type NotificationGroup = {
  key: string;
  label: string;
  notifications: LoyaltyNotification[];
};

const filters: ReadonlyArray<{ id: NotificationFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  { id: 'transaction', label: 'Giao dịch' },
  { id: 'offer', label: 'Ưu đãi' },
  { id: 'system', label: 'Hệ thống' },
];

const notificationPresentation: Record<NotificationCategory, NotificationPresentation> = {
  transaction: {
    icon: 'card-outline',
    label: 'Giao dịch',
    color: colors.primary,
    background: colors.primarySoft,
  },
  offer: {
    icon: 'gift-outline',
    label: 'Ưu đãi',
    color: colors.warning,
    background: colors.warningSoft,
  },
  system: {
    icon: 'shield-checkmark-outline',
    label: 'Hệ thống',
    color: colors.success,
    background: colors.successSoft,
  },
};

class NotificationInbox {
  private readonly sortedNotifications: LoyaltyNotification[];

  constructor(notifications: readonly LoyaltyNotification[]) {
    this.sortedNotifications = [...notifications].sort(
      (left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
    );
  }

  get unreadCount() {
    return this.sortedNotifications.filter((notification) => !notification.isRead).length;
  }

  query(filter: NotificationFilter, searchQuery: string) {
    const normalizedQuery = NotificationInbox.normalize(searchQuery);

    return this.sortedNotifications.filter((notification) => {
      if (filter === 'unread' && notification.isRead) return false;
      if (filter !== 'all' && filter !== 'unread' && notification.category !== filter) {
        return false;
      }

      if (!normalizedQuery) return true;

      return NotificationInbox.normalize(
        [
          notification.title,
          notification.message,
          notification.date,
          notification.category,
        ].join(' '),
      ).includes(normalizedQuery);
    });
  }

  group(notifications: readonly LoyaltyNotification[]): NotificationGroup[] {
    const groups = new Map<string, NotificationGroup>();

    notifications.forEach((notification) => {
      const date = new Date(notification.occurredAt);
      const key = this.resolveGroupKey(date);
      const label = this.resolveGroupLabel(key, date);
      const current = groups.get(key);

      if (current) {
        current.notifications.push(notification);
        return;
      }

      groups.set(key, {
        key,
        label,
        notifications: [notification],
      });
    });

    return [...groups.values()];
  }

  private resolveGroupKey(date: Date) {
    if (Number.isNaN(date.getTime())) return 'older';

    const today = new Date();
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayDifference = Math.round((current.getTime() - target.getTime()) / 86_400_000);

    if (dayDifference === 0) return 'today';
    if (dayDifference === 1) return 'yesterday';

    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  private resolveGroupLabel(key: string, date: Date) {
    if (key === 'today') return 'HÔM NAY';
    if (key === 'yesterday') return 'HÔM QUA';
    if (key === 'older' || Number.isNaN(date.getTime())) return 'TRƯỚC ĐÓ';

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  private static normalize(value: string) {
    return value
      .trim()
      .toLocaleLowerCase('vi-VN')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }
}

function resolveNotificationTarget(notification: LoyaltyNotification): AppScreen {
  if (notification.category === 'transaction') return 'history';
  if (notification.category === 'offer') return 'offers';

  return 'profile';
}

export function NotificationsScreen({
  notifications,
  onBack,
  onNavigate,
  onMarkAllRead,
  onMarkRead,
}: NotificationsScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const inbox = useMemo(() => new NotificationInbox(notifications), [notifications]);

  const visibleNotifications = useMemo(
    () => inbox.query(activeFilter, searchQuery),
    [activeFilter, inbox, searchQuery],
  );

  const groups = useMemo(
    () => inbox.group(visibleNotifications),
    [inbox, visibleNotifications],
  );

  const resetFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
  };

  const handleOpenNotification = (notification: LoyaltyNotification) => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }

    onNavigate(resolveNotificationTarget(notification));
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        onBack={onBack}
        rightContent={
          inbox.unreadCount ? (
            <Pressable
              onPress={onMarkAllRead}
              style={({ pressed }) => [styles.markAllButton, pressed && styles.pressed]}
            >
              <Text style={styles.markAllText}>Đọc tất cả</Text>
            </Pressable>
          ) : null
        }
        title="Thông báo"
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons color={colors.primary} name="notifications-outline" size={24} />
          </View>

          <View style={styles.summaryTextBox}>
            <Text style={styles.summaryTitle}>Trung tâm thông báo</Text>
            <Text style={styles.summaryDescription}>
              Theo dõi bảo mật, ưu đãi, voucher và trạng thái giao dịch của bạn.
            </Text>
          </View>

          {inbox.unreadCount ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{inbox.unreadCount}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.searchBox}>
          <Ionicons color={colors.textMuted} name="search-outline" size={20} />

          <TextInput
            cursorColor={colors.primary}
            onChangeText={setSearchQuery}
            placeholder="Tìm thông báo..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
          />

          {searchQuery ? (
            <Pressable
              onPress={() => setSearchQuery('')}
              style={({ pressed }) => [styles.clearSearchButton, pressed && styles.pressed]}
            >
              <Ionicons color={colors.textMuted} name="close-circle" size={18} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => {
            const selected = activeFilter === filter.id;

            return (
              <Pressable
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

              {group.notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={() => handleOpenNotification(notification)}
                />
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons color={colors.primary} name="file-tray-outline" size={30} />
            </View>

            <Text style={styles.emptyTitle}>Không có thông báo phù hợp</Text>
            <Text style={styles.emptyText}>
              Hãy thử từ khóa khác hoặc xóa bộ lọc hiện tại.
            </Text>

            <Pressable
              onPress={resetFilters}
              style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
            >
              <Text style={styles.resetButtonText}>Xóa bộ lọc</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function NotificationCard({
  notification,
  onPress,
}: {
  notification: LoyaltyNotification;
  onPress: () => void;
}) {
  const presentation = notificationPresentation[notification.category];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.notificationCard,
        !notification.isRead && styles.notificationUnread,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.notificationIcon, { backgroundColor: presentation.background }]}>
        <Ionicons color={presentation.color} name={presentation.icon} size={22} />
      </View>

      <View style={styles.notificationBody}>
        <View style={styles.notificationMetaRow}>
          <Text style={[styles.categoryLabel, { color: presentation.color }]}>
            {presentation.label}
          </Text>

          {!notification.isRead ? <View style={styles.unreadDot} /> : null}
        </View>

        <Text numberOfLines={2} style={styles.notificationTitle}>
          {notification.title}
        </Text>

        <Text numberOfLines={3} style={styles.notificationMessage}>
          {notification.message}
        </Text>

        <Text style={styles.notificationDate}>{notification.date}</Text>
      </View>

      <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  pressed: {
    opacity: 0.68,
  },

  markAllButton: {
    minHeight: 34,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
  },

  markAllText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  summaryCard: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
  },

  summaryTextBox: {
    flex: 1,
    marginHorizontal: 12,
  },

  summaryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  summaryDescription: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },

  unreadBadge: {
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
  },

  unreadBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },

  searchBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,
    minHeight: 50,
    marginHorizontal: 9,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },

  clearSearchButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterRow: {
    paddingTop: 14,
    paddingBottom: 18,
    paddingRight: 8,
  },

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

  filterSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  filterText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },

  filterTextSelected: {
    color: colors.white,
    fontWeight: '900',
  },

  group: {
    marginBottom: 22,
  },

  groupLabel: {
    marginBottom: 10,
    marginLeft: 4,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  notificationCard: {
    minHeight: 112,
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
    borderColor: 'rgba(0, 91, 170, 0.24)',
    backgroundColor: '#F7FBFF',
  },

  notificationIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },

  notificationBody: {
    flex: 1,
    marginHorizontal: 12,
  },

  notificationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  unreadDot: {
    width: 7,
    height: 7,
    marginLeft: 7,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },

  notificationTitle: {
    marginTop: 4,
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
  },

  notificationMessage: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },

  notificationDate: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },

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

  emptyTitle: {
    marginTop: 13,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  emptyText: {
    marginTop: 5,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },

  resetButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  resetButtonText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
});