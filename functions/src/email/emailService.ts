import cors from 'cors';
import express from 'express';
import { Request, Response } from "firebase-functions";
import * as nodemailer from 'nodemailer';
import { verifyIdToken } from '../auth/controller/authController';
import { buildPDF } from "../utils/utils";
import { Email } from './model/email';
import * as Handlebars from 'handlebars';



const app = express();
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.post('/email', async (req: Request, res: Response) => {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);
        const emailData: Email = req.body;
        const pdfFile = await buildPDF(emailData.url);
        
        const emailTemplate = eval('`' + emailData.text + '`');
        // Text emailu s premennými v handlebars šablóne
        // Nahradenie premenných v šablóne
        const template = Handlebars.compile(emailTemplate);
        const emailContent = template({
            companyName: emailData.companyName,
            customerName: emailData.quote.customer.name
        });
        // Nastavenie Nodemailer pre odoslanie e-mailu
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ramcomdev@gmail.com',
                pass: 'fbmfkjadztituycf',
            },
        });

        // Definovanie e-mailovej správy
        const mailOptions = {
            from: 'ramcomdev@gmail.com',
            to: emailData.to,
            subject: emailData.subject,
            html: emailContent,
            attachments: [
                {
                    filename: emailData.pdfFileName,
                    content: pdfFile,
                    contentType: 'application/pdf',
                }
            ]
        };
        // Odoslanie e-mailu pomocou Nodemailer
        const emailSent = await transporter.sendMail(mailOptions);
        return res.status(200).send(emailSent);
    } catch (error) {
        return res.status(500).send(error);
    }
}
)

export { app as EmailService };

