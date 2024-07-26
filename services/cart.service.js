// Gettign the Newly created Mongoose Model we just created 
var Cart = require('../models/Cart.model');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Cart List
exports.getCarts = async function (query, page, limit,order_name,order,searchText) {
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
        
        var Carts = await Cart.aggregate(facetedPipeline);
        // Return the Cartd list that was retured by the mongoose promise
        return Carts;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Carts');
    }
}

exports.getActiveCarts = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        //var Carts = await Cart.find(query)

         var Carts = await Cart.aggregate([
            {$match: query },
            { 
                $project : {
                    _id: 1,
                    location_id:1,
                    status: 1,
                    createdAt:1,
                    browser_id:1,
                    service_id : {
                        $toObjectId : "$service_id"
                    }
                }
            },
            { $lookup:
                {
                    from: 'services',
                    localField: 'service_id',
                    foreignField: '_id',
                    as: 'service_data'
                 }
            },
            { $unwind : "$service_data"},
            {
                $project : {
                    _id: 1,
                    location_id:1,
                    status: 1,
                    createdAt:1,
                    browser_id:1,
                    service_id: "$service_data._id",
                    name: "$service_data.name",
                    price: "$service_data.price",
                    actual_price: "$service_data.actual_price", 
                    variable_price: "$service_data.variable_price", 
                    special_price: "$service_data.special_price", 
                    hide_strike_price:  "$service_data.hide_strike_price", 
                    deposite_type:  "$service_data.deposite_type", 
                    deposite:  "$service_data.deposite", 
                    min_deposite:  "$service_data.min_deposite", 
                    is_start_from:  "$service_data.is_start_from", 
                    start_from_title:  "$service_data.start_from_title", 
                    is_price_range:  "$service_data.is_price_range", 
                    max_price:  "$service_data.max_price", 
                    commission: "$service_data.commission",
                    tax: "$service_data.tax",
                    duration: "$service_data.duration",
                    category_id: "$service_data.category_id",
                    gender: "$service_data.gender",
                    reminder:  "$service_data.reminder",
                    online_status: "$service_data.reminder",
                    status: "$service_data.status",
                    test_id: "$service_data.test_id",
                    old_price:  "$service_data.old_price"
                }
            }, 
               
        ] );

        // Return the Cartd list that was retured by the mongoose promise
        return Carts;

    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while finding Carts');
    }
}

exports.updateManyCartStatus = async function (query) {
    try {
        // Find the Data and replace booking status
        var Carts = await Cart.updateMany(query, {$set: {status: 0}})

        return Carts;
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Appointment not available");
    }

}

exports.getCart = async function (id) {
    try {
        // Find the Data 
        var _details = await Cart.findOne({
            _id: id
        });
        if(_details._id) {
            return _details;
        } else {
            throw Error("Cart not available");
        }
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Cart not available");
    }
}

// getting all Carts for company copy
exports.getCartSpecific = async function (query) {
   
    // console.log('query',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var Carts = await Cart.find(query);
        // Return the Serviced list that was retured by the mongoose promise
        return Carts;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating LoyaltyCard');
    }
}


exports.createCart = async function (cart) {
    var newCart = new Cart({
        location_id: cart.location_id ? cart.location_id : "",
        browser_id: cart.browser_id ? cart.browser_id : "",
        service_id: cart.service_id ? cart.service_id : "",
        status: cart.status ? cart.status : 0  
    })

    try {
        // Saving the Cart 
        var savedCart = await newCart.save();
        return savedCart;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Cart")
    }
}

exports.updateCart = async function (cart) {
    var id = cart._id
    try {
        //Find the old Cart Object by the Id
        var oldCart = await Cart.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Cart")
    }
    // If no old Cart Object exists return false
    if (!oldCart) {
        return false;
    }

    //Edit the Cart Object
    if(cart.location_id) {
        oldCart.location_id = cart.location_id;
    }
    if(cart.browser_id) {
        oldCart.browser_id = cart.browser_id;
    }
    if(cart.service_id) {
        oldCart.service_id = cart.service_id;
    }
   
    oldCart.status = cart.status ? cart.status : 0;


    try {
        var savedCart = await oldCart.save()
        return savedCart;
    } catch (e) {
        throw Error("And Error occured while updating the Cart");
    }
}

exports.deleteCart = async function (id) {
    // Delete the Cart
    try {
        var deleted = await Cart.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Cart Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Cart")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Cart.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Cart")
    }
}