var ContentMasterService = require('../services/contentMaster.service');
var MasterContentMasterService = require('../services/masterContentMaster.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getMasterContentMasters = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (searchText) {
        query['$or'] = [{ name: { $regex: '.*' + searchText + '.*', $options: 'i' } }];
    }

    try {
        var masterContentMasters = await MasterContentMasterService.getMasterContentMasters(query, parseInt(page), parseInt(limit), order_name, Number(order))
        // Return the MasterContentMasters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterContentMasters, message: "Succesfully MasterContentMasters Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getMasterContentMaster = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var masterContentMaster = await MasterContentMasterService.getMasterContentMaster(id)
        // Return the MasterContentMaster list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterContentMaster, message: "Master content master recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createMasterContentMaster = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdMasterContentMaster = await MasterContentMasterService.createMasterContentMaster(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdMasterContentMaster, message: "Master content master created succesfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateMasterContentMaster = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedMasterContentMaster = await MasterContentMasterService.updateMasterContentMaster(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedMasterContentMaster, message: "Master content master updated succesfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMasterContentMaster = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await MasterContentMasterService.deleteMasterContentMaster(id);
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createDefaultMasterContentMasters = async function (req, res, next) {
    try {
        var query = { company_id: "", location_id: "" };
        var contentMasters = await ContentMasterService.getContentMastersSimple(query);
        if (contentMasters && contentMasters?.length) {
            var masterContentMasters = await MasterContentMasterService.getMasterContentMastersSimple({});
            if (masterContentMasters && masterContentMasters?.length) {
                var masterContentMasterIds = masterContentMasters.map((item) => {
                    return item?._id || ""
                })
                masterContentMasterIds = masterContentMasterIds.filter((x) => x != "")
                await MasterContentMasterService.deleteMultiple({ _id: { $in: masterContentMasterIds } });
            }

            for (let i = 0; i < contentMasters.length; i++) {
                const element = contentMasters[i];
                var createdMasterContentMaster = await MasterContentMasterService.createMasterContentMaster(element);
            }
        }

        var masterContentMasters = await MasterContentMasterService.getMasterContentMastersSimple({});

        return res.status(200).json({ status: 200, flag: true, data: masterContentMasters, message: "Default content master created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
