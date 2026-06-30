import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../theme/colors';
import type { PaymentProcessingChannel } from '../../../types';
import { formatCurrency, formatPoints } from '../../../utils/format';
import type { PaymentBenefitDraft, PaymentInvoice } from '../domain/PaymentModels';
import { InvoicePreviewCard } from './InvoicePreviewCard';
import { PaymentSummaryCard } from './PaymentSummaryCard';

type IconName = ComponentProps<typeof Ionicons>['name'];

type PaymentConfirmStepProps = {
  benefit: PaymentBenefitDraft;
  invoice: PaymentInvoice;
  processingChannel: PaymentProcessingChannel;
  onBack: () => void;
  onPay: () => void;
};

export function PaymentConfirmStep({
  benefit,
  invoice,
  processingChannel,
  onBack,
  onPay,
}: PaymentConfirmStepProps) {
  return (
    <>
      <View style={styles.confirmCard}>
        <View style={styles.confirmIcon}>
          <Ionicons color={colors.primary} name="shield-checkmark-outline" size={30} />
        </View>
        <Text style={styles.confirmTitle}>Xác nhận thanh toán?</Text>
        <Text style={styles.confirmText}>
          Hệ thống sẽ xác thực OTP/sinh trắc học, giữ quyền lợi Loyalty và gửi kết quả xử lý
          sang POS/Merchant.
        </Text>
      </View>

      <InvoicePreviewCard compact invoice={invoice} />

      <View style={styles.sectionCard}>
        <InfoRow label="Kênh xử lý" value={processingChannel.label} />
        <InfoRow label="Mã giảm giá" value={benefit.voucher?.title ?? 'Không áp dụng'} />
        <InfoRow label="Điểm sử dụng" value={`${formatPoints(benefit.pointsUsed)} pts`} />
        <InfoRow label="Tiền còn lại" strong value={formatCurrency(benefit.cashAmount)} />
      </View>

      <View style={styles.executionCard}>
        <ExecutionStep
          icon="sparkles-outline"
          label="Giữ / khấu trừ điểm Loyalty"
          value={`${formatPoints(benefit.pointsUsed)} pts`}
        />
        <ExecutionStep
          icon="git-network-outline"
          label="Xử lý phần tiền còn lại"
          value={benefit.cashAmount === 0 ? 'Không phát sinh' : processingChannel.label}
        />
        <ExecutionStep
          icon="receipt-outline"
          label="Chốt mã giao dịch chung"
          value="Idempotency demo"
        />
      </View>

      <PaymentSummaryCard
        benefit={benefit}
        invoice={invoice}
        processingChannel={processingChannel}
      />

      <View style={styles.actions}>
        <PrimaryButton label="Xác nhận thanh toán" onPress={onPay} />
        <View style={styles.actionSpacer} />
        <PrimaryButton label="Quay lại chỉnh sửa" onPress={onBack} variant="secondary" />
      </View>
    </>
  );
}

function ExecutionStep({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.executionRow}>
      <View style={styles.executionIcon}>
        <Ionicons color={colors.primary} name={icon} size={17} />
      </View>
      <Text style={styles.executionLabel}>{label}</Text>
      <Text style={styles.executionValue}>{value}</Text>
    </View>
  );
}

function InfoRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, strong && styles.infoValueStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  confirmCard: {
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 22,
  },
  confirmIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    backgroundColor: colors.primarySoft,
  },
  confirmTitle: { marginTop: 14, color: colors.text, fontSize: 20, fontWeight: '900' },
  confirmText: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
  },
  sectionCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: { maxWidth: '38%', color: colors.textMuted, fontSize: 11 },
  infoValue: {
    maxWidth: '58%',
    textAlign: 'right',
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  infoValueStrong: { color: colors.primary, fontSize: 15, fontWeight: '900' },
  executionCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 14,
  },
  executionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  executionIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
  },
  executionLabel: {
    flex: 1,
    marginLeft: 10,
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  executionValue: {
    maxWidth: '34%',
    textAlign: 'right',
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  actions: { marginTop: 2 },
  actionSpacer: { height: 10 },
});
