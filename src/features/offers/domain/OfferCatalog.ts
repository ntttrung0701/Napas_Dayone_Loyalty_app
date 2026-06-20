import type { Offer } from '../../../types';

export type OfferCategoryFilter = 'Tất cả' | Offer['category'];

export class OfferCatalog {
  constructor(private readonly offers: readonly Offer[]) {}

  query(category: OfferCategoryFilter, searchQuery = ''): Offer[] {
    const normalizedQuery = OfferCatalog.normalize(searchQuery);
    return this.offers.filter((offer) => {
      const categoryMatched = category === 'Tất cả' || offer.category === category;
      const searchMatched =
        !normalizedQuery ||
        OfferCatalog.normalize(
          [offer.title, offer.partner, offer.description, offer.category].join(' '),
        ).includes(normalizedQuery);
      return categoryMatched && searchMatched;
    });
  }

  private static normalize(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('vi-VN')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }
}
