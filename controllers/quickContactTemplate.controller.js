var QuickContactTemplateService = require('../services/quickContactTemplate.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getQuickContactTemplates = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';
    
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id' ] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    if(req.query.searchText && req.query.searchText != 'undefined'){
        query['$or'] = [ { name: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }, { desc: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }];
    }

    try {
        var QuickContactTemplates = await QuickContactTemplateService.getQuickContactTemplates(query, parseInt(page), parseInt(limit),order_name,Number(order),searchText)
        // Return the QuickContactTemplates list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: QuickContactTemplates, message: "Successfully QuickContactTemplates Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getActiveQuickContactTemplates = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id' ] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.status == 1) {
        query['status' ] = 1;
    }
    if(req.query.searchText && req.query.searchText != 'undefined'){
        query['$or'] = [ { name: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }, { desc: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }];
    }
    try {
        // console.log("query ",query)
        var QuickContactTemplates = await QuickContactTemplateService.getActiveQuickContactTemplates(query)
        // Return the QuickContactTemplates list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: QuickContactTemplates, message: "Successfully QuickContactTemplates Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getQuickContactTemplate = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var QuickContactTemplate = await QuickContactTemplateService.getQuickContactTemplate(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: QuickContactTemplate, message: "Successfully QuickContactTemplate Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

// getting all QuickContactTemplates for company copy
exports.getQuickContactTemplatesCompanySpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var data = req.body;
    try {
        var location_id = [];
        for(var i = 0; i < data.length; i++) {
            location_id.push(data[i]);
        }
        var query = {location_id: {$in: location_id}};
        var QuickContactTemplates = await QuickContactTemplateService.getQuickContactTemplatesCompanySpecific(query, page, limit)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: QuickContactTemplates, message: "Successfully Services Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getQuickContactTemplatesbyLocation = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    // console.log("req Categories ",req.query)
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000; 
    var query = { location_id: req.query.location_id };

    // console.log('getQuickContactTemplatesbyLocation ',query)
    try {
        var QuickContactTemplates = await QuickContactTemplateService.getQuickContactTemplatesbyLocation(query, page, limit)
        // console.log("QuickContactTemplates ",QuickContactTemplates)
        // Return the Categories list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: QuickContactTemplates, message: "Successfully QuickContactTemplates Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createQuickContactTemplate = async function (req, res, next) {

    //console.log('req body',req.body)

    try {
        // Calling the Service function with the new object from the Request Body
        var createdQuickContactTemplate = await QuickContactTemplateService.createQuickContactTemplate(req.body)
        return res.status(200).json({status:200, flag: true,data: createdQuickContactTemplate, message: "Successfully Created QuickContactTemplate"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "QuickContactTemplate Creation was Unsuccesfull"})
    }
    
}

exports.updateQuickContactTemplate = async function (req, res, next) {

    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedQuickContactTemplate = await QuickContactTemplateService.updateQuickContactTemplate(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedQuickContactTemplate, message: "Successfully Updated QuickContactTemplate"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeQuickContactTemplate = async function (req, res, next) {

    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    try {
        var deleted = await QuickContactTemplateService.deleteQuickContactTemplate(id);
        res.status(200).send({status: 200, flag: true,message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}





