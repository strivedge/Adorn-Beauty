// Gettign the Newly created Mongoose Model we just created 
var CustomerReview = require('../models/CustomerReview.model');
// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Packages List
exports.getCustomerReviews = async function (query, page, limit, order_name, order, searchText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        // var CustomerReviews = await CustomerReview.paginate(query, options)
        var sort = {};
        sort[order_name] = order;

        //console.log('sort',sort)

        // if(serachText && serachText != ''){
        //     query['$text'] = { $search: serachText, $language:'en',$caseSensitive:false};
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
        
        var customerReview = await CustomerReview.aggregate(facetedPipeline);
        // Return the CustomerRewardd list that was retured by the mongoose promise
        return customerReview;

    } catch (e) {
         console.log("Error ",e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerReviews');
    }
}

exports.getCustomerReviewSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    // console.log('query2',query)

    try {
        // Find the CustomerReview 
        var CustomerReviews = await CustomerReview.find(query).select({_id:1,customer_id:1,employee_id:1,package_id:1,start_date:1,end_date:1,retail_price:1,sold_price:1,comment:1,extension:1,extended_date:1,extension_charge:1,location_id:1,note_for_therapist:1});

        return CustomerReviews;
        
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("CustomerReview not available");
    }
}

exports.updateManyPackagesClient = async function (query,customer_id) {
    try {
        // Find the Data and replace booking status
        var CustomerReviews = await CustomerReview.updateMany(query, {$set: {customer_id: customer_id}})

        return CustomerReviews;
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerReviews not available");
    }

}



exports.getCustomerReview = async function (id) {
    try {
        // Find the CustomerReview 
        var _details = await CustomerReview.findOne({
            _id: id
        });
        if(_details._id) {
            return _details;
        } else {
            throw Error("CustomerReview not available");
        }
        
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("CustomerReview not available");
    }

}



exports.createCustomerReview = async function (customerReview) {
    // console.log("CustomerReview ",CustomerReview)

    var newCustomerReview = new CustomerReview({
        location_id: customerReview.location_id ? customerReview.location_id : "",
        customer_id: customerReview.customer_id ? customerReview.customer_id : "",
        name: customerReview.name ? customerReview.name : "",
        email: customerReview.email ? customerReview.email : "",
        mobile: customerReview.mobile ? customerReview.mobile : "",
        rating: customerReview.rating ? customerReview.rating : 0,
        review: customerReview.review ? customerReview.review : "",
    })

    try {
        // Saving the CustomerReview 
        var savedCustomerReview = await newCustomerReview.save();
        return savedCustomerReview;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomerReview")
    }
}

exports.updateCustomerReview = async function (customerReview) {
    var id = customerReview._id
    try {
        //Find the old CustomerReview Object by the Id
        var oldCustomerReview = await CustomerReview.findById(id);
        //console.log('oldCustomerReview ',oldCustomerReview)
    } catch (e) {
        throw Error("Error occured while Finding the CustomerReview")
    }
    // If no old CustomerReview Object exists return false
    if (!oldCustomerReview) {
        return false;
    }

    //Edit the CustomerReview Object

    if(customerReview.location_id) {
        oldCustomerReview.location_id = customerReview.location_id;
    }

    if(customerReview.customer_id) {
        oldCustomerReview.customer_id = customerReview.customer_id;
    }

    if(customerReview.name) {
        oldCustomerReview.name = customerReview.name;
    }

    if(customerReview.email) {
        oldCustomerReview.email = customerReview.email;
    }

    if(customerReview.mobile) {
        oldCustomerReview.mobile = customerReview.mobile;
    }

    if(customerReview.rating) {
        oldCustomerReview.rating = customerReview.rating;
    }

    if(customerReview.review) {
        oldCustomerReview.review = customerReview.review;
    }


    try {
        var savedCustomerReview = await oldCustomerReview.save()
        return savedCustomerReview;
    } catch (e) {
        throw Error("And Error occured while updating the CustomerReview");
    }
}

exports.deleteCustomerReview = async function (id) {
    // Delete the CustomerReview
    try {
        var deleted = await CustomerReview.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CustomerReview Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerReview")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await CustomerReview.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerReview")
    }
}