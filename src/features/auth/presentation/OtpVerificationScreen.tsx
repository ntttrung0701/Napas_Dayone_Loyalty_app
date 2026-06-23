import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';

const OTP_LENGTH = 6;
const OTP_VALIDITY_SECONDS = 180;
import { PrimaryButton } from '../../../shared/components/PrimaryButton';

class OtpScreenText {
  static readonly title = 'Nhập mã OTP';
  static readonly description = 'Kiểm tra tin nhắn SMS trên thiết bị sử dụng số điện thoại mà chúng tôi vừa gửi';
  static readonly confirm = 'Xác nhận';
  static readonly contactPrefix = 'Bạn gặp sự cố ?';
  static readonly contact = 'Liên hệ chúng tôi';

  static resendCountdown(seconds: number) {
  return `Mã OTP sẽ được gửi lại sau ${OtpCountdown.format(seconds)}`;
}

  static expired() {
    return 'Mã OTP đã hết hạn';
  }

  static resendReady() {
    return 'Bạn chưa nhận được mã?';
  }
}

class OtpCountdown {
  static format(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
}

import { colors } from '../../../theme/colors';
import type { OtpChallenge } from '../domain/AuthModels';
import { AuthShell, FormError } from './AuthUi';

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
  const inputRef = useRef<TextInputType>(null);
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(OTP_VALIDITY_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isComplete = code.length === OTP_LENGTH;
  const isExpired = seconds <= 0;

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setTimeout(() => setSeconds((current) => current - 1), 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  const updateCode = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(digitsOnly);

    if (error) {
      setError(null);
    }
  };

  const verify = async () => {
    if (!isComplete || loading || isExpired) return;

    setLoading(true);
    setError(null);

    try {
      await onVerify(code);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không thể xác thực OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (seconds > 0 || loading) return;

    setLoading(true);
    setError(null);

    try {
      await onResend();
      setCode('');
      setSeconds(OTP_VALIDITY_SECONDS);
      inputRef.current?.focus();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không thể gửi lại OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell onBack={onBack}>
      <View style={styles.otpCard}>
        <Text style={styles.title}>{OtpScreenText.title}</Text>

        <Text style={styles.description}>{OtpScreenText.description}</Text>
        <Text style={styles.destination}>{challenge.destination}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => inputRef.current?.focus()}
          style={styles.digitPressArea}
        >
          <OtpDigitBoxes code={code} />
        </Pressable>

        <TextInput
          ref={inputRef}
          autoFocus
          caretHidden
          contextMenuHidden
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          onChangeText={updateCode}
          onSubmitEditing={verify}
          returnKeyType="done"
          style={styles.hiddenInput}
          value={code}
        />

        <View style={styles.timerBlock}>
          {isExpired ? (
            <>
              <Text style={styles.expiredText}>{OtpScreenText.expired()}</Text>
              <Pressable disabled={loading} onPress={resend}>
                <Text style={styles.resendText}>Gửi lại mã</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.timerText}>{OtpScreenText.resendCountdown(seconds)}</Text>
          )}
        </View>

        <FormError message={error} />

        <View style={styles.confirmButtonWrap}>
  <PrimaryButton
    disabled={!isComplete || loading || isExpired}
    label={loading ? 'Đang xác nhận...' : OtpScreenText.confirm}
    onPress={verify}
  />
</View>

        <View style={styles.contactRow}>
          <Text style={styles.contactHint}>{OtpScreenText.contactPrefix}</Text>
          <Pressable>
            <Text style={styles.contactLink}>{OtpScreenText.contact}</Text>
          </Pressable>
        </View>
      </View>
    </AuthShell>
  );
}

function OtpDigitBoxes({ code }: { code: string }) {
  return (
    <View style={styles.digitRow}>
      {Array.from({ length: OTP_LENGTH }).map((_, index) => {
        const digit = code[index];
        const isActive = code.length === index;

        return (
          <View
            key={index}
            style={[styles.digitBox, isActive && styles.digitBoxActive]}
          >
            <Text style={styles.digitText}>{digit ?? ''}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  otpCard: {
    width: '100%',
    marginTop: 28,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 24,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  title: {
    textAlign: 'center',
    color: colors.black,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  description: {
    marginTop: 22,
    color: '#294B8C',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
  },
  destination: {
    marginTop: 18,
    color: colors.black,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 2,
  },
  digitPressArea: {
    marginTop: 26,
  },
  digitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 11,
  },
  digitBox: {
    width: 52,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#3E5C96',
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  digitBoxActive: {
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: '#F7FAFF',
  },
  digitText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  timerBlock: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  timerText: {
    textAlign: 'center',
    color: '#294B8C',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  expiredText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
  },
  resendText: {
    marginTop: 6,
    color: '#1D5EFF',
    fontSize: 14,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  confirmButtonWrap: {
    marginTop: 14,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 22,
  },
  contactHint: {
    color: colors.black,
    fontSize: 13,
  },
  contactLink: {
    color: '#1D5EFF',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
