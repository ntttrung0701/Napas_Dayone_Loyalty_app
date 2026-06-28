import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { getScreenBottomPadding } from '../../shared/layout';
import { colors } from '../../theme/colors';
import type { Transaction, TransactionStatus } from '../../types';
import { formatPoints } from '../../utils/format';
import {
  resolveTransactionBalanceSnapshot,
  TransactionRecord,
} from './domain/TransactionLedger';
import { TransactionPointPolicy } from './domain/TransactionPointPolicy';

const statusColor: Record<TransactionStatus, string> = {
  success: colors.success,
  pending: colors.warning,
  expired: colors.textMuted,
  failed: colors.danger,
};

const statusIcon: Record<TransactionStatus, 'checkmark-circle-outline' | 'time-outline' | 'calendar-outline' | 'close-circle-outline'> = {
  success: 'checkmark-circle-outline',
  pending: 'time-outline',
  expired: 'calendar-outline',
  failed: 'close-circle-outline',
};

export function TransactionDetailScreen({
  currentPoints,
  transaction,
  transactions,
  onBack,
}: {
  currentPoints: number;
  transaction: Transaction;
  transactions: readonly Transaction[];
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const record = new TransactionRecord(transaction);
const pointPolicy = new TransactionPointPolicy(transaction);
const accent = statusColor[transaction.status];

const balanceSnapshot = resolveTransactionBalanceSnapshot({
  currentPoints,
  transaction,
  transactions,
});

const pointChangeColor = getPointChangeColor(transaction, balanceSnapshot.displayChange);
const transactionDateTime = formatTransactionDateTime(transaction.occurredAt, transaction.date);
  const requestSupport = () => {
    Alert.alert(
      'Hỗ trợ giao dịch',
      `Yêu cầu hỗ trợ cho giao dịch ${transaction.id} đã được ghi nhận trong môi trường demo.`,
      [{ text: 'Đã hiểu' }],
    );
  };

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Chi tiết giao dịch" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getScreenBottomPadding(insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={[styles.statusIcon, { backgroundColor: `${accent}18`, borderColor: `${accent}40` }]}>
            <Ionicons color={accent} name={statusIcon[transaction.status]} size={32} />
          </View>
          <Text style={[styles.resultLabel, { color: accent }]}>{record.resultLabel}</Text>
          <Text style={styles.summaryPoints}>
            {record.isCredit ? '+' : ''}{formatPoints(transaction.points)} điểm
          </Text>
          <Text style={styles.summaryDate}>{transaction.date}</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>THÔNG TIN CHI TIẾT</Text>
          <DetailRow label="Mã giao dịch" value={transaction.id} />
<DetailRow label="Thời gian giao dịch" value={transactionDateTime} />
<DetailRow label="Loại giao dịch" value={record.kindLabel} />
<DetailRow label="Nguồn liên kết" value={transaction.source} icon="card-outline" />
          {transaction.amount > 0 ? (
            <DetailRow label="Số tiền giao dịch" value={`${formatPoints(transaction.amount)} VND`} />
          ) : null}
          <View style={styles.ruleRow}>
            <Text maxFontSizeMultiplier={1.08} style={styles.ruleLabel}>{pointPolicy.ruleLabel}</Text>
            <Text maxFontSizeMultiplier={1.08} style={styles.ruleValue}>{pointPolicy.ruleDescription}</Text>
          </View>
        </View>

        <View style={styles.card}>
  <Text style={styles.cardTitle}>CẬP NHẬT SỐ DƯ ĐIỂM</Text>

  <DetailRow
    label="Số dư trước giao dịch"
    value={`${formatPoints(balanceSnapshot.balanceBefore)} điểm`}
  />

  <DetailRow
    label={getPointUpdateLabel(transaction)}
    value={formatPointDelta(balanceSnapshot.displayChange)}
    valueColor={pointChangeColor}
  />

  <DetailRow
    label="Số dư sau giao dịch"
    value={`${formatPoints(balanceSnapshot.balanceAfter)} điểm`}
  />

  <Text style={styles.balanceNote}>
    {getPointUpdateDescription(transaction)}
  </Text>
</View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>TRẠNG THÁI XỬ LÝ</Text>
          {transaction.timeline.map((step, index) => (
            <View key={step.id} style={styles.timelineRow}>
              <View style={styles.timelineTrack}>
                <View style={[styles.timelineDot, { backgroundColor: accent }]} />
                {index < transaction.timeline.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>{step.time}</Text>
                <Text style={styles.timelineTitle}>{step.title}</Text>
                <Text style={styles.timelineDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={requestSupport}
          style={({ pressed }) => [styles.supportButton, pressed && styles.supportPressed]}
        >
          <Ionicons color={colors.primary} name="help-circle-outline" size={18} />
          <Text style={styles.supportText}>Cần hỗ trợ giao dịch này?</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function formatTransactionDateTime(occurredAt: string, fallback: string) {
  const date = new Date(occurredAt);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function formatPointDelta(value: number) {
  if (value > 0) return `+${formatPoints(value)} điểm`;
  if (value < 0) return `-${formatPoints(Math.abs(value))} điểm`;
  return '0 điểm';
}


function getPointChangeColor(transaction: Transaction, displayChange: number) {
  if (transaction.status === 'pending') return colors.warning;
  if (transaction.status === 'failed') return colors.textMuted;
  if (displayChange > 0) return colors.success;
  if (displayChange < 0) return colors.danger;
  return colors.textMuted;
}

function getPointUpdateLabel(transaction: Transaction) {
  if (transaction.status === 'pending') return 'Điểm dự kiến cập nhật';
  if (transaction.status === 'failed') return 'Điểm không cập nhật';
  return 'Biến động điểm';
}

function getPointUpdateDescription(transaction: Transaction) {
  const absolutePoints = formatPoints(Math.abs(transaction.points));

  if (transaction.status === 'failed') {
    return 'Giao dịch thất bại nên số dư điểm không thay đổi.';
  }

  if (transaction.status === 'pending') {
    if (transaction.points > 0) {
      return `Dự kiến cộng ${absolutePoints} điểm sau khi giao dịch được xử lý thành công.`;
    }

    if (transaction.points < 0) {
      return `Dự kiến trừ ${absolutePoints} điểm sau khi giao dịch được xử lý thành công.`;
    }

    return 'Giao dịch đang chờ xử lý và chưa làm thay đổi số dư điểm.';
  }

  if (transaction.points > 0) {
    return `Đã cộng ${absolutePoints} điểm vào tài khoản Loyalty.`;
  }

  if (transaction.points < 0) {
    return `Đã trừ ${absolutePoints} điểm khỏi tài khoản Loyalty.`;
  }

  return 'Giao dịch không phát sinh biến động điểm.';
}

function DetailRow({
  label,
  value,
  icon,
  valueColor,
}: {
  label: string;
  value: string;
  icon?: 'card-outline';
  valueColor?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text maxFontSizeMultiplier={1.08} numberOfLines={2} style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueRow}>
        {icon ? <Ionicons color={colors.primary} name={icon} size={15} /> : null}
        <Text maxFontSizeMultiplier={1.08} numberOfLines={2} style={[styles.detailValue, valueColor ? { color: valueColor } : null]}>
  {value}
</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18 },
  summaryCard: {
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 22,
  },
  balanceNote: {
  marginTop: 12,
  borderRadius: 10,
  backgroundColor: colors.primarySoft,
  padding: 11,
  color: colors.primary,
  fontSize: 10,
  fontWeight: '700',
  lineHeight: 15,
},
  statusIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 29,
  },
  resultLabel: { marginTop: 14, fontSize: 10, fontWeight: '900' },
  summaryPoints: { marginTop: 7, color: colors.primaryDark, fontSize: 27, fontWeight: '900' },
  summaryDate: { marginTop: 6, color: colors.textMuted, fontSize: 11 },
  card: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
  },
  cardTitle: { marginBottom: 10, color: colors.primaryDark, fontSize: 11, fontWeight: '900' },
  detailRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  detailLabel: { flex: 0.9, minWidth: 0, color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  detailValueRow: { flex: 1.1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  detailValue: { flexShrink: 1, marginLeft: 6, textAlign: 'right', color: colors.text, fontSize: 11, fontWeight: '800', lineHeight: 16 },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: colors.background,
    padding: 12,
  },
  ruleLabel: { flex: 0.8, minWidth: 0, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  ruleValue: { flex: 1.2, marginLeft: 10, textAlign: 'right', color: colors.text, fontSize: 10, fontWeight: '800', lineHeight: 15 },
  timelineRow: { minHeight: 74, flexDirection: 'row' },
  timelineTrack: { width: 24, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, marginTop: 3, borderRadius: 6 },
  timelineLine: { width: 1, flex: 1, marginVertical: 4, backgroundColor: colors.border },
  timelineContent: { flex: 1, paddingBottom: 16, paddingLeft: 8 },
  timelineTime: { color: colors.textMuted, fontSize: 9 },
  timelineTitle: { marginTop: 3, color: colors.text, fontSize: 12, fontWeight: '800' },
  timelineDescription: { marginTop: 3, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  supportButton: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  supportPressed: { opacity: 0.72 },
  supportText: { marginLeft: 7, color: colors.primary, fontSize: 12, fontWeight: '800' },
});
