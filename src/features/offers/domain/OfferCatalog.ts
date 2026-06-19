import type { Offer } from '../../../types';

export type OfferCategoryFilter = 'Tất cả' | Offer['category'];

export class OfferCatalog {
  constructor(private readonly offers: readonly Offer[]) {}

  filterByCategory(category: OfferCategoryFilter): Offer[] {
    if (category === 'Tất cả') return [...this.offers];
    return this.offers.filter((offer) => offer.category === category);
  }
}
