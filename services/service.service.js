// Gettign the Newly created Mongoose Model we just created 
var masterService = require('../services/masterService.service');
var Service = require('../models/Service.model')
var masterServiceModel = require('../models/MasterService.model')


// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Service List
exports.getServices = async function (query, page, limit, order_name, order) {
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
            },

        ];

        const Services = await Service.aggregate(facetedPipeline);
        //var Services = await Service.paginate(query, options)

        // Return the Serviced list that was retured by the mongoose promise
        return Services;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Services');
    }
}

exports.getServicesOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var services = await Service.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return services
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Services')
    }
}

exports.getServicesSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var services = await Service.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return services
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Services')
    }
}

exports.getServiceSpecificWithCategory = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Services = await Service.find(query).select({ '_id': 1, 'name': 1, 'price': 1, 'actual_price': 1, 'variable_price': 1, 'special_price': 1, 'hide_strike_price': 1, 'deposite_type': 1, 'deposite': 1, 'min_deposite': 1, 'is_start_from': 1, 'start_from_title': 1, 'is_price_range': 1, 'max_price': 1, 'tax': 1, 'duration': 1, 'category_id': 1, 'reminder': 1, 'online_status': 1, 'status': 1, 'test_id': 1 });

        // Return the Serviced list that was retured by the mongoose promise
        return Services;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Services');
    }
}

exports.getDistinctServices = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {

        var _details = await Service.aggregate([
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
        throw Error('Error while Finding Services');
    }
}

exports.getServiceSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {

        var services = await Service.find(query).select({ '_id': 1, 'name': 1, 'price': 1, 'actual_price': 1, 'variable_price': 1, 'special_price': 1, 'hide_strike_price': 1, 'deposite_type': 1, 'deposite': 1, 'min_deposite': 1, 'is_start_from': 1, 'start_from_title': 1, 'is_price_range': 1, 'max_price': 1, 'commission': 1, 'tax': 1, 'duration': 1, 'category_id': 1, 'gender': 1, 'reminder': 1, 'online_status': 1, 'status': 1, 'test_id': 1, 'old_price': 1 });

        // Return the Serviced list that was retured by the mongoose promise
        return services || null
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason
        return null
        // throw Error('Error while Paginating Services')
    }
}

exports.getCategorySpecificServiceId = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {

        var services = await Service.find(query).select({'_id':1});

        // Return the Serviced list that was retured by the mongoose promise
        return services || null
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason
        return null
        // throw Error('Error while Paginating Services')
    }
}

// only for customer packages (package usage services)
exports.getServiceforCustomerUsage = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var services = await Service.find(query).select({ '_id': 1, 'name': 1 });

        // Return the Serviced list that was retured by the mongoose promise
        return services;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Services');
    }
}

exports.getServiceforCronJob = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var services = await Service.find(query).select({ '_id': 1, 'name': 1, 'reminder': 1 });
        // Return the Serviced list that was retured by the mongoose promise
        return services;

    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Services');
    }
}

exports.getServiceWithPrices = async function (id) {
    try {
        // Find the Data 
        var _details = await Service.findOne({ _id: id }).select({ _id: 1, test_id: 1, category_id: 1, gender: 1, duration: 1, tax: 1, hide_strike_price: 1, commission: 1, base_val: 1, tax_val: 1, old_price: 1, name: 1, price: 1, special_price: 1, actual_price: 1, variable_price: 1, deposite_type: 1, deposite: 1, min_deposite: 1, is_start_from: 1, start_from_title: 1, is_price_range: 1, max_price: 1, final_price: 1 });

        return _details || null
    } catch (e) {
        return null
        // return a Error message describing the reason     
        //throw Error("Service not available");
    }
}

exports.getService = async function (id) {
    try {
        // Find the Data 
        var _details = await Service.findOne({ _id: id })

        return _details || null
    } catch (e) {
        return null
        // return a Error message describing the reason     
        //throw Error("Service not available");
    }
}

exports.checkServiceExist = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await Service.findOne(query);

        return _details || null
    } catch (e) {
        return null
    }
}


exports.getServiceOne = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await Service.findOne(query)
            .select("_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id")

        return _details || null
    } catch (e) {
        return null
    }
}

exports.getServiceId = async function (id) {
    try {
        // Find the Data 
        var _details = await Service.findOne({ _id: id });

        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Service not available");
    }
}

exports.getServiceName = async function (location_id, name) {
    try {
        // Find the Data 
        var _details = await Service.findOne({
            location_id: location_id,
            name: name
        })

        return _details
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Service not available")
    }
}

exports.getServicesbyLocation = async function (query, page = 0, limit = 10) {
    // Try Catch the awaited promise to handle the error 
    try {
        var service = await Service.find(query)

        // Return the Serviced list that was retured by the mongoose promise
        return service
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding services')
    }
}

exports.getSortServicesbyLocation = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var service = await Service.find(query).sort({ menu_order: 1 })

        // Return the Serviced list that was retured by the mongoose promise
        return service
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding services')
    }
}

exports.updateManyServiceStatus = async function (query) {
    try {
        // Find the Data and replace status
        var service = await Service.updateMany(query, { $set: { status: 0 } })

        return service
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Service not available")
    }
}

exports.getExportServices = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Services = await Service.find(query).select('name desc duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status')
        // Return the Categoryd list that was retured by the mongoose promise
        return Services
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Finding Services')
    }
}


exports.getAllActiveServices = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Services = await Service.find(query, { _id: 0 })
        // Return the Categoryd list that was retured by the mongoose promise
        return Services
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Categories')
    }
}

exports.createMultipleServices = async function (data) {
    try {
        // Find the Data
        var services = await Service.insertMany(data)
        return services
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Service")
    }
}

exports.getMasterServiceId = async function (service) {
    try {
        // Check if the service exists in the master_tests collection by name
        const existingService = await masterServiceModel.findOne({ name: service.name });
        // If the service already exists, return its _id
        if (existingService) {
            return existingService._id;
        } else {
            var createdMasterService = await masterService.createMasterService(service)
            // Return the _id of the newly created service
            return createdMasterService._id;
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master service:", error);
        throw error;
    }
}

exports.createService = async function (service) {
    if (!service?.actual_price || service?.actual_price == 0) {
        service.actual_price = service.price;
    }
    var newService = new Service({
        company_id: service.company_id ? service.company_id : "",
        location_id: service.location_id ? service.location_id : "",
        master_category_id: service.master_category_id ? service.master_category_id : null,
        master_test_id: service.master_test_id ? service.master_test_id : null,
        master_service_id: service.master_service_id ? service.master_service_id : null,
        category_id: service.category_id ? service.category_id : "",
        test_id: service.test_id ? service.test_id : "",
        name: service.name ? service.name : "",
        desc: service.desc ? service.desc : "",
        duration: service.duration ? service.duration : "",
        gender: service.gender ? service.gender : "",
        reminder: service.reminder ? service.reminder : "",
        actual_price: service.actual_price ? service.actual_price : 0,
        price: service.special_price ? service.special_price : service.actual_price,
        variable_price: service.special_price ? service.special_price : service.actual_price,
        special_price: service.special_price ? service.special_price : 0,
        hide_strike_price: service.hide_strike_price ? service.hide_strike_price : 0,
        commission: service.commission ? service.commission : 0,
        is_start_from: service.is_start_from ? service.is_start_from : 0,
        start_from_title: service.start_from_title ? service.start_from_title : '',
        is_price_range: service.is_price_range ? service.is_price_range : 0,
        max_price: service.max_price ? service.max_price : 0,
        tax: service.tax ? parseInt(service.tax) : 0,
        deposite: service.deposite ? service.deposite : '',
        deposite_type: service.deposite_type ? service.deposite_type : '',
        min_deposite: service.min_deposite ? service.min_deposite : 0,
        status: service.status ? service.status : 0,
        online_status: service.online_status ? service.online_status : 0,
        menu_order: service.menu_order ? service.menu_order : 0,
        price_list_status: service.price_list_status ? service.price_list_status : 0,
        service_type_group_id: service.service_type_group_id ? service.service_type_group_id : ""
    })

    try {
        // Saving the Service 
        var savedService = await newService.save()
        return savedService
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Service")
    }
}

exports.updateService = async function (service) {
    try {
        //Find the old Service Object by the Id
        var id = service._id
        var oldService = await Service.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the Service")
    }

    // If no old Service Object exists return false
    if (!oldService) { return false }

    // Edit the Service Object
    if (service.company_id) {
        oldService.company_id = service.company_id
    }

    if (service.location_id) {
        oldService.location_id = service.location_id
    }

    if (service.master_category_id) {
        oldService.master_category_id = service.master_category_id
    }

    if (service.master_test_id) {
        oldService.master_test_id = service.master_test_id
    }

    if (service.master_service_id) {
        oldService.master_service_id = service.master_service_id
    }

    if (service.category_id) {
        oldService.category_id = service.category_id
    }

    if (service.test_id) {
        oldService.test_id = service.test_id
    }

    if (service.name) {
        oldService.name = service.name
    }

    if (service.duration) {
        oldService.duration = service.duration
    }

    if (service.gender) {
        oldService.gender = service.gender
    }

    if (service.desc || service.desc == "") {
        oldService.desc = service.desc ? service.desc : ""
    }

    if (service.reminder || service.reminder == "") {
        oldService.reminder = service.reminder ? service.reminder : ""
    }

    if (service.online_status || service.online_status == 0) {
        oldService.online_status = service.online_status ? service.online_status : 0
    }

    if (service.status || service.status == 0) {
        oldService.status = service.status ? service.status : 0
    }

    if (service.actual_price || service.actual_price == "" || service.actual_price == 0) {
        oldService.actual_price = service.actual_price ? service.actual_price : 0;
    }

    if (service.special_price || service.actual_price) {
        oldService.price = service.special_price ? service.special_price : service.actual_price;
    }

    if (service.special_price || service.actual_price) {
        oldService.variable_price = service.special_price ? service.special_price : service.actual_price;
    }

    if (service.hide_strike_price || service.hide_strike_price == 0) {
        oldService.hide_strike_price = service.hide_strike_price ? service.hide_strike_price : 0;
    }

    if (service.is_start_from || service.is_start_from == 0) {
        oldService.is_start_from = service.is_start_from ? service.is_start_from : 0;
        oldService.start_from_title = service.start_from_title ? service.start_from_title : '';
    }

    if (service.is_price_range || service.is_price_range == 0) {
        oldService.is_price_range = service.is_price_range ? service.is_price_range : 0;
        oldService.max_price = service.max_price ? service.max_price : 0;
    }

    if (service.deposite || service.deposite == '') {
        oldService.deposite = service.deposite ? service.deposite : ''
    }

    if (service.deposite_type || service.deposite_type == '') {
        oldService.deposite_type = service.deposite_type ? service.deposite_type : ''
    }
    if (service.min_deposite || service.min_deposite == '') {
        oldService.min_deposite = service.min_deposite ? service.min_deposite : 0;
    }

    if (service.special_price || service.special_price == "" || service.special_price == 0) {
        oldService.special_price = service.special_price ? service.special_price : 0
    }

    if (service.commission || service.commission == "" || service.commission == 0) {
        oldService.commission = service.commission ? service.commission : 0
    }

    if (service.tax || service.tax == "" || service.tax == 0) {
        oldService.tax = service.tax ? service.tax : 0
    }

    if (service.menu_order || service.menu_order == "" || service.menu_order == 0) {
        oldService.menu_order = service.menu_order ? service.menu_order : 0
    }

    if (service.price_list_status || service.price_list_status == "" || service.price_list_status == 0) {
        oldService.price_list_status = service.price_list_status ? service.price_list_status : 0
    }

    if (service.service_type_group_id || service.service_type_group_id == "") {
        oldService.service_type_group_id = service.service_type_group_id ? service.service_type_group_id : ""
    }

    try {
        var savedService = await oldService.save()
        return savedService
    } catch (e) {
        console.log(e)
        throw Error("And Error occured while updating the Service")
    }
}

exports.deleteService = async function (id) {
    // Delete the Service
    try {
        var deleted = await Service.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Service Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the Service")
    }
}

exports.deleteMultipleService = async function (ids) {
    // Delete the Service
    try {
        var deleted = await Service.remove({ '_id': { '$in': ids } })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Service Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the Service")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Service.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the Service")
    }
}

// This is only for dropdown
exports.getServicesDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var services = await Service.find(query)
            .select("_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id")
            .sort(sorts)

        return services
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown services')
    }
}

exports.getServiceDisctict = async function (field, query = {}) {
    // Try Catch the awaited promise to handle the error 
    try {
        var service = await Service.distinct(field, query)

        // Return the Service list that was retured by the mongoose promise
        return service || []
    } catch (e) {
        // return a Error message describing the reason 
        return []
    }
}

// This is only for dropdown
exports.getServiceDetail = async function (query = {}) {
    try {
        var service = await Service.findOne(query)
            .select("_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id")

        return service;
    } catch (e) {
        // console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while getting service')
    }
}