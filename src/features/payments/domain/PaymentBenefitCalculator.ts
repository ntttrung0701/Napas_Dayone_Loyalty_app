import type { PaymentBenefitDraft, PaymentCalculationInput } from './PaymentModels';
import { PaymentPolicy } from './PaymentPolicy';

const POINT_TO_VND_RATE = 1;
const MAX_POINTS_PER_PAYMENT = 80_000;

export class PaymentBenefitCalculator {
  constructor(private readonly policy = new PaymentPolicy()) {}

  calculate({
    invoice,
    pointsAvailable,
    requestedPoints,
    voucher,
  }: PaymentCalculationInput): PaymentBenefitDraft {
    const validVoucher = voucher && this.policy.validateVoucher(invoice, voucher).isEligible
      ? voucher
      : null;
    const voucherDiscount = validVoucher
      ? Math.min(
          Math.round(invoice.amount * validVoucher.discountRate),
          validVoucher.maxDiscount,
          invoice.amount,
        )
      : 0;
    const maxUsablePoints = Math.min(
      pointsAvailable,
      MAX_POINTS_PER_PAYMENT,
      Math.max(0, invoice.amount - voucherDiscount),
    );
    const pointsUsed = Math.min(Math.max(0, requestedPoints), maxUsablePoints);
    const pointDiscount = pointsUsed * POINT_TO_VND_RATE;
    const cashAmount = Math.max(0, invoice.amount - voucherDiscount - pointDiscount);
    const expectedEarnPoints = Math.floor(cashAmount / 10_000);

    return {
      originalAmount: invoice.amount,
      voucher: validVoucher,
      voucherDiscount,
      maxUsablePoints,
      pointsRequested: requestedPoints,
      pointsUsed,
      pointDiscount,
      cashAmount,
      expectedEarnPoints,
      conversionRate: POINT_TO_VND_RATE,
    };
  }
}
