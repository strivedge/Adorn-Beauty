// Gettign the Newly created Mongoose Model we just created 
var Question = require('../models/Question.model')
var ImageService = require('./image.service')
var MasterQuestionService = require('../services/masterQuestion.service')
var MasterQuestion = require('../models/MasterQuestion.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Question List
exports.getQuestions = async function (query, page, limit, order_name, order, serachText) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order

        const facetedPipeline = [
            { $match: query },
            { $sort: sort },
            {
                "$facet": {
                    "data": [
                        { "$skip": page },
                        { "$limit": limit }
                    ],
                    "pagination": [
                        { "$count": "total" }
                    ]
                }
            },
        ]

        var Questions = await Question.aggregate(facetedPipeline)

        // Return the Questiond list that was retured by the mongoose promise
        return Questions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Questions')
    }
}

exports.getQuestionsOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var questions = await Question.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return questions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Questions')
    }
}

exports.getQuestionsSimple = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var questions = await Question.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return questions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Questions')
    }
}

exports.getDistinctQuestions = async function (query) {
    //console.log('query',query)

    // Try Catch the awaited promise to handle the error 
    try {

        var _details = await Question.aggregate([
            { $match: query },
            { "$sort": { "updatedAt": -1 } },
            {
                $group: {
                    "_id": "$question",
                    gender: { $first: '$gender' },
                    option_type: { $first: '$option_type' },
                    options: { $first: '$options' },
                    que_group_id: { $first: '$que_group_id' },
                    other_text_check: { $first: '$other_text_check' },
                    other_text_value: { $first: '$other_text_value' },
                    is_mandatory: { $first: '$is_mandatory' },
                    before_after: { $first: '$before_after' },
                    image: { $first: '$image' },
                    flag_minor: { $first: '$flag_minor' },

                }
            },
        ]);
        return _details;

    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Finding Tests');
    }
}

exports.getActiveQuestions = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Questions = await Question.find(query)

        // Return the Questiond list that was retured by the mongoose promise
        return Questions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding Questions')
    }
}

exports.getQuestion = async function (id) {
    try {
        // Find the Data 
        var _details = await Question.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Question not available")
    }
}

exports.checkQuestionExist = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await Question.findOne(query);

        return _details || null
    } catch (e) {
        return null
    }
}

// getting all Questions for company copy
exports.getQuestionsSpecific = async function (query) {
    try {
        var Questions = await Question.find(query)
            .sort({ order_no: 1 })

        // Return the Serviced list that was retured by the mongoose promise
        return Questions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Location')
    }
}


exports.getMasterQuestionId = async function (question) {
    try {
        // Check if the question exists in the master_tests collection by name
        const existingQuestion = await MasterQuestion.findOne({ question: question.question,before_after:question.before_after });
        // If the question already exists, return its _id
        if (existingQuestion) {
            return existingQuestion._id;
        } else {
            var createdMasterQuestion = await MasterQuestionService.createMasterQuestion(question)
            // Return the _id of the newly created question
            return createdMasterQuestion._id;
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master question:", error);
        throw error;
    }
}



exports.createQuestion = async function (question) {
    if (question.image) {
        var isImage = await ImageService.saveImage(question.image, "/images/question/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            question.image = isImage
        }
    }

    if (question.is_default == true) {
        question.is_default = 1
    } else {
        question.is_default = 0
    }

    if (question.other_text_check == true) {
        question.other_text_check = 1
    } else {
        question.other_text_check = 0
    }

    if (question.flag_minor == true) {
        question.flag_minor = 1
    } else {
        question.flag_minor = 0
    }

    var newQuestion = new Question({
        company_id: question.company_id ? question.company_id : null,
        location_id: question.location_id ? question.location_id : null,
        master_que_group_id: question.master_que_group_id ? question.master_que_group_id : null,
        master_question_id: question.master_question_id ? question.master_question_id : null,
        category_id: question.category_id ? question.category_id : [],
        service_id: question.service_id ? question.service_id : [],
        que_group_id: question.que_group_id ? question.que_group_id : null,
        is_default: question.is_default ? question.is_default : 0,
        other_text_check: question.other_text_check ? question.other_text_check : 0,
        question: question.question ? question.question : "",
        option_type: question.option_type ? question.option_type : "",
        other_text_value: question.other_text_value ? question.other_text_value : "",
        options: question.options ? question.options : [],
        is_mandatory: question.is_mandatory ? question.is_mandatory : 0,
        before_after: question.before_after ? question.before_after : 0,
        flag_minor: question.flag_minor ? question.flag_minor : 0,
        status: question.status ? question.status : 0,
        que_group_name: question.que_group_name ? question.que_group_name : "",
        gender: question.gender ? question.gender : "",
        no_of_column: question.no_of_column ? question.no_of_column : 0,
        image: question.image ? question.image : "",
        is_show_to_customer: question.is_show_to_customer ? question.is_show_to_customer : 0,
        is_show_in_preview: question.is_show_in_preview ? question.is_show_in_preview : 0,
        order_no: question.order_no ? question.order_no : 0,
        in_same_row: question.in_same_row ? question.in_same_row : 0,
        is_show_to_therapist: question.is_show_to_therapist ? question.is_show_to_therapist : 0
    })

    try {
        // Saving the Question 
        var savedQuestion = await newQuestion.save()
        return savedQuestion
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Question")
    }
}

exports.updateQuestion = async function (question) {
    try {
        // Find the old Question Object by the Id
        var id = question._id
        var oldQuestion = await Question.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the Question")
    }

    // If no old Question Object exists return false
    if (!oldQuestion) {
        return false
    }

    // Edit the Question Object
    if (question.company_id) {
        oldQuestion.company_id = question.company_id
    }

    if (question.location_id) {
        oldQuestion.location_id = question.location_id
    }

    if (question.service_id) {
        oldQuestion.service_id = question.service_id
    }

    if (question.is_default == true) {
        oldQuestion.is_default = 1
    } else {
        oldQuestion.is_default = 0
    }

    if (question.other_text_check == true) {
        oldQuestion.other_text_check = 1
    } else {
        oldQuestion.other_text_check = 0
    }

    if (question.flag_minor == true) {
        oldQuestion.flag_minor = 1
    } else {
        oldQuestion.flag_minor = 0
    }

    if (question.question) {
        oldQuestion.question = question.question
    }

    if (question.option_type) {
        oldQuestion.option_type = question.option_type
    }

    if (question.other_text_value) {
        oldQuestion.other_text_value = question.other_text_value
    }

    if (question.options) {
        oldQuestion.options = question.options;
    }

    if (question.que_group_name) {
        oldQuestion.que_group_name = question.que_group_name;
    }

    if (question.gender) {
        oldQuestion.gender = question.gender;
    }

    oldQuestion.category_id = question.category_id?.length ? question.category_id : null
    oldQuestion.que_group_id = question.que_group_id ? question.que_group_id : null
    oldQuestion.is_mandatory = question.is_mandatory ? question.is_mandatory : 0
    oldQuestion.before_after = question.before_after ? question.before_after : 0
    oldQuestion.status = question.status ? question.status : 0
    oldQuestion.no_of_column = question.no_of_column ? question.no_of_column : 0
    oldQuestion.is_show_to_customer = question.is_show_to_customer ? question.is_show_to_customer : 0
    oldQuestion.is_show_in_preview = question.is_show_in_preview ? question.is_show_in_preview : 0
    oldQuestion.order_no = question.order_no ? question.order_no : 0
    oldQuestion.in_same_row = question.in_same_row ? question.in_same_row : 0
    oldQuestion.is_show_to_therapist = question.is_show_to_therapist ? question.is_show_to_therapist : 0

    if (question.image) {
        var isImage = await ImageService.saveImage(question.image, "/images/question/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public')
            try {
                var fs = require('fs')
                var filePath = root_path + "/" + oldQuestion.image
                if (oldQuestion.image && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
            } catch (e) {
                console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n")
            }

            oldQuestion.image = isImage
        }
    }

    try {
        var savedQuestion = await oldQuestion.save()
        return savedQuestion
    } catch (e) {
        throw Error("And Error occured while updating the Question")
    }
}

exports.updateQuestionImage = async function (image, old_path = '') {

    try {

        if (image) {
            var isImage = await ImageService.saveImage(image, "/images/question/").then(data => { return data })
            if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
                var root_path = require('path').resolve('public')
                try {
                    var fs = require('fs')
                    var filePath = root_path + "/" + old_path
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath)
                    }
                } catch (e) {
                    console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n")
                }
            }
            return isImage
        }

        return null;
    } catch (e) {
        throw Error("And Error occured while updating the Question")
    }
}

exports.deleteQuestion = async function (id) {
    // Delete the Question
    try {
        var deleted = await Question.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Question Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the Question")
    }
}

exports.getQuestionDisctict = async function (field, query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var question = await Question.distinct(field, query)

        // Return the Question list that was retured by the mongoose promise
        return question
    } catch (e) {
        console.log("Error >>> ", e)
        // return a Error message describing the reason 
        throw Error('Error while finding Question')
    }
}

exports.deleteMultipleQuestion = async function (ids) {
    // Delete the Question
    try {
        var deleted = await Question.remove({ '_id': { '$in': ids } })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Question Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the Question")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Question.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the Question")
    }
}

// This is only for dropdown
exports.getQuestionsDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var questions = await Question.find(query)
            .select("_id question option_type gender")
            .sort(sorts)

        return questions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown questions')
    }
}