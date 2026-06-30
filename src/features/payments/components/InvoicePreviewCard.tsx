import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { PaymentInvoice } from '../domain/PaymentModels';
import { formatCurrency } from '../../../utils/format';

type InvoicePreviewCardProps = {
  invoice: PaymentInvoice;
  compact?: boolean;
};

const channelLabel = {
  pos: 'POS/EDC',
  qr: 'QR đối tác',
  ecom: 'Merchant Gateway',
} as const;

export function InvoicePreviewCard({ compact = false, invoice }: InvoicePreviewCardProps) {
  return (
    <View style={[styles.invoiceCard, compact && styles.invoiceCardCompact]}>
      <View style={styles.invoiceCardHeader}>
        <View style={styles.merchantLogo}>
          <Ionicons color={colors.primary} name="storefront-outline" size={22} />
        </View>

        <View style={styles.invoiceMerchantCopy}>
          <Text style={styles.invoiceMerchant}>{invoice.merchant}</Text>
          <Text style={styles.invoiceMeta}>
            {channelLabel[invoice.channel]} • {invoice.terminal}
          </Text>
        </View>

        <View style={styles.invoiceChannelBadge}>
          <Text style={styles.invoiceChannelText}>{invoice.category}</Text>
        </View>
      </View>

      <View style={styles.invoiceAmountBox}>
        <Text style={styles.invoiceAmountLabel}>Số tiền hóa đơn</Text>
        <Text style={styles.invoiceAmount}>{formatCurrency(invoice.amount)}</Text>
      </View>

      {!compact ? (
        <View style={styles.invoiceFooter}>
          <InfoRow label="Mã hóa đơn" value={invoice.id} />
          <InfoRow label="Ghi chú" value={invoice.customerNote} />
          <InfoRow label="Trạng thái" value={invoice.dueLabel} />
          <InfoRow label="Hiệu lực đến" value={formatInvoiceExpiry(invoice.expiresAt)} />
        </View>
      ) : null}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function formatInvoiceExpiry(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

const styles = StyleSheet.create({
  invoiceCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 16,
  },
  invoiceCardCompact: { marginBottom: 14 },
  invoiceCardHeader: { flexDirection: 'row', alignItems: 'center' },
  merchantLogo: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  invoiceMerchantCopy: { flex: 1, marginLeft: 12 },
  invoiceMerchant: { color: colors.text, fontSize: 15, fontWeight: '900' },
  invoiceMeta: { marginTop: 4, color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  invoiceChannelBadge: {
    borderRadius: 999,
    backgroundColor: colors.warningSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  invoiceChannelText: { color: colors.warning, fontSize: 9, fontWeight: '900' },
  invoiceAmountBox: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
    padding: 16,
  },
  invoiceAmountLabel: { color: '#B8D4E8', fontSize: 10, fontWeight: '800' },
  invoiceAmount: { marginTop: 7, color: colors.white, fontSize: 26, fontWeight: '900' },
  invoiceFooter: { marginTop: 14 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: { maxWidth: '38%', color: colors.textMuted, fontSize: 11 },
  infoValue: { maxWidth: '58%', textAlign: 'right', color: colors.text, fontSize: 11, fontWeight: '800' },
});
