import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { UserVoucher } from '../../types';

type VoucherQrScreenProps = {
  voucher: UserVoucher | null;
  onBack: () => void;
};

type VoucherQrPayload = {
  type: 'LOYALTY_VOUCHER';
  voucherId: string;
  code: string;
  expiresAt: string;
};

const QR_VALIDITY_SECONDS = 120;

function createVoucherQrPayload(voucher: UserVoucher): VoucherQrPayload {
  const expiresAt = new Date(Date.now() + QR_VALIDITY_SECONDS * 1000);

  return {
    type: 'LOYALTY_VOUCHER',
    voucherId: voucher.id,
    code: voucher.code,
    expiresAt: expiresAt.toISOString(),
  };
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function VoucherQrScreen({ voucher, onBack }: VoucherQrScreenProps) {
  const [payload, setPayload] = useState<VoucherQrPayload | null>(() =>
    voucher ? createVoucherQrPayload(voucher) : null,
  );
  const [remainingSeconds, setRemainingSeconds] = useState(QR_VALIDITY_SECONDS);

  useEffect(() => {
    if (!voucher) return;

    setPayload(createVoucherQrPayload(voucher));
    setRemainingSeconds(QR_VALIDITY_SECONDS);
  }, [voucher]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isExpired = remainingSeconds <= 0;
  const qrValue = useMemo(() => (payload ? JSON.stringify(payload) : ''), [payload]);

  function refreshQr() {
    if (!voucher) return;

    setPayload(createVoucherQrPayload(voucher));
    setRemainingSeconds(QR_VALIDITY_SECONDS);
  }

  if (!voucher || !payload) {
    return (
      <View style={styles.root}>
        <ScreenHeader onBack={onBack} title="Mã QR voucher" />

        <View style={styles.emptyState}>
          <Ionicons color={colors.textMuted} name="ticket-outline" size={44} />
          <Text style={styles.emptyTitle}>Chưa có voucher</Text>
          <Text style={styles.emptyText}>
            Vui lòng đổi ưu đãi thành công trước khi hiển thị mã QR voucher.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Mã QR voucher" />

      <View style={styles.content}>
        <View style={styles.voucherCard}>
          <Text style={styles.eyebrow}>VOUCHER ĐÃ ĐỔI</Text>
          <Text style={styles.title}>{voucher.title}</Text>
          <Text style={styles.partner}>{voucher.partner}</Text>

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
              ? 'Mã QR voucher đã hết hạn'
              : `Mã còn hiệu lực ${formatCountdown(remainingSeconds)}`}
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Mã voucher</Text>
            <Text style={styles.codeValue}>{voucher.code}</Text>
          </View>

          <Text style={styles.helperText}>
            Đưa mã QR này cho thu ngân/POS quét để áp dụng voucher. Nếu không quét được, vui lòng
            cung cấp mã voucher bên trên.
          </Text>

          <View style={styles.securityNotice}>
            <Ionicons color={colors.warning} name="shield-checkmark-outline" size={16} />
            <Text style={styles.securityText}>
              Mã QR chỉ chứa voucherId, code và thời hạn hiệu lực tạm thời. Không chứa số điện thoại,
              email, họ tên, số thẻ hoặc token đăng nhập.
            </Text>
          </View>

          <Pressable onPress={refreshQr} style={styles.refreshButton}>
            <Ionicons color={colors.primary} name="refresh-outline" size={17} />
            <Text style={styles.refreshText}>TẠO MÃ MỚI</Text>
          </Pressable>
        </View>
      </View>
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
    padding: 20,
  },
  voucherCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 20,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  partner: {
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
    marginTop: 22,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
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
    marginTop: 15,
    color: colors.success,
    fontSize: 12,
    fontWeight: '900',
  },
  timerExpired: {
    color: colors.warning,
  },
  codeBox: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    padding: 14,
  },
  codeLabel: {
    color: '#BDD2E2',
    fontSize: 10,
    fontWeight: '700',
  },
  codeValue: {
    marginTop: 5,
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  helperText: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
  },
  securityNotice: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: colors.warningSoft,
    padding: 12,
  },
  securityText: {
    flex: 1,
    marginLeft: 8,
    color: colors.warning,
    fontSize: 10,
    lineHeight: 15,
  },
  refreshButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 14,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    maxWidth: 280,
    marginTop: 8,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});