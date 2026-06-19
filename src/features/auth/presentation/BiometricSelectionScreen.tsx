import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';
import type { BiometricCapabilities, BiometricKind } from '../domain/AuthModels';
import { AuthShell, FormError } from './AuthUi';

export function BiometricSelectionScreen({
  onBack,
  loadCapabilities,
  onAuthenticate,
}: {
  onBack: () => void;
  loadCapabilities: () => Promise<BiometricCapabilities>;
  onAuthenticate: (kind: BiometricKind) => Promise<void>;
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

  const ready = capabilities?.hasHardware && capabilities.isEnrolled;
  return (
    <AuthShell onBack={onBack} subtitle="Chọn phương thức đã thiết lập trên thiết bị" title="SINH TRẮC HỌC">
      {!capabilities && !error ? <ActivityIndicator color="#3C5C98" size="large" /> : null}
      <FormError message={error} />
      {capabilities && !ready ? (
        <Text style={styles.notice}>Thiết bị chưa hỗ trợ hoặc chưa đăng ký sinh trắc học. Hãy kiểm tra trong phần Cài đặt.</Text>
      ) : null}
      <BiometricOption
        disabled={!ready || !capabilities?.face || loadingKind !== null}
        icon="scan-outline"
        label="Nhận diện khuôn mặt"
        loading={loadingKind === 'face'}
        onPress={() => authenticate('face')}
      />
      <BiometricOption
        disabled={!ready || !capabilities?.fingerprint || loadingKind !== null}
        icon="finger-print-outline"
        label="Xác thực vân tay"
        loading={loadingKind === 'fingerprint'}
        onPress={() => authenticate('fingerprint')}
      />
      <Text style={styles.security}>Sinh trắc học chỉ dùng sau khi bạn đã đăng nhập bằng mật khẩu và bật Ghi nhớ tài khoản. Napas không lưu dữ liệu khuôn mặt hoặc vân tay; hệ điều hành xử lý việc xác thực.</Text>
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
      <Text style={styles.optionText}>{loading ? 'Đang xác thực...' : label}</Text>
      <Ionicons color="#667085" name="chevron-forward" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  notice: { marginBottom: 16, borderRadius: 10, backgroundColor: '#FFF4E5', color: '#9A6700', padding: 12, fontSize: 12, lineHeight: 18 },
  option: { minHeight: 76, flexDirection: 'row', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#98A2B3', borderRadius: 13, backgroundColor: colors.white, paddingHorizontal: 16 },
  disabled: { opacity: 0.42 },
  optionText: { flex: 1, marginLeft: 14, color: '#294B8C', fontSize: 14, fontWeight: '700' },
  security: { marginTop: 12, textAlign: 'center', color: '#667085', fontSize: 11, lineHeight: 17 },
});
