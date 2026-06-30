import type { Transaction, TransactionKind, TransactionStatus } from '../../../types';

export type HistoryFilter =
  | 'all'
  | 'earned'
  | 'redeemed'
  | 'pending'
  | 'expired';


export type TransactionGroup = {
  key: string;
  label: string;
  transactions: Transaction[];
};

const kindLabels: Record<TransactionKind, string> = {
  earn: 'Tích điểm',
  redemption: 'Đổi điểm',
  transfer: 'Chuyển điểm',
  expiration: 'Điểm hết hạn',
  payment: 'Điểm từ thanh toán',
};

const statusLabels: Record<TransactionStatus, string> = {
  success: 'Thành công',
  pending: 'Đang chờ',
  expired: 'Hết hạn',
  failed: 'Thất bại',
};

export class TransactionDatePresenter {
  private readonly date: Date;

  constructor(private readonly occurredAt: string) {
    this.date = new Date(occurredAt);
  }

  get isValid(): boolean {
    return !Number.isNaN(this.date.getTime());
  }

  get displayLabel(): string {
    if (!this.isValid) return 'Không rõ thời gian';

    const time = this.formatTime();

    if (this.isToday()) {
      return `Hôm nay, ${time}`;
    }

    return `${this.formatDate()}, ${time}`;
  }

  get groupKey(): string {
    if (!this.isValid) return 'unknown';

    const month = String(this.date.getMonth() + 1).padStart(2, '0');

    return `${this.date.getFullYear()}-${month}`;
  }

  get groupLabel(): string {
    if (!this.isValid) return 'GẦN ĐÂY';

    const month = String(this.date.getMonth() + 1).padStart(2, '0');

    return `THÁNG ${month}/${this.date.getFullYear()}`;
  }

  get searchDocument(): string {
    if (!this.isValid) return '';

    const day = String(this.date.getDate()).padStart(2, '0');
    const month = String(this.date.getMonth() + 1).padStart(2, '0');
    const year = String(this.date.getFullYear());
    const hour = String(this.date.getHours()).padStart(2, '0');
    const minute = String(this.date.getMinutes()).padStart(2, '0');

    return [
      this.displayLabel,

      `${day}/${month}`,
      `${day}/${month}/${year}`,
      `${month}/${year}`,
      `${year}`,

      `${day}-${month}`,
      `${day}-${month}-${year}`,
      `${month}-${year}`,

      `${day}.${month}`,
      `${day}.${month}.${year}`,
      `${month}.${year}`,

      `${day} ${month}`,
      `${day} ${month} ${year}`,
      `${month} ${year}`,

      `${hour}:${minute}`,
      `${hour}h${minute}`,
      `${hour}${minute}`,

      `ngay ${day}`,
      `thang ${Number(month)}`,
      `thang ${month}`,
      `nam ${year}`,
      `thang ${Number(month)} ${year}`,
      `thang ${month} ${year}`,
    ].join(' ');
  }

  private formatDate(): string {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(this.date);
  }

  private formatTime(): string {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(this.date);
  }

  private isToday(): boolean {
    const today = new Date();

    return (
      this.date.getFullYear() === today.getFullYear() &&
      this.date.getMonth() === today.getMonth() &&
      this.date.getDate() === today.getDate()
    );
  }
}

export class TransactionRecord {
  constructor(readonly value: Transaction) {}

  get isCredit(): boolean {
    return this.value.points > 0;
  }

  get kindLabel(): string {
    return kindLabels[this.value.kind];
  }

  get statusLabel(): string {
    return statusLabels[this.value.status];
  }

  get resultLabel(): string {
    if (this.value.status === 'success') return 'GIAO DỊCH THÀNH CÔNG';
    if (this.value.status === 'pending') return 'GIAO DỊCH ĐANG XỬ LÝ';
    if (this.value.status === 'expired') return 'GIAO DỊCH ĐÃ HẾT HẠN';
    return 'GIAO DỊCH THẤT BẠI';
  }

  get isPointRelated(): boolean {
  if (this.value.kind === 'expiration') return true;
  if (this.value.kind === 'redemption') return true;
  if (this.value.kind === 'transfer') return true;
  if (this.value.kind === 'earn') return true;

  return this.value.points !== 0;
}

  matches(searchQuery: string): boolean {
  const query = TransactionRecord.normalize(searchQuery);
  if (!query) return true;

  const datePresenter = new TransactionDatePresenter(this.value.occurredAt);

  const searchableContent = [
    this.value.id,
    this.value.title,
    this.value.subtitle,
    this.value.source,
    this.value.kind,
    this.value.status,
    this.kindLabel,
    this.statusLabel,
    String(this.value.points),
    String(Math.abs(this.value.points)),
    datePresenter.displayLabel,
    datePresenter.searchDocument,
  ].join(' ');

  return TransactionRecord.normalize(searchableContent).includes(query);
}


  isIncludedIn(filter: HistoryFilter): boolean {
  if (!this.isPointRelated) return false;

  if (filter === 'earned') {
    return this.value.points > 0 && this.value.status !== 'pending';
  }

  if (filter === 'redeemed') {
    return this.value.kind === 'redemption';
  }

  if (filter === 'pending') {
    return this.value.status === 'pending';
  }

  if (filter === 'expired') {
    return this.value.kind === 'expiration' || this.value.status === 'expired';
  }

  return true;
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

export class TransactionLedger {
  private readonly sortedTransactions: Transaction[];

  constructor(transactions: readonly Transaction[]) {
    this.sortedTransactions = [...transactions].sort(
      (left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
    );
  }

  getSummary() {
  return this.sortedTransactions.reduce(
    (summary, transaction) => {
      const record = new TransactionRecord(transaction);

      if (!record.isPointRelated) return summary;

      if (transaction.status === 'pending') {
        summary.pending += Math.abs(transaction.points);
        return summary;
      }

      if (transaction.status === 'failed') {
        summary.failed += 1;
        return summary;
      }

      if (transaction.kind === 'expiration' || transaction.status === 'expired') {
        summary.expired += Math.abs(transaction.points);
        return summary;
      }

      if (transaction.points > 0) {
        summary.earned += transaction.points;
      }

      if (transaction.points < 0) {
        summary.used += Math.abs(transaction.points);
      }

      return summary;
    },
    {
      earned: 0,
      used: 0,
      pending: 0,
      expired: 0,
      failed: 0,
    },
  );
}

  query(filter: HistoryFilter, searchQuery = ''): Transaction[] {
    return this.sortedTransactions.filter((transaction) => {
      const record = new TransactionRecord(transaction);
      return record.isIncludedIn(filter) && record.matches(searchQuery);
    });
  }

  group(transactions: readonly Transaction[]): TransactionGroup[] {
  const groups = new Map<string, TransactionGroup>();

  transactions.forEach((transaction) => {
    const datePresenter = new TransactionDatePresenter(transaction.occurredAt);
    const key = datePresenter.groupKey;
    const label = datePresenter.groupLabel;

    const existing = groups.get(key);

    if (existing) {
      existing.transactions.push(transaction);
      return;
    }

    groups.set(key, {
      key,
      label,
      transactions: [transaction],
    });
  });

  return [...groups.values()];
}

  findById(transactionId: string): Transaction | undefined {
    return this.sortedTransactions.find((transaction) => transaction.id === transactionId);
  }
}
export type TransactionBalanceSnapshot = {
  balanceBefore: number;
  balanceAfter: number;
  appliedChange: number;
  displayChange: number;
  isEstimated: boolean;
};

function getAppliedPointDelta(transaction: Transaction) {
  if (transaction.status === 'failed' || transaction.status === 'pending') return 0;
  return transaction.points;
}

export function resolveTransactionBalanceSnapshot({
  currentPoints,
  transaction,
  transactions,
}: {
  currentPoints: number;
  transaction: Transaction;
  transactions: readonly Transaction[];
}): TransactionBalanceSnapshot {
  const sortedTransactions = [...transactions].sort(
    (left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
  );

  let runningBalanceAfter = currentPoints;

  for (const item of sortedTransactions) {
    const appliedChange = getAppliedPointDelta(item);
    const balanceBefore = runningBalanceAfter - appliedChange;

    if (item.id === transaction.id) {
      return {
        balanceBefore,
        balanceAfter: runningBalanceAfter,
        appliedChange,
        displayChange: item.points,
        isEstimated: false,
      };
    }

    runningBalanceAfter = balanceBefore;
  }

  const fallbackChange = getAppliedPointDelta(transaction);

  return {
    balanceBefore: currentPoints - fallbackChange,
    balanceAfter: currentPoints,
    appliedChange: fallbackChange,
    displayChange: transaction.points,
    isEstimated: true,
  };
}
