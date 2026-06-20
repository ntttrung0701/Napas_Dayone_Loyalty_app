import type { LoyaltyNotification, NotificationCategory } from '../../../types';

export type NotificationFilter = 'all' | NotificationCategory;

export type NotificationGroup = {
  key: string;
  label: string;
  notifications: LoyaltyNotification[];
};

export class NotificationRecord {
  constructor(readonly value: LoyaltyNotification) {}

  isIncludedIn(filter: NotificationFilter): boolean {
    return filter === 'all' || this.value.category === filter;
  }

  get categoryLabel(): string {
    if (this.value.category === 'transaction') return 'Giao dịch';
    if (this.value.category === 'offer') return 'Ưu đãi';
    return 'Hệ thống';
  }
}

export class NotificationCenter {
  private readonly sortedNotifications: LoyaltyNotification[];

  constructor(notifications: readonly LoyaltyNotification[]) {
    this.sortedNotifications = [...notifications].sort(
      (left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
    );
  }

  get unreadCount(): number {
    return this.sortedNotifications.filter((notification) => !notification.isRead).length;
  }

  filter(filter: NotificationFilter): LoyaltyNotification[] {
    return this.sortedNotifications.filter((notification) =>
      new NotificationRecord(notification).isIncludedIn(filter),
    );
  }

  group(notifications: readonly LoyaltyNotification[]): NotificationGroup[] {
    const groups = new Map<string, NotificationGroup>();
    notifications.forEach((notification) => {
      const date = new Date(notification.occurredAt);
      const key = this.resolveDayKey(date);
      const label = this.resolveDayLabel(key, date);
      const group = groups.get(key);
      if (group) group.notifications.push(notification);
      else groups.set(key, { key, label, notifications: [notification] });
    });
    return [...groups.values()];
  }

  private resolveDayKey(date: Date): string {
    if (Number.isNaN(date.getTime())) return 'older';
    const today = new Date();
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayDifference = Math.round((current.getTime() - target.getTime()) / 86_400_000);
    if (dayDifference === 0) return 'today';
    if (dayDifference === 1) return 'yesterday';
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  private resolveDayLabel(key: string, date: Date): string {
    if (key === 'today') return 'HÔM NAY';
    if (key === 'yesterday') return 'HÔM QUA';
    if (key === 'older' || Number.isNaN(date.getTime())) return 'TRƯỚC ĐÓ';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
}
