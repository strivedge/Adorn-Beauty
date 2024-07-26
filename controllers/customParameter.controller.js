var ContentService = require('../services/contents.service')
var CustomParameterService = require('../services/customParameter.service')
var LocationService = require('../services/location.service')

// Saving the context of this module inside the _the variable
_this = this

const { getCustomParameterData } = require('../helper');

// Async Controller function to get the To do List
exports.getCustomParameters = async function (req, res, next) {
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

    if (req.query.category && req.query.category != 'undefined') {
        query['category'] = req.query.category;
    }

    if (searchText && searchText != 'undefined') {
        query['$or'] = [
            { category: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { key: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { key_url: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { value: { $regex: '.*' + searchText + '.*', $options: 'i' } }
        ];
    }

    try {
        var customParameters = await CustomParameterService.getCustomParameters(query, parseInt(page), parseInt(limit), order_name, Number(order));
        var customParameter = customParameters[0].data;
        var pagination = customParameters[0].pagination;
        for (var i = 0; i < customParameter.length; i++) {
            var options = [];
            var custom_option = customParameter[i].custom_options;
            for (var j = 0; j < custom_option.length; j++) {
                var option_data = { value: custom_option[j] };
                options.push(option_data);
            }
            customParameter[i].custom_options = options
        }
        customParameters[0].data = customParameter;
        customParameters[0].pagination = pagination;
        // Return the CustomParameters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameters, message: "Custom parameters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// Async Controller function to get the To do List
exports.getCustomParametersbyOrg = async function (req, res, next) {
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

    if (req.query.category && req.query.category != 'undefined') {
        query['category'] = req.query.category;
    }

    if (searchText) {
        query['$or'] = [
            { category: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { key: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { key_url: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { value: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { value_type: { $regex: '.*' + searchText + '.*', $options: 'i' } }
        ];
    }
    // console.log("Query ",query)
    try {
        var customParameters = await CustomParameterService.getCustomParameters(query, parseInt(page), parseInt(limit), order_name, Number(order));
        var customParameter = customParameters[0].data;
        var pagination = customParameters[0].pagination;
        for (var i = 0; i < customParameter.length; i++) {
            var options = [];
            var custom_option = customParameter[i].custom_options;
            for (var j = 0; j < custom_option.length; j++) {
                var option_data = { value: custom_option[j] };
                options.push(option_data);
            }
            customParameter[i].custom_options = options
        }
        customParameters[0].data = customParameter;
        customParameters[0].pagination = pagination;
        // Return the CustomParameters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameters, message: "Custom parameters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// This is for all distinct category name
exports.getAllDistinctCategory = async function (req, res, next) {
    try {
        var customParameters = await CustomParameterService.getDistinctCategory();
        return res.status(200).json({ status: 200, flag: true, data: customParameters, message: "Distint Custom parameters recieved!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// Async Controller function to get the To do List
exports.getAllCustomParametersbyOrg = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    } else {
        query['company_id'] = "";
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    } else {
        query['location_id'] = "";
    }
    // console.log("getAllCustomParametersbyOrg ",query)
    try {
        var customParameters = await CustomParameterService.getAllCustomParameters(query)
        // Return the CustomParameters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameters, message: "Custom parameters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getSpecificCustomParameter = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        // console.log("getSpecificCustomParameter ",req.body)
        var location = await LocationService.getLocation(req.body.location_id);
        var customParameter = await getCustomParameterData(location.company_id, req.body.location_id, req.body.key_url);

        // Return the CustomParameters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameter, message: "Custom parameter recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomParameterLocation = async function (req, res, next) {
    if (!req.query.location_id) {
        return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present!" })
    }
    query = { location_id: req.query.location_id };

    try {
        var customParameter = await CustomParameterService.getAllCustomParameters(query);
        // Return the CustomParameter list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameter, message: "Custom parameters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.gettingCustomParameter = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value    
    try {
        var customParameters = await ContentService.getCustomParameter(req.body)
        // Return the CustomParameters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameters, message: "Custom parameters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomParameter = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var customParameter = await CustomParameterService.getCustomParameter(id)
        // Return the CustomParameter list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameter, message: "Custom parameter recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createCustomParameter = async function (req, res, next) {
    try {
        var query = {
            key: req.body.key,
            location_id: req.body.location_id,
        }
        var isExistparameter = await CustomParameterService.getCustomParametersOne(query);
        if (!isExistparameter) {
            var getMasterCustomParameterId = await CustomParameterService.getMasterCustomParameterId(req.body)
            req.body.master_custom_parameter_id = getMasterCustomParameterId;
            // Calling the Service function with the new object from the Request Body
            var createdCustomParameter = await CustomParameterService.createCustomParameter(req.body)
            return res.status(200).json({ status: 200, flag: true, data: createdCustomParameter, message: "Custom parameter created succesfully!" })
        } else {
            return res.status(200).json({ status: 200, flag: false, message: "Custom parameter all ready exist!" })
        }
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateCustomParameter = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedCustomParameter = await CustomParameterService.updateCustomParameter(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedCustomParameter, message: "Custom parameter updated succesfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCustomParameter = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await CustomParameterService.deleteCustomParameter(id);
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}