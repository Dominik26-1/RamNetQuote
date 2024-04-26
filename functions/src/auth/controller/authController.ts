import { admin } from "../../config/firebase";


export async function verifyIdToken(tokenId: string): Promise<{success: boolean;value: any}> {
    try {
        const decodedToken = await admin.auth().verifyIdToken(tokenId);
        return {
            success: true,
            value: decodedToken
        };
    } catch (error: any) {
        return {
            success: false,
            value: error.message
        }
    }
}