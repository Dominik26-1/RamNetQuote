import { Request, Response } from "firebase-functions";
import { db } from "../../config/firebase";
import { Customer, CustomerDetail } from '../model/customer';
import { verifyIdToken } from '../../auth/controller/authController';

export const getAllCustomers = async function getAllCustomers(req: Request, res: Response): Promise<Response> {
    try {
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success) return res.status(403).send(verificationRes.value);

        const tenantId = req.headers['tenant-id'];
        const customerCollection = db.collection(`${tenantId}_customers`);
        const customerName = req.query.customerName;
        let filteredCustomers = customerCollection.orderBy('name');
        if (customerName) {
            //const regex = new RegExp('.*${customerName}.*', 'i'); //i = ignore case
            const quoteAttr = 'name';
            filteredCustomers = filteredCustomers
                .where(quoteAttr, '>=', customerName)
                .where(quoteAttr, '<=', customerName + '\uf8ff');
        }
        //order documents
        //console.log(filteredCustomers);
        const querySnapshot = await filteredCustomers.get();
        const docs = querySnapshot.docs.map(doc => doc.data())
        return res.status(200).send(docs);
    } catch (error: any) {
        return res.status(500).send(error.message);
    }
}

export const createOrReplaceCustomer = async function createOrReplaceCustomer(data: Customer, tenantId: string): Promise<{ success: boolean; value: any; }> {
    const customerCollection = db.collection(`${tenantId}_customers`);
    const custDocs = await customerCollection.where('email', '==', data.email).get();

    if (custDocs.empty) {
        return createCustomer(data, tenantId);
    }
    else {
        const existingCustomerId: string = custDocs.docs[0].data().id;
        return updateCustomer(data, tenantId, existingCustomerId);
    }
}


export const createCustomer = async function createCustomer(data: Customer, tenantId: string): Promise<{ success: boolean; value: any; }> {
    try {
        const customerCollection = db.collection(`${tenantId}_customers`);
        const customerDoc = customerCollection.doc();
        const customerId = customerDoc.id;
        const customer: CustomerDetail = {
            ...data,
            id: customerId,
            createdAt: new Date()
        };
        await customerDoc.create(
            customer
        );
        //return res.status(200).send(customerId);
        return {
            success: true,
            value: customerId
        };
    }
    catch (error: any) {

        return {
            success: false,
            value: error.message
        };
    }
}

export const updateCustomer = async function updateCustomer(data: Customer, tenantId: string, id: string): Promise<{ success: boolean; value: any; }> {
    try {
        const customerCollection = db.collection(`${tenantId}_customers`);

        const documentRef = customerCollection.doc(id);
        const document = await documentRef.get();
        if (document.exists) {
            await documentRef.update({
                name: data.name,
                city: data.city,
                street: data.street,
                postalCode: data.postalCode,
                phoneNumber: data.phoneNumber
            }
            );
            return {
                success: true,
                value: id
            };
        }
        return {
            success: false,
            value: "Customer not found to update it."
        }
    }
    catch (error: any) {
        return {
            success: false,
            value: error.message
        };
    }
}
