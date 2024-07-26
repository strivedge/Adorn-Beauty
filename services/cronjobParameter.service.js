// Gettign the Newly created Mongoose Model we just created 
var CronjobParameter = require('../models/CronjobParameter.model');
var jwt = require('jsonwebtoken');
var MasterCronJobParameter = require('../models/MasterCronjobParameter.model');
var MasterCronJobParameterService = require('../services/masterCronjobParameter.service');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the cronjobParameter List
exports.getCronjobParameters = async function (query, page, limit, order_name, order, searchText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        // if(searchText && searchText != '') {
        //     query['$text'] = { $search: searchText, $language:'en',$caseSensitive:false};
        // }

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

        var cronjobParameters = await CronjobParameter.aggregate(facetedPipeline);
        // Return the cronjobParameterd list that was retured by the mongoose promise
        return cronjobParameters;

    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating cronjobParameters');
    }
}

exports.getCronjobParametersOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var cronjobParameters = await CronjobParameter.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return cronjobParameters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CronjobParameters')
    }
}

exports.getCronjobParametersSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var cronjobParameters = await CronjobParameter.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return cronjobParameters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CronjobParameters')
    }
}

exports.getSpecificCronjobParameters = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var cronjobParameters = await CronjobParameter.find(query)
        // Return the cronjobParameterd list that was retured by the mongoose promise
        return cronjobParameters;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding cronjobParameters');
    }
}

exports.getcronjobParameter = async function (id) {
    try {
        // Find the Data 
        var _details = await CronjobParameter.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            throw Error("cronjobParameter not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("cronjobParameter not available");
    }
}

exports.getCronjobParameterOne = async function (query) {
    try {
        // Find the Data 
        var _details = await CronjobParameter.findOne(query);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        return null;
    }
}

exports.updateManyCronjobParameter = async function (query, data) {
    try {
        // Find the Data and replace booking status
        var cronjobParameters = await CronjobParameter.updateMany(query, { $set: data })

        return cronjobParameters;

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CronjobParameter not available");
    }
}

exports.getMasterCronJobParameterId = async function (cronjobParameter) {
    try {
        // Check if the cronjobParameter exists in the master_tests collection by name
        const existingCronJobParameter = await MasterCronJobParameter.findOne({ key: cronjobParameter.key });
        // If the cronjobParameter already exists, return its _id
        if (existingCronJobParameter) {
            return existingCronJobParameter._id;
        } else {
            var createdMasterCronJobParameter = await MasterCronJobParameterService.createMasterCronjobParameter(cronjobParameter)
            // Return the _id of the newly created cronjobParameter
            return createdMasterCronJobParameter._id;
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master cronjobParameter:", error);
        throw error;
    }
}

exports.createCronjobParameter = async function (cronjobParameter) {
    var newcronjobParameter = new CronjobParameter({
        company_id: cronjobParameter.company_id ? cronjobParameter.company_id : "",
        location_id: cronjobParameter.location_id ? cronjobParameter.location_id : "",
        master_cronjob_parameter_id: cronjobParameter.master_cronjob_parameter_id ? cronjobParameter.master_cronjob_parameter_id : null,
        category_id: cronjobParameter.category_id ? cronjobParameter.category_id : "",
        service_id: cronjobParameter.service_id ? cronjobParameter.service_id : [],
        name: cronjobParameter.name ? cronjobParameter.name : "",
        desc: cronjobParameter.desc ? cronjobParameter.desc : "",
        key: cronjobParameter.key ? cronjobParameter.key : "",
        key_url: cronjobParameter.key_url ? cronjobParameter.key_url : "",
        all_online_services: cronjobParameter.all_online_services ? cronjobParameter.all_online_services : 0,
        apply_on_all_services: cronjobParameter.apply_on_all_services ? cronjobParameter.apply_on_all_services : 0,
        status: cronjobParameter.status ? cronjobParameter.status : 0,
        weekend: cronjobParameter.weekend ? cronjobParameter.weekend : "yes",
        holiday: cronjobParameter.holiday ? cronjobParameter.holiday : "yes",
    })

    try {
        // Saving the cronjobParameter 
        var savedcronjobParameter = await newcronjobParameter.save();
        return savedcronjobParameter;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating cronjobParameter")
    }
}

exports.updateCronjobParameter = async function (cronjobParameter) {
    var id = cronjobParameter._id
    try {
        //Find the old cronjobParameter Object by the Id
        var oldcronjobParameter = await CronjobParameter.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the cronjobParameter")
    }

    // If no old cronjobParameter Object exists return false
    if (!oldcronjobParameter) { return false; }

    // Edit the cronjobParameter Object
    if (cronjobParameter.name) {
        oldcronjobParameter.name = cronjobParameter.name
    }

    if (cronjobParameter.company_id) {
        oldcronjobParameter.company_id = cronjobParameter.company_id;
    }

    if (cronjobParameter.location_id) {
        oldcronjobParameter.location_id = cronjobParameter.location_id;
    }

    if (cronjobParameter.master_cronjob_parameter_id) {
        oldcronjobParameter.master_cronjob_parameter_id = cronjobParameter.master_cronjob_parameter_id;
    }

    if (cronjobParameter.category_id) {
        oldcronjobParameter.category_id = cronjobParameter.category_id;
    }

    if (cronjobParameter.service_id) {
        oldcronjobParameter.service_id = cronjobParameter.service_id;
    }

    if (cronjobParameter.key) {
        oldcronjobParameter.key = cronjobParameter.key;
    }

    if (cronjobParameter.key_url) {
        oldcronjobParameter.key_url = cronjobParameter.key_url;
    }

    if (cronjobParameter.desc) {
        oldcronjobParameter.desc = cronjobParameter.desc ? cronjobParameter.desc : '';
    }

    if (cronjobParameter.all_online_services || cronjobParameter.all_online_services == 0) {
        oldcronjobParameter.all_online_services = cronjobParameter.all_online_services ? cronjobParameter.all_online_services : 0;
    }

    if (cronjobParameter.apply_on_all_services || cronjobParameter.apply_on_all_services == 0) {
        oldcronjobParameter.apply_on_all_services = cronjobParameter.apply_on_all_services ? cronjobParameter.apply_on_all_services : 0;
    }

    if (cronjobParameter.status || cronjobParameter.status == 0) {
        oldcronjobParameter.status = cronjobParameter.status ? cronjobParameter.status : 0;
    }
    
    if (cronjobParameter.weekend) {
        oldcronjobParameter.weekend = cronjobParameter.weekend;
    }
    
    if (cronjobParameter.holiday) {
        oldcronjobParameter.holiday = cronjobParameter.holiday;
    }
    try {
        var savedcronjobParameter = await oldcronjobParameter.save()
        return savedcronjobParameter;
    } catch (e) {
        throw Error("And Error occured while updating the cronjobParameter");
    }
}

exports.deleteCronjobParameter = async function (id) {
    // Delete the cronjobParameter
    try {
        var deleted = await CronjobParameter.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("cronjobParameter Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the cronjobParameter")
    }
}


exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await CronjobParameter.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CronjobParameter")
    }
}