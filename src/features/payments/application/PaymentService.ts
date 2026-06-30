import type { PaymentProcessingChannel } from '../../../types';
import type { DemoPaymentRepository } from '../data/DemoPaymentRepository';
import { PaymentBenefitCalculator } from '../domain/PaymentBenefitCalculator';
import type {
  PaymentBenefitDraft,
  PaymentConfirmationInput,
  PaymentConfirmationResult,
  PaymentInvoice,
  PaymentVoucher,
  PaymentVoucherOption,
} from '../domain/PaymentModels';
import { PaymentOtpVerifier } from '../domain/PaymentOtpVerifier';
import { PaymentPolicy } from '../domain/PaymentPolicy';
import { PaymentReceiptFactory } from '../domain/PaymentReceiptFactory';

type CalculateBenefitInput = {
  invoice: PaymentInvoice;
  pointsAvailable: number;
  requestedPoints: number;
  voucherId: string | null;
};

export class PaymentService {
  private readonly calculator: PaymentBenefitCalculator;
  private readonly otpVerifier: PaymentOtpVerifier;
  private readonly policy: PaymentPolicy;

  constructor(private readonly repository: DemoPaymentRepository) {
    this.policy = new PaymentPolicy();
    this.calculator = new PaymentBenefitCalculator(this.policy);
    this.otpVerifier = new PaymentOtpVerifier();
  }

  lookupInvoice(code: string) {
    const invoice = this.repository.getInvoiceCatalog().findByCode(code);

    if (!invoice) {
      return {
        invoice: null,
        error: 'Không tìm thấy hóa đơn. Thử HD-WM-24062026 hoặc quét QR demo.',
      };
    }

    const validation = this.policy.validateInvoice(invoice);
    if (!validation.isValid) {
      return {
        invoice: null,
        error: validation.reason ?? 'Hóa đơn không hợp lệ.',
      };
    }

    return { invoice, error: null };
  }

  getSuggestedInvoice() {
    return this.repository.getInvoiceCatalog().getSuggestedInvoice();
  }

  getQrInvoice() {
    return this.repository.getInvoiceCatalog().getQrInvoice();
  }

  searchInvoices(query: string) {
    return this.repository.getInvoiceCatalog().searchInvoices(query);
  }

  getVoucherOptions(invoice: PaymentInvoice): PaymentVoucherOption[] {
    return this.repository.getVouchers().map((voucher) => ({
      voucher,
      eligibility: this.policy.validateVoucher(invoice, voucher),
    }));
  }

  calculateBenefit({
    invoice,
    pointsAvailable,
    requestedPoints,
    voucherId,
  }: CalculateBenefitInput): PaymentBenefitDraft {
    const voucher = this.resolveEligibleVoucher(invoice, voucherId);

    return this.calculator.calculate({
      invoice,
      voucher,
      pointsAvailable,
      requestedPoints,
    });
  }

  getProcessingChannel(
    invoice: PaymentInvoice,
    benefit: PaymentBenefitDraft,
  ): PaymentProcessingChannel {
    return this.repository.getProcessingChannel(invoice, benefit.cashAmount);
  }

  confirmPayment({
    benefit,
    invoice,
    otp,
    processingChannel,
  }: PaymentConfirmationInput): PaymentConfirmationResult {
    const otpResult = this.otpVerifier.verify(otp);
    if (!otpResult.success) {
      return {
        ok: false,
        message: otpResult.message,
      };
    }

    const status = invoice.demoStatus ?? 'success';
    const failureReason =
      status === 'failed'
        ? 'Đối tác từ chối hoặc phiên thanh toán đã hết hiệu lực trong môi trường demo.'
        : undefined;

    const receipt = PaymentReceiptFactory.create({
      benefit,
      invoice,
      processingChannel,
      status,
      failureReason,
    });

    return {
      ok: true,
      receipt,
      status,
      message: this.resolveStatusMessage(status),
    };
  }

  completePayment() {
    return true;
  }

  private resolveEligibleVoucher(
    invoice: PaymentInvoice,
    voucherId: string | null,
  ): PaymentVoucher | null {
    if (!voucherId) return null;

    const voucher = this.repository.getVouchers().find((item) => item.id === voucherId) ?? null;
    if (!voucher) return null;

    return this.policy.validateVoucher(invoice, voucher).isEligible ? voucher : null;
  }

  private resolveStatusMessage(status: 'success' | 'pending' | 'failed') {
    if (status === 'success') return 'Thanh toán đã được xử lý thành công.';
    if (status === 'pending') return 'Giao dịch đang chờ POS/đối tác đối soát.';
    return 'Thanh toán thất bại. Điểm/voucher không bị trừ vĩnh viễn.';
  }
}
