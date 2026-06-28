import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../theme/colors';
import type { RegistrationInput } from '../domain/AuthModels';
import { authScreenPresentations } from './AuthScreenPresentation';
import { AuthField, AuthShell, DemoOtpNotice, FormError } from './AuthUi';
import { PASSWORD_RULE_HINT } from '../domain/AuthValidation';

export function RegistrationScreen({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (input: RegistrationInput) => Promise<void>;
}) {
  const [form, setForm] = useState<RegistrationInput>({
    fullName: '', phone: '', email: '', clientCode: '', password: '', confirmPassword: '', acceptedTerms: false,
  });
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const update = <K extends keyof RegistrationInput>(key: K, value: RegistrationInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try { await onSubmit(form); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể tạo tài khoản.'); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell onBack={onBack} presentation={authScreenPresentations.registration}>
      <DemoOtpNotice />
      <FormError message={error} />
      <AuthField icon="person-outline" label="Họ và tên" onChangeText={(value) => update('fullName', value)} placeholder="Nhập họ và tên" value={form.fullName} />
      <AuthField
  icon="call-outline"
  keyboardType="phone-pad"
  label="Số điện thoại"
  onChangeText={(value) => update('phone', value)}
  placeholder="Nhập số điện thoại"
  value={form.phone}
/>
      <AuthField
  autoCapitalize="none"
  icon="mail-outline"
  keyboardType="email-address"
  label="Email"
  onChangeText={(value) => update('email', value)}
  placeholder="Nhập email"
  value={form.email}
/>
      <AuthField icon="business-outline" label="CIF / Mã khách hàng" onChangeText={(value) => update('clientCode', value)} placeholder="Nhập CIF / mã khách hàng" value={form.clientCode} />
      <AuthField icon="lock-closed-outline" label="Mật khẩu" onChangeText={(value) => update('password', value)} onToggleSecure={() => setSecure((current) => !current)} placeholder={PASSWORD_RULE_HINT} secureTextEntry={secure} value={form.password} />
      <AuthField icon="lock-closed-outline" label="Nhập lại mật khẩu" onChangeText={(value) => update('confirmPassword', value)} onToggleSecure={() => setSecure((current) => !current)} placeholder="Nhập lại mật khẩu" secureTextEntry={secure} value={form.confirmPassword} />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: form.acceptedTerms }}
        onPress={() => update('acceptedTerms', !form.acceptedTerms)}
        style={styles.terms}
      >
        <View style={[styles.checkbox, form.acceptedTerms && styles.checked]}>
          {form.acceptedTerms ? <Ionicons color={colors.white} name="checkmark" size={14} /> : null}
        </View>
        <Text maxFontSizeMultiplier={1.08} style={styles.termsText}>Tôi đã đọc và đồng ý với điều khoản, chính sách của Napas.</Text>
      </Pressable>
      <PrimaryButton disabled={loading} label={loading ? 'Đang gửi OTP...' : 'Đăng ký'} onPress={submit} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  terms: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 17 },
  checkbox: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: '#98A2B3', borderRadius: 4 },
  checked: { borderColor: '#3C5C98', backgroundColor: '#3C5C98' },
  termsText: { flex: 1, color: '#294B8C', fontSize: 11, lineHeight: 16 },
});
