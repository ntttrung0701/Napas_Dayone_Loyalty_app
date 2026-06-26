import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '../../shared/components/BottomNav';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab, MembershipOverview } from '../../types';
import { formatCurrency, formatPoints } from '../../utils/format';
import { MembershipService } from './domain/MembershipService';

type MembershipOverviewScreenProps = {
  activeTab: MainTab;
  overview: MembershipOverview;
  initialFocus?: 'top' | 'tier';
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
};

export function MembershipOverviewScreen({
  activeTab,
  overview,
  initialFocus = 'top',
  onBack,
  onNavigate,
}: MembershipOverviewScreenProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [tierCardY, setTierCardY] = useState<number | null>(null);

  const tierSummary = MembershipService.getTierSummary(overview);
  const maxMonthlyPoint = MembershipService.getMaxMonthlyPoint(overview);

  useEffect(() => {
    if (initialFocus !== 'tier' || tierCardY === null) return;

    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(tierCardY - 12, 0),
        animated: true,
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [initialFocus, tierCardY]);

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Tổng quan điểm" />

      <ScrollView
  ref={scrollViewRef}
  contentContainerStyle={styles.content}
  showsVerticalScrollIndicator={false}
>
        <View style={styles.titleBlock}>
          <Text style={styles.pageTitle}>Tổng quan điểm</Text>
          <Text style={styles.updatedText}>Cập nhật lúc {overview.lastUpdated}</Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceIcon}>
              <Ionicons color={colors.white} name="wallet-outline" size={18} />
            </View>

            <Text style={styles.balanceLabel}>ĐIỂM KHẢ DỤNG</Text>
          </View>

          <Text style={styles.balanceValue}>{formatPoints(overview.availablePoints)}</Text>

          <Text style={styles.balanceSubText}>
            Tương đương ~ {formatCurrency(overview.equivalentVnd)}
          </Text>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons color={colors.textMuted} name="hourglass-outline" size={24} />
            </View>

            <Text style={styles.statLabel}>Điểm đang chờ</Text>
            <Text style={styles.statValue}>+{formatPoints(overview.pendingPoints)}</Text>
          </View>

          <View style={[styles.statCard, styles.expiringCard]}>
            <View style={[styles.statIcon, styles.expiringIcon]}>
              <Ionicons color={colors.danger} name="warning-outline" size={24} />
            </View>

            <Text style={[styles.statLabel, styles.expiringLabel]}>Điểm sắp hết hạn</Text>
            <Text style={styles.expiringValue}>-{formatPoints(overview.expiringPoints)}</Text>
            <Text style={styles.expiringSubText}>{overview.expiringLabel}</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Biến động 6 tháng gần nhất</Text>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.earnedDot]} />
              <Text style={styles.legendText}>Tích lũy</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.usedDot]} />
              <Text style={styles.legendText}>Đã dùng</Text>
            </View>
          </View>

          <View style={styles.chartArea}>
            <View style={[styles.chartGuide, { bottom: 86 }]} />
            <View style={[styles.chartGuide, { bottom: 43 }]} />

            {overview.monthlyPoints.map((point) => {
              const earnedHeight = Math.max((point.earned / maxMonthlyPoint) * 105, 8);
              const usedHeight = Math.max((point.used / maxMonthlyPoint) * 105, 6);
              const activeMonth = point.month === 'T10';

              return (
                <View key={point.month} style={styles.monthGroup}>
                  <View style={styles.barRow}>
                    <View style={[styles.earnedBar, { height: earnedHeight }]} />
                    <View style={[styles.usedBar, { height: usedHeight }]} />
                  </View>

                  <Text style={[styles.monthText, activeMonth && styles.monthTextActive]}>
                    {point.month}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View
  onLayout={(event) => setTierCardY(event.nativeEvent.layout.y)}
  style={styles.tierCard}
>
          <View style={styles.tierHeader}>
            <View>
              <Text style={styles.sectionTitle}>Tiến trình hạng</Text>
              <Text style={styles.tierText}>
                {tierSummary.currentTier.label} → {tierSummary.nextTier.label}
              </Text>
            </View>

            <Text style={styles.progressPercent}>{tierSummary.progressPercent}%</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${tierSummary.progressPercent}%` }]} />
          </View>

          <Text style={styles.tierHint}>
            Cần thêm {formatCurrency(tierSummary.remainingSpend)} giao dịch hợp lệ để lên hạng{' '}
            {tierSummary.nextTier.label}.
          </Text>
        </View>

        <SummaryRow
          icon="add-circle-outline"
          iconColor={colors.success}
          label="Tổng điểm đã tích lũy"
          value={formatPoints(overview.totalEarnedPoints)}
        />

        <SummaryRow
          icon="remove-circle-outline"
          iconColor={colors.primary}
          label="Tổng điểm đã sử dụng"
          value={formatPoints(overview.totalUsedPoints)}
        />

        <View style={styles.benefitCard}>
          <Text style={styles.sectionTitle}>Quyền lợi hạng {tierSummary.currentTier.label}</Text>

          {tierSummary.currentTier.benefits.map((benefit) => (
            <View key={benefit} style={styles.benefitRow}>
              <Ionicons color={colors.success} name="checkmark-circle-outline" size={18} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => onNavigate('history')}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.white} name="time-outline" size={20} />
          <Text style={styles.primaryButtonText}>Xem lịch sử điểm</Text>
        </Pressable>

        <Pressable
  onPress={() => onNavigate('expiring-points')}
  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
>
  <Ionicons color={colors.text} name="calendar-outline" size={20} />
  <Text style={styles.secondaryButtonText}>Xem điểm sắp hết hạn</Text>
</Pressable>
      </ScrollView>

      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </View>
  );
}

function SummaryRow({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIcon}>
        <Ionicons color={iconColor} name={icon} size={23} />
      </View>

      <View style={styles.summaryCopy}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>

      <Ionicons color={colors.textMuted} name="chevron-forward" size={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 108,
  },
  pressed: {
    opacity: 0.74,
  },
  titleBlock: {
    marginBottom: 18,
  },
  pageTitle: {
    color: colors.primaryDark,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  updatedText: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  balanceCard: {
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    padding: 24,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  balanceLabel: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  balanceValue: {
    marginTop: 20,
    color: colors.white,
    fontSize: 32,
    fontWeight: '900',
  },
  balanceSubText: {
    marginTop: 24,
    color: '#DCEBFA',
    fontSize: 13,
    fontWeight: '600',
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  statCard: {
    width: '48%',
    minHeight: 150,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: 20,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  expiringCard: {
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  expiringIcon: {
    backgroundColor: '#FEE2E2',
  },
  statLabel: {
    marginTop: 22,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  statValue: {
    marginTop: 8,
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  expiringLabel: {
    color: colors.danger,
  },
  expiringValue: {
    marginTop: 8,
    color: colors.danger,
    fontSize: 20,
    fontWeight: '900',
  },
  expiringSubText: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chartCard: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 20,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  sectionTitle: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900',
  },
  legendRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  legendDot: {
    width: 12,
    height: 12,
    marginRight: 8,
    borderRadius: 6,
  },
  earnedDot: {
    backgroundColor: colors.success,
  },
  usedDot: {
    backgroundColor: '#D9DDE3',
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  chartArea: {
    position: 'relative',
    height: 184,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
  },
  chartGuide: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  monthGroup: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 42,
  },
  barRow: {
    height: 116,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  earnedBar: {
    width: 17,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: colors.success,
  },
  usedBar: {
    width: 17,
    marginLeft: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: '#D9DDE3',
  },
  monthText: {
    marginTop: 14,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  monthTextActive: {
    color: colors.primaryDark,
    fontWeight: '900',
  },
  tierCard: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 20,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierText: {
    marginTop: 6,
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  progressPercent: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '900',
  },
  progressTrack: {
    height: 9,
    overflow: 'hidden',
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  tierHint: {
    marginTop: 14,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  summaryRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
  },
  summaryCopy: {
    flex: 1,
    marginLeft: 16,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  benefitCard: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
  },
  benefitText: {
    flex: 1,
    marginLeft: 10,
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: colors.primaryDark,
  },
  primaryButtonText: {
    marginLeft: 10,
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.textMuted,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    marginLeft: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
});