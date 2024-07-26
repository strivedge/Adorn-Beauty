var CustomParameterService = require('../services/customParameter.service')
var MasterCustomParameterService = require('../services/masterCustomParameter.service')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getMasterCustomParameters = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (req.query.category && req.query.category != 'undefined') {
        query['category'] = req.query.category;
    }

    if (searchText && searchText != 'undefined') {
        query['$or'] = [
            { key: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { key_url: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { value: { $regex: '.*' + searchText + '.*', $options: 'i' } }
        ];
    }

    try {
        var masterCustomParameters = await MasterCustomParameterService.getMasterCustomParameters(query, parseInt(page), parseInt(limit), order_name, Number(order));
        var masterCustomParameter = masterCustomParameters[0].data;
        var pagination = masterCustomParameters[0].pagination;
        for (var i = 0; i < masterCustomParameter.length; i++) {
            var options = [];
            var custom_option = masterCustomParameter[i].custom_options;
            for (var j = 0; j < custom_option.length; j++) {
                var option_data = { value: custom_option[j] };
                options.push(option_data);
            }
            masterCustomParameter[i].custom_options = options
        }
        masterCustomParameters[0].data = masterCustomParameter;
        masterCustomParameters[0].pagination = pagination;
        // Return the MasterCustomParameters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterCustomParameters, message: "Master custom parameters recieved succesfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getMasterCustomParameter = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var masterCustomParameter = await MasterCustomParameterService.getMasterCustomParameter(id);
        // Return the MasterCustomParameter list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterCustomParameter, message: "Master custom parameter recieved succesfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getDistinctMasterCustomParameters = async function (req, res, next) {
    try {
        var field = req.query?.field || "category";

        var masterCustomParameters = await MasterCustomParameterService.getDistinctMasterCustomParameters(field, {});
        // Return the MasterCustomParameter list with Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: masterCustomParameters,
            message: "Master custom parameter distinct recieved succesfully!"
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.checkTypeMasterCustomParameterItem = async function (req, res, next) {
    var key = req.query?.key || "";
    var id = req.query?.id || "";
    if (!key) {
        return res.status(200).json({ status: 200, flag: false, message: "Key must be present!" });
    }

    try {
        var query = { key };
        if (id) { query['_id'] = { $ne: id }; }
        var masterCustomParameter = await MasterCustomParameterService.getMasterCustomParameterOne(query);

        return res.status(200).json({
            status: 200,
            flag: true,
            data: masterCustomParameter,
            message: "Master custom parameter received successfully!"
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createMasterCustomParameter = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var key = req.body?.key || "";
        if (key) {
            var masterCustomParameter = await MasterCustomParameterService.getMasterCustomParameterOne({ key });
            if (masterCustomParameter && masterCustomParameter?._id) {
                return res.status(200).json({ status: 200, flag: false, message: "Master custom parameter key already exists!" });
            }
        }

        var createdMasterCustomParameter = await MasterCustomParameterService.createMasterCustomParameter(req.body);
        return res.status(200).json({ status: 200, flag: true, data: createdMasterCustomParameter, message: "Master custom parameter created succesfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateMasterCustomParameter = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" });
    }

    try {
        var updatedMasterCustomParameter = await MasterCustomParameterService.updateMasterCustomParameter(req.body);
        return res.status(200).json({ status: 200, flag: true, data: updatedMasterCustomParameter, message: "Master custom parameter updated succesfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMasterCustomParameter = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await MasterCustomParameterService.deleteMasterCustomParameter(id);
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createDefaultMasterCustomParameters = async function (req, res, next) {
    try {
        var locationId = req.body?.location_id || "";
        if (!locationId) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: "Location Id must be present!"
            })
        }

        var query = { location_id: locationId };
        var customParameters = await CustomParameterService.getCustomParametersSimple(query);
        if (customParameters && customParameters?.length) {
            var masterCustomParameters = await MasterCustomParameterService.getMasterCustomParametersSimple({});
            if (masterCustomParameters && masterCustomParameters?.length) {
                var masterCustomParameterIds = masterCustomParameters.map((item) => {
                    return item?._id || ""
                })
                masterCustomParameterIds = masterCustomParameterIds.filter((x) => x != "")
                await MasterCustomParameterService.deleteMultiple({ _id: { $in: masterCustomParameterIds } });
            }

            for (let i = 0; i < customParameters.length; i++) {
                const element = customParameters[i];
                var createdMasterCustomParameter = await MasterCustomParameterService.createMasterCustomParameter(element);
            }
        }

        var masterCustomParameters = await MasterCustomParameterService.getMasterCustomParametersSimple({});

        return res.status(200).json({ status: 200, flag: true, data: masterCustomParameters, message: "Default custom parameters created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
