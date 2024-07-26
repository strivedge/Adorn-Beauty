var QuestionGroupService = require('../services/questionGroup.service')
var ObjectId = require('mongodb').ObjectId

const { isObjEmpty, isValidJson } = require('../helper')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getQuestionGroups = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = { status: 1 }
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = ObjectId(req.query.company_id)
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = ObjectId(req.query.location_id)
    }

    if (req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [
            { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
            { description: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
        ]
    }

    try {
        var questionGroups = await QuestionGroupService.getQuestionGroups(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText)

        // Return the QuestionGroups list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: questionGroups, message: "Succesfully QuestionGroups Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getQuestionGroup = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id
        var questionGroup = await QuestionGroupService.getQuestionGroup(id)
        // Return the QuestionGroup list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: questionGroup, message: "Succesfully QuestionGroup Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getQuestionGroupSpecific = async function (req, res, next) {
    if (!req.query.location_id) {
        return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present" })
    }

    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.status && req.query.status != 'undefined') {
        query['status'] = parseInt(req.query.status);
    }
    // console.log("getQuestionGroupSpecific ",query)
    try {
        var questionGroup = await QuestionGroupService.getQuestionGroupSpecific(query)
        // Return the QuestionGroup list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: questionGroup, message: "Succesfully QuestionGroup Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createQuestionGroup = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        var query = {name : req.body.name}
        var groupExist = await QuestionGroupService.checkGroupExist(query);
        if(!groupExist){
            var getMasterQuestionId =await QuestionGroupService.getMasterGroupId(req.body)
            req.body.master_question_group_id = getMasterQuestionId;
            // Calling the Service function with the new object from the Request Body
            var createdQuestionGroup = await QuestionGroupService.createQuestionGroup(req.body)
            return res.status(200).json({ status: 200, flag: true, data: createdQuestionGroup, message: "Succesfully Created QuestionGroup" })
        }else{
            return res.status(200).json({ status: 200, flag: false, message: "QuestionGroup all ready exist." })
        }
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "QuestionGroup Creation was Unsuccesfull" })
    }
}

exports.updateQuestionGroup = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedQuestionGroup = await QuestionGroupService.updateQuestionGroup(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedQuestionGroup, message: "Succesfully Updated QuestionGroup" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeQuestionGroup = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await QuestionGroupService.deleteQuestionGroup(id);
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getQuestionGroupsDropdown = async function (req, res, next) {
    try {
        if (!req.query.location_id) {
            return res.status(200).json({ status: 200, flag: false, data: [], message: "Location Id must be present" })
        }

        var orderName = req.query?.order_name ? req.query.order_name : 'name'
        var order = req.query?.order ? req.query.order : '1'
        var search = req.query?.searchText ? req.query.searchText : ""

        var query = {}
        var existQuery = {}
        if (req.query?.status == "active") {
            query['status'] = 1
        }

        if (req.query?.company_id) {
            query['company_id'] = req.query.company_id
        }

        if (req.query?.location_id) {
            query['location_id'] = req.query.location_id
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

        var existQuestionGroup = []
        if (!isObjEmpty(existQuery)) {
            existQuestionGroup = await QuestionGroupService.getQuestionGroupsDropdown(existQuery, orderName, order) || []
        }

        var questionGroup = await QuestionGroupService.getQuestionGroupsDropdown(query, orderName, order) || []
        questionGroup = existQuestionGroup.concat(questionGroup) || []

        return res.status(200).send({ status: 200, flag: true, data: questionGroup, message: "Question groups dropdown received successfully...!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

// This is only for dropdown
exports.getQuestionGroupsConvertToObject = async function (req, res, next) {
    try {
        var questionGroups = await QuestionGroupService.getQuestionGroups({}, 1, 1000, "_id", -1)
        if (questionGroups && questionGroups.length) {
            questionGroups = questionGroups[0]?.data || []
            for (let index = 0; index < questionGroups.length; index++) {
                var questionGroup = questionGroups[index]
                var companyId = questionGroup?.company_id || null
                var locationId = questionGroup?.location_id || null
                if (companyId) {
                    companyId = ObjectId(companyId)
                }

                if (locationId) {
                    locationId = ObjectId(locationId)
                }

                if (questionGroup && questionGroup._id) {
                    await QuestionGroupService.updateQuestionGroup({
                        _id: questionGroup._id,
                        company_id: companyId,
                        location_id: locationId
                    })
                }
            }
        }

        return res.status(200).send({ status: 200, flag: true, data: questionGroups, message: "Question groups converted to objects received successfully...!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}