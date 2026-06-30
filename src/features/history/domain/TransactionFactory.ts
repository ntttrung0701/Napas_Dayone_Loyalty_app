import type { Receipt, Transaction, TransactionKind, TransactionStatus } from '../../../types';

type ReceiptTransactionOptions = {
  title: string;
  subtitle: string;
  kind: TransactionKind;
  points: number;
  source: string;
  status?: TransactionStatus;
};

export class TransactionFactory {
  static fromReceipt(receipt: Receipt, options: ReceiptTransactionOptions): Transaction {
    const status = options.status ?? receipt.status ?? 'success';
    const occurredAt = receipt.occurredAt ?? new Date().toISOString();
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
      status,
      source: options.source,
      amount: receipt.originalAmount,
      pointRule: this.resolvePointRule(options.kind, options.points, options.source),
      timeline: [
        {
          id: `${receipt.id}-completed`,
          time,
          title: this.resolveTimelineTitle(status),
          description: this.resolveTimelineDescription(status),
        },
        {
          id: `${receipt.id}-points`,
          time,
          title: this.resolvePointTimelineTitle(status, options.points),
          description: this.resolvePointTimelineDescription(status),
        },
      ],
    };
  }

  private static resolvePointRule(kind: TransactionKind, points: number, source: string): string {
  const absolutePoints = Math.abs(points).toLocaleString('vi-VN');

  if (kind === 'redemption') {
    return `Dùng ${absolutePoints} điểm để đổi ưu đãi/voucher từ ${source}.`;
  }

  if (kind === 'transfer') {
    return points < 0
      ? `Chuyển ${absolutePoints} điểm cho ${source}.`
      : `Nhận ${absolutePoints} điểm từ ${source}.`;
  }

  if (kind === 'payment') {
    return `Dùng ${absolutePoints} điểm để giảm trừ thanh toán tại ${source}.`;
  }

  if (kind === 'earn') {
    return `Cộng ${absolutePoints} điểm theo quy tắc chương trình Loyalty.`;
  }

  if (kind === 'expiration') {
    return `${absolutePoints} điểm hết hạn theo chính sách chương trình Loyalty.`;
  }

  return 'Cập nhật điểm theo quy tắc chương trình Loyalty.';
}

  private static resolveTimelineTitle(status: TransactionStatus): string {
    if (status === 'pending') return 'Giao dịch đang chờ xử lý';
    if (status === 'failed') return 'Giao dịch thất bại';
    return 'Giao dịch hoàn tất';
  }

  private static resolveTimelineDescription(status: TransactionStatus): string {
    if (status === 'pending') {
      return 'POS/Merchant đang xử lý hoặc chờ đối soát kết quả thanh toán.';
    }

    if (status === 'failed') {
      return 'Giao dịch không thành công; điểm/voucher không bị trừ vĩnh viễn.';
    }

    return 'Hệ thống Napas DayOne đã xử lý giao dịch thành công.';
  }

  private static resolvePointTimelineTitle(status: TransactionStatus, points: number): string {
    if (status === 'pending') return 'Điểm đang chờ xử lý';
    if (status === 'failed') return 'Điểm không bị trừ';
    return points >= 0 ? 'Cộng điểm thành công' : 'Cập nhật điểm thành công';
  }

  private static resolvePointTimelineDescription(status: TransactionStatus): string {
    if (status === 'pending') {
      return 'Điểm đang ở trạng thái chờ cho tới khi POS/Merchant trả kết quả cuối cùng.';
    }

    if (status === 'failed') {
      return 'Giao dịch thất bại nên điểm không bị trừ khỏi số dư khả dụng.';
    }

    return 'Số dư và lịch sử điểm đã được cập nhật.';
  }
}
