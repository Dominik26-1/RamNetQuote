import cors from 'cors';
import express from 'express';
import { Request, Response } from "firebase-functions";
//import { PDFDocument } from 'pdf-lib';
import { verifyIdToken } from '../auth/controller/authController';
//import { savePDFToStorage } from "../pdf/controller/PDFStorageController";
import { Quote } from '../data/model/quote';
//import { buildPDF } from "../utils/utils";
import { fillPDF } from './controller/pdfController';

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.post('/create-pdf', async (req: Request, res: Response) => {
    try {
        //verification of current user
         const token = req.headers['token-id'];
         const verificationRes = await verifyIdToken(token as string);
         if (!verificationRes.success) return res.status(403).send(verificationRes.value);
        const quote: Quote = req.body.quote as Quote;

        const { tenantId, pdfFileName } = await fillPDF(quote);

        return res.status(200).send({
            pdfFileName: pdfFileName,
            tenantId: tenantId
        });
    } catch (err: any) {
        return res.status(500).send({ error: 'Error creating PDF: ' + JSON.stringify(err.trace) });
    }
}
)

export { app as PDFGenerator };

