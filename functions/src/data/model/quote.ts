import { Customer } from '../model/customer';

interface Item {
    name: string;
    quantity: number;
    units: string;
    price: number;
    totalPrice: number;
}

export interface QuoteBase {
    name: string;
    customer: Customer;
    userId: string;
    tenantId: string;
    items: Item[];
    totalPrice: number;
    totalPriceWithVat: number;
}
export interface QuoteRequestIn extends QuoteBase {
    isCustomerNew: boolean
}

export interface QuoteRecord extends QuoteBase {
    id: string;
    createdAt: Date;
    status: QuoteStatus;
    filters: {};
    pdfFileName: string;
}
export interface Quote extends QuoteBase{
    createdAt: Date;
    pdfFileName: string;
    status: QuoteStatus;
    id: string;
}

export enum QuoteStatus {
    Open = 'Open',
    Accepted = 'Accepted',
    Cancelled = 'Cancelled',
}

type Mapping = {
    [key: string]: string[];
}

const filterMapping: Mapping = {
    "customerName": ["customer","name"],
    "customerStreet":["customer","street"],
    "customerCity": ["customer","city"]
}

export function getAttrByURLParam(URLParam: string): string[] {
    return filterMapping[URLParam] !== undefined ? filterMapping[URLParam] : [URLParam];
}