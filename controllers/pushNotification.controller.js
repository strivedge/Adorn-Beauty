var PushNotificationService = require('../services/pushNotification.service')
var ObjectId = require('mongodb').ObjectId

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getPushNotificationLogs = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var serachText = req.query.serachText ? req.query.serachText : '';

    var query = {};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = ObjectId(req.query.location_id);
    }

    if (req.query.from_date && req.query.from_date != 'undefined' && req.query.to_date && req.query.to_date != 'undefined') {
        query['date'] = { $gte: (req.query.from_date), $lte: (req.query.to_date) }
    }

    if (req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [{ mobile: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { sms_type: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },{ content: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }];
    }

    try {
        console.log('query',query)
        var PushNotificationLogs = await PushNotificationLogService.getPushNotificationLogs(query, parseInt(page), parseInt(limit), order_name, Number(order), serachText)

        // Return the Tests list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: PushNotificationLogs, message: "WhatsApp Logs recieved successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getPushNotificationLog = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var PushNotificationLog = await PushNotificationLogService.getPushNotificationLog(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: PushNotificationLog, message: "WhatsApp Log recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getPushNotificationLogSpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var query = {}
        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
        }

        if (req.query.from_date && req.query.from_date != 'undefined' && req.query.to_date && req.query.to_date != 'undefined') {
            query['createdAt'] = { $gte: (req.query.from_date), $lte: (req.query.to_date) }
        }

        //console.log('query',query)
        var PushNotificationLog = await PushNotificationLogService.getPushNotificationLogsSpecific(query)
        // console.log("WhatsApp Logs len ",tests.length)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: PushNotificationLog, message: "WhatsApp Log recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createPushNotificationLog = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var createdTest = await PushNotificationLogService.createPushNotificationLog(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdTest, message: "WhatsApp Log created successfully! " })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removePushNotificationLog = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var deleted = await PushNotificationLogService.deletePushNotificationLog(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
