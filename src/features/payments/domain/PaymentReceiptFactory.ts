import type { PaymentProcessingChannel, PaymentReceiptStatus, Receipt } from '../../../types';
import type { PaymentBenefitDraft, PaymentInvoice } from './PaymentModels';

type PaymentReceiptFactoryInput = {
  benefit: PaymentBenefitDraft;
  invoice: PaymentInvoice;
  processingChannel: PaymentProcessingChannel;
  status: PaymentReceiptStatus;
  failureReason?: string;
};

export class PaymentReceiptFactory {
  static create({
    benefit,
    failureReason,
    invoice,
    processingChannel,
    status,
  }: PaymentReceiptFactoryInput): Receipt {
    const now = new Date();
    const transactionId = `NPS-PM-${Date.now().toString().slice(-6)}`;
    const createdAt = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(now);

    return {
      id: transactionId,
      kind: 'payment',
      merchant: invoice.merchant,
      title: `Thanh toán ${invoice.merchant} - ${invoice.id}`,
      originalAmount: invoice.amount,
      voucherDiscount: benefit.voucherDiscount,
      pointsUsed: status === 'failed' ? 0 : benefit.pointsUsed,
      cashAmount: benefit.cashAmount,
      createdAt,
      status,
      transactionId,
      occurredAt: now.toISOString(),
      invoiceCode: invoice.id,
      paymentChannel: processingChannel.label,
      pointsEarned: status === 'success' ? benefit.expectedEarnPoints : 0,
      failureReason,
    };
  }
}
