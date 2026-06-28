import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { getScreenBottomPadding } from '../../shared/layout';
import { colors } from '../../theme/colors';
import type { Receipt, UserVoucher } from '../../types';
import { formatCurrency, formatPoints } from '../../utils/format';

type ReceiptScreenProps = {
  receipt: Receipt | null;
  onHome: () => void;
  onViewVoucherWallet: () => void;
};

type VoucherQrPayload = {
  type: 'LOYALTY_VOUCHER';
  voucherId: string;
  code: string;
  expiresAt: string;
};

function createVoucherQrPayload(voucher: UserVoucher): VoucherQrPayload {
  return {
    type: 'LOYALTY_VOUCHER',
    voucherId: voucher.id,
    code: voucher.code,
    expiresAt: voucher.expiresAt,
  };
}

function isVoucherExpired(voucher: UserVoucher) {
  return Date.now() > Date.parse(voucher.expiresAt);
}

function getVoucherStatusLabel(voucher: UserVoucher) {
  if (voucher.status === 'used') return 'Đã sử dụng';
  if (voucher.status === 'expired' || isVoucherExpired(voucher)) return 'Đã hết hạn';
  return 'Còn hiệu lực';
}

export function ReceiptScreen({
  receipt,
  onHome,
  onViewVoucherWallet,
}: ReceiptScreenProps) {
  const insets = useSafeAreaInsets();
  const isPayment = receipt?.kind === 'payment';
  const voucher = receipt?.kind === 'redemption' ? receipt.voucher : undefined;
  const voucherQrValue = useMemo(
    () => (voucher ? JSON.stringify(createVoucherQrPayload(voucher)) : ''),
    [voucher],
  );

  if (!receipt) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Chưa có biên lai</Text>
        <PrimaryButton label="Về trang chủ" onPress={onHome} />
      </View>
    );
  }

const voucherUnavailable = voucher ? voucher.status !== 'active' || isVoucherExpired(voucher) : false;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.root,
        { paddingBottom: getScreenBottomPadding(insets.bottom, 24) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.successIcon}>
        <Ionicons color={colors.white} name="checkmark" size={40} />
      </View>
      <Text style={styles.successTitle}>
        {isPayment
          ? 'Thanh toán thành công'
          : receipt.kind === 'transfer'
            ? 'Tặng điểm thành công'
            : 'Đổi ưu đãi thành công'}
      </Text>
      <Text style={styles.successSubtitle}>{receipt.createdAt}</Text>
      
      {voucher ? (
  <View style={styles.voucherQrCard}>
    <Text style={styles.voucherEyebrow}>VOUCHER ĐÃ ĐỔI</Text>
    <Text style={styles.voucherTitle}>{voucher.title}</Text>
    <Text style={styles.voucherPartner}>{voucher.partner}</Text>

    <View style={[styles.qrFrame, voucherUnavailable && styles.qrFrameExpired]}>
      <View style={styles.qrInner}>
        <View style={voucherUnavailable && styles.qrExpired}>
          <QRCode
            backgroundColor={colors.white}
            color={colors.primaryDark}
            size={176}
            value={voucherQrValue}
          />
        </View>

        {voucherUnavailable ? (
          <View style={styles.expiredBadge}>
            <Ionicons color={colors.white} name="alert-circle-outline" size={15} />
            <Text style={styles.expiredBadgeText}>{getVoucherStatusLabel(voucher)}</Text>
          </View>
        ) : null}
      </View>
    </View>

    <Text style={[styles.voucherStatus, voucherUnavailable && styles.voucherStatusExpired]}>
      {voucherUnavailable
        ? `Voucher ${getVoucherStatusLabel(voucher).toLowerCase()}`
        : `Hiệu lực đến : ${voucher.expiresLabel}`}
    </Text>

    <Text style={styles.voucherHelper}>
      Quét mã QR này để sử dụng ưu đãu của voucher.
    </Text>
  </View>
) : null}


      <View style={styles.receiptCard}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>Thông tin ưu đãi</Text>
        </View>

        <View style={styles.dashed} />
        <ReceiptRow label="Đơn vị" value={receipt.merchant} />
        <ReceiptRow label="Nội dung" value={receipt.title} />
        <ReceiptRow label="Mã giao dịch" value={receipt.id} />

        {voucher ? (
  <>
    <ReceiptRow label="Mã voucher" value={voucher.code} />
    <ReceiptRow label="Trạng thái voucher" value={getVoucherStatusLabel(voucher)} />
    <ReceiptRow label="Hạn sử dụng" value={voucher.expiresLabel} />
  </>
) : null}

        {isPayment ? (
          <>
            <View style={styles.dashed} />
            <ReceiptRow label="Hóa đơn" value={formatCurrency(receipt.originalAmount)} />
            <ReceiptRow label="Voucher" value={`-${formatCurrency(receipt.voucherDiscount)}`} />
            <ReceiptRow label="Điểm đã dùng" value={`${formatPoints(receipt.pointsUsed)} pts`} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>ĐÃ THANH TOÁN</Text>
              <Text style={styles.totalValue}>{formatCurrency(receipt.cashAmount)}</Text>
            </View>
          </>
        ) : (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ĐIỂM ĐÃ DÙNG</Text>
            <Text style={styles.totalValue}>{formatPoints(receipt.pointsUsed)} pts</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
  <PrimaryButton label="Về trang chủ" onPress={onHome} />

  <View style={styles.actionSpacer} />

  <PrimaryButton
    label="Xem kho voucher"
    onPress={onViewVoucherWallet}
    variant="secondary"
  />
</View>
    </ScrollView>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 22,
    paddingTop: 48,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  emptyTitle: {
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  successIcon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
  },
  successSubtitle: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
  },
  receiptCard: {
    width: '100%',
    marginTop: 26,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  dashed: {
    height: 1,
    marginVertical: 18,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  rowValue: {
    maxWidth: '62%',
    textAlign: 'right',
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    padding: 14,
  },
  totalLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  totalValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  actions: {
    width: '100%',
    marginTop: 20,
  },
  actionSpacer: {
    height: 10,
  },
  voucherQrCard: {
  width: '100%',
  alignItems: 'center',
  marginTop: 26,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 22,
  backgroundColor: colors.surface,
  padding: 20,
},
voucherEyebrow: {
  color: colors.primary,
  fontSize: 10,
  fontWeight: '900',
},
voucherTitle: {
  marginTop: 10,
  textAlign: 'center',
  color: colors.text,
  fontSize: 23,
  fontWeight: '900',
  lineHeight: 29,
},
voucherPartner: {
  marginTop: 6,
  color: colors.textMuted,
  fontSize: 13,
  fontWeight: '800',
},
qrFrame: {
  width: 236,
  height: 236,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 24,
  borderRadius: 28,
  backgroundColor: colors.primarySoft,
},
qrFrameExpired: {
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
voucherStatus: {
  marginTop: 18,
  color: colors.success,
  fontSize: 13,
  fontWeight: '900',
},
voucherStatusExpired: {
  color: colors.warning,
},
voucherHelper: {
  maxWidth: 290,
  marginTop: 14,
  textAlign: 'center',
  color: colors.textMuted,
  fontSize: 12,
  lineHeight: 18,
},
});
