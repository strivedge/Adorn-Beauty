// Gettign the Newly created Mongoose Model we just created 
var AppliedDiscount = require('../models/AppliedDiscount.model');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the AppliedDiscounts List
exports.getAppliedDiscounts = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var appliedDiscounts = await AppliedDiscount.paginate(query, options)
        // Return the AppliedDiscounts list that was retured by the mongoose promise
        return appliedDiscounts;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating AppliedDiscounts');
    }
}

exports.getAppliedDiscount = async function (id) {
    try {
        // Find the AppliedDiscount 
        var _details = await AppliedDiscount.findOne({
            _id: id
        });
        if(_details._id) {
            return _details;
        } else {
            throw Error("AppliedDiscount not available");
        }
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("AppliedDiscount not available");
    }
}

// for per user occurances
exports.getAppliedDiscountSpecific = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // console.log('query ',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var appliedDiscount = await AppliedDiscount.find(query);
        // Return the AppliedDiscount list that was retured by the mongoose promise
        return appliedDiscount;

    } catch (e) {
        // console.log('e ',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating AppliedDiscount');
    }
}

// for max occurences coupon
exports.getAppliedCouponSpecific = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // console.log('query ',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var appliedDiscount = await AppliedDiscount.find(query);
        // Return the AppliedDiscount list that was retured by the mongoose promise
        return appliedDiscount;

    } catch (e) {
        // console.log('e ',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating AppliedDiscount');
    }
}

exports.updateManyDiscountClient = async function (query,customer_id) {
    try {
        // Find the Data and replace booking status
        var customerpackages = await AppliedDiscount.updateMany(query, {$set: {user_id: customer_id}})

        return customerpackages;
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("customerpackages not available");
    }

}

exports.addOrUpdateData = async function (query,update) {
    try {
        const options = { upsert: true };
        var appliedDiscount = await AppliedDiscount.updateOne(query, update, options)

        return appliedDiscount;

    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Appointment not available");
    }

}

exports.createAppliedDiscount = async function (appliedDiscount) {
    var newAppliedDiscount = new AppliedDiscount({
        appointment_id: appliedDiscount.appointment_id ? appliedDiscount.appointment_id : "",
        user_id: appliedDiscount.user_id ? appliedDiscount.user_id : "",
        location_id: appliedDiscount.location_id ? appliedDiscount.location_id : "",
        discount_id: appliedDiscount.discount_id ? appliedDiscount.discount_id : "",
        discount_code: appliedDiscount.discount_code ? appliedDiscount.discount_code : "",
    })

    try {
        // Saving the AppliedDiscount 
        var savedAppliedDiscount = await newAppliedDiscount.save();
        return savedAppliedDiscount;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating AppliedDiscount")
    }
}

exports.updateAppliedDiscount = async function (appliedDiscount) {
    var id = appliedDiscount._id
    try {
        //Find the old AppliedDiscount Object by the Id
        var oldAppliedDiscount = await AppliedDiscount.findById(id);
        // console.log('oldAppliedDiscount ',oldAppliedDiscount)
    } catch (e) {
        throw Error("Error occured while Finding the AppliedDiscount")
    }
    // If no old AppliedDiscount Object exists return false
    if (!oldAppliedDiscount) {
        return false;
    }

    //Edit the AppliedDiscount Object
    if(appliedDiscount.appointment_id) {
        oldAppliedDiscount.appointment_id = appliedDiscount.appointment_id;
    }

    if(appliedDiscount.user_id) {
        oldAppliedDiscount.user_id = appliedDiscount.user_id;
    }

    if(appliedDiscount.location_id) {
        oldAppliedDiscount.location_id = appliedDiscount.location_id;
    }

    if(appliedDiscount.discount_id) {
        oldAppliedDiscount.discount_id = appliedDiscount.discount_id;
    }

    if(appliedDiscount.discount_code) {
        oldAppliedDiscount.discount_code = appliedDiscount.discount_code;
    }

    try {
        var savedAppliedDiscount = await oldAppliedDiscount.save()
        return savedAppliedDiscount;
    } catch (e) {
        throw Error("And Error occured while updating the AppliedDiscount");
    }
}

exports.deleteAppliedDiscount = async function (id) {
    // Delete the AppliedDiscount
    try {
        var deleted = await AppliedDiscount.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("AppliedDiscount Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the AppliedDiscount")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await AppliedDiscount.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the AppliedDiscount")
    }
}