var MasterQuestionService = require('../services/masterQuestion.service')
var MasterQuestionGroupService = require('../services/masterQuestionGroup.service')
var QuestionService = require('../services/question.service')
var QuestionGroupService = require('../services/questionGroup.service')

const { isObjEmpty, isValidJson } = require('../helper')
var ObjectId = require('mongodb').ObjectId

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getMasterQuestions = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = { status: 1 }

    if (req.query.que_group_id && req.query.que_group_id != 'undefined') {
        query['que_group_id'] = req.query.que_group_id
    }

    if (req.query.before_after && req.query.before_after != 'undefined') {
        if (req.query.before_after == 'default') {
            query['is_default'] = 1
        }

        if (req.query.before_after == 'before') {
            query['is_default'] = 0
            query['before_after'] = 0
        }

        if (req.query.before_after == 'after') {
            query['is_default'] = 0
            query['before_after'] = 1
        }
        // query['before_after'] = parseInt(req.query.before_after);
    }

    if (req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [
            { masterQuestion: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
        ]
    }

    try {
        var masterQuestions = await MasterQuestionService.getMasterQuestions(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText)

        // Return the MasterQuestions list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterQuestions, message: "Master questions recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getMasterQuestion = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var masterQuestion = await MasterQuestionService.getMasterQuestion(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterQuestion, message: "Master question recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.uploadMasterQuestionImage = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var image = req.body.image;
    var old_path = req.body.old_path ?? ''
    try {
        var path = await MasterQuestionService.updateMasterQuestionImage(image, old_path)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: path, message: "Master question recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createMasterQuestion = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var createdMasterQuestion = await MasterQuestionService.createMasterQuestion(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdMasterQuestion, message: "Master question created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateMasterQuestion = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedMasterQuestion = await MasterQuestionService.updateMasterQuestion(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedMasterQuestion, message: "Master question updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMasterQuestion = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var deleted = await MasterQuestionService.deleteMasterQuestion(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMultipleMasterQuestion = async function (req, res, next) {
    var ids = req.body.ids;
    if (ids.length == 0) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await MasterQuestionService.deleteMultipleMasterQuestion(ids);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getMasterQuestionsDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : ''
        var order = req.query?.order ? req.query.order : '1'
        var search = req.query?.searchText ? req.query.searchText : ""

        var query = {}
        var existQuery = {}
        if (req.query?.status == "active") {
            query['status'] = 1
        }

        if (req.query?.que_group_id) {
            query['que_group_id'] = req.query.que_group_id
        }

        if (req.query?.before_after) {
            if (req.query?.before_after == 'default') {
                query['is_default'] = 1
            }

            if (req.query?.before_after == 'before') {
                query['is_default'] = 0
                query['before_after'] = 0
            }

            if (req.query?.before_after == 'after') {
                query['is_default'] = 0
                query['before_after'] = 1
            }
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
                { masterQuestion: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        }

        var existMasterQuestions = []
        if (!isObjEmpty(existQuery)) {
            existMasterQuestions = await MasterQuestionService.getMasterQuestionsDropdown(existQuery, orderName, order) || []
        }

        var masterQuestions = await MasterQuestionService.getMasterQuestionsDropdown(query, orderName, order) || []
        masterQuestions = existMasterQuestions.concat(masterQuestions) || []

        return res.status(200).send({ status: 200, flag: true, data: masterQuestions, message: "Master question dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

exports.createDefaultMasterQuestions = async function (req, res, next) {
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
        var masterQuestionGroups = await MasterQuestionGroupService.getMasterQuestionGroupsSimple({});
        var questions = await QuestionService.getQuestionsSimple(query);
        if (questions && questions?.length) {
            var masterQuestions = await MasterQuestionService.getMasterQuestionsSimple({});
            if (masterQuestions && masterQuestions?.length) {
                var masterQuestionsIds = masterQuestions.map((item) => {
                    return item?._id || ""
                })
                masterQuestionsIds = masterQuestionsIds.filter((x) => x != "")
                await MasterQuestionService.deleteMultiple({ _id: { $in: masterQuestionsIds } })
            }

            for (let i = 0; i < questions.length; i++) {
                const element = questions[i];
                element.image = ""
                if (element?.que_group_id) {
                    var questionGroup = questionGroups.find((x) => x._id == element.que_group_id) || null
                    if (questionGroup && questionGroup?.name) {
                        var masterQuestionGroup = masterQuestionGroups.find((x) => x.name == questionGroup.name) || null
                        if (masterQuestionGroup && masterQuestionGroup?._id) {
                            element.master_que_group_id = masterQuestionGroup._id
                        }
                    }
                }

                if (element?.options && element.options?.length) {
                    for (let j = 0; j < element.options.length; j++) {
                        element.options[j].question_ids = []
                    }
                }

                var createdMasterQuestion = await MasterQuestionService.createMasterQuestion(element)
            }
        }

        var masterQuestions = await MasterQuestionService.getMasterQuestionsSimple({});

        return res.status(200).json({ status: 200, flag: true, data: masterQuestions, message: "Default questions created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}