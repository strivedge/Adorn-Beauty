// Gettign the Newly created Mongoose Model we just created 
var MasterQuestionGroup = require('../models/MasterQuestionGroup.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the MasterQuestionGroups List
exports.getMasterQuestionGroups = async function (query, page, limit, order_name, order) {
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

        var masterQuestionGroups = await MasterQuestionGroup.aggregate(facetedPipeline)

        // Return the MasterQuestionGroups list that was retured by the mongoose promise
        return masterQuestionGroups
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterQuestionGroups')
    }
}

exports.getMasterQuestionGroupsOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterQuestionGroups = await MasterQuestionGroup.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterQuestionGroups
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterQuestionGroups')
    }
}

exports.getMasterQuestionGroupsSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterQuestionGroups = await MasterQuestionGroup.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterQuestionGroups
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterQuestionGroups')
    }
}

exports.getDistinctMasterQuestionGroups = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {

        var _details = await MasterQuestionGroup.aggregate([
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

exports.getMasterQuestionGroup = async function (id) {
    try {
        // Find the MasterQuestionGroup 
        var _details = await MasterQuestionGroup.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("MasterQuestionGroup not available")
    }
}

exports.createMasterQuestionGroup = async function (masterQuestionGroup) {
    var newMasterQuestionGroup = new MasterQuestionGroup({
        name: masterQuestionGroup.name ? masterQuestionGroup.name : "",
        description: masterQuestionGroup.description ? masterQuestionGroup.description : "",
        status: masterQuestionGroup.status ? masterQuestionGroup.status : 0
    })

    try {
        // Saving the MasterQuestionGroup
        var savedMasterQuestionGroup = await newMasterQuestionGroup.save()
        return savedMasterQuestionGroup
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterQuestionGroup")
    }
}

exports.updateMasterQuestionGroup = async function (masterQuestionGroup) {
    try {
        //Find the old MasterQuestionGroup Object by the Id
        var id = masterQuestionGroup._id
        var oldMasterQuestionGroup = await MasterQuestionGroup.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the MasterQuestionGroup")
    }

    // If no old MasterQuestionGroup Object exists return false
    if (!oldMasterQuestionGroup) {
        return false
    }

    // Edit the MasterQuestionGroup Object
    if (masterQuestionGroup.name) {
        oldMasterQuestionGroup.name = masterQuestionGroup.name
    }

    if (masterQuestionGroup.description || masterQuestionGroup.description || "") {
        oldMasterQuestionGroup.description = masterQuestionGroup.description ? masterQuestionGroup.description : ""
    }

    if (masterQuestionGroup.status || masterQuestionGroup.status == 0) {
        oldMasterQuestionGroup.status = masterQuestionGroup.status ? masterQuestionGroup.status : 0
    }

    try {
        var savedMasterQuestionGroup = await oldMasterQuestionGroup.save()
        return savedMasterQuestionGroup
    } catch (e) {
        throw Error("And Error occured while updating the MasterQuestionGroup")
    }
}

exports.deleteMasterQuestionGroup = async function (id) {
    // Delete the MasterQuestionGroup
    try {
        var deleted = await MasterQuestionGroup.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterQuestionGroup Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterQuestionGroup")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the MasterQuestionGroup
    try {
        var deleted = await MasterQuestionGroup.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the Master Question Group")
    }
}

// This is only for dropdown
exports.getMasterQuestionGroupsDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterQuestionGroups = await MasterQuestionGroup.find(query)
            .select("_id name description")
            .sort(sorts)

        return masterQuestionGroups
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown master question groups')
    }
}
