import type { Offer, PartnerBrand } from '../../../types';

export class PartnerBrandCatalog {
  private readonly brandById: Map<string, PartnerBrand>;

  constructor(private readonly brands: readonly PartnerBrand[]) {
    this.brandById = new Map(brands.map((brand) => [brand.id, brand]));
  }

  getFeaturedBrands(): PartnerBrand[] {
    return [...this.brands]
      .filter((brand) => brand.featured)
      .sort((left, right) => (left.displayOrder ?? 999) - (right.displayOrder ?? 999));
  }

  findForOffer(offer: Offer): PartnerBrand | undefined {
    if (offer.partnerBrandId) {
      const brand = this.brandById.get(offer.partnerBrandId);

      if (brand) return brand;
    }

    const normalizedPartner = PartnerBrandCatalog.normalize(offer.partner);

    return this.brands.find(
      (brand) => PartnerBrandCatalog.normalize(brand.name) === normalizedPartner,
    );
  }

  getSearchQuery(brand: PartnerBrand): string {
    return brand.searchKeywords?.[0] ?? brand.name;
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
