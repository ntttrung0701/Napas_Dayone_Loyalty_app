import type { LoyaltyNotification, NotificationCategory, Receipt } from '../../../types';

type NotificationFactoryOptions = {
  title: string;
  message: string;
  category?: NotificationCategory;
};

export class NotificationFactory {
  static fromReceipt(
    receipt: Receipt,
    options: NotificationFactoryOptions,
  ): LoyaltyNotification {
    const occurredAt = new Date().toISOString();
    const time = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    return {
      id: `NTF-${receipt.id}`,
      title: options.title,
      message: options.message,
      date: `${time}, hôm nay`,
      occurredAt,
      category: options.category ?? 'transaction',
      isRead: false,
    };
  }
}
