import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import type { Transaction } from '../../types';
import { formatPoints } from '../../utils/format';

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const positive = transaction.points >= 0;

  return (
    <View style={styles.row}>
      <View style={[styles.icon, positive ? styles.positiveIcon : styles.negativeIcon]}>
        <Ionicons
          color={positive ? colors.success : colors.warning}
          name={positive ? 'arrow-down' : 'arrow-up'}
          size={19}
        />
      </View>
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>
          {transaction.title}
        </Text>
        <Text style={styles.subtitle}>{transaction.subtitle}</Text>
        <Text style={styles.date}>{transaction.date}</Text>
      </View>
      <Text style={[styles.points, positive ? styles.positive : styles.negative]}>
        {positive ? '+' : ''}
        {formatPoints(transaction.points)} pts
      </Text>
    </View>
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
    fontSize: 12,
    fontWeight: '800',
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.warning,
  },
});
