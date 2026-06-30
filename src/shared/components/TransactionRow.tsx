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

export function TransactionRow({
  transaction,
  onPress,
}: {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}) {
  const record = new TransactionRecord(transaction);
  const positive = record.isCredit;

  return (
    <Pressable
      accessibilityHint={onPress ? 'Mở thông tin chi tiết giao dịch' : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={() => onPress?.(transaction)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.icon, positive ? styles.positiveIcon : styles.negativeIcon]}>
        <Ionicons
          color={positive ? colors.success : colors.warning}
          name={kindIcons[transaction.kind]}
          size={19}
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
        <Text
          adjustsFontSizeToFit
          maxFontSizeMultiplier={1.05}
          numberOfLines={1}
          style={[styles.points, positive ? styles.positive : styles.negative]}
        >
          {positive ? '+' : ''}
          {formatPoints(transaction.points)}
        </Text>
        <View style={[styles.badge, styles[transaction.status]]}>
          <Text
            maxFontSizeMultiplier={1.05}
            numberOfLines={1}
            style={[styles.badgeText, styles[`${transaction.status}Text`]]}
          >
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
  badge: { marginTop: 5, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: 8, fontWeight: '800' },
  success: { backgroundColor: colors.successSoft },
  successText: { color: colors.success },
  pending: { backgroundColor: colors.warningSoft },
  pendingText: { color: colors.warning },
  expired: { backgroundColor: '#EEF1F5' },
  expiredText: { color: colors.textMuted },
  failed: { backgroundColor: '#FEECEC' },
  failedText: { color: colors.danger },
});
