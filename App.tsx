import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar as NativeStatusBar,
  StyleSheet,
} from 'react-native';

import { AuthFlow } from './src/features/auth/AuthFlow';
import { CardsScreen } from './src/features/cards/CardsScreen';
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
import { offers, seedNotifications, seedTransactions } from './src/mock/data';
import { colors } from './src/theme/colors';
import type {
  AppScreen,
  LoyaltyNotification,
  Offer,
  Receipt,
  Transaction,
} from './src/types';

const initialRoute: AppScreen = 'splash';

export default function App() {
  const [routes, setRoutes] = useState<AppScreen[]>([initialRoute]);
  const [points, setPoints] = useState(128_450);
  const [selectedOffer, setSelectedOffer] = useState<Offer>(offers[0]!);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [notifications, setNotifications] =
    useState<LoyaltyNotification[]>(seedNotifications);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>(seedTransactions[0]!);

  const currentRoute = routes[routes.length - 1] ?? initialRoute;
  const navigate = (route: AppScreen) => setRoutes((current) => [...current, route]);
  const replace = (route: AppScreen) =>
    setRoutes((current) => [...current.slice(0, -1), route]);
  const goBack = () =>
    setRoutes((current) => (current.length > 1 ? current.slice(0, -1) : current));

  const openOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    navigate('offer-detail');
  };

  const openTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    navigate('transaction-detail');
  };

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
    const nextReceipt: Receipt = {
      id: `NPS-RD-${Date.now().toString().slice(-6)}`,
      kind: 'redemption',
      merchant: offer.partner,
      title: offer.title,
      originalAmount: 0,
      voucherDiscount: 0,
      pointsUsed: offer.points,
      cashAmount: 0,
      createdAt: 'Hôm nay, 09:41',
    };

    setPoints((current) => current - offer.points);
    setReceipt(nextReceipt);
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

  const renderScreen = () => {
    switch (currentRoute) {
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
            onNavigate={navigate}
            onSelectOffer={openOffer}
            points={points}
            unreadNotifications={notifications.filter((notification) => !notification.isRead).length}
          />
        );
      case 'offer-detail':
        return (
          <OfferDetailScreen
            offer={selectedOffer}
            onBack={goBack}
            onRedeem={completeRedemption}
            points={points}
          />
        );
      case 'payment':
        return (
          <PaymentScreen
            onBack={goBack}
            onComplete={completePayment}
            points={points}
          />
        );
      case 'qr':
        return (
          <QrScreen
            activeTab="qr"
            onBack={goBack}
            onNavigate={navigate}
            points={points}
          />
        );
      case 'transfer':
        return (
          <TransferScreen
            onBack={goBack}
            onComplete={completeTransfer}
            points={points}
          />
        );
      case 'cards':
        return <CardsScreen onBack={goBack} />;
      case 'receipt':
        return (
          <ReceiptScreen
            receipt={receipt}
            onHome={() => setRoutes(['home'])}
            onViewHistory={() => setRoutes(['home', 'notifications'])}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            notifications={notifications}
            onBack={goBack}
            onMarkAllRead={markAllNotificationsRead}
            onMarkRead={markNotificationRead}
            onNavigate={navigate}
            onSelectTransaction={openTransaction}
            transactions={transactions}
          />
        );
      case 'transaction-detail':
        return <TransactionDetailScreen onBack={goBack} transaction={selectedTransaction} />;
      case 'profile':
        return (
          <ProfileScreen
            activeTab="profile"
            onBack={goBack}
            onLogout={() => setRoutes(['login'])}
            onNavigate={navigate}
            points={points}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen
            onNavigate={navigate}
            onSelectTransaction={openTransaction}
            points={points}
            transactions={transactions}
            unreadNotifications={notifications.filter((notification) => !notification.isRead).length}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 24 : 0,
    backgroundColor: colors.background,
  },
});
