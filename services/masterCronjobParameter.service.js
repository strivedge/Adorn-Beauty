// Gettign the Newly created Mongoose Model we just created 
var MasterCronjobParameter = require('../models/MasterCronjobParameter.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the MasterCronjobParameter List
exports.getMasterCronjobParameters = async function (query, page, limit, order_name, order) {
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

        var masterCronjobParameters = await MasterCronjobParameter.aggregate(facetedPipeline);

        // Return the MasterCronjobParameterd list that was retured by the mongoose promise
        return masterCronjobParameters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCronjobParameters');
    }
}

exports.getMasterCronjobParametersOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterCronjobParameters = await MasterCronjobParameter.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterCronjobParameters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCronjobParameters')
    }
}

exports.getMasterCronjobParametersSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterCronjobParameters = await MasterCronjobParameter.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterCronjobParameters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCronjobParameters')
    }
}

exports.getMasterCronjobParameter = async function (id) {
    try {
        // Find the Data 
        var _details = await MasterCronjobParameter.findOne({ _id: id });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason
        // throw Error("MasterCronjobParameter not available");
        return null;
    }
}

exports.getMasterCronjobParameterOne = async function (query) {
    try {
        // Find the Data 
        var _details = await MasterCronjobParameter.findOne(query);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason
        return null;
    }
}

exports.createMultipleMasterCronjobParameters = async function (data) {
    try {
        // Find the Data 
        var _details = await MasterCronjobParameter.insertMany(data);
        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterCronjobParameter");
    }
}

exports.createMasterCronjobParameter = async function (masterCronjobParameter) {
    var newMasterCronjobParameter = new MasterCronjobParameter({
        master_category_id: masterCronjobParameter.master_category_id ? masterCronjobParameter.master_category_id : null,
        master_service_ids: masterCronjobParameter.master_service_ids ? masterCronjobParameter.master_service_ids : null,
        name: masterCronjobParameter.name ? masterCronjobParameter.name : "",
        desc: masterCronjobParameter.desc ? masterCronjobParameter.desc : "",
        key: masterCronjobParameter.key ? masterCronjobParameter.key : "",
        key_url: masterCronjobParameter.key_url ? masterCronjobParameter.key_url : "",
        all_online_services: masterCronjobParameter.all_online_services ? masterCronjobParameter.all_online_services : 0,
        status: masterCronjobParameter.status ? masterCronjobParameter.status : 0
    })

    try {
        // Saving the MasterCronjobParameter 
        var savedMasterCronjobParameter = await newMasterCronjobParameter.save();
        return savedMasterCronjobParameter;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterCronjobParameter")
    }
}

exports.updateMasterCronjobParameter = async function (masterCronjobParameter) {
    var id = masterCronjobParameter._id
    try {
        //Find the old MasterCronjobParameter Object by the Id
        var oldMasterCronjobParameter = await MasterCronjobParameter.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the MasterCronjobParameter")
    }

    // If no old MasterCronjobParameter Object exists return false
    if (!oldMasterCronjobParameter) { return false; }

    // Edit the MasterCronjobParameter Object
    if (masterCronjobParameter.master_category_id) {
        oldMasterCronjobParameter.master_category_id = masterCronjobParameter.master_category_id;
    }

    if (masterCronjobParameter.master_service_ids) {
        oldMasterCronjobParameter.master_service_ids = masterCronjobParameter.master_service_ids;
    }

    if (masterCronjobParameter.name) {
        oldMasterCronjobParameter.name = masterCronjobParameter.name;
    }

    if (masterCronjobParameter.desc) {
        oldMasterCronjobParameter.desc = masterCronjobParameter.desc;
    }

    if (masterCronjobParameter.key) {
        oldMasterCronjobParameter.key = masterCronjobParameter.key;
    }

    if (masterCronjobParameter.key_url) {
        oldMasterCronjobParameter.key_url = masterCronjobParameter.key_url;
    }

    if (masterCronjobParameter.all_online_services || masterCronjobParameter.all_online_services == 0) {
        oldMasterCronjobParameter.all_online_services = masterCronjobParameter.all_online_services ? masterCronjobParameter.all_online_services : 0;
    }

    if (masterCronjobParameter.status || masterCronjobParameter.status == 0) {
        oldMasterCronjobParameter.status = masterCronjobParameter.status ? masterCronjobParameter.status : 0;
    }

    try {
        var savedMasterCronjobParameter = await oldMasterCronjobParameter.save()
        return savedMasterCronjobParameter;
    } catch (e) {
        throw Error("And Error occured while updating the MasterCronjobParameter");
    }
}

exports.deleteMasterCronjobParameter = async function (id) {
    // Delete the MasterCronjobParameter
    try {
        var deleted = await MasterCronjobParameter.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterCronjobParameter Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterCronjobParameter")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the MasterCronjobParameter
    try {
        var deleted = await MasterCronjobParameter.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterCronjobParameter")
    }
}