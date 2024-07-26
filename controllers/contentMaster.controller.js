var ContentMasterService = require('../services/contentMaster.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getContentMasters = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};

    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    if (searchText) {
        query['$or'] = [{ name: { $regex: '.*' + searchText + '.*', $options: 'i' } }];
    }

    try {
        var contentMasters = await ContentMasterService.getContentMasters(query, parseInt(page), parseInt(limit), order_name, Number(order))
        // Return the ContentMasters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: contentMasters, message: "Content masters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.gettingContentMaster = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        // if((!req.body.company_id || req.body.company_id == '') && (req.body.location_id && req.body.location_id != '')){
        //     var location = await LocationService.getLocation(req.body.location_id);
        //     // console.log(location)
        //     if(location.company_id && location.company_id != '') {
        //         req.body.company_id = location.company_id;
        //     }
        // }
        // console.log('req.body',req.body)
        var query = {};
        if (req.body.company_id && req.body.company_id != 'undefined') {
            query['company_id'] = req.body.company_id;
        }

        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id;
        }

        if (req.body.name && req.body.name != 'undefined') {
            query['name'] = req.body.name;
        }

        // console.log('query',query)
        var contentMaster = await ContentMasterService.getAllContentMasters(query)
        // Return the ContentMaster list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: contentMaster, message: "Content master recieved succesfully!" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getContentMaster = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var contentMaster = await ContentMasterService.getContentMaster(id)
        // Return the ContentMaster list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: contentMaster, message: "Content master recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getContentMastersbyOrg = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};

    if (req.query.company_id && req.query.company_id != 'undefined') {
        //query = {company_id: req.query.company_id,status: 1};
        query['company_id'] = req.query.company_id;
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    if (searchText) {
        query['$or'] = [
            { name: { $regex: '.*' + searchText + '.*', $options: 'i' } }
        ];
    }

    try {
        var contentMasters = await ContentMasterService.getContentMasters(query, parseInt(page), parseInt(limit), order_name, Number(order))
        // Return the ContentMasters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: contentMasters, message: "Content masters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getAllContentMastersbyOrg = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        //query = {company_id: req.query.company_id,status: 1};
        query['company_id'] = req.query.company_id;
    } else {
        query['company_id'] = "";
    }

    // console.log("getAllContentMastersbyOrg ",query)
    try {
        var contentMasters = await ContentMasterService.getAllContentMasters(query)
        // Return the ContentMasters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: contentMasters, message: "Content masters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createContentMaster = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdContentMaster = await ContentMasterService.createContentMaster(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdContentMaster, message: "Content master created succesfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateContentMaster = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedContentMaster = await ContentMasterService.updateContentMaster(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedContentMaster, message: "Content master updated succesfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeContentMaster = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await ContentMasterService.deleteContentMaster(id);
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
