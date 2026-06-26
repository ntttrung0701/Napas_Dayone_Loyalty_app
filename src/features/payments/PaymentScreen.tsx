import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { Receipt } from '../../types';
import { formatCurrency, formatPoints } from '../../utils/format';
import { PaymentFlowScreen } from './PaymentFlowScreen';

type PaymentScreenProps = {
  points: number;
  onBack: () => void;
  onComplete: (receipt: Receipt) => void;
};

const invoiceAmount = 450_000;

export function PaymentScreen(props: PaymentScreenProps) {
  return <PaymentFlowScreen {...props} />;
}

/**
 * @deprecated Luồng runtime hiện dùng PaymentFlowScreen.
 * Giữ lại phần cũ tạm thời để không làm rủi ro diff lớn trong lần nâng cấp này.
 */
function DeprecatedLegacyPaymentScreen({
  points,
  onBack,
  onComplete,
}: PaymentScreenProps) {
  const maxPoints = Math.min(points, 50_000);
  const [voucherApplied, setVoucherApplied] = useState(true);
  const [selectedPoints, setSelectedPoints] = useState(maxPoints);

  const voucherDiscount = voucherApplied ? Math.round(invoiceAmount * 0.1) : 0;
  const cashAmount = Math.max(0, invoiceAmount - voucherDiscount - selectedPoints);
  const pointOptions = useMemo(
    () => [0, Math.floor(maxPoints / 2), maxPoints].filter((value, index, all) => all.indexOf(value) === index),
    [maxPoints],
  );

  const confirmPayment = () => {
    onComplete({
      id: `NPS-PM-${Date.now().toString().slice(-6)}`,
      kind: 'payment',
      merchant: 'WinMart Landmark 81',
      title: 'Thanh toán hỗn hợp',
      originalAmount: invoiceAmount,
      voucherDiscount,
      pointsUsed: selectedPoints,
      cashAmount,
      createdAt: 'Hôm nay, 09:41',
    });
  };

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Thanh toán hỗn hợp" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.invoiceCard}>
          <View style={styles.invoiceHeader}>
            <Text style={styles.invoiceLabel}>GIAO DỊCH CHỜ THANH TOÁN</Text>
            <View style={styles.goldBadge}>
              <Text style={styles.goldText}>HỘI VIÊN VÀNG</Text>
            </View>
          </View>
          <Text style={styles.merchant}>WinMart Landmark 81</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Tổng hóa đơn mua sắm</Text>
            <Text style={styles.amount}>{formatCurrency(invoiceAmount)}</Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>1. ÁP DỤNG VOUCHER GIẢM GIÁ</Text>
          <Pressable
            onPress={() => setVoucherApplied((current) => !current)}
            style={[styles.voucher, voucherApplied && styles.voucherActive]}
          >
            <View style={styles.voucherPercent}>
              <Text style={styles.voucherPercentText}>10%</Text>
            </View>
            <View style={styles.voucherInfo}>
              <Text style={styles.voucherName}>Mã hoàn 10% WinMart qua NAPAS</Text>
              <Text style={styles.voucherMeta}>Voucher trong ví của bạn • HSD 31/12</Text>
            </View>
            <View style={[styles.selector, voucherApplied && styles.selectorActive]}>
              {voucherApplied ? <Ionicons color={colors.white} name="checkmark" size={14} /> : null}
            </View>
          </Pressable>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>2. DÙNG ĐIỂM LOYALTY KHẤU TRỪ</Text>
          <Text style={styles.available}>Ví điểm khả dụng: {formatPoints(points)} pts</Text>
          <Text style={styles.helper}>Chọn số điểm muốn sử dụng:</Text>
          <View style={styles.optionRow}>
            {pointOptions.map((option) => {
              const selected = selectedPoints === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setSelectedPoints(option)}
                  style={[styles.pointOption, selected && styles.pointOptionActive]}
                >
                  <Text style={[styles.pointOptionText, selected && styles.pointOptionTextActive]}>
                    {formatPoints(option)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.conversion}>
            <Text style={styles.conversionText}>
              1 điểm = 1 VNĐ. Đơn hàng được giảm {formatCurrency(selectedPoints)}.
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>3. PHƯƠNG THỨC THANH TOÁN CÒN LẠI</Text>
          <View style={styles.cardRow}>
            <View style={styles.bankLogo}>
              <Text style={styles.bankLogoText}>VCB</Text>
            </View>
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>Vietcombank</Text>
              <Text style={styles.bankCard}>Napas Debit •••• 8839</Text>
            </View>
            <Ionicons color={colors.success} name="checkmark-circle" size={21} />
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>TÓM TẮT THANH TOÁN</Text>
          <SummaryRow label="Hóa đơn ban đầu" value={formatCurrency(invoiceAmount)} />
          <SummaryRow
            label="Voucher 10%"
            value={`-${formatCurrency(voucherDiscount)}`}
            valueColor={colors.success}
          />
          <SummaryRow
            label={`Điểm Loyalty (${formatPoints(selectedPoints)} pts)`}
            value={`-${formatCurrency(selectedPoints)}`}
            valueColor={colors.purple}
          />
          <View style={styles.totalDivider} />
          <SummaryRow
            bold
            label="Tiền cần thanh toán"
            value={formatCurrency(cashAmount)}
            valueColor={colors.primary}
          />
        </View>

        <PrimaryButton label={`Xác nhận trả ${formatCurrency(cashAmount)}`} onPress={confirmPayment} />
        <Text style={styles.disclaimer}>
          Đây là giao dịch giả lập. Không có tiền hoặc dữ liệu thẻ thật được sử dụng.
        </Text>
      </ScrollView>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  valueColor = colors.text,
  bold = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.bold, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  invoiceCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 18,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  invoiceLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  goldBadge: {
    borderRadius: 999,
    backgroundColor: '#FFF8E4',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  goldText: {
    color: colors.gold,
    fontSize: 8,
    fontWeight: '900',
  },
  merchant: {
    marginTop: 12,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  amountLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  amount: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  stepCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 16,
  },
  stepTitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 16,
  },
  voucher: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    padding: 12,
  },
  voucherActive: {
    borderColor: colors.purple,
    backgroundColor: '#F9F7FF',
  },
  voucherPercent: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#FFF1F5',
  },
  voucherPercentText: {
    color: '#D94672',
    fontSize: 11,
    fontWeight: '900',
  },
  voucherInfo: {
    flex: 1,
    marginHorizontal: 11,
  },
  voucherName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  voucherMeta: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 9,
  },
  selector: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
  },
  selectorActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  available: {
    marginTop: 8,
    color: colors.purple,
    fontSize: 12,
    fontWeight: '800',
  },
  helper: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 11,
  },
  optionRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  pointOption: {
    flex: 1,
    alignItems: 'center',
    marginRight: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
  },
  pointOptionActive: {
    borderColor: colors.purple,
    backgroundColor: colors.purple,
  },
  pointOptionText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  pointOptionTextActive: {
    color: colors.white,
  },
  conversion: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    padding: 11,
  },
  conversionText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 15,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  bankLogo: {
    width: 46,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: colors.successSoft,
  },
  bankLogoText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '900',
  },
  bankInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bankName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  bankCard: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 10,
  },
  summaryCard: {
    marginBottom: 16,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: colors.primaryDark,
    padding: 18,
  },
  summaryTitle: {
    marginBottom: 14,
    color: '#B8D4E8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    maxWidth: '65%',
    color: '#D7E5EF',
    fontSize: 11,
  },
  summaryValue: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  totalDivider: {
    height: 1,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  bold: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  disclaimer: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
  },
});
