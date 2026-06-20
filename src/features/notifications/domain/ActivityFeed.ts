import type { LoyaltyNotification, Transaction } from '../../../types';
import {
  TransactionRecord,
  type HistoryFilter,
} from '../../history/domain/TransactionLedger';

export type ActivityFilter = HistoryFilter | 'offer' | 'system';

export type ActivityFeedItem =
  | {
      id: string;
      occurredAt: string;
      type: 'transaction';
      transaction: Transaction;
    }
  | {
      id: string;
      occurredAt: string;
      type: 'notification';
      notification: LoyaltyNotification;
    };

export type ActivityFeedGroup = {
  key: string;
  label: string;
  items: ActivityFeedItem[];
};

export class ActivityFeed {
  private readonly items: ActivityFeedItem[];

  constructor(
    transactions: readonly Transaction[],
    notifications: readonly LoyaltyNotification[],
  ) {
    const transactionItems: ActivityFeedItem[] = transactions.map((transaction) => ({
      id: `transaction-${transaction.id}`,
      occurredAt: transaction.occurredAt,
      type: 'transaction',
      transaction,
    }));
    const notificationItems: ActivityFeedItem[] = notifications
      .filter((notification) => notification.category !== 'transaction')
      .map((notification) => ({
        id: `notification-${notification.id}`,
        occurredAt: notification.occurredAt,
        type: 'notification',
        notification,
      }));

    this.items = [...transactionItems, ...notificationItems].sort(
      (left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
    );
  }

  query(filter: ActivityFilter, searchQuery = ''): ActivityFeedItem[] {
    const query = ActivityFeed.normalize(searchQuery);
    return this.items.filter((item) => {
      if (!this.matchesFilter(item, filter)) return false;
      if (!query) return true;
      return ActivityFeed.normalize(this.searchableText(item)).includes(query);
    });
  }

  group(items: readonly ActivityFeedItem[]): ActivityFeedGroup[] {
    const groups = new Map<string, ActivityFeedGroup>();
    items.forEach((item) => {
      const date = new Date(item.occurredAt);
      const validDate = !Number.isNaN(date.getTime());
      const key = validDate
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : 'recent';
      const label = validDate
        ? `THÁNG ${date.getMonth() + 1}, ${date.getFullYear()}`
        : 'GẦN ĐÂY';
      const group = groups.get(key);
      if (group) group.items.push(item);
      else groups.set(key, { key, label, items: [item] });
    });
    return [...groups.values()];
  }

  private matchesFilter(item: ActivityFeedItem, filter: ActivityFilter): boolean {
    if (filter === 'all') return true;
    if (item.type === 'notification') return item.notification.category === filter;
    if (filter === 'offer' || filter === 'system') return false;
    return new TransactionRecord(item.transaction).isIncludedIn(filter);
  }

  private searchableText(item: ActivityFeedItem): string {
    if (item.type === 'transaction') {
      const transaction = item.transaction;
      return [transaction.id, transaction.title, transaction.subtitle, transaction.source].join(' ');
    }
    const notification = item.notification;
    return [notification.id, notification.title, notification.message].join(' ');
  }

  private static normalize(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('vi-VN')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }
}
