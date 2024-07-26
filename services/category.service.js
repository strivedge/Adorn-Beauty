// Gettign the Newly created Mongoose Model we just created 
var Category = require('../models/Category.model');
var ImageService = require('./image.service');
var MasterCategoryService = require('../services/masterCategory.service')
var MasterCategory = require('../models/MasterCategory.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Category List
exports.getCategories = async function (query, page, limit, order_name, order) {
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

        var Categories = await Category.aggregate(facetedPipeline);
        // Return the Categoryd list that was retured by the mongoose promise
        return Categories;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories');
    }
}

exports.getCategoriesOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var categories = await Category.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return categories
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories')
    }
}

exports.getCategoriesSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var categories = await Category.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return categories
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories')
    }
}

exports.getAllActiveCategories = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Categories = await Category.find(query, { _id: 0 });
        // Return the Categoryd list that was retured by the mongoose promise
        return Categories;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Categories');
    }
}

exports.getDistinctCategories = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var _details = await Category.aggregate([
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
            }
        ]);

        return _details;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Finding Categories');
    }
}

exports.getActiveCategories = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Categories = await Category.find(query)
        // Return the Categoryd list that was retured by the mongoose promise
        return Categories;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Categories');
    }
}

exports.getExportCategories = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Categories = await Category.find(query).select({ name: 1, gender: 1, desc: 1, before_procedure: 1, after_procedure: 1, thumbnail: 1 })

        // Return the Serviced list that was retured by the mongoose promise
        return Categories
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories')
    }
}

exports.getCategoriesSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Categories = await Category.find(query)
            .select({ _id: 1, name: 1, gender: 1, desc: 1, before_procedure: 1, after_procedure: 1, url_name: '', thumbnail: 1 })

        // Return the Serviced list that was retured by the mongoose promise
        return Categories
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories')
    }
}

exports.checkCategoryExist = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await Category.findOne(query);

        return _details || null
    } catch (e) {
        return null
    }
}

exports.getCategoriesbyLocation = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Categories = await Category.find(query).sort({ menu_order: 1 });

        // Return the Serviced list that was retured by the mongoose promise
        return Categories;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories');
    }
}

// getting all type for company copy
exports.getTypesCompanySpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var category = await Category.find(query);

        // Return the Serviced list that was retured by the mongoose promise
        return category;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories');
    }
}

exports.getCategory = async function (id) {
    try {
        // Find the Data 
        var _details = await Category.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            throw Error("Category not available");
        }
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason     
        throw Error("Category not available");
    }
}

exports.createMultipleCategory = async function (data) {
    try {
        // Find the Data 
        var categories = await Category.insertMany(data);
        return categories;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating Category");
    }
}

exports.getMasterCategoryId = async function (category) {
    try {
        // Check if the category exists in the master_tests collection by name
        const existingService = await MasterCategory.findOne({ name: category.name });
        // If the category already exists, return its _id
        if (existingService) {
            return existingService._id;
        } else {
            var createdMasterCategory = await MasterCategoryService.createMasterCategory(category)
            // Return the _id of the newly created category
            return createdMasterCategory._id;
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master service:", error);
        throw error;
    }
}

exports.createCategory = async function (category) {
    if (category.brochure_background_image) {
        var isImage = await ImageService.saveImage(category.brochure_background_image, "/images/category/").then(data => {
            return data;
        });
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            category.brochure_background_image = isImage;
        }
    }

    if (category.thumbnail) {
        var isImage = await ImageService.saveImage(category.thumbnail, "/images/category/").then(data => {
            return data;
        });
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            category.thumbnail = isImage;
        }
    }

    var newCategory = new Category({
        company_id: category.company_id ? category.company_id : "",
        location_id: category.location_id ? category.location_id : "",
        master_category_id: category.master_category_id ? category.master_category_id : null,
        name: category.name ? category.name : "",
        gender: category.gender ? category.gender : "",
        desc: category.desc ? category.desc : "",
        before_procedure: category.before_procedure ? category.before_procedure : "",
        after_procedure: category.after_procedure ? category.after_procedure : "",
        online_status: category.online_status ? category.online_status : 0,
        status: category.status ? category.status : 0,
        menu_order: category.menu_order ? category.menu_order : 0,
        price_list_status: category.price_list_status ? category.price_list_status : 0,
        brochure_background_image: category.brochure_background_image ? category.brochure_background_image : "",
        brochure_background_color: category.brochure_background_color ? category.brochure_background_color : "",
        brochure_heading_color: category.brochure_heading_color ? category.brochure_heading_color : "",
        brochure_font_color: category.brochure_font_color ? category.brochure_font_color : "",
        show_to_mobile_app: category.show_to_mobile_app ? category.show_to_mobile_app : 0,
        thumbnail: category.thumbnail ? category.thumbnail : "",
    })

    try {
        // Saving the Category 
        var savedCategory = await newCategory.save();
        return savedCategory;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Category")
    }
}

exports.updateCategory = async function (category) {
    var id = category._id
    try {
        //Find the old Category Object by the Id
        var oldCategory = await Category.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Category")
    }

    // If no old Category Object exists return false
    if (!oldCategory) { return false; }

    // Edit the Category Object
    if (category.company_id) {
        oldCategory.company_id = category.company_id;
    }

    if (category.location_id) {
        oldCategory.location_id = category.location_id;
    }

    if (category.master_category_id) {
        oldCategory.master_category_id = category.master_category_id;
    }

    if (category.name) {
        oldCategory.name = category.name;
    }

    if (category.gender) {
        oldCategory.gender = category.gender;
    }

    if (category.desc) {
        oldCategory.desc = category.desc;
    }

    if (category.desc || category.desc == "") {
        oldCategory.desc = category.desc ? category.desc : "";
    }

    if (category.before_procedure || category.before_procedure == "") {
        oldCategory.before_procedure = category.before_procedure ? category.before_procedure : "";
    }

    if (category.after_procedure || category.after_procedure == "") {
        oldCategory.after_procedure = category.after_procedure ? category.after_procedure : "";
    }

    if (category.online_status || category.online_status == 0) {
        oldCategory.online_status = category.online_status ? category.online_status : 0;
    }

    if (category.status || category.status == 0) {
        oldCategory.status = category.status ? category.status : 0;
    }

    if (category.menu_order || category.menu_order == 0) {
        oldCategory.menu_order = category.menu_order ? category.menu_order : 0;
    }

    if (category.price_list_status || category.price_list_status == 0) {
        oldCategory.price_list_status = category.price_list_status ? category.price_list_status : 0;
    }

    if (category.show_to_mobile_app || category.show_to_mobile_app == 0) {
        oldCategory.show_to_mobile_app = category.show_to_mobile_app ? category.show_to_mobile_app : 0;
    }

    if (category.brochure_background_color || category.brochure_background_color == "") {
        oldCategory.brochure_background_color = category.brochure_background_color ? category.brochure_background_color : "";
    }

    if (category.brochure_heading_color || category.brochure_heading_color == "") {
        oldCategory.brochure_heading_color = category.brochure_heading_color ? category.brochure_heading_color : "";
    }

    if (category.brochure_font_color || category.brochure_font_color == "") {
        oldCategory.brochure_font_color = category.brochure_font_color ? category.brochure_font_color : "";
    }

    if (category.brochure_background_image) {
        var isImage = await ImageService.saveImage(category.brochure_background_image, "/images/category/").then(data => {
            return data;
        });

        if (typeof (isImage) != undefined && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldCategory.brochure_background_image;
                if (oldCategory.brochure_background_image && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                //console.log(e)
            }
            oldCategory.brochure_background_image = isImage;
        }
    }

    if (category.thumbnail) {
        var isImage = await ImageService.saveImage(category.thumbnail, "/images/category/").then(data => {
            return data;
        });

        if (typeof (isImage) != undefined && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldCategory.thumbnail;
                if (oldCategory.thumbnail && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                //console.log(e)
            }
            oldCategory.thumbnail = isImage;
        }
    }

    try {
        var savedCategory = await oldCategory.save()
        return savedCategory;
    } catch (e) {
        throw Error("And Error occured while updating the Category");
    }
}

exports.updateManyCategoriesStatus = async function (query) {
    try {
        // Find the Data and replace status
        var _details = await Category.updateMany(query, { $set: { status: 0 } })

        return _details
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Category not available")
    }
}

exports.deleteCategory = async function (id) {
    // Delete the Category
    try {
        var deleted = await Category.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Category Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Category")
    }
}

// This is only for getting category by location id with category name
exports.getCategoryByNameLocation = async function (query) {
    try {
        // Find the Data 
        var _details = await Category.findOne(query)
            .select({ _id: 1, name: 1, gender: 1, desc: 1, before_procedure: 1, after_procedure: 1 });

        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Category not available");
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Category.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Category")
    }
}

exports.getCategoriesDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var categories = await Category.find(query)
            .select("_id name gender show_to_mobile_app thumbnail")
            .sort(sorts)

        return categories
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown categories')
    }
}

exports.getCategoryDetail = async function (query = {}) {
    try {
        var category = await Category.findOne(query)
            .select("_id name gender");

        return category
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown category')
    }
}