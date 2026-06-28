import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { getScreenBottomPadding } from '../../shared/layout';
import { colors } from '../../theme/colors';

const banks = ['BIDV', 'VietinBank', 'Techcombank', 'Agribank', 'TPBank'];

export function CardsScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [bank, setBank] = useState('BIDV');
  const [cardHolder, setCardHolder] = useState('NGUYEN MINH ANH');
  const [cardNumber, setCardNumber] = useState('9704');

  const linkDemo = () => {
    Alert.alert('Liên kết demo thành công', `${bank} •••• ${cardNumber.slice(-4) || '0000'} đã được thêm.`);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={onBack} title="Liên kết Thẻ & Ví" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getScreenBottomPadding(insets.bottom) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>PHƯƠNG THỨC ĐÃ LIÊN KẾT</Text>
        <View style={styles.linkedCard}>
          <View style={styles.bankLogo}>
            <Text style={styles.bankLogoText}>VCB</Text>
          </View>
          <View style={styles.linkedInfo}>
            <Text style={styles.linkedName}>Vietcombank</Text>
            <Text style={styles.linkedMeta}>ATM / NAPAS •••• 8839</Text>
          </View>
          <Text style={styles.remove}>Gỡ bỏ</Text>
        </View>
        <View style={styles.linkedCard}>
          <View style={[styles.bankLogo, styles.momoLogo]}>
            <Text style={[styles.bankLogoText, styles.momoText]}>M</Text>
          </View>
          <View style={styles.linkedInfo}>
            <Text style={styles.linkedName}>Ví Momo</Text>
            <Text style={styles.linkedMeta}>ĐÃ KẾT NỐI • 0987654321</Text>
          </View>
          <Text style={styles.remove}>Gỡ bỏ</Text>
        </View>

        <Text style={styles.sectionTitle}>THÊM THẺ ATM / TÀI KHOẢN NAPAS</Text>
        <View style={styles.formCard}>
          <Text style={styles.label}>CHỌN NGÂN HÀNG</Text>
          <View style={styles.bankOptions}>
            {banks.map((item) => (
              <Pressable
                key={item}
                onPress={() => setBank(item)}
                style={[styles.bankOption, bank === item && styles.bankOptionActive]}
              >
                <Text style={[styles.bankOptionText, bank === item && styles.bankOptionTextActive]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>CHỦ THẺ (KHÔNG DẤU)</Text>
          <TextInput onChangeText={setCardHolder} style={styles.input} value={cardHolder} />
          <Text style={styles.label}>SỐ THẺ NỘI ĐỊA (NAPAS PAN 16-SỐ)</Text>
          <TextInput
            keyboardType="number-pad"
            maxLength={16}
            onChangeText={setCardNumber}
            placeholder="9704 •••• •••• ••••"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={cardNumber}
          />
          <PrimaryButton
            disabled={cardHolder.trim().length < 3 || cardNumber.length < 4}
            label="Xác nhận liên kết ngân hàng"
            onPress={linkDemo}
          />
        </View>

        <View style={styles.walletCard}>
          <View>
            <Text style={styles.walletTitle}>THÊM VÍ ĐIỆN TỬ LIÊN KẾT</Text>
            <Text style={styles.walletText}>ZaloPay • ShopeePay • Momo Wallet</Text>
          </View>
          <Ionicons color={colors.white} name="chevron-forward" size={23} />
        </View>

        <Text style={styles.disclaimer}>
          Đây là giao diện mô phỏng. Không nhập số thẻ hoặc tài khoản thật.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18 },
  sectionTitle: {
    marginBottom: 10,
    marginTop: 8,
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  linkedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 14,
  },
  bankLogo: {
    width: 46,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.successSoft,
  },
  bankLogoText: { color: colors.success, fontSize: 10, fontWeight: '900' },
  momoLogo: { backgroundColor: '#FFF0F7' },
  momoText: { color: '#D82D7D' },
  linkedInfo: { flex: 1, marginLeft: 12 },
  linkedName: { color: colors.text, fontSize: 13, fontWeight: '900' },
  linkedMeta: { marginTop: 4, color: colors.textMuted, fontSize: 9 },
  remove: { color: colors.danger, fontSize: 10, fontWeight: '700' },
  formCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
  },
  label: {
    marginBottom: 8,
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
  },
  bankOptions: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  bankOption: {
    marginBottom: 7,
    marginRight: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  bankOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  bankOptionText: { color: colors.textMuted, fontSize: 9, fontWeight: '700' },
  bankOptionTextActive: { color: colors.white },
  input: {
    height: 50,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    padding: 16,
  },
  walletTitle: { color: colors.white, fontSize: 10, fontWeight: '900' },
  walletText: { marginTop: 5, color: '#BFD4E4', fontSize: 10 },
  disclaimer: {
    marginTop: 14,
    textAlign: 'center',
    color: colors.warning,
    fontSize: 10,
    lineHeight: 15,
  },
});
