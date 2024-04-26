import cors from 'cors';
import express from 'express';

import { Request, Response } from "firebase-functions";
import * as controller from './controller/PDFStorageController';
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.post('/pdf', async (req: Request, res: Response) =>

    controller.uploadPDF(req, res)
)
app.get('/url/quote/:fileName', async (req: Request, res: Response) =>

    controller.getQuoteUrl(req, res)
)
app.get('/pdf/:fileName', async (req: Request, res: Response) =>
    controller.downloadPDF(req, res)
)
app.get('/url/template', async (req: Request, res: Response) =>

    controller.getTemplateUrl(req, res)
)
app.get('/url/font', async (req: Request, res: Response) =>

    controller.getFontUrls(req, res)
)
app.delete('/pdf/:fileName', async (req: Request, res: Response) =>

    controller.deletePDF(req, res)
)

export { app as PDFService };

