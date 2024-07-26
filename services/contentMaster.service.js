// Gettign the Newly created Mongoose Model we just created 
var ContentMaster = require('../models/ContentMaster.model');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the ContentMasters List
exports.getContentMasters = async function (query, page, limit, order_name, order) {
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

        var contentMasters = await ContentMaster.aggregate(facetedPipeline);
        // Return the ContentMasters list that was retured by the mongoose promise
        return contentMasters;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating ContentMasters');
    }
}

exports.getContentMastersOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var contentMasters = await ContentMaster.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return contentMasters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating ContentMasters')
    }
}

exports.getContentMastersSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var contentMasters = await ContentMaster.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return contentMasters
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating ContentMasters')
    }
}

exports.getAllContentMasters = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var contentMasters = await ContentMaster.find(query);

        // Return the ContentMasters list that was retured by the mongoose promise
        return contentMasters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding ContentMasters');
    }
}

exports.getContentMaster = async function (id) {
    try {
        // Find the ContentMaster 
        var _details = await ContentMaster.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            throw Error("ContentMaster not available");
        }

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("ContentMaster not available");
    }
}

exports.getContentMasterOne = async function (query) {
    try {
        // Find the ContentMaster 
        var _details = await ContentMaster.findOne(query);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        return null;
    }
}

exports.createContentMaster = async function (contentMaster) {
    var newContentMaster = new ContentMaster({
        company_id: contentMaster.company_id ? contentMaster.company_id : "",
        location_id: contentMaster.location_id ? contentMaster.location_id : "",
        master_content_master_id: contentMaster.master_content_master_id ? contentMaster.master_content_master_id : null,
        name: contentMaster.name ? contentMaster.name : "",
        last_publish_date: contentMaster.last_publish_date ? contentMaster.last_publish_date : "",
        content: contentMaster.content ? contentMaster.content : ""
    })

    try {
        // Saving the ContentMaster 
        var savedContentMaster = await newContentMaster.save();
        return savedContentMaster;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating ContentMaster")
    }
}

exports.updateContentMaster = async function (contentMaster) {
    var id = contentMaster._id
    // console.log("Id ",id)
    try {
        //Find the old ContentMaster Object by the Id
        var oldContentMaster = await ContentMaster.findById(id);
        // console.log('oldContentMaster ',oldContentMaster)
    } catch (e) {
        throw Error("Error occured while Finding the ContentMaster")
    }

    // If no old ContentMaster Object exists return false
    if (!oldContentMaster) { return false; }

    // Edit the ContentMaster Object
    if (contentMaster.company_id) {
        oldContentMaster.company_id = contentMaster.company_id;
    }

    if (contentMaster.location_id) {
        oldContentMaster.location_id = contentMaster.location_id;
    }

    if (contentMaster.master_content_master_id) {
        oldContentMaster.master_content_master_id = contentMaster.master_content_master_id;
    }

    if (contentMaster.name) {
        oldContentMaster.name = contentMaster.name;
    }

    if (contentMaster.last_publish_date) {
        oldContentMaster.last_publish_date = contentMaster.last_publish_date;
    }

    if (contentMaster.content) {
        oldContentMaster.content = contentMaster.content;
    }

    try {
        var savedContentMaster = await oldContentMaster.save()
        return savedContentMaster;
    } catch (e) {
        throw Error("And Error occured while updating the ContentMaster");
    }
}

exports.deleteContentMaster = async function (id) {
    // Delete the ContentMaster
    try {
        var deleted = await ContentMaster.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("ContentMaster Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the ContentMaster")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await ContentMaster.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the ContentMaster")
    }
}