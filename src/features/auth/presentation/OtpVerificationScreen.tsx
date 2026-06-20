import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors } from '../../../theme/colors';
import type { OtpChallenge } from '../domain/AuthModels';
import { authScreenPresentations } from './AuthScreenPresentation';
import { AuthShell, DemoOtpNotice, FormError } from './AuthUi';

export function OtpVerificationScreen({
  challenge,
  onBack,
  onVerify,
  onResend,
}: {
  challenge: OtpChallenge;
  onBack: () => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void> | void;
}) {
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(47);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const verify = async () => {
    if (code.length !== 6 || loading) return;
    setLoading(true); setError(null);
    try { await onVerify(code); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể xác thực OTP.'); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    if (seconds > 0 || loading) return;
    setError(null);
    try { await onResend(); setSeconds(47); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể gửi lại OTP.'); }
  };

  return (
    <AuthShell
      onBack={onBack}
      presentation={authScreenPresentations.otp.withSubtitle(
        `Nhập mã OTP đã gửi tới ${challenge.destination}`,
      )}
    >
      <DemoOtpNotice />
      <FormError message={error} />
      <TextInput
        accessibilityLabel="Mã OTP gồm 6 chữ số"
        autoFocus
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
        onSubmitEditing={verify}
        placeholder="• • • • • •"
        placeholderTextColor="#B7BBC2"
        style={styles.otpInput}
        value={code}
      />
      <View style={styles.timerRow}>
        <Text style={styles.timerText}>
          {seconds > 0 ? `Có thể gửi lại mã sau ${seconds} giây` : 'Bạn chưa nhận được mã?'}
        </Text>
        {seconds === 0 ? (
          <Pressable accessibilityRole="button" onPress={resend}>
            <Text style={styles.resend}> Gửi lại</Text>
          </Pressable>
        ) : null}
      </View>
      <PrimaryButton disabled={code.length !== 6 || loading} label={loading ? 'Đang xác thực...' : 'Xác nhận'} onPress={verify} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  otpInput: {
    height: 62,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#98A2B3',
    borderRadius: 13,
    backgroundColor: colors.white,
    textAlign: 'center',
    color: '#294B8C',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 12,
  },
  timerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  timerText: { color: '#294B8C', fontSize: 12 },
  resend: { color: '#1D5EFF', fontSize: 12, fontWeight: '700' },
});
