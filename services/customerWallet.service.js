// Gettign the Newly created Mongoose Model we just created 
var CustomerWallet = require('../models/CustomerWallet.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the CustomerWallet List
exports.getCustomerWallets = async function (query, page, limit,order_name,order,searchText) {
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
        
        var CustomerWallets = await CustomerWallet.aggregate(facetedPipeline);
        // Return the CustomerWalletd list that was retured by the mongoose promise
        return CustomerWallets;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerWallets');
    }
}
exports.getCustomerWallet = async function (id) {
    try {
        // Find the Data 
        var _details = await CustomerWallet.findOne({
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
        //throw Error("CustomerWallet not available");
    }
}

// getting all CustomerWallets for company copy
exports.getCustomerWalletSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerWallets = await CustomerWallet.find(query);
        // Return the Serviced list that was retured by the mongoose promise
        return CustomerWallets;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerWallet');
    }
}


exports.getSingleCustomerWalletByName = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerWallets = await CustomerWallet.findOne(query);
        // Return the CustomerWallets list that was retured by the mongoose promise
        return CustomerWallets;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerWallet');
    }
}

exports.getActiveCustomerWallets = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerWallets = await CustomerWallet.find(query, { _id: 0 });
        // Return the Categoryd list that was retured by the mongoose promise
        return CustomerWallets;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Categories');
    }
}

exports.createMultipleCustomerWallets = async function (data) {
    try {
        // Find the Data 
        var _details = await CustomerWallet.insertMany(data);
        return _details;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomerWallet");
    }
}

exports.createCustomerWallet = async function (customerWallet) {
    var newCustomerWallet = new CustomerWallet({
        company_id: customerWallet.company_id ? customerWallet.company_id : null,
        location_id: customerWallet.location_id ? customerWallet.location_id : null,
        customer_id: customerWallet.customer_id ? customerWallet.customer_id : null,
        customer_giftcard_id: customerWallet.customer_giftcard_id ? customerWallet.customer_giftcard_id : null,
        appointment_id: customerWallet.appointment_id ?? null, 
        desc: customerWallet.desc ? customerWallet.desc : "",
        credit_balance: customerWallet.credit_balance ? customerWallet.credit_balance : 0,
        debit_balance: customerWallet.debit_balance ? customerWallet.debit_balance : 0,
        total_balance: customerWallet.total_balance ? customerWallet.total_balance : 0,
        transaction_type : customerWallet.transaction_type ? customerWallet.transaction_type : "",
        balance_type : customerWallet.balance_type ? customerWallet.balance_type : "",
        delivery_charge: customerWallet.delivery_charge ? customerWallet.delivery_charge : 0,
        reward_points: customerWallet.reward_points ? customerWallet.reward_points : 0,
        added_by: customerWallet.added_by ? customerWallet.added_by : null,
        status: customerWallet.status ? customerWallet.status : 0  
    })

    try {
        // Saving the CustomerWallet 
        var savedCustomerWallet = await newCustomerWallet.save();
        return savedCustomerWallet;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomerWallet")
    }
}


exports.updateCustomerWallet = async function (customerWallet) {
    var id = customerWallet._id
    try {
        //Find the old CustomerWallet Object by the Id
        var oldCustomerWallet = await CustomerWallet.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the CustomerWallet")
    }
    // If no old CustomerWallet Object exists return false
    if (!oldCustomerWallet) {
        return false;
    }

    //Edit the CustomerWallet Object
    if(customerWallet.company_id) {
        oldCustomerWallet.company_id = customerWallet.company_id;
    }
    if(customerWallet.location_id) {
        oldCustomerWallet.location_id = customerWallet.location_id;
    }
    if(customerWallet.customer_id) {
        oldCustomerWallet.customer_id = customerWallet.customer_id;
    }
    if(customerWallet.desc) {
        oldCustomerWallet.desc = customerWallet.desc;
    }
   
    if(customerWallet.transaction_type) {
        oldCustomerWallet.type = customerWallet.transaction_type;
    }
    if(customerWallet.reward_points) {
        oldCustomerWallet.reward_points = customerWallet.reward_points;
    }
    if(customerWallet.added_by) {
        oldCustomerWallet.added_by = customerWallet.added_by;
    }
    if(customerWallet.status) {
        oldCustomerWallet.status = customerWallet.status;
    }
   
    try {
        var savedCustomerWallet = await oldCustomerWallet.save()
        return savedCustomerWallet;
    } catch (e) {
        throw Error("And Error occured while updating the CustomerWallet");
    }
}

exports.deleteCustomerWallet = async function (id) {
    // Delete the CustomerWallet
    try {
        var deleted = await CustomerWallet.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CustomerWallet Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerWallet")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await CustomerWallet.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerWallet")
    }
}