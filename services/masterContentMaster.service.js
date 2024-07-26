// Gettign the Newly created Mongoose Model we just created 
var MasterContentMaster = require('../models/MasterContentMaster.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the MasterContentMaster List
exports.getMasterContentMasters = async function (query, page, limit, order_name, order) {
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

        var masterContentMasters = await MasterContentMaster.aggregate(facetedPipeline);

        // Return the MasterContentMasterd list that was retured by the mongoose promise
        return masterContentMasters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterContentMasters');
    }
}

exports.getMasterContentMastersOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterContentMasters = await MasterContentMaster.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterContentMasters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterContentMasters')
    }
}

exports.getMasterContentMastersSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterContentMasters = await MasterContentMaster.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterContentMasters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterContentMasters')
    }
}

exports.getMasterContentMaster = async function (id) {
    try {
        // Find the Data 
        var _details = await MasterContentMaster.findOne({ _id: id });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        // throw Error("MasterContentMaster not available");
        return null;
    }
}

exports.getMasterContentMasterOne = async function (query) {
    try {
        // Find the Data 
        var _details = await MasterContentMaster.findOne(query);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason
        return null;
    }
}

exports.createMultipleMasterContentMasters = async function (data) {
    try {
        // Find the Data 
        var _details = await MasterContentMaster.insertMany(data);
        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterContentMaster");
    }
}

exports.createMasterContentMaster = async function (masterContentMaster) {
    var newMasterContentMaster = new MasterContentMaster({
        name: masterContentMaster.name ? masterContentMaster.name : "",
        last_publish_date: masterContentMaster.last_publish_date ? masterContentMaster.last_publish_date : "",
        content: masterContentMaster.content ? masterContentMaster.content : ""
    })

    try {
        // Saving the MasterContentMaster 
        var savedMasterContentMaster = await newMasterContentMaster.save();
        return savedMasterContentMaster;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterContentMaster")
    }
}

exports.updateMasterContentMaster = async function (masterContentMaster) {
    var id = masterContentMaster._id
    try {
        //Find the old MasterContentMaster Object by the Id
        var oldMasterContentMaster = await MasterContentMaster.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the MasterContentMaster")
    }

    // If no old MasterContentMaster Object exists return false
    if (!oldMasterContentMaster) { return false; }

    // Edit the MasterContentMaster Object
    if (masterContentMaster.name) {
        oldMasterContentMaster.name = masterContentMaster.name;
    }

    if (masterContentMaster.last_publish_date) {
        oldMasterContentMaster.last_publish_date = masterContentMaster.last_publish_date;
    }

    if (masterContentMaster.content) {
        oldMasterContentMaster.content = masterContentMaster.content;
    }

    try {
        var savedMasterContentMaster = await oldMasterContentMaster.save()
        return savedMasterContentMaster;
    } catch (e) {
        throw Error("And Error occured while updating the MasterContentMaster");
    }
}

exports.deleteMasterContentMaster = async function (id) {
    // Delete the MasterContentMaster
    try {
        var deleted = await MasterContentMaster.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterContentMaster Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterContentMaster")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await MasterContentMaster.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterContentMaster")
    }
}