import type {
  PaymentInvoice,
  PaymentVoucher,
  PaymentVoucherEligibility,
} from './PaymentModels';

type ValidationResult = {
  isValid: boolean;
  reason?: string;
};

export class PaymentPolicy {
  validateInvoice(invoice: PaymentInvoice, now = new Date()): ValidationResult {
    const expiresAt = Date.parse(invoice.expiresAt);

    if (Number.isNaN(expiresAt)) {
      return { isValid: false, reason: 'Hóa đơn không có thời hạn hợp lệ.' };
    }

    if (expiresAt < now.getTime()) {
      return { isValid: false, reason: 'Hóa đơn đã hết hiệu lực.' };
    }

    if (invoice.amount <= 0) {
      return { isValid: false, reason: 'Số tiền hóa đơn không hợp lệ.' };
    }

    return { isValid: true };
  }

  validateVoucher(invoice: PaymentInvoice, voucher: PaymentVoucher, now = new Date()): PaymentVoucherEligibility {
    if (voucher.status === 'used') {
      return { isEligible: false, reason: 'Voucher đã được sử dụng.' };
    }

    if (voucher.status === 'expired' || Date.parse(voucher.expiresAt) < now.getTime()) {
      return { isEligible: false, reason: 'Voucher đã hết hạn.' };
    }

    if (voucher.minAmount && invoice.amount < voucher.minAmount) {
      return {
        isEligible: false,
        reason: `Cần hóa đơn từ ${voucher.minAmount.toLocaleString('vi-VN')}đ.`,
      };
    }

    if (voucher.merchantScope?.length && !voucher.merchantScope.includes(invoice.merchant)) {
      return { isEligible: false, reason: 'Không áp dụng cho merchant này.' };
    }

    if (voucher.categoryScope?.length && !voucher.categoryScope.includes(invoice.category)) {
      return { isEligible: false, reason: 'Không áp dụng cho nhóm giao dịch này.' };
    }

    return { isEligible: true };
  }

  validateRequestedPoints(requestedPoints: number, maxUsablePoints: number): ValidationResult {
    if (requestedPoints < 0) {
      return { isValid: false, reason: 'Số điểm sử dụng không được âm.' };
    }

    if (requestedPoints > maxUsablePoints) {
      return { isValid: false, reason: 'Số điểm vượt quá giới hạn có thể dùng.' };
    }

    return { isValid: true };
  }
}
