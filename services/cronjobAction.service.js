// Gettign the Newly created Mongoose Model we just created 
var CronjobAction = require('../models/CronjobAction.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Holiday List
exports.getCronjobActions = async function (query, page, limit, order_name, order) {
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
            },
        ];

        var cronjobActions = await CronjobAction.aggregate(facetedPipeline);

        // Return the CronjobActions list that was retured by the mongoose promise
        return cronjobActions;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CronjobActions');
    }
}

exports.getCronjobActionsOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var cronjobActions = await CronjobAction.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return cronjobActions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CronjobActions')
    }
}

exports.getCronjobActionsSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var cronjobActions = await CronjobAction.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return cronjobActions
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CronjobActions')
    }
}

exports.getCronjobActionSpecific = async function (query) {
    // Options setup for the mongoose paginate
    // Try Catch the awaited promise to handle the error 
    try {
        var cronjobAction = await CronjobAction.find(query);
        // Return the Serviced list that was retured by the mongoose promise
        return cronjobAction;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CronjobAction');
    }
}

exports.getCronjobActionSpecificLocation = async function (field, query) {
    // Options setup for the mongoose paginate
    // Try Catch the awaited promise to handle the error 
    try {
        // var cronjobAction = await CronjobAction.find(query).select({location_id: 1});
        var cronjobAction = await CronjobAction.distinct(field, query);
        // Return the Serviced list that was retured by the mongoose promise
        return cronjobAction;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CronjobAction');
    }
}

exports.getCronjobAction = async function (id) {
    try {
        // Find the Data 
        var _details = await CronjobAction.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            throw Error("CronjobAction not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CronjobAction not available");
    }
}

exports.getCronjobActionOne = async function (query) {
    try {
        // Find the Data 
        var _details = await CronjobAction.findOne(query);
        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        return null;
    }
}

exports.createCronjobAction = async function (cronjobAction) {
    var newCronjobAction = new CronjobAction({
        company_id: cronjobAction.company_id ? cronjobAction.company_id : "",
        location_id: cronjobAction.location_id ? cronjobAction.location_id : "",
        master_cronjob_action_id: cronjobAction.master_cronjob_action_id ? cronjobAction.master_cronjob_action_id : null,
        name: cronjobAction.name ? cronjobAction.name : "",
        key_url: cronjobAction.key_url ? cronjobAction.key_url : "",
        status: cronjobAction.status ? cronjobAction.status : 0
    })

    try {
        // Saving the CronjobAction 
        var savedCronjobAction = await newCronjobAction.save();
        return savedCronjobAction;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating CronjobAction")
    }
}

exports.updateCronjobAction = async function (cronjobAction) {
    var id = cronjobAction._id
    try {
        //Find the old CronjobAction Object by the Id
        var oldCronjobAction = await CronjobAction.findById(id);
        // console.log('OldCronjobAction ',oldCronjobAction)
    } catch (e) {
        throw Error("Error occured while Finding the CronjobAction")
    }

    // If no old CronjobAction Object exists return false
    if (!oldCronjobAction) { return false; }

    // Edit the CronjobAction Object
    if (cronjobAction.company_id) {
        oldCronjobAction.company_id = cronjobAction.company_id;
    }

    if (cronjobAction.location_id) {
        oldCronjobAction.location_id = cronjobAction.location_id;
    }

    if (cronjobAction.master_cronjob_action_id) {
        oldCronjobAction.master_cronjob_action_id = cronjobAction.master_cronjob_action_id;
    }

    if (cronjobAction.name) {
        oldCronjobAction.name = cronjobAction.name;
    }

    if (cronjobAction.key_url) {
        oldCronjobAction.key_url = cronjobAction.key_url;
    }

    oldCronjobAction.status = cronjobAction.status ? cronjobAction.status : 0;

    try {
        var savedCronjobAction = await oldCronjobAction.save()
        return savedCronjobAction;
    } catch (e) {
        throw Error("And Error occured while updating the CronjobAction");
    }
}

exports.deleteCronjobAction = async function (id) {
    // Delete the CronjobAction
    try {
        var deleted = await CronjobAction.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CronjobAction Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CronjobAction")
    }
}