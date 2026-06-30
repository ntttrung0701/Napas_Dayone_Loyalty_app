import Ionicons from '@expo/vector-icons/Ionicons';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { getScreenBottomPadding } from '../../../shared/layout';
import { colors } from '../../../theme/colors';

const OTP_LENGTH = 6;

type PaymentOtpSheetProps = {
  bottomInset: number;
  error: string | null;
  otp: string;
  processing: boolean;
  visible: boolean;
  onChangeOtp: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function PaymentOtpSheet({
  bottomInset,
  error,
  otp,
  processing,
  visible,
  onChangeOtp,
  onClose,
  onConfirm,
}: PaymentOtpSheetProps) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}
      >
        <Pressable disabled={processing} onPress={onClose} style={styles.modalBackdrop} />
        <View style={[styles.otpSheet, { paddingBottom: getScreenBottomPadding(bottomInset, 8) }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.otpHeader}>
            <View style={styles.otpIcon}>
              <Ionicons color={colors.primary} name="lock-closed-outline" size={24} />
            </View>
            <View style={styles.otpCopy}>
              <Text style={styles.otpTitle}>Nhập OTP xác nhận</Text>
              <Text style={styles.otpSubtitle}>Mã demo: 123456</Text>
            </View>
            <Pressable disabled={processing} hitSlop={10} onPress={onClose}>
              <Ionicons color={colors.textMuted} name="close" size={24} />
            </Pressable>
          </View>

          <TextInput
            autoFocus
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            onChangeText={onChangeOtp}
            placeholder="••••••"
            placeholderTextColor="#A8B6C7"
            style={styles.otpInput}
            value={otp}
          />

          <View style={styles.otpDots}>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <View key={index} style={[styles.otpDot, index < otp.length && styles.otpDotFilled]} />
            ))}
          </View>

          {error ? (
            <View style={styles.otpErrorBox}>
              <Ionicons color={colors.danger} name="alert-circle-outline" size={16} />
              <Text style={styles.otpErrorText}>{error}</Text>
            </View>
          ) : null}

          <PrimaryButton
            disabled={otp.length !== OTP_LENGTH || processing}
            label={processing ? 'Đang xác thực...' : 'Xác nhận OTP'}
            onPress={onConfirm}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 27, 45, 0.58)',
  },
  otpSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    marginBottom: 16,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  otpHeader: { flexDirection: 'row', alignItems: 'center' },
  otpIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  otpCopy: { flex: 1, marginHorizontal: 12 },
  otpTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  otpSubtitle: { marginTop: 3, color: colors.textMuted, fontSize: 11 },
  otpInput: {
    height: 58,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
  },
  otpDots: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16 },
  otpDot: {
    width: 10,
    height: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  otpDotFilled: { backgroundColor: colors.primary },
  otpErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 13,
    backgroundColor: '#FFF1F2',
    padding: 10,
  },
  otpErrorText: { flex: 1, marginLeft: 7, color: colors.danger, fontSize: 10, lineHeight: 15 },
});
