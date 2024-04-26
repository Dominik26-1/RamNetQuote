export interface Invoice {
    supplier: {
      name: string;
      phone: string;
      email: string;
      company_name: string;
      company: string;
      VAT: string;
      address: string;
      city: string;
      country: string;
    };
    invoice_nr: string;
    shipping: {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      country: string;
    };
    items: {
      name: string;
      quantity: string;
      price: number;
      unit: string;
      totalPrice: number;
    }[];
    totalPrice: number;
    totalPriceWithVat: number;
  }