import type { Transaction } from '../../../types';

export type TransactionDirection = 'all' | 'earned' | 'spent';

export class TransactionLedger {
  constructor(private readonly transactions: readonly Transaction[]) {}

  filter(direction: TransactionDirection): Transaction[] {
    if (direction === 'earned') return this.transactions.filter((transaction) => transaction.points > 0);
    if (direction === 'spent') return this.transactions.filter((transaction) => transaction.points < 0);
    return [...this.transactions];
  }

  get earnedTotal(): number {
    return this.transactions
      .filter((transaction) => transaction.points > 0)
      .reduce((total, transaction) => total + transaction.points, 0);
  }

  get spentTotal(): number {
    return Math.abs(
      this.transactions
        .filter((transaction) => transaction.points < 0)
        .reduce((total, transaction) => total + transaction.points, 0),
    );
  }
}
