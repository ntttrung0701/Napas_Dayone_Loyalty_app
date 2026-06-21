import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions, type CameraCapturedPicture } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme/colors';
import type { FaceCapture } from '../domain/AuthModels';
import type { FaceAlignmentResult } from '../domain/FaceRecognition';

type FaceVerificationScreenProps = {
  analyzeFace: (capture: FaceCapture) => Promise<FaceAlignmentResult>;
  onBack: () => void;
  onVerified: (capture: FaceCapture) => Promise<void>;
};

const initialGuidance = 'Đưa khuôn mặt vào giữa khung và nhìn thẳng camera.';

export function FaceVerificationScreen({
  analyzeFace,
  onBack,
  onVerified,
}: FaceVerificationScreenProps) {
  const cameraRef = useRef<CameraView>(null);
  const scanningRef = useRef(false);
  const completedRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [detectorAvailable, setDetectorAvailable] = useState(true);
  const [aligned, setAligned] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [guidance, setGuidance] = useState(initialGuidance);
  const [error, setError] = useState<string | null>(null);

  const completeVerification = useCallback(
    async (picture: CameraCapturedPicture) => {
      if (completedRef.current) return;
      completedRef.current = true;
      setAligned(true);
      setVerifying(true);
      setGuidance('Mặt bạn đã thẳng, đang tiến hành nhận dạng');
      await new Promise((resolve) => setTimeout(resolve, 650));
      try {
        await onVerified({
          uri: picture.uri,
          width: picture.width,
          height: picture.height,
        });
      } catch (caught) {
        completedRef.current = false;
        setAligned(false);
        setVerifying(false);
        setGuidance(initialGuidance);
        setError(
          caught instanceof Error
            ? caught.message
            : 'Không thể xác minh khuôn mặt. Vui lòng thử lại.',
        );
      }
    },
    [onVerified],
  );

  const inspectFace = useCallback(
    async (allowCameraOnlyFallback = false) => {
      if (
        !cameraRef.current ||
        !cameraReady ||
        scanningRef.current ||
        completedRef.current
      ) {
        return;
      }

      scanningRef.current = true;
      let picture: CameraCapturedPicture | null = null;
      try {
        picture = await cameraRef.current.takePictureAsync({
          quality: 0.25,
          shutterSound: false,
          skipProcessing: true,
        });
        const result = await analyzeFace({
          uri: picture.uri,
          width: picture.width,
          height: picture.height,
        });
        setDetectorAvailable(true);
        setGuidance(result.message);
        setAligned(result.isReady);
        if (result.isReady) await completeVerification(picture);
      } catch (caught) {
        setDetectorAvailable(false);
        setGuidance(
          allowCameraOnlyFallback
            ? 'Mặt bạn đã thẳng, đang tiến hành nhận dạng'
            : 'Giữ khuôn mặt trong khung rồi nhấn nút xác minh.',
        );
        if (allowCameraOnlyFallback && picture) await completeVerification(picture);
      } finally {
        scanningRef.current = false;
      }
    },
    [analyzeFace, cameraReady, completeVerification],
  );

  useEffect(() => {
    if (!cameraReady || !detectorAvailable || verifying) return undefined;
    const timer = setInterval(() => {
      void inspectFace(false);
    }, 1100);
    return () => clearInterval(timer);
  }, [cameraReady, detectorAvailable, inspectFace, verifying]);

  if (!permission) {
    return (
      <View style={styles.permissionPage}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.permissionDescription}>Đang kiểm tra quyền camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionPage}>
        <View style={styles.permissionIcon}>
          <Ionicons color={colors.primary} name="camera-outline" size={34} />
        </View>
        <Text style={styles.permissionTitle}>Cho phép sử dụng camera</Text>
        <Text style={styles.permissionDescription}>
          Napas DayOne cần camera trước để tạo khung xác minh khuôn mặt. Ảnh không được
          lưu trong dữ liệu ứng dụng.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={requestPermission}
          style={({ pressed }) => [styles.permissionButton, pressed && styles.pressed]}
        >
          <Text style={styles.permissionButtonText}>Cấp quyền camera</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Quay lại đăng nhập</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
          disabled={verifying}
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.white} name="arrow-back" size={23} />
        </Pressable>
        <Text style={styles.headerTitle}>Xác thực khuôn mặt</Text>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.intro}>
        <View style={styles.securityBadge}>
          <Ionicons color="#79E6B4" name="shield-checkmark-outline" size={15} />
          <Text style={styles.securityBadgeText}>CAMERA TRƯỚC • KHÔNG LƯU ẢNH</Text>
        </View>
        <Text style={styles.introTitle}>Nhận diện khuôn mặt</Text>
      </View>

      <View style={styles.cameraSection}>
        <View
          style={[
            styles.cameraWindow,
            aligned && styles.cameraWindowAligned,
          ]}
        >
          <CameraView
            facing="front"
            mirror
            mode="picture"
            onCameraReady={() => setCameraReady(true)}
            onMountError={(event) => setError(event.message)}
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="none" style={styles.cameraShade} />
          <View pointerEvents="none" style={styles.faceGuideInner} />
          {verifying ? (
            <View pointerEvents="none" style={styles.verifyingOverlay}>
              <ActivityIndicator color={colors.white} size="large" />
            </View>
          ) : null}
        </View>

        <View style={styles.guidanceRow}>
          <Ionicons
            color={aligned ? '#53E0A5' : '#D5E8F6'}
            name={aligned ? 'checkmark-circle' : 'scan-outline'}
            size={20}
          />
          <Text style={[styles.guidanceText, aligned && styles.guidanceTextAligned]}>
            {cameraReady ? guidance : 'Đang mở camera trước...'}
          </Text>
        </View>
        {!aligned ? (
          <Text style={styles.hintText}>
            Đưa mặt đủ gần, ở chính giữa khung và giữ đầu thẳng.
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons color="#FFB4AB" name="alert-circle-outline" size={17} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!detectorAvailable ? (
          <Pressable
            accessibilityRole="button"
            disabled={!cameraReady || verifying}
            onPress={() => inspectFace(true)}
            style={({ pressed }) => [
              styles.fallbackButton,
              (!cameraReady || verifying) && styles.buttonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons color={colors.primaryDark} name="scan-outline" size={22} />
            <Text style={styles.fallbackButtonText}>Xác minh bằng camera</Text>
          </Pressable>
        ) : (
          <View style={styles.autoNotice}>
            <ActivityIndicator color="#79E6B4" size="small" />
            <Text style={styles.autoNoticeText}>
              Hệ thống tự động kiểm tra khi khuôn mặt đã đúng vị trí
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#071B2D' },
  pressed: { opacity: 0.7 },
  header: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerSide: { width: 42 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  intro: { alignItems: 'center', paddingBottom: 15, paddingTop: 18 },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(83,224,165,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  securityBadgeText: {
    marginLeft: 5,
    color: '#79E6B4',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  introTitle: {
    marginTop: 10,
    color: colors.white,
    fontSize: 21,
    fontWeight: '900',
  },
  cameraSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cameraWindow: {
    width: 238,
    height: 318,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.86)',
    borderRadius: 120,
    backgroundColor: '#102A3F',
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 13,
  },
  cameraWindowAligned: {
    borderColor: '#53E0A5',
    shadowColor: '#53E0A5',
    shadowOpacity: 0.7,
    shadowRadius: 18,
  },
  cameraShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3,14,24,0.06)',
  },
  faceGuideInner: {
    position: 'absolute',
    top: 14,
    right: 14,
    bottom: 14,
    left: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 108,
  },
  verifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,75,55,0.22)',
  },
  guidanceRow: {
    maxWidth: 340,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 18,
  },
  guidanceText: {
    flexShrink: 1,
    marginLeft: 8,
    textAlign: 'center',
    color: '#D5E8F6',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  guidanceTextAligned: { color: '#53E0A5' },
  hintText: {
    maxWidth: 320,
    marginTop: 6,
    textAlign: 'center',
    color: '#93AFC4',
    fontSize: 10,
    lineHeight: 16,
  },
  footer: { minHeight: 92, justifyContent: 'center', paddingHorizontal: 22, paddingBottom: 18 },
  autoNotice: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
  },
  autoNoticeText: { marginLeft: 8, color: '#D5E8F6', fontSize: 10, fontWeight: '700' },
  fallbackButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: colors.white,
  },
  fallbackButtonText: {
    marginLeft: 8,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
  },
  buttonDisabled: { opacity: 0.58 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(120,20,20,0.7)',
    padding: 11,
  },
  errorText: { flex: 1, marginLeft: 7, color: '#FFE8E6', fontSize: 10, lineHeight: 15 },
  permissionPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 28,
  },
  permissionIcon: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    backgroundColor: colors.primarySoft,
  },
  permissionTitle: { marginTop: 18, color: colors.text, fontSize: 19, fontWeight: '900' },
  permissionDescription: {
    maxWidth: 330,
    marginTop: 10,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 19,
  },
  permissionButton: {
    minWidth: 210,
    alignItems: 'center',
    marginTop: 22,
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  permissionButtonText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  cancelButton: { marginTop: 16, padding: 10 },
  cancelText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
});
