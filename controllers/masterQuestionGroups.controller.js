var MasterQuestionGroupService = require('../services/masterQuestionGroup.service')
var QuestionGroupService = require('../services/questionGroup.service')

const { isObjEmpty, isValidJson } = require('../helper')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getMasterQuestionGroups = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = { status: 1 }

    if (searchText) {
        query['$or'] = [
            { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { description: { $regex: '.*' + searchText + '.*', $options: 'i' } }
        ]
    }

    try {
        var masterQuestionGroups = await MasterQuestionGroupService.getMasterQuestionGroups(query, parseInt(page), parseInt(limit), order_name, Number(order))

        // Return the MasterQuestionGroups list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterQuestionGroups, message: "Master question groups recieved succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getMasterQuestionGroup = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id
        var masterQuestionGroup = await MasterQuestionGroupService.getMasterQuestionGroup(id)
        // Return the MasterQuestionGroup list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterQuestionGroup, message: "Master question group recieved succesfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createMasterQuestionGroup = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdMasterQuestionGroup = await MasterQuestionGroupService.createMasterQuestionGroup(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdMasterQuestionGroup, message: "Master question group created succesfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateMasterQuestionGroup = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedMasterQuestionGroup = await MasterQuestionGroupService.updateMasterQuestionGroup(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedMasterQuestionGroup, message: "Master question group updated succesfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMasterQuestionGroup = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await MasterQuestionGroupService.deleteMasterQuestionGroup(id);
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getMasterQuestionGroupsDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : 'name'
        var order = req.query?.order ? req.query.order : '1'
        var search = req.query?.searchText ? req.query.searchText : ""

        var query = {}
        var existQuery = {}
        if (req.query?.status == "active") {
            query['status'] = 1
        }

        if (req.query?.id) {
            query['_id'] = req.query.id
        }

        if (req.query?.ids && isValidJson(req.query.ids)) {
            var ids = JSON.parse(req.query.ids)
            query['_id'] = { $nin: ids }
            existQuery['_id'] = { $in: ids }
        }

        if (search) {
            search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
            query['$or'] = [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        }

        var existMasterQuestionGroup = []
        if (!isObjEmpty(existQuery)) {
            existMasterQuestionGroup = await MasterQuestionGroupService.getMasterQuestionGroupsDropdown(existQuery, orderName, order) || []
        }

        var masterQuestionGroup = await MasterQuestionGroupService.getMasterQuestionGroupsDropdown(query, orderName, order) || []
        masterQuestionGroup = existMasterQuestionGroup.concat(masterQuestionGroup) || []

        return res.status(200).send({ status: 200, flag: true, data: masterQuestionGroup, message: "Master question groups dropdown received successfully...!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

exports.createDefaultMasterQuestionGroups = async function (req, res, next) {
    try {
        var locationId = req.body?.location_id || ""
        if (!locationId) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: "Location Id must be present!"
            })
        }

        var query = { location_id: locationId, status: 1 };
        var questionGroups = await QuestionGroupService.getQuestionGroupsOne(query);
        if (questionGroups && questionGroups?.length) {
            var masterQuestionGroups = await MasterQuestionGroupService.getMasterQuestionGroupsSimple({});
            if (masterQuestionGroups && masterQuestionGroups?.length) {
                var masterQuestionGroupIds = masterQuestionGroups.map((item) => {
                    return item?._id || ""
                })
                masterQuestionGroupIds = masterQuestionGroupIds.filter((x) => x != "")
                await MasterQuestionGroupService.deleteMultiple({ _id: { $in: masterQuestionGroupIds } })
            }

            for (let i = 0; i < questionGroups.length; i++) {
                const element = questionGroups[i];
                var createdMasterQuestionGroup = await MasterQuestionGroupService.createMasterQuestionGroup(element)
            }
        }

        var masterQuestionGroups = await MasterQuestionGroupService.getMasterQuestionGroupsSimple({});

        return res.status(200).json({ status: 200, flag: true, data: masterQuestionGroups, message: "Default question groups created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}