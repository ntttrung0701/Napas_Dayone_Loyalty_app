import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '../../shared/components/BottomNav';
import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab, UserVoucher, UserVoucherStatus } from '../../types';
import { formatPoints } from '../../utils/format';
import { VoucherFactory } from './domain/VoucherFactory';

type VoucherFilter = 'all' | UserVoucherStatus;

type VoucherWalletScreenProps = {
  activeTab: MainTab;
  vouchers: UserVoucher[];
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  onSelectVoucher: (voucher: UserVoucher) => void;
};

const filters: Array<{ id: VoucherFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Còn hạn' },
  { id: 'used', label: 'Đã dùng' },
  { id: 'expired', label: 'Hết hạn' },
];

export function VoucherWalletScreen({
  activeTab,
  vouchers,
  onBack,
  onNavigate,
  onSelectVoucher,
}: VoucherWalletScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<VoucherFilter>('all');

  const filteredVouchers = useMemo(
    () =>
      vouchers.filter((voucher) => {
        if (selectedFilter === 'all') return true;
        return VoucherFactory.getEffectiveStatus(voucher) === selectedFilter;
      }),
    [selectedFilter, vouchers],
  );

  const activeCount = vouchers.filter(
    (voucher) => VoucherFactory.getEffectiveStatus(voucher) === 'active',
  ).length;

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Kho voucher của tôi" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>VOUCHER KHẢ DỤNG</Text>
            <Text style={styles.summaryValue}>{activeCount}</Text>
          </View>

          <View style={styles.summaryIcon}>
            <Ionicons color={colors.white} name="ticket-outline" size={28} />
          </View>
        </View>

        <View style={styles.filterRow}>
          {filters.map((filter) => {
            const active = filter.id === selectedFilter;

            return (
              <Pressable
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                style={({ pressed }) => [
                  styles.filter,
                  active && styles.filterActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredVouchers.length ? (
          filteredVouchers.map((voucher) => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              onPress={() => onSelectVoucher(voucher)}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons color={colors.textMuted} name="file-tray-outline" size={42} />
            <Text style={styles.emptyTitle}>Bạn chưa có voucher nào</Text>
            <Text style={styles.emptyText}>
              Đổi điểm lấy ưu đãi để voucher xuất hiện trong Kho Voucher của tôi.
            </Text>

            <View style={styles.emptyButton}>
              <PrimaryButton label="Đổi ưu đãi ngay" onPress={() => onNavigate('offers')} />
            </View>
          </View>
        )}
      </ScrollView>

      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </View>
  );
}

function VoucherCard({ voucher, onPress }: { voucher: UserVoucher; onPress: () => void }) {
  const status = VoucherFactory.getEffectiveStatus(voucher);
  const statusLabel = VoucherFactory.getStatusLabel(voucher);
  const disabled = status !== 'active';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.voucherCard,
        disabled && styles.voucherCardMuted,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.voucherIcon}>
        <Ionicons color={colors.primary} name="ticket-outline" size={22} />
      </View>

      <View style={styles.voucherInfo}>
        <View style={styles.voucherTopRow}>
          <Text numberOfLines={1} style={styles.partner}>
            {voucher.partner}
          </Text>

          <View
            style={[
              styles.statusBadge,
              status === 'used' && styles.statusBadgeUsed,
              status === 'expired' && styles.statusBadgeExpired,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                status === 'used' && styles.statusTextUsed,
                status === 'expired' && styles.statusTextExpired,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text numberOfLines={2} style={styles.title}>
          {voucher.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Mã: {voucher.code}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{formatPoints(voucher.pointsUsed)} pts</Text>
        </View>

        <Text style={styles.expiryText}>Hạn sử dụng: {voucher.expiresLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 96,
  },
  pressed: {
    opacity: 0.72,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    backgroundColor: colors.primary,
    padding: 20,
  },
  summaryLabel: {
    color: '#CDE7FA',
    fontSize: 10,
    fontWeight: '900',
  },
  summaryValue: {
    marginTop: 6,
    color: colors.white,
    fontSize: 34,
    fontWeight: '900',
  },
  summaryIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 14,
  },
  filter: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingVertical: 9,
  },
  filterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  filterTextActive: {
    color: colors.primary,
  },
  voucherCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 14,
  },
  voucherCardMuted: {
    opacity: 0.72,
  },
  voucherIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  voucherInfo: {
    flex: 1,
    marginLeft: 12,
  },
  voucherTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partner: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  statusBadge: {
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeUsed: {
    backgroundColor: colors.primarySoft,
  },
  statusBadgeExpired: {
    backgroundColor: colors.warningSoft,
  },
  statusText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '900',
  },
  statusTextUsed: {
    color: colors.primary,
  },
  statusTextExpired: {
    color: colors.warning,
  },
  title: {
    marginTop: 7,
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  metaDot: {
    marginHorizontal: 6,
    color: colors.textMuted,
  },
  expiryText: {
    marginTop: 6,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 22,
  },
  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  emptyText: {
    marginTop: 7,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyButton: {
    width: '100%',
    marginTop: 16,
  },
});