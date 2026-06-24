import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { BottomNav } from '../../shared/components/BottomNav';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab } from '../../types';
import { formatPoints } from '../../utils/format';

type QrScreenProps = {
  activeTab: MainTab;
  points: number;
  onNavigate: (screen: AppScreen) => void;
};

type MemberQrPayload = {
  type: 'LOYALTY_MEMBER';
  loyaltyId: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
};

const QR_VALIDITY_SECONDS = 120;
const LOYALTY_ID = 'NPS-5829';

function createNonce() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function createMemberQrPayload(loyaltyId: string): MemberQrPayload {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + QR_VALIDITY_SECONDS * 1000);

  return {
    type: 'LOYALTY_MEMBER',
    loyaltyId,
    nonce: createNonce(),
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function QrScreen({ activeTab, points, onNavigate }: QrScreenProps) {
  const [payload, setPayload] = useState<MemberQrPayload>(() => createMemberQrPayload(LOYALTY_ID));
  const [remainingSeconds, setRemainingSeconds] = useState(QR_VALIDITY_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isExpired = remainingSeconds <= 0;

  const qrValue = useMemo(() => JSON.stringify(payload), [payload]);

  function handleRefreshQr() {
    setPayload(createMemberQrPayload(LOYALTY_ID));
    setRemainingSeconds(QR_VALIDITY_SECONDS);
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Mã QR thành viên" />

      <View style={styles.content}>
        <Text style={styles.eyebrow}>THẺ THÀNH VIÊN LOYALTY</Text>
        <Text style={styles.name}>NGUYỄN VAN ANH</Text>
        <Text style={styles.loyaltyId}>Loyalty ID: {LOYALTY_ID}</Text>

        <View style={[styles.qrCard, isExpired && styles.qrCardExpired]}>
          <View style={styles.qrInner}>
            <View style={isExpired && styles.qrExpired}>
              <QRCode
                backgroundColor={colors.white}
                color={colors.primaryDark}
                size={176}
                value={qrValue}
              />
            </View>

            {isExpired ? (
              <View style={styles.expiredBadge}>
                <Ionicons color={colors.white} name="time-outline" size={15} />
                <Text style={styles.expiredBadgeText}>Đã hết hạn</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={[styles.timer, isExpired && styles.timerExpired]}>
          {isExpired
            ? 'Mã QR đã hết hạn'
            : `Mã còn hiệu lực ${formatCountdown(remainingSeconds)}`}
        </Text>

        <Text style={styles.fallbackText}>
          Nếu không quét được mã, vui lòng cung cấp Loyalty ID cho thu ngân.
        </Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
          <Text style={styles.balance}>{formatPoints(points)} điểm</Text>
        </View>

        <Pressable onPress={handleRefreshQr} style={styles.refreshButton}>
          <Ionicons color={colors.primary} name="refresh-outline" size={17} />
          <Text style={styles.refreshText}>TẠO MÃ MỚI</Text>
        </Pressable>
      </View>

      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  name: {
    marginTop: 8,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  loyaltyId: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  qrCard: {
    width: 236,
    height: 236,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    borderRadius: 24,
    backgroundColor: colors.surface,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  qrCardExpired: {
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft,
  },
  qrInner: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 8,
  },
  qrExpired: {
    opacity: 0.28,
  },
  expiredBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  expiredBadgeText: {
    marginLeft: 5,
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  timer: {
    marginTop: 16,
    color: colors.success,
    fontSize: 12,
    fontWeight: '900',
  },
  timerExpired: {
    color: colors.warning,
  },
  fallbackText: {
    maxWidth: 280,
    marginTop: 8,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  balanceCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    padding: 16,
  },
  balanceLabel: {
    color: '#BDD2E2',
    fontSize: 11,
  },
  balance: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
  },
  refreshButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  refreshText: {
    marginLeft: 7,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
});