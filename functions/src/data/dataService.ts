import cors from 'cors';
import express from 'express';
import { Request, Response } from "firebase-functions";
import { verifyIdToken } from '../auth/controller/authController';
import * as company_controller from './controller/companyController';
import * as customer_controller from './controller/customerController';
import * as quote_controller from './controller/quoteController';
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.post('/quote', async (req: Request, res: Response) =>
    quote_controller.createQuote(req, res)
)
app.get('/quote', async (req: Request, res: Response) =>
    quote_controller.getAllQuotes(req, res)
)
app.get('/report', async (req: Request, res: Response) =>
    quote_controller.monthlyQuoteReport(req, res)
)
app.get('/quote/:id', async (req: Request, res: Response) =>
    quote_controller.getQuote(req, res)
)
app.put('/quote/:id', async (req: Request, res: Response) =>
    quote_controller.updateQuote(req, res)
)
app.delete('/quote/:id', async (req: Request, res: Response) =>
    quote_controller.deleteQuote(req, res)
)
app.post('/customer', async (req: Request, res: Response) => {
    try {
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);

        const tenantId: string = req.headers['tenant-id'] as string;

        const customerResponse = await customer_controller.createCustomer(req.body, tenantId);
        //update customer id from new created customer
        if (!customerResponse.success) {
            return res.status(500).send(customerResponse.value);
        } else {
            return res.status(200).send(customerResponse.value);
        }
    } catch (err: any) {
        return res.status(500).send(err.message);
    }
}
)
app.get('/customer', async (req: Request, res: Response) =>
    customer_controller.getAllCustomers(req, res)
)
app.get('/company/:tenantId', async (req: Request, res: Response) =>
    company_controller.getCompanyData(req, res)
)

export { app as DataDBService };

