import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfferMediaResolver } from './domain/OfferMediaResolver';
import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { getBottomNavOffset, getScreenBottomPadding } from '../../shared/layout';
import { colors } from '../../theme/colors';
import type { Offer } from '../../types';
import { formatPoints } from '../../utils/format';
import { OfferMediaFrame } from './components/OfferMediaFrame';

type OfferDetailScreenProps = {
  offer: Offer;
  points: number;
  onBack: () => void;
  onRedeem: (offer: Offer) => void;
};

export function OfferDetailScreen({ offer, points, onBack, onRedeem }: OfferDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const affordable = points >= offer.points;
  const imageSource = OfferMediaResolver.getImageSource(offer.media);

  const confirmRedemption = () => {
    Alert.alert(
      'Xác nhận đổi quà',
      `Dùng ${formatPoints(offer.points)} điểm để đổi ${offer.title}?`,
      [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => onRedeem(offer) },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Chi tiết ưu đãi" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getBottomNavOffset(insets.bottom) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, !imageSource && { backgroundColor: offer.accent }]}>
  {imageSource ? (
    <>
      <Image source={imageSource} style={styles.heroImage} resizeMode="cover" />
      <View style={styles.heroOverlay} />
    </>
  ) : null}

  <OfferMediaFrame
  fallbackColor={offer.accent}
  height={250}
  media={offer.media}
  overlayOpacity={0.34}
  style={styles.hero}
>
  <View style={styles.heroTextLayer}>
    <Text style={styles.category}>{offer.category.toUpperCase()}</Text>
    <Text style={styles.heroTitle}>{offer.title}</Text>
    <Text style={styles.partner}>{offer.partner}</Text>
  </View>
</OfferMediaFrame>
</View>

        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.metaLabel}>ĐIỂM CẦN ĐỔI</Text>
            <Text style={styles.metaValue}>{formatPoints(offer.points)} pts</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.metaLabel}>SỐ DƯ HIỆN TẠI</Text>
            <Text style={styles.metaValue}>{formatPoints(points)} pts</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MÔ TẢ ƯU ĐÃI</Text>
          <Text style={styles.body}>{offer.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ĐIỀU KIỆN ÁP DỤNG</Text>
          <Text style={styles.bullet}>• Hạn sử dụng: {offer.expiresAt}.</Text>
          <Text style={styles.bullet}>• Mỗi hóa đơn áp dụng tối đa một voucher.</Text>
          <Text style={styles.bullet}>• Không quy đổi thành tiền mặt.</Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            {affordable
              ? `Sau khi đổi, bạn còn ${formatPoints(points - offer.points)} điểm.`
              : `Bạn còn thiếu ${formatPoints(offer.points - points)} điểm để đổi ưu đãi này.`}
          </Text>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: getScreenBottomPadding(insets.bottom, 8) }]}>
        <PrimaryButton
          disabled={!affordable}
          label={affordable ? `Đổi ${formatPoints(offer.points)} điểm` : 'Chưa đủ điểm'}
          onPress={confirmRedemption}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 24,
  },
 hero: {
  borderRadius: 0,
},
heroImage: {
  ...StyleSheet.absoluteFillObject,
  width: '100%',
  height: '100%',
},

heroOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.32)',
},

heroTextLayer: {
  flex: 1,
  justifyContent: 'flex-end',
  padding: 24,
},
  category: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitle: {
    maxWidth: 300,
    marginTop: 8,
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  partner: {
    marginTop: 8,
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    margin: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 18,
  },
  divider: {
    width: 1,
    height: 38,
    backgroundColor: colors.border,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  metaValue: {
    marginTop: 5,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  section: {
    marginBottom: 14,
    marginHorizontal: 18,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 18,
  },
  sectionTitle: {
    marginBottom: 10,
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  body: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 21,
  },
  bullet: {
    marginBottom: 7,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  notice: {
    marginHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.warningSoft,
    padding: 14,
  },
  noticeText: {
    textAlign: 'center',
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
});
