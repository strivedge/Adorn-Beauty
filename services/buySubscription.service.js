// Gettign the Newly created Mongoose Model we just created 
var BuySubscription = require('../models/BuySubscription.model');
var Subscription = require('../models/Subscription.model');
var Company = require('../models/Company.model');
// Saving the context of this module inside the _the variable
_this = this

// Async function to get the BuySubscription List
exports.getBuySubscriptions = async function (query, page, limit) {

    // Try Catch the awaited promise to handle the error 
    try {

        const facetedPipeline = [
            { $match: query },
            { $sort: { createdAt: -1 } },
            {
                "$facet": {
                    "data": [
                        { "$skip": (page) },
                        { "$limit": limit }
                    ],
                    "pagination": [
                        { "$count": "total" }
                    ]
                }
            },
        ];

        var buySubscriptions = await BuySubscription.aggregate(facetedPipeline);

        if(buySubscriptions && buySubscriptions?.length > 0 && buySubscriptions[0]?.data?.length > 0){

            buySubscriptions[0].data = await BuySubscription.populate(buySubscriptions[0]?.data, {
                path: "company_id",
                model: Company,
                select: {
                    _id: 1,
                    name: 1,
                }
            })
        }

        // Return the BuySubscription list that was retured by the mongoose promise
        return buySubscriptions;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating BuySubscriptions');
    }
}

exports.getBuySubscriptionsOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1);
        var sorts = {};
        if (sort_field) { sorts[sort_field] = sort_type; }

        var buySubscriptions = await BuySubscription.find(query)
            .populate({ path: 'company_id' })
            .populate({ path: 'subscription_id' })
            .populate({ path: 'module_ids' })
            .sort(sorts)
            .skip(skips)
            .limit(limit);

        // Return the BuySubscription list that was retured by the mongoose promise
        return buySubscriptions;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating BuySubscriptions');
    }
}

exports.getBuySubscription = async function (id) {
    try {
        // Find the BuySubscription 
        var _details = await BuySubscription.findOne({ _id: id })
            .populate({ path: 'company_id' })
            .populate({ path: 'subscription_id', model: Subscription })
            .populate({ path: 'module_ids' });
        if (_details._id) {
            return _details;
        } else {
            throw Error("BuySubscription not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("BuySubscription not available");
    }
}

exports.getBuySubscriptionOne = async function (query, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) { sorts[sort_field] = sort_type; }

        // Find the BuySubscription 
        var _details = await BuySubscription.findOne(query)
            .populate({ path: 'company_id' })
            .populate({ path: 'subscription_id', model: Subscription })
            .populate({ path: 'module_ids' })
            .sort(sorts);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        return null
    }
}

exports.getBuySubscriptionCompany = async function (query) {
    try {
        var _details = await BuySubscription.findOne(query).sort({ createdAt: -1 })
            .populate({ path: 'company_id' })
            .populate({ path: 'subscription_id', model: Subscription })
            .populate({ path: 'module_ids' });
        if (_details._id) {
            return _details;
        } else {
            return {};
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("BuySubscription not available");
    }
}

exports.getSubscriptionPackCompany = async function (query) {
    try {
        var _details = await BuySubscription.findOne(query).sort({ createdAt: -1 })
            .populate({ path: 'company_id' })
            .populate({ path: 'subscription_id', model: Subscription })
            .populate({ path: 'module_ids' });

        return _details;
    } catch (e) {
        return {};
    }
}

exports.createBuySubscription = async function (buySubscription) {
    var newBuySubscription = new BuySubscription({
        company_id: buySubscription.company_id ? buySubscription.company_id : null,
        subscription_id: buySubscription.subscription_id ? buySubscription.subscription_id : null,
        module_ids: buySubscription.module_ids?.length ? buySubscription.module_ids : null,
        max_location: buySubscription.max_location ? buySubscription.max_location : 0,
        amount: buySubscription.amount ? buySubscription.amount : 0,
        start_date: buySubscription.start_date ? buySubscription.start_date : null,
        end_date: buySubscription.end_date ? buySubscription.end_date : null,
        type: buySubscription.type ? buySubscription.type : "",
        validity: buySubscription.validity ? buySubscription.validity : "",
        response: buySubscription.response ? buySubscription.response : null,
        status: buySubscription.status ? buySubscription.status : 0
    })

    try {
        // Saving the BuySubscription
        var savedBuySubscription = await newBuySubscription.save();
        return savedBuySubscription;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating BuySubscription")
    }
}

exports.updateBuySubscription = async function (buySubscription) {
    var id = buySubscription._id
    // console.log("Id ",id)
    try {
        //Find the old BuySubscription Object by the Id
        var oldBuySubscription = await BuySubscription.findById(id);
        // console.log('oldBuySubscription ',oldBuySubscription)
    } catch (e) {
        throw Error("Error occured while Finding the BuySubscription")
    }

    // If no old BuySubscription Object exists return false
    if (!oldBuySubscription) { return false; }

    // Edit the BuySubscription Object
    if (buySubscription.company_id) {
        oldBuySubscription.company_id = buySubscription.company_id;
    }

    if (buySubscription.subscription_id) {
        oldBuySubscription.subscription_id = buySubscription.subscription_id;
    }

    if (buySubscription?.module_ids && buySubscription.module_ids?.length) {
        oldBuySubscription.module_ids = buySubscription.module_ids;
    }

    if (buySubscription.max_location || buySubscription.max_location == 0) {
        oldBuySubscription.max_location = buySubscription.max_location ? buySubscription.max_location : 0;
    }

    if (buySubscription.amount || buySubscription.amount == 0) {
        oldBuySubscription.amount = buySubscription.amount ? buySubscription.amount : 0;
    }

    if (buySubscription.start_date) {
        oldBuySubscription.start_date = buySubscription.start_date;
    }

    if (buySubscription.end_date) {
        oldBuySubscription.end_date = buySubscription.end_date;
    }

    if (buySubscription.type) {
        oldBuySubscription.type = buySubscription.type;
    }

    if (buySubscription.validity) {
        oldBuySubscription.validity = buySubscription.validity;
    }

    if (buySubscription.response) {
        oldBuySubscription.response = buySubscription.response;
    }

    if (buySubscription.status || buySubscription.status == 0) {
        oldBuySubscription.status = buySubscription.status ? buySubscription.status : 0;
    }

    try {
        var savedBuySubscription = await oldBuySubscription.save()
        return savedBuySubscription;
    } catch (e) {
        throw Error("And Error occured while updating the BuySubscription");
    }
}

exports.deleteBuySubscription = async function (id) {
    // Delete the BuySubscription
    try {
        var deleted = await BuySubscription.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("BuySubscription Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the BuySubscription")
    }
}

// Update multiple BuySubscriptions
exports.updateMultipleBuySubscriptions = async function (query = {}, update) {
    try {
        return await BuySubscription.updateMany(query, update)
    } catch (e) {
        // return an Error message describing the reason
        throw Error("BuySubscriptions not available")
    }
}