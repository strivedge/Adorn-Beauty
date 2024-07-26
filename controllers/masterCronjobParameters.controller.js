var CronjobParameterService = require('../services/cronjobParameter.service');
var MasterCronjobParameterService = require('../services/masterCronjobParameter.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getMasterCronjobParameters = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (searchText && searchText != 'undefined') {
        query['$or'] = [
            { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { desc: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { key: { $regex: '.*' + searchText + '.*', $options: 'i' } }
        ];
    }

    try {
        var masterCronjobParameters = await MasterCronjobParameterService.getMasterCronjobParameters(query, parseInt(page), parseInt(limit), order_name, Number(order))

        // Return the MasterCronjobParameters list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterCronjobParameters, message: "Master cronjob parameters recieved successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getMasterCronjobParameter = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var masterCronjobParameter = await MasterCronjobParameterService.getMasterCronjobParameter(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterCronjobParameter, message: "Master cronjob parameter recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createMasterCronjobParameter = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var createdMasterCronjobParameter = await MasterCronjobParameterService.createMasterCronjobParameter(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdMasterCronjobParameter, message: "Master cronjob parameter created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateMasterCronjobParameter = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedMasterCronjobParameter = await MasterCronjobParameterService.updateMasterCronjobParameter(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedMasterCronjobParameter, message: "Master cronjob parameter updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMasterCronjobParameter = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }
    try {
        var deleted = await MasterCronjobParameterService.deleteMasterCronjobParameter(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createDefaultMasterCronjobParameters = async function (req, res, next) {
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
        var cronjobParameters = await CronjobParameterService.getCronjobParametersSimple(query);
        if (cronjobParameters && cronjobParameters?.length) {
            var masterCronjobParameters = await MasterCronjobParameterService.getMasterCronjobParametersSimple({});
            if (masterCronjobParameters && masterCronjobParameters?.length) {
                var masterCronjobParameterIds = masterCronjobParameters.map((item) => {
                    return item?._id || ""
                })
                masterCronjobParameterIds = masterCronjobParameterIds.filter((x) => x != "")
                await MasterCronjobParameterService.deleteMultiple({ _id: { $in: masterCronjobParameterIds } });
            }

            for (let i = 0; i < cronjobParameters.length; i++) {
                const element = cronjobParameters[i];
                element.all_online_services = 1

                var createdMasterCronjobParameter = await MasterCronjobParameterService.createMasterCronjobParameter(element);
            }
        }

        var masterCronjobParameters = await MasterCronjobParameterService.getMasterCronjobParametersSimple({});

        return res.status(200).json({ status: 200, flag: true, data: masterCronjobParameters, message: "Default cronjob parameters created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
