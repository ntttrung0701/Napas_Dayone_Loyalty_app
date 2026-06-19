import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { BrandLogo } from '../../shared/components/BrandLogo';
import { colors } from '../../theme/colors';
import type { Receipt } from '../../types';
import { formatCurrency, formatPoints } from '../../utils/format';

type ReceiptScreenProps = {
  receipt: Receipt | null;
  onHome: () => void;
  onViewHistory: () => void;
};

export function ReceiptScreen({ receipt, onHome, onViewHistory }: ReceiptScreenProps) {
  if (!receipt) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Chưa có biên lai</Text>
        <PrimaryButton label="Về trang chủ" onPress={onHome} />
      </View>
    );
  }

  const isPayment = receipt.kind === 'payment';

  return (
    <ScrollView contentContainerStyle={styles.root} showsVerticalScrollIndicator={false}>
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

      <View style={styles.receiptCard}>
        <View style={styles.brandRow}>
          <BrandLogo width={108} />
          <Text style={styles.brand}>DayOne</Text>
        </View>

        <View style={styles.dashed} />
        <ReceiptRow label="Đơn vị" value={receipt.merchant} />
        <ReceiptRow label="Nội dung" value={receipt.title} />
        <ReceiptRow label="Mã giao dịch" value={receipt.id} />

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

      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Đây là biên lai giả lập trên thiết bị. Không có giao dịch tài chính thật phát sinh.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Về trang chủ" onPress={onHome} />
        <View style={styles.actionSpacer} />
        <PrimaryButton label="Xem lịch sử" onPress={onViewHistory} variant="secondary" />
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
    marginLeft: 8,
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
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
  notice: {
    width: '100%',
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: colors.warningSoft,
    padding: 13,
  },
  noticeText: {
    textAlign: 'center',
    color: colors.warning,
    fontSize: 10,
    lineHeight: 15,
  },
  actions: {
    width: '100%',
    marginTop: 20,
  },
  actionSpacer: {
    height: 10,
  },
});
