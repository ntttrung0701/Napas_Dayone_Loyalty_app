import type { PaymentProcessingChannel } from '../../../types';
import { PaymentInvoiceCatalog } from '../domain/PaymentInvoiceCatalog';
import type { PaymentInvoice, PaymentVoucher } from '../domain/PaymentModels';

const demoInvoices: PaymentInvoice[] = [
  {
    id: 'HD-WM-24062026',
    amount: 450_000,
    category: 'Mua sắm',
    channel: 'pos',
    customerNote: 'Hóa đơn mua sắm tại quầy thu ngân',
    dueLabel: 'Còn hiệu lực trong ngày',
    expiresAt: '2026-12-31T23:59:59+07:00',
    merchant: 'WinMart Landmark 81',
    source: 'suggested',
    terminal: 'POS-NPS-8839',
    demoStatus: 'success',
  },
  {
    id: 'QR-CGV-26062026',
    amount: 286_000,
    category: 'Giải trí',
    channel: 'qr',
    customerNote: 'Mã QR hóa đơn tại quầy CGV',
    dueLabel: 'QR còn hiệu lực 05:00',
    expiresAt: '2026-12-31T23:59:59+07:00',
    merchant: 'CGV Vincom Center',
    source: 'qr-demo',
    terminal: 'QR-NPS-1028',
    demoStatus: 'pending',
  },
  {
    id: 'ECOM-HL-26062026',
    amount: 125_000,
    category: 'Ẩm thực',
    channel: 'ecom',
    customerNote: 'Đơn hàng online Highlands Coffee',
    dueLabel: 'Chờ thanh toán',
    expiresAt: '2026-12-31T23:59:59+07:00',
    merchant: 'Highlands Coffee Online',
    source: 'manual',
    terminal: 'ECOM-NPS-7712',
    demoStatus: 'failed',
  },
];

const demoVouchers: PaymentVoucher[] = [
  {
    id: 'voucher-gold-10',
    description: 'Áp dụng cho hóa đơn từ 200.000đ tại merchant tham gia Loyalty.',
    discountRate: 0.1,
    expiresAt: '2026-12-31T23:59:59+07:00',
    expiresLabel: '31/12/2026',
    maxDiscount: 50_000,
    minAmount: 200_000,
    status: 'available',
    title: 'Hoàn 10% cho Hạng Vàng',
  },
  {
    id: 'voucher-weekend-5',
    categoryScope: ['Ẩm thực', 'Giải trí'],
    description: 'Ưu đãi cuối tuần cho QR hoặc đơn online của đối tác tham gia.',
    discountRate: 0.05,
    expiresAt: '2026-09-30T23:59:59+07:00',
    expiresLabel: '30/09/2026',
    maxDiscount: 25_000,
    minAmount: 100_000,
    status: 'available',
    title: 'Giảm 5% cuối tuần',
  },
  {
    id: 'voucher-highlands-only',
    description: 'Chỉ áp dụng tại Highlands Coffee Online.',
    discountRate: 0.12,
    expiresAt: '2026-08-31T23:59:59+07:00',
    expiresLabel: '31/08/2026',
    maxDiscount: 30_000,
    merchantScope: ['Highlands Coffee Online'],
    minAmount: 150_000,
    status: 'available',
    title: 'Ưu đãi Highlands 12%',
  },
  {
    id: 'voucher-expired-demo',
    description: 'Voucher demo đã hết hạn để kiểm tra trạng thái không thể chọn.',
    discountRate: 0.2,
    expiresAt: '2026-01-01T00:00:00+07:00',
    expiresLabel: '01/01/2026',
    maxDiscount: 60_000,
    status: 'expired',
    title: 'Voucher đã hết hạn',
  },
];

const processingChannels: PaymentProcessingChannel[] = [
  {
    id: 'pos',
    label: 'POS/EDC tại quầy',
    description: 'Phần tiền còn lại được POS/EDC của merchant xử lý, app không lưu tài khoản.',
  },
  {
    id: 'qr',
    label: 'QR hóa đơn đối tác',
    description: 'Merchant gửi trạng thái hóa đơn QR về hệ thống Loyalty để đối soát.',
  },
  {
    id: 'ecom',
    label: 'Cổng thanh toán Merchant',
    description: 'Merchant Gateway xử lý phần tiền còn lại theo phiên thanh toán của đối tác.',
  },
];

export class DemoPaymentRepository {
  getInvoiceCatalog() {
    return new PaymentInvoiceCatalog(demoInvoices);
  }

  getVouchers() {
    return demoVouchers;
  }

  getProcessingChannels() {
    return processingChannels;
  }

  getProcessingChannel(invoice: PaymentInvoice, cashAmount: number): PaymentProcessingChannel {
    if (cashAmount === 0) {
      return {
        id: invoice.channel,
        label: 'Trừ điểm/voucher Loyalty',
        description: 'Không còn phần tiền phải trả; hệ thống chỉ xác thực và chốt quyền lợi Loyalty.',
      };
    }

    return (
      processingChannels.find((channel) => channel.id === invoice.channel) ??
      processingChannels[0]!
    );
  }
}
