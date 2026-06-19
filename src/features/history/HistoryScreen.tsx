import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '../../shared/components/BottomNav';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { TransactionRow } from '../../shared/components/TransactionRow';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab, Transaction } from '../../types';
import { formatPoints } from '../../utils/format';
import { TransactionLedger, type TransactionDirection } from './domain/TransactionLedger';

type HistoryScreenProps = {
  activeTab: MainTab;
  transactions: Transaction[];
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
};

const historyFilters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'earned', label: 'Nhận điểm' },
  { id: 'spent', label: 'Sử dụng' },
] as const;
type HistoryFilter = (typeof historyFilters)[number]['id'] & TransactionDirection;

export function HistoryScreen({
  activeTab,
  transactions,
  onBack,
  onNavigate,
}: HistoryScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<HistoryFilter>('all');
  const ledger = useMemo(() => new TransactionLedger(transactions), [transactions]);
  const filteredTransactions = useMemo(() => ledger.filter(selectedFilter), [ledger, selectedFilter]);

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Lịch sử điểm" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>ĐÃ NHẬN</Text>
            <Text style={[styles.summaryValue, styles.earned]}>+{formatPoints(ledger.earnedTotal)} pts</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>ĐÃ SỬ DỤNG</Text>
            <Text style={[styles.summaryValue, styles.spent]}>-{formatPoints(ledger.spentTotal)} pts</Text>
          </View>
        </View>

        <View accessibilityRole="tablist" style={styles.filters}>
          {historyFilters.map((filter) => {
            const active = filter.id === selectedFilter;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                style={({ pressed }) => [
                  styles.filter,
                  active && styles.filterActive,
                  pressed && styles.filterPressed,
                ]}
              >
                <Text style={[styles.filterText, active && styles.filterActiveText]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.listCard}>
          <Text style={styles.month}>HOẠT ĐỘNG GẦN ĐÂY</Text>
          {filteredTransactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}

        </View>
      </ScrollView>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    paddingBottom: 26,
  },
  summary: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: colors.primaryDark,
    padding: 20,
  },
  summaryBlock: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  summaryLabel: {
    color: '#B9CFE1',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  summaryValue: {
    marginTop: 7,
    fontSize: 17,
    fontWeight: '900',
  },
  earned: {
    color: '#5EE0A8',
  },
  spent: {
    color: '#FFD27C',
  },
  filters: {
    flexDirection: 'row',
    marginVertical: 18,
  },
  filter: {
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  filterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterPressed: {
    opacity: 0.75,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  filterActiveText: {
    color: colors.white,
    fontWeight: '800',
  },
  listCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
  },
  month: {
    marginBottom: 4,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
