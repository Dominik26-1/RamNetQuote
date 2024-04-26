import * as admin from 'firebase-admin';
//import { getStorage, ref } from "firebase/storage";


admin.initializeApp({
    credential: admin.credential.cert({
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCgn4OrFmWeGyiW\nbyWVaMWEbpddgQdWywVGwDFyBZPyCJVBGBBS4jM8NnNJzZwbb3HrTyMt1tllZixB\n9DgYgadZv/YEnt2iuuZ2ZYsR3q3dDRHamRiqgzJaxx163tZj2cZKp6GA2vCVD0z8\nKJJuXdrB4M+z6C5P9Vuw59AhHMpCtS7tHivs9WjVhI09FFs5teZi8Ds4lPTMh4mS\nt6oUzxGy1bPn2tTD8s0hD9BZgO/MlIs2OD/gvJadtTuzpokCxQ2HlwD23cL3AI0Z\nqTbmWVQO9ko5c0tSKmq1bISVydYP/CdZFXHf78TnrLRLempFdveQaGbbpPbZ80bu\nh688AJ/lAgMBAAECggEADNRAzYD389VifAV7oH/iSs4Ue+zq26VSkhCWwm8snmfO\nGAlmgGA9zGDi+3GXNt/DXxKOkkI3UfCDt27criRo6/O3oC3aMP2xm6JHpdE93MqG\n8wlIXZImCvcdZSt4PzhtLJhP/309OwKiWP+aloMbjmG45Ts1u8AypyIUzxhAFWzH\n3m/HnQIkVDkqxfD0U8kPa3RrtaLhmA1Nkry60Iq3tSfJr60cOQASvGyoBK4GTbda\nhQTBNqfWhVT1Yb1GMWnJuaA/zIq3BLKtPXKdHBwKxQcJDfirbK8/uhp/l1F1w46x\nWlx2mQkiE0/PHrbsCs0VaWhQClEs5lzC+l3izho7jwKBgQDRWzJz7TMfjx5a7C4x\nqfG20GgTdgWSP5fU7SgpWNkKbhZKql8yEWgRcDsXGols+6ZWa9KVxZAgV0njFJ3O\nmFQKqOQuHRvnKMd9biBLGzaH8esWkqxJMz9KmaaNqXk9MC5gbNONST6r/eYs704m\nCR9ILxBZH7+J5mnt5gYtQId2wwKBgQDEaMiHObNN7XzdYosJax3YcfGQln238bZ6\nqpVFck582HHnASR9TZv8S8u6R/BlXN5AUHXXUwvuQiQajKmCzNeDFPxboJXKhX1c\npHmcT1J8oyeDtfOqMcNq93+N7iV1MjzMeJpdzY2oxhRd0CCwCen6VF9w6NrgLDYE\n7r0qPre0NwKBgAlrpiCLSuKfqQkEWavIbuUACb7eb6++BtIA/e6mXdXXUE95zSDO\nobUvLKmEeyyZQknfPjGZGzwpUVzTf6pdNmLoaKQekTPcpOVjADcA+Xoyi5aPcQs2\nMCHmOhVjy93R/jQ+kWJpKlXI7gOVnRmfDXZND9pC0HafFKMs15hPsAjLAoGBAI6w\ngV6ccMNgkaJUgSYqh9hDj3e3nUYReLzNSPzW+maA6N8mWVgfFf/JIQ0IToGVYnHf\nAn2Ye8ZwjsIrBstb/gXhLSV0GN609Eplw2PnzMl3zrFFcuxmks4XWLfIF7Z49Oqn\ng546Q3wly44MMnMyAKY4vc3NnZXXCLe0qgES52spAoGAYrZByvvjLznLSHQQp4KL\n3L+GYFi1vL+HqSBWRZJhtGyZWX5CyF0vUlFWM/vDiMs2KIf9+gAHdoC8Cb2FOQy8\ncg8oGZeRAKZbh17+wwtbioaQuZRXxFRz84k3dIBw44zTFy/QYO9H8v9HlwjxD/eC\n5zP1Z+L8flQ52fsXurEBH54=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
        projectId: "ramnetquote",
        clientEmail: "firebase-adminsdk-ekx0w@ramnetquote.iam.gserviceaccount.com"
    }),
    databaseURL: 'https://ramnetquote.firebaseio.com',
    storageBucket: 'ramnetquote.appspot.com',
})
async function grantSuperUser(): Promise<void> {
    try {
        const adminUser = await admin.auth().getUserByEmail('ramcom@ramcom.sk')
        admin.auth().setCustomUserClaims(adminUser.uid, {
            superUser: true,
            tenantId: 'ramcom'
        })
    } catch (error: any) {
        //throw new Error(error.message);
    }
}
grantSuperUser();


/*
admin.auth().getUserByEmail('ramcom@ramcom.sk').then((superUser) => {
    admin.auth().setCustomUserClaims(superUser.uid, {
        superUser: true,
    }).catch((error) =>
        admin.auth().createUser(
            {
                email: 'ramcom@ramcom.sk',
                emailVerified: true,
                password: 'password'
            }
        ).then((createdSuperUser) =>
            admin.auth().setCustomUserClaims(createdSuperUser.uid, {
                superUser: true,
            })).catch(_ => {
                console.log('SuperUser not properly set up.');
                throw new Error('SuperUser not properly set up.')
            }
            ));
})

*/
/*
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "localhost:9199", // Názov vašej nádrže pre Cloud Storage vo vašom projekte
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

initializeApp(firebaseConfig);*/
/*
const firebaseConfig = {
    apiKey: "AIzaSyDz2H4582mXqpEeLHvu9P6VGCmg93gRei4",
    authDomain: "ramnetquote.firebaseapp.com",
    projectId: "ramnetquote",
    storageBucket: "localhost:9199",
    messagingSenderId: "321067675507",
    appId: "1:321067675507:web:d97ea1508a7d3383899f06",
    measurementId: "G-2RB11FDGWM"
};*/
const db = admin.firestore();
/*const storage = getStorage();
console.log(storage);
function getStorageFileRef(filePath: string) {
    return ref(storage, filePath);
}
*/
export { admin, db };

