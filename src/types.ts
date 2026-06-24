export type MainTab = 'home' | 'offers' | 'qr' | 'notifications' | 'profile';

export type AppScreen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | MainTab
  | 'offer-detail'
  | 'payment'
  | 'transfer'
  | 'cards'
  | 'history'
  | 'transaction-detail'
  | 'receipt'
  | 'voucher-wallet'
  | 'voucher-detail'
  | 'voucher-qr';

export type NotificationCategory = 'transaction' | 'offer' | 'system';

export type LoyaltyNotification = {
  id: string;
  title: string;
  message: string;
  date: string;
  occurredAt: string;
  category: NotificationCategory;
  isRead: boolean;
};

export type OfferMedia = {
  imageKey?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  heroUrl?: string;
};

export type Offer = {
  id: string;
  category: string;
  title: string;
  partner: string;
  description: string;
  points: number;
  accent: string;
  expiresAt: string;
  media?: OfferMedia;
};
export type UserVoucherStatus = 'active' | 'used' | 'expired';

export type UserVoucher = {
  id: string;
  offerId: string;
  title: string;
  partner: string;
  code: string;
  status: UserVoucherStatus;
  issuedAt: string;
  expiresAt: string;
  expiresLabel: string;
  description: string;
  terms: string[];
  pointsUsed: number;
  transactionId: string;
  media?: OfferMedia;
  usedAt?: string;
};

export type TransactionKind = 'earn' | 'redemption' | 'transfer' | 'expiration' | 'payment';

export type TransactionStatus = 'success' | 'pending' | 'expired' | 'failed';

export type TransactionTimelineStep = {
  id: string;
  time: string;
  title: string;
  description: string;
};

export type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  occurredAt: string;
  points: number;
  kind: TransactionKind;
  status: TransactionStatus;
  source: string;
  amount: number;
  pointRule: string;
  timeline: TransactionTimelineStep[];
};

export type Receipt = {
  id: string;
  kind: 'payment' | 'redemption' | 'transfer';
  merchant: string;
  title: string;
  originalAmount: number;
  voucherDiscount: number;
  pointsUsed: number;
  cashAmount: number;
  createdAt: string;
  voucher?: UserVoucher;
};
