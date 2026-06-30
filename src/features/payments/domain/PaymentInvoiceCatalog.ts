import type { PaymentInvoice } from './PaymentModels';

export class PaymentInvoiceCatalog {
  constructor(private readonly invoices: readonly PaymentInvoice[]) {}

  findByCode(code: string): PaymentInvoice | null {
    const normalized = PaymentInvoiceCatalog.normalize(code);
    return this.invoices.find((invoice) => invoice.id === normalized) ?? null;
  }

  getSuggestedInvoice(): PaymentInvoice {
    return this.invoices[0]!;
  }

  getQrInvoice(): PaymentInvoice {
    return (
      this.invoices.find((invoice) => invoice.source === 'qr-demo') ??
      this.getSuggestedInvoice()
    );
  }

  searchInvoices(query: string): PaymentInvoice[] {
    const normalizedQuery = PaymentInvoiceCatalog.normalize(query);
    if (!normalizedQuery) return [...this.invoices];

    return this.invoices.filter((invoice) =>
      PaymentInvoiceCatalog.normalize(
        [invoice.id, invoice.merchant, invoice.category, invoice.terminal].join(' '),
      ).includes(normalizedQuery),
    );
  }

  private static normalize(value: string) {
    return value.trim().toLocaleUpperCase('vi-VN');
  }
}
