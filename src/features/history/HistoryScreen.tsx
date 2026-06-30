import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '../../shared/components/BottomNav';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { TransactionRow } from '../../shared/components/TransactionRow';
import { getBottomNavOffset } from '../../shared/layout';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab, Transaction } from '../../types';
import { TransactionLedger, type HistoryFilter } from './domain/TransactionLedger';

type HistoryScreenProps = {
  activeTab?: MainTab;
  transactions: Transaction[];
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  onSelectTransaction: (transaction: Transaction) => void;
};

const historyFilters: ReadonlyArray<{ id: HistoryFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'earned', label: 'Tích điểm' },
  { id: 'used', label: 'Sử dụng điểm' },
  { id: 'redeemed', label: 'Đổi voucher' },
  { id: 'transferred', label: 'Chuyển điểm' },
  { id: 'expired', label: 'Hết hạn' },
  { id: 'pending', label: 'Đang chờ' },
  { id: 'failed', label: 'Thất bại' },
];

export function HistoryScreen({
  activeTab,
  transactions,
  onBack,
  onNavigate,
  onSelectTransaction,
}: HistoryScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<HistoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const ledger = useMemo(() => new TransactionLedger(transactions), [transactions]);
  const summary = useMemo(() => ledger.getSummary(), [ledger]);
  const groups = useMemo(
    () => ledger.group(ledger.query(selectedFilter, searchQuery)),
    [ledger, searchQuery, selectedFilter],
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedFilter('all');
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
  onBack={onBack}
  title="Lịch sử điểm"
/>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getBottomNavOffset(insets.bottom) + 18 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Lịch sử giao dịch</Text>

        <View style={styles.searchBox}>
          <Ionicons color={colors.textMuted} name="search-outline" size={20} />
          <TextInput
            accessibilityLabel="Tìm kiếm giao dịch"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchQuery}
            placeholder="Tìm theo đối tác , mã giao dịch , loại điểm ,..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
          />
          {searchQuery ? (
            <Pressable
              accessibilityLabel="Xóa nội dung tìm kiếm"
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons color={colors.textMuted} name="close-circle" size={20} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          accessibilityRole="tablist"
          contentContainerStyle={styles.filters}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
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
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterText, active && styles.filterActiveText]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {groups.length ? (
          groups.map((group) => (
            <View key={group.key} style={styles.group}>
              <Text style={styles.month}>{group.label}</Text>
              <View style={styles.listCard}>
                {group.transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    onPress={onSelectTransaction}
                    transaction={transaction}
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons color={colors.primary} name="receipt-outline" size={28} />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy giao dịch</Text>
            <Text style={styles.emptyDescription}>
              Hãy thử từ khóa khác hoặc xóa bộ lọc hiện tại.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={resetFilters}
              style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
            >
              <Text style={styles.resetButtonText}>Xóa bộ lọc</Text>
            </Pressable>
          </View>
        )}
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
  pressed: {
    opacity: 0.68,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  pageTitle: {
    marginBottom: 12,
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: '900',
  },
  searchBox: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    marginHorizontal: 9,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
  },
  filters: {
    paddingVertical: 16,
    paddingRight: 6,
  },
  filter: {
    minHeight: 38,
    justifyContent: 'center',
    marginRight: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 17,
  },
  filterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  filterActiveText: {
    color: colors.white,
    fontWeight: '800',
  },
  group: {
    marginBottom: 20,
  },
  month: {
    marginBottom: 10,
    marginLeft: 4,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  listCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: colors.primarySoft,
  },
  emptyTitle: {
    marginTop: 14,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyDescription: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
});
