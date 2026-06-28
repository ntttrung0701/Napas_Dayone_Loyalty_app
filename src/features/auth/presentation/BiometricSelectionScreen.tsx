import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { BiometricCapabilities, BiometricKind } from '../domain/AuthModels';
import { authScreenPresentations } from './AuthScreenPresentation';
import { AuthShell, FormError } from './AuthUi';

export function BiometricSelectionScreen({
  onBack,
  loadCapabilities,
  onAuthenticate,
  onFaceCamera,
}: {
  onBack: () => void;
  loadCapabilities: () => Promise<BiometricCapabilities>;
  onAuthenticate: (kind: BiometricKind) => Promise<void>;
  onFaceCamera: () => void;
}) {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [loadingKind, setLoadingKind] = useState<BiometricKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadCapabilities()
      .then((value) => { if (active) setCapabilities(value); })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'Không thể kiểm tra sinh trắc học.'); });
    return () => { active = false; };
  }, [loadCapabilities]);

  const authenticate = async (kind: BiometricKind) => {
    setLoadingKind(kind); setError(null);
    try { await onAuthenticate(kind); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Xác thực không thành công.'); }
    finally { setLoadingKind(null); }
  };

  const fingerprintReady =
    capabilities?.hasHardware && capabilities.isEnrolled && capabilities.fingerprint;
  return (
    <AuthShell onBack={onBack} presentation={authScreenPresentations.biometric}>
      {!capabilities && !error ? <ActivityIndicator color="#3C5C98" size="large" /> : null}
      <FormError message={error} />
      {capabilities && !fingerprintReady ? (
        <Text maxFontSizeMultiplier={1.08} style={styles.notice}>
          Thiết bị chưa đăng ký vân tay hệ thống. Bạn vẫn có thể mở camera trước để xác minh khuôn mặt.
        </Text>
      ) : null}
      <BiometricOption
        disabled={loadingKind !== null}
        icon="scan-outline"
        label="Nhận diện bằng camera trước"
        loading={false}
        onPress={onFaceCamera}
      />
      <BiometricOption
        disabled={!fingerprintReady || loadingKind !== null}
        icon="finger-print-outline"
        label="Xác thực vân tay"
        loading={loadingKind === 'fingerprint'}
        onPress={() => authenticate('fingerprint')}
      />
      <Text maxFontSizeMultiplier={1.08} style={styles.security}>
        Chức năng chỉ dùng sau khi bạn đăng nhập bằng mật khẩu và bật Ghi nhớ tài khoản. Ảnh camera không được lưu; lớp xác minh demo có thể được thay bằng Face Matching/Liveness API khi triển khai thật.
      </Text>
    </AuthShell>
  );
}

function BiometricOption({
  disabled,
  icon,
  label,
  loading,
  onPress,
}: {
  disabled: boolean;
  icon: 'scan-outline' | 'finger-print-outline';
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.option, disabled && styles.disabled]}>
      {loading ? <ActivityIndicator color="#3C5C98" /> : <Ionicons color="#3C5C98" name={icon} size={36} />}
      <Text maxFontSizeMultiplier={1.08} numberOfLines={2} style={styles.optionText}>{loading ? 'Đang xác thực...' : label}</Text>
      <Ionicons color="#667085" name="chevron-forward" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  notice: { marginBottom: 16, borderRadius: 10, backgroundColor: '#FFF4E5', color: '#9A6700', padding: 12, fontSize: 12, lineHeight: 18 },
  option: { minHeight: 76, flexDirection: 'row', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#98A2B3', borderRadius: 13, backgroundColor: colors.white, paddingHorizontal: 16 },
  disabled: { opacity: 0.42 },
  optionText: { flex: 1, minWidth: 0, marginLeft: 14, color: '#294B8C', fontSize: 14, fontWeight: '700', lineHeight: 19 },
  security: { marginTop: 12, textAlign: 'center', color: '#667085', fontSize: 11, lineHeight: 17 },
});
