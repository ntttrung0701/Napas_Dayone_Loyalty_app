import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfferMediaResolver } from './domain/OfferMediaResolver';
import { offers, partnerBrands } from '../../mock/data';
import { BottomNav } from '../../shared/components/BottomNav';
import { HeaderIconButton } from '../../shared/components/HeaderIconButton';
import { getBottomNavOffset } from '../../shared/layout';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab, Offer, PartnerBrand } from '../../types';
import { formatPoints } from '../../utils/format';
import { OfferCatalog } from './domain/OfferCatalog';
import { PartnerBrandCatalog } from './domain/PartnerBrandCatalog';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { OfferMediaFrame } from './components/OfferMediaFrame';

type IconName = ComponentProps<typeof Ionicons>['name'];

type OffersScreenProps = {
  activeTab: MainTab;
  points: number;
  unreadNotifications: number;
  onNavigate: (screen: AppScreen) => void;
  onSelectOffer: (offer: Offer) => void;
};

type OfferVisualConfig = {
  logoText: string;
  logoBackground: string;
  logoColor: string;
  visualIcon: IconName;
  visualGradient: [string, string];
};

const categories = ['Tất cả', 'Voucher', 'Hoàn tiền', 'Quà tặng'] as const;
type OfferCategory = (typeof categories)[number];

const defaultOfferVisual: OfferVisualConfig = {
  logoText: 'N',
  logoBackground: colors.white,
  logoColor: colors.primary,
  visualIcon: 'gift-outline',
  visualGradient: ['#0E4B83', '#1277C8'],
};

const offerVisualConfigs: Record<string, OfferVisualConfig> = {
  'winmart-100': {
    logoText: 'WinMart',
    logoBackground: colors.white,
    logoColor: '#D71920',
    visualIcon: 'basket-outline',
    visualGradient: ['#F3FBF3', '#DDF3E2'],
  },
  'starbucks-50': {
    logoText: '★',
    logoBackground: colors.white,
    logoColor: '#00704A',
    visualIcon: 'cafe-outline',
    visualGradient: ['#17120D', '#8B623F'],
  },
  'phuclong-20': {
    logoText: 'PL',
    logoBackground: colors.white,
    logoColor: '#1B6B3A',
    visualIcon: 'leaf-outline',
    visualGradient: ['#6B472E', '#B3865B'],
  },
  'cgv-2d': {
    logoText: 'CGV',
    logoBackground: colors.white,
    logoColor: '#E1322D',
    visualIcon: 'film-outline',
    visualGradient: ['#4A0D12', '#C21E2B'],
  },
};

const offerCatalog = new OfferCatalog(offers);
const partnerBrandCatalog = new PartnerBrandCatalog(partnerBrands);
const featuredPartnerBrands = partnerBrandCatalog.getFeaturedBrands();

type PartnerLogoBadgeProps = {
  brand?: PartnerBrand;
  compact?: boolean;
  fallbackVisual?: OfferVisualConfig;
};

function PartnerLogoBadge({
  brand,
  compact = false,
  fallbackVisual = defaultOfferVisual,
}: PartnerLogoBadgeProps) {
  const logo = brand?.logo;
  const imageSource = OfferMediaResolver.getPartnerLogoSource(logo);
  const label = logo?.label ?? fallbackVisual.logoText;

  return (
    <View
      style={[
        compact ? styles.offerLogoBadge : styles.brandLogo,
        {
          backgroundColor: logo?.backgroundColor ?? fallbackVisual.logoBackground,
          borderColor: logo?.borderColor ?? 'rgba(255,255,255,0.72)',
        },
      ]}
    >
      {imageSource ? (
        <Image
          resizeMode="cover"
          source={imageSource}
          style={compact ? styles.offerLogoImage : styles.brandLogoImage}
        />
      ) : (
        <Text
          adjustsFontSizeToFit
          maxFontSizeMultiplier={1}
          numberOfLines={1}
          style={[
            compact ? styles.offerLogoText : styles.brandLogoText,
            { color: logo?.textColor ?? fallbackVisual.logoColor },
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

export function OffersScreen({
  activeTab,
  points,
  unreadNotifications,
  onNavigate,
  onSelectOffer,
}: OffersScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOffers = useMemo(
    () => offerCatalog.query(selectedCategory, searchQuery),
    [searchQuery, selectedCategory],
  );

  return (
    <View style={styles.root}>
      <ScreenHeader
        rightContent={
          <HeaderIconButton
            accessibilityLabel={`${unreadNotifications} thông báo chưa đọc`}
            badgeCount={unreadNotifications}
            icon="notifications-outline"
            onPress={() => onNavigate('notifications')}
          />
        }
        title="Ưu đãi & quà tặng"
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getBottomNavOffset(insets.bottom) + 22 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topArea}>
          <View style={styles.searchBox}>
            <Ionicons color={colors.textMuted} name="search-outline" size={25} />

            <TextInput
              autoCapitalize="none"
              maxFontSizeMultiplier={1.08}
              onChangeText={setSearchQuery}
              placeholder="Tìm ưu đãi, đối tác..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              value={searchQuery}
            />

            {searchQuery ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Ionicons color={colors.textMuted} name="close-circle" size={20} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigate('voucher-wallet')}
            style={({ pressed }) => [
              styles.voucherBannerTouchable,
              pressed && styles.voucherBannerPressed,
            ]}
          >
            <LinearGradient
              colors={['#092E63', '#006FCA']}
              end={{ x: 1, y: 0.5 }}
              start={{ x: 0, y: 0.5 }}
              style={styles.voucherBanner}
            >
              <View style={styles.voucherBannerCopy}>
                <Text
                  maxFontSizeMultiplier={1.08}
                  numberOfLines={1}
                  style={styles.voucherBannerTitle}
                >
                  Voucher của tôi
                </Text>

                <Text
                  maxFontSizeMultiplier={1.08}
                  numberOfLines={2}
                  style={styles.voucherBannerSubtitle}
                >
                  Sử dụng voucher của bạn để đổi những ưu đãi
                </Text>
              </View>

              <Ionicons color={colors.white} name="chevron-forward" size={34} />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.bodyArea}>
          <View style={styles.featuredBrandsSection}>
            <Text maxFontSizeMultiplier={1.08} style={styles.sectionTitle}>
              Thương hiệu nổi bật
            </Text>

            <ScrollView
              horizontal
              contentContainerStyle={styles.brandRow}
              showsHorizontalScrollIndicator={false}
            >
              {featuredPartnerBrands.map((brand) => (
                <Pressable
                  key={brand.id}
                  accessibilityRole="button"
                  onPress={() => setSearchQuery(partnerBrandCatalog.getSearchQuery(brand))}
                  style={({ pressed }) => [styles.brandItem, pressed && styles.pressed]}
                >
                  <PartnerLogoBadge brand={brand} />

                  <Text
                    maxFontSizeMultiplier={1.05}
                    numberOfLines={1}
                    style={styles.brandName}
                  >
                    {brand.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <Text maxFontSizeMultiplier={1.08} style={styles.sectionTitle}>
            Ưu đãi và quà tặng
          </Text>

          <ScrollView
            horizontal
            contentContainerStyle={styles.filterRow}
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category) => {
              const active = category === selectedCategory;

              return (
                <Pressable
                  key={category}
                  accessibilityRole="button"
                  onPress={() => setSelectedCategory(category)}
                  style={({ pressed }) => [
                    styles.filter,
                    active && styles.filterActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    maxFontSizeMultiplier={1.05}
                    numberOfLines={1}
                    style={[styles.filterText, active && styles.filterTextActive]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.offersGrid}>
            {filteredOffers.map((offer) => {
              const affordable = points >= offer.points;
              const hasImage = OfferMediaResolver.hasImage(offer.media);
              const visual = offerVisualConfigs[offer.id] ?? defaultOfferVisual;
              const brand = partnerBrandCatalog.findForOffer(offer);

              return (
                <Pressable
                  key={offer.id}
                  accessibilityRole="button"
                  onPress={() => onSelectOffer(offer)}
                  style={({ pressed }) => [
                    styles.offerCard,
                    pressed && styles.offerCardPressed,
                  ]}
                >
                  <OfferMediaFrame
  borderRadius={0}
  fallbackColor={offer.accent}
  height={98}
  media={offer.media}
  overlayOpacity={0}
  style={styles.offerVisual}
>
                    {!hasImage ? (
                      <LinearGradient
                        colors={visual.visualGradient}
                        end={{ x: 1, y: 1 }}
                        start={{ x: 0, y: 0 }}
                        style={styles.mockVisual}
                      >
                        <View style={styles.mockVisualHalo} />
                        <Ionicons
  color="rgba(255,255,255,0.88)"
  name={visual.visualIcon}
  size={32}
/>
                      </LinearGradient>
                    ) : null}

                    <PartnerLogoBadge brand={brand} compact fallbackVisual={visual} />
                  </OfferMediaFrame>

                  <View style={styles.offerInfo}>
                    <Text
                      maxFontSizeMultiplier={1.08}
                      numberOfLines={1}
                      style={styles.offerTitle}
                    >
                      {offer.title}
                    </Text>

                    <Text
                      maxFontSizeMultiplier={1.08}
                      numberOfLines={1}
                      style={[styles.points, !affordable && styles.pointsDisabled]}
                    >
                      {formatPoints(offer.points)} pts
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {!filteredOffers.length ? (
            <View style={styles.emptyState}>
              <Ionicons color={colors.textMuted} name="gift-outline" size={42} />
              <Text style={styles.emptyTitle}>Không tìm thấy ưu đãi</Text>
              <Text style={styles.emptyText}>Hãy thử từ khóa hoặc danh mục khác.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.72,
  },
  content: {
    paddingTop: 0,
  },
  topArea: {
  backgroundColor: colors.background,
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 20,
},

bodyArea: {
  backgroundColor: colors.surface,
  paddingHorizontal: 20,
  paddingTop: 20,
},
  searchBox: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 32,
    backgroundColor: colors.surface,
    paddingHorizontal: 26,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    minHeight: 60,
    marginLeft: 14,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 18,
    fontWeight: '500',
  },
  clearSearchButton: {
    marginLeft: 8,
  },
  voucherBannerTouchable: {
    borderRadius: 28,
    shadowColor: '#0A3769',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 9,
  },
  voucherBannerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  voucherBanner: {
    minHeight: 124,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 25,
  },
  voucherBannerCopy: {
    flex: 1,
    paddingRight: 18,
  },
  voucherBannerTitle: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.35,
  },
  voucherBannerSubtitle: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 23,
  },
  featuredBrandsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
  color: colors.text,
  fontSize: 21,
  fontWeight: '900',
  letterSpacing: -0.25,
},
  brandRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  paddingTop: 12,
  paddingRight: 6,
},

  brandItem: {
    width: 64,
    alignItems: 'center',
    marginRight: 6,
  },
  brandLogo: {
  width: 52,
  height: 52,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderRadius: 26,
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.4,
  shadowRadius: 6,
  elevation: 1,
},
  brandLogoText: {
  paddingHorizontal: 4,
  fontSize: 14,
  fontWeight: '900',
},
  brandLogoImage: {
  width: '100%',
  height: '100%',
  borderRadius: 26,
},
  brandName: {
  marginTop: 7,
  color: colors.text,
  fontSize: 11,
  fontWeight: '600',
  textAlign: 'center',
},
  filterRow: {
  paddingTop: 14,
  paddingBottom: 18,
  paddingRight: 4,
},

filter: {
  minHeight: 40,
  justifyContent: 'center',
  marginRight: 10,
  borderRadius: 999,
  backgroundColor: '#EDF2F7',
  paddingHorizontal: 18,
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
},

filterText: {
  color: colors.text,
  fontSize: 12,
  fontWeight: '800',
},
  filterActive: {
    backgroundColor: '#0B4C84',
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '900',
  },
  offersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  offerCard: {
  width: '48%',
  overflow: 'hidden',
  marginBottom: 18,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 16,
  backgroundColor: colors.surface,
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.07,
  shadowRadius: 10,
  elevation: 3,
},
  offerCardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  offerVisual: {
  overflow: 'hidden',
  height: 98,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
},
  mockVisual: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockVisualHalo: {
    position: 'absolute',
    right: -18,
    bottom: -30,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  offerLogoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  offerLogoImage: {
    width: '100%',
    height: '100%',
  },
  offerLogoText: {
    paddingHorizontal: 4,
    fontSize: 15,
    fontWeight: '900',
  },
offerInfo: {
  minHeight: 72,
  paddingHorizontal: 12,
  paddingTop: 10,
  paddingBottom: 12,
},
  offerTitle: {
  color: colors.text,
  fontSize: 14,
  fontWeight: '900',
  letterSpacing: -0.15,
  lineHeight: 18,
},
  points: {
  marginTop: 7,
  color: colors.success,
  fontSize: 15,
  fontWeight: '900',
  letterSpacing: -0.1,
},
  pointsDisabled: {
    color: colors.danger,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 34,
  },
  emptyTitle: {
    marginTop: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 11,
  },
});
