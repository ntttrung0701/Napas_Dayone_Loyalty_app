import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

import type { OfferMedia } from '../../../types';
import { OfferMediaResolver } from '../domain/OfferMediaResolver';

type OfferMediaFrameProps = {
  media?: OfferMedia;
  fallbackColor: string;
  height: number;
  borderRadius?: number;
  overlayOpacity?: number;
  style?: ViewStyle;
  children?: ReactNode;
};

export function OfferMediaFrame({
  media,
  fallbackColor,
  height,
  borderRadius = 20,
  overlayOpacity = 0.22,
  style,
  children,
}: OfferMediaFrameProps) {
  const imageSource = OfferMediaResolver.getImageSource(media);

  return (
    <View
      style={[
        styles.frame,
        {
          height,
          borderRadius,
          backgroundColor: fallbackColor,
        },
        style,
      ]}
    >
      {imageSource ? (
        <>
          <Image source={imageSource} resizeMode="cover" style={styles.image} />
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: `rgba(0,0,0,${overlayOpacity})`,
              },
            ]}
          />
        </>
      ) : null}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
  },
});