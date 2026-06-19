import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '../../shared/components/BrandLogo';
import { colors } from '../../theme/colors';

export function SplashScreen({ onFinished }: { onFinished: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinished, 1_400);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <View style={styles.container}>
      <View style={styles.orbTop} />
      <View style={styles.content}>
        <BrandLogo width={220} />
        <Text style={styles.title}>Napas DayOne</Text>
        <Text style={styles.subtitle}>Tích điểm thông minh, thanh toán an tâm</Text>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.security}>✓ MÔI TRƯỜNG DEMO AN TOÀN</Text>
        <Text style={styles.version}>Expo SDK 54 • DayOne Prototype 0.1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    padding: 32,
  },
  orbTop: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primarySoft,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 24,
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
  },
  loader: {
    marginTop: 38,
  },
  footer: {
    alignItems: 'center',
  },
  security: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  version: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 10,
  },
});
