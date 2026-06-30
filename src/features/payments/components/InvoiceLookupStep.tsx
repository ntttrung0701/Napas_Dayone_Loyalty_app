import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../theme/colors';
import { formatPoints } from '../../../utils/format';

type IconName = ComponentProps<typeof Ionicons>['name'];

type InvoiceLookupStepProps = {
  invoiceCode: string;
  lookupError: string | null;
  points: number;
  onChangeInvoiceCode: (value: string) => void;
  onLookup: () => void;
  onQrLookup: () => void;
  onUseSuggested: () => void;
};

const paymentHeroBackground = require('../../../../assets/Card.png');

export function InvoiceLookupStep({
  invoiceCode,
  lookupError,
  points,
  onChangeInvoiceCode,
  onLookup,
  onQrLookup,
  onUseSuggested,
}: InvoiceLookupStepProps) {
  return (
    <>
      <PaymentHeroCard points={points} />

      <View style={styles.sectionCard}>
        <SectionTitle
          icon="search-outline"
          subtitle="Nhập mã hóa đơn từ POS/Merchant hoặc dùng QR demo"
          title="Tìm hoặc nhập hóa đơn"
        />
        <View style={styles.invoiceInputBox}>
          <Ionicons color={colors.textMuted} name="document-text-outline" size={19} />
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            onChangeText={onChangeInvoiceCode}
            placeholder="Ví dụ: HD-WM-24062026"
            placeholderTextColor={colors.textMuted}
            style={styles.invoiceInput}
            value={invoiceCode}
          />
        </View>

        {lookupError ? (
          <View style={styles.errorBox}>
            <Ionicons color={colors.danger} name="alert-circle-outline" size={16} />
            <Text style={styles.errorText}>{lookupError}</Text>
          </View>
        ) : null}

        <PrimaryButton label="Tiếp tục với hóa đơn này" onPress={onLookup} />
      </View>

      <View style={styles.lookupActions}>
        <LookupAction
          icon="qr-code-outline"
          label="Quét QR hóa đơn"
          note="Mô phỏng nhận dữ liệu QR từ POS"
          onPress={onQrLookup}
        />
        <LookupAction
          icon="flash-outline"
          label="Hóa đơn gợi ý"
          note="Demo merchant WinMart"
          onPress={onUseSuggested}
        />
      </View>

      <SafetyNote
        icon="shield-checkmark-outline"
        text="Không lưu thông tin thẻ/tài khoản. App chỉ nhận hóa đơn, tính quyền lợi Loyalty và gửi kết quả xử lý qua POS/Merchant."
        title="Không lưu thông tin thẻ/tài khoản"
      />
    </>
  );
}

function PaymentHeroCard({ points }: { points: number }) {
  return (
    <View style={styles.paymentHeroShadow}>
      <ImageBackground
        imageStyle={styles.paymentHeroImage}
        resizeMode="cover"
        source={paymentHeroBackground}
        style={styles.paymentHero}
      >
        <View style={styles.paymentHeroTop}>
          <View>
            <Text style={styles.paymentHeroLabel}>THANH TOÁN LOYALTY</Text>
            <Text style={styles.paymentHeroTitle}>Hóa đơn POS/QR/Merchant</Text>
          </View>
          <View style={styles.paymentHeroBadge}>
            <Ionicons color={colors.white} name="shield-checkmark-outline" size={15} />
            <Text style={styles.paymentHeroBadgeText}>BẢO MẬT</Text>
          </View>
        </View>

        <View style={styles.paymentHeroDivider} />

        <View style={styles.paymentHeroMetrics}>
          <HeroMetric
            icon="sparkles-outline"
            label="Điểm khả dụng"
            value={`${formatPoints(points)} pts`}
          />
          <HeroMetric icon="qr-code-outline" label="Nguồn hóa đơn" value="QR hoặc mã" />
          <HeroMetric icon="receipt-outline" label="Kết quả" value="POS đối soát" />
        </View>
      </ImageBackground>
    </View>
  );
}

function HeroMetric({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.heroMetric}>
      <View style={styles.heroMetricIcon}>
        <Ionicons color={colors.white} name={icon} size={17} />
      </View>
      <View style={styles.heroMetricCopy}>
        <Text style={styles.heroMetricLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.heroMetricValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionIcon}>
        <Ionicons color={colors.primary} name={icon} size={18} />
      </View>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function LookupAction({
  icon,
  label,
  note,
  onPress,
}: {
  icon: IconName;
  label: string;
  note: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.lookupAction, pressed && styles.pressed]}
    >
      <View style={styles.lookupActionIcon}>
        <Ionicons color={colors.primary} name={icon} size={22} />
      </View>
      <Text style={styles.lookupActionLabel}>{label}</Text>
      <Text style={styles.lookupActionNote}>{note}</Text>
    </Pressable>
  );
}

function SafetyNote({
  icon,
  text,
  title,
}: {
  icon: IconName;
  text: string;
  title: string;
}) {
  return (
    <View style={styles.safetyNote}>
      <View style={styles.safetyIcon}>
        <Ionicons color={colors.primary} name={icon} size={18} />
      </View>
      <View style={styles.safetyCopy}>
        <Text style={styles.safetyTitle}>{title}</Text>
        <Text style={styles.safetyText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.72 },
  paymentHeroShadow: {
    marginBottom: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 7,
  },
  paymentHero: {
    minHeight: 214,
    overflow: 'hidden',
    borderRadius: 28,
    padding: 20,
  },
  paymentHeroImage: {
    borderRadius: 28,
  },
  paymentHeroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  paymentHeroLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  paymentHeroTitle: {
    maxWidth: 210,
    marginTop: 10,
    color: colors.white,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 30,
  },
  paymentHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  paymentHeroBadgeText: {
    marginLeft: 5,
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  paymentHeroDivider: {
    height: 1,
    marginTop: 58,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  paymentHeroMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroMetric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  heroMetricIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroMetricCopy: {
    flex: 1,
    marginLeft: 8,
  },
  heroMetricLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 8,
    fontWeight: '800',
  },
  heroMetricValue: {
    marginTop: 3,
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  sectionCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  sectionCopy: { flex: 1, marginLeft: 11 },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  sectionSubtitle: { marginTop: 3, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  invoiceInputBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: '#F8FBFE',
    paddingHorizontal: 14,
  },
  invoiceInput: {
    flex: 1,
    minHeight: 50,
    marginLeft: 9,
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 13,
    backgroundColor: '#FFF1F2',
    padding: 10,
  },
  errorText: { flex: 1, marginLeft: 7, color: colors.danger, fontSize: 10, lineHeight: 15 },
  lookupActions: { flexDirection: 'row', justifyContent: 'space-between' },
  lookupAction: {
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 16,
  },
  lookupActionIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  lookupActionLabel: { marginTop: 10, textAlign: 'center', color: colors.text, fontSize: 12, fontWeight: '900' },
  lookupActionNote: { marginTop: 5, textAlign: 'center', color: colors.textMuted, fontSize: 10, lineHeight: 14 },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,91,170,0.14)',
    borderRadius: 20,
    backgroundColor: '#F7FBFF',
    padding: 14,
  },
  safetyIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  safetyCopy: {
    flex: 1,
    marginLeft: 11,
  },
  safetyTitle: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
  },
  safetyText: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
  },
});
