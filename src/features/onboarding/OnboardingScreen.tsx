import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '../../shared/components/BrandLogo';
import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { getScreenBottomPadding } from '../../shared/layout';
import { colors } from '../../theme/colors';

export function OnboardingScreen({ onContinue }: { onContinue: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingBottom: getScreenBottomPadding(insets.bottom, 24) }]}>
      <View style={styles.topRow}>
        <BrandLogo width={100} />
        <Pressable onPress={onContinue}>
          <Text style={styles.skip}>Bỏ qua</Text>
        </Pressable>
      </View>

      <View style={styles.illustration}>
        <View style={styles.orbOne} />
        <View style={styles.orbTwo} />
        <View style={styles.phoneCard}>
          <View style={styles.cardTop}>
            <Text style={styles.cardBrand}>NAPAS DAYONE</Text>
            <Ionicons color="#F1C75B" name="card-outline" size={21} />
          </View>
          <Text style={styles.cardPoints}>+500 pts</Text>
          <Text style={styles.cardCaption}>Thanh toán thành công</Text>
        </View>
        <View style={styles.rewardBubble}>
          <Ionicons color={colors.success} name="gift-outline" size={22} />
          <Text style={styles.rewardText}>Tích điểm</Text>
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>MỖI GIAO DỊCH, MỘT ĐẶC QUYỀN</Text>
        <Text style={styles.title}>Tích điểm từ giao dịch tài chính</Text>
        <Text style={styles.description}>
          Nhận điểm thưởng khi chuyển tiền, thanh toán và sử dụng dịch vụ trong hệ sinh thái NAPAS.
        </Text>
        <View style={styles.dots}>
          <View style={styles.dotActive} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <PrimaryButton label="Bắt đầu trải nghiệm" onPress={onContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skip: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  illustration: {
    height: 310,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: colors.primarySoft,
  },
  orbOne: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D4ECFF',
  },
  orbTwo: {
    position: 'absolute',
    bottom: -70,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#DDF7EA',
  },
  phoneCard: {
    width: 225,
    height: 145,
    transform: [{ rotate: '-5deg' }],
    borderRadius: 22,
    backgroundColor: colors.primaryDark,
    padding: 20,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardBrand: {
    color: '#B9D9EF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardPoints: {
    marginTop: 25,
    color: colors.white,
    fontSize: 27,
    fontWeight: '900',
  },
  cardCaption: {
    marginTop: 5,
    color: '#B9D9EF',
    fontSize: 10,
  },
  rewardBubble: {
    position: 'absolute',
    right: 25,
    bottom: 45,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    paddingVertical: 11,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  rewardText: {
    marginTop: 2,
    color: colors.text,
    fontSize: 9,
    fontWeight: '800',
  },
  copy: {
    alignItems: 'center',
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    maxWidth: 320,
    marginTop: 10,
    textAlign: 'center',
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
  },
  description: {
    maxWidth: 320,
    marginTop: 10,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  dots: {
    flexDirection: 'row',
    marginTop: 18,
  },
  dot: {
    width: 7,
    height: 7,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    height: 7,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
