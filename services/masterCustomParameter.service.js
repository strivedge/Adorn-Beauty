// Gettign the Newly created Mongoose Model we just created 
var MasterCustomParameter = require('../models/MasterCustomParameter.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the MasterCustomParameters List
exports.getMasterCustomParameters = async function (query, page, limit, order_name, order) {
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

        var masterCustomParameters = await MasterCustomParameter.aggregate(facetedPipeline);
        // Return the MasterCustomParameters list that was retured by the mongoose promise
        return masterCustomParameters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCustomParameters');
    }
}

exports.getMasterCustomParametersOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterCustomParameters = await MasterCustomParameter.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterCustomParameters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCustomParameters')
    }
}

exports.getMasterCustomParametersSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterCustomParameters = await MasterCustomParameter.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterCustomParameters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCustomParameters')
    }
}

exports.getDistinctMasterCustomParameters = async function (field, query) {
    try {
        var masterCustomParameters = await MasterCustomParameter.distinct(field, query);

        return masterCustomParameters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Issue with distinct field');
    }
}

exports.getMasterCustomParameter = async function (id) {
    try {
        // Find the MasterCustomParameter 
        var _details = await MasterCustomParameter.findOne({ _id: id });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("MasterCustomParameter not available");
    }
}

exports.getMasterCustomParameterOne = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        // Find the MasterCustomParameter 
        var _details = await MasterCustomParameter.findOne(query)
            .sort(sorts)

        return _details || null
    } catch (e) {
        // return a Error message describing the reason
        return null
        // throw Error("MasterCustomParameter not available")
    }
}

exports.createMasterCustomParameter = async function (masterCustomParameter) {
    var newMasterCustomParameter = new MasterCustomParameter({
        category: masterCustomParameter.category ? masterCustomParameter.category : null,
        key: masterCustomParameter.key ? masterCustomParameter.key : "",
        key_url: masterCustomParameter.key_url ? masterCustomParameter.key_url : "",
        value_type: masterCustomParameter.value_type ? masterCustomParameter.value_type : "",
        value: masterCustomParameter.value ? masterCustomParameter.value : "",
        custom_type: masterCustomParameter.custom_type ? masterCustomParameter.custom_type : "",
        custom_options: masterCustomParameter.custom_options ? masterCustomParameter.custom_options : [],
        description: masterCustomParameter.description ? masterCustomParameter.description : "",
        edit_flag: masterCustomParameter.edit_flag ? masterCustomParameter.edit_flag : 0,
        status: masterCustomParameter.status ? masterCustomParameter.status : 0
    })

    try {
        // Saving the MasterCustomParameter
        var savedMasterCustomParameter = await newMasterCustomParameter.save();
        return savedMasterCustomParameter;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterCustomParameter")
    }
}

exports.updateMasterCustomParameter = async function (masterCustomParameter) {
    var id = masterCustomParameter._id
    try {
        //Find the old MasterCustomParameter Object by the Id
        var oldMasterCustomParameter = await MasterCustomParameter.findById(id);
        // console.log('oldMasterCustomParameter ',oldMasterCustomParameter)
    } catch (e) {
        throw Error("Error occured while Finding the MasterCustomParameter")
    }
    // If no old MasterCustomParameter Object exists return false
    if (!oldMasterCustomParameter) {
        return false;
    }

    // Edit the MasterCustomParameter Object
    if (masterCustomParameter.category) {
        oldMasterCustomParameter.category = masterCustomParameter.category;
    }

    if (masterCustomParameter.key) {
        oldMasterCustomParameter.key = masterCustomParameter.key;
    }

    if (masterCustomParameter.key_url) {
        oldMasterCustomParameter.key_url = masterCustomParameter.key_url;
    }

    if (masterCustomParameter.value_type) {
        oldMasterCustomParameter.value_type = masterCustomParameter.value_type;
    }

    if (masterCustomParameter.value) {
        oldMasterCustomParameter.value = masterCustomParameter.value;
    }

    if (masterCustomParameter.custom_type) {
        oldMasterCustomParameter.custom_type = masterCustomParameter.custom_type;
    }

    if (masterCustomParameter.custom_options) {
        oldMasterCustomParameter.custom_options = masterCustomParameter.custom_options;
    }

    if (masterCustomParameter.description) {
        oldMasterCustomParameter.description = masterCustomParameter.description;
    }

    if (masterCustomParameter.edit_flag) {
        oldMasterCustomParameter.edit_flag = masterCustomParameter.edit_flag;
    }

    if (masterCustomParameter.status || masterCustomParameter.status == 0) {
        oldMasterCustomParameter.status = masterCustomParameter.status ? masterCustomParameter.status : 0;
    }

    try {
        var savedMasterCustomParameter = await oldMasterCustomParameter.save()
        return savedMasterCustomParameter;
    } catch (e) {
        throw Error("And Error occured while updating the MasterCustomParameter");
    }
}

exports.deleteMasterCustomParameter = async function (id) {
    // Delete the MasterCustomParameter
    try {
        var deleted = await MasterCustomParameter.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterCustomParameter Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterCustomParameter")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await MasterCustomParameter.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterCustomParameter")
    }
}
