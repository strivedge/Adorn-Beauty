// Gettign the Newly created Mongoose Model we just created 
var Subscription = require('../models/Subscription.model');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Subscription List
exports.getSubscriptions = async function (query, page, limit, order_name, order, searchText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        // if(searchText && searchText != '') {
        //     query['$text'] = { $search: searchText, $language:'en',$caseSensitive:false};
        // }

        const facetedPipeline = [
         { $match: query },
         { $sort : sort },
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

        var subscriptions = await Subscription.aggregate(facetedPipeline);
        // Return the Categoryd list that was retured by the mongoose promise
        return subscriptions;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Subscriptions');
    }
}

exports.getSubscription = async function (id) {
    try {
        // Find the Data 
        var _details = await Subscription.findOne({
            _id: id
        });
        if(_details._id) {
            return _details;
        } else {
            throw Error("Subscription not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Subscription not available");
    }
}

exports.getSubscriptionsPlan = async function  (query) {
    try {
        var subscriptions = await Subscription.find(query);
        // Return the Categoryd list that was retured by the mongoose promise
        return subscriptions;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding Subscriptions');
    }
}

exports.createSubscription = async function (subscription) {
    var newSubscription = new Subscription({
        name: subscription.name ? subscription.name : "",
        module: subscription.module ? subscription.module : [],
        check_all: subscription.check_all ? subscription.check_all : false,
        max_location: subscription.max_location ? subscription.max_location : 0,
        price: subscription.price ? subscription.price : 0,
        validity: subscription.validity ? subscription.validity : "",
        status: subscription.status ? subscription.status : 0,
        online_status: subscription.online_status ? subscription.online_status : 0,
    })

    try {
        // Saving the Subscription
        var savedSubscription = await newSubscription.save();
        return savedSubscription;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Subscription")
    }
}

exports.updateSubscription = async function (subscription) {
    var id = subscription._id
    try {
        //Find the old Subscription Object by the Id
        var oldSubscription = await Subscription.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Subscription")
    }
    // If no old Subscription Object exists return false
    if (!oldSubscription) {
        return false;
    }

    //Edit the Subscription Object
    if(subscription.name) {
        oldSubscription.name = subscription.name;
    }

    if(subscription.module) {
        oldSubscription.module = subscription.module;
    }

    if(subscription.validity) {
        oldSubscription.validity = subscription.validity;
    }

    oldSubscription.check_all = subscription.check_all ? subscription.check_all : false;
    oldSubscription.max_location = subscription.max_location ? subscription.max_location : 0;
    oldSubscription.price = subscription.price ? subscription.price : 0;
    oldSubscription.status = subscription.status ? subscription.status : 0;
    oldSubscription.online_status = subscription.online_status ? subscription.online_status : 0;

    try {
        var savedSubscription = await oldSubscription.save()
        return savedSubscription;
    } catch (e) {
        throw Error("And Error occured while updating the Subscription");
    }
}

exports.deleteSubscription = async function (id) {
    // Delete the Subscription
    try {
        var deleted = await Subscription.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Subscription Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Subscription")
    }
}