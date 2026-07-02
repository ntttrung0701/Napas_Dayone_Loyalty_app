export type MainTab = 'home' | 'offers' | 'qr' | 'membership' | 'profile';

export type AppScreen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | MainTab
  | 'notifications'
  | 'offer-detail'
  | 'qr-scanner'
  | 'payment'
  | 'payment-invoice-scanner'
  | 'transfer'
  | 'cards'
  | 'history'
  | 'transaction-detail'
  | 'receipt'
  | 'voucher-wallet'
  | 'voucher-detail'
  | 'voucher-qr'
  | 'membership-tier'
  | 'expiring-points'
  | 'pending-points';
  
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

  iconKey?: string;
  iconUrl?: string;
};

export type PartnerBrandLogo = {
  imageKey?: string;
  imageUrl?: string;
  label: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
};

export type PartnerBrand = {
  id: string;
  name: string;
  featured?: boolean;
  displayOrder?: number;
  searchKeywords?: string[];
  logo: PartnerBrandLogo;
};

export type Offer = {
  id: string;
  category: string;
  title: string;
  partnerBrandId?: string;
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

export type PaymentChannel = 'pos' | 'qr' | 'ecom';

export type PaymentStatus = 'draft' | 'pending' | 'success' | 'failed' | 'cancelled';

export type PaymentReceiptStatus = Extract<PaymentStatus, 'pending' | 'success' | 'failed'>;

export type PaymentProcessingChannel = {
  id: PaymentChannel;
  label: string;
  description: string;
};

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
  status?: PaymentReceiptStatus;
  transactionId?: string;
  occurredAt?: string;
  invoiceCode?: string;
  paymentChannel?: string;
  pointsEarned?: number;
  failureReason?: string;
  voucher?: UserVoucher;
};

export type MembershipTierCode = 'member' | 'silver' | 'gold' | 'platinum';

export type MembershipTierConfig = {
  code: MembershipTierCode;
  label: string;
  minSpend: number;
  maxSpend?: number;
  multiplier: number;
  benefits: string[];
};

export type MembershipMonthlyPoint = {
  month: string;
  earned: number;
  used: number;
};

export type MembershipOverview = {
  customerName: string;
  currentTier: MembershipTierCode;
  nextTier: MembershipTierCode;
  availablePoints: number;
  pendingPoints: number;
  expiringPoints: number;
  expiringLabel: string;
  equivalentVnd: number;
  totalEarnedPoints: number;
  totalUsedPoints: number;
  tierPeriodSpend: number;
  tierTargetSpend: number;
  lastUpdated: string;
  monthlyPoints: MembershipMonthlyPoint[];
};
