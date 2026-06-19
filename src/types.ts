export type MainTab = 'home' | 'offers' | 'qr' | 'history' | 'profile';

export type AppScreen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | MainTab
  | 'offer-detail'
  | 'payment'
  | 'transfer'
  | 'cards'
  | 'receipt';

export type Offer = {
  id: string;
  category: string;
  title: string;
  partner: string;
  description: string;
  points: number;
  accent: string;
  expiresAt: string;
};

export type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  points: number;
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
};
