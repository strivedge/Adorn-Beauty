var EmailTemplateService = require('../services/emailTemplate.service');
// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getEmailTemplates = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';

    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    try {
        var emailTemplates = await EmailTemplateService.getEmailTemplates(query, parseInt(page), parseInt(limit), order_name, Number(order))
        // Return the EmailTemplates list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: emailTemplates, message: "Email templates recieved successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getEmailTemplate = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var emailTemplate = await EmailTemplateService.getEmailTemplate(id)
        // Return the EmailTemplate list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: emailTemplate, message: "Email template recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getEmailTemplatesbyOrg = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    } else {
        query['company_id'] = "";
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    try {
        var emailTemplates = await EmailTemplateService.getEmailTemplates(query, parseInt(page), parseInt(limit), order_name, Number(order))
        // Return the EmailTemplates list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: emailTemplates, message: "Email templates recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getAllEmailTemplatesbyOrg = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    else {
        query['company_id'] = "";
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    // console.log("getAllEmailTemplatesbyOrg ",query)
    try {
        var emailTemplates = await EmailTemplateService.getAllEmailTemplates(query)
        // Return the EmailTemplates list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: emailTemplates, message: "Email templates recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createEmailTemplate = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdEmailTemplate = await EmailTemplateService.createEmailTemplate(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdEmailTemplate, message: "Email template created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateEmailTemplate = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }
    var query = {};
    var emailTemplates = await EmailTemplateService.getEmailTemplateSpecific(query)
    try {
        var updatedEmailTemplate = await EmailTemplateService.updateEmailTemplate(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedEmailTemplate, message: "Email template updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeEmailTemplate = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await EmailTemplateService.deleteEmailTemplate(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}