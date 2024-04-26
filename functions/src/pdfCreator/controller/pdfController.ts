import { Quote } from "../../data/model/quote";
import { savePDFToStorage } from "../../pdf/controller/PDFStorageController";
import { Invoice } from './invoice';
import { createInvoice } from './pdf_creation';


async function convertPDFDocumentToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers)
            resolve(pdfData)
        })
    })
};

export const fillPDF = async function fillPDF(quote: Quote): Promise<{ tenantId: string, pdfFileName: string }> {
    const items = quote.items;
    const mappedItems = items.map((item) => {
        return {
            'name': item.name,
            'quantity': `${item.quantity} ${item.units}`,
            'price': item.price,
            'unit': item.units,
            'totalPrice': item.totalPrice
        }
    })
    const invoice: Invoice = {
        supplier: {
            name: "Michal Varchola",
            //street: "Poštová 14",
            phone: "+421915944449",
            email: "ramcom@ramcom.sk",
            city: "Košice",
            address: "Poštová 14",
            country: "SK",
            //postalCode: 4001,
            company: "ramcom",
            VAT: "SK2020003435",
            company_name: "RAMcom, s.r.o.",
        },
        shipping: {
            name: quote.customer.name,
            address: quote.customer.street,
            phone: quote.customer.phoneNumber,
            email: quote.customer.email,
            city: quote.customer.city,
            country: "SK",
            // postal_code: 7531,
        },
        items: mappedItems,
        totalPrice: quote.totalPrice,
        totalPriceWithVat: quote.totalPriceWithVat,
        invoice_nr: quote.id,
    };

    const pdfDoc = createInvoice(invoice);
    const pdfBuffer = await convertPDFDocumentToBuffer(pdfDoc);
    const pdfFileName = `quote-${quote.createdAt}.pdf`;
    await savePDFToStorage(pdfBuffer, pdfFileName, quote.tenantId);
    return {
        tenantId: quote.tenantId,
        pdfFileName: pdfFileName
    }

}
