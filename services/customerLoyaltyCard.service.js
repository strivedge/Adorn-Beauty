// Gettign the Newly created Mongoose Model we just created 
var Customer = require('../models/Customer.model');
var CustomerLoyaltyCard = require('../models/CustomerLoyaltyCard.model');
var Location = require('../models/Location.model');
var LoyaltyCard = require('../models/LoyaltyCard.model');

var ImageService = require('./image.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async function to get the CustomerLoyaltyCard List
exports.getCustomerLoyaltyCards = async function (query, page, limit, order_name, order) {
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
                    customer_id: 1,
                    loyalty_card_id: 1,
                    category_id: 1,
                    service_id: 1,
                    name: 1,
                    customer_signature: 1,
                    start_date: 1,
                    end_date: 1,
                    comment: 1,
                    loyalty_card_data: 1,
                    status: 1,
                    customer_id: {
                        $toObjectId: "$customer_id"
                    },
                    loyalty_card_id: {
                        $toObjectId: "$loyalty_card_id"
                    },
                    category_id: {
                        $toObjectId: "$category_id"
                    },
                    service_id: {
                        $toObjectId: "$service_id"
                    }
                }
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customer_id',
                    foreignField: '_id',
                    as: 'cust_data'
                }
            },
            // {
            //     $lookup: {
            //         from: 'loyaltycards',
            //         localField: 'loyalty_card_id',
            //         foreignField: '_id',
            //         as: 'loyalty_card_data'
            //     }
            // },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category_data'
                }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'service_id',
                    foreignField: '_id',
                    as: 'service_data'
                }
            },
            { $unwind: "$cust_data" },
            { $unwind: "$category_data" },
            { $unwind: "$service_data" },
            // { $unwind: "$loyalty_card_data" },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    customer_id: 1,
                    loyalty_card_id: 1,
                    category_id: 1,
                    service_id: 1,
                    name: 1,
                    customer_signature: 1,
                    start_date: 1,
                    end_date: 1,
                    comment: 1,
                    loyalty_card_data: 1,
                    status: 1,
                    customer_name: "$cust_data.name",
                    category_name: "$category_data.name",
                    service_name: "$service_data.name",
                    // loyalty_card_data: "$loyalty_card_data"
                }
            },
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

        var CustomerLoyaltyCards = await CustomerLoyaltyCard.aggregate(facetedPipeline);

        // Return the CustomerLoyaltyCardd list that was retured by the mongoose promise
        return CustomerLoyaltyCards;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerLoyaltyCards');
    }
}

exports.getCustomerLoyaltyCardsCount = async function (query = {}) {
    try {
        var customerLoyaltyCards = await CustomerLoyaltyCard.find(query).count();

        return customerLoyaltyCards || 0;
    } catch (e) {
        throw Error('Error while Counting CustomerLoyaltyCards');
    }
}

exports.getCustomerLoyaltyCardList = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1);
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var customerLoyaltyCards = await CustomerLoyaltyCard.find(query)
            .populate({
                path: 'category_id',
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'service_id',
                select: {
                     _id:1,
                    service_limit: 1,
                    name:1,
                    price:1,
                    actual_price:1,
                    variable_price:1,
                    special_price:1,
                    hide_strike_price: 1, 
                    deposite_type: 1, 
                    deposite: 1, 
                    min_deposite: 1, 
                    is_start_from: 1, 
                    start_from_title: 1, 
                    is_price_range: 1, 
                    max_price: 1, 
                    commission:1,
                    tax:1,
                    duration:1,
                    category_id:1,
                    gender:1,
                    reminder: 1,
                    online_status:1,
                    status:1,
                    test_id:1,
                    old_price:1
                }
            })
            .populate({
                path: 'customer_id',
                model: Customer,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })
            .populate({
                path: 'loyalty_card_id',
                model: LoyaltyCard
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit);

        return customerLoyaltyCards || [];
    } catch (e) {
        throw Error('Error while Counting CustomerLoyaltyCards');
    }
}

exports.updateManyLoyaltyCardClient = async function (query, customer_id) {
    try {
        // Find the Data and replace booking status
        var customerLoyaltyCard = await CustomerLoyaltyCard.updateMany(query, {
            $set: { customer_id: customer_id }
        });

        return customerLoyaltyCard;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerLoyaltyCard not available");
    }
}

exports.getActiveCustomerLoyaltyCards = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerLoyaltyCards = await CustomerLoyaltyCard.find(query);

        // Return the CustomerLoyaltyCardd list that was retured by the mongoose promise
        return CustomerLoyaltyCards;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomerLoyaltyCards');
    }
}

exports.getCustomerLoyaltyCard = async function (id) {
    try {
        // Find the Data 
        var _details = await CustomerLoyaltyCard.findOne({ _id: id });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason    
        throw Error("CustomerLoyaltyCard not available");
    }
}

exports.getCustomerLoyaltyCardsOne = async function (query = {}) {
    try {
        // Find the Data 
        var customerLoyaltyCards = await CustomerLoyaltyCard.find(query)
            .populate({
                path: 'location_id',
                model: Location,
                select: {
                    _id: 1,
                    company_id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'category_id',
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'service_id',
                select: {
                    _id: 1,
                     _id:1,
                    service_limit: 1,
                    name:1,
                    price:1,
                    actual_price:1,
                    variable_price:1,
                    special_price:1,
                    hide_strike_price: 1, 
                    deposite_type: 1, 
                    deposite: 1, 
                    min_deposite: 1, 
                    is_start_from: 1, 
                    start_from_title: 1, 
                    is_price_range: 1, 
                    max_price: 1, 
                    commission:1,
                    tax:1,
                    duration:1,
                    category_id:1,
                    gender:1,
                    reminder: 1,
                    online_status:1,
                    status:1,
                    test_id:1,
                    old_price:1
                }
            })
            .populate({
                path: 'customer_id',
                model: Customer,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })
            .populate({
                path: 'loyalty_card_id',
                model: LoyaltyCard
            });

        return customerLoyaltyCards || [];
    } catch (e) {
        // console.log("getCustomerLoyaltyCardsOne Error >>> ", e);
        // return a Error message describing the reason     
        throw Error("CustomerLoyaltyCard not available");
    }
}

exports.getCustomerLoyaltyCardsSimple = async function (query = {}) {
    try {
        // Find the Data 
        var customerLoyaltyCards = await CustomerLoyaltyCard.find(query);

        return customerLoyaltyCards || [];
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerLoyaltyCard not available");
    }
}

exports.getCustomerLoyaltyCardOne = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await CustomerLoyaltyCard.findOne(query)
            .populate({
                path: 'location_id',
                model: Location,
                select: {
                    _id: 1,
                    company_id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'category_id',
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'service_id',
                select: {
                    _id:1,
                    service_limit: 1,
                    name:1,
                    price:1,
                    actual_price:1,
                    variable_price:1,
                    special_price:1,
                    hide_strike_price: 1, 
                    deposite_type: 1, 
                    deposite: 1, 
                    min_deposite: 1, 
                    is_start_from: 1, 
                    start_from_title: 1, 
                    is_price_range: 1, 
                    max_price: 1, 
                    commission:1,
                    tax:1,
                    duration:1,
                    category_id:1,
                    gender:1,
                    reminder: 1,
                    online_status:1,
                    status:1,
                    test_id:1,
                    old_price:1
                }
            })
            .populate({
                path: 'loyalty_card_id',
                model: LoyaltyCard
            })
            .populate({
                path: 'customer_id',
                model: Customer,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            });

        return _details || null;
    } catch (e) {
        console.log(e);
        // return a Error message describing the reason     
        throw Error("CustomerLoyaltyCard not available");
    }
}

// getting all CustomerLoyaltyCards for company copy
exports.getCustomerLoyaltyCardsSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerLoyaltyCards = await CustomerLoyaltyCard.find(query);

        // Return the Serviced list that was retured by the mongoose promise
        return CustomerLoyaltyCards;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerLoyaltyCard');
    }
}

exports.getCustomerLoyaltyCardCount = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerLoyaltyCards = await CustomerLoyaltyCard.find(query).count();

        // Return the Serviced list that was retured by the mongoose promise
        return CustomerLoyaltyCards;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerLoyaltyCard');
    }
}

exports.checkCustomerLoyaltyCards = async function (query, services) {
    // Try Catch the awaited promise to handle the error 
    try {
        const facetedPipeline = [
            {
                $addFields: {
                    start_date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$start_date'
                        }
                    },
                    end_date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$end_date'
                        }
                    }
                }
            },
            { $match: query },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    customer_id: 1,
                    loyalty_card_id: 1,
                    category_id: 1,
                    service_id: 1,
                    name: 1,
                    customer_signature: 1,
                    start_date: 1,
                    end_date: 1,
                    comment: 1,
                    status: 1,
                    loyalty_card_data: 1,
                    // loyalty_card_id: {
                    //     $toObjectId: "$loyalty_card_id"
                    // },
                    category_id: {
                        $toObjectId: "$category_id"
                    },
                    service_id: {
                        $toObjectId: "$service_id"
                    }
                }
            },
            // {
            //     $lookup: {
            //         from: 'loyaltycards',
            //         localField: 'loyalty_card_id',
            //         foreignField: '_id',
            //         as: 'loyalty_card_data_ref'
            //     }
            // },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category_data'
                }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'service_id',
                    foreignField: '_id',
                    as: 'service_data'
                }
            },
            // { $unwind: "$loyalty_card_data" },
            { $unwind: "$category_data" },
            { $unwind: "$service_data" },
            // { "$match": { "loyalty_card_data.service_id": { $in: services } } },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    loyalty_card_id: 1,
                    customer_id: 1,
                    name: 1,
                    customer_signature: 1,
                    start_date: 1,
                    end_date: 1,
                    comment: 1,
                    status: 1,
                    is_stamp: "",
                    is_free_service: "",
                    category_id: "$category_data",
                    service_id: "$service_data",
                    loyalty_card_data: "$loyalty_card_data",
                    loyalty_status: "$loyalty_card_data.status",
                    online_status: "$loyalty_card_data.online_status"
                }
            }
        ];

        var customerLoyaltyCards = await CustomerLoyaltyCard.aggregate(facetedPipeline);

        return customerLoyaltyCards;
    } catch (e) {
        console.log('e', e);
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerLoyaltyCard');
    }
}

exports.createCustomerLoyaltyCard = async function (customerLoyaltyCard) {
    if (customerLoyaltyCard.customer_signature) {
        var isImage = await ImageService.saveImage(customerLoyaltyCard.customer_signature, "/images/signatures/customers/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            customerLoyaltyCard.customer_signature = isImage;
        }
    }

    var newCustomerLoyaltyCard = new CustomerLoyaltyCard({
        company_id: customerLoyaltyCard.company_id ? customerLoyaltyCard.company_id : null,
        location_id: customerLoyaltyCard.location_id ? customerLoyaltyCard.location_id : null,
        customer_id: customerLoyaltyCard.customer_id ? customerLoyaltyCard.customer_id : null,
        loyalty_card_id: customerLoyaltyCard.loyalty_card_id ? customerLoyaltyCard.loyalty_card_id : null,
        category_id: customerLoyaltyCard.category_id ? customerLoyaltyCard.category_id : null,
        service_id: customerLoyaltyCard.service_id ? customerLoyaltyCard.service_id : null,
        name: customerLoyaltyCard.name ? customerLoyaltyCard.name : "",
        customer_signature: customerLoyaltyCard.customer_signature ? customerLoyaltyCard.customer_signature : "",
        start_date: customerLoyaltyCard.start_date ? customerLoyaltyCard.start_date : "",
        end_date: customerLoyaltyCard.end_date ? customerLoyaltyCard.end_date : "",
        comment: customerLoyaltyCard.comment ? customerLoyaltyCard.comment : "",
        loyalty_card_data: customerLoyaltyCard.loyalty_card_data ? customerLoyaltyCard.loyalty_card_data : null,
        status: customerLoyaltyCard.status ? customerLoyaltyCard.status : 0
    })

    try {
        // Saving the CustomerLoyaltyCard 
        var savedCustomerLoyaltyCard = await newCustomerLoyaltyCard.save();
        return savedCustomerLoyaltyCard;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomerLoyaltyCard");
    }
}

exports.updateCustomerLoyaltyCard = async function (customerLoyaltyCard) {
    var id = customerLoyaltyCard._id;
    try {
        //Find the old CustomerLoyaltyCard Object by the Id
        var oldCustomerLoyaltyCard = await CustomerLoyaltyCard.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the CustomerLoyaltyCard");
    }

    // If no old CustomerLoyaltyCard Object exists return false
    if (!oldCustomerLoyaltyCard) { return false; }

    // Edit the CustomerLoyaltyCard Object
    if (customerLoyaltyCard.company_id) {
        oldCustomerLoyaltyCard.company_id = customerLoyaltyCard.company_id;
    }

    if (customerLoyaltyCard.location_id) {
        oldCustomerLoyaltyCard.location_id = customerLoyaltyCard.location_id;
    }

    if (customerLoyaltyCard.customer_id) {
        oldCustomerLoyaltyCard.customer_id = customerLoyaltyCard.customer_id;
    }

    if (customerLoyaltyCard.loyalty_card_id) {
        oldCustomerLoyaltyCard.loyalty_card_id = customerLoyaltyCard.loyalty_card_id;
    }

    if (customerLoyaltyCard.category_id) {
        oldCustomerLoyaltyCard.category_id = customerLoyaltyCard.category_id;
    }

    if (customerLoyaltyCard.service_id) {
        oldCustomerLoyaltyCard.service_id = customerLoyaltyCard.service_id;
    }

    if (customerLoyaltyCard.name) {
        oldCustomerLoyaltyCard.name = customerLoyaltyCard.name;
    }

    // if (customerLoyaltyCard.customer_signature) {
    //     oldCustomerLoyaltyCard.customer_signature = customerLoyaltyCard.customer_signature;
    // }

    if (customerLoyaltyCard.start_date) {
        oldCustomerLoyaltyCard.start_date = customerLoyaltyCard.start_date;
    }

    if (customerLoyaltyCard.end_date) {
        oldCustomerLoyaltyCard.end_date = customerLoyaltyCard.end_date;
    }

    if (customerLoyaltyCard?.comment || customerLoyaltyCard.comment == "") {
        oldCustomerLoyaltyCard.comment = customerLoyaltyCard.comment ? customerLoyaltyCard.comment : "";
    }

    if (customerLoyaltyCard?.loyalty_card_data) {
        oldCustomerLoyaltyCard.loyalty_card_data = customerLoyaltyCard.loyalty_card_data;
    }

    if (customerLoyaltyCard?.status || customerLoyaltyCard.status == 0) {
        oldCustomerLoyaltyCard.status = customerLoyaltyCard.status ? customerLoyaltyCard.status : 0;
    }

    if (customerLoyaltyCard?.customer_signature) {
        var isImage = await ImageService.saveImage(customerLoyaltyCard.customer_signature, "/images/signatures/customers/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            //console.log("\n signatures customers Info >>>>>>",isImage,"\n");
            //Remove Previous App Logo 
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldCustomerLoyaltyCard.customer_signature;
                if (oldCustomerLoyaltyCard.customer_signature && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                // console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n");
            }

            //Update customer_signature
            oldCustomerLoyaltyCard.customer_signature = isImage;
        }
    }

    try {
        var savedCustomerLoyaltyCard = await oldCustomerLoyaltyCard.save()
        return savedCustomerLoyaltyCard;
    } catch (e) {
        throw Error("And Error occured while updating the CustomerLoyaltyCard");
    }
}

exports.deleteCustomerLoyaltyCard = async function (id) {
    // Delete the CustomerLoyaltyCard
    try {
        var deleted = await CustomerLoyaltyCard.remove({ _id: id });
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CustomerLoyaltyCard Could not be deleted");
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerLoyaltyCard");
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await CustomerLoyaltyCard.remove(query);

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerLoyaltyCard");
    }
}

// This is only for dropdown
exports.getCustomerLoyaltyCardsDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var customerLoyaltyCards = await CustomerLoyaltyCard.find(query)
            .populate({
                path: 'loyalty_card_id',
                model: LoyaltyCard
            })
            .sort(sorts);

        return customerLoyaltyCards;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown customerLoyaltyCards');
    }
}
