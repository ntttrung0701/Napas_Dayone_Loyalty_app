import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { BrandLogo, NAPAS_LOGO } from '../../shared/components/BrandLogo';
import { colors } from '../../theme/colors';

export function SplashScreen({ onFinished }: { onFinished: () => void }) {
  useEffect(() => {
  let isMounted = true;

  const logoSource = Image.resolveAssetSource(NAPAS_LOGO);
  const preloadLogo = logoSource?.uri
    ? Image.prefetch(logoSource.uri).catch(() => undefined)
    : Promise.resolve();

  const minimumSplashTime = new Promise<void>((resolve) => {
    setTimeout(resolve, 1_400);
  });

  Promise.all([preloadLogo, minimumSplashTime]).then(() => {
    if (isMounted) {
      onFinished();
    }
  });

  return () => {
    isMounted = false;
  };
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
