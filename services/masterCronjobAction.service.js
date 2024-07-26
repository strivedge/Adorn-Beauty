// Gettign the Newly created Mongoose Model we just created 
var MasterCronjobAction = require('../models/MasterCronjobAction.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the MasterCronjobAction List
exports.getMasterCronjobActions = async function (query, page, limit, order_name, order) {
    // Options setup for the mongoose paginate
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

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
        ];

        var masterCronjobActions = await MasterCronjobAction.aggregate(facetedPipeline);

        // Return the MasterCronjobActiond list that was retured by the mongoose promise
        return masterCronjobActions;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCronjobActions');
    }
}

exports.getMasterCronjobActionsOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterCronjobActions = await MasterCronjobAction.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterCronjobActions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCronjobActions')
    }
}

exports.getMasterCronjobActionsSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterCronjobActions = await MasterCronjobAction.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterCronjobActions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCronjobActions')
    }
}

exports.getMasterCronjobAction = async function (id) {
    try {
        // Find the Data 
        var _details = await MasterCronjobAction.findOne({ _id: id });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason
        //throw Error("MasterCronjobAction not available");
        return null;
    }
}

exports.getMasterCronjobActionOne = async function (query) {
    try {
        // Find the Data 
        var _details = await MasterCronjobAction.findOne(query);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason
        return null;
    }
}

exports.createMultipleMasterCronjobActions = async function (data) {
    try {
        // Find the Data 
        var _details = await MasterCronjobAction.insertMany(data);
        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterCronjobAction");
    }
}

exports.createMasterCronjobAction = async function (masterCronjobAction) {
    var newMasterCronjobAction = new MasterCronjobAction({
        name: masterCronjobAction.name ? masterCronjobAction.name : "",
        key_url: masterCronjobAction.key_url ? masterCronjobAction.key_url : "",
        status: masterCronjobAction.status ? masterCronjobAction.status : 0
    })

    try {
        // Saving the MasterCronjobAction 
        var savedMasterCronjobAction = await newMasterCronjobAction.save();
        return savedMasterCronjobAction;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterCronjobAction")
    }
}

exports.updateMasterCronjobAction = async function (masterCronjobAction) {
    var id = masterCronjobAction._id
    try {
        //Find the old MasterCronjobAction Object by the Id
        var oldMasterCronjobAction = await MasterCronjobAction.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the MasterCronjobAction")
    }

    // If no old MasterCronjobAction Object exists return false
    if (!oldMasterCronjobAction) { return false; }

    // Edit the MasterCronjobAction Object
    if (masterCronjobAction.name) {
        oldMasterCronjobAction.name = masterCronjobAction.name;
    }

    if (masterCronjobAction.key_url) {
        oldMasterCronjobAction.key_url = masterCronjobAction.key_url;
    }

    if (masterCronjobAction.status || masterCronjobAction.status == 0) {
        oldMasterCronjobAction.status = masterCronjobAction.status ? masterCronjobAction.status : 0;
    }

    try {
        var savedMasterCronjobAction = await oldMasterCronjobAction.save()
        return savedMasterCronjobAction;
    } catch (e) {
        throw Error("And Error occured while updating the MasterCronjobAction");
    }
}

exports.deleteMasterCronjobAction = async function (id) {
    // Delete the MasterCronjobAction
    try {
        var deleted = await MasterCronjobAction.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterCronjobAction Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterCronjobAction")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await MasterCronjobAction.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterCronjobAction")
    }
}