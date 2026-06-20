import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../theme/colors';
import type { LoginInput } from '../domain/AuthModels';
import { authScreenPresentations } from './AuthScreenPresentation';
import { AuthField, AuthShell, FormError } from './AuthUi';

export type NapasLoginScreenProps = {
  initialIdentifier?: string;
  initialRemember?: boolean;
  message?: string | null;
  onSubmit?: (input: LoginInput) => Promise<void> | void;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
  onBiometric?: () => void;
  /** Tương thích tạm thời với App cũ; AuthFlow sử dụng onSubmit. */
  onLogin?: () => void;
};

export function NapasLoginScreen({
  initialIdentifier = '',
  initialRemember = false,
  message,
  onSubmit,
  onForgotPassword,
  onCreateAccount,
  onBiometric,
  onLogin,
}: NapasLoginScreenProps) {
  const [account, setAccount] = useState(initialIdentifier);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(initialRemember);
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialIdentifier) {
      setAccount(initialIdentifier);
      setRemember(initialRemember);
    }
  }, [initialIdentifier, initialRemember]);

  const valid = account.trim().length > 0 && password.length >= 6;
  const submit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    setError(null);
    try {
      if (onSubmit) await onSubmit({ identifier: account, password, rememberIdentifier: remember });
      else if (onLogin) onLogin();
      else throw new Error('Luồng đăng nhập chưa được cấu hình.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      footer={
        <View style={styles.demoNotice}>
          <Ionicons color={colors.success} name="shield-checkmark-outline" size={15} />
          <Text style={styles.demoNoticeText}>Môi trường demo — không dùng thông tin thật</Text>
        </View>
      }
      presentation={authScreenPresentations.login}
    >
      {message ? <Text style={styles.successMessage}>{message}</Text> : null}
      <FormError message={error} />
      <AuthField
        autoComplete="username"
        icon="person-outline"
        label="Số điện thoại / Email / CIF"
        onChangeText={setAccount}
        placeholder="Nhập tên đăng nhập"
        value={account}
      />
      <AuthField
        autoComplete="current-password"
        icon="lock-closed-outline"
        label="Mật khẩu"
        onChangeText={setPassword}
        onSubmitEditing={submit}
        onToggleSecure={() => setSecure((current) => !current)}
        placeholder="Nhập mật khẩu"
        secureTextEntry={secure}
        value={password}
      />
      <View style={styles.helperRow}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: remember }}
          onPress={() => setRemember((current) => !current)}
          style={styles.remember}
        >
          <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
            {remember ? <Ionicons color={colors.white} name="checkmark" size={15} /> : null}
          </View>
          <Text style={styles.rememberText}>Ghi nhớ tài khoản</Text>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={onForgotPassword}>
          <Text style={styles.link}>Quên mật khẩu?</Text>
        </Pressable>
      </View>
      <PrimaryButton disabled={!valid || loading} label={loading ? 'Đang đăng nhập...' : 'Đăng nhập'} onPress={submit} />
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.or}>Hoặc</Text>
        <View style={styles.divider} />
      </View>
      <Pressable accessibilityRole="button" onPress={onBiometric} style={styles.biometricButton}>
        <Ionicons color={colors.text} name="finger-print-outline" size={24} />
        <Text style={styles.biometricText}>Đăng nhập bằng khuôn mặt / vân tay</Text>
      </Pressable>
      <View style={styles.signupRow}>
        <Text style={styles.signupText}>Chưa có tài khoản? </Text>
        <Pressable accessibilityRole="link" onPress={onCreateAccount}>
          <Text style={styles.signupLink}>Tạo tài khoản</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  successMessage: { marginBottom: 12, borderRadius: 9, backgroundColor: '#E7F6EC', color: '#18794E', padding: 10, fontSize: 11 },
  demoAccount: { marginBottom: 12, textAlign: 'center', color: '#667085', fontSize: 11 },
  helperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  remember: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', marginRight: 7, borderWidth: 1, borderColor: '#555B64', borderRadius: 4, backgroundColor: '#E9E9E9' },
  checkboxChecked: { borderColor: '#3C5C98', backgroundColor: '#3C5C98' },
  rememberText: { color: colors.black, fontSize: 12 },
  link: { color: '#1D5EFF', fontSize: 12, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  divider: { flex: 1, height: 1, backgroundColor: '#D5D5D5' },
  or: { marginHorizontal: 18, color: colors.black, fontSize: 12 },
  biometricButton: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#82868D', borderRadius: 11, backgroundColor: colors.white },
  biometricText: { marginLeft: 10, color: colors.black, fontSize: 12 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signupText: { color: colors.black, fontSize: 12 },
  signupLink: { color: '#1D5EFF', fontSize: 12, textDecorationLine: 'underline' },
  demoNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  demoNoticeText: { marginLeft: 6, color: colors.success, fontSize: 10, fontWeight: '600' },
});
