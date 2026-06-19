import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { offers } from '../../mock/data';
import { BottomNav } from '../../shared/components/BottomNav';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab, Offer } from '../../types';
import { formatPoints } from '../../utils/format';
import { OfferCatalog } from './domain/OfferCatalog';

type OffersScreenProps = {
  activeTab: MainTab;
  points: number;
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  onSelectOffer: (offer: Offer) => void;
};

const categories = ['Tất cả', 'Ẩm thực', 'Mua sắm', 'Du lịch'] as const;
type OfferCategory = (typeof categories)[number];
const offerCatalog = new OfferCatalog(offers);

export function OffersScreen({
  activeTab,
  points,
  onBack,
  onNavigate,
  onSelectOffer,
}: OffersScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory>('Tất cả');
  const filteredOffers = useMemo(
    () => offerCatalog.filterByCategory(selectedCategory),
    [selectedCategory],
  );

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} rightLabel={`${formatPoints(points)} pts`} title="Kho ưu đãi" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>ĐẶC QUYỀN HỘI VIÊN</Text>
          <Text style={styles.heroTitle}>Dùng điểm cho những điều bạn thích</Text>
          <Text style={styles.heroText}>Chọn một danh mục và đổi ưu đãi ngay bằng số điểm hiện có.</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.filterRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => {
            const active = category === selectedCategory;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={({ pressed }) => [
                  styles.filter,
                  active && styles.filterActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{category}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredOffers.map((offer) => {
          const affordable = points >= offer.points;
          return (
            <Pressable
              accessibilityHint="Mở chi tiết ưu đãi"
              accessibilityRole="button"
              key={offer.id}
              onPress={() => onSelectOffer(offer)}
              style={({ pressed }) => [styles.offerCard, pressed && styles.offerCardPressed]}
            >
              <View style={[styles.offerVisual, { backgroundColor: offer.accent }]}>
                <Text style={styles.offerInitial}>{offer.partner.slice(0, 1)}</Text>
                <Text style={styles.offerCategory}>{offer.category.toUpperCase()}</Text>
              </View>
              <View style={styles.offerInfo}>
                <Text style={styles.partner}>{offer.partner}</Text>
                <Text numberOfLines={2} style={styles.offerTitle}>
                  {offer.title}
                </Text>
                <View style={styles.offerFooter}>
                  <Text style={styles.points}>{formatPoints(offer.points)} pts</Text>
                  <Text style={[styles.status, !affordable && styles.statusDisabled]}>
                    {affordable ? 'Có thể đổi' : 'Chưa đủ điểm'}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
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
    paddingBottom: 24,
  },
  hero: {
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: colors.primaryDark,
    padding: 22,
  },
  eyebrow: {
    color: '#91D2FF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    maxWidth: 290,
    marginTop: 8,
    color: colors.white,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 29,
  },
  heroText: {
    maxWidth: 300,
    marginTop: 8,
    color: '#C7D9E9',
    fontSize: 12,
    lineHeight: 18,
  },
  filterRow: {
    paddingVertical: 18,
  },
  filter: {
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.75,
  },
  offerCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 12,
  },
  offerCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.995 }],
  },
  offerVisual: {
    width: 92,
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  offerInitial: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '900',
  },
  offerCategory: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  offerInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 14,
  },
  partner: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  offerTitle: {
    marginTop: 4,
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  offerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  points: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  status: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  statusDisabled: {
    color: colors.warning,
  },
});
