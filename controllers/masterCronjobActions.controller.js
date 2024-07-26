var CronjobActionService = require('../services/cronjobAction.service');
var MasterCronjobActionService = require('../services/masterCronjobAction.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getMasterCronjobActions = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (searchText && searchText != 'undefined') {
        query['$or'] = [{ name: { $regex: '.*' + searchText + '.*', $options: 'i' } }];
    }

    // console.log('getMasterCronjobActions',query)
    try {
        var masterCronjobActions = await MasterCronjobActionService.getMasterCronjobActions(query, parseInt(page), parseInt(limit), order_name, Number(order));
        // Return the MasterCronjobActions list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterCronjobActions, message: "Master cronjob actions recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getMasterCronjobAction = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var masterCronjobAction = await MasterCronjobActionService.getMasterCronjobAction(id)
        // Return the MasterCronjobAction list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterCronjobAction, message: "Master cronjob action recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createMasterCronjobAction = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdMasterCronjobAction = await MasterCronjobActionService.createMasterCronjobAction(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdMasterCronjobAction, message: "Master cronjob action created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateMasterCronjobAction = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedMasterCronjobAction = await MasterCronjobActionService.updateMasterCronjobAction(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedMasterCronjobAction, message: "Master cronjob action updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMasterCronjobAction = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await MasterCronjobActionService.deleteMasterCronjobAction(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createDefaultMasterCronJobActions = async function (req, res, next) {
    try {
        var locationId = req.body?.location_id || ""
        if (!locationId) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: "Location Id must be present!"
            })
        }

        var query = { location_id: locationId };
        var cronJobActions = await CronjobActionService.getCronjobActionsSimple(query);
        if (cronJobActions && cronJobActions?.length) {
            var masterCronJobActions = await MasterCronjobActionService.getMasterCronjobActionsSimple({});
            if (masterCronJobActions && masterCronJobActions?.length) {
                var masterCronJobActionIds = masterCronJobActions.map((item) => {
                    return item?._id || ""
                })
                masterCronJobActionIds = masterCronJobActionIds.filter((x) => x != "")
                await MasterCronjobActionService.deleteMultiple({ _id: { $in: masterCronJobActionIds } });
            }

            for (let i = 0; i < cronJobActions.length; i++) {
                const element = cronJobActions[i];
                element.status = 1
                var createdMasterCronjobAction = await MasterCronjobActionService.createMasterCronjobAction(element);
            }
        }

        var masterCronJobActions = await MasterCronjobActionService.getMasterCronjobActionsSimple({});

        return res.status(200).json({ status: 200, flag: true, data: masterCronJobActions, message: "Default cronjob actions created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}