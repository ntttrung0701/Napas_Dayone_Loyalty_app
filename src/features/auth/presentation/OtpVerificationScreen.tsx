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
import { authScreenPresentations } from './AuthScreenPresentation';



class OtpScreenText {
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
  <AuthShell onBack={onBack} presentation={authScreenPresentations.otp}>
    <View style={styles.otpContent}>
      <Text maxFontSizeMultiplier={1.08} style={styles.destinationLine}>
  Mã đã gửi đến <Text style={styles.destinationValue}>{challenge.destination}</Text>
</Text>

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
            <Text maxFontSizeMultiplier={1.08} style={styles.expiredText}>{OtpScreenText.expired()}</Text>
            <Pressable disabled={loading} onPress={resend}>
              <Text maxFontSizeMultiplier={1.08} style={styles.resendText}>Gửi lại mã</Text>
            </Pressable>
          </>
        ) : (
          <Text maxFontSizeMultiplier={1.08} style={styles.timerText}>{OtpScreenText.resendCountdown(seconds)}</Text>
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
        <Text maxFontSizeMultiplier={1.08} style={styles.contactHint}>{OtpScreenText.contactPrefix}</Text>
        <Pressable>
          <Text maxFontSizeMultiplier={1.08} style={styles.contactLink}>{OtpScreenText.contact}</Text>
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
  otpContent: {
  width: '100%',
  alignItems: 'center',
  paddingTop: 0,
},
  destinationLine: {
  marginTop: 0,
  textAlign: 'center',
  color: '#294B8C',
  fontSize: 13,
  fontWeight: '500',
  lineHeight: 18,
},
destinationValue: {
  color: colors.text,
  fontSize: 13,
  fontWeight: '700',
  letterSpacing: 0.8,
},
  digitPressArea: {
    marginTop: 18,
  },
  digitRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
},
  digitBox: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.7,
    borderColor: '#3E5C96',
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  digitBoxActive: {
    borderWidth: 2.4,
    borderColor: colors.primary,
    backgroundColor: '#F7FAFF',
  },
  digitText: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  timerBlock: {
  minHeight: 32,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 18,
},
  timerText: {
  textAlign: 'center',
  color: '#294B8C',
  fontSize: 12,
  fontWeight: '700',
},
  expiredText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  resendText: {
    marginTop: 5,
    color: '#1D5EFF',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  confirmButtonWrap: {
  width: '100%',
  marginTop: 10,
},
  contactRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 7,
  marginTop: 16,
},
  contactHint: {
  color: colors.black,
  fontSize: 12,
},
contactLink: {
  color: '#1D5EFF',
  fontSize: 12,
  fontWeight: '600',
  textDecorationLine: 'underline',
},
});
