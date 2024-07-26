// Gettign the Newly created Mongoose Model we just created 
var UserDeviceToken = require('../models/UserDeviceToken.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the UserDeviceToken List
exports.getUserDeviceTokens = async function (query, page, limit,order_name,order,searchText) {
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
        
        var UserDeviceTokens = await UserDeviceToken.aggregate(facetedPipeline);
        // Return the UserDeviceTokend list that was retured by the mongoose promise
        return UserDeviceTokens;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating UserDeviceTokens');
    }
}
exports.getUserDeviceToken = async function (id) {
    try {
        // Find the Data 
        var _details = await UserDeviceToken.findOne({
            _id: id
        });
        if(_details._id) {
            return _details;
        } else {
            return {};
        }
        
    } catch (e) {
        return {};
        // return a Error message describing the reason     
        //throw Error("UserDeviceToken not available");
    }
}

// getting all UserDeviceTokens for company copy
exports.getUserDeviceTokenSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var UserDeviceTokens = await UserDeviceToken.find(query);
        // Return the Serviced list that was retured by the mongoose promise
        return UserDeviceTokens;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating UserDeviceToken');
    }
}


exports.getUserCurrentDeviceToken= async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var UserDeviceTokens = await UserDeviceToken.findOne(query);
        // Return the UserDeviceTokens list that was retured by the mongoose promise
        return UserDeviceTokens;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating UserDeviceToken');
    }
}

exports.getActiveUserDeviceTokens = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var UserDeviceTokens = await UserDeviceToken.find(query, { _id: 0 });
        // Return the Categoryd list that was retured by the mongoose promise
        return UserDeviceTokens;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Categories');
    }
}


exports.createUserDeviceToken = async function (userDeviceToken) {
    var newUserDeviceToken = new UserDeviceToken({
        user_id: userDeviceToken.user_id ? userDeviceToken.user_id : null,
        device_type: userDeviceToken.device_type ? userDeviceToken.device_type : null,
        device_token: userDeviceToken.device_token ? userDeviceToken.device_token : "",
        app_type: userDeviceToken.app_type ? userDeviceToken.app_type : "",
        status: userDeviceToken.status ? userDeviceToken.status : 0  
    })

    try {
        // Saving the UserDeviceToken 
        var savedUserDeviceToken = await newUserDeviceToken.save();
        return savedUserDeviceToken;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating UserDeviceToken")
    }
}

exports.updateUserDeviceToken = async function (userDeviceToken) {
    var id = userDeviceToken._id
    try {
        //Find the old UserDeviceToken Object by the Id
        var oldUserDeviceToken = await UserDeviceToken.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the UserDeviceToken")
    }
    // If no old UserDeviceToken Object exists return false
    if (!oldUserDeviceToken) {
        return false;
    }

    //Edit the UserDeviceToken Object
    if(userDeviceToken.user_id) {
        oldUserDeviceToken.user_id = UserDeviceToken.user_id;
    }
    if(userDeviceToken.device_type) {
        oldUserDeviceToken.device_type = userDeviceToken.device_type;
    }
    if(userDeviceToken.device_token) {
        oldUserDeviceToken.device_token = userDeviceToken.device_token
    }
    if(userDeviceToken.app_type) {
        oldUserDeviceToken.app_type = userDeviceToken.app_type
    }
    if(userDeviceToken.status == 1 || userDeviceToken.status == 0) {
        oldUserDeviceToken.status = userDeviceToken.status
    }

    try {
        var savedUserDeviceToken = await oldUserDeviceToken.save()
        return savedUserDeviceToken;
    } catch (e) {
        throw Error("And Error occured while updating the UserDeviceToken");
    }
}


exports.inactiveMultipleStatus = async function (query) {
    try {
        var UserDeviceTokens = await UserDeviceToken.updateMany(query, { $set: { status: 0 } })

        return UserDeviceTokens;

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Appointment not available");
    }

}

exports.addOrUpdateData = async function (query,update) {
    try {
        const options = { upsert: true };
        var UserDeviceTokens = await UserDeviceToken.updateOne(query, update, options)

        return UserDeviceTokens;

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Appointment not available");
    }

}

exports.deleteUserDeviceToken = async function (id) {
    // Delete the UserDeviceToken
    try {
        var deleted = await UserDeviceToken.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("UserDeviceToken Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the UserDeviceToken")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await UserDeviceToken.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the UserDeviceToken")
    }
}

exports.updateManyUserToken = async function (query, user_id) {
    try {
        var discounts = await UserDeviceToken.updateMany(query, { $set: { user_id: user_id } })

        return discounts
    } catch (e) {
        throw Error("Error Occured while finding the UserDeviceToken")
    }
}
