// Gettign the Newly created Mongoose Model we just created 
var CustomParameterSetting = require('../models/CustomParameterSetting.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the CustomParameterSettings List
exports.getCustomParameterSettings = async function (query, page, limit, order_name, order) {
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

        var CustomParameterSettings = await CustomParameterSetting.aggregate(facetedPipeline);

        // Return the CustomParameterSettings list that was retured by the mongoose promise
        return CustomParameterSettings;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomParameterSettings');
    }
}

exports.getCustomParameterSettingsOne = async function (query = {}) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomParameterSettings = await CustomParameterSetting.find(query)

        // Return the CustomParameterSettings list that was retured by the mongoose promise
        return CustomParameterSettings
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomParameterSettings')
    }
}

exports.getCustomParameterSettingsSimple = async function (query = {}) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomParameterSettings = await CustomParameterSetting.find(query)

        // Return the CustomParameterSettings list that was retured by the mongoose promise
        return CustomParameterSettings
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomParameterSettings')
    }
}

exports.getAllCustomParameterSettings = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomParameterSettings = await CustomParameterSetting.find(query);
        // Return the CustomParameterSettings list that was retured by the mongoose promise
        return CustomParameterSettings;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomParameterSettings');
    }
}

exports.getSpecificCustomParameterSetting = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomParameterSettings = await CustomParameterSetting.findOne(query);
        // Return the CustomParameterSettings list that was retured by the mongoose promise
        return CustomParameterSettings;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('CustomParameterSetting not available');
    }
}

exports.getDistinctCategory = async function () {
    try {
        var CustomParameterSettings = await CustomParameterSetting.distinct('category');
        return CustomParameterSettings;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Issue with distinct');
    }
}

exports.getCustomParameterSetting = async function (id) {
    try {
        // Find the CustomParameterSetting 
        var _details = await CustomParameterSetting.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            throw Error("CustomParameterSetting not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomParameterSetting not available");
    }
}

exports.getCustomParameterSettingOne = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        // Find the CustomParameterSetting 
        var _details = await CustomParameterSetting.findOne(query)
            .sort(sorts)

        return _details || null
    } catch (e) {
        // return a Error message describing the reason
        return null
        // throw Error("CustomParameterSetting not available")
    }
}

exports.createCustomParameterSettingIfNotExist = async function (query, update) {
    try {

        var savedCustomParameterSetting = await CustomParameterSetting.update(query, update, {upsert: true});

        await CustomParameterSetting.updateOne( query, 
             {
              $setOnInsert: update
             },
             {upsert: true}
        )

        return savedCustomParameterSetting;

    } catch (e) {
        console.log(e);
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomParameterSetting")
    }
}


exports.createOrUpdateCustomParameterSetting = async function (query, update) {
    try {

        var savedCustomParameterSetting = await CustomParameterSetting.updateOne(query, update, {upsert: true});
        return savedCustomParameterSetting;

    } catch (e) {
        console.log(e);
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomParameterSetting")
    }
}

exports.createCustomParameterSetting = async function (customParameterSetting) {
    var newCustomParameterSetting = new CustomParameterSetting({
        company_id: customParameterSetting.company_id ? customParameterSetting.company_id : null,
        location_id: customParameterSetting.location_id ? customParameterSetting.location_id : null,
        master_custom_parameter_id: customParameterSetting.master_custom_parameter_id ? customParameterSetting.master_custom_parameter_id : null,
        title: customParameterSetting.title ? customParameterSetting.title : "",
        category: customParameterSetting.category ? customParameterSetting.category : "",
        formData: customParameterSetting.formData ? customParameterSetting.formData : null,
        desc: customParameterSetting.desc ? customParameterSetting.desc : "",
        status: customParameterSetting.status ? customParameterSetting.status : 0,

    })

    try {
        // Saving the CustomParameterSetting
        var savedCustomParameterSetting = await newCustomParameterSetting.save();
        return savedCustomParameterSetting;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomParameterSetting")
    }
}

exports.updateCustomParameterSetting = async function (customParameterSetting) {
    var id = CustomParameterSetting._id
    // console.log("Id ",id)
    try {
        //Find the old CustomParameterSetting Object by the Id
        var oldCustomParameterSetting = await CustomParameterSetting.findById(id);
        // console.log('oldCustomParameterSetting ',oldCustomParameterSetting)
    } catch (e) {
        throw Error("Error occured while Finding the CustomParameterSetting")
    }
    // If no old CustomParameterSetting Object exists return false
    if (!oldCustomParameterSetting) { return false; }

    // Edit the CustomParameterSetting Object
    if (customParameterSetting.company_id) {
        oldCustomParameterSetting.company_id = customParameterSetting.company_id;
    }

    if (customParameterSetting.location_id) {
        oldCustomParameterSetting.location_id = customParameterSetting.location_id;
    }

    if (customParameterSetting.master_custom_parameter_id) {
        oldCustomParameterSetting.master_custom_parameter_id = customParameterSetting.master_custom_parameter_id;
    }

    if(customParameterSetting.title){
        oldCustomParameterSetting.title = customParameterSetting.title;
    }

    if (customParameterSetting.category) {
        oldCustomParameterSetting.category = customParameterSetting.category;
    }

    if (customParameterSetting.formData) {
        oldCustomParameterSetting.formData = customParameterSetting.formData;
    } 
    oldCustomParameterSetting.status = customParameterSetting.status ? customParameterSetting.status : 0;

    oldCustomParameterSetting.desc = customParameterSetting?.desc ?? '';

    try {
        var savedCustomParameterSetting = await oldCustomParameterSetting.save()
        return savedCustomParameterSetting;
    } catch (e) {
        throw Error("And Error occured while updating the CustomParameterSetting");
    }
}

exports.deleteCustomParameterSetting = async function (id) {
    // Delete the CustomParameterSetting
    try {
        var deleted = await CustomParameterSetting.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CustomParameterSetting Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomParameterSetting")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await CustomParameterSetting.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomParameterSetting")
    }
}