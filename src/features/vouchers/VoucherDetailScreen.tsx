import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfferMediaResolver } from '../offers/domain/OfferMediaResolver';
import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { getBottomNavOffset, getScreenBottomPadding } from '../../shared/layout';
import { colors } from '../../theme/colors';
import type { UserVoucher } from '../../types';
import { formatPoints } from '../../utils/format';
import { VoucherFactory } from './domain/VoucherFactory';
import { OfferMediaFrame } from '../offers/components/OfferMediaFrame';


type VoucherDetailScreenProps = {
  voucher: UserVoucher | null;
  onBack: () => void;
  onUseVoucher: (voucher: UserVoucher) => void;
};

export function VoucherDetailScreen({ voucher, onBack, onUseVoucher }: VoucherDetailScreenProps) {
  const insets = useSafeAreaInsets();

  if (!voucher) {
    return (
      <View style={styles.root}>
        <ScreenHeader onBack={onBack} title="Chi tiết voucher" />
        <View style={styles.emptyState}>
          <Ionicons color={colors.textMuted} name="ticket-outline" size={44} />
          <Text style={styles.emptyTitle}>Không tìm thấy voucher</Text>
        </View>
      </View>
    );
  }

  const canUse = VoucherFactory.canUse(voucher);
const statusLabel = VoucherFactory.getStatusLabel(voucher);
const imageSource = OfferMediaResolver.getImageSource(voucher.media);

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Chi tiết Voucher" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getBottomNavOffset(insets.bottom) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <OfferMediaFrame
  fallbackColor={colors.primary}
  height={230}
  media={voucher.media}
  overlayOpacity={0.34}
  style={styles.heroCard}
>
  <View style={styles.heroTextLayer}>
    <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.eyebrow}>VOUCHER</Text>
    <Text adjustsFontSizeToFit maxFontSizeMultiplier={1.05} numberOfLines={2} style={styles.title}>{voucher.title}</Text>
    <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.partner}>{voucher.partner}</Text>

    <View style={[styles.statusBadge, !canUse && styles.statusBadgeMuted]}>
      <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={[styles.statusText, !canUse && styles.statusTextMuted]}>
        {statusLabel}
      </Text>
    </View>
  </View>
</OfferMediaFrame>

        <View style={styles.card}>
          <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.cardTitle}>THÔNG TIN VOUCHER</Text>
          <InfoRow label="Mã voucher" value={voucher.code} />
          <InfoRow label="Điểm đã dùng" value={`${formatPoints(voucher.pointsUsed)} pts`} />
          <InfoRow label="Hạn sử dụng" value={voucher.expiresLabel} />
          <InfoRow label="Trạng thái" value={statusLabel} />
        </View>

        <View style={styles.card}>
          <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.cardTitle}>MÔ TẢ</Text>
          <Text maxFontSizeMultiplier={1.08} style={styles.body}>{voucher.description}</Text>
        </View>

        <View style={styles.card}>
          <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.cardTitle}>ĐIỀU KIỆN ÁP DỤNG</Text>
          {voucher.terms.map((term) => (
            <Text key={term} maxFontSizeMultiplier={1.08} style={styles.bullet}>
              • {term}
            </Text>
          ))}
        </View>

        <View style={canUse ? styles.notice : styles.noticeWarning}>
          <Ionicons
            color={canUse ? colors.success : colors.danger}
            name={canUse ? 'checkmark-circle-outline' : 'alert-circle-outline'}
            size={18}
          />
          <Text maxFontSizeMultiplier={1.08} style={[styles.noticeText, !canUse && styles.noticeTextWarning]}>
            {VoucherFactory.getStatusDescription(voucher)}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: getScreenBottomPadding(insets.bottom, 8) }]}>
        <PrimaryButton
          disabled={!canUse}
          label={canUse ? 'Sử dụng voucher' : 'Voucher không khả dụng'}
          onPress={() => onUseVoucher(voucher)}
        />
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text maxFontSizeMultiplier={1.05} numberOfLines={1} style={styles.infoLabel}>{label}</Text>
      <Text maxFontSizeMultiplier={1.05} numberOfLines={2} style={styles.infoValue}>{value}</Text>
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
  },
  heroCard: {
  borderRadius: 24,

},

heroTextLayer: {
    flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
},
  eyebrow: {
    color: '#CDE7FA',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    marginTop: 10,
    textAlign: 'center',
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  partner: {
    marginTop: 8,
    color: '#CDE7FA',
    fontSize: 13,
    fontWeight: '800',
  },
  statusBadge: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  statusBadgeMuted: {
    backgroundColor: colors.warningSoft,
  },
  statusText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '900',
  },
  statusTextMuted: {
    color: colors.warning,
  },
  card: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
  },
  cardTitle: {
    marginBottom: 8,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 11,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  infoValue: {
    maxWidth: '55%',
    textAlign: 'right',
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  body: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  bullet: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    padding: 12,
  },
  noticeWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#fcdcdc',
    padding: 12,
  },
  noticeText: {
    flex: 1,
    marginLeft: 8,
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  noticeTextWarning: {
    color: colors.danger,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
});
