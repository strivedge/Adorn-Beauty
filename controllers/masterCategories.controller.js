var CategoryService = require('../services/category.service')
var MasterCategoryService = require('../services/masterCategory.service')

const { isObjEmpty, isValidJson } = require('../helper')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getMasterCategories = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 0 //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt'
        var order = req.query.order ? req.query.order : '1'
        var searchText = req.query.searchText ? req.query.searchText : '';

        var query = { status: 1 }
        if (req.query.status) {
            query['status'] = 1
        }

        if (searchText) {
            query['$or'] = [
                { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { gender: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ]
        }

        var categories = await MasterCategoryService.getMasterCategories(query, parseInt(page), parseInt(limit), order_name, Number(order))

        // Return the Categories list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: categories, message: "Master categories recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getMasterCategory = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id

        var MasterCategory = await MasterCategoryService.getMasterCategory(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: MasterCategory, message: "Master category recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createMasterCategory = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdMasterCategory = await MasterCategoryService.createMasterCategory(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdMasterCategory, message: "Master category created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateMasterCategory = async function (req, res, next) {
    try {
        // Id is necessary for the update
        if (!req.body._id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
        }

        var updatedMasterCategory = await MasterCategoryService.updateMasterCategory(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedMasterCategory, message: "Master category updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMasterCategory = async function (req, res, next) {
    try {
        var id = req.params.id
        if (!id) {
            return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
        }

        var deleted = await MasterCategoryService.deleteMasterCategory(id)
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getMasterCategoriesDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : 'menu_order'
        var order = req.query?.order ? req.query.order : '1'
        var search = req.query?.searchText ? req.query.searchText : ""

        var query = {}
        var existQuery = {}
        if (req.query?.status == "active") {
            query['status'] = 1
        }

        if (req.query?.gender) {
            query['gender'] = { $in: [req.query.gender.toLowerCase(), 'unisex'] }
        }

        if (req.query?.id) {
            query['_id'] = req.query.id
        }

        if (req.query?.ids && isValidJson(req.query.ids)) {
            var ids = JSON.parse(req.query.ids)
            query['_id'] = { $nin: ids }
            existQuery['_id'] = { $in: ids }
        }

        if (search) {
            query['$or'] = [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { gender: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        }

        var existCategories = []
        if (!isObjEmpty(existQuery)) {
            existCategories = await MasterCategoryService.getMasterCategoriesDropdown(existQuery, orderName, order) || []
        }

        var categories = await MasterCategoryService.getMasterCategoriesDropdown(query, orderName, order) || []
        categories = existCategories.concat(categories) || []

        return res.status(200).send({ status: 200, flag: true, data: categories, message: "Categories dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

exports.createDefaultMasterCategories = async function (req, res, next) {
    try {
        var locationId = req.body?.location_id || ""
        if (!locationId) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: "Location Id must be present!"
            })
        }

        var newTypeIds = [
            "60bf728b768da009dbe78566",
            "60bf7292768da009dbe78567",
            "60bf7f18768da009dbe78581",
            "60bf7284768da009dbe78565",
            "60bf7274768da009dbe78563",
            "60bf7259768da009dbe78561",
            "60bf726b768da009dbe78562",
            "60bf727f768da009dbe78564"
        ]

        var query = { location_id: locationId, status: 1 }
        var categories = await CategoryService.getCategoriesOne(query)
        var newCategories = await CategoryService.getCategoriesOne({ location_id: "60bf6d91768da009dbe78472", _id: { $in: newTypeIds } })
        if (newCategories && newCategories?.length) {
            categories = categories.concat(newCategories);
        }

        if (categories && categories?.length) {
            var masterCategories = await MasterCategoryService.getMasterCategoriesSimple({})
            if (masterCategories && masterCategories?.length) {
                var masterCategoryIds = masterCategories.map((item) => {
                    return item?._id || ""
                })
                masterCategoryIds = masterCategoryIds.filter((x) => x != "")
                await MasterCategoryService.deleteMultiple({ _id: { $in: masterCategoryIds } })
            }

            for (let i = 0; i < categories.length; i++) {
                const element = categories[i];
                var createdMasterCategory = await MasterCategoryService.createMasterCategory(element)
            }
        }

        var masterCategories = await MasterCategoryService.getMasterCategoriesSimple({})

        return res.status(200).json({ status: 200, flag: true, data: masterCategories, message: "Default categories created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.exportMasterCategoryDataToExcel = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var cat_ids = req.body.cat_ids ?? [];
    var searchText = req.body.searchText ?? '';
    try {
        var query = { status: 1 };

        if (cat_ids && cat_ids.length > 0) {
            query['_id'] = { $in: cat_ids }
        }

        if (searchText) {
            query['$or'] = [
                { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { gender: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ]
        }

        var categories = await MasterCategoryService.getExportMasterCategories(query) || [];
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: categories, message: "Categories exported successfully!" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.searchMasterCategoryNames = async function (req, res, next) {
    var searchText = req.query.searchText ? req.query.searchText : '';

    if (!searchText) {
        return res.status(200).json({ status: 200, flag: false, message: "Search text must be present!" });
    }
    // Escape special characters in the search text
    var escapedSearchText = escapeRegExp(searchText);
    var query = { name: { $regex: '.*' + escapedSearchText + '.*', $options: 'i' } };

    try {
        var matchingNames = await MasterCategoryService.searchNames(query);
        return res.status(200).json({ status: 200, flag: true, data: matchingNames, message: "Names fetched successfully!" });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// Helper function to escape special characters in the search text
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

