import * as functions from "firebase-functions";
//import { Response } from "firebase-functions";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

import { AuthService } from './auth/authService';
import { DataDBService } from './data/dataService';
import { EmailService } from './email/emailService';
import { PDFService } from './pdf/PDFService';
import { PDFGenerator } from './pdfCreator/pdfCreator';
import { Workflow } from './workflow/workflowService';


exports.dataDBService = functions.https.onRequest(DataDBService);
exports.pdfService = functions.https.onRequest(PDFService);
exports.pdfCreator = functions.https.onRequest(PDFGenerator);
exports.emailSender = functions.https.onRequest(EmailService);
exports.authService = functions.https.onRequest(AuthService);
exports.workflow = functions.https.onRequest(Workflow);

