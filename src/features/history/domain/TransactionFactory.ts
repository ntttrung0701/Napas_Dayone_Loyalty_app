import type { Receipt, Transaction, TransactionKind } from '../../../types';

type ReceiptTransactionOptions = {
  title: string;
  subtitle: string;
  kind: TransactionKind;
  points: number;
  source: string;
};

export class TransactionFactory {
  static fromReceipt(receipt: Receipt, options: ReceiptTransactionOptions): Transaction {
    const occurredAt = new Date().toISOString();
    const time = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());

    return {
      id: receipt.id,
      title: options.title,
      subtitle: options.subtitle,
      date: receipt.createdAt,
      occurredAt,
      points: options.points,
      kind: options.kind,
      status: 'success',
      source: options.source,
      amount: receipt.originalAmount,
      pointRule: this.resolvePointRule(options.kind, options.points),
      timeline: [
        {
          id: `${receipt.id}-completed`,
          time,
          title: 'Giao dịch hoàn tất',
          description: 'Hệ thống Napas DayOne đã xử lý giao dịch thành công.',
        },
        {
          id: `${receipt.id}-points`,
          time,
          title: options.points >= 0 ? 'Cộng điểm thành công' : 'Cập nhật điểm thành công',
          description: 'Số dư và lịch sử điểm đã được cập nhật.',
        },
      ],
    };
  }

  private static resolvePointRule(kind: TransactionKind, points: number): string {
    if (kind === 'redemption') return `${Math.abs(points).toLocaleString('vi-VN')} điểm đổi ưu đãi`;
    if (kind === 'transfer') return 'Chuyển điểm giữa các thành viên Loyalty';
    return 'Theo quy tắc của chương trình Loyalty';
  }
}
