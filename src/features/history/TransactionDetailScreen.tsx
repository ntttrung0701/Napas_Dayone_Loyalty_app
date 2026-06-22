import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { Transaction, TransactionStatus } from '../../types';
import { formatPoints } from '../../utils/format';
import {
  resolveTransactionBalanceSnapshot,
  TransactionRecord,
} from './domain/TransactionLedger';

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
  const record = new TransactionRecord(transaction);
  const accent = statusColor[transaction.status];
  const balanceSnapshot = resolveTransactionBalanceSnapshot({
  currentPoints,
  transaction,
  transactions,
});

const pointChangeColor = getPointChangeColor(transaction, balanceSnapshot.displayChange);
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.cardTitle}>THÔNG TIN CHI TIẾT</Text>
          <DetailRow label="Mã giao dịch" value={transaction.id} />
          <DetailRow label="Loại giao dịch" value={record.kindLabel} />
          <DetailRow icon="card-outline" label="Nguồn liên kết" value={transaction.source} />
          {transaction.amount > 0 ? (
            <DetailRow label="Số tiền giao dịch" value={`${formatPoints(transaction.amount)} VND`} />
          ) : null}
          <View style={styles.ruleRow}>
  <Text style={styles.ruleLabel}>{getPointRuleLabel(transaction)}</Text>
  <Text style={styles.ruleValue}>{getPointRuleDescription(transaction)}</Text>
</View>
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

function getPointRuleLabel(transaction: Transaction) {
  if (transaction.kind === 'earn') return 'Quy tắc tích điểm';
  if (transaction.kind === 'payment') return 'Nội dung sử dụng điểm';
  if (transaction.kind === 'redemption') return 'Nội dung đổi điểm';
  if (transaction.kind === 'transfer') {
    return transaction.points < 0 ? 'Nội dung chuyển điểm' : 'Nội dung nhận điểm';
  }
  if (transaction.kind === 'expiration') return 'Lý do hết hạn điểm';

  return 'Nội dung giao dịch';
}

function getPointRuleDescription(transaction: Transaction) {
  const absolutePoints = formatPoints(Math.abs(transaction.points));

  if (transaction.kind === 'earn') {
    if (transaction.pointRule) return transaction.pointRule;
    return `Cộng ${absolutePoints} điểm theo quy tắc chương trình Loyalty.`;
  }

  if (transaction.kind === 'payment') {
    return `Dùng ${absolutePoints} điểm để giảm trừ thanh toán tại ${transaction.source}.`;
  }

  if (transaction.kind === 'redemption') {
    return `Dùng ${absolutePoints} điểm để đổi ưu đãi/voucher từ ${transaction.source}.`;
  }

  if (transaction.kind === 'transfer') {
    if (transaction.points < 0) {
      return `Chuyển ${absolutePoints} điểm cho ${transaction.source}.`;
    }

    return `Nhận ${absolutePoints} điểm từ ${transaction.source}.`;
  }

  if (transaction.kind === 'expiration') {
    return `${absolutePoints} điểm hết hạn theo chính sách chương trình Loyalty.`;
  }

  return transaction.pointRule;
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
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueRow}>
        {icon ? <Ionicons color={colors.primary} name={icon} size={15} /> : null}
        <Text style={[styles.detailValue, valueColor ? { color: valueColor } : null]}>
  {value}
</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 32 },
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
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: { color: colors.textMuted, fontSize: 11 },
  detailValueRow: { maxWidth: '62%', flexDirection: 'row', alignItems: 'center' },
  detailValue: { marginLeft: 6, textAlign: 'right', color: colors.text, fontSize: 11, fontWeight: '800' },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: colors.background,
    padding: 12,
  },
  ruleLabel: { color: colors.textMuted, fontSize: 10 },
  ruleValue: { maxWidth: '60%', textAlign: 'right', color: colors.text, fontSize: 10, fontWeight: '800' },
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
