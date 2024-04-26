import cors from 'cors';
import express from 'express';
import { Request, Response } from "firebase-functions";
import { admin } from "../config/firebase";
import { verifyIdToken } from './controller/authController';
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.post('/user', async (req: Request, res: Response) => {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success || !verificationRes.value.superUser) return res.status(403).send(verificationRes.value);
        const isSuperUser: boolean = req.body.isSuperUser || false;
        const tenantId = req.body.tenantId;
        const createdUser = await admin.auth().createUser(
            {
                email: req.body.email,
                password: req.body.password,
                displayName: req.body.displayName,
            }
        )
        await admin.auth().setCustomUserClaims(createdUser.uid, {
            superUser: isSuperUser,
            tenantId: tenantId
        }
        )
        return res.status(200).send();
    }
    catch (error: any) {
        return res.status(500).send(error.message);
    }
}
)
app.put('/user:id', async (req: Request, res: Response) => {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success || !verificationRes.value.superUser) return res.status(403).send(verificationRes.value);

        const userId = req.params.id;
        await admin.auth().updateUser(
            userId,
            {
                email: req.body.email,
                password: req.body.password,
                displayName: req.body.displayName,
            }
        )
        await admin.auth().setCustomUserClaims(userId, {
            superUser: req.body.superUser,
            tenantId: req.body.tenantId
        })
        return res.status(200).send({ id: userId });
    }
    catch (error: any) {
        return res.status(500).send(error.message);
    }
}
)
app.delete('/user:id', async (req: Request, res: Response) => {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success || !verificationRes.value.superUser) return res.status(403).send(verificationRes.value);

        await admin.auth().deleteUser(
            req.params.id
        )
        return res.status(200).send();
    }
    catch (error: any) {
        return res.status(500).send(error.message);
    }
}
)
app.get('/user', async (req: Request, res: Response) => {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success || !verificationRes.value.superUser) return res.status(403).send(verificationRes.value);

        const allUsers = await admin.auth().listUsers();
        return res.status(200).send(allUsers.users);
    }
    catch (error: any) {
        return res.status(500).send(error.message);
    }
}
)
app.get('/user:id', async (req: Request, res: Response) => {
    try {
        //verification of current user
        const token = req.headers['token-id'];
        const verificationRes = await verifyIdToken(token as string);
        if (!verificationRes.success || !verificationRes.value.superUser) return res.status(403).send(verificationRes.value);
        const user = await admin.auth().getUser(
            req.params.id
        )
        return res.status(200).send(user);
    }
    catch (error: any) {
        return res.status(500).send(error.message);
    }
}
)
export { app as AuthService };

