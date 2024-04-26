import { Request, Response } from "firebase-functions";
import { verifyIdToken } from '../../auth/controller/authController';
import { db } from "../../config/firebase";
import { CompanyData } from '../model/companyConfig';

const companyCollection = db.collection('companies');
export const getCompanyData = async function getCompanyData(req: Request, res: Response): Promise<Response> {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);

        const tenantId = req.params.tenantId;
        const companyQuery = companyCollection.where('tenantId', '==', tenantId).limit(1);

        const companySnapshot = await companyQuery.get();
        if (!companySnapshot.empty) {
            const companyData: CompanyData = companySnapshot.docs[0].data() as CompanyData;
            return res.status(200).send(companyData);
        }

        return res.status(404).send({ 'error': `No data found for ${tenantId}` });
    } catch (error: any) {
        return res.status(500).send({ 'error': error.message });
    }
}