// Gettign the Newly created Mongoose Model we just created 
var GiftCard = require('../models/GiftCard.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the GiftCard List
exports.getGiftCards = async function (query, page, limit,order_name,order,searchText) {
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
        
        var GiftCards = await GiftCard.aggregate(facetedPipeline);
        // Return the GiftCardd list that was retured by the mongoose promise
        return GiftCards;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating GiftCards');
    }
}
exports.getGiftCard = async function (id) {
    try {
        // Find the Data 
        var _details = await GiftCard.findOne({
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
        //throw Error("GiftCard not available");
    }
}

// getting all GiftCards for company copy
exports.getGiftCardSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var GiftCards = await GiftCard.find(query);
        // Return the Serviced list that was retured by the mongoose promise
        return GiftCards;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating GiftCard');
    }
}


exports.getSingleGiftCardByName = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var GiftCards = await GiftCard.findOne(query);
        // Return the GiftCards list that was retured by the mongoose promise
        return GiftCards;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating GiftCard');
    }
}

exports.getActiveGiftCards = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var GiftCards = await GiftCard.find(query, { _id: 0 });
        // Return the Categoryd list that was retured by the mongoose promise
        return GiftCards;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Categories');
    }
}

exports.createMultipleGiftCards = async function (data) {
    try {
        // Find the Data 
        var _details = await GiftCard.insertMany(data);
        return _details;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating GiftCard");
    }
}

exports.getGiftCardsDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var giftCards = await GiftCard.find(query)
            .select("_id name price delivery_charge type")
            .sort(sorts)

        return giftCards
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown GiftCard')
    }
}

exports.createGiftCard = async function (giftCard) {
    var newGiftCard = new GiftCard({
        company_id: giftCard.company_id ? giftCard.company_id : null,
        location_id: giftCard.location_id ? giftCard.location_id : null,
        name: giftCard.name ? giftCard.name : "",
        desc: giftCard.desc ? giftCard.desc : "",
        price: giftCard.price ? giftCard.price : 0,
        type : giftCard.type ? giftCard.type : "", //offline,online
        delivery_charge: giftCard.delivery_charge ? giftCard.delivery_charge : 0,
        start_date: giftCard.start_date ? giftCard.start_date : null,
        end_date: giftCard.end_date ? giftCard.end_date : null,
        allow_user_to_purchase: giftCard.allow_user_to_purchase ? giftCard.allow_user_to_purchase : 0,
        status: giftCard.status ? giftCard.status : 0  
    })

    try {
        // Saving the GiftCard 
        var savedGiftCard = await newGiftCard.save();
        return savedGiftCard;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating GiftCard")
    }
}

exports.updateGiftCard = async function (giftCard) {
    var id = giftCard._id
    try {
        //Find the old GiftCard Object by the Id
        var oldGiftCard = await GiftCard.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the GiftCard")
    }
    // If no old GiftCard Object exists return false
    if (!oldGiftCard) {
        return false;
    }

    //Edit the GiftCard Object
    if(giftCard.company_id) {
        oldGiftCard.company_id = giftCard.company_id;
    }
    if(giftCard.location_id) {
        oldGiftCard.location_id = giftCard.location_id;
    }
    if(giftCard.name) {
        oldGiftCard.name = giftCard.name
    }
    if(giftCard.desc) {
        oldGiftCard.desc = giftCard.desc;
    }
    if(giftCard.price) {
        oldGiftCard.price = giftCard.price;
    }
    if(giftCard.status) {
        oldGiftCard.status = giftCard.status;
    }
    if(giftCard.type) {
        oldGiftCard.type = giftCard.type;
    }
    if(giftCard.delivery_charge) {
        oldGiftCard.delivery_charge = giftCard.delivery_charge;
    }
    if(giftCard.start_date) {
        oldGiftCard.start_date = giftCard.start_date;
    }
    if(giftCard.end_date) {
        oldGiftCard.end_date = giftCard.end_date;
    }
    if(giftCard.allow_user_to_purchase) {
        oldGiftCard.allow_user_to_purchase = giftCard.allow_user_to_purchase;
    }

    try {
        var savedGiftCard = await oldGiftCard.save()
        return savedGiftCard;
    } catch (e) {
        throw Error("And Error occured while updating the GiftCard");
    }
}

exports.deleteGiftCard = async function (id) {
    // Delete the GiftCard
    try {
        var deleted = await GiftCard.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("GiftCard Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the GiftCard")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await GiftCard.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the GiftCard")
    }
}