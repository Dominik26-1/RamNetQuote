import { Quote } from '../../data/model/quote';
export interface Email {
    subject: string;
    text: string;
    pdfFileName: string;
    to: string;
    url: string;
    quote: Quote;
    companyName: string;
}