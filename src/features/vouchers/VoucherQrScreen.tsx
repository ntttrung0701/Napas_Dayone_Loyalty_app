import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { UserVoucher } from '../../types';
import { VoucherFactory } from './domain/VoucherFactory';

type VoucherQrScreenProps = {
  voucher: UserVoucher | null;
  onBack: () => void;
  onMarkUsed: (voucherId: string) => void;
};

export function VoucherQrScreen({ voucher, onBack, onMarkUsed }: VoucherQrScreenProps) {
  const qrValue = useMemo(
    () => (voucher ? JSON.stringify(VoucherFactory.createQrPayload(voucher)) : ''),
    [voucher],
  );

  if (!voucher) {
    return (
      <View style={styles.root}>
        <ScreenHeader onBack={onBack} title="Mã QR voucher" />

        <View style={styles.emptyState}>
          <Ionicons color={colors.textMuted} name="ticket-outline" size={44} />
          <Text style={styles.emptyTitle}>Không tìm thấy voucher</Text>
        </View>
      </View>
    );
  }

  const canUse = VoucherFactory.canUse(voucher);
  const statusLabel = VoucherFactory.getStatusLabel(voucher);

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Mã QR voucher" />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>SỬ DỤNG VOUCHER</Text>
          <Text style={styles.title}>{voucher.title}</Text>
          <Text style={styles.partner}>{voucher.partner}</Text>

          <View style={[styles.qrFrame, !canUse && styles.qrFrameDisabled]}>
            <View style={styles.qrInner}>
              <View style={!canUse && styles.qrDisabled}>
                <QRCode
                  backgroundColor={colors.white}
                  color={colors.primaryDark}
                  size={176}
                  value={qrValue}
                />
              </View>

              {!canUse ? (
                <View style={styles.statusOverlay}>
                  <Ionicons color={colors.white} name="alert-circle-outline" size={15} />
                  <Text style={styles.statusOverlayText}>{statusLabel}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text style={[styles.statusText, !canUse && styles.statusTextWarning]}>
            {VoucherFactory.getStatusDescription(voucher)}
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Mã voucher</Text>
            <Text style={styles.codeValue}>{voucher.code}</Text>
          </View>

          <Text style={styles.helperText}>
            Đưa mã QR này cho thu ngân/POS quét để áp dụng voucher. Nếu không quét được, cung cấp
            mã voucher để nhập thủ công.
          </Text>

          {canUse ? (
            <Pressable onPress={() => onMarkUsed(voucher.id)} style={styles.usedButton}>
              <Ionicons color={colors.success} name="checkmark-circle-outline" size={17} />
              <Text style={styles.usedText}>Đánh dấu đã sử dụng</Text>
            </Pressable>
          ) : null}
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
  card: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 20,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
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
  qrFrame: {
    width: 236,
    height: 236,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
  },
  qrFrameDisabled: {
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
  qrDisabled: {
    opacity: 0.25,
  },
  statusOverlay: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusOverlayText: {
    marginLeft: 5,
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  statusText: {
    marginTop: 15,
    textAlign: 'center',
    color: colors.success,
    fontSize: 12,
    fontWeight: '900',
  },
  statusTextWarning: {
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
  usedButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 14,
    flexDirection: 'row',
    paddingHorizontal: 22,
  },
  usedText: {
    marginLeft: 7,
    color: colors.success,
    fontSize: 11,
    fontWeight: '900',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
});