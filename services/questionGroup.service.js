// Gettign the Newly created Mongoose Model we just created 
var QuestionGroup = require('../models/QuestionGroup.model');
var MasterQuestionGroup = require('../models/MasterQuestionGroup.model');
var MasterQuestionGroupService = require('../services/masterQuestionGroup.service')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the QuestionGroups List
exports.getQuestionGroups = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {}
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
            }
        ]

        var questionGroups = await QuestionGroup.aggregate(facetedPipeline)

        // Return the QuestionGroups list that was retured by the mongoose promise
        return questionGroups
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating QuestionGroups')
    }
}

exports.getQuestionGroupsOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var questionGroups = await QuestionGroup.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return questionGroups
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating QuestionGroups')
    }
}

exports.getDistinctQuestionGroups = async function (query) {
    //console.log('query',query)

    // Try Catch the awaited promise to handle the error 
    try {

        var _details = await QuestionGroup.aggregate([
            { $match: query },
            { "$sort": { "updatedAt": -1 } },
            {
                $group: {
                    "_id": "$name",
                    description: { $first: '$description' },
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

exports.getQuestionGroup = async function (id) {
    try {
        // Find the QuestionGroup 
        var _details = await QuestionGroup.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("QuestionGroup not available")
    }
}

exports.getQuestionGroupId = async function (id) {
    try {
        // Find the QuestionGroup 
        var _details = await QuestionGroup.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason
        throw Error("QuestionGroup not available")
    }
}

exports.getQuestionGroupName = async function (location_id, name) {
    try {
        // Find the QuestionGroup 
        var _details = await QuestionGroup.findOne({
            location_id: location_id,
            name: name
        }).sort({ createdAt: -1 })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("QuestionGroup not available")
    }
}

exports.checkGroupExist = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await QuestionGroup.findOne(query);

        return _details || null
    } catch (e) {
        return null
    }
}

exports.getQuestionGroupSpecific = async function (query) {
    try {
        var questionGroup = await QuestionGroup.find(query)

        return questionGroup
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("QuestionGroup not available")
    }
}

exports.getMasterGroupId = async function (group) {
    try {
        // Check if the group exists in the master_tests collection by name
        const existingGroup = await MasterQuestionGroup.findOne({ name: group.name });
        // If the group already exists, return its _id
        if (existingGroup) {
            return existingGroup._id;
        } else {
            var createdMasterGroup =  await MasterQuestionGroupService.createMasterQuestionGroup(group);

            // Return the _id of the newly created group
            return createdMasterGroup._id;
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master group:", error);
        throw error;
    }
}

exports.createQuestionGroup = async function (questionGroup) {
    var newQuestionGroup = new QuestionGroup({
        company_id: questionGroup.company_id ? questionGroup.company_id : null,
        location_id: questionGroup.location_id ? questionGroup.location_id : null,
        master_question_group_id: questionGroup.master_question_group_id ? questionGroup.master_question_group_id : null,
        name: questionGroup.name ? questionGroup.name : "",
        description: questionGroup.description ? questionGroup.description : "",
        status: questionGroup.status ? questionGroup.status : 0
    })

    try {
        // Saving the QuestionGroup
        var savedQuestionGroup = await newQuestionGroup.save()
        return savedQuestionGroup
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating QuestionGroup")
    }
}

exports.updateQuestionGroup = async function (questionGroup) {
    try {
        // Find the old QuestionGroup Object by the Id
        var id = questionGroup._id
        var oldQuestionGroup = await QuestionGroup.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the QuestionGroup")
    }

    // If no old QuestionGroup Object exists return false
    if (!oldQuestionGroup) { return false }

    // Edit the QuestionGroup Object
    if (questionGroup.company_id) {
        oldQuestionGroup.company_id = questionGroup.company_id
    }

    if (questionGroup.location_id) {
        oldQuestionGroup.location_id = questionGroup.location_id
    }

    if (questionGroup.master_question_group_id) {
        oldQuestionGroup.master_question_group_id = questionGroup.master_question_group_id
    }

    if (questionGroup.name) {
        oldQuestionGroup.name = questionGroup.name
    }

    if (questionGroup.description || questionGroup.description || "") {
        oldQuestionGroup.description = questionGroup.description ? questionGroup.description : ""
    }

    if (questionGroup.status || questionGroup.status == 0) {
        oldQuestionGroup.status = questionGroup.status ? questionGroup.status : 0
    }

    try {
        var savedQuestionGroup = await oldQuestionGroup.save()
        return savedQuestionGroup
    } catch (e) {
        throw Error("And Error occured while updating the QuestionGroup")
    }
}

exports.deleteQuestionGroup = async function (id) {
    // Delete the QuestionGroup
    try {
        var deleted = await QuestionGroup.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("QuestionGroup Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the QuestionGroup")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the QuestionGroup
    try {
        var deleted = await QuestionGroup.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the QuestionGroup")
    }
}

// This is only for dropdown
exports.getQuestionGroupsDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var questionGroups = await QuestionGroup.find(query)
            .select("_id name description")
            .sort(sorts)

        return questionGroups
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown question groups')
    }
}