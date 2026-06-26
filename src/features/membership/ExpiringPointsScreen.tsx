import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { AppScreen, Offer } from '../../types';
import { formatPoints } from '../../utils/format';
import { OfferMediaResolver } from '../offers/domain/OfferMediaResolver';

type ExpiringPointItem = {
  id: string;
  date: string;
  daysText: string;
  points: number;
};

type ExpiringPointsScreenProps = {
  totalExpiringPoints: number;
  expiringItems: ExpiringPointItem[];
  recommendedOffers: Offer[];
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  onSelectOffer: (offer: Offer) => void;
};

class ExpiringPointsPresenter {
  static getNearestExpiry(items: ExpiringPointItem[]) {
    return items[0]?.daysText ?? 'trong 30 ngày tới';
  }

  static getRecommendedOffers(offers: Offer[]) {
    return offers.slice(0, 2);
  }
}

export function ExpiringPointsScreen({
  totalExpiringPoints,
  expiringItems,
  recommendedOffers,
  onBack,
  onNavigate,
  onSelectOffer,
}: ExpiringPointsScreenProps) {
  const nearestExpiryText = ExpiringPointsPresenter.getNearestExpiry(expiringItems);
  const visibleOffers = ExpiringPointsPresenter.getRecommendedOffers(recommendedOffers);

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Điểm sắp hết hạn" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.alertCard}>
          <View pointerEvents="none" style={styles.alertDeco} />

          <View style={styles.alertHeader}>
            <Ionicons color="#FF8800" name="warning-outline" size={16} />
            <Text style={styles.alertLabel}>CẢNH BÁO ĐIỂM HẾT HẠN</Text>
          </View>

          <Text style={styles.alertPoints}>
            {formatPoints(totalExpiringPoints)} <Text style={styles.alertUnit}>điểm</Text>
          </Text>

          <Text style={styles.alertDesc}>
            Số điểm này sẽ chính thức hết hạn {nearestExpiryText}. Hãy đổi quà ngay để không
            lãng phí đặc quyền!
          </Text>

          <Pressable
            onPress={() => onNavigate('offers')}
            style={({ pressed }) => [styles.alertButton, pressed && styles.pressed]}
          >
            <Text style={styles.alertButtonText}>Đổi điểm ngay</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Chi tiết lộ trình hết hạn</Text>

        <View style={styles.expiryList}>
          {expiringItems.map((item) => (
            <View key={item.id} style={styles.expiryRow}>
              <View style={styles.expiryLeft}>
                <View style={styles.expiryIconBox}>
                  <Ionicons color="#E11900" name="time-outline" size={20} />
                </View>

                <View>
                  <Text style={styles.expiryDate}>{item.date}</Text>
                  <Text style={styles.expiryText}>{item.daysText}</Text>
                </View>
              </View>

              <Text style={styles.expiryPoints}>{formatPoints(item.points)} pts</Text>
            </View>
          ))}
        </View>

        <View style={styles.recommendHeader}>
          <Text style={styles.sectionTitleNoMargin}>Gợi ý đổi điểm phù hợp</Text>

          <Pressable onPress={() => onNavigate('offers')}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </Pressable>
        </View>

        <View style={styles.offerGrid}>
          {visibleOffers.map((offer, index) => {
            const imageSource = OfferMediaResolver.getImageSource(offer.media);

            return (
              <Pressable
                key={offer.id}
                onPress={() => onSelectOffer(offer)}
                style={({ pressed }) => [styles.offerCard, pressed && styles.pressed]}
              >
                <View style={styles.offerImageBox}>
                  {imageSource ? (
                    <Image source={imageSource} style={styles.offerImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.offerImageFallback, { backgroundColor: offer.accent }]}>
                      <Ionicons color={colors.white} name="gift-outline" size={34} />
                    </View>
                  )}

                  {index === 0 ? (
                    <View style={styles.hotBadge}>
                      <Text style={styles.hotBadgeText}>Hot</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.offerContent}>
                  <Text numberOfLines={2} style={styles.offerTitle}>
                    {offer.title}
                  </Text>

                  <View style={styles.offerCostRow}>
                    <Ionicons color={colors.success} name="checkmark-circle-outline" size={15} />
                    <Text style={styles.offerCost}>{formatPoints(offer.points)} điểm</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 42,
  },
  pressed: {
    opacity: 0.72,
  },
  alertCard: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8800',
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 20,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  alertDeco: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 112,
    height: 112,
    borderBottomLeftRadius: 112,
    backgroundColor: 'rgba(255,136,0,0.07)',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertLabel: {
    marginLeft: 6,
    color: '#FF8800',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  alertPoints: {
    color: colors.primaryDark,
    fontSize: 26,
    fontWeight: '900',
  },
  alertUnit: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  alertDesc: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  alertButton: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
  },
  alertButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  sectionTitle: {
    marginBottom: 10,
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '900',
  },
  sectionTitleNoMargin: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '900',
  },
  expiryList: {
    marginBottom: 22,
  },
  expiryRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  expiryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expiryIconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 19,
    backgroundColor: 'rgba(225,25,0,0.08)',
  },
  expiryDate: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  expiryText: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  expiryPoints: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '900',
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  offerGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  offerCard: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  offerImageBox: {
    position: 'relative',
    height: 98,
    backgroundColor: colors.primarySoft,
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  offerImageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  hotBadgeText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
  },
  offerContent: {
    minHeight: 86,
    justifyContent: 'space-between',
    padding: 12,
  },
  offerTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  offerCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerCost: {
    marginLeft: 5,
    color: colors.success,
    fontSize: 12,
    fontWeight: '900',
  },
});