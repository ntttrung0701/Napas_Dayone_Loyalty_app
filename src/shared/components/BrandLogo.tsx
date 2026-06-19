import { Image, StyleSheet } from 'react-native';

type BrandLogoProps = {
  width?: number;
};

export function BrandLogo({ width = 170 }: BrandLogoProps) {
  return (
    <Image
      accessibilityLabel="Napas"
      resizeMode="contain"
      source={require('../../../assets/napas-logo.png')}
      style={[styles.logo, { width, height: width * 0.42 }]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});
