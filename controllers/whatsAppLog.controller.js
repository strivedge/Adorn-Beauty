var WhatsAppLogService = require('../services/whatsAppLog.service')
var ObjectId = require('mongodb').ObjectId
var superAdminRole = process.env?.SUPER_ADMIN_ROLE || "607d8aeb841e37283cdbec4b"
var orgAdminRole = process.env?.ORG_ADMIN_ROLE || "6088fe1f7dd5d402081167ee"
var branchAdminRole = process.env?.BRANCH_ADMIN_ROLE || "608185683cf3b528a090b5ad"

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getWhatsAppLogs = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var serachText = req.query.serachText ? req.query.serachText : '';

    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = ObjectId(req.query.location_id);
    }
    if ([orgAdminRole, branchAdminRole].includes(req.roleId)) {
        const locationId = req.query.location_id ? ObjectId(req.query.location_id) : null;
        const companyId = req.query.company_id ? ObjectId(req.query.company_id) : null;
    
        query['location_id'] = { $in: [locationId, '', null] };
        query['company_id'] = { $in: [companyId] };
    }

    // Check the role id and update the query accordingly
    if ([superAdminRole].includes(req.roleId)) {
        const locationId = req.query.location_id ? ObjectId(req.query.location_id) : null;
        const companyId = req.query.company_id ? ObjectId(req.query.company_id) : null;
    
        query['location_id'] = { $in: [locationId, '', null] };
        query['company_id'] = { $in: [companyId, '', null] };
    }
    

    if (req.query.from_date && req.query.from_date != 'undefined' && req.query.to_date && req.query.to_date != 'undefined') {
        query['date'] = { $gte: (req.query.from_date), $lte: (req.query.to_date) }
    }

    if (req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [{ mobile: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { msg_type: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },{ content: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }];
    }

    try {
        // console.log('query',query)
        var WhatsAppLogs = await WhatsAppLogService.getWhatsAppLogs(query, parseInt(page), parseInt(limit), order_name, Number(order), serachText)

        // Return the Tests list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: WhatsAppLogs, message: "WhatsApp Logs recieved successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getWhatsAppLog = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var WhatsAppLog = await WhatsAppLogService.getWhatsAppLog(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: WhatsAppLog, message: "WhatsApp Log recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getWhatsAppLogSpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var query = {}
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
        }

        if (req.query.from_date && req.query.from_date != 'undefined' && req.query.to_date && req.query.to_date != 'undefined') {
            query['createdAt'] = { $gte: (req.query.from_date), $lte: (req.query.to_date) }
        }

        //console.log('query',query)
        var WhatsAppLog = await WhatsAppLogService.getWhatsAppLogsSpecific(query)
        // console.log("WhatsApp Logs len ",tests.length)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: WhatsAppLog, message: "WhatsApp Log recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createWhatsAppLog = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var createdTest = await WhatsAppLogService.createWhatsAppLog(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdTest, message: "WhatsApp Log created successfully! " })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeWhatsAppLog = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var deleted = await WhatsAppLogService.deleteWhatsAppLog(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
