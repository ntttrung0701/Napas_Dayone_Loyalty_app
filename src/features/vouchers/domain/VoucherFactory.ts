import type { Offer, UserVoucher, UserVoucherStatus } from '../../../types';

type VoucherQrPayload = {
  type: 'LOYALTY_VOUCHER';
  voucherId: string;
  code: string;
  expiresAt: string;
};

const voucherCodeByOfferId: Record<string, string> = {
  'highlands-50': 'HIGHLANDS50',
  'winmart-10': 'WINMART10',
  'travel-100': 'TRAVEL100',
};

export class VoucherFactory {
  static fromOffer(offer: Offer, transactionId: string, ): UserVoucher {
    const { expiresAt, expiresLabel } = this.resolveExpiry(offer.expiresAt);
    const fallbackCode = `VC${Date.now().toString().slice(-6)}`;

    return {
      id: `VC-${Date.now().toString().slice(-6)}`,
      offerId: offer.id,
      title: offer.title,
      partner: offer.partner,
      code: voucherCodeByOfferId[offer.id] ?? fallbackCode,
      status: 'active',
      issuedAt: new Date().toISOString(),
      expiresAt,
      expiresLabel,
      description: offer.description,
      terms: [
        `Hạn sử dụng: ${expiresLabel}.`,
        'Mỗi hóa đơn áp dụng tối đa một voucher.',
        'Không quy đổi thành tiền mặt.',
      ],
      pointsUsed: offer.points,
      transactionId,
      media: offer.media,
    };
  }

  static getEffectiveStatus(voucher: UserVoucher): UserVoucherStatus {
    if (voucher.status === 'used') return 'used';

    if (voucher.status === 'expired' || Date.now() > Date.parse(voucher.expiresAt)) {
      return 'expired';
    }

    return 'active';
  }

  static canUse(voucher: UserVoucher) {
    return this.getEffectiveStatus(voucher) === 'active';
  }

  static getStatusLabel(voucher: UserVoucher) {
    const status = this.getEffectiveStatus(voucher);

    if (status === 'active') return 'Còn hạn';
    if (status === 'used') return 'Đã dùng';
    return 'Hết hạn';
  }

  static getStatusDescription(voucher: UserVoucher) {
    const status = this.getEffectiveStatus(voucher);

    if (status === 'active') {
      return `Voucher còn hiệu lực đến ${voucher.expiresLabel}.`;
    }

    if (status === 'used') {
      return voucher.usedAt
        ? `Voucher đã được sử dụng lúc ${this.formatDateTime(voucher.usedAt)}.`
        : 'Voucher đã được sử dụng.';
    }

    return 'Voucher đã hết hạn và không thể sử dụng.';
  }

  static createQrPayload(voucher: UserVoucher): VoucherQrPayload {
    return {
      type: 'LOYALTY_VOUCHER',
      voucherId: voucher.id,
      code: voucher.code,
      expiresAt: voucher.expiresAt,
    };
  }

  private static resolveExpiry(expiresAtText: string) {
    if (expiresAtText.includes('30 ngày')) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      return {
        expiresAt: expiresAt.toISOString(),
        expiresLabel: '30 ngày kể từ lúc đổi',
      };
    }

    const dateMatch = expiresAtText.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      const expiresAt = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);

      return {
        expiresAt: expiresAt.toISOString(),
        expiresLabel: expiresAtText,
      };
    }

    const fallback = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      expiresAt: fallback.toISOString(),
      expiresLabel: expiresAtText,
    };
  }

  private static formatDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}