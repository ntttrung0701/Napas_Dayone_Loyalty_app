import { Image, type ImageSourcePropType } from 'react-native';

import type { OfferMedia, PartnerBrandLogo } from '../../../types';

const localOfferImages: Record<string, ImageSourcePropType> = {
  highlands: require('../../../../assets/highland.jpg'),
  winmart: require('../../../../assets/winmart.jpg'),
};

const localPartnerIcons: Record<string, ImageSourcePropType> = {
  highlands: require('../../../../assets/partners/highland-icon.jpg'),
  winmart: require('../../../../assets/partners/winmart-icon.png'),
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

  static getIconSource(media?: OfferMedia): ImageSourcePropType | null {
    if (!media) return null;

    if (media.iconUrl) {
      return { uri: media.iconUrl };
    }

    if (media.iconKey) {
      const localIcon = localPartnerIcons[media.iconKey];

      if (localIcon) {
        return localIcon;
      }
    }

    return null;
  }

  static getPartnerLogoSource(logo?: PartnerBrandLogo): ImageSourcePropType | null {
    if (!logo) return null;

    if (logo.imageUrl) {
      return { uri: logo.imageUrl };
    }

    if (logo.imageKey) {
      const localIcon = localPartnerIcons[logo.imageKey];

      if (localIcon) {
        return localIcon;
      }
    }

    return null;
  }

  static preload(media?: OfferMedia): Promise<boolean> {
    if (!media) return Promise.resolve(false);

    const remoteImageUrl = media.heroUrl ?? media.imageUrl ?? media.thumbnailUrl;

    if (remoteImageUrl) {
      return Image.prefetch(remoteImageUrl);
    }

    /*
      Local images loaded by require() are bundled with the app.
      They do not need network prefetch. Return true so App.tsx can safely call preloadMany().
    */
    if (media.imageKey && localOfferImages[media.imageKey]) {
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }

  static preloadMany(mediaList: Array<OfferMedia | undefined>): Promise<boolean[]> {
    return Promise.all(mediaList.map((media) => this.preload(media)));
  }

  static hasImage(media?: OfferMedia) {
    return Boolean(this.getImageSource(media));
  }

  static hasIcon(media?: OfferMedia) {
    return Boolean(this.getIconSource(media));
  }
}
