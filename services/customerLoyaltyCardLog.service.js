// Gettign the Newly created Mongoose Model we just created
var CustomerLoyaltyCardLog = require('../models/CustomerLoyaltyCardLog.model')
var Service = require('../models/Service.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the CustomerLoyaltyCardLog List
exports.getCustomerLoyaltyCardLogs = async function (query, page, limit, order_name, order, searchText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        const facetedPipeline = [
            { $match: query },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    loyalty_card_id: 1,
                    customer_loyalty_card_id: 1,
                    appointment_id: 1,
                    customer_id: 1,
                    consume: 1,
                    date: 1,
                    appointment_id: {
                        $toObjectId: "$appointment_id"
                    },

                }
            },
            {
                $lookup:
                {
                    from: 'appointments',
                    localField: 'appointment_id',
                    foreignField: '_id',
                    as: 'app_data'
                },
            },
            { $unwind: "$app_data" },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    loyalty_card_id: 1,
                    customer_loyalty_card_id: 1,
                    appointment_id: 1,
                    customer_id: 1,
                    consume: 1,
                    date: "$app_data.date",
                    booking_id: "$app_data._id",
                    booking_time: "$app_data.start_time",
                }
            },
             { $sort : sort },
            // {
            //    "$facet": {
            //      "data": [
            //        { "$skip": page },
            //        { "$limit": limit }
            //      ],
            //      "pagination": [
            //        { "$count": "total" }
            //      ]
            //    }
            //  }
        ];

        var CustomerLoyaltyCardLogs = await CustomerLoyaltyCardLog.aggregate(facetedPipeline);

        // Return the CustomerLoyaltyCardLogd list that was retured by the mongoose promise
        return CustomerLoyaltyCardLogs;
    } catch (e) {
        // console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerLoyaltyCardLogs');
    }
}

exports.getCustomerLoyaltyCardLogsOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var customerLoyaltyCardLog = await CustomerLoyaltyCardLog.find(query)
            .populate({
                path: 'customer_id',
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    dob: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })
            .populate({
                path: 'appointment_id',
                populate: {
                    path: 'service_id',
                    model: Service,
                    select: {
                        _id: 1,
                        category_id: 1,
                        name: 1,
                        duration: 1,
                        gender: 1,
                        reminder: 1,
                        online_status: 1,
                        price: 1,
                        special_price: 1,
                        commission: 1,
                        tax: 1,
                        service_limit: 1,
                        status: 1
                    }
                }
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return customerLoyaltyCardLog || []
    } catch (e) {
        // return a Error message describing the reason
        throw Error('Error while Paginating CustomerLoyaltyCardLog')
    }
}

exports.getActiveCustomerLoyaltyCardLogs = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerLoyaltyCardLogs = await CustomerLoyaltyCardLog.find(query)
        // Return the CustomerLoyaltyCardLogd list that was retured by the mongoose promise
        return CustomerLoyaltyCardLogs;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomerLoyaltyCardLogs');
    }
}

exports.updateManyPackagesClient = async function (query, customer_id) {
    try {
        // Find the Data and replace booking status
        var CustomerLoyaltyCard = await CustomerLoyaltyCardLog.updateMany(query, { $set: { customer_id: customer_id } })

        return CustomerLoyaltyCard;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerLoyaltyCard not available");
    }
}

exports.getCustomerLoyaltyCardLogCount = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customerLoyaltyCardLog = await CustomerLoyaltyCardLog.aggregate([
            // {
            //     $addFields: {
            //         date: {
            //             $dateToString: {
            //                 format: '%Y-%m-%d',
            //                 date: '$date'
            //             }
            //         }
            //     }
            // },
            { $match: query },
            {
                $project: {
                    _id: 1,
                    customer_id: 1,
                    service_id: 1,
                    cardTotalCount: { $cond: [{ $gt: ['$consume', 0] }, '$consume', 0] }
                }
            },
            {
                $group: {
                    _id: null,
                    SumTotalCount: { $sum: '$cardTotalCount' },
                }
            }
        ])

        var totalCount = 0
        if (customerLoyaltyCardLog && customerLoyaltyCardLog.length > 0) {
            totalCount = customerLoyaltyCardLog[0].SumTotalCount
        }

        //console.log('customerUsagePackageService',customerUsagePackageService)
        //var customerUsagePackageService = await CustomerUsagePackageService.count(query);
        // Return the CustomerUsagePackageService list that was retured by the mongoose promise
        return totalCount
    } catch (e) {
        console.log(e);
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerUsagePackageService');
    }
}


exports.getCustomerLoyaltyCardLogCountForAppointmnet = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customerLoyaltyCardLog = await CustomerLoyaltyCardLog.aggregate([
            { $match: query },
            {
                $project: {
                    _id: 1,
                    customer_id: 1,
                    service_id: 1,
                    cardTotalCount: { $cond: [{ $gt: ['$consume', 0] }, '$consume', 0] }
                }
            },
            {
                $group: {
                    _id: null,
                    SumTotalCount: { $sum: '$cardTotalCount' },
                }
            }
        ])

        var totalCount = 0
        if (customerLoyaltyCardLog && customerLoyaltyCardLog.length > 0) {
            totalCount = customerLoyaltyCardLog[0].SumTotalCount
        }

        //console.log('customerUsagePackageService',customerUsagePackageService)
        //var customerUsagePackageService = await CustomerUsagePackageService.count(query);
        // Return the CustomerUsagePackageService list that was retured by the mongoose promise
        return totalCount
    } catch (e) {
        console.log(e);
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerUsagePackageService');
    }
}

exports.getCustomerLoyaltyCardLog = async function (id) {
    try {
        // Find the Data 
        var _details = await CustomerLoyaltyCardLog.findOne({
            _id: id
        });
        if (_details._id) {
            return _details;
        } else {
            throw Error("CustomerLoyaltyCardLog not available");
        }

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerLoyaltyCardLog not available");
    }
}

// getting all CustomerLoyaltyCardLogs for company copy
exports.getCustomerLoyaltyCardLogsSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerLoyaltyCardLogs = await CustomerLoyaltyCardLog.find(query);

        // Return the Serviced list that was retured by the mongoose promise
        return CustomerLoyaltyCardLogs;
    } catch (e) {
        // console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerLoyaltyCardLog');
    }
}

exports.createCustomerLoyaltyCardLog = async function (customerLoyaltyCardLog) {
    var newCustomerLoyaltyCardLog = new CustomerLoyaltyCardLog({
        company_id: customerLoyaltyCardLog.company_id ? customerLoyaltyCardLog.company_id : null,
        location_id: customerLoyaltyCardLog.location_id ? customerLoyaltyCardLog.location_id : null,
        loyalty_card_id: customerLoyaltyCardLog.loyalty_card_id ? customerLoyaltyCardLog.loyalty_card_id : null,
        customer_loyalty_card_id: customerLoyaltyCardLog.customer_loyalty_card_id ? customerLoyaltyCardLog.customer_loyalty_card_id : null,
        customer_id: customerLoyaltyCardLog.customer_id ? customerLoyaltyCardLog.customer_id : null,
        appointment_id: customerLoyaltyCardLog.appointment_id ? customerLoyaltyCardLog.appointment_id : null,
        date: customerLoyaltyCardLog.date ? customerLoyaltyCardLog.date : "",
        consume: customerLoyaltyCardLog.consume ? customerLoyaltyCardLog.consume : 0,
        createdAt:customerLoyaltyCardLog.createdAt 
    })

    try {
        // Saving the CustomerLoyaltyCardLog 
        var savedCustomerLoyaltyCardLog = await newCustomerLoyaltyCardLog.save();
        return savedCustomerLoyaltyCardLog;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomerLoyaltyCardLog")
    }
}

exports.updateCustomerLoyaltyCardLog = async function (customerLoyaltyCardLog) {
    var id = customerLoyaltyCardLog._id
    try {
        //Find the old CustomerLoyaltyCardLog Object by the Id
        var oldCustomerLoyaltyCardLog = await CustomerLoyaltyCardLog.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the CustomerLoyaltyCardLog")
    }
    // If no old CustomerLoyaltyCardLog Object exists return false
    if (!oldCustomerLoyaltyCardLog) {
        return false;
    }

    //Edit the CustomerLoyaltyCardLog Object

    if (customerLoyaltyCardLog.company_id) {
        oldCustomerLoyaltyCardLog.company_id = customerLoyaltyCardLog.company_id;
    }

    if (customerLoyaltyCardLog.location_id) {
        oldCustomerLoyaltyCardLog.location_id = customerLoyaltyCardLog.location_id;
    }

    if (customerLoyaltyCardLog.loyalty_card_id) {
        oldCustomerLoyaltyCardLog.loyalty_card_id = customerLoyaltyCardLog.loyalty_card_id;
    }

    if (customerLoyaltyCardLog.customer_loyalty_card_id) {
        oldCustomerLoyaltyCardLog.customer_loyalty_card_id = customerLoyaltyCardLog.customer_loyalty_card_id;
    }

    if (customerLoyaltyCardLog.appointment_id) {
        oldCustomerLoyaltyCardLog.appointment_id = customerLoyaltyCardLog.appointment_id;
    }

    if (customerLoyaltyCardLog.customer_id) {
        oldCustomerLoyaltyCardLog.customer_id = customerLoyaltyCardLog.customer_id;
    }

    if (customerLoyaltyCardLog.consume) {
        oldCustomerLoyaltyCardLog.consume = customerLoyaltyCardLog.consume;
    }

    try {
        var savedCustomerLoyaltyCardLog = await oldCustomerLoyaltyCardLog.save()
        return savedCustomerLoyaltyCardLog;
    } catch (e) {
        throw Error("And Error occured while updating the CustomerLoyaltyCardLog");
    }
}

exports.deleteCustomerLoyaltyCardLog = async function (id) {
    // Delete the CustomerLoyaltyCardLog
    try {
        var deleted = await CustomerLoyaltyCardLog.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CustomerLoyaltyCardLog Could not be deleted")
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerLoyaltyCardLog")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await CustomerLoyaltyCardLog.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerLoyaltyCardLog")
    }
}