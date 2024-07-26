// Gettign the Newly created Mongoose Model we just created 
var MasterCustomParameterSetting = require('../models/MasterCustomParameterSetting.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the MasterCustomParameterSettings List
exports.getMasterCustomParameterSettings = async function (query, page, limit, order_name, order) {
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

        var masterCustomParameterSettings = await MasterCustomParameterSetting.aggregate(facetedPipeline);
        // Return the MasterCustomParameterSettings list that was retured by the mongoose promise
        return masterCustomParameterSettings;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCustomParameterSettings');
    }
}

exports.getMasterCustomParameterSettingsOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterCustomParameterSettings = await MasterCustomParameterSetting.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterCustomParameterSettings
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCustomParameterSettings')
    }
}

exports.getMasterCustomParameterSettingSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterCustomParameterSettings = await MasterCustomParameterSetting.find(query)

        return masterCustomParameterSettings
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterCustomParameterSettings')
    }
}

exports.getDistinctMasterCustomParameterSettings = async function (field, query) {
    try {
        var masterCustomParameterSettings = await MasterCustomParameterSetting.distinct(field, query);

        return masterCustomParameterSettings;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Issue with distinct field');
    }
}

exports.getMasterCustomParameterSetting = async function (id) {
    try {
        // Find the MasterCustomParameterSetting 
        var _details = await MasterCustomParameterSetting.findOne({ _id: id });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("MasterCustomParameterSetting not available");
    }
}

exports.getMasterCustomParameterSettingOne = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        // Find the MasterCustomParameterSetting 
        var _details = await MasterCustomParameterSetting.findOne(query)
            .sort(sorts)

        return _details || null
    } catch (e) {
        // return a Error message describing the reason
        return null
        // throw Error("MasterCustomParameterSetting not available")
    }
}

exports.createMasterCustomParameterSetting = async function (masterCustomParameterSetting) {
    var newMasterCustomParameterSetting = new MasterCustomParameterSetting({
        title: masterCustomParameterSetting.title ? masterCustomParameterSetting.title : "",
        category: masterCustomParameterSetting.category ? masterCustomParameterSetting.category : "",
        formData: masterCustomParameterSetting.formData ? masterCustomParameterSetting.formData : null,
        desc: masterCustomParameterSetting.desc ? masterCustomParameterSetting.desc : "",
        status: masterCustomParameterSetting.status ? masterCustomParameterSetting.status : 0,
    })

    try {
        // Saving the MasterCustomParameterSetting
        var savedMasterCustomParameterSetting = await newMasterCustomParameterSetting.save();
        return savedMasterCustomParameterSetting;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterCustomParameterSetting")
    }
}

exports.updateMasterCustomParameterSetting = async function (masterCustomParameterSetting) {
    var id = masterCustomParameterSetting._id
    try {
        //Find the old MasterCustomParameterSetting Object by the Id
        var oldMasterCustomParameterSetting = await MasterCustomParameterSetting.findById(id);
        // console.log('oldMasterCustomParameterSetting ',oldMasterCustomParameterSetting)
    } catch (e) {
        throw Error("Error occured while Finding the MasterCustomParameterSetting")
    }
    // If no old MasterCustomParameterSetting Object exists return false
    if (!oldMasterCustomParameterSetting) {
        return false;
    }

    // Edit the MasterCustomParameterSetting Object
    if (masterCustomParameterSetting.title) {
        oldMasterCustomParameterSetting.title = masterCustomParameterSetting.title;
    }
    if (masterCustomParameterSetting.category) {
        oldMasterCustomParameterSetting.category = masterCustomParameterSetting.category;
    }

    if (masterCustomParameterSetting.formData) {
        oldMasterCustomParameterSetting.formData = masterCustomParameterSetting.formData;
    }

    if (masterCustomParameterSetting.desc) {
        oldMasterCustomParameterSetting.desc = masterCustomParameterSetting.desc;
    }

    if (masterCustomParameterSetting.status || masterCustomParameterSetting.status == 0) {
        oldMasterCustomParameterSetting.status = masterCustomParameterSetting.status ? masterCustomParameterSetting.status : 0;
    }

    try {
        var savedMasterCustomParameterSetting = await oldMasterCustomParameterSetting.save()
        return savedMasterCustomParameterSetting;
    } catch (e) {
        throw Error("And Error occured while updating the MasterCustomParameterSetting");
    }
}

exports.deleteMasterCustomParameterSetting = async function (id) {
    // Delete the MasterCustomParameterSetting
    try {
        var deleted = await MasterCustomParameterSetting.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterCustomParameterSetting Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterCustomParameterSetting")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await MasterCustomParameterSetting.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterCustomParameterSetting")
    }
}
