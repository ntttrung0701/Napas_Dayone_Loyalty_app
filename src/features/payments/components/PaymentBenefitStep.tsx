import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../theme/colors';
import type { PaymentProcessingChannel } from '../../../types';
import { formatCurrency, formatPoints } from '../../../utils/format';
import type {
  PaymentBenefitDraft,
  PaymentInvoice,
  PaymentVoucher,
  PaymentVoucherOption,
} from '../domain/PaymentModels';
import { InvoicePreviewCard } from './InvoicePreviewCard';
import { PaymentSummaryCard } from './PaymentSummaryCard';

type PaymentBenefitStepProps = {
  benefit: PaymentBenefitDraft;
  invoice: PaymentInvoice;
  pointOptions: number[];
  pointsAvailable: number;
  processingChannel: PaymentProcessingChannel;
  selectedVoucherId: string | null;
  voucherOptions: PaymentVoucherOption[];
  onConfirm: () => void;
  onSelectPoints: (points: number) => void;
  onSelectVoucher: (voucherId: string) => void;
};

export function PaymentBenefitStep({
  benefit,
  invoice,
  pointOptions,
  pointsAvailable,
  processingChannel,
  selectedVoucherId,
  voucherOptions,
  onConfirm,
  onSelectPoints,
  onSelectVoucher,
}: PaymentBenefitStepProps) {
  return (
    <>
      <InvoicePreviewCard invoice={invoice} />

      <View style={styles.sectionCard}>
        <SectionTitle
          icon="pricetag-outline"
          subtitle="Voucher không đủ điều kiện vẫn hiển thị để người dùng hiểu lý do"
          title="Voucher / mã giảm giá"
        />

        {voucherOptions.map((option) => (
          <VoucherOptionRow
            invoice={invoice}
            key={option.voucher.id}
            option={option}
            selected={selectedVoucherId === option.voucher.id && option.eligibility.isEligible}
            onPress={() => onSelectVoucher(option.voucher.id)}
          />
        ))}
      </View>

      <View style={styles.sectionCard}>
        <SectionTitle
          icon="sparkles-outline"
          subtitle={`Khả dụng ${formatPoints(pointsAvailable)} pts • Tối đa ${formatPoints(benefit.maxUsablePoints)} pts`}
          title="Sử dụng điểm Loyalty"
        />

        <View style={styles.pointOptions}>
          {pointOptions.map((option, index) => {
            const selected = benefit.pointsUsed === option;
            return (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => onSelectPoints(option)}
                style={({ pressed }) => [
                  styles.pointOption,
                  selected && styles.pointOptionActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.pointOptionLabel, selected && styles.pointOptionLabelActive]}>
                  {resolvePointOptionLabel(option, index, pointOptions)}
                </Text>
                {option > 0 ? (
                  <Text style={[styles.pointOptionSub, selected && styles.pointOptionSubActive]}>
                    {formatPoints(option)} pts
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.conversionBox}>
          <Ionicons color={colors.primary} name="swap-horizontal-outline" size={16} />
          <Text style={styles.conversionText}>
            Quy đổi: 1 điểm = {formatCurrency(benefit.conversionRate)}. Điểm không vượt quá
            số dư hoặc số tiền còn lại sau voucher.
          </Text>
        </View>
      </View>

      <View style={styles.channelCard}>
        <View style={styles.channelIcon}>
          <Ionicons color={colors.primary} name="git-network-outline" size={18} />
        </View>
        <View style={styles.channelCopy}>
          <Text style={styles.channelTitle}>{processingChannel.label}</Text>
          <Text style={styles.channelText}>{processingChannel.description}</Text>
        </View>
      </View>

      <PaymentSummaryCard
        benefit={benefit}
        invoice={invoice}
        processingChannel={processingChannel}
      />

      <PrimaryButton
        label={`Tiếp tục xác nhận ${formatCurrency(benefit.cashAmount)}`}
        onPress={onConfirm}
      />
    </>
  );
}

function VoucherOptionRow({
  invoice,
  option,
  selected,
  onPress,
}: {
  invoice: PaymentInvoice;
  option: PaymentVoucherOption;
  selected: boolean;
  onPress: () => void;
}) {
  const disabled = !option.eligibility.isEligible;
  const discount = estimateVoucherDiscount(invoice, option.voucher);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.voucherRow,
        selected && styles.voucherRowActive,
        disabled && styles.voucherRowDisabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.voucherIcon, disabled && styles.voucherIconDisabled]}>
        <Ionicons
          color={disabled ? colors.textMuted : colors.warning}
          name="gift-outline"
          size={19}
        />
      </View>

      <View style={styles.voucherCopy}>
        <Text style={[styles.voucherTitle, disabled && styles.disabledText]}>
          {option.voucher.title}
        </Text>
        <Text numberOfLines={2} style={styles.voucherSubtitle}>
          {disabled
            ? option.eligibility.reason
            : `${option.voucher.description} HSD ${option.voucher.expiresLabel}`}
        </Text>
      </View>

      {!disabled ? <Text style={styles.voucherAmount}>-{formatCurrency(discount)}</Text> : null}

      <View style={[styles.radio, selected && styles.radioActive]}>
        {selected ? <Ionicons color={colors.white} name="checkmark" size={13} /> : null}
      </View>
    </Pressable>
  );
}

function SectionTitle({
  icon,
  subtitle,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionIcon}>
        <Ionicons color={colors.primary} name={icon} size={18} />
      </View>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function estimateVoucherDiscount(invoice: PaymentInvoice, voucher: PaymentVoucher) {
  return Math.min(
    Math.round(invoice.amount * voucher.discountRate),
    voucher.maxDiscount,
    invoice.amount,
  );
}

function resolvePointOptionLabel(option: number, index: number, options: number[]) {
  if (option === 0) return 'Không dùng điểm';
  if (index === options.length - 1) return 'Tối đa';
  return '50%';
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.72 },
  sectionCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  sectionCopy: { flex: 1, marginLeft: 11 },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  sectionSubtitle: { marginTop: 3, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  voucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 12,
  },
  voucherRowActive: { borderColor: 'rgba(0,91,170,0.36)', backgroundColor: '#F7FBFF' },
  voucherRowDisabled: { opacity: 0.62, backgroundColor: '#F8FAFC' },
  voucherIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: colors.warningSoft,
  },
  voucherIconDisabled: { backgroundColor: colors.border },
  voucherCopy: { flex: 1, marginHorizontal: 11 },
  voucherTitle: { color: colors.text, fontSize: 12, fontWeight: '900' },
  disabledText: { color: colors.textMuted },
  voucherSubtitle: { marginTop: 4, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  voucherAmount: { marginRight: 8, color: colors.success, fontSize: 11, fontWeight: '900' },
  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
  },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  pointOptions: { flexDirection: 'row' },
  pointOption: {
    flex: 1,
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 6,
  },
  pointOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  pointOptionLabel: { textAlign: 'center', color: colors.text, fontSize: 10, fontWeight: '900' },
  pointOptionLabelActive: { color: colors.white },
  pointOptionSub: { marginTop: 5, color: colors.textMuted, fontSize: 9, fontWeight: '700' },
  pointOptionSubActive: { color: '#D8ECFF' },
  conversionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    padding: 11,
  },
  conversionText: {
    flex: 1,
    marginLeft: 8,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 15,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,91,170,0.14)',
    borderRadius: 20,
    backgroundColor: '#F7FBFF',
    padding: 14,
  },
  channelIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  channelCopy: { flex: 1, marginLeft: 11 },
  channelTitle: { color: colors.primaryDark, fontSize: 12, fontWeight: '900' },
  channelText: { marginTop: 4, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
});
