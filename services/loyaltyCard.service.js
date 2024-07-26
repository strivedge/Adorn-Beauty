// Gettign the Newly created Mongoose Model we just created 
var ObjectId = require('mongodb').ObjectId;

var Service = require('../models/Service.model');
var Category = require('../models/Category.model');
var LoyaltyCard = require('../models/LoyaltyCard.model');

// Saving the context of this module inside the _the variable
_this = this;

// Async function to get the LoyaltyCard List
exports.getLoyaltyCards = async function (query, page, limit, order_name, order) {
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
                    name: 1,
                    desc: 1,
                    category_id: 1,
                    //service_id:1,
                    paid_count: 1,
                    free_count: 1,
                    recurring_count: 1,
                    start_date: 1,
                    end_date: 1,
                    status: 1,
                    online_status: 1,
                    auto_assign: 1,
                    service_id: {
                        $toObjectId: "$service_id"
                    }
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
            { $unwind: "$service_data" },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    name: 1,
                    desc: 1,
                    category_id: 1,
                    service_id: 1,
                    paid_count: 1,
                    free_count: 1,
                    recurring_count: 1,
                    start_date: 1,
                    end_date: 1,
                    status: 1,
                    online_status: 1,
                    auto_assign: 1,
                    service_id: "$service_data",
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

        var LoyaltyCards = await LoyaltyCard.aggregate(facetedPipeline);

        // Return the LoyaltyCard list that was retured by the mongoose promise
        return LoyaltyCards;
    } catch (e) {
        console.log(e);
        // return a Error message describing the reason 
        throw Error('Error while Paginating LoyaltyCards');
    }
}

exports.checkAutoAssignLoyaltyCards = async function (query, customer_id) {
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
                    name: 1,
                    desc: 1,
                    category_id: 1,
                    service_id: 1,
                    paid_count: 1,
                    free_count: 1,
                    recurring_count: 1,
                    start_date: 1,
                    end_date: 1,
                    status: 1,
                    online_status: 1,
                    auto_assign: 1
                }
            }
        ];

        var CustomerLoyaltyCards = await LoyaltyCard.aggregate(facetedPipeline);

        return CustomerLoyaltyCards;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerLoyaltyCard');
    }
}

exports.getActiveLoyaltyCards = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var LoyaltyCards = await LoyaltyCard.find(query);

        // Return the LoyaltyCard list that was retured by the mongoose promise
        return LoyaltyCards;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding LoyaltyCards');
    }
}

exports.getLoyaltyCard = async function (id) {
    try {
        // Find the Data 
        // var _details = await LoyaltyCard.findOne({
        //     _id: id
        // });
        const facetedPipeline = [
            { $match: { _id: ObjectId(id) } },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    name: 1,
                    desc: 1,
                    paid_count: 1,
                    free_count: 1,
                    recurring_count: 1,
                    start_date: 1,
                    end_date: 1,
                    status: 1,
                    online_status: 1,
                    auto_assign: 1,
                    service_id: {
                        $toObjectId: "$service_id"
                    },
                    category_id: {
                        $toObjectId: "$category_id"
                    }
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
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category_data'
                }
            },
            { $unwind: "$service_data" },
            { $unwind: "$category_data" },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    name: 1,
                    desc: 1,
                    category_id: 1,
                    service_id: 1,
                    paid_count: 1,
                    free_count: 1,
                    recurring_count: 1,
                    start_date: 1,
                    end_date: 1,
                    status: 1,
                    online_status: 1,
                    auto_assign: 1,
                    service_name: "$service_data.name",
                    category_name: "$category_data.name",
                }
            }
        ];

        var loyaltyCards = await LoyaltyCard.aggregate(facetedPipeline);

        if (loyaltyCards && loyaltyCards?.length > 0) {
            return loyaltyCards[0];
        } else {
            throw Error("LoyaltyCard not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("LoyaltyCard not available");
    }
}

exports.getLoyaltyCardOne = async function (query = {}) {
    try {
        var loyaltyCard = await LoyaltyCard.findOne(query)
            .populate({
                path: 'category_id',
                model: Category,
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'service_id',
                model: Service,
                select: {
                    _id: 1,
                    name: 1,
                    duration: 1,
                    gender: 1,
                    price: 1,
                    special_price: 1,
                    commission: 1,
                    tax: 1,
                    service_limit: 1
                }
            });

        return loyaltyCard || null;
    } catch (e) {
        // return a Error message describing the reason
        return null;
        // throw Error("LoyaltyCard not available");
    }
}

exports.getLoyaltyCardSimple = async function (query = {}) {
    try {
        var loyaltyCard = await LoyaltyCard.findOne(query);

        return loyaltyCard || null;
    } catch (e) {
        // return a Error message describing the reason
        return null;
        // throw Error("LoyaltyCard not available");
    }
}

exports.getLoyaltyCardsOne = async function (query = {}) {
    try {
        var loyaltyCard = await LoyaltyCard.find(query)
            .populate({
                path: 'category_id',
                model: Category,
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
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
            });

        return loyaltyCard || [];
    } catch (e) {
        // return a Error message describing the reason
        return [];
        // throw Error("LoyaltyCard not available");
    }
}

exports.getLoyaltyCardsSimple = async function (query = {}) {
    try {
        var loyaltyCard = await LoyaltyCard.find(query);

        return loyaltyCard || [];
    } catch (e) {
        // return a Error message describing the reason
        return [];
        // throw Error("LoyaltyCard not available");
    }
}

// getting all LoyaltyCards for company copy
exports.getLoyaltyCardsSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var LoyaltyCards = await LoyaltyCard.find(query);

        // Return the Serviced list that was retured by the mongoose promise
        return LoyaltyCards;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating LoyaltyCard');
    }
}

exports.createLoyaltyCard = async function (loyaltyCard) {
    var newLoyaltyCard = new LoyaltyCard({
        company_id: loyaltyCard.company_id ? loyaltyCard.company_id : "",
        location_id: loyaltyCard.location_id ? loyaltyCard.location_id : "",
        category_id: loyaltyCard.category_id ? loyaltyCard.category_id : "",
        service_id: loyaltyCard.service_id ? loyaltyCard.service_id : "",
        name: loyaltyCard.name ? loyaltyCard.name : "",
        desc: loyaltyCard.desc ? loyaltyCard.desc : "",
        paid_count: loyaltyCard.paid_count ? loyaltyCard.paid_count : 0,
        free_count: loyaltyCard.free_count ? loyaltyCard.free_count : 0,
        recurring_count: loyaltyCard.recurring_count ? loyaltyCard.recurring_count : 0,
        start_date: loyaltyCard.start_date ? loyaltyCard.start_date : "",
        end_date: loyaltyCard.end_date ? loyaltyCard.end_date : "",
        online_status: loyaltyCard.online_status ? loyaltyCard.online_status : 0,
        auto_assign: loyaltyCard.auto_assign ? loyaltyCard.auto_assign : 0,
        status: loyaltyCard.status ? loyaltyCard.status : 0
    })

    try {
        // Saving the LoyaltyCard 
        var savedLoyaltyCard = await newLoyaltyCard.save();
        return savedLoyaltyCard;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating LoyaltyCard");
    }
}

exports.updateLoyaltyCard = async function (loyaltyCard) {
    var id = loyaltyCard._id;
    try {
        // Find the old LoyaltyCard Object by the Id
        var oldLoyaltyCard = await LoyaltyCard.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the LoyaltyCard")
    }

    // If no old LoyaltyCard Object exists return false
    if (!oldLoyaltyCard) { return false; }

    // Edit the LoyaltyCard Object
    if (loyaltyCard.company_id) {
        oldLoyaltyCard.company_id = loyaltyCard.company_id;
    }

    if (loyaltyCard.location_id) {
        oldLoyaltyCard.location_id = loyaltyCard.location_id;
    }

    if (loyaltyCard.category_id) {
        oldLoyaltyCard.category_id = loyaltyCard.category_id;
    }

    if (loyaltyCard.service_id) {
        oldLoyaltyCard.service_id = loyaltyCard.service_id;
    }

    if (loyaltyCard.name) {
        oldLoyaltyCard.name = loyaltyCard.name;
    }

    if (loyaltyCard?.desc || loyaltyCard.desc == "") {
        oldLoyaltyCard.desc = loyaltyCard.desc ? loyaltyCard.desc : "";
    }

    if (loyaltyCard.start_date) {
        oldLoyaltyCard.start_date = loyaltyCard.start_date;
    }

    if (loyaltyCard.end_date) {
        oldLoyaltyCard.end_date = loyaltyCard.end_date;
    }

    if (loyaltyCard?.paid_count || loyaltyCard.paid_count == 0) {
        oldLoyaltyCard.paid_count = loyaltyCard.paid_count ? loyaltyCard.paid_count : 0;
    }

    if (loyaltyCard?.free_count || loyaltyCard.free_count == 0) {
        oldLoyaltyCard.free_count = loyaltyCard.free_count ? loyaltyCard.free_count : 0;
    }

    if (loyaltyCard?.recurring_count || loyaltyCard.recurring_count == 0) {
        oldLoyaltyCard.recurring_count = loyaltyCard.recurring_count ? loyaltyCard.recurring_count : 0;
    }

    if (loyaltyCard?.online_status || loyaltyCard.online_status == 0) {
        oldLoyaltyCard.online_status = loyaltyCard.online_status ? loyaltyCard.online_status : 0;
    }

    if (loyaltyCard?.auto_assign || loyaltyCard.auto_assign == 0) {
        oldLoyaltyCard.auto_assign = loyaltyCard.auto_assign ? loyaltyCard.auto_assign : 0;
    }

    if (loyaltyCard?.status || loyaltyCard.status == 0) {
        oldLoyaltyCard.status = loyaltyCard.status ? loyaltyCard.status : 0;
    }

    try {
        var savedLoyaltyCard = await oldLoyaltyCard.save();
        return savedLoyaltyCard;
    } catch (e) {
        throw Error("And Error occured while updating the LoyaltyCard");
    }
}

exports.deleteLoyaltyCard = async function (id) {
    // Delete the LoyaltyCard
    try {
        var deleted = await LoyaltyCard.remove({ _id: id });
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("LoyaltyCard Could not be deleted");
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the LoyaltyCard");
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await LoyaltyCard.remove(query);

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the LoyaltyCard");
    }
}

// This is only for dropdown
exports.getLoyaltyCardsDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var loyaltyCards = await LoyaltyCard.find(query)
            .sort(sorts);

        return loyaltyCards;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown loyaltyCards');
    }
}

exports.getLoyaltyCardsIds = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var loyaltyCards = await LoyaltyCard.find(query)
            .select("_id")
            .sort(sorts);

        if (loyaltyCards && loyaltyCards.length) {
            loyaltyCards = loyaltyCards.map((x) => x?._id?.toString() || "");
        }

        return loyaltyCards || [];
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown loyaltyCards');
    }
}
