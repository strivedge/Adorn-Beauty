var CronjobActionService = require('../services/cronjobAction.service');
var LocationService = require('../services/location.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getCronjobActions = async function (req, res, next) {
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
        query['$or'] = [
            { name: { $regex: '.*' + searchText + '.*', $options: 'i' } }
        ];
    }
    // console.log('getCronjobActions',query)
    try {
        var cronjobActions = await CronjobActionService.getCronjobActions(query, parseInt(page), parseInt(limit), order_name, Number(order));
        // Return the CronjobActions list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: cronjobActions, message: "Cronjob actions recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCronjobAction = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var cronjobAction = await CronjobActionService.getCronjobAction(id)
        // Return the CronjobAction list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: cronjobAction, message: "Cronjob action recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createCronjobAction = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        if (req.body.location_id) {
            var location = await LocationService.getLocation(req.body.location_id);
            if (location && location.company_id) {
                req.body.company_id = location.company_id;
            }
        }
        var createdCronjobAction = await CronjobActionService.createCronjobAction(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdCronjobAction, message: "Cronjob action created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateCronjobAction = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        if (req.body.location_id) {
            var location = await LocationService.getLocation(req.body.location_id);
            if (location && location.company_id) {
                req.body.company_id = location.company_id;
            }
        }
        var updatedCronjobAction = await CronjobActionService.updateCronjobAction(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedCronjobAction, message: "Cronjob action updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCronjobAction = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }
    try {
        var deleted = await CronjobActionService.deleteCronjobAction(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}