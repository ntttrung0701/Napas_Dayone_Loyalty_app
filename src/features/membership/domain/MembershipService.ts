import type {
  MembershipOverview,
  MembershipTierCode,
  MembershipTierConfig,
  Transaction,
} from '../../../types';

const tiers: MembershipTierConfig[] = [
  {
    code: 'member',
    label: 'Thành viên',
    minSpend: 0,
    maxSpend: 50_000_000,
    multiplier: 1,
    benefits: ['Tích điểm tiêu chuẩn', 'Nhận ưu đãi cơ bản'],
  },
  {
    code: 'silver',
    label: 'Bạc',
    minSpend: 50_000_000,
    maxSpend: 150_000_000,
    multiplier: 1.1,
    benefits: ['Tích điểm x1.1', 'Ưu đãi theo chiến dịch'],
  },
  {
    code: 'gold',
    label: 'Vàng',
    minSpend: 150_000_000,
    maxSpend: 500_000_000,
    multiplier: 1.5,
    benefits: ['Tích điểm x1.5', 'Ưu đãi độc quyền Hạng Vàng', 'Hỗ trợ ưu tiên'],
  },
  {
    code: 'platinum',
    label: 'Bạch kim',
    minSpend: 500_000_000,
    multiplier: 2,
    benefits: ['Tích điểm x2', 'Ưu đãi cao cấp', 'Chăm sóc ưu tiên'],
  },
];

export class MembershipService {
  static getTier(code: MembershipTierCode): MembershipTierConfig {
    return tiers.find((tier) => tier.code === code) ?? tiers[0]!;
  }

  static getAllTiers(): MembershipTierConfig[] {
    return tiers;
  }

  static getProgressPercent(overview: MembershipOverview) {
    if (overview.tierTargetSpend <= 0) return 0;

    return Math.min(
      100,
      Math.round((overview.tierPeriodSpend / overview.tierTargetSpend) * 100),
    );
  }

  static getRemainingSpend(overview: MembershipOverview) {
    return Math.max(overview.tierTargetSpend - overview.tierPeriodSpend, 0);
  }

  static getEarnedTotal(transactions: Transaction[]) {
    return transactions
      .filter((transaction) => transaction.points > 0)
      .reduce((total, transaction) => total + transaction.points, 0);
  }

  static getUsedTotal(transactions: Transaction[]) {
    return Math.abs(
      transactions
        .filter((transaction) => transaction.points < 0)
        .reduce((total, transaction) => total + transaction.points, 0),
    );
  }

  static getMaxMonthlyPoint(overview: MembershipOverview) {
    return Math.max(
      ...overview.monthlyPoints.flatMap((point) => [point.earned, point.used]),
      1,
    );
  }

  static getTierSummary(overview: MembershipOverview) {
    const currentTier = this.getTier(overview.currentTier);
    const nextTier = this.getTier(overview.nextTier);
    const progressPercent = this.getProgressPercent(overview);
    const remainingSpend = this.getRemainingSpend(overview);

    return {
      currentTier,
      nextTier,
      progressPercent,
      remainingSpend,
    };
  }
}