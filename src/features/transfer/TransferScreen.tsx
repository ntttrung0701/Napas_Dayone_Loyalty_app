import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { getScreenBottomPadding } from '../../shared/layout';
import { colors } from '../../theme/colors';
import { formatPoints } from '../../utils/format';

type TransferScreenProps = {
  points: number;
  onBack: () => void;
  onComplete: (amount: number, recipient: string) => void;
};

const amounts = [5_000, 10_000, 20_000, 50_000];

export function TransferScreen({ points, onBack, onComplete }: TransferScreenProps) {
  const insets = useSafeAreaInsets();
  const [recipient, setRecipient] = useState('Lê Duy Bách');
  const [amount, setAmount] = useState(Math.min(5_000, points));
  const [message, setMessage] = useState('Chúc bạn một ngày thật vui!');
  const valid = recipient.trim().length > 1 && amount > 0 && amount <= points;

  const confirm = () => {
    Alert.alert(
      'Xác nhận gửi tặng điểm',
      `Gửi ${formatPoints(amount)} điểm cho ${recipient}? Giao dịch demo không thể hoàn tác.`,
      [
        { text: 'Kiểm tra lại', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => onComplete(amount, recipient) },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Chuyển / tặng điểm" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getScreenBottomPadding(insets.bottom) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>SỐ DƯ ĐIỂM NAPAS DAYONE</Text>
          <Text style={styles.balance}>{formatPoints(points)} pts</Text>
          <View style={styles.rank}>
            <Text style={styles.rankText}>HẠNG VÀNG</Text>
          </View>
        </View>

        <Text style={styles.label}>LOYALTY ID HOẶC SĐT NGƯỜI NHẬN</Text>
        <View style={styles.recipientRow}>
          <View style={styles.recipientAvatar}>
            <Ionicons color={colors.primary} name="person-outline" size={19} />
          </View>
          <TextInput
            onChangeText={setRecipient}
            placeholder="Nhập người nhận"
            placeholderTextColor={colors.textMuted}
            style={styles.recipientInput}
            value={recipient}
          />
        </View>

        <Text style={styles.label}>SỐ ĐIỂM CẦN TẶNG / CHUYỂN</Text>
        <View style={styles.amountInput}>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(value) => setAmount(Number(value.replace(/[^0-9]/g, '')) || 0)}
            style={styles.amountText}
            value={amount ? String(amount) : ''}
          />
          <Text style={styles.pts}>PTS</Text>
        </View>
        <Text style={styles.maxText}>Tối đa chuyển: {formatPoints(points)} pts</Text>

        <View style={styles.amountOptions}>
          {amounts.map((option) => (
            <Pressable
              disabled={option > points}
              key={option}
              onPress={() => setAmount(option)}
              style={[
                styles.amountOption,
                amount === option && styles.amountOptionActive,
                option > points && styles.amountOptionDisabled,
              ]}
            >
              <Text style={[styles.amountOptionText, amount === option && styles.amountOptionTextActive]}>
                +{formatPoints(option)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>LỜI NHẮN KÈM THEO</Text>
        <TextInput
          multiline
          onChangeText={setMessage}
          style={styles.messageInput}
          textAlignVertical="top"
          value={message}
        />

        <PrimaryButton disabled={!valid} label="Xác nhận gửi tặng điểm" onPress={confirm} />
        <Text style={styles.disclaimer}>
          Điểm sau khi chuyển sẽ không thể hoàn tác. Hãy kiểm tra kỹ người nhận và số điểm.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18 },
  balanceCard: { borderRadius: 20, backgroundColor: colors.primaryDark, padding: 20 },
  balanceLabel: { color: '#BBD3E5', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  balance: { marginTop: 7, color: colors.white, fontSize: 30, fontWeight: '900' },
  rank: {
    position: 'absolute',
    top: 20,
    right: 18,
    borderRadius: 999,
    backgroundColor: '#8B691B',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rankText: { color: '#FFE8A6', fontSize: 8, fontWeight: '900' },
  label: {
    marginBottom: 8,
    marginTop: 20,
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  recipientRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  recipientAvatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
  },
  recipientInput: { flex: 1, marginLeft: 12, color: colors.text, fontSize: 14, fontWeight: '700' },
  amountInput: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 17,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  amountText: { flex: 1, color: colors.primary, fontSize: 26, fontWeight: '900' },
  pts: { color: colors.textMuted, fontSize: 12, fontWeight: '900' },
  maxText: { marginTop: 6, color: colors.textMuted, fontSize: 10 },
  amountOptions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  amountOption: {
    width: '23%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
    paddingVertical: 10,
  },
  amountOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  amountOptionDisabled: { opacity: 0.35 },
  amountOptionText: { color: colors.textMuted, fontSize: 9, fontWeight: '800' },
  amountOptionTextActive: { color: colors.white },
  messageInput: {
    minHeight: 90,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 14,
    fontSize: 13,
  },
  disclaimer: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
  },
});
