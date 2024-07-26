// Gettign the Newly created Mongoose Model we just created 
var MasterEmailTemplate = require('../models/MasterEmailTemplate.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the MasterEmailTemplates List
exports.getMasterEmailTemplates = async function (query, page, limit, order_name, order) {
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

        var masterEmailTemplates = await MasterEmailTemplate.aggregate(facetedPipeline);
        // Return the MasterEmailTemplates list that was retured by the mongoose promise
        return masterEmailTemplates;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterEmailTemplates');
    }
}

exports.getMasterEmailTemplatesOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterEmailTemplates = await MasterEmailTemplate.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterEmailTemplates
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterEmailTemplates')
    }
}

exports.getMasterEmailTemplatesSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterEmailTemplates = await MasterEmailTemplate.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterEmailTemplates
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterEmailTemplates')
    }
}

exports.getMasterEmailTemplate = async function (id) {
    try {
        // Find the MasterEmailTemplate 
        var _details = await MasterEmailTemplate.findOne({ _id: id });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("MasterEmailTemplate not available");
    }
}

exports.getMasterEmailTemplateOne = async function (query, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        // Find the MasterEmailTemplate 
        var _details = await MasterEmailTemplate.findOne(query)
            .sort(sorts);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason
        return null;
    }
}

exports.createMasterEmailTemplate = async function (masterEmailTemplate) {
    var newMasterEmailTemplate = new MasterEmailTemplate({
        name: masterEmailTemplate.name ? masterEmailTemplate.name : '',
        type: masterEmailTemplate.type ? masterEmailTemplate.type : '',
        contents: masterEmailTemplate.contents ? masterEmailTemplate.contents : '',
        title: masterEmailTemplate.title ? masterEmailTemplate.title : '',
        desc: masterEmailTemplate.desc ? masterEmailTemplate.desc : ''
    })

    try {
        // Saving the MasterEmailTemplate 
        var savedMasterEmailTemplate = await newMasterEmailTemplate.save();
        return savedMasterEmailTemplate;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterEmailTemplate")
    }
}

exports.updateMasterEmailTemplate = async function (masterEmailTemplate) {
    var id = masterEmailTemplate._id
    try {
        //Find the old MasterEmailTemplate Object by the Id
        var oldMasterEmailTemplate = await MasterEmailTemplate.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the MasterEmailTemplate")
    }
    // If no old MasterEmailTemplate Object exists return false
    if (!oldMasterEmailTemplate) {
        return false;
    }

    if (masterEmailTemplate.name) {
        oldMasterEmailTemplate.name = masterEmailTemplate.name;
    }

    if (masterEmailTemplate.type) {
        oldMasterEmailTemplate.type = masterEmailTemplate.type;
    }

    if (masterEmailTemplate.contents) {
        oldMasterEmailTemplate.contents = masterEmailTemplate.contents;
    }

    if (masterEmailTemplate.title) {
        oldMasterEmailTemplate.title = masterEmailTemplate.title;
    }

    if (masterEmailTemplate.desc) {
        oldMasterEmailTemplate.desc = masterEmailTemplate.desc;
    }

    try {
        var savedMasterEmailTemplate = await oldMasterEmailTemplate.save()
        return savedMasterEmailTemplate;
    } catch (e) {
        throw Error("And Error occured while updating the MasterEmailTemplate");
    }
}

exports.deleteMasterEmailTemplate = async function (id) {
    // Delete the MasterEmailTemplate
    try {
        var deleted = await MasterEmailTemplate.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterEmailTemplate Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterEmailTemplate")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await MasterEmailTemplate.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterEmailTemplate")
    }
}
