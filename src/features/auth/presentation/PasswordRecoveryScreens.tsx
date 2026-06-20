import { useState } from 'react';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import type { ForgotPasswordInput } from '../domain/AuthModels';
import { authScreenPresentations } from './AuthScreenPresentation';
import { AuthField, AuthShell, DemoOtpNotice, FormError } from './AuthUi';

export function ForgotPasswordScreen({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (input: ForgotPasswordInput) => Promise<void>;
}) {
  const [phone, setPhone] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    setLoading(true); setError(null);
    try { await onSubmit({ phone, clientCode }); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể gửi mã OTP.'); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell onBack={onBack} presentation={authScreenPresentations.forgotPassword}>
      <DemoOtpNotice />
      <FormError message={error} />
      <AuthField icon="call-outline" keyboardType="phone-pad" label="Số điện thoại" onChangeText={setPhone} placeholder="Nhập số điện thoại" value={phone} />
      <AuthField icon="business-outline" label="CIF / Mã khách hàng" onChangeText={setClientCode} placeholder="Nhập CIF / mã khách hàng" value={clientCode} />
      <PrimaryButton disabled={loading} label={loading ? 'Đang gửi...' : 'Gửi mã OTP'} onPress={submit} />
    </AuthShell>
  );
}

export function ResetPasswordScreen({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (password: string, confirmPassword: string) => Promise<void>;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    setLoading(true); setError(null);
    try { await onSubmit(password, confirmPassword); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể đặt lại mật khẩu.'); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell onBack={onBack} presentation={authScreenPresentations.resetPassword}>
      <FormError message={error} />
      <AuthField icon="lock-closed-outline" label="Mật khẩu mới" onChangeText={setPassword} onToggleSecure={() => setSecure((current) => !current)} placeholder="Tối thiểu 6 ký tự" secureTextEntry={secure} value={password} />
      <AuthField icon="lock-closed-outline" label="Nhập lại mật khẩu mới" onChangeText={setConfirmPassword} onToggleSecure={() => setSecure((current) => !current)} placeholder="Nhập lại mật khẩu" secureTextEntry={secure} value={confirmPassword} />
      <PrimaryButton disabled={loading} label={loading ? 'Đang xác nhận...' : 'Xác nhận'} onPress={submit} />
    </AuthShell>
  );
}
