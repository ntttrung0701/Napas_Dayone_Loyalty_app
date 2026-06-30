import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { PaymentProcessingChannel } from '../../../types';
import { formatCurrency, formatPoints } from '../../../utils/format';
import type { PaymentBenefitDraft, PaymentInvoice } from '../domain/PaymentModels';

type PaymentSummaryCardProps = {
  benefit: PaymentBenefitDraft;
  invoice: PaymentInvoice;
  processingChannel: PaymentProcessingChannel;
};

export function PaymentSummaryCard({
  benefit,
  invoice,
  processingChannel,
}: PaymentSummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Tóm tắt thanh toán</Text>
      <SummaryRow label="Kênh xử lý" value={processingChannel.label} valueColor="#B8D4E8" />
      <SummaryRow label="Tổng hóa đơn" value={formatCurrency(invoice.amount)} />
      <SummaryRow
        label="Voucher / mã giảm giá"
        value={`-${formatCurrency(benefit.voucherDiscount)}`}
        valueColor={colors.success}
      />
      <SummaryRow
        label={`Điểm Loyalty (${formatPoints(benefit.pointsUsed)} pts)`}
        value={`-${formatCurrency(benefit.pointDiscount)}`}
        valueColor="#9FD4FF"
      />
      <SummaryRow
        label="Tỷ lệ quy đổi"
        value={`1 điểm = ${formatCurrency(benefit.conversionRate)}`}
        valueColor="#B8D4E8"
      />
      <View style={styles.totalDivider} />
      <SummaryRow bold label="Tiền còn lại" value={formatCurrency(benefit.cashAmount)} />
      <View style={styles.earnRow}>
        <Ionicons color="#A7F3D0" name="add-circle-outline" size={17} />
        <Text style={styles.earnText}>
          Dự kiến cộng {formatPoints(benefit.expectedEarnPoints)} điểm sau khi giao dịch hoàn tất.
        </Text>
      </View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  valueColor = colors.white,
  bold = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryBold, { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: { marginBottom: 14, borderRadius: 22, backgroundColor: colors.primaryDark, padding: 18 },
  summaryTitle: {
    marginBottom: 14,
    color: '#B8D4E8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  summaryLabel: { maxWidth: '65%', color: '#D7E5EF', fontSize: 11 },
  summaryValue: { color: colors.white, fontSize: 12, fontWeight: '800' },
  summaryBold: { color: colors.white, fontSize: 15, fontWeight: '900' },
  totalDivider: { height: 1, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.18)' },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    borderRadius: 13,
    backgroundColor: 'rgba(16,166,106,0.16)',
    padding: 11,
  },
  earnText: { flex: 1, marginLeft: 7, color: '#D1FAE5', fontSize: 10, fontWeight: '800', lineHeight: 15 },
});
