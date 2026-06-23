import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { BrandLogo } from '../../../shared/components/BrandLogo';
import { colors } from '../../../theme/colors';
import { AuthScreenPresentation } from './AuthScreenPresentation';

type AuthShellProps = {
  presentation?: AuthScreenPresentation;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({
  presentation = AuthScreenPresentation.empty,
  onBack,
  children,
  footer,
}: AuthShellProps) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={ui.root}>
      <ScrollView
        contentContainerStyle={ui.page}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={ui.card}>
          <View style={ui.header}>
            <View style={ui.headerSide}>
              {onBack ? (
                <Pressable accessibilityLabel="Quay lại" accessibilityRole="button" onPress={onBack} style={ui.back}>
                  <Ionicons color={colors.black} name="arrow-back" size={24} />
                </Pressable>
              ) : null}
            </View>
            <BrandLogo width={140} />
            <View style={ui.headerSide} />
          </View>
          <AuthHeading presentation={presentation} />
          <View style={ui.body}>{children}</View>
          {footer ? <View style={ui.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AuthHeading({ presentation }: { presentation: AuthScreenPresentation }) {
  if (!presentation.hasTitle && !presentation.hasSubtitle) return null;

  return (
    <View>
      {presentation.hasTitle ? <Text style={ui.title}>{presentation.title}</Text> : null}
      {presentation.hasSubtitle ? <Text style={ui.subtitle}>{presentation.subtitle}</Text> : null}
    </View>
  );
}

type AuthFieldProps = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onToggleSecure?: () => void;
};

export function AuthField({
  label,
  icon,
  onToggleSecure,
  secureTextEntry,
  style: inputStyle,
  ...inputProps
}: AuthFieldProps) {
  return (
    <View style={ui.fieldBlock}>
      <Text style={ui.label}>{label}</Text>
      <View style={ui.inputRow}>
        {icon ? <Ionicons color="#A4AAB4" name={icon} size={18} /> : null}
        <TextInput
          autoCapitalize="none"
          placeholderTextColor="#A4AAB4"
          {...inputProps}
          secureTextEntry={secureTextEntry}
          style={[ui.input, inputStyle]}
        />
        {onToggleSecure ? (
          <Pressable accessibilityLabel={secureTextEntry ? 'Hiện mật khẩu' : 'Ẩn mật khẩu'} onPress={onToggleSecure}>
            <Ionicons color="#8A93A1" name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'} size={20} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function FormError({ message }: { message?: string | null }) {
  return message ? (
    <View accessibilityRole="alert" style={ui.errorBox}>
      <Ionicons color="#B42318" name="alert-circle-outline" size={16} />
      <Text style={ui.errorText}>{message}</Text>
    </View>
  ) : null;
}

export function DemoOtpNotice() {
  return (
    <View style={ui.demoBox}>
      <Ionicons color="#294B8C" name="information-circle-outline" size={17} />
      <Text style={ui.demoText}>Đây là luồng demo cục bộ. Mã OTP mặc định: 123749.</Text>
    </View>
  );
}

const ui = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ECECEC' },
  page: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  card: {
    minHeight: 610,
    borderRadius: 24,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
    paddingBottom: 22,
    paddingTop: 16,
  },
  header: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerSide: { width: 42 },
  back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 7, textAlign: 'center', color: colors.black, fontSize: 20, fontWeight: '700' },
  subtitle: { marginTop: 8, textAlign: 'center', color: '#294B8C', fontSize: 13, lineHeight: 18 },
  body: { marginTop: 22 },
  footer: { marginTop: 'auto', paddingTop: 18 },
  fieldBlock: { marginBottom: 13 },
  label: { marginBottom: 6, color: '#294B8C', fontSize: 12, fontWeight: '600' },
  inputRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A1A5AC',
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
  },
  input: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 9,
    color: colors.text,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 18,
    paddingVertical: 0,
    textAlign: 'left',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 9,
    backgroundColor: '#FEE4E2',
    padding: 9,
  },
  errorText: { flex: 1, marginLeft: 7, color: '#B42318', fontSize: 11, lineHeight: 16 },
  demoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderRadius: 9,
    backgroundColor: '#EAF0FB',
    padding: 10,
  },
  demoText: { flex: 1, marginLeft: 7, color: '#294B8C', fontSize: 11, lineHeight: 16 },
});
