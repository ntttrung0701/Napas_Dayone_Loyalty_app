import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TransactionRecord } from '../../features/history/domain/TransactionLedger';
import { colors } from '../../theme/colors';
import type { Transaction } from '../../types';
import { formatPoints } from '../../utils/format';

type IconName = ComponentProps<typeof Ionicons>['name'];

const kindIcons: Record<Transaction['kind'], IconName> = {
  earn: 'add-circle-outline',
  redemption: 'gift-outline',
  transfer: 'swap-horizontal-outline',
  expiration: 'calendar-outline',
  payment: 'card-outline',
};

type PointTone = {
  color: string;
  background: string;
  statusIcon: IconName;
};

function resolvePointTone(transaction: Transaction): PointTone {
  if (transaction.status === 'pending') {
    return {
      color: colors.warning,
      background: colors.warningSoft,
      statusIcon: 'time-outline',
    };
  }

  if (transaction.kind === 'expiration' || transaction.status === 'expired') {
    return {
      color: '#3F4652',
      background: '#EEF1F5',
      statusIcon: 'remove-circle-outline',
    };
  }

  if (transaction.points > 0) {
    return {
      color: colors.success,
      background: colors.successSoft,
      statusIcon: 'checkmark-circle-outline',
    };
  }

  if (transaction.points < 0) {
    return {
      color: colors.danger,
      background: '#FEECEC',
      statusIcon: 'checkmark-circle-outline',
    };
  }

  return {
    color: colors.textMuted,
    background: colors.primarySoft,
    statusIcon: 'ellipse-outline',
  };
}


export function TransactionRow({
  transaction,
  onPress,
}: {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}) {
  const record = new TransactionRecord(transaction);
const tone = resolvePointTone(transaction);
const pointPrefix = transaction.points > 0 ? '+' : '';
  return (
    <Pressable
      accessibilityHint={onPress ? 'Mở thông tin chi tiết giao dịch' : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={() => onPress?.(transaction)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.icon, { backgroundColor: tone.background }]}>
  <Ionicons
    color={tone.color}
    name={kindIcons[transaction.kind]}
    size={20}
  />
</View>
      <View style={styles.info}>
        <Text maxFontSizeMultiplier={1.08} numberOfLines={1} style={styles.title}>
          {transaction.title}
        </Text>
        <Text maxFontSizeMultiplier={1.08} numberOfLines={2} style={styles.subtitle}>{transaction.subtitle}</Text>
        <Text maxFontSizeMultiplier={1.08} numberOfLines={2} style={styles.date}>{transaction.date}</Text>
      </View>
      <View style={styles.trailing}>
        <Text style={[styles.points, { color: tone.color }]}>
  {pointPrefix}
  {formatPoints(transaction.points)}
</Text>
        <View style={[styles.badge, { backgroundColor: tone.background }]}>
  <Ionicons color={tone.color} name={tone.statusIcon} size={10} />
  <Text style={[styles.badgeText, { color: tone.color }]}>
    {record.statusLabel}
  </Text>
</View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 14,
  },
  rowPressed: { opacity: 0.72, backgroundColor: colors.primarySoft },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  positiveIcon: {
    backgroundColor: colors.successSoft,
  },
  negativeIcon: {
    backgroundColor: colors.warningSoft,
  },
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  subtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 11,
  },
  date: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 10,
  },
  points: {
    fontSize: 13,
    fontWeight: '900',
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.danger,
  },
  trailing: { width: 82, alignItems: 'flex-end' },
  badge: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 5,
  borderRadius: 999,
  paddingHorizontal: 7,
  paddingVertical: 3,
},
  badgeText: {
  marginLeft: 3,
  fontSize: 8,
  fontWeight: '800',
},
  success: { backgroundColor: colors.successSoft },
  successText: { color: colors.success },
  pending: { backgroundColor: colors.warningSoft },
  pendingText: { color: colors.warning },
  expired: { backgroundColor: '#EEF1F5' },
  expiredText: { color: colors.textMuted },
  failed: { backgroundColor: '#FEECEC' },
  failedText: { color: colors.danger },
});
