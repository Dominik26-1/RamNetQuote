export interface CustomerDetail extends Customer {
    createdAt: Date;
}

export interface Customer {
    id: string;
    name: string;
    street: string;
    postalCode: string;
    city: string;
    email: string;
    phoneNumber: string;
}