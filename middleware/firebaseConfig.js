import admin from 'firebase-admin'


var ServiceAccount = "./elearn-c4a22-firebase-adminsdk-44ha8-67177b45eb.json"
admin.initializeApp({
  credential: admin.credential.cert(ServiceAccount),
})
export const messaging = admin.messaging()