import PDFDocument from "pdfkit";
import { Invoice } from './invoice';
import * as PDF from './pdf_functions';


export function createInvoice(invoice: Invoice): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  PDF.generateHeader(doc);
  PDF.generateCustomerInformation(doc, invoice);
  PDF.generateInformation(doc, invoice);

  doc.addPage();
  PDF.generateInvoiceTable(doc, invoice);
  PDF.generateEnd(doc);
  PDF.generateFooter(doc);

  doc.end();
  return doc;
}
