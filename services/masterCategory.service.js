// Gettign the Newly created Mongoose Model we just created 
var MasterCategory = require('../models/MasterCategory.model');
var ImageService = require('./image.service');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the MasterCategory List
exports.getMasterCategories = async function (query, page, limit, order_name, order) {
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

        var masterCategories = await MasterCategory.aggregate(facetedPipeline);

        // Return the MasterCategoryd list that was retured by the mongoose promise
        return masterCategories;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Master Categories');
    }
}

exports.getMasterCategoriesOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterCategories = await MasterCategory.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterCategories
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Master Categories')
    }
}

exports.getMasterCategoriesSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterCategories = await MasterCategory.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterCategories
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Master Categories')
    }
}

exports.getDistinctMasterCategories = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var _details = await MasterCategory.aggregate([
            { $match: query },
            { "$sort": { "updatedAt": -1 } },
            {
                $group: {
                    "_id": "$name",
                    //"name": { "$first": "$name" },
                    gender: { $first: '$gender' },
                    desc: { $first: '$desc' },
                    after_procedure: { $first: '$after_procedure' },
                    before_procedure: { $first: '$before_procedure' },
                }
            },
        ]);

        return _details;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Finding Master Categories');
    }
}

exports.getExportMasterCategories = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var categories = await MasterCategory.find(query)
            .select('name gender desc before_procedure')

        // Return the Serviced list that was retured by the mongoose promise
        return categories
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories')
    }
}

exports.getMasterCategory = async function (id) {
    try {
        // Find the Data 
        var _details = await MasterCategory.findOne({ _id: id });

        return _details || null;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason     
        throw Error("MasterCategory not available");
    }
}

exports.createMultipleMasterCategory = async function (data) {
    try {
        // Find the Data 
        var categories = await MasterCategory.insertMany(data);
        return categories;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterCategory");
    }
}

exports.createMasterCategory = async function (masterCategory) {
    if (masterCategory.brochure_background_image) {
        var isImage = await ImageService.saveImage(masterCategory.brochure_background_image, "/images/masterCategory/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            masterCategory.brochure_background_image = isImage;
        }
    }

    var newMasterCategory = new MasterCategory({
        name: masterCategory.name ? masterCategory.name : "",
        gender: masterCategory.gender ? masterCategory.gender : "",
        desc: masterCategory.desc ? masterCategory.desc : "",
        before_procedure: masterCategory.before_procedure ? masterCategory.before_procedure : "",
        after_procedure: masterCategory.after_procedure ? masterCategory.after_procedure : "",
        online_status: masterCategory?.online_status ? masterCategory.online_status : 0,
        status: masterCategory.status ? masterCategory.status : 0,
        menu_order: masterCategory.menu_order ? masterCategory.menu_order : 0,
        price_list_status: masterCategory.price_list_status ? masterCategory.price_list_status : 0,
        brochure_background_image: masterCategory.brochure_background_image ? masterCategory.brochure_background_image : "",
        brochure_background_color: masterCategory.brochure_background_color ? masterCategory.brochure_background_color : "",
        brochure_heading_color: masterCategory.brochure_heading_color ? masterCategory.brochure_heading_color : "",
        brochure_font_color: masterCategory.brochure_font_color ? masterCategory.brochure_font_color : "",
    })

    try {
        // Saving the MasterCategory 
        var savedMasterCategory = await newMasterCategory.save();
        return savedMasterCategory;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterCategory")
    }
}

exports.updateMasterCategory = async function (masterCategory) {
    var id = masterCategory._id
    try {
        //Find the old MasterCategory Object by the Id
        var oldMasterCategory = await MasterCategory.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the MasterCategory")
    }

    // If no old MasterCategory Object exists return false
    if (!oldMasterCategory) { return false; }

    //Edit the MasterCategory Object
    if (masterCategory.name) {
        oldMasterCategory.name = masterCategory.name;
    }

    if (masterCategory.gender) {
        oldMasterCategory.gender = masterCategory.gender;
    }

    if (masterCategory.desc || masterCategory.desc == "") {
        oldMasterCategory.desc = masterCategory.desc ? masterCategory.desc : "";
    }

    if (masterCategory.before_procedure || masterCategory.before_procedure == "") {
        oldMasterCategory.before_procedure = masterCategory.before_procedure ? masterCategory.before_procedure : "";
    }

    if (masterCategory.after_procedure || masterCategory.after_procedure == "") {
        oldMasterCategory.after_procedure = masterCategory.after_procedure ? masterCategory.after_procedure : "";
    }

    if (masterCategory.online_status || masterCategory.online_status == 0) {
        oldMasterCategory.online_status = masterCategory.online_status ? masterCategory.online_status : 0;
    }

    if (masterCategory.status || masterCategory.status == 0) {
        oldMasterCategory.status = masterCategory.status ? masterCategory.status : 0;
    }

    if (masterCategory.menu_order || masterCategory.menu_order == 0) {
        oldMasterCategory.menu_order = masterCategory.menu_order ? masterCategory.menu_order : 0;
    }

    if (masterCategory.price_list_status || masterCategory.price_list_status == 0) {
        oldMasterCategory.price_list_status = masterCategory.price_list_status ? masterCategory.price_list_status : 0;
    }

    if (masterCategory.brochure_background_color || masterCategory.brochure_background_color == "") {
        oldMasterCategory.brochure_background_color = masterCategory.brochure_background_color ? masterCategory.brochure_background_color : "";
    }

    if (masterCategory.brochure_heading_color || masterCategory.brochure_heading_color == "") {
        oldMasterCategory.brochure_heading_color = masterCategory.brochure_heading_color ? masterCategory.brochure_heading_color : "";
    }

    if (masterCategory.brochure_font_color || masterCategory.brochure_font_color == "") {
        oldMasterCategory.brochure_font_color = masterCategory.brochure_font_color ? masterCategory.brochure_font_color : "";
    }

    if (masterCategory.brochure_background_image) {
        var isImage = await ImageService.saveImage(masterCategory.brochure_background_image, "/images/masterCategory/").then(data => {
            return data;
        });

        if (typeof (isImage) != undefined && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldMasterCategory.brochure_background_image;
                if (oldMasterCategory.brochure_background_image && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                //console.log(e)
            }

            oldMasterCategory.brochure_background_image = isImage;
        }
    }

    try {
        var savedMasterCategory = await oldMasterCategory.save()
        return savedMasterCategory;
    } catch (e) {
        throw Error("And Error occured while updating the MasterCategory");
    }
}

exports.deleteMasterCategory = async function (id) {
    // Delete the MasterCategory
    try {
        var deleted = await MasterCategory.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterCategory Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterCategory")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await MasterCategory.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterCategory")
    }
}

exports.getMasterCategoriesDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var categories = await MasterCategory.find(query)
            .select("_id name gender")
            .sort(sorts)

        return categories
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown master categories')
    }
}

exports.getMasterCategoryDetail = async function (query = {}) {
    try {
        var masterCategory = await MasterCategory.findOne(query)
            .select("_id name gender");

        return masterCategory
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown masterCategory')
    }
}

exports.searchNames = async function (query) {
    try {
        // Fetch matching names from the database
        let names = await MasterCategory.find(query, { name: 1 }); // Limit to 10 results for example
        return names;
    } catch (e) {
        // Handle the error
        throw Error('Error while searching names: ' + e.message);
    }
}