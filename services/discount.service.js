// Gettign the Newly created Mongoose Model we just created 
var Customer = require('../models/Customer.model')
var Service = require('../models/Service.model');
var Discount = require('../models/Discount.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Discounts List
exports.getDiscounts = async function (query, page, limit, order_name, order) {
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
        ]

        var discounts = await Discount.aggregate(facetedPipeline);

        // Return the Discounts list that was retured by the mongoose promise
        return discounts;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Discounts');
    }
}

exports.getDiscountsTypes = async function (query = {}) {
    try {
        //var discounts = await Discount.find(query)
        var _details = await Discount.aggregate([
            { $match: query },
            {
                $group: {
                    "_id": "$discount_code_type",
                    "discount_code_type": { "$first": "$discount_code_type" },
                }
            }
        ]);

        return _details;
    } catch (e) {
        console.log(e)
        throw Error('Error while getting Discount types');
    }
}


exports.getDiscountsCount = async function (query = {}) {
    try {
        var discounts = await Discount.find(query).count();

        return discounts || 0;
    } catch (e) {
        console.log(e)
        throw Error('Error while Counting Discounts');
    }
}

// Method to get discount and offer with pagination
exports.getDiscountAndOffer = async function (query) {
    return await Discount.findOne(query);
};


exports.getDiscountList = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1);
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var discounts = await Discount.find(query)
            .populate({
                path: 'service_id',
                model: Service,
                select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
            })
            .populate({
                path: 'paid_service_id',
                model: Service,
                select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit);

        return discounts || [];
    } catch (e) {
        // return a Error message describing the reason
        throw Error('Error while Paginating Discounts');
    }
}

exports.getDiscountsWithCustomer = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        // Find the Discount 
        var discounts = await Discount.find(query)
            .populate({
                path: 'customer_id',
                model: Customer,
                select: { _id: 1, first_name: 1, last_name: 1, name: 1, mobile: 1, is_international_number: 1, email: 1, dob: 1, age: 1, anniversary_date: 1, gender: 1, customer_heart: 1, customer_icon: 1, customer_badge: 1, email_notification: 1, sms_notification: 1, location_ids: 1, location_id: 1, is_customer: 1, session_email_notification: 1, session_sms_notification: 1, notification_permission: 1, birthday_email_notification: 1, birthday_sms_notification: 1, marketing_email_notification: 1, marketing_sms_notification: 1, wa_verified: 1, customer_badges: 1, customer_icons: 1 }
            })
            .sort(sorts);

        return discounts || [];
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason
        return [];
    }
}

exports.getDiscountsOne = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        // Find the Discount 
        var discounts = await Discount.find(query)
            .populate({
                path: 'service_id',
                model: Service,
                select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
            })
            .sort(sorts);

        return discounts || [];
    } catch (e) {
        // return a Error message describing the reason
        return [];
    }
}

exports.getDiscount = async function (id) {
    try {
        // Find the Discount 
        var _details = await Discount.findOne({ _id: id });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Discount not available");
    }
}

exports.getDiscountOne = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        // Find the Discount 
        var _details = await Discount.findOne(query)
            .populate({
                path: 'service_id',
                model: Service,
                select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
            })
            .populate({
                path: 'paid_service_id',
                model: Service,
                select: "_id category_id name duration gender price actual_price special_price variable_price hide_strike_price deposite_type deposite min_deposite deposite_type is_start_from start_from_title is_price_range max_price tax commission tax reminder online_status status test_id"
            })
            .sort(sorts);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason
        return null;
    }
}

exports.getDiscountSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var discount = await Discount.find(query);

        // Return the Serviced list that was retured by the mongoose promise
        return discount;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating discount');
    }
}

exports.getSingleDiscount = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var discount = await Discount.findOne(query);

        // Return the Serviced list that was retured by the mongoose promise
        return discount;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating discount');
    }
}

exports.createDiscount = async function (discount) {
    if (!discount.discount_code_type) {
        discount.discount_code_type = discount.is_offer_module ? 'offer' : 'discount';
    }
    var newDiscount = new Discount({
        company_id: discount.company_id ? discount.company_id : null,
        location_id: discount.location_id ? discount.location_id : null,
        service_id: discount?.service_id?.length ? discount.service_id : null,
        paid_service_id: discount?.paid_service_id?.length ? discount.paid_service_id : null,
        name: discount.name ? discount.name : "",
        discount_type: discount.discount_type ? discount.discount_type : "",
        discount_value: discount.discount_value ? discount.discount_value : "",
        days: discount?.days?.length ? discount.days : null,
        start_date: discount.start_date ? discount.start_date : null,
        end_date: discount.end_date ? discount.end_date : null,
        min_discount: discount.min_discount ? discount.min_discount : "",
        max_discount: discount.max_discount ? discount.max_discount : "",
        min_order_val: discount.min_order_val ? discount.min_order_val : "",
        max_order_val: discount.max_order_val ? discount.max_order_val : "",
        per_user_occurances: discount.per_user_occurances ? discount.per_user_occurances : "",
        max_occurances: discount.max_occurances ? discount.max_occurances : "",
        category_id: discount.category_id ? discount.category_id : "",
        discount_code: discount.discount_code ? discount.discount_code : "",
        status: discount.status ? discount.status : 0,
        weekend: discount.weekend ? discount.weekend : "yes",
        holiday: discount.holiday ? discount.holiday : "yes",
        description: discount.description ? discount.description : "",
        customer_id: discount.customer_id ? discount.customer_id : null,
        discount_code_type: discount.discount_code_type ? discount.discount_code_type : "",
        is_offer_module: discount.is_offer_module ? discount.is_offer_module : 0,
        customer_arr: discount?.customer_arr?.length ? discount.customer_arr : null,
        email_notification: discount.email_notification ? discount.email_notification : 0,
        sms_notification: discount.sms_notification ? discount.sms_notification : 0,
        all_customer: discount.all_customer ? discount.all_customer : 0,
        start_time: discount.start_time ? discount.start_time : "",
        end_time: discount.end_time ? discount.end_time : "",
        start_time_meridiem: discount.start_time_meridiem ? discount.start_time_meridiem : "",
        end_time_meridiem: discount.end_time_meridiem ? discount.end_time_meridiem : "",
        evening_start_time: discount.evening_start_time ? discount.evening_start_time : "",
        evening_end_time: discount.evening_end_time ? discount.evening_end_time : "",
        evening_start_time_meridiem: discount.evening_start_time_meridiem ? discount.evening_start_time_meridiem : "",
        evening_end_time_meridiem: discount.evening_end_time_meridiem ? discount.evening_end_time_meridiem : "",
        offer_email_template_id: discount.offer_email_template_id ? discount.offer_email_template_id : "",
        offer_email_template: discount.offer_email_template ? discount.offer_email_template : "",
        offer_email_subject: discount.offer_email_subject ? discount.offer_email_subject : "",
        email_title: discount.email_title ? discount.email_title : '',
        email_desc: discount.email_desc ? discount.email_desc : '',
        offer_image: discount.offer_image ? discount.offer_image : '',
        show_to_customer: discount.show_to_customer ? discount.show_to_customer : 0,
        all_online_services: discount.all_online_services ? discount.all_online_services : 0,
        apply_on_all_services: discount.apply_on_all_services ? discount.apply_on_all_services : 0,
    })

    try {
        // Saving the Discount 
        var savedDiscount = await newDiscount.save();
        return savedDiscount;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Discount");
    }
}

exports.updateDiscount = async function (discount) {
    try {
        var id = discount._id;
        //Find the old Discount Object by the Id
        var oldDiscount = await Discount.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Discount");
    }

    // If no old Discount Object exists return false
    if (!oldDiscount) { return false }

    // Edit the Discount Object
    if (discount.company_id) {
        oldDiscount.company_id = discount.company_id;
    }

    if (discount.location_id) {
        oldDiscount.location_id = discount.location_id;
    }

    if (discount.service_id) {
        oldDiscount.service_id = discount.service_id?.length ? discount.service_id : null;
    }

    if (discount?.paid_service_id) {
        oldDiscount.paid_service_id = discount?.paid_service_id?.length ? discount.paid_service_id : null;
    }

    if (discount.name) {
        oldDiscount.name = discount.name;
    }

    if (discount.discount_type) {
        oldDiscount.discount_type = discount.discount_type;
    }

    if (discount.discount_value) {
        oldDiscount.discount_value = discount.discount_value;
    }

    if (discount.start_date || discount.start_date == "") {
        oldDiscount.start_date = discount?.start_date || null;
    }

    if (discount.end_date || discount.end_date == "") {
        oldDiscount.end_date = discount?.end_date || null;
    }

    if (discount.offer_email_template) {
        oldDiscount.offer_email_template = discount.offer_email_template;
    }

    if (discount.offer_email_subject) {
        oldDiscount.offer_email_subject = discount.offer_email_subject;
    }

    if (discount.email_title) {
        oldDiscount.email_title = discount.email_title;
    }

    if (discount.email_desc) {
        oldDiscount.email_desc = discount.email_desc;
    }

    oldDiscount.days = discount?.days?.length ? discount.days : null;

    oldDiscount.min_discount = discount.min_discount ? discount.min_discount : "";
    oldDiscount.max_discount = discount.max_discount ? discount.max_discount : "";

    oldDiscount.min_order_val = discount.min_order_val ? discount.min_order_val : "";
    oldDiscount.max_order_val = discount.max_order_val ? discount.max_order_val : "";
    oldDiscount.description = discount.description ? discount.description : "";

    if (discount.per_user_occurances) {
        oldDiscount.per_user_occurances = discount.per_user_occurances;
    }

    oldDiscount.max_occurances = discount.max_occurances ? discount.max_occurances : "";

    if (discount.category_id) {
        oldDiscount.category_id = discount.category_id;
    }

    if (discount.discount_code) {
        oldDiscount.discount_code = discount.discount_code;
    }

    if (discount.status || discount.status == 0) {
        oldDiscount.status = discount.status ? discount.status : 0;
    }

    if (discount.weekend) {
        oldDiscount.weekend = discount.weekend;
    }

    if (discount.holiday) {
        oldDiscount.holiday = discount.holiday;
    }

    if (discount.customer_id) {
        oldDiscount.customer_id = discount.customer_id;
    }

    if (discount.discount_code_type) {
        oldDiscount.discount_code_type = discount.discount_code_type;
    }

    if (discount.customer_arr) {
        oldDiscount.customer_arr = discount.customer_arr?.length ? discount.customer_arr : null;
    }

    if (oldDiscount.is_offer_module) {
        oldDiscount.email_notification = discount.email_notification ? discount.email_notification : 0;
        oldDiscount.sms_notification = discount.sms_notification ? discount.sms_notification : 0;
        oldDiscount.all_customer = discount.all_customer ? discount.all_customer : 0;
    }

    if (discount.start_time) {
        oldDiscount.start_time = discount.start_time;
    }

    if (discount.end_time) {
        oldDiscount.end_time = discount.end_time;
    }

    if (discount.start_time_meridiem) {
        oldDiscount.start_time_meridiem = discount.start_time_meridiem;
    }

    if (discount.end_time_meridiem) {
        oldDiscount.end_time_meridiem = discount.end_time_meridiem;
    }

    if (discount.evening_start_time) {
        oldDiscount.evening_start_time = discount.evening_start_time;
    }

    if (discount.evening_end_time) {
        oldDiscount.evening_end_time = discount.evening_end_time;
    }

    if (discount.evening_start_time_meridiem) {
        oldDiscount.evening_start_time_meridiem = discount.evening_start_time_meridiem;
    }

    if (discount.evening_end_time_meridiem) {
        oldDiscount.evening_end_time_meridiem = discount.evening_end_time_meridiem;
    }

    if (discount.offer_email_template_id) {
        oldDiscount.offer_email_template_id = discount.offer_email_template_id;
    }

    if (discount.show_to_customer || Number(discount.show_to_customer) == 0) {
        oldDiscount.show_to_customer = discount.show_to_customer ? discount.show_to_customer : 0;
    }

    if (discount.all_online_services || Number(discount.all_online_services) == 0) {
        oldDiscount.all_online_services = discount.all_online_services ? discount.all_online_services : 0;
    }

    if (discount.apply_on_all_services || Number(discount.apply_on_all_services) == 0) {
        oldDiscount.apply_on_all_services = discount.apply_on_all_services ? discount.apply_on_all_services : 0;
    }

    try {
        var savedDiscount = await oldDiscount.save();
        return savedDiscount;
    } catch (e) {
        throw Error("And Error occured while updating the Discount");
    }
}

exports.deleteDiscount = async function (id) {
    // Delete the Discount
    try {
        var deleted = await Discount.remove({ _id: id });
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Discount Could not be deleted");
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Discount");
    }
}

exports.updateManyDiscountStatus = async function (query) {
    try {
        var deleted = await Discount.updateMany(query, { $set: { status: 0 } });

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Discount");
    }
}

exports.updateManyDiscountCustomer = async function (query, customer_id) {
    try {
        var discounts = await Discount.updateMany(query, { $set: { customer_id: customer_id } });

        return discounts;
    } catch (e) {
        throw Error("Error Occured while Deleting the Discount");
    }
}

exports.updateManyOfferCustomer = async function (query, old_user_id, customer_id) {
    try {
        var offers = await Discount.updateMany(query, { $set: { customer_id: customer_id } });

        var offers = await Discount.updateMany(
            query,
            [{
                $set: {
                    customer_arr: {
                        $map: {
                            input: "$customer_arr",
                            in: {
                                $replaceOne: {
                                    input: "$$this",
                                    find: old_user_id,
                                    replacement: customer_id
                                }
                            }
                        }
                    }
                }
            }]
        );

        return offers;
    } catch (e) {
        console.log(e);
        throw Error("Error Occured while Deleting the Discount");
    }
}
