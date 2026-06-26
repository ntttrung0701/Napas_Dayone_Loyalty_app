import Ionicons from '@expo/vector-icons/Ionicons';
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
import { OfferMediaResolver } from './domain/OfferMediaResolver';
import { offers } from '../../mock/data';
import { BottomNav } from '../../shared/components/BottomNav';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab, Offer } from '../../types';
import { formatPoints } from '../../utils/format';
import { OfferCatalog } from './domain/OfferCatalog';
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

const categories = ['Tất cả', 'Voucher', 'Hoàn tiền', 'Quà tặng'] as const;
type OfferCategory = (typeof categories)[number];

const categoryIcons: Record<Exclude<OfferCategory, 'Tất cả'>, IconName> = {
  Voucher: 'ticket-outline',
  'Hoàn tiền': 'cash-outline',
  'Quà tặng': 'gift-outline',
};

const offerCatalog = new OfferCatalog(offers);

export function OffersScreen({
  activeTab,
  points,
  unreadNotifications,
  onNavigate,
  onSelectOffer,
}: OffersScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOffers = useMemo(
    () => offerCatalog.query(selectedCategory, searchQuery),
    [searchQuery, selectedCategory],
  );

  return (
    <View style={styles.root}>
      <ScreenHeader
  title="Ưu đãi & quà tặng"
  rightContent={
    <Pressable
      onPress={() => onNavigate('notifications')}
      style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}
    >
      <Ionicons color={colors.text} name="notifications-outline" size={22} />
      {unreadNotifications ? <View style={styles.notificationDot} /> : null}
    </Pressable>
  }
/>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
  <View style={styles.titleCopy}>
  </View>
</View>

        

        <View style={styles.searchBox}>
          <Ionicons color={colors.textMuted} name="search-outline" size={19} />

          <TextInput
            autoCapitalize="none"
            onChangeText={setSearchQuery}
            placeholder="Tìm ưu đãi, đối tác..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
          />

          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons color={colors.textMuted} name="close-circle" size={18} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
  onPress={() => onNavigate('voucher-wallet')}
  style={({ pressed }) => [styles.walletShortcut, pressed && styles.pressed]}
>
  <View style={styles.walletCopy}>
    <Text style={styles.walletTitle}>Voucher của tôi</Text>
    <Text style={styles.walletSubtitle}>
      Sử dụng voucher của bạn để đổi những ưu đãi
    </Text>
  </View>

  <Ionicons color={colors.textMuted} name="chevron-forward" size={22} />
</Pressable>

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
                onPress={() => setSelectedCategory(category)}
                style={({ pressed }) => [
                  styles.filter,
                  active && styles.filterActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredOffers.map((offer, index) => {
          const affordable = points >= offer.points;
const icon =
  categoryIcons[offer.category as keyof typeof categoryIcons] ?? 'gift-outline';
const imageSource = OfferMediaResolver.getImageSource(offer.media);

          return (
            <Pressable
              key={offer.id}
              onPress={() => onSelectOffer(offer)}
              style={({ pressed }) => [styles.offerCard, pressed && styles.offerCardPressed]}
            >
              <OfferMediaFrame
  fallbackColor={offer.accent}
  height={162}
  media={offer.media}
  overlayOpacity={0.18}
  style={styles.offerVisual}
>
  <View style={styles.hotBadge}>
    <Ionicons color="#FFD79A" name="sparkles" size={12} />
    <Text style={styles.hotText}>
      {index === 0 ? 'HOT DEAL' : offer.category.toUpperCase()}
    </Text>
  </View>

  {!offer.media ? (
    <>
      <View style={styles.visualGlowLarge} />
      <View style={styles.visualGlowSmall} />

      <View style={styles.offerIcon}>
        <Ionicons color={colors.white} name={icon} size={34} />
      </View>

      <Text style={styles.visualPartner}>{offer.partner}</Text>
    </>
  ) : null}
</OfferMediaFrame>

              <View style={styles.offerInfo}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.partner}>{offer.partner}</Text>

                <View style={styles.divider} />

                <View style={styles.offerFooter}>
                  <View>
                    <Text style={styles.metaLabel}>Điểm quy đổi</Text>
                    <View style={styles.pointsRow}>
                      
                      <Text style={[styles.points, !affordable && styles.pointsDisabled]}>
                        {formatPoints(offer.points)} pts
                      </Text>
                    </View>
                  </View>

                  <View style={styles.expiryBlock}>
                    <Text style={styles.metaLabel}>Hạn sử dụng</Text>
                    <Text style={styles.expiry}>{offer.expiresAt}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}

        {!filteredOffers.length ? (
          <View style={styles.emptyState}>
            <Ionicons color={colors.textMuted} name="gift-outline" size={42} />
            <Text style={styles.emptyTitle}>Không tìm thấy ưu đãi</Text>
            <Text style={styles.emptyText}>Hãy thử từ khóa hoặc danh mục khác.</Text>
          </View>
        ) : null}
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
    opacity: 0.7,
  },
notificationDot: {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 7,
  height: 7,
  borderWidth: 1,
  borderColor: colors.surface,
  borderRadius: 4,
  backgroundColor: colors.danger,
},
content: {
  paddingHorizontal: 20,
  paddingTop: 18,
  paddingBottom: 20,
},
  titleRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  marginBottom: 16,
},
titleCopy: {
  flex: 1,
  paddingRight: 12,
},
headerIconButton: {
  width: 40,
  height: 40,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 20,
},
pageSubtitle: {
  color: colors.textMuted,
  fontSize: 13,
  fontWeight: '700',
  lineHeight: 19,
},
  walletShortcut: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 14,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 16,
  backgroundColor: colors.surface,
  paddingHorizontal: 18,
  paddingVertical: 17,
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 2,
},
  walletIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  walletTitle: {
  color: colors.text,
  fontSize: 16,
  fontWeight: '900',
},

  walletSubtitle: {
  marginTop: 5,
  color: colors.textMuted,
  fontSize: 13,
  lineHeight: 18,
},

  searchBox: {
  minHeight: 52,
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 16,
  backgroundColor: colors.surface,
  paddingHorizontal: 14,
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 1,
},
  walletCopy: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    minHeight: 49,
    marginHorizontal: 9,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 13,
    fontWeight: '400',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
  },
  filterRow: {
  paddingTop: 14,
  paddingBottom: 18,
  paddingRight: 8,
},
  
  offerImage: {
  ...StyleSheet.absoluteFillObject,
  width: '100%',
  height: '100%',
},

imageOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.18)',
},

  filter: {
  minHeight: 38,
  justifyContent: 'center',
  marginRight: 10,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 999,
  backgroundColor: colors.surface,
  paddingHorizontal: 18,
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
},
  filterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '900',
  },
  offerCard: {
  overflow: 'hidden',
  marginBottom: 18,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 22,
  backgroundColor: colors.surface,
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.09,
  shadowRadius: 15,
  elevation: 4,
},
  offerCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.995 }],
  },
  offerVisual: {
  overflow: 'hidden',
},
  visualGlowLarge: {
    position: 'absolute',
    top: -85,
    right: -42,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  visualGlowSmall: {
    position: 'absolute',
    bottom: -70,
    left: -35,
    width: 165,
    height: 165,
    borderRadius: 83,
    backgroundColor: 'rgba(0,0,0,0.11)',
  },
  hotBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,184,77,0.42)',
    borderRadius: 999,
    backgroundColor: 'rgba(20,20,20,0.55)',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  hotText: {
    marginLeft: 5,
    color: '#FFD79A',
    fontSize: 8,
    fontWeight: '900',
  },
  offerIcon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.17)',
  },
  visualPartner: {
    marginTop: 9,
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  offerInfo: {
  paddingHorizontal: 18,
  paddingTop: 16,
  paddingBottom: 17,
},
  offerTitle: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
  },
  partner: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 10,
  },
  divider: {
  height: 1,
  marginVertical: 14,
  backgroundColor: colors.border,
},
  offerFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: 700,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  points: {
    marginLeft: 5,
    color: colors.success,
    fontSize: 14,
    fontWeight: '900',
  },
  pointsDisabled: {
    color: colors.danger,
  },
  expiryBlock: {
    maxWidth: '48%',
    alignItems: 'flex-end',
  },
  expiry: {
    marginTop: 5,
    textAlign: 'right',
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
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