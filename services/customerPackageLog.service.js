// Gettign the Newly created Mongoose Model we just created 
var CustomerPackageLog = require('../models/CustomerPackageLog.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the CustomerPackageLog List
exports.getCustomerPackageLogs = async function (query, page, limit, order_name, order, serachText) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        const facetedPipeline = [
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
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

        var CustomerPackageLogs = await CustomerPackageLog.aggregate(facetedPipeline);

        // Return the CustomerPackageLogd list that was retured by the mongoose promise
        return CustomerPackageLogs;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerPackageLogs');
    }
}

exports.getAllCustomerPackageLogs = async function (query, order_name, order) {
    try {
        var sort = {};
        sort[order_name] = order;

        const facetedPipeline = [
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
            { $match: query },
            { $sort: sort },
        ];

        var CustomerPackageLogs = await CustomerPackageLog.aggregate(facetedPipeline);

        // Return the CustomerPackageLogd list that was retured by the mongoose promise
        return CustomerPackageLogs;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerPackageLogs');
    }
}

// getting all CustomerPackageLogs for company copy
exports.getCustomerPackageLogsSpecific = async function (query) {
    try {
        var CustomerPackageLogs = await CustomerPackageLog.aggregate([
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            }, { $match: query }
        ]);

        // Return the Serviced list that was retured by the mongoose promise
        return CustomerPackageLogs;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerPackageLogs');
    }
}

exports.updateManyPackageLogsClient = async function (query, customer_id) {
    try {
        // Find the Data and replace booking status
        var customerPackageLogs = await CustomerPackageLog.updateMany(query, { $set: { customer_id: customer_id } })

        return customerPackageLogs;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerPackageLogs not available");
    }
}

exports.getCustomerPackageLog = async function (id) {
    try {
        // Find the Data 
        var _details = await CustomerPackageLog.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            throw Error("CustomerPackageLog not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerPackageLog not available");
    }
}

exports.createCustomerPackageLog = async function (customerpackage) {
    var newCustomerPackageLog = new CustomerPackageLog({
        location_id: customerpackage.location_id ? customerpackage.location_id : null,
        customer_id: customerpackage.customer_id ? customerpackage.customer_id : null,
        customer_package_id: customerpackage.customer_package_id ? customerpackage.customer_package_id : null,
        package_id: customerpackage.package_id ? customerpackage.package_id : null,
        service_id: customerpackage.service_id?.length ? customerpackage.service_id : null,
        group_services: customerpackage.group_services?.length ? customerpackage.group_services : null,
        name: customerpackage.name ? customerpackage.name : "",
        start_date: customerpackage.start_date ? customerpackage.start_date : "",
        end_date: customerpackage.end_date ? customerpackage.end_date : "",
        retail_price: customerpackage.retail_price ? customerpackage.retail_price : "",
        sold_price: customerpackage.sold_price ? customerpackage.sold_price : "",
        extension: customerpackage.extension ? customerpackage.extension : 0,
        extended_date: customerpackage.extended_date ? customerpackage.extended_date : "",
        extension_charge: customerpackage.extension_charge ? customerpackage.extension_charge : "",
        updated_by: customerpackage.updated_by ? customerpackage.updated_by : null,
    })

    try {
        // Saving the CustomerPackageLog 
        var savedCustomerPackageLog = await newCustomerPackageLog.save();
        return savedCustomerPackageLog;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomerPackageLog")
    }
}

