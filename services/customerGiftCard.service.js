// Gettign the Newly created Mongoose Model we just created
var CustomerGiftCard = require('../models/CustomerGiftCard.model');

var fs = require('fs');
var publicPath = require('path').resolve('public');

// Saving the context of this module inside the _the variable
_this = this;

// Async function to get the Customer Gift Card List
exports.getCustomerGiftCards = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        const facetedPipeline = [
            { $match: query },
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

        var customerGiftCards = await CustomerGiftCard.aggregate(facetedPipeline);
        if (customerGiftCards && customerGiftCards?.length) {
            if (customerGiftCards[0]?.data && customerGiftCards[0].data?.length) {
                customerGiftCards[0].data = await CustomerGiftCard.populate(
                    customerGiftCards[0].data, {
                    path: "customer_id",
                    select: "_id first_name last_name name email mobile photo"
                });

                customerGiftCards[0].data = await CustomerGiftCard.populate(
                    customerGiftCards[0].data, {
                    path: "buyer_customer_id",
                    select: "_id first_name last_name name email mobile photo"
                });

                customerGiftCards[0].data = await CustomerGiftCard.populate(
                    customerGiftCards[0].data, {
                    path: "service_ids",
                    select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
                });
            }
        }

        // Return the Customer Gift Card list that was retured by the mongoose promise
        return customerGiftCards;
    } catch (e) {
        console.log("getCustomerGiftCards catch >>> ", e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customer Gift Cards');
    }
}

exports.getCustomerGiftCardsOne = async function (query, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) { sorts[sort_field] = sort_type; }

        var customerGiftCards = await CustomerGiftCard.find(query)
            .populate({
                path: 'company_id',
                select: "_id name email mobile"
            })
            .populate({
                path: 'location_id',
                select: "_id name email"
            })
            .populate({
                path: 'customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'buyer_customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'service_ids',
                select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
            })
            .sort(sorts);

        return customerGiftCards || [];
    } catch (e) {
        // return a Error message describing the reason     
        // throw Error("Customer Gift Card not available");
        return [];
    }
}

exports.getCustomerGiftCardList = async function (query, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1);
        var sorts = {};
        if (sort_field) { sorts[sort_field] = sort_type; }

        var customerGiftCards = await CustomerGiftCard.find(query)
            .populate({
                path: 'company_id',
                select: "_id name email mobile"
            })
            .populate({
                path: 'location_id',
                select: "_id name email"
            })
            .populate({
                path: 'customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'buyer_customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'service_ids',
                select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit);

        return customerGiftCards || [];
    } catch (e) {
        // return a Error message describing the reason     
        // throw Error("Customer Gift Card not available");
        return [];
    }
}

exports.getCustomerGiftCardsCount = async function (query = {}) {
    try {
        var customerGiftCardCount = await CustomerGiftCard.find(query).count();

        return customerGiftCardCount || 0;
    } catch (e) {
        throw Error('Error while Counting Customer Gift Cards');
    }
}

exports.getGiftCard = async function (id) {
    try {
        // Find the Data 
        var _details = await CustomerGiftCard.findOne({ _id: id })
            .populate({
                path: 'customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'buyer_customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'service_ids',
                select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
            });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        // throw Error("Customer Gift Card not available");
        return null;
    }
}

exports.getGiftCardOne = async function (query, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) { sorts[sort_field] = sort_type; }

        // Find the Data 
        var _details = await CustomerGiftCard.findOne(query)
            .populate({
                path: 'company_id',
                select: "_id name email mobile"
            })
            .populate({
                path: 'location_id',
                select: "_id name email"
            })
            .populate({
                path: 'redeem_location_id',
                select: "_id name email"
            })
            .populate({
                path: 'customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'buyer_customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'service_ids',
                select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
            })
            .sort(sorts);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        // throw Error("Customer Gift Card not available");
        return null;
    }
}

exports.getGiftCardSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customerGiftCards = await CustomerGiftCard.find(query);

        // Return the CustomerGiftCard list that was retured by the mongoose promise
        return customerGiftCards;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customer Gift Card');
    }
}

exports.getSingleGiftCard = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customerGiftCard = await CustomerGiftCard.findOne(query)
            .populate({
                path: 'customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'buyer_customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'service_ids',
                select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
            });

        // Return the Customer Gift Card that was retured by the mongoose promise
        return customerGiftCard;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customer Gift Card');
    }
}

exports.getGiftCardDetail = async function (query, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) { sorts[sort_field] = sort_type; }

        // Find the Data 
        var _details = await CustomerGiftCard.findOne(query)
            .populate({ path: 'company_id' })
            .populate({ path: 'created_location_id' })
            .populate({
                path: 'customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'buyer_customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({
                path: 'service_ids',
                select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
            })
            .sort(sorts);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        // throw Error("Customer Gift Card not available");
        return null;
    }
}

exports.getCustomerActiveGiftCards = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customerGiftCards = await CustomerGiftCard.find(query, { _id: 0 });

        // Return the Categoryd list that was retured by the mongoose promise
        return customerGiftCards;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Customer Gift Card');
    }
}

exports.matchCustomerGiftCard = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customerGiftCard = await CustomerGiftCard.findOne(query)
            .select('_id amount gift_code customer_id');

        // Return the CustomerGiftCard list that was retured by the mongoose promise
        return customerGiftCard;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Customer Gift Card');
    }
}

exports.createMultipleGiftCards = async function (data) {
    try {
        var _details = await CustomerGiftCard.insertMany(data);

        return _details;
    } catch (e) {
        console.log("createMultipleGiftCards catch >>> ", e);
        // return a Error message describing the reason     
        throw Error("Error while Creating Customer Gift Card");
    }
}

exports.createCustomerGiftCard = async function (customerGiftCard) {
    var newCustomerGiftCard = new CustomerGiftCard({
        company_id: customerGiftCard?.company_id ? customerGiftCard.company_id : null,
        location_id: customerGiftCard?.location_id ? customerGiftCard.location_id : null,
        created_location_id: customerGiftCard?.created_location_id ? customerGiftCard.created_location_id : null,
        redeem_location_id: customerGiftCard?.redeem_location_id ? customerGiftCard.redeem_location_id : null,
        customer_id: customerGiftCard?.customer_id ? customerGiftCard.customer_id : null,
        buyer_customer_id: customerGiftCard?.buyer_customer_id ? customerGiftCard.buyer_customer_id : null,
        gift_card_id: customerGiftCard?.gift_card_id ? customerGiftCard.gift_card_id : null,
        added_by: customerGiftCard?.added_by ? customerGiftCard.added_by : null,
        service_ids: customerGiftCard?.service_ids?.length ? customerGiftCard.service_ids : null,
        sr_no: customerGiftCard.sr_no ? customerGiftCard.sr_no : '',
        gift_code: customerGiftCard.gift_code ? customerGiftCard.gift_code : '',
        type: customerGiftCard?.type ? customerGiftCard.type : "", // digital|physical
        amount: customerGiftCard.amount ? customerGiftCard.amount : 0,
        remaining: customerGiftCard.amount ? customerGiftCard.amount : 0,
        delivery_charge: customerGiftCard.delivery_charge ? customerGiftCard.delivery_charge : 0,
        billing_address: customerGiftCard.billing_address ? customerGiftCard.billing_address : null,
        shipping_address: customerGiftCard.shipping_address ? customerGiftCard.shipping_address : null,
        image: customerGiftCard.image ? customerGiftCard.image : "",
        payment_mode: customerGiftCard?.payment_mode ? customerGiftCard.payment_mode : "",
        transaction_id: customerGiftCard?.transaction_id ? customerGiftCard.transaction_id : null,
        transaction_detail: customerGiftCard.transaction_detail ? customerGiftCard.transaction_detail : null,
        upto_months: customerGiftCard.upto_months ? customerGiftCard.upto_months : 0,
        start_date: customerGiftCard?.start_date ? customerGiftCard.start_date : null,
        end_date: customerGiftCard?.end_date ? customerGiftCard.end_date : null,
        old_end_date: customerGiftCard?.old_end_date ? customerGiftCard.old_end_date : null,
        extension_months: customerGiftCard?.extension_months ? customerGiftCard.extension_months : 0,
        extension_charge: customerGiftCard?.extension_charge ? customerGiftCard.extension_charge : 0,
        extension_date: customerGiftCard?.extension_date ? customerGiftCard.extension_date : null,
        is_redeemed: customerGiftCard.is_redeemed ? customerGiftCard.is_redeemed : false,
        payment_source: customerGiftCard.payment_source ? customerGiftCard.payment_source : "",
        source_url: customerGiftCard.source_url ? customerGiftCard.source_url : "",
        status: customerGiftCard.status ? customerGiftCard.status : 0
    });

    try {
        // Saving the Customer Gift Card 
        var savedCustomerGiftCard = await newCustomerGiftCard.save();
        return savedCustomerGiftCard;
    } catch (e) {
        console.log("createCustomerGiftCard catch >>> ", e);
        // return a Error message describing the reason     
        throw Error("Error while Creating Customer Gift Card");
    }
}

exports.updateCustomerGiftCard = async function (customerGiftCard) {
    var id = customerGiftCard._id;
    try {
        // Find the old Customer Gift Card Object by the Id
        var oldCustomerGiftCard = await CustomerGiftCard.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Customer Gift Card");
    }

    // If no old Customer Gift Card Object exists return false
    if (!oldCustomerGiftCard) { return false; }

    // Edit the Customer Gift Card Object
    if (customerGiftCard?.company_id) {
        oldCustomerGiftCard.company_id = customerGiftCard?.company_id;
    }

    if (customerGiftCard?.location_id) {
        oldCustomerGiftCard.location_id = customerGiftCard.location_id;
    }

    if (customerGiftCard?.created_location_id) {
        oldCustomerGiftCard.created_location_id = customerGiftCard.created_location_id;
    }

    if (customerGiftCard?.redeem_location_id) {
        oldCustomerGiftCard.redeem_location_id = customerGiftCard.redeem_location_id;
    }

    if (customerGiftCard?.customer_id) {
        oldCustomerGiftCard.customer_id = customerGiftCard.customer_id;
    }

    if (customerGiftCard?.buyer_customer_id) {
        oldCustomerGiftCard.buyer_customer_id = customerGiftCard.buyer_customer_id;
    }

    if (customerGiftCard?.gift_card_id) {
        oldCustomerGiftCard.gift_card_id = customerGiftCard.gift_card_id;
    }

    if (customerGiftCard?.added_by) {
        oldCustomerGiftCard.added_by = customerGiftCard.added_by;
    }

    if (customerGiftCard?.service_ids) {
        oldCustomerGiftCard.service_ids = customerGiftCard.service_ids?.length ? customerGiftCard.service_ids : null;
    }

    if (customerGiftCard?.sr_no) {
        oldCustomerGiftCard.sr_no = customerGiftCard.sr_no;
    }

    if (customerGiftCard?.gift_code) {
        oldCustomerGiftCard.gift_code = customerGiftCard.gift_code;
    }

    if (customerGiftCard?.type) {
        oldCustomerGiftCard.type = customerGiftCard.type;
    }

    if (customerGiftCard?.amount) {
        oldCustomerGiftCard.amount = parseFloat(customerGiftCard.amount).toFixed(2);
    }

    if (customerGiftCard?.remaining || customerGiftCard.remaining == 0) {
        if (customerGiftCard?.remaining) {
            customerGiftCard.remaining = parseFloat(customerGiftCard.remaining).toFixed(2);
        }

        oldCustomerGiftCard.remaining = customerGiftCard.remaining;
    }

    if (customerGiftCard?.delivery_charge) {
        if (customerGiftCard?.delivery_charge) {
            customerGiftCard.delivery_charge = parseFloat(customerGiftCard.delivery_charge).toFixed(2);
        }

        oldCustomerGiftCard.delivery_charge = customerGiftCard.delivery_charge;
    }

    if (customerGiftCard?.billing_address) {
        oldCustomerGiftCard.billing_address = customerGiftCard?.billing_address;
    }

    if (customerGiftCard?.shipping_address) {
        oldCustomerGiftCard.shipping_address = customerGiftCard?.shipping_address;
    }

    if (customerGiftCard?.image || customerGiftCard.image == "") {
        oldCustomerGiftCard.image = customerGiftCard?.image || "";
    }

    if (customerGiftCard?.payment_mode) {
        oldCustomerGiftCard.payment_mode = customerGiftCard.payment_mode;
    }

    if (customerGiftCard?.transaction_id) {
        oldCustomerGiftCard.transaction_id = customerGiftCard.transaction_id;
    }

    if (customerGiftCard?.transaction_detail) {
        oldCustomerGiftCard.transaction_detail = customerGiftCard.transaction_detail;
    }

    if (customerGiftCard?.upto_months) {
        oldCustomerGiftCard.upto_months = customerGiftCard.upto_months;
    }

    if (customerGiftCard?.start_date) {
        oldCustomerGiftCard.start_date = customerGiftCard.start_date;
    }

    if (customerGiftCard?.end_date) {
        oldCustomerGiftCard.end_date = customerGiftCard.end_date;
    }

    if (customerGiftCard?.old_end_date) {
        oldCustomerGiftCard.old_end_date = customerGiftCard.old_end_date;
    }

    if (customerGiftCard?.extension_months || customerGiftCard.extension_months == 0) {
        oldCustomerGiftCard.extension_months = customerGiftCard.extension_months;
    }

    if (customerGiftCard?.extension_charge || customerGiftCard.extension_charge == 0) {
        oldCustomerGiftCard.extension_charge = customerGiftCard.extension_charge;
    }

    if (customerGiftCard?.extension_date) {
        oldCustomerGiftCard.extension_date = customerGiftCard.extension_date;
    }

    if (customerGiftCard.is_redeemed || customerGiftCard.is_redeemed == false) {
        oldCustomerGiftCard.is_redeemed = customerGiftCard.is_redeemed ? true : false;
    }

    if (customerGiftCard.payment_source) {
        oldCustomerGiftCard.payment_source = customerGiftCard.payment_source;
    }

    if (customerGiftCard.source_url) {
        oldCustomerGiftCard.source_url = customerGiftCard.source_url;
    }

    if (customerGiftCard?.status || Number(customerGiftCard.status) == 0) {
        oldCustomerGiftCard.status = Number(customerGiftCard.status) || 0;
    }

    try {
        var savedCustomerGiftCard = await oldCustomerGiftCard.save();
        return savedCustomerGiftCard;
    } catch (e) {
        throw Error("And Error occured while updating the Customer Gift Card");
    }
}

exports.deleteCustomerGiftCard = async function (id) {
    // Delete the Customer Gift Card
    try {
        var oldCard = await CustomerGiftCard.findByIdAndDelete({ _id: id });
        if (oldCard && oldCard?.image) {
            var filePath = publicPath + "/" + oldCard.image;
            if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }
        }

        return oldCard;
    } catch (e) {
        throw Error("Error Occured while Deleting the Customer Gift Card");
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the Customer Gift Card
    try {
        var deleted = await CustomerGiftCard.remove(query);

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Customer Gift Cards");
    }
}
