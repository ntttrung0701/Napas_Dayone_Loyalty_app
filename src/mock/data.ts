import type { Offer, Transaction } from '../types';

export const offers: Offer[] = [
  {
    id: 'highlands-50',
    category: 'Ẩm thực',
    title: 'Highlands Coffee 50K',
    partner: 'Highlands Coffee',
    description: 'Áp dụng cho mọi loại đồ uống tại hệ thống Highlands Coffee toàn quốc.',
    points: 500,
    accent: '#C2410C',
    expiresAt: '30 ngày kể từ lúc đổi',
  },
  {
    id: 'winmart-10',
    category: 'Mua sắm',
    title: 'Hoàn 10% tại WinMart',
    partner: 'WinMart',
    description: 'Giảm trực tiếp 10%, tối đa 50.000đ cho hóa đơn từ 300.000đ.',
    points: 1_200,
    accent: '#D71920',
    expiresAt: '31/12/2026',
  },
  {
    id: 'travel-100',
    category: 'Du lịch',
    title: 'Voucher di chuyển 100K',
    partner: 'Napas Travel',
    description: 'Ưu đãi cho một chuyến đi nội thành thanh toán bằng thẻ liên kết.',
    points: 2_500,
    accent: '#0369A1',
    expiresAt: '30/09/2026',
  },
];

export const seedTransactions: Transaction[] = [
  {
    id: 'TX-2401',
    title: 'Thanh toán Lotte Mart',
    subtitle: 'Hoàn điểm mua sắm',
    date: '24/10/2026, 10:30',
    points: 500,
  },
  {
    id: 'TX-2201',
    title: 'Đổi Voucher Highlands 50K',
    subtitle: 'Đổi đặc quyền',
    date: '22/10/2026, 09:15',
    points: -2_000,
  },
  {
    id: 'TX-1901',
    title: 'Thanh toán Grab',
    subtitle: 'Hoàn điểm di chuyển',
    date: '19/10/2026, 19:42',
    points: 120,
  },
];
