import React from 'react';
import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

type BrandLogoProps = {
  width?: number;
  style?: StyleProp<ImageStyle>;
};

export const NAPAS_LOGO = require('../../../assets/napas-logo.png');

const LOGO_ASPECT_RATIO = 715 / 270;

export function BrandLogo({ width = 170, style }: BrandLogoProps) {
  const height = width / LOGO_ASPECT_RATIO;

  return React.createElement(Image, {
    accessibilityIgnoresInvertColors: true,
    accessibilityLabel: 'Napas',
    fadeDuration: 0,
    resizeMode: 'contain',
    source: NAPAS_LOGO,
    style: [styles.logo, { width, height }, style],
  });
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});