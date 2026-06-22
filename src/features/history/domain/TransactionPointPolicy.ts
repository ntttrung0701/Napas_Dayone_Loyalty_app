import type { Transaction } from '../../../types';

export class TransactionPointPolicy {
  constructor(private readonly transaction: Transaction) {}

  get ruleLabel() {
    if (this.transaction.kind === 'payment') {
      return 'Quy tắc quy đổi điểm';
    }

    return 'Quy tắc tích điểm';
  }

  get ruleDescription() {
    if (this.transaction.kind === 'payment') {
      return '1 điểm = 1 VNĐ';
    }

    return '10.000 VNĐ = 1 điểm';
  }
}