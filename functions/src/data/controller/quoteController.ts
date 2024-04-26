import { Request, Response } from "firebase-functions";
import { verifyIdToken } from '../../auth/controller/authController';
import { db } from "../../config/firebase";
//import { verifyIdToken } from '../../auth/controller/authController';
import { convertToDate, editForFilter, parseSortParam } from "../../utils/utils";
import { createOrReplaceCustomer } from "../controller/customerController";
import { Quote, QuoteRecord, QuoteRequestIn, QuoteStatus, getAttrByURLParam } from '../model/quote';


const createQuote = async function createQuote(req: Request, res: Response): Promise<Response> {
    try {
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);

        const quotation: QuoteRequestIn = req.body;
        if (!quotation.customer.id && quotation.isCustomerNew) {
            const customerResponse = await createOrReplaceCustomer(quotation.customer, quotation.tenantId);
            //update customer id from new created customer
            if (!customerResponse.success) {
                return res.status(500).send(customerResponse.value);
            }
            quotation.customer.id = customerResponse.value;

        }
        const tenantId = quotation.tenantId;

        const quoteCollecion = db.collection(`${tenantId}_quotes`);
        const docRef = quoteCollecion.doc();
        const quoteId: string = docRef.id;
        const { isCustomerNew, userId, ...quotationData }: QuoteRequestIn = quotation;

        const filters = {
            searchCustomerName: editForFilter(quotationData.customer.name),
            searchCustomerStreet: editForFilter(quotationData.customer.street),
            searchCustomerCity: editForFilter(quotationData.customer.city),

        }
        const dataToWrite = {
            ...quotationData,
            'createdAt': new Date(),
            'status': QuoteStatus.Open,
            'id': quoteId,
            'userId': verificationRes.value.uid,
            'filters': filters,
            'pdfFileName': null
        };
        console.log(quoteId);
        await docRef.create(dataToWrite);

        return res.status(200).send({
            id: quoteId
        });
    } catch (error: any) {
        return res.status(500).send({ 'message': error.message });
    }
}

const getAllQuotes = async function getAllQuotes(req: Request, res: Response): Promise<Response> {
    try {
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);

        const customerName = req.query.customerName;
        const quoteStatus = req.query.status;
        const customerStreet = req.query.customerStreet;
        const quoteName = req.query.quoteName;
        const customerCity = req.query.customerCity;
        const sort = req.query.sort;
        const tenantId: string = req.headers['tenant-id'] as string;
        const quoteCollecion = db.collection(`${tenantId}_quotes`);
        let filteredQuotes: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = quoteCollecion;


        if (customerName) {
            const searchName = editForFilter(customerName as string);
            filteredQuotes = filteredQuotes.where('filters.searchCustomerName', '>=', searchName)
                .where('filters.searchCustomerName', '<=', searchName + '\uf8ff');
        }
        const querySnapshot = await filteredQuotes.get();
        const docs = querySnapshot.docs.map(doc => {
            const quote: QuoteRecord = doc.data() as QuoteRecord;
            const { createdAt, filters, ...quoteData }: QuoteRecord = quote;
            return {
                createdAt: convertToDate(createdAt),
                ...quoteData
            }
        }
        )

        const filteredDocs = docs.filter((quote) => {
            if (quoteStatus) {
                const searchStatus = quoteStatus as string;
                return editForFilter(quote.status).includes(editForFilter(searchStatus));
            }
            return true;
        }).filter((quote) => {
            if (customerCity) {
                const searchCustomerCity = customerCity as string;
                return editForFilter(quote.customer.city).includes(editForFilter(searchCustomerCity));
            }
            return true;

        }).filter((quote) => {
            if (customerStreet) {
                const searchCustomerStreet = customerStreet as string;
                return editForFilter(quote.customer.street).includes(editForFilter(searchCustomerStreet));
            }
            return true;
        }).filter((quote) => {
            if (customerName) {
                const searchCustomerName = customerName as string;
                return editForFilter(quote.customer.name).includes(editForFilter(searchCustomerName));
            }
            return true;
        }).filter((quote) => {
            if (quoteName) {
                const searchQuoteName = quoteName as string;
                return editForFilter(quote.name).includes(editForFilter(searchQuoteName));
            }
            return true;
        })
        if (sort) {
            const searchSort = sort as string;
            const [orderField, orderAsc] = parseSortParam(searchSort);
            filteredDocs.sort((quoteA, quoteB) => {

                const sortDirection = orderAsc ? 1 : -1; // určuje, či sa má zoradenie vykonať vzostupne alebo zostupne
                let firstElement: any = quoteA;
                let secondElement: any = quoteB;
                const listOfAttr = getAttrByURLParam(orderField);
                listOfAttr.forEach((attr) => {
                    firstElement = firstElement[attr];
                    secondElement = secondElement[attr];
                })
                return firstElement > secondElement ? sortDirection : -sortDirection
            }
            )
        }

        return res.status(200).send(filteredDocs);
    } catch (error: any) {
        return res.status(500).send({ error: error.message });
    }
}

export const monthlyQuoteReport = async function monthlyQuoteReport(req: Request, res: Response): Promise<Response> {
    try {
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);

        const tenantId: string = req.headers['tenant-id'] as string;
        const quoteCollecion = db.collection(`${tenantId}_quotes`);


        const querySnapshot = await quoteCollecion.get();
        const docs = querySnapshot.docs.map(doc => {
            const quote: QuoteRecord = doc.data() as QuoteRecord;
            const { createdAt, filters, ...quoteData }: QuoteRecord = quote;
            return {
                createdAt: convertToDate(createdAt),
                ...quoteData
            }
        }
        )
        const quotesByYearAndMonth: { [year: number]: { [month: string]: { count: number, totalPriceWithVat: number } } } = {};
        for (const quote of docs) {
            const date = new Date(quote.createdAt);
            const year = date.getFullYear();
            const monthName = date.toLocaleString('en-US', { month: 'long' });
            const month = monthName.charAt(0).toUpperCase() + monthName.slice(1); // capitalize first letter of month
            if (!quotesByYearAndMonth[year]) {
                quotesByYearAndMonth[year] = {};
            }
            if (!quotesByYearAndMonth[year][month]) {
                quotesByYearAndMonth[year][month] = { count: 0, totalPriceWithVat: 0 };
            }
            quotesByYearAndMonth[year][month].count++;
            quotesByYearAndMonth[year][month].totalPriceWithVat += quote.totalPriceWithVat;
        }

        return res.status(200).send(quotesByYearAndMonth);
    } catch (error: any) {
        return res.status(500).send({ error: error.message });
    }
}

const getQuote = async function getQuote(req: Request, res: Response): Promise<Response> {
    try {
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);

        const quoteId: string = req.params.id;
        const tenantId: string = req.headers['tenant-id'] as string;
        const quoteCollecion = db.collection(`${tenantId}_quotes`);
        const document = quoteCollecion.doc(quoteId);
        const quoteDoc = await document.get();

        if (quoteDoc.exists) {
            const quote: QuoteRecord = quoteDoc.data() as QuoteRecord;
            const { createdAt, filters, ...quoteData }: QuoteRecord = quote;
            const quoteResponse: Quote = {
                ...quoteData,
                'createdAt': convertToDate(quoteDoc.data()?.createdAt)
            };
            return res.status(200).send(quoteResponse);
        }
        else {
            return res.status(404).send("Not found quote");
        }

    } catch (error: any) {
        return res.status(500).send(error.message);
    }
}
const updateQuote = async function updateQuote(req: Request, res: Response): Promise<Response> {
    try {
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send("Access Forbidden");

        const quoteId: string = req.params.id;
        const quoteStatus = req.body.status;
        const pdfFileName = req.body.pdfFileName;
        const tenantId: string = req.headers['tenant-id'] as string;
        const quoteCollecion = db.collection(`${tenantId}_quotes`);
        const documentRef = quoteCollecion.doc(quoteId);
        const document = await documentRef.get();
        if (document.exists) {
            const quote: Quote = document.data() as Quote;
            if (verificationRes.value.uid != quote.userId) {
                return res.status(403).send("Access Forbidden");
            }
            const updateStatus: string = quoteStatus || quote.status;
            const updatePDFFileName: string = pdfFileName || quote.pdfFileName;
            const result = await documentRef.update({
                status: updateStatus,
                pdfFileName: updatePDFFileName

            }
            );
            return res.status(200).send(result);
        }
        return res.status(404).send('Quote not found or no permission to update it.');

    } catch (error: any) {
        return res.status(500).send(error.message);
    }
}
const deleteQuote = async function deleteQuote(req: Request, res: Response): Promise<Response> {
    try {
        const quoteId: string = req.params.id;
        const tenantId: string = req.headers['tenant-id'] as string;
        const quoteCollecion = db.collection(`${tenantId}_quotes`);
        const document = quoteCollecion.doc(quoteId);
        const result = await document.delete();
        return res.status(200).send(result);
    } catch (error: any) {
        return res.status(500).send(error.message);
    }
}

export { createQuote, deleteQuote, getAllQuotes, getQuote, updateQuote };

