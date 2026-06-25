import { Image, type ImageSourcePropType } from 'react-native';
import { Asset } from 'expo-asset';

import type { OfferMedia } from '../../../types';

type LocalImageModule = number;

const localOfferImages: Record<string, LocalImageModule> = {
  highlands: require('../../../../assets/highland.jpg'),
  winmart: require('../../../../assets/winmart.jpg'),
};

export class OfferMediaResolver {
  static getImageSource(media?: OfferMedia): ImageSourcePropType | null {
    if (!media) return null;

    const remoteImageUrl = this.getRemoteImageUrl(media);

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

  static preload(media?: OfferMedia) {
    if (!media) return Promise.resolve(false);

    const remoteImageUrl = this.getRemoteImageUrl(media);

    if (remoteImageUrl) {
      return Image.prefetch(remoteImageUrl);
    }

    if (media.imageKey) {
      const localImage = localOfferImages[media.imageKey];

      if (localImage) {
        return Asset.fromModule(localImage).downloadAsync().then(() => true);
      }
    }

    return Promise.resolve(false);
  }

  static preloadMany(mediaList: Array<OfferMedia | undefined>) {
    return Promise.all(mediaList.map((media) => this.preload(media)));
  }

  static hasImage(media?: OfferMedia) {
    return Boolean(this.getImageSource(media));
  }

  private static getRemoteImageUrl(media: OfferMedia) {
    return media.heroUrl ?? media.imageUrl ?? media.thumbnailUrl;
  }
}