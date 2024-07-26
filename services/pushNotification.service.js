// Gettign the Newly created Mongoose Model we just created 
const PushNotificationLog = require('../models/PushNotificationLog.model')
const UserDeviceTokenService = require('../services/userDeviceToken.service');
const FirebaseService = require('../services/firebase.service');

var ObjectId = require('mongodb').ObjectId

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the PushNotificationLog List
exports.getPushNotificationLogs = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        const facetedPipeline = [
            { $match: query },
            { $sort: { createdAt: -1 } },
            {
                "$facet": {
                    "data": [
                        { "$skip": page },
                        { "$limit": limit }
                    ],
                    "pagination": [
                        { "$count": "total" }
                    ]
                }
            }
        ];

        var PushNotificationLogs = await PushNotificationLog.aggregate(facetedPipeline);
        // Return the PushNotificationLogd list that was retured by the mongoose promise
        return PushNotificationLogs;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating PushNotificationLogs');
    }
}

exports.getPushNotificationLogsOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var PushNotificationLogs = await PushNotificationLog.find(query)
            .populate({
                path: 'location_id',
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'client_id',
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        // Return the PushNotificationLogd list that was retured by the mongoose promise
        return PushNotificationLogs || []
    } catch (e) {
        // return a Error message describing the reason 
        return []
    }
}

// getting all PushNotificationLogs for company copy
exports.getPushNotificationLogsSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var PushNotificationLogs = await PushNotificationLog.find({ $match: query });

        // Return the PushNotificationLog list that was retured by the mongoose promise
        return PushNotificationLogs;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting PushNotificationLogs');
    }
}

exports.getPushNotificationLog = async function (id) {
    try {
        // Find the Data 
        var _details = await PushNotificationLog.findOne({ _id: id })
            .populate({
                path: 'location_id',
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'client_id',
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("PushNotificationLog not available")
    }
}

exports.sendPushNotification = async function (notificationPayload,logData) {
    try {
        if(notificationPayload && logData && logData.client_id){
            var userToken = await UserDeviceTokenService.getUserCurrentDeviceToken({user_id: logData.client_id, status:1});

            if(userToken && userToken.device_token){
                notificationPayload.token = userToken.device_token;

                console.log('notificationPayload',notificationPayload)

                let notiResponse = await FirebaseService.sendPushNotification(notificationPayload);

                var notiData = {
                    location_id: ObjectId(logData.location_id),
                    client_id: ObjectId(logData.client_id),
                    type: "direct",
                    noti_type: logData.noti_type,
                    notification: notificationPayload.notification,
                    data: notificationPayload.data,
                    token: userToken.device_token,
                    response: notiResponse,
                    response_status: 'success',
                    status: "sent"
                }
                console.log('notiData',notiData)
                var notiLog = await createPushNotificationLog(notiData);

                return notiLog;
            }
        }

        return null
    } catch (e) {
        console.log('error',e)
        // return a Error message describing the reason     
        throw Error("PushNotificationLog not available")
    }
}

const createPushNotificationLog = async function (pushNotificationLog) {
    var newPushNotificationLog = new PushNotificationLog({
        location_id: pushNotificationLog.location_id ? pushNotificationLog.location_id : null,
        client_id: pushNotificationLog.client_id ? pushNotificationLog.client_id : null,
        type: pushNotificationLog.type ? pushNotificationLog.type : "direct", // direct|cron
        noti_type: pushNotificationLog.noti_type ? pushNotificationLog.noti_type : "",
        notification: pushNotificationLog.notification ? pushNotificationLog.notification : null,
        data: pushNotificationLog.data ? pushNotificationLog.data : null,
        token: pushNotificationLog.token ? pushNotificationLog.token : "",
        response: pushNotificationLog.response ? pushNotificationLog.response : null,
        response_status: pushNotificationLog.response_status ? pushNotificationLog.response_status : "", // Pending|Sent|Received|Delivered|Queued|Failed
        status: pushNotificationLog.status ? pushNotificationLog.status : "initial" // initial|sent
    })

    try {
        // Saving the PushNotificationLog 
        var savedPushNotificationLog = await newPushNotificationLog.save()
        return savedPushNotificationLog
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating PushNotificationLog")
    }
}

exports.updatePushNotificationLog = async function (pushNotificationLog) {
    try {
        //Find the old PushNotificationLog Object by the Id
        var id = PushNotificationLog._id
        var oldPushNotificationLog = await PushNotificationLog.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the PushNotificationLog")
    }

    // If no old PushNotificationLog Object exists return false
    if (!oldPushNotificationLog) {
        return false
    }

    if (pushNotificationLog.location_id) {
        oldPushNotificationLog.location_id = pushNotificationLog.location_id
    }

    if (pushNotificationLog.client_id) {
        oldPushNotificationLog.client_id = pushNotificationLog.client_id
    }

    if (pushNotificationLog.type) {
        oldPushNotificationLog.type = pushNotificationLog.type
    }

    if (pushNotificationLog.noti_type) {
        oldPushNotificationLog.noti_type = pushNotificationLog.noti_type
    }

    if (pushNotificationLog.notification) {
        oldPushNotificationLog.notification = pushNotificationLog.notification
    }

    if (pushNotificationLog.data) {
        oldPushNotificationLog.data = pushNotificationLog.data
    }

    if (pushNotificationLog.token) {
        oldPushNotificationLog.token = pushNotificationLog.token
    }

    if (pushNotificationLog.response) {
        oldPushNotificationLog.response = pushNotificationLog.response
    }

    if (pushNotificationLog.response_status) {
        oldPushNotificationLog.response_status = pushNotificationLog.response_status
    }

    if (pushNotificationLog.status) {
        oldPushNotificationLog.status = pushNotificationLog.status
    }

    try {
        var savedPushNotificationLog = await oldPushNotificationLog.save()
        return savedPushNotificationLog
    } catch (e) {
        throw Error("And Error occured while updating the PushNotificationLog")
    }
}

exports.deletePushNotificationLog = async function (id) {
    // Delete the PushNotificationLog
    try {
        var deleted = await PushNotificationLog.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("PushNotificationLog Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the PushNotificationLog")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await PushNotificationLog.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the PushNotificationLog")
    }
}
