import type { ImageSourcePropType } from 'react-native';

import type { OfferMedia } from '../../../types';

const localOfferImages: Record<string, ImageSourcePropType> = {
  highlands: require('../../../../assets/highland.jpg'),
  winmart: require('../../../../assets/winmart.jpg'),
};

export class OfferMediaResolver {
  static getImageSource(media?: OfferMedia): ImageSourcePropType | null {
    if (!media) return null;

    const remoteImageUrl = media.heroUrl ?? media.imageUrl ?? media.thumbnailUrl;

    if (remoteImageUrl) {
      return { uri: remoteImageUrl };
    }

    if (media.imageKey) {
      const localImage = localOfferImages[media.imageKey];

      if (localImage) {
        return localImage;
      }
    }

    return null;
  }

  static hasImage(media?: OfferMedia) {
    return Boolean(this.getImageSource(media));
  }
}