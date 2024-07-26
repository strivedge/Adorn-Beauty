// Gettign the Newly created Mongoose Model we just created 
var MasterQuestion = require('../models/MasterQuestion.model')
var ImageService = require('./image.service')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the MasterQuestion List
exports.getMasterQuestions = async function (query, page, limit, order_name, order) {
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

        var masterQuestions = await MasterQuestion.aggregate(facetedPipeline)

        // Return the MasterQuestiond list that was retured by the mongoose promise
        return masterQuestions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Master Questions')
    }
}

exports.getMasterQuestionsOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterQuestions = await MasterQuestion.find(query)
            .populate({
                path: 'master_que_group_id',
                select: "name"
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterQuestions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Master Questions')
    }
}

exports.getMasterQuestionsSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterQuestions = await MasterQuestion.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterQuestions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Master Questions')
    }
}

exports.getMasterQuestion = async function (id) {
    try {
        // Find the Data 
        var _details = await MasterQuestion.findOne({ _id: id })
            .populate({
                path: 'master_que_group_id',
                select: "name"
            })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("MasterQuestion not available")
    }
}

exports.createMasterQuestion = async function (masterQuestion) {
    if (masterQuestion.image) {
        var isImage = await ImageService.saveImage(masterQuestion.image, "/images/masterQuestion/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            masterQuestion.image = isImage
        }
    }

    var newMasterQuestion = new MasterQuestion({
        master_que_group_id: masterQuestion.master_que_group_id ? masterQuestion.master_que_group_id : null,
        question: masterQuestion.question ? masterQuestion.question : "",
        option_type: masterQuestion.option_type ? masterQuestion.option_type : "",
        other_text_check: masterQuestion.other_text_check ? 1 : 0,
        other_text_value: masterQuestion.other_text_value ? masterQuestion.other_text_value : "",
        options: masterQuestion.options ? masterQuestion.options : [],
        is_mandatory: masterQuestion.is_mandatory ? masterQuestion.is_mandatory : 0,
        before_after: masterQuestion.before_after ? masterQuestion.before_after : 0,
        gender: masterQuestion.gender ? masterQuestion.gender : "",
        que_group_name: masterQuestion.que_group_name ? masterQuestion.que_group_name : "",
        image: masterQuestion.image ? masterQuestion.image : "",
        order_no: masterQuestion.order_no ? masterQuestion.order_no : 0,
        flag_minor: masterQuestion.flag_minor ? 1 : 0,
        no_of_column: masterQuestion.no_of_column ? masterQuestion.no_of_column : 0,
        is_show_to_customer: masterQuestion.is_show_to_customer ? masterQuestion.is_show_to_customer : 0,
        is_show_to_therapist: masterQuestion.is_show_to_therapist ? masterQuestion.is_show_to_therapist : 0,
        is_show_in_preview: masterQuestion.is_show_in_preview ? masterQuestion.is_show_in_preview : 0,
        in_same_row: masterQuestion.in_same_row ? masterQuestion.in_same_row : 0,
        is_default: masterQuestion.is_default ? 1 : 0,
        status: masterQuestion.status ? masterQuestion.status : 0
    })

    try {
        // Saving the MasterQuestion 
        var savedMasterQuestion = await newMasterQuestion.save()
        return savedMasterQuestion
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterQuestion")
    }
}

exports.updateMasterQuestion = async function (masterQuestion) {
    try {
        // Find the old MasterQuestion Object by the Id
        var id = masterQuestion._id
        var oldMasterQuestion = await MasterQuestion.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the MasterQuestion")
    }

    // If no old MasterQuestion Object exists return false
    if (!oldMasterQuestion) { return false }

    // Edit the MasterQuestion Object
    if (masterQuestion.master_que_group_id) {
        oldMasterQuestion.master_que_group_id = masterQuestion.master_que_group_id
    }

    if (masterQuestion.question) {
        oldMasterQuestion.question = masterQuestion.question
    }

    if (masterQuestion.option_type) {
        oldMasterQuestion.option_type = masterQuestion.option_type
    }

    if (masterQuestion.other_text_check || masterQuestion.other_text_check == 0 || masterQuestion.other_text_check == false) {
        oldMasterQuestion.other_text_check = masterQuestion.other_text_check ? 1 : 0
    }

    if (masterQuestion.other_text_value) {
        oldMasterQuestion.other_text_value = masterQuestion.other_text_value
    }

    if (masterQuestion.options) {
        oldMasterQuestion.options = masterQuestion.options;
    }

    if (masterQuestion.is_mandatory || masterQuestion.is_mandatory == 0) {
        oldMasterQuestion.options = masterQuestion.is_mandatory ? masterQuestion.is_mandatory : 0;
    }

    if (masterQuestion.before_after || masterQuestion.before_after == 0) {
        oldMasterQuestion.options = masterQuestion.before_after ? masterQuestion.before_after : 0;
    }

    if (masterQuestion.gender) {
        oldMasterQuestion.gender = masterQuestion.gender;
    }

    if (masterQuestion.que_group_name) {
        oldMasterQuestion.que_group_name = masterQuestion.que_group_name;
    }

    if (masterQuestion.order_no || masterQuestion.order_no == 0 || masterQuestion.order_no == "") {
        oldMasterQuestion.order_no = masterQuestion.order_no ? masterQuestion.order_no : 0
    }

    if (masterQuestion.flag_minor || masterQuestion.flag_minor == 0 || masterQuestion.flag_minor == false) {
        oldMasterQuestion.flag_minor = masterQuestion.flag_minor ? 1 : 0
    }

    if (masterQuestion.no_of_column || masterQuestion.no_of_column == 0 || masterQuestion.no_of_column == "") {
        oldMasterQuestion.no_of_column = masterQuestion.no_of_column ? masterQuestion.no_of_column : 0
    }

    if (masterQuestion.is_show_to_customer || masterQuestion.is_show_to_customer == 0) {
        oldMasterQuestion.is_show_to_customer = masterQuestion.is_show_to_customer ? masterQuestion.is_show_to_customer : 0
    }

    if (masterQuestion.is_show_to_therapist || masterQuestion.is_show_to_therapist == 0) {
        oldMasterQuestion.is_show_to_therapist = masterQuestion.is_show_to_therapist ? masterQuestion.is_show_to_therapist : 0
    }

    if (masterQuestion.is_show_in_preview || masterQuestion.is_show_in_preview == 0) {
        oldMasterQuestion.is_show_in_preview = masterQuestion.is_show_in_preview ? masterQuestion.is_show_in_preview : 0
    }

    if (masterQuestion.in_same_row || masterQuestion.in_same_row == 0) {
        oldMasterQuestion.in_same_row = masterQuestion.in_same_row ? masterQuestion.in_same_row : 0
    }

    if (masterQuestion.is_default || masterQuestion.is_default == 0 || masterQuestion.is_default == false) {
        oldMasterQuestion.is_default = masterQuestion.is_default ? masterQuestion.is_default : 0
    }

    if (masterQuestion.status || masterQuestion.status == 0) {
        oldMasterQuestion.status = masterQuestion.status ? masterQuestion.status : 0
    }

    if (masterQuestion.image) {
        var isImage = await ImageService.saveImage(masterQuestion.image, "/images/masterQuestion/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public')
            try {
                var fs = require('fs')
                var filePath = root_path + "/" + oldMasterQuestion.image
                if (oldMasterQuestion.image && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
            } catch (e) {
                console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n")
            }

            oldMasterQuestion.image = isImage
        }
    }

    try {
        var savedMasterQuestion = await oldMasterQuestion.save()
        return savedMasterQuestion
    } catch (e) {
        throw Error("And Error occured while updating the MasterQuestion")
    }
}

exports.updateMasterQuestionImage = async function (image, old_path = '') {
    try {
        if (image) {
            var isImage = await ImageService.saveImage(image, "/images/masterQuestion/").then(data => { return data })
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
        throw Error("And Error occured while updating the MasterQuestion")
    }
}

exports.deleteMasterQuestion = async function (id) {
    // Delete the MasterQuestion
    try {
        var deleted = await MasterQuestion.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterQuestion Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterQuestion")
    }
}

exports.getMasterQuestionDisctict = async function (field, query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var masterQuestion = await MasterQuestion.distinct(field, query)

        // Return the MasterQuestion list that was retured by the mongoose promise
        return masterQuestion
    } catch (e) {
        console.log("Error >>> ", e)
        // return a Error message describing the reason 
        throw Error('Error while finding MasterQuestion')
    }
}

exports.deleteMultipleMasterQuestion = async function (ids) {
    // Delete the MasterQuestion
    try {
        var deleted = await MasterQuestion.remove({ '_id': { '$in': ids } })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterQuestion Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterQuestion")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await MasterQuestion.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterQuestion")
    }
}

// This is only for dropdown
exports.getMasterQuestionsDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterQuestions = await MasterQuestion.find(query)
            .select("_id question option_type gender")
            .sort(sorts)

        return masterQuestions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown masterQuestions')
    }
}
