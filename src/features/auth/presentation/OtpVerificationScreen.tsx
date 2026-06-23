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

class OtpScreenText {
  static readonly title = 'Nhập mã OTP';
  static readonly description = 'Kiểm tra tin nhắn SMS trên thiết bị sử dụng số điện thoại mà chúng tôi vừa gửi';
  static readonly confirm = 'Xác nhận';
  static readonly contactPrefix = 'Bạn gặp sự cố ?';
  static readonly contact = 'Liên hệ chúng tôi';

  static resendCountdown(seconds: number) {
    return `The OTP code will resend in ${OtpCountdown.format(seconds)}`;
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

        <Pressable
          disabled={!isComplete || loading || isExpired}
          onPress={verify}
          style={({ pressed }) => [
            styles.confirmButton,
            (!isComplete || loading || isExpired) && styles.confirmButtonDisabled,
            pressed && isComplete && !loading && !isExpired && styles.confirmButtonPressed,
          ]}
        >
          <Text style={styles.confirmText}>{loading ? 'Processing...' : OtpScreenText.confirm}</Text>
        </Pressable>

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
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 22,
    paddingBottom: 22,
    paddingTop: 12,
  },
  title: {
    textAlign: 'center',
    color: colors.black,
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    marginTop: 12,
    color: '#294B8C',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  destination: {
    marginTop: 10,
    color: colors.black,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  digitPressArea: {
    marginTop: 16,
  },
  digitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 9,
  },
  digitBox: {
    width: 32,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3E5C96',
    borderRadius: 9,
    backgroundColor: colors.white,
  },
  digitBoxActive: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#F7FAFF',
  },
  digitText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  timerBlock: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  timerText: {
    textAlign: 'center',
    color: '#294B8C',
    fontSize: 10,
    fontWeight: '500',
  },
  expiredText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  resendText: {
    marginTop: 4,
    color: '#1D5EFF',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  confirmButton: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderRadius: 7,
    backgroundColor: '#3E5C96',
  },
  confirmButtonDisabled: {
    opacity: 0.45,
  },
  confirmButtonPressed: {
    opacity: 0.82,
  },
  confirmText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 15,
  },
  contactHint: {
    color: colors.black,
    fontSize: 10,
  },
  contactLink: {
    color: '#1D5EFF',
    fontSize: 10,
    textDecorationLine: 'underline',
  },
});
