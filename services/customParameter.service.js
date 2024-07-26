// Gettign the Newly created Mongoose Model we just created 
var CustomParameter = require('../models/CustomParameter.model');
var MasterCustomParameter = require('../models/MasterCustomParameter.model');
var MasterCustomParameterService = require('../services/masterCustomParameter.service')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the CustomParameters List
exports.getCustomParameters = async function (query, page, limit, order_name, order) {
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

        var customParameters = await CustomParameter.aggregate(facetedPipeline);

        // Return the CustomParameters list that was retured by the mongoose promise
        return customParameters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomParameters');
    }
}

exports.getCustomParametersOne = async function (query = {}) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customParameters = await CustomParameter.find(query)

        // Return the CustomParameters list that was retured by the mongoose promise
        return customParameters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomParameters')
    }
}

exports.getCustomParametersSimple = async function (query = {}) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customParameters = await CustomParameter.find(query)

        // Return the CustomParameters list that was retured by the mongoose promise
        return customParameters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomParameters')
    }
}

exports.getAllCustomParameters = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customParameters = await CustomParameter.find(query);
        // Return the CustomParameters list that was retured by the mongoose promise
        return customParameters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomParameters');
    }
}

exports.getSpecificCustomParameter = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customParameters = await CustomParameter.findOne(query);
        // Return the CustomParameters list that was retured by the mongoose promise
        return customParameters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('CustomParameter not available');
    }
}

exports.getDistinctCategory = async function () {
    try {
        var customParameters = await CustomParameter.distinct('category');
        return customParameters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Issue with distinct');
    }
}

exports.getCustomParameter = async function (id) {
    try {
        // Find the CustomParameter 
        var _details = await CustomParameter.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            throw Error("CustomParameter not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomParameter not available");
    }
}

exports.getCustomParameterOne = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        // Find the CustomParameter 
        var _details = await CustomParameter.findOne(query)
            .sort(sorts)

        return _details || null
    } catch (e) {
        // return a Error message describing the reason
        return null
        // throw Error("CustomParameter not available")
    }
}

exports.getMasterCustomParameterId = async function (custom_parameter) {
    try {
        // Check if the custom_parameter exists in the master_tests collection by name
        const existingCustomParameter = await MasterCustomParameter.findOne({ key: custom_parameter.key });
        // If the custom_parameter already exists, return its _id
        if (existingCustomParameter) {
            return existingCustomParameter._id;
        } else {
            var createdMasterCustomParameter = await MasterCustomParameterService.createMasterCustomParameter(custom_parameter)
            // Return the _id of the newly created custom_parameter
            return createdMasterCustomParameter._id;
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master custom_parameter:", error);
        throw error;
    }
}


exports.createCustomParameter = async function (customParameter) {
    var newCustomParameter = new CustomParameter({
        company_id: customParameter.company_id ? customParameter.company_id : "",
        location_id: customParameter.location_id ? customParameter.location_id : "",
        master_custom_parameter_id: customParameter.master_custom_parameter_id ? customParameter.master_custom_parameter_id : null,
        category: customParameter.category ? customParameter.category : "",
        key: customParameter.key ? customParameter.key : "",
        key_url: customParameter.key_url ? customParameter.key_url : "",
        value_type: customParameter.value_type ? customParameter.value_type : "",
        value: customParameter.value ? customParameter.value : "",
        custom_type: customParameter.custom_type ? customParameter.custom_type : "",
        custom_options: customParameter.custom_options ? customParameter.custom_options : [],
        description: customParameter.description ? customParameter.description : "",
        edit_flag: customParameter.edit_flag ? customParameter.edit_flag : 0,
        status: customParameter.status ? customParameter.status : 0
    })

    try {
        // Saving the CustomParameter
        var savedCustomParameter = await newCustomParameter.save();
        return savedCustomParameter;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomParameter")
    }
}

exports.updateCustomParameter = async function (customParameter) {
    var id = customParameter._id
    // console.log("Id ",id)
    try {
        //Find the old CustomParameter Object by the Id
        var oldCustomParameter = await CustomParameter.findById(id);
        // console.log('oldCustomParameter ',oldCustomParameter)
    } catch (e) {
        throw Error("Error occured while Finding the CustomParameter")
    }
    // If no old CustomParameter Object exists return false
    if (!oldCustomParameter) { return false; }

    // Edit the CustomParameter Object
    if (customParameter.company_id) {
        oldCustomParameter.company_id = customParameter.company_id;
    }

    if (customParameter.location_id) {
        oldCustomParameter.location_id = customParameter.location_id;
    }

    if (customParameter.master_custom_parameter_id) {
        oldCustomParameter.master_custom_parameter_id = customParameter.master_custom_parameter_id;
    }

    if (customParameter.category) {
        oldCustomParameter.category = customParameter.category;
    }

    if (customParameter.key) {
        oldCustomParameter.key = customParameter.key;
    }

    if (customParameter.key_url) {
        oldCustomParameter.key_url = customParameter.key_url;
    }

    if (customParameter.value_type) {
        oldCustomParameter.value_type = customParameter.value_type;
    }

    if (customParameter.value) {
        oldCustomParameter.value = customParameter.value;
    }

    if (customParameter.custom_type) {
        oldCustomParameter.custom_type = customParameter.custom_type;
    }

    if (customParameter.custom_options) {
        oldCustomParameter.custom_options = customParameter.custom_options;
    }

    if (customParameter.description) {
        oldCustomParameter.description = customParameter.description;
    }

    if (customParameter.edit_flag) {
        oldCustomParameter.edit_flag = customParameter.edit_flag;
    }

    oldCustomParameter.status = customParameter.status ? customParameter.status : 0;

    try {
        var savedCustomParameter = await oldCustomParameter.save()
        return savedCustomParameter;
    } catch (e) {
        throw Error("And Error occured while updating the CustomParameter");
    }
}

exports.deleteCustomParameter = async function (id) {
    // Delete the CustomParameter
    try {
        var deleted = await CustomParameter.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CustomParameter Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomParameter")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await CustomParameter.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomParameter")
    }
}