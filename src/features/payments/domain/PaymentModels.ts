import type {
  PaymentChannel,
  PaymentProcessingChannel,
  PaymentReceiptStatus,
  Receipt,
} from '../../../types';

export type InvoiceSource = 'manual' | 'qr-demo' | 'suggested';

export type PaymentInvoice = {
  id: string;
  amount: number;
  category: string;
  channel: PaymentChannel;
  customerNote: string;
  dueLabel: string;
  expiresAt: string;
  merchant: string;
  source: InvoiceSource;
  terminal: string;
  demoStatus?: PaymentReceiptStatus;
};

export type PaymentVoucherStatus = 'available' | 'used' | 'expired';

export type PaymentVoucher = {
  id: string;
  description: string;
  discountRate: number;
  expiresAt: string;
  expiresLabel: string;
  maxDiscount: number;
  minAmount?: number;
  merchantScope?: string[];
  categoryScope?: string[];
  status: PaymentVoucherStatus;
  title: string;
};

export type PaymentVoucherEligibility = {
  isEligible: boolean;
  reason?: string;
};

export type PaymentVoucherOption = {
  voucher: PaymentVoucher;
  eligibility: PaymentVoucherEligibility;
};

export type PaymentBenefitDraft = {
  originalAmount: number;
  voucher: PaymentVoucher | null;
  voucherDiscount: number;
  maxUsablePoints: number;
  pointsRequested: number;
  pointsUsed: number;
  pointDiscount: number;
  cashAmount: number;
  expectedEarnPoints: number;
  conversionRate: number;
};

export type PaymentCalculationInput = {
  invoice: PaymentInvoice;
  voucher: PaymentVoucher | null;
  pointsAvailable: number;
  requestedPoints: number;
};

export type PaymentConfirmationInput = {
  invoice: PaymentInvoice;
  benefit: PaymentBenefitDraft;
  processingChannel: PaymentProcessingChannel;
  otp: string;
};

export type PaymentConfirmationResult =
  | {
      ok: true;
      receipt: Receipt;
      status: PaymentReceiptStatus;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };
