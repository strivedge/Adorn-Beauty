const admin=require('firebase-admin');
const adminApp=require('firebase-admin');
const serviceAccount = require("../appointgem-admin-firebase.json");
const adminServiceAccount = require("../appointgem-customer-firebase.json");


//send push notification
exports.sendPushNotification = async function (payload) {
    try {
        // admin.initializeApp({
        //     credential: admin.credential.cert(serviceAccount)
        // });

        // let response = await admin.messaging().send(payload);
        // return response;
        return;
    } catch (e) {
        console.log('sendPushNotification',e)
        // return an Error message describing the reason
        //throw Error(e);
        return null;
    }
}

exports.sendAdminPushNotification = async function (payload) {
    try {
        // admin.initializeApp({
        //     credential: adminApp.credential.cert(adminServiceAccount)
        // });

        // let response = await adminApp.messaging().send(payload);
        // return response;
        return;
    } catch (e) {
        console.log('sendPushNotification',e)
        // return an Error message describing the reason
        //throw Error(e);
        return null;
    }
}

// subscribe to topic
exports.sendPushNotificationToMultipleDevice = async function (tokens,topic) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        let response = await admin.messaging().sendToDevice(tokens,topic);
        return response;
    } catch (e) {
        // return an Error message describing the reason
        throw Error("Error while Subscribing to Topic");
    }
}

//send push notification to topic
exports.sendPushNotificationToTopic = async function (topic,payload) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        let response = await admin.messaging().sendToTopic(topic,payload);
        return response;
    } catch (e) {
        // return an Error message describing the reason
        throw Error("Error while Sending Push Notification to Topic");
    }
}
