import Ionicons from '@expo/vector-icons/Ionicons';
import { OfferMediaResolver } from '../offers/domain/OfferMediaResolver';
import type { ComponentProps } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandLogo } from '../../shared/components/BrandLogo';
import { BottomNav } from '../../shared/components/BottomNav';
import { TransactionRow } from '../../shared/components/TransactionRow';
import { clamp, getBottomNavOffset } from '../../shared/layout';
import { colors } from '../../theme/colors';
import type { AppScreen, Offer, Transaction } from '../../types';
import { formatPoints } from '../../utils/format';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

type HomeScreenProps = {
  points: number;
  transactions: Transaction[];
  offers: Offer[];
  unreadNotifications: number;
  onNavigate: (screen: AppScreen) => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onSelectOffer: (offer: Offer) => void;
};

type IconName = ComponentProps<typeof Ionicons>['name'];
const pointCardBackground = require('../../../assets/Card.png');

const quickActions: Array<{ label: string; icon: IconName; route: AppScreen }> = [
  { label: 'Đổi điểm', icon: 'sync-outline', route: 'offers' },
  { label: 'Tặng điểm', icon: 'gift-outline', route: 'transfer' },
  { label: 'Liên kết', icon: 'link-outline', route: 'cards' },
  { label: 'Thanh toán', icon: 'bag-outline', route: 'payment' },
];

export function HomeScreen({
  points,
  transactions,
  offers,
  unreadNotifications,
  onNavigate,
  onSelectTransaction,
  onSelectOffer,
}: HomeScreenProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const suggestedOffers = offers.slice(0, 6);
  const horizontalPadding = width < 380 ? 14 : 20;
  const quickGap = width < 380 ? 8 : 10;
  const quickButtonSize = clamp((width - horizontalPadding * 2 - quickGap * 3) / 4, 56, 72);
  const quickIconSize = clamp(quickButtonSize * 0.42, 22, 30);
  const pointCardHeight = clamp(width * 0.58, 200, 232);
  const voucherCardWidth = clamp(width * 0.39, 132, 150);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getBottomNavOffset(insets.bottom) + 18 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingHorizontal: horizontalPadding }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>NA</Text>
          </View>
          <View style={styles.brand}>
            <BrandLogo width={92} />
            
          </View>
          <Pressable
            accessibilityLabel={`${unreadNotifications} thông báo chưa đọc`}
            accessibilityRole="button"
            onPress={() => onNavigate('membership')}
            style={({ pressed }) => [styles.notification, pressed && styles.pressed]}
          >
            <Ionicons color={colors.primaryDark} name="notifications-outline" size={20} />
            {unreadNotifications ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <Pressable
  onPress={() => onNavigate('profile')}
  style={({ pressed }) => [styles.greetingRow, { paddingHorizontal: horizontalPadding }, pressed && styles.pressed]}
>
  <View style={styles.greetingCopy}>
    <Text maxFontSizeMultiplier={1.12} style={styles.hello}>Xin chào,</Text>
    <Text maxFontSizeMultiplier={1.08} numberOfLines={1} style={styles.name}>Nguyễn Văn Anh</Text>
  </View>

  <View style={styles.memberBadge}>
    <Ionicons color="#B7791F" name="ribbon-outline" size={15} />
    <Text style={styles.memberBadgeText}>GOLD</Text>
  </View>
</Pressable>
        
        <Pressable
  onPress={() => onNavigate('membership')}
  style={({ pressed }) => [styles.pointsCardPressable, { marginHorizontal: horizontalPadding }, pressed && styles.pressed]}
>
  <View style={styles.pointsCardShadow}>
  <ImageBackground
    source={pointCardBackground}
    resizeMode="cover"
    imageStyle={styles.pointsCardImage}
    style={[styles.pointsCard, { height: pointCardHeight }]}
  >
    <View style={styles.pointsCardContent}>
      <View style={styles.pointsMain}>
        <Text style={styles.pointsLabel}>ĐIỂM KHẢ DỤNG</Text>

        <View style={styles.pointsRow}>
          <Text adjustsFontSizeToFit maxFontSizeMultiplier={1} numberOfLines={1} style={styles.pointsValue}>{formatPoints(points)}</Text>
          <Text maxFontSizeMultiplier={1} style={styles.pointsUnit}>pts</Text>
        </View>
      </View>

      <View style={styles.pointsBottom}>
        <View style={styles.pointsDivider} />

        <View style={styles.pointsMetaRow}>
          <View style={styles.pointsMetaItem}>
            <View style={styles.pointsMetaIcon}>
              <Ionicons color={colors.white} name="time-outline" size={18} />
            </View>

            <View style={styles.pointsMetaCopy}>
              <Text maxFontSizeMultiplier={1.05} numberOfLines={2} style={styles.pointsMetaLabel}>Điểm chờ xác nhận:</Text>
              <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.pointsMetaValue}>2.400 điểm</Text>
            </View>
          </View>

          <View style={styles.pointsMetaSpacer} />

          <View style={styles.pointsMetaItem}>
            <View style={[styles.pointsMetaIcon, styles.pointsMetaIconGold]}>
              <Ionicons color="#F4D35E" name="hourglass-outline" size={18} />
            </View>

            <View style={styles.pointsMetaCopy}>
              <Text maxFontSizeMultiplier={1.05} numberOfLines={2} style={styles.pointsMetaLabel}>Điểm sắp hết hạn:</Text>
              <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.pointsMetaValue}>8.000 điểm</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  </ImageBackground>
  </View>
</Pressable>

        <View style={[styles.quickGrid, { gap: quickGap, paddingHorizontal: horizontalPadding }]}>
  {quickActions.map((action) => (
    <Pressable
      key={action.label}
      onPress={() => onNavigate(action.route)}
      style={({ pressed }) => [
        styles.quickAction,
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
      ]}
    >
      <View style={[styles.quickButton, { width: quickButtonSize, height: quickButtonSize, borderRadius: quickButtonSize * 0.36 }]}>
        <Ionicons color="#3E5D9B" name={action.icon} size={quickIconSize} />
      </View>
      <Text maxFontSizeMultiplier={1.05} numberOfLines={2} style={styles.quickButtonLabel}>{action.label}</Text>
    </Pressable>
  ))}
</View>

        <Pressable
  onPress={() => onNavigate('membership-tier')}
  style={({ pressed }) => [styles.sectionCard, { marginHorizontal: horizontalPadding }, pressed && styles.pressed]}
>
  <View style={styles.sectionHeader}>
    <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.sectionTitle}>Tiến trình thăng hạng</Text>
    <Text maxFontSizeMultiplier={1.02} numberOfLines={1} style={styles.goldText}>GOLD → PLATINUM</Text>
  </View>

  <View style={styles.progressTrack}>
    <View style={styles.progressValue} />
  </View>

  <Text style={styles.progressText}>
    Chỉ cần <Text style={styles.progressStrong}>15.000 điểm</Text> nữa để thăng hạng.
  </Text>
</Pressable>

        <View style={[styles.sectionCard, { marginHorizontal: horizontalPadding }]}>
          <View style={styles.sectionHeader}>
            <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.sectionTitle}>Hoạt động gần đây</Text>
            
            <Pressable onPress={() => onNavigate('history')}>
              <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.link}>Xem tất cả</Text>
            </Pressable>
          </View>
          {transactions.slice(0, 2).map((transaction) => (
            <TransactionRow
              key={transaction.id}
              onPress={onSelectTransaction}
              transaction={transaction}
            />
          ))}
        </View>
        <View style={[styles.sectionCard, { marginHorizontal: horizontalPadding }]}>
  <View style={styles.sectionHeader}>
    <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.sectionTitle}>Voucher dành cho bạn</Text>
    <Pressable onPress={() => onNavigate('offers')}>
      <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.link}>Xem tất cả</Text>
    </Pressable>
  </View>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.voucherRow}
  >
    {suggestedOffers.map((offer) => {
      const imageSource = OfferMediaResolver.getImageSource(offer.media);

      return (
        <Pressable
          key={offer.id}
          onPress={() => onSelectOffer(offer)}
          style={({ pressed }) => [
            styles.suggestedVoucherCard,
            { width: voucherCardWidth },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.suggestedVoucherImageWrap}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.suggestedVoucherImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.suggestedVoucherFallback}>
                <Ionicons name="gift-outline" size={24} color={colors.primary} />
              </View>
            )}
          </View>

          <View style={styles.suggestedVoucherBody}>
            <Text style={styles.suggestedVoucherTitle} numberOfLines={2}>
              {offer.title}
            </Text>

            <Text style={styles.suggestedVoucherPartner} numberOfLines={1}>
              {offer.partner}
            </Text>

            <View style={styles.suggestedVoucherPointsRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={15}
                color={colors.success}
              />
              <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.suggestedVoucherPoints}>
                {formatPoints(offer.points)} đ
              </Text>
            </View>
          </View>
        </Pressable>
      );
    })}
  </ScrollView>
</View>
        
      </ScrollView>
      <BottomNav active="home" onNavigate={onNavigate} />
    </View>
  );
}
function PointsCardBackground() {
  return (
    <Svg
      height="100%"
      pointerEvents="none"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFillObject}
      viewBox="0 0 335 158"
      width="100%"
    >
      <Defs>
        <LinearGradient id="pointsBg" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#2D75AF" />
          <Stop offset="0.38" stopColor="#0E5797" />
          <Stop offset="0.72" stopColor="#073C77" />
          <Stop offset="1" stopColor="#052D5E" />
        </LinearGradient>

        <LinearGradient id="shine" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.32" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Rect fill="url(#pointsBg)" height="158" rx="18" width="335" x="0" y="0" />
      <Circle cx="292" cy="22" fill="#7AB8E7" opacity="0.22" r="95" />
      <Circle cx="28" cy="162" fill="#043063" opacity="0.42" r="86" />
      <Path d="M214 -42 L260 -42 L188 203 L142 203 Z" fill="url(#shine)" opacity="0.82" />
      <Rect
        fill="none"
        height="156"
        rx="17"
        stroke="#D9EEFF"
        strokeOpacity="0.36"
        strokeWidth="1"
        width="333"
        x="1"
        y="1"
      />
    </Svg>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  topBar: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  brand: {
    flex: 1,
    alignItems: 'center',
  },
  notification: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -4,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 9,
    backgroundColor: colors.danger,
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '900',
  },
  greetingCopy: {
  flex: 1,
  paddingRight: 12,
},
  greetingRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingTop: 22,
  paddingBottom: 16,
},
  hello: {
    color: colors.textMuted,
    fontSize: 12,
  },
  name: {
    marginTop: 2,
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  memberBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E9D8A6',
  borderRadius: 999,
  backgroundColor: '#FFF8DF',
  paddingHorizontal: 11,
  paddingVertical: 7,
  shadowColor: '#B7791F',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 2,
},
memberBadgeText: {
  marginLeft: 5,
  color: '#B7791F',
  fontSize: 11,
  fontWeight: '900',
  letterSpacing: 0.4,
},
  rankBadge: {
    paddingHorizontal: 1,
    paddingVertical: 1,
  },
  rankText: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '500',
  },
pointsCard: {
  overflow: 'hidden',
  height: 195,
  borderRadius: 24,
},
pointsCardImage: {
  borderRadius: 24,
},

pointsCardPressable: {
  marginHorizontal: 20,
  marginBottom: 18,
  borderRadius: 24,
},
pointsTopRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
},

pointsCardShadow: {
  borderRadius: 24,
  backgroundColor: colors.background,
  shadowColor: '#000000',
  shadowOffset: { width: 10, height: 20 },
  shadowOpacity: 0.4,
  shadowRadius: 10,
  elevation: 14,
},

pointsCardContent: {
  flex: 1,
  justifyContent: 'space-between',
  paddingHorizontal: 18,
  paddingTop: 18,
  paddingBottom: 18,
},

pointsHeader: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
},
pointsLabel: {
  color: '#D9ECFB',
  fontSize: 12,
  fontWeight: '700',
  letterSpacing: 0.7,
},


pointsRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
  marginTop: 8,
},

pointsValue: {
  color: colors.white,
  fontSize: 34,
  fontWeight: '500',
  textShadowColor: 'rgba(0,0,0,0.22)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
},
pointsBottom: {
  marginTop: 'auto',
},
pointsMetaSpacer: {
  width: 8,
},

pointsUnit: {
  marginLeft: 8,
  color: '#F2FAFF',
  fontSize: 20,
  fontWeight: '400',
},
pointsDivider: {
  height: 1,
  backgroundColor: 'rgba(218,238,255,0.28)',
  marginBottom: 12,
},

pointsMetaRow: {
  flexDirection: 'row',
  alignItems: 'center',
},

pointsMetaItem: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
},

pointsMetaIcon: {
  width: 32,
  height: 32,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.16)',
},


pointsMetaIconGold: {
  backgroundColor: 'rgba(255,220,98,0.20)',
},


pointsMetaCopy: {
  flex: 1,
  marginLeft: 7,
},

pointsMetaLabel: {
  color: '#D8ECFF',
  fontSize: 10,
  fontWeight: '600',
  lineHeight: 13,
},

pointsMetaValue: {
  marginTop: 2,
  color: colors.white,
  fontSize: 12,
  fontWeight: '800',
  lineHeight: 15,
},
pointsMain: {
  justifyContent: 'flex-start',
},

quickGrid: {
  flexDirection: 'row',
  justifyContent: 'center',
  paddingHorizontal: 20,
  paddingTop: 0,
  paddingBottom: 20,
},
quickAction: {
  flex: 1,
  alignItems: 'center',
},

quickButton: {
  width: 74,
  height: 74,
  borderRadius: 28,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: 'rgba(50, 70, 120, 0.06)',
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.14,
  shadowRadius: 16,
  elevation: 8,
},

quickButtonLabel: {
  minHeight: 32,
  marginTop: 8,
  textAlign: 'center',
  color: '#3E5D9B',
  fontSize: 10,
  fontWeight: '700',
  lineHeight: 14,
  textShadowColor: 'rgba(62, 93, 155, 0.18)',
  textShadowOffset: { width: 0, height: 3 },
  textShadowRadius: 6,
},
  sectionCard: {
  marginHorizontal: 20,
  marginBottom: 18,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 20,
  backgroundColor: colors.surface,
  padding: 16,
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 2,
},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  voucherRow: {
  paddingRight: 6,
},

suggestedVoucherCard: {
  width: 150,
  marginRight: 12,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 16,
  backgroundColor: colors.surface,
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 2,
},

suggestedVoucherImageWrap: {
  height: 92,
  backgroundColor: '#EEF2F7',
},

suggestedVoucherImage: {
  width: '100%',
  height: '100%',
},

suggestedVoucherFallback: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},

suggestedVoucherBody: {
  paddingHorizontal: 12,
  paddingTop: 10,
  paddingBottom: 12,
},

suggestedVoucherTitle: {
  color: colors.text,
  fontSize: 12,
  fontWeight: '800',
  lineHeight: 17,
},

suggestedVoucherPartner: {
  marginTop: 4,
  color: colors.textMuted,
  fontSize: 10,
},

suggestedVoucherPointsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
},

suggestedVoucherPoints: {
  marginLeft: 4,
  color: colors.success,
  fontSize: 13,
  fontWeight: '900',
},
  goldText: {
    flexShrink: 1,
    textAlign: 'right',
    color: colors.gold,
    fontSize: 9,
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressValue: {
    width: '64%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  progressText: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 11,
  },
  progressStrong: {
    color: colors.text,
    fontWeight: '800',
  },
  link: {
    flexShrink: 0,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
});
