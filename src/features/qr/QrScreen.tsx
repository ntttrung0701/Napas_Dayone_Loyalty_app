import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '../../shared/components/BottomNav';
import { BrandLogo } from '../../shared/components/BrandLogo';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { colors } from '../../theme/colors';
import type { AppScreen, MainTab } from '../../types';
import { formatPoints } from '../../utils/format';

type QrScreenProps = {
  activeTab: MainTab;
  points: number;
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
};

const qrSize = 13;

function isDarkCell(row: number, column: number) {
  const inFinder =
    (row < 5 && column < 5) ||
    (row < 5 && column >= qrSize - 5) ||
    (row >= qrSize - 5 && column < 5);
  const finderBorder =
    inFinder &&
    (row % (qrSize - 8) === 0 ||
      column % (qrSize - 8) === 0 ||
      row % (qrSize - 8) === 4 ||
      column % (qrSize - 8) === 4);
  return finderBorder || (!inFinder && (row * 3 + column * 5 + row * column) % 7 < 3);
}

export function QrScreen({ activeTab, points, onBack, onNavigate }: QrScreenProps) {
  const [seconds, setSeconds] = useState(115);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((current) => (current > 0 ? current - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Mã QR đổi điểm" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>THÀNH VIÊN LIÊN KẾT</Text>
        <Text style={styles.name}>NGUYỄN VAN ANH</Text>
        <Text style={styles.loyaltyId}>Loyalty ID: •••• •••• 5829</Text>

        <View style={styles.qrCard}>
          <View style={styles.qrGrid}>
            {Array.from({ length: qrSize }).map((_, row) => (
              <View key={row} style={styles.qrRow}>
                {Array.from({ length: qrSize }).map((__, column) => (
                  <View
                    key={`${row}-${column}`}
                    style={[styles.qrCell, isDarkCell(row, column) && styles.qrCellDark]}
                  />
                ))}
              </View>
            ))}
          </View>
          <View style={styles.qrLogo}>
            <BrandLogo width={42} />
          </View>
        </View>

        <Text style={styles.timer}>
          Mã có hiệu lực trong {minutes.toString().padStart(2, '0')}:
          {remainingSeconds.toString().padStart(2, '0')}
        </Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
          <Text style={styles.balance}>{formatPoints(points)} điểm</Text>
        </View>

        <View style={styles.securityNotice}>
          <Text style={styles.securityText}>
            Chỉ cung cấp mã QR cho nhân viên tại quầy hợp lệ. Tạo mã mới nếu có dấu hiệu đáng ngờ.
          </Text>
        </View>

        <Pressable onPress={() => setSeconds(115)} style={styles.refreshButton}>
          <Ionicons color={colors.primary} name="refresh-outline" size={17} />
          <Text style={styles.refreshText}>TẠO MÃ MỚI</Text>
        </Pressable>
      </View>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', padding: 20 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  name: { marginTop: 8, color: colors.text, fontSize: 18, fontWeight: '900' },
  loyaltyId: { marginTop: 5, color: colors.textMuted, fontSize: 11 },
  qrCard: {
    width: 236,
    height: 236,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    borderRadius: 24,
    backgroundColor: colors.surface,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  qrGrid: { width: 182, height: 182 },
  qrRow: { flex: 1, flexDirection: 'row' },
  qrCell: { flex: 1, backgroundColor: colors.white },
  qrCellDark: { backgroundColor: colors.primaryDark },
  qrLogo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderWidth: 4,
    borderColor: colors.white,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  timer: { marginTop: 16, color: colors.warning, fontSize: 11, fontWeight: '800' },
  balanceCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    padding: 16,
  },
  balanceLabel: { color: '#BDD2E2', fontSize: 11 },
  balance: { color: colors.white, fontSize: 17, fontWeight: '900' },
  securityNotice: {
    width: '100%',
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: colors.warningSoft,
    padding: 12,
  },
  securityText: { textAlign: 'center', color: colors.warning, fontSize: 10, lineHeight: 15 },
  refreshButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  refreshText: { marginLeft: 7, color: colors.primary, fontSize: 11, fontWeight: '900' },
});
