import Ionicons from '@expo/vector-icons/Ionicons';
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { clamp } from '../../shared/layout';
import { colors } from '../../theme/colors';
import {
  QrScanSession,
  type QrScanResult,
  type QrScannerPurpose,
} from './domain/QrScanSession';

type QrScannerScreenProps = {
  purpose?: QrScannerPurpose;
  onBack: () => void;
  onSupportPress?: () => void;
  onScan?: (result: QrScanResult) => void;
};

type ScannerIconName = ComponentProps<typeof Ionicons>['name'];

export function QrScannerScreen({
  purpose = 'general',
  onBack,
  onSupportPress,
  onScan,
}: QrScannerScreenProps) {
  const { height, width } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const scanLockRef = useRef(false);
  const [scanResult, setScanResult] = useState<QrScanResult | null>(null);
  const copy = useMemo(() => QrScanSession.getCopy(purpose), [purpose]);
  const compact = height < 780;
  const scanFrameSize = clamp(width * 0.68, compact ? 218 : 238, compact ? 286 : 318);
  const hasCameraAccess = permission?.granted;
  const helperIcon: ScannerIconName =
    purpose === 'invoice'
      ? 'receipt-outline'
      : purpose === 'loyalty-member'
        ? 'person-circle-outline'
        : 'qr-code-outline';

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (scanLockRef.current) return;

    scanLockRef.current = true;

    const nextResult = QrScanSession.fromBarcode(result);
    setScanResult(nextResult);
    onScan?.(nextResult);
  }

  function handleScanAgain() {
    setScanResult(null);
    scanLockRef.current = false;
  }

  return (
    <View style={styles.root}>
      <View style={styles.scannerHeader}>
        <Pressable
          accessibilityRole="button"
          hitSlop={10}
          onPress={onBack}
          style={styles.headerBackButton}
        >
          <Ionicons color={colors.primaryDark} name="chevron-back" size={32} />
        </Pressable>

        <Text maxFontSizeMultiplier={1.08} numberOfLines={1} style={styles.scannerTitle}>
          {copy.title}
        </Text>

        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onSupportPress}
          style={styles.supportButton}
        >
          <Ionicons color="#40678F" name="help-circle-outline" size={24} />
          <Text style={styles.supportText}>Hỗ trợ</Text>
        </Pressable>
      </View>

      <View style={styles.cameraStage}>
        {hasCameraAccess ? (
          <CameraView
            active={!scanResult}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            facing="back"
            onBarcodeScanned={scanResult ? undefined : handleBarcodeScanned}
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        <LinearGradient
          colors={['rgba(2,16,30,0.78)', 'rgba(7,49,91,0.42)', 'rgba(2,16,30,0.84)']}
          style={StyleSheet.absoluteFill}
        />

        {hasCameraAccess ? (
          <View style={styles.scanContent}>
            <View style={styles.scanCenter}>
              <View style={[styles.scanFrame, { height: scanFrameSize, width: scanFrameSize }]}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
                <View style={styles.innerFrame} />
                <View style={styles.scanLineGlow} />
                <View style={styles.scanLine} />
              </View>

              <Text maxFontSizeMultiplier={1.08} style={styles.instructionTitle}>
                {scanResult ? 'Đã quét được mã QR' : copy.instructionTitle}
              </Text>
              <Text maxFontSizeMultiplier={1.08} style={styles.instructionDescription}>
                {scanResult
                  ? 'Bạn có thể kiểm tra dữ liệu vừa quét hoặc quét lại mã khác.'
                  : copy.instructionDescription}
              </Text>
            </View>

            <View style={styles.helperCard}>
              <View style={styles.helperHeader}>
                <View style={styles.helperIcon}>
                  <Ionicons color="#2D6098" name={helperIcon} size={23} />
                </View>

                <View style={styles.helperCopy}>
                  <Text maxFontSizeMultiplier={1.08} style={styles.helperTitle}>
                    {scanResult ? 'Kết quả quét QR' : copy.helperTitle}
                  </Text>
                  <Text maxFontSizeMultiplier={1.08} style={styles.helperDescription}>
                    {scanResult ? 'Mã đã được đọc thành công từ camera.' : copy.helperDescription}
                  </Text>
                </View>
              </View>

              {scanResult ? (
                <ScrollView style={styles.resultBox}>
                  <Text selectable style={styles.resultText}>
                    {QrScanSession.formatPreview(scanResult)}
                  </Text>
                </ScrollView>
              ) : null}

              {scanResult ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleScanAgain}
                  style={({ pressed }) => [
                    styles.scanAgainButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Ionicons color={colors.white} name="scan-outline" size={20} />
                  <Text style={styles.scanAgainText}>Quét lại</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.permissionContent}>
            <View style={styles.permissionCard}>
              <Ionicons color={colors.primary} name="camera-outline" size={38} />
              <Text style={styles.permissionTitle}>Cần quyền truy cập camera</Text>
              <Text style={styles.permissionText}>
                Cho phép Napas DayOne sử dụng camera để quét mã QR.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={requestPermission}
                style={({ pressed }) => [
                  styles.permissionButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.permissionButtonText}>Cho phép camera</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const cornerBase = {
  position: 'absolute' as const,
  width: 58,
  height: 58,
  borderColor: '#3D80C4',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scannerHeader: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
  },
  headerBackButton: {
    width: 46,
    height: 46,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  scannerTitle: {
    position: 'absolute',
    left: 96,
    right: 96,
    textAlign: 'center',
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.45,
  },
  supportButton: {
    minWidth: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  supportText: {
    marginLeft: 4,
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '800',
  },
  cameraStage: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#061323',
  },
  scanContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 22,
  },
  scanCenter: {
    alignItems: 'center',
  },
  scanFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(82,178,235,0.14)',
  },
  innerFrame: {
    ...StyleSheet.absoluteFillObject,
    margin: 16,
    borderWidth: 2.4,
    borderColor: 'rgba(255,255,255,0.84)',
    borderRadius: 18,
  },
  corner: cornerBase,
  cornerTopLeft: {
    top: -18,
    left: -18,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: -18,
    right: -18,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: -18,
    left: -18,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    right: -18,
    bottom: -18,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderBottomRightRadius: 20,
  },
  scanLineGlow: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(72,199,255,0.2)',
  },
  scanLine: {
    position: 'absolute',
    left: 22,
    right: 22,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#5BD6FF',
  },
  instructionTitle: {
    marginTop: 46,
    textAlign: 'center',
    color: colors.white,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  instructionDescription: {
    maxWidth: 330,
    marginTop: 9,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  helperCard: {
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 18,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
  },
  helperHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helperIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#E9F2FE',
  },
  helperCopy: {
    flex: 1,
    marginLeft: 12,
  },
  helperTitle: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  helperDescription: {
    marginTop: 5,
    color: colors.black,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  resultBox: {
    maxHeight: 112,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#F4F8FC',
    padding: 12,
  },
  resultText: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 16,
  },
  scanAgainButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#2E67A5',
  },
  scanAgainText: {
    marginLeft: 8,
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  permissionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionCard: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: colors.white,
    padding: 26,
  },
  permissionTitle: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  permissionText: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  permissionButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
});
