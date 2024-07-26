var OfferEmailTemplateService = require('../services/offerEmailTemplate.service');
// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getOfferEmailTemplates = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var serachText = req.query.serachText ? req.query.serachText : '';

    var query = {};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id' ] = req.query.location_id;
    } 
    
    try {
        var OfferEmailTemplates = await OfferEmailTemplateService.getOfferEmailTemplates(query, parseInt(page), parseInt(limit),order_name,Number(order),serachText)
        // Return the OfferEmailTemplates list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: OfferEmailTemplates, message: "Successfully Offer Email Templates Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getOfferEmailTemplate = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var OfferEmailTemplate = await OfferEmailTemplateService.getOfferEmailTemplate(id)
        // Return the OfferEmailTemplate list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: OfferEmailTemplate, message: "Successfully Offer Email Template Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getSpecificOfferEmailTemplates = async function (req, res, next) {
    var query = {};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id' ] = req.query.location_id;
    }
    if (req.query.status && req.query.status == 1) {
        query['status' ] = 1;
    }  

    try {
        console.log('query',query)
        var OfferEmailTemplates = await OfferEmailTemplateService.getSpecificOfferEmailTemplates(query)
        // Return the OfferEmailTemplates list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: OfferEmailTemplates, message: "Successfully Offer Email Templates Recieved"});
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createOfferEmailTemplate = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdOfferEmailTemplate = await OfferEmailTemplateService.createOfferEmailTemplate(req.body)
        return res.status(200).json({status:200, flag: true,data: createdOfferEmailTemplate, message: "Successfully Created OfferEmailTemplate"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "Offer Email Template Creation was Unsuccesfull"})
    }
}

exports.updateOfferEmailTemplate = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedOfferEmailTemplate = await OfferEmailTemplateService.updateOfferEmailTemplate(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedOfferEmailTemplate, message: "Successfully Updated Offer Email Template"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeOfferEmailTemplate = async function (req, res, next) {
     var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }

    try {
        var deleted = await OfferEmailTemplateService.deleteOfferEmailTemplate(id);
        res.status(200).send({status: 200, flag: true,message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}