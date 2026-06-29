import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { OfferMediaResolver } from './src/features/offers/domain/OfferMediaResolver';
import { MembershipOverviewScreen } from './src/features/membership/MembershipOverviewScreen';
import { ExpiringPointsScreen } from './src/features/membership/ExpiringPointsScreen';

import { AuthFlow } from './src/features/auth/presentation/AuthFlow';
import { CardsScreen } from './src/features/cards/CardsScreen';
import { HistoryScreen } from './src/features/history/HistoryScreen';
import { TransactionFactory } from './src/features/history/domain/TransactionFactory';
import { TransactionDetailScreen } from './src/features/history/TransactionDetailScreen';
import { HomeScreen } from './src/features/home/HomeScreen';
import { NotificationsScreen } from './src/features/notifications/NotificationsScreen';
import { OnboardingScreen } from './src/features/onboarding/OnboardingScreen';
import { OfferDetailScreen } from './src/features/offers/OfferDetailScreen';
import { OffersScreen } from './src/features/offers/OffersScreen';
import { PaymentScreen } from './src/features/payments/PaymentScreen';
import { ReceiptScreen } from './src/features/payments/ReceiptScreen';
import { ProfileScreen } from './src/features/profile/ProfileScreen';
import { QrScreen } from './src/features/qr/QrScreen';
import { SplashScreen } from './src/features/splash/SplashScreen';
import { TransferScreen } from './src/features/transfer/TransferScreen';
import { VoucherFactory } from './src/features/vouchers/domain/VoucherFactory';
import { VoucherDetailScreen } from './src/features/vouchers/VoucherDetailScreen';
import { VoucherQrScreen } from './src/features/vouchers/VoucherQrScreen';
import { VoucherWalletScreen } from './src/features/vouchers/VoucherWalletScreen';
import {
  offers,
  seedNotifications,
  seedTransactions,
  seedUserVouchers,
  seedMembershipOverview,
} from './src/mock/data';
import { NavigationStack } from './src/navigation/NavigationStack';
import { colors } from './src/theme/colors';
import type {
  AppScreen,
  LoyaltyNotification,
  Offer,
  Receipt,
  Transaction,
  UserVoucher,
} from './src/types';

const initialRoute: AppScreen = 'splash';
const maxReadableFontScale = 1.12;

type ScalableComponent = {
  defaultProps?: {
    maxFontSizeMultiplier?: number;
  };
};

function capFontScale(component: ScalableComponent) {
  component.defaultProps = {
    ...component.defaultProps,
    maxFontSizeMultiplier: maxReadableFontScale,
  };
}

capFontScale(Text as ScalableComponent);
capFontScale(TextInput as ScalableComponent);

export default function App() {
  const [navigation, setNavigation] = useState(() => NavigationStack.start(initialRoute));
  const [points, setPoints] = useState(128_450);

  const [selectedOffer, setSelectedOffer] = useState<Offer>(offers[0]!);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const [vouchers, setVouchers] = useState<UserVoucher[]>(seedUserVouchers);
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(
    seedUserVouchers[0] ?? null,
  );

  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>(seedTransactions[0]!);

  const [notifications, setNotifications] =
    useState<LoyaltyNotification[]>(seedNotifications);

  const navigate = (route: AppScreen) => {
    setNavigation((current) => current.push(route));
  };

  const replace = (route: AppScreen) => {
    setNavigation((current) => current.replace(route));
  };

  const goBack = () => {
    setNavigation((current) => current.backPreservingState());
  };

  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

  const openOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    navigate('offer-detail');
  };

  const openTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    navigate('transaction-detail');
  };

  const openVoucher = (voucher: UserVoucher) => {
    setSelectedVoucher(voucher);
    navigate('voucher-detail');
  };

  const openVoucherQr = (voucher: UserVoucher) => {
    setSelectedVoucher(voucher);
    navigate('voucher-qr');
  };

  const markVoucherUsed = (voucherId: string) => {
    const usedAt = new Date().toISOString();

    setVouchers((current) =>
      current.map((voucher) =>
        voucher.id === voucherId ? { ...voucher, status: 'used', usedAt } : voucher,
      ),
    );

    setSelectedVoucher((current) =>
      current?.id === voucherId ? { ...current, status: 'used', usedAt } : current,
    );
  };

  useEffect(() => {
  OfferMediaResolver.preloadMany([
    ...offers.map((offer) => offer.media),
    ...seedUserVouchers.map((voucher) => voucher.media),
  ]).catch(() => undefined);
}, []);

  const markNotificationRead = (notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  const completeRedemption = (offer: Offer) => {
    const receiptId = `NPS-RD-${Date.now().toString().slice(-6)}`;
    const nextVoucher = VoucherFactory.fromOffer(offer, receiptId);

    const nextReceipt: Receipt = {
      id: receiptId,
      kind: 'redemption',
      merchant: offer.partner,
      title: offer.title,
      originalAmount: 0,
      voucherDiscount: 0,
      pointsUsed: offer.points,
      cashAmount: 0,
      createdAt: 'Hôm nay, 09:41',
      voucher: nextVoucher,
    };

    setPoints((current) => current - offer.points);
    setReceipt(nextReceipt);
    setSelectedVoucher(nextVoucher);
    setVouchers((current) => [nextVoucher, ...current]);

    setTransactions((current) => [
      TransactionFactory.fromReceipt(nextReceipt, {
        title: `Đổi ${offer.title}`,
        subtitle: offer.partner,
        kind: 'redemption',
        points: -offer.points,
        source: offer.partner,
      }),
      ...current,
    ]);

    navigate('receipt');
  };

  const completePayment = (nextReceipt: Receipt) => {
    setPoints((current) => current - nextReceipt.pointsUsed);
    setReceipt(nextReceipt);

    setTransactions((current) => [
      TransactionFactory.fromReceipt(nextReceipt, {
        title: `Thanh toán ${nextReceipt.merchant}`,
        subtitle: 'Thanh toán hỗn hợp',
        kind: 'payment',
        points: -nextReceipt.pointsUsed,
        source: nextReceipt.merchant,
      }),
      ...current,
    ]);

    navigate('receipt');
  };

  const completeTransfer = (amount: number, recipient: string) => {
    const nextReceipt: Receipt = {
      id: `NPS-TR-${Date.now().toString().slice(-6)}`,
      kind: 'transfer',
      merchant: recipient,
      title: `Tặng điểm cho ${recipient}`,
      originalAmount: 0,
      voucherDiscount: 0,
      pointsUsed: amount,
      cashAmount: 0,
      createdAt: 'Hôm nay, 09:41',
    };

    setPoints((current) => current - amount);
    setReceipt(nextReceipt);

    setTransactions((current) => [
      TransactionFactory.fromReceipt(nextReceipt, {
        title: nextReceipt.title,
        subtitle: 'Chuyển điểm bạn bè',
        kind: 'transfer',
        points: -amount,
        source: recipient,
      }),
      ...current,
    ]);

    navigate('receipt');
  };

  const expiringPointItems = [
  {
    id: 'EXP-001',
    date: '31/10/2026',
    daysText: 'Hết hạn trong 5 ngày',
    points: 1_500,
  },
  {
    id: 'EXP-002',
    date: '15/11/2026',
    daysText: 'Hết hạn trong 20 ngày',
    points: 2_500,
  },
  {
    id: 'EXP-003',
    date: '30/11/2026',
    daysText: 'Hết hạn trong 35 ngày',
    points: 4_000,
  },
];

  const renderScreen = (route: AppScreen) => {
    switch (route) {
      case 'splash':
        return <SplashScreen onFinished={() => replace('onboarding')} />;

      case 'onboarding':
        return <OnboardingScreen onContinue={() => replace('login')} />;

      case 'login':
        return <AuthFlow onAuthenticated={() => replace('home')} />;

      case 'offers':
  return (
    <OffersScreen
      activeTab="offers"
      points={points}
      unreadNotifications={notifications.filter((notification) => !notification.isRead).length}
      onNavigate={navigate}
      onSelectOffer={openOffer}
    />
  );

      case 'offer-detail':
        return (
          <OfferDetailScreen
            offer={selectedOffer}
            points={points}
            onBack={goBack}
            onRedeem={completeRedemption}
          />
        );

      case 'payment':
        return <PaymentScreen points={points} onBack={goBack} onComplete={completePayment} />;

      case 'qr':
        return (
          <QrScreen
            activeTab="qr"
            points={points}
            onNavigate={navigate}
          />
        );

      case 'transfer':
        return (
          <TransferScreen
            points={points}
            onBack={goBack}
            onComplete={completeTransfer}
          />
        );

      case 'cards':
        return <CardsScreen onBack={goBack} />;

      case 'history':
        return (
          <HistoryScreen
            transactions={transactions}
            onBack={goBack}
            onNavigate={navigate}
            onSelectTransaction={openTransaction}
          />
        );

      case 'receipt':
  return (
    <ReceiptScreen
      receipt={receipt}
      onHome={() => setNavigation((current) => current.reset('home'))}
      onViewVoucherWallet={() =>
        setNavigation(NavigationStack.path(['home', 'voucher-wallet']))
      }
    />
  );

      case 'voucher-wallet':
        return (
          <VoucherWalletScreen
            activeTab="offers"
            vouchers={vouchers}
            onBack={goBack}
            onNavigate={navigate}
            onSelectVoucher={openVoucher}
          />
        );

      case 'voucher-detail':
        return (
          <VoucherDetailScreen
            voucher={selectedVoucher}
            onBack={goBack}
            onUseVoucher={openVoucherQr}
          />
        );

      case 'voucher-qr':
        return (
          <VoucherQrScreen
            voucher={selectedVoucher}
            onBack={goBack}
            onMarkUsed={markVoucherUsed}
          />
        );

      case 'membership':
  return (
    <MembershipOverviewScreen
      activeTab="membership"
      overview={{
        ...seedMembershipOverview,
        availablePoints: points,
      }}
      initialFocus="top"
      unreadNotifications={unreadNotifications}
      onNavigate={navigate}
    />
  );

case 'membership-tier':
  return (
    <MembershipOverviewScreen
      activeTab="membership"
      overview={{
        ...seedMembershipOverview,
        availablePoints: points,
      }}
      initialFocus="tier"
      unreadNotifications={unreadNotifications}
      onNavigate={navigate}
    />
  );
  
  case 'expiring-points':
  return (
    <ExpiringPointsScreen
      totalExpiringPoints={8_000}
      expiringItems={expiringPointItems}
      recommendedOffers={offers}
      onBack={goBack}
      onNavigate={navigate}
      onSelectOffer={openOffer}
    />
  );
      case 'notifications':
        return (
          <NotificationsScreen
            notifications={notifications}
            transactions={transactions}
            onBack={goBack}
            onMarkAllRead={markAllNotificationsRead}
            onMarkRead={markNotificationRead}
            onNavigate={navigate}
            onSelectTransaction={openTransaction}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            activeTab="profile"
            points={points}
            unreadNotifications={unreadNotifications}
            onLogout={() => setNavigation((current) => current.reset('login'))}
            onNavigate={navigate}
          />
        );

      case 'transaction-detail':
        return (
          <TransactionDetailScreen
            currentPoints={points}
            transaction={selectedTransaction}
            transactions={transactions}
            onBack={goBack}
          />
        );

      case 'home':
      default:
        return (
          <HomeScreen
  points={points}
  transactions={transactions}
  offers={offers}
  unreadNotifications={unreadNotifications}
  onNavigate={navigate}
  onSelectTransaction={openTransaction}
  onSelectOffer={openOffer}
/>
        );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <StatusBar style="dark" />

        <View style={styles.screenStack}>
          {navigation.items.map((entry, index) => {
            const active = index === navigation.items.length - 1;

            return (
              <View
                key={entry.instanceKey}
                pointerEvents={active ? 'auto' : 'none'}
                style={[styles.screen, !active && { display: 'none' }]}
              >
                {renderScreen(entry.screen)}
              </View>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenStack: {
    flex: 1,
    position: 'relative',
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
});
