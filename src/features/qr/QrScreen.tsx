import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

import { BottomNav } from '../../shared/components/BottomNav';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { clamp, getBottomNavOffset } from '../../shared/layout';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab } from '../../types';
import { formatPoints } from '../../utils/format';
import { MemberQrSession, type MemberQrPayload } from './domain/MemberQrSession';

type QrScreenProps = {
  activeTab: MainTab;
  points: number;
  onNavigate: (screen: AppScreen) => void;
};

const LOYALTY_ID = 'NPS-5829';
const MEMBER_NAME = 'Nguyễn Văn Anh';

export function QrScreen({ activeTab, points, onNavigate }: QrScreenProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [payload, setPayload] = useState<MemberQrPayload>(() =>
    MemberQrSession.createPayload(LOYALTY_ID),
  );
  const [remainingSeconds, setRemainingSeconds] = useState(MemberQrSession.validitySeconds);
  const compact = height < 820;
  const qrCodeSize = clamp(width * 0.52, compact ? 168 : 186, compact ? 198 : 218);
  const qrShellSize = qrCodeSize + (compact ? 32 : 38);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isExpired = remainingSeconds <= 0;

  const qrValue = useMemo(() => JSON.stringify(payload), [payload]);

  function handleRefreshQr() {
    setPayload(MemberQrSession.createPayload(LOYALTY_ID));
    setRemainingSeconds(MemberQrSession.validitySeconds);
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Mã QR thành viên" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getBottomNavOffset(insets.bottom) + 18 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.memberInfoCard}>
          <Text maxFontSizeMultiplier={1.08} style={styles.eyebrow}>
            THẺ THÀNH VIÊN LOYALTY
          </Text>
          <Text maxFontSizeMultiplier={1.08} numberOfLines={1} style={styles.name}>
            {MEMBER_NAME}
          </Text>
          <Text maxFontSizeMultiplier={1.08} style={styles.loyaltyId}>
            Loyalty ID: {LOYALTY_ID}
          </Text>
        </View>

        <View style={[styles.qrSection, isExpired && styles.qrSectionExpired]}>
          <View
            style={[
              styles.qrCodeShell,
              { height: qrShellSize, width: qrShellSize },
              isExpired && styles.qrCodeShellExpired,
            ]}
          >
            <View style={isExpired && styles.qrExpired}>
              <QRCode
                backgroundColor={colors.white}
                color={colors.black}
                size={qrCodeSize}
                value={qrValue}
              />
            </View>

            {isExpired ? (
              <View style={styles.expiredBadge}>
                <Ionicons color={colors.white} name="time-outline" size={15} />
                <Text style={styles.expiredBadgeText}>Đã hết hạn</Text>
              </View>
            ) : null}
          </View>

          <Text style={[styles.timer, isExpired && styles.timerExpired]}>
            {isExpired
              ? 'Mã QR đã hết hạn'
              : `Mã còn hiệu lực ${MemberQrSession.formatCountdown(remainingSeconds)}`}
          </Text>

          <Text maxFontSizeMultiplier={1.08} style={styles.fallbackText}>
            Nếu không quét được mã, vui lòng cung cấp Loyalty ID cho thu ngân.
          </Text>
        </View>

        <View style={styles.actionPanel}>
          <LinearGradient
            colors={['#08295B', '#0A3769']}
            end={{ x: 1, y: 0.5 }}
            start={{ x: 0, y: 0.5 }}
            style={styles.balanceCard}
          >
            <Text maxFontSizeMultiplier={1.08} style={styles.balanceLabel}>
              Số dư hiện tại
            </Text>
            <Text maxFontSizeMultiplier={1.08} style={styles.balance}>
              {formatPoints(points)} điểm
            </Text>
          </LinearGradient>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onNavigate('qr-scanner')}
              style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
            >
              <LinearGradient
                colors={['#0D77BD', '#005BAA']}
                end={{ x: 1, y: 0.5 }}
                start={{ x: 0, y: 0.5 }}
                style={styles.scanButtonGradient}
              >
                <Ionicons color={colors.white} name="scan-outline" size={21} />
                <Text style={styles.scanButtonText}>Quét QR</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleRefreshQr}
              style={({ pressed }) => [
                styles.actionButton,
                styles.refreshButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.refreshText}>Tạo mã mới</Text>
            </Pressable>
          </View>
        </View>
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
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  memberInfoCard: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
  },
  eyebrow: {
    color: colors.black,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  name: {
    marginTop: 7,
    color: colors.black,
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -0.45,
  },
  loyaltyId: {
    marginTop: 6,
    color: colors.black,
    fontSize: 14,
    fontWeight: '600',
  },
  qrSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  qrSectionExpired: {
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft,
  },
  qrCodeShell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  qrCodeShellExpired: {
    backgroundColor: '#FFF9EA',
  },
  qrExpired: {
    opacity: 0.28,
  },
  expiredBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  expiredBadgeText: {
    marginLeft: 5,
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  timer: {
    marginTop: 12,
    color: colors.success,
    fontSize: 13,
    fontWeight: '900',
  },
  timerExpired: {
    color: colors.warning,
  },
  fallbackText: {
    maxWidth: 280,
    marginTop: 6,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  actionPanel: {
    width: '100%',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  balanceCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 68,
    borderRadius: 15,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    fontWeight: '600',
  },
  balance: {
    marginTop: 4,
    color: colors.white,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.35,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    overflow: 'hidden',
    borderRadius: 12,
  },
  scanButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    marginLeft: 7,
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  refreshButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1.4,
    borderColor: '#1F6C82',
    backgroundColor: colors.white,
  },
  refreshText: {
    color: '#1F6077',
    fontSize: 14,
    fontWeight: '900',
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
