// Gettign the Newly created Mongoose Model we just created 
var MasterService = require('../models/MasterService.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the MasterService List
exports.getMasterServices = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        const facetedPipeline = [
            { $match: query },
            //{$match: { $text: { $search: "Indian Head, Neck and Shoulder Massage" } } },
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

        // console.log('facetedPipeline',facetedPipeline)
        const MasterServices = await MasterService.aggregate(facetedPipeline);

        // var MasterServices = await MasterService.paginate(query, options)
        // Return the MasterServiced list that was retured by the mongoose promise
        return MasterServices;
    } catch (e) {
        // console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterServices');
    }
}

exports.getMasterServicesOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterServices = await MasterService.find(query)
            .populate({
                path: 'master_category_id',
                select: "name"
            })
            .populate({
                path: 'master_test_id',
                select: "name"
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterServices
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterServices')
    }
}

exports.getExportMasterServices = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var services = await MasterService.find(query)
            .select('name desc duration gender price special_price commission tax reminder online_status')

        // Return the Categoryd list that was retured by the mongoose promise
        return services
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Services')
    }
}

exports.getMasterServicesSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterServices = await MasterService.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterServices
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterServices')
    }
}

exports.getMasterServicesSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterServices = await MasterService.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterServices
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterServices')
    }
}

exports.getDistinctMasterServices = async function (query) {
    //console.log('query',query)
    // Try Catch the awaited promise to handle the error 
    try {

        var _details = await MasterService.aggregate([
            { $match: query },
            { "$sort": { "updatedAt": -1 } },
            {
                $group: {
                    "_id": "$name",
                    //"name": { "$first": "$name" },
                    gender: { $first: '$gender' },
                    desc: { $first: '$desc' },
                    category_id: { $first: '$category_id' },
                    test_id: { $first: '$test_id' },
                    duration: { $first: '$duration' },
                    reminder: { $first: '$reminder' },
                    price: { $first: '$price' }

                }
            },
        ]);
        return _details;

    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Finding MasterServices');
    }
}

exports.getMasterService = async function (id) {
    try {
        // Find the Data 
        var _details = await MasterService.findOne({ _id: id })
            .populate({
                path: 'master_category_id',
                select: "name"
            })
            .populate({
                path: 'master_test_id',
                select: "name"
            })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason
        // throw Error("MasterService not available");
        return null
    }
}

exports.getMasterServiceOne = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await MasterService.findOne(query)
            .select("_id category_id name duration gender price special_price commission tax reminder service_limit online_status status test_id")

        return _details || null
    } catch (e) {
        return null
    }
}

exports.createMultipleMasterServices = async function (data) {
    try {
        // Find the Data
        var services = await MasterService.insertMany(data)
        return services
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterService")
    }
}

exports.createMasterService = async function (masterService) {
    var newMasterService = new MasterService({
        master_category_id: masterService.master_category_id ? masterService.master_category_id : null,
        master_test_id: masterService.master_test_id ? masterService.master_test_id : null,
        name: masterService.name ? masterService.name : "",
        desc: masterService.desc ? masterService.desc : "",
        duration: masterService.duration ? masterService.duration : "",
        gender: masterService.gender ? masterService.gender : "",
        reminder: masterService.reminder ? masterService.reminder : "",
        price: masterService.price ? masterService.price : 0,
        special_price: masterService.special_price ? masterService.special_price : 0,
        commission: masterService.commission ? masterService.commission : 0,
        tax: masterService.tax ? masterService.tax : 0,
        service_limit: masterService.service_limit ? masterService.service_limit : -1,
        menu_order: masterService.menu_order ? masterService.menu_order : 0,
        online_status: masterService.online_status ? masterService.online_status : 0,
        price_list_status: masterService.price_list_status ? masterService.price_list_status : 0,
        status: masterService.status ? masterService.status : 0
    })

    try {
        // Saving the MasterService 
        var savedMasterService = await newMasterService.save()
        return savedMasterService
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterService")
    }
}

exports.updateMasterService = async function (masterService) {
    try {
        // Find the old MasterService Object by the Id
        var id = masterService._id
        var oldMasterService = await MasterService.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the MasterService")
    }

    // If no old MasterService Object exists return false
    if (!oldMasterService) { return false }

    // Edit the MasterService Object
    if (masterService.master_category_id) {
        oldMasterService.master_category_id = masterService.master_category_id
    }

    if (masterService.master_test_id) {
        oldMasterService.master_test_id = masterService.master_test_id
    }

    if (masterService.name) {
        oldMasterService.name = masterService.name
    }

    if (masterService.desc || masterService.desc == "") {
        oldMasterService.desc = masterService.desc ? masterService.desc : ""
    }

    if (masterService.duration) {
        oldMasterService.duration = masterService.duration
    }

    if (masterService.gender) {
        oldMasterService.gender = masterService.gender
    }

    if (masterService.reminder || masterService.reminder == "") {
        oldMasterService.reminder = masterService.reminder ? masterService.reminder : ""
    }

    if (masterService.price || masterService.price == 0) {
        oldMasterService.price = masterService.price ? masterService.price : 0
    }

    if (masterService.special_price || masterService.special_price == 0) {
        oldMasterService.special_price = masterService.special_price ? masterService.special_price : 0
    }

    if (masterService.commission || masterService.commission == 0) {
        oldMasterService.commission = masterService.commission ? masterService.commission : 0
    }

    if (masterService.tax || masterService.tax == 0) {
        oldMasterService.tax = masterService.tax ? masterService.tax : 0
    }

    oldMasterService.service_limit = masterService.service_limit ? masterService.service_limit : -1

    if (masterService.menu_order || masterService.menu_order == 0) {
        oldMasterService.menu_order = masterService.menu_order ? masterService.menu_order : 0
    }

    if (masterService.online_status || masterService.online_status == 0) {
        oldMasterService.online_status = masterService.online_status ? masterService.online_status : 0
    }

    if (masterService.price_list_status || masterService.price_list_status == 0) {
        oldMasterService.price_list_status = masterService.price_list_status ? masterService.price_list_status : 0
    }

    if (masterService.status || masterService.status == 0) {
        oldMasterService.status = masterService.status ? masterService.status : 0
    }

    try {
        var savedMasterService = await oldMasterService.save()
        return savedMasterService
    } catch (e) {
        throw Error("And Error occured while updating the MasterService")
    }
}

exports.updateManyMasterServiceStatus = async function (query) {
    try {
        // Find the Data and replace status
        var service = await MasterService.updateMany(query, { $set: { status: 0 } })

        return service
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("MasterService not available")
    }
}


exports.deleteMasterService = async function (id) {
    // Delete the MasterService
    try {
        var deleted = await MasterService.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterService Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterService")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the MasterService
    try {
        var deleted = await MasterService.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterService")
    }
}

// This is only for dropdown
exports.getMasterServicesDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var services = await MasterService.find(query)
            .select("_id category_id name duration gender price special_price commission tax reminder service_limit online_status status test_id")
            .sort(sorts)

        return services
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown services')
    }
}

exports.getMasterServiceDisctict = async function (field, query = {}) {
    // Try Catch the awaited promise to handle the error 
    try {
        var masterService = await MasterService.distinct(field, query)

        // Return the MasterService list that was retured by the mongoose promise
        return masterService || []
    } catch (e) {
        // return a Error message describing the reason 
        return []
    }
}

exports.getMasterServiceDetail = async function (query = {}) {
    try {
        var masterService = await MasterService.findOne(query)
            .select("_id category_id name duration gender price special_price commission tax reminder service_limit online_status status test_id")

        return masterService;
    } catch (e) {
        // console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while getting masterService')
    }
}

exports.searchNames = async function (query) {
    try {
        // Fetch matching names from the database
        let names = await MasterService.find(query, { name: 1 }); // Limit to 10 results for example
        return names;
    } catch (e) {
        // Handle the error
        throw Error('Error while searching names: ' + e.message);
    }
}