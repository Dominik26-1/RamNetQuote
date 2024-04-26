import { Request, Response } from "firebase-functions";
import { verifyIdToken } from '../../auth/controller/authController';
import { admin } from "../../config/firebase";

// Získajte referenciu na Firebase Storage
const bucket = admin.storage().bucket();
//const oneMinute = 60;

// Hlavná funkcia obsahujúca logiku na sťahovanie PDF súboru
export const uploadPDF = async function uploadPDF(req: Request, res: Response) {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);
        const pdfBuffer = req.body.response;
        const pdfFileName = req.body.fileName;
        const tenantId: string = req.headers['tenant-id'] as string;
        await savePDFToStorage(pdfBuffer, pdfFileName, tenantId);
        return res.status(200).send("Succesfully uploaded.");
    } catch (error: any) {
        return res.status(500).send(error.message);
    }

}
// Hlavná funkcia obsahujúca logiku na sťahovanie PDF súboru
export const downloadPDF = async function downloadPDF(req: Request, res: Response) {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);
        const tenantId: string = req.headers['tenant-id'] as string;

        const fileName = req.params.fileName;
        const file = bucket.file(`${tenantId}/pdf/${fileName}`);

        const [fileBuffer] = await file.download();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        return res.status(200).send(fileBuffer);

    } catch (error: any) {
        return res.status(500).send(error.message);
    }

}
// Hlavná funkcia obsahujúca logiku na sťahovanie PDF súboru
export const getQuoteUrl = async function getUrl(req: Request, res: Response) {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);
        const tenantId: string = req.headers['tenant-id'] as string;
        const pdfFileName: string = req.params.fileName;
        const storageFileRef = bucket.file(`${tenantId}/pdf/${pdfFileName}`);
        const url = await getFileUrl(storageFileRef);
        return res.status(200).send({ url: url });
    } catch (error: any) {
        return res.status(500).send(error.message);
    }
}

// Hlavná funkcia obsahujúca logiku na sťahovanie PDF súboru
export const getTemplateUrl = async function getTemplateUrl(req: Request, res: Response) {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);
        const tenantId: string = req.headers['tenant-id'] as string;
        const storageFileRef = bucket.file(`${tenantId}/template/template.pdf`);
        const url = await getFileUrl(storageFileRef);

        //console.log(Buffer.from(buffer));
        return res.status(200).send({ url: url });
    } catch (error: any) {
        return res.status(500).send(error.message);
    }
}

export const getFontUrls = async function getFontUrls(req: Request, res: Response) {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);
        const tenantId: string = req.headers['tenant-id'] as string;
        const storageFileRef = bucket.file(`${tenantId}/template/Cardo-Bold.ttf`);
        const regularStorRef = bucket.file(`${tenantId}/template/Cardo-Regular.ttf`);
        const cardoBoldUrl = await getFileUrl(storageFileRef);
        const cardoRegularUrl = await getFileUrl(regularStorRef);

        //console.log(Buffer.from(buffer));
        return res.status(200).send({
            urlBold: cardoBoldUrl,
            urlRegular: cardoRegularUrl
        });
    } catch (error: any) {
        return res.status(500).send(error.message);
    }
}

export const deletePDF = async function deletePDF(req: Request, res: Response) {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);
        const tenantId: string = req.headers['tenant-id'] as string;
        const fileName = req.params.fileName;
        const file = bucket.file(`${tenantId}/pdf/${fileName}`);

        const response = await file.delete();
        //console.log(Buffer.from(buffer));
        return res.status(200).send(response);
    } catch (error: any) {
        return res.status(500).send(error.message);
    }

}
export const savePDFToStorage = async function savePDFToStorage(pdfContent: Buffer,
    fileName: string,
    tenantId: string): Promise<void> {
    const file = bucket.file(`${tenantId}/pdf/${fileName}`);
    await file.save(pdfContent, { contentType: 'application/pdf' });
}


async function getFileUrl(storagePathFile: any): Promise<string> {
    // Získanie URL adresy pre súbor v kôši
    const [url] = await storagePathFile.getSignedUrl({
        action: 'read',
        //expires: Date.now() + oneMinute, // časový limit pre platnosť URL adresy
        expires: '2025-07-07'
    });
    return url;
}