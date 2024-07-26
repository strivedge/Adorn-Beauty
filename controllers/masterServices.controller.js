var CategoryService = require('../services/category.service')
var MasterCategoryService = require('../services/masterCategory.service')
var MasterService = require('../services/masterService.service')
var MasterTestService = require('../services/masterTest.service')
var ServiceService = require('../services/service.service')
var TestService = require('../services/test.service')

const { isObjEmpty } = require('../helper')
var ObjectId = require('mongodb').ObjectId

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getMasterServices = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = { status: 1 }
    if (req.query.online_status && req.body.online_status == 1) {
        query['online_status'] = 1;
    }

    if (req.query.master_category_id && req.query.master_category_id != 'undefined') {
        query['master_category_id'] = ObjectId(req.query.master_category_id);
    }

    if (searchText) {
        if (!isNaN(searchText)) {
            query['price'] = { $eq: Number(searchText), $exists: true };
        } else {
            query['$or'] = [
                { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { gender: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { desc: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ]
        }
    }

    try {
        var masterServices = await MasterService.getMasterServices(query, parseInt(page), parseInt(limit), order_name, Number(order))

        // Return the MasterServices list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterServices, message: "Master services recieved successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getMasterService = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var masterService = await MasterService.getMasterService(id)

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: masterService, message: "Master service recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createMasterService = async function (req, res, next) {
    try {
        // Calling the MasterService function with the new object from the Request Body
        var createdMasterService = await MasterService.createMasterService(req.body)

        return res.status(200).json({ status: 200, flag: true, data: createdMasterService, message: "Master service created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateMasterService = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedMasterService = await MasterService.updateMasterService(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedMasterService, message: "Master service updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMasterService = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }
    try {
        var deleted = await MasterService.deleteMasterService(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMultipleService = async function (req, res, next) {

    var ids = req.body.ids;
    if (ids.length == 0) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var query = {
            _id: { $in: req.body.ids }
        };

        var deleted = await MasterService.updateManyMasterServiceStatus(query)

        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getMasterServicesDropdown = async function (req, res, next) {
    try {
        var orderName = req.body?.order_name ? req.body.order_name : 'menu_order'
        var order = req.body?.order ? req.body.order : '1'
        var search = req.body?.searchText ? req.body.searchText : ""

        var query = {}
        var existQuery = {}
        if (req.body?.status == "active") {
            query['status'] = 1
        }

        if (req.body.online_status && req.body.online_status == 1) {
            query['online_status'] = 1
        }

        if (req.body?.master_category_id) {
            query['master_category_id'] = req.body.master_category_id
        }

        if (req.body?.gender) {
            query['$or'] = [
                { gender: { $eq: req.body.gender } },
                { gender: { $eq: 'unisex' } }
            ]
        }

        if (req.body?.gender) {
            query['gender'] = { $in: [req.body.gender, 'unisex'] }
        }

        if (req.body?.id) {
            query['_id'] = req.body.id
        }

        if (req.body?.ids && req.body.ids?.length) {
            var ids = req.body.ids
            query['_id'] = { $nin: ids }
            existQuery['_id'] = { $in: ids }
        }

        if (search) {
            if (!isNaN(search)) {
                query['price'] = { $eq: Number(search), $exists: true }
            } else {
                search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
                query['$or'] = [
                    { name: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }
        }

        var existMasterServices = []
        if (!isObjEmpty(existQuery)) {
            existQuery['status'] = 1;
            existMasterServices = await MasterService.getMasterServicesDropdown(existQuery, orderName, order) || []
        }

        // console.log('getMasterServicesDropdown query',query)

        var services = await MasterService.getMasterServicesDropdown(query, orderName, order) || []
        services = existMasterServices.concat(services) || []

        return res.status(200).send({ status: 200, flag: true, data: services, message: "MasterServices dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

exports.createDefaultMasterServices = async function (req, res, next) {
    try {
        var locationId = req.body?.location_id || ""
        if (!locationId) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: "Location Id must be present!"
            })
        }

        var tstIds = ["60bf6d92768da009dbe78485"]
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

        var tests = await TestService.getTestsOne(query)
        var newTests = await TestService.getTestsOne({ location_id: "60bf6d91768da009dbe78472", _id: { $in: tstIds } })
        if (newTests && newTests?.length) {
            tests = tests.concat(newTests);
        }

        var masterCategories = await MasterCategoryService.getMasterCategoriesSimple({})
        var masterTests = await MasterTestService.getMasterTestsSimple({})

        var services = await ServiceService.getServicesOne(query)
        var newServices = await ServiceService.getServicesOne({ location_id: "60bf6d91768da009dbe78472", category_id: { $in: newTypeIds }, status: 1 })
        if (newServices && newServices?.length) {
            services = services.concat(newServices);
        }
        if (services && services?.length) {
            var masterServices = await MasterService.getMasterServicesSimple({})
            if (masterServices && masterServices?.length) {
                var masterServiceIds = masterServices.map((item) => {
                    return item?._id || ""
                })
                masterServiceIds = masterServiceIds.filter((x) => x != "")
                await MasterService.deleteMultiple({ _id: { $in: masterServiceIds } })
            }

            for (let i = 0; i < services.length; i++) {
                const element = services[i];
                if (element?.category_id) {
                    var category = categories.find((x) => x._id == element.category_id) || null
                    if (category && category?.name) {
                        var masterCategory = masterCategories.find((x) => x.name == category.name) || null
                        if (masterCategory && masterCategory?._id) {
                            element.master_category_id = masterCategory._id
                        }
                    }
                }

                if (element?.test_id) {
                    var test = tests.find((x) => x._id == element.test_id) || null
                    if (test && test?.name) {
                        var masterTest = masterTests.find((x) => x.name == test.name) || null
                        if (masterTest && masterTest?._id) {
                            element.master_test_id = masterTest._id
                        }
                    }
                }

                var createdMasterService = await MasterService.createMasterService(element)
            }
        }

        var masterServices = await MasterService.getMasterServicesSimple({})

        return res.status(200).json({ status: 200, flag: true, data: masterServices, message: "Default services created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.exportMasterServiceDataToExcel = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var category_id = req.body.category_id;
    var service_ids = req.body.service_ids;
    var searchText = req.body.searchText;
    try {
        var data = [];
        var catQuery = { status: 1 };
        if (category_id) {
            catQuery['_id'] = ObjectId(category_id)
        }
        var categories = await MasterCategoryService.getExportMasterCategories(catQuery) || [];
        if (categories && categories.length > 0) {
            for (var i = 0; i < categories.length; i++) {
                var serQuery = { status: 1, master_category_id: categories[i]._id };
                if (service_ids && service_ids.length > 0) {
                    serQuery['_id'] = { $in: service_ids }
                }
                if (searchText) {
                    if (!isNaN(searchText)) {
                        serQuery['price'] = { $eq: Number(searchText), $exists: true };
                    } else {
                        serQuery['$or'] = [
                            { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                            { gender: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                            { desc: { $regex: '.*' + searchText + '.*', $options: 'i' } }
                        ]
                    }
                }
                var services = await MasterService.getExportMasterServices(serQuery) || [];
                services.forEach(object => {
                    object.category_name = categories[i].name;
                });

                data.push(...services);
            }
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: data, message: "Services exported successfully!" });
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// Helper function to escape special characters in the search text
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

exports.searchMasterServiceNames = async function (req, res, next) {
    var searchText = req.query.searchText ? req.query.searchText : '';

    if (!searchText) {
        return res.status(200).json({ status: 200, flag: false, message: "Search text must be present!" });
    }

    // Escape special characters in the search text
    var escapedSearchText = escapeRegExp(searchText);
    var query = { name: { $regex: '.*' + escapedSearchText + '.*', $options: 'i' } };

    try {
        var matchingNames = await MasterService.searchNames(query);
        return res.status(200).json({ status: 200, flag: true, data: matchingNames, message: "Names fetched successfully!" });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}
