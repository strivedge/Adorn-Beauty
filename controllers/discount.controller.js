var fs = require('fs');
var Hogan = require('hogan.js');
var dateFormat = require('dateformat');
var ObjectId = require('mongodb').ObjectId;
var CustomerService = require('../services/customer.service');
var SmslogService = require('../services/smslog.service');
var ServiceService = require('../services/service.service');
var HolidayService = require('../services/holiday.service');
var DiscountService = require('../services/discount.service');
var LocationService = require('../services/location.service');
var MarketingService = require('../services/marketing.service');
var AppliedDiscount = require('../services/appliedDiscount.service');
var SendEmailSmsService = require('../services/sendEmailSms.service');
var EmailLogService = require('../services/emailLog.service');
const WhatsAppLogService = require('../services/whatsAppLog.service');

const {
    inRange,
    timeToNum,
    formatDate,
    isValidJson,
    calPercentage,
    increaseDateDays
} = require('../helper');

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getDiscounts = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000;
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        var order = req.query.order ? req.query.order : '-1';
        var searchText = req.query.searchText ? req.query.searchText : '';
        var customerId = req.query?.customer_id || "";
        var discount_status = req.query?.discount_status || "";

        var query = { status: 1 };
        if (req.query.company_id) {
            query.company_id = req.query.company_id;
        }

        if (req.query.location_id) {
            query['location_id'] = { $in: [req.query.location_id, null] }
        }

        if (req.query.is_offer_module && req.query.is_offer_module == 1) {
            query.is_offer_module = 1;

            if (customerId) { query.customer_id = customerId; }
        } else {
            query.is_offer_module = { $ne: 1 };

            if (customerId) { query.customer_id = customerId; }
        }

        // customer_id
        if (req.query.discount_code_type) {
            query['discount_code_type'] = req.query.discount_code_type
        }

        if (searchText) {
            query['$or'] = [
                { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { discount_code: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ]
        }
        if (discount_status == 'active') {
            query.is_expired = 0;
        } else if (discount_status == 'expired') {
            query.is_expired = 1;
        } else if (discount_status == 'website_offer') {
            query['discount_code_type'] = discount_status
        }

        var discounts = await DiscountService.getDiscounts(query, parseInt(page), parseInt(limit), order_name, Number(order))
        var discount = discounts[0].data
        var pagination = discounts[0].pagination
        for (var i = 0; i < discount.length; i++) {
            var client_query = { status: 1 };
            client_query['_id'] = { $in: discount[i].customer_arr };
            var customers = await CustomerService.getClients(client_query);
            discount[i].customer_arr = customers; //with name

            var service_id = discount[i].service_id;
            var q = { _id: { $in: service_id }, status: 1 };
            var service = await ServiceService.getServiceSpecific(q); // for replace service name
            discount[i].service_id = service; //replace service name

            if (discount[i].paid_service_id && discount[i].paid_service_id?.length) {
                var paid_service_id = discount[i].paid_service_id;
                var qpaid = { _id: { $in: paid_service_id }, status: 1 };
                var paid_service = await ServiceService.getServiceSpecific(qpaid);
                discount[i].paid_service_id = paid_service;
            }
        }

        discounts[0].data = discount;
        discounts[0].pagination = pagination;
        // Return the Discounts list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: discounts, message: "Discounts received succesfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCustomerDiscounts = async function (req, res, next) {
    try {
        var page = Number(req.query?.page) || 1;
        var limit = Number(req.query?.limit) || 0;
        var sortBy = req.query?.sortBy || '_id';
        var sortOrder = req.query.sortOrder && JSON.parse(req.query.sortOrder) ? '1' : '-1';
        var pageIndex = 0;
        var startIndex = 0;
        var endIndex = 0;

        var customerId = req.query?.customer_id || "";
        var locationId = req.query?.location_id || "";
        var search = req.query?.searchText || "";
        var is_offer_module = Number(req.query?.is_offer_module) || 0;

        var throwError = false;
        var flag = false;
        var message = "Something went wrong!";

        if (!locationId) {
            flag = false;
            throwError = true;
            message = "Location id must be present!";
        } else if (!customerId) {
            flag = false;
            throwError = true;
            message = "Customer id must be present!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: [],
                message: message
            })
        }

        var query = { status: 1, show_to_customer: 1 };

        if (req.query.company_id) {
            query.company_id = req.query.company_id;
        }
        if (locationId) {
            query['location_id'] = { $in: [locationId, null] }
        }

        var today_date = new Date();
        var date = dateFormat(today_date, "yyyy-mm-dd");

        query['$or'] = [
            { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
            { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
        ];

        if (customerId) {
            if (is_offer_module) {
                query.customer_arr = customerId;
            } else {
                query.customer_id = customerId;
            }
        }

        if (req.query.discount_code_type) {
            query.discount_code_type = req.query.discount_code_type;
        }

        if (is_offer_module) {
            query.is_offer_module = is_offer_module;
        }

        var count = await DiscountService.getDiscountsCount(query);
        var discounts = await DiscountService.getDiscountList(query, Number(page), Number(limit), sortBy, Number(sortOrder));
        if (!discounts || !discounts?.length) {
            if (Number(req.query?.page) && Number(req.query.page) > 0) {
                page = 1;
                discounts = await DiscountService.getDiscountList(query, Number(page), Number(limit), sortBy, Number(sortOrder));
            }
        }

        if (discounts && discounts.length) {
            pageIndex = Number(page - 1);
            startIndex = (pageIndex * limit) + 1;
            endIndex = Math.min(startIndex - 1 + limit, count);
        }

        // Return the Discounts list with Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: discounts,
            pages: limit ? Math.ceil(count / limit) : 0,
            total: count,
            pageIndex: pageIndex,
            startIndex: startIndex,
            endIndex: endIndex,
            message: "Discounts received succesfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getOfferDetail = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id;
        var data = await DiscountService.getDiscount(id);
        if (!data) {
            data = await MarketingService.getMarketing(id);
        }

        // Return the Discount list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: data, message: "Discount received succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getDiscount = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id;
        var Discount = await DiscountService.getDiscount(id);
        // Return the Discount list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Discount, message: "Discount received succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getDiscountDetail = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id
        var Discount = await DiscountService.getDiscountOne({ _id: id })

        // Return the Discount list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Discount, message: "Discount received succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getActiveDiscount = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var location_id = req.query?.location_id || ""
        var today_date = new Date()
        var date = dateFormat(today_date, "yyyy-mm-dd")

        var query = { location_id: { $in: [location_id, null] }, $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }], status: 1 };

        if (req.query.company_id) {
            query.company_id = req.query.company_id;
        }

        query.is_offer_module = { $ne: 1 };

        var discounts = await DiscountService.getDiscountSpecific(query);
        // Return the Discount list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: discounts, message: "Discount received succesfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getActiveOffers = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var location_id = req.query?.location_id || ""
        var client_id = req.query?.client_id || ""

        var today_date = new Date()
        var date = dateFormat(today_date, "yyyy-mm-dd")

        var query = { location_id: { $in: [location_id, null] }, status: 1, is_offer_module: 1 }

        if (req.query.company_id) {
            query.company_id = req.query.company_id;
        }

        query['$or'] = [
            { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
            { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
        ]

        if (client_id && client_id != '') {
            query['$and'] = [
                {
                    $or: [{ customer_arr: { $elemMatch: { $eq: client_id.toString() } } },
                    { all_customer: 1 }]
                }]
        }

        var discounts = await DiscountService.getDiscountSpecific(query)
        // Return the Discount list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: discounts, message: "Discount received succesfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.checkCustomerOffer = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var locationId = req.body?.location_id || ""
    var clientId = req.body?.client_id || ""
    var serviceId = req.body?.service_id || ""
    var date = req.body.date
    var startTime = req.body?.start_time || ""
    var offerId = req.body?.offer_id || ""

    var today_date = new Date();
    today_date = dateFormat(today_date, "yyyy-mm-dd")

    var days_name = new Date(date).toLocaleString('en-us', { weekday: 'long' }).toLowerCase()

    var query = { location_id: { $in: [locationId, null] }, status: 1, is_offer_module: 1 }

    if (req.query.company_id) {
        query.company_id = req.query.company_id;
    }

    if (date) {
        query['$or'] = [
            { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
            { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
        ];
    }

    if (clientId) {
        query['$and'] = [
            {
                $or: [{ customer_arr: { $elemMatch: { $eq: clientId.toString() } } },
                { all_customer: 1 }]
            }]
    }
    if (offerId && offerId.length == 24) {
        query['_id'] = ObjectId(offerId)
    }
    // else if(serviceId && serviceId.length > 0) {
    //     query['service_id'] = { $elemMatch: { $in: serviceId } }
    // }

    try {
        var out_of_range_error = false
        var dis_time_error = false
        var service_flag;

        var discounts = await DiscountService.getDiscountSpecific(query);
        if (discounts && discounts.length > 0) {
            if (discounts[0]?.all_online_services == 1) {
                var onlineSers = await ServiceService.getServiceSpecific({ status: 1, online_status: 1, location_id: locationId });

                discounts[0].service_id = onlineSers.map(s => s._id);
            }

            var service_id = discounts[0].service_id;
            if (service_id && service_id.length > 0 && serviceId && serviceId.length > 0) {
                service_flag = false;
                for (var i = 0; i < serviceId.length; i++) {
                    var index = service_id.map(function (e) { return e; }).indexOf(serviceId[i]);
                    if (index != -1) {
                        service_flag = true;
                    }
                }
            }

            if (startTime && discounts[0].start_time && discounts[0].end_time) {
                var stime = timeToNum(startTime)
                var dst = timeToNum(discounts[0].start_time)
                var det = timeToNum(discounts[0].end_time)
                var in_range = inRange(stime, dst, det)
                if (!in_range) {
                    dis_time_error = true
                }
            }
            if (service_flag == false) {
                discounts = [];
            }
        } else {
            if (date) {
                query['$and'] = [{ end_date: { $gte: today_date } }, { end_date: { $lte: date } }]
            }

            discounts = await DiscountService.getDiscountSpecific(query)
            if (discounts && discounts.length > 0) {
                out_of_range_error = true
            }
        }

        // Return the Discount list with Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: discounts,
            dis_time_error: dis_time_error,
            out_of_range_error: out_of_range_error,
            message: "Discount received succesfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.checkClientOffer = async function (req, res, next) {
    try {
        var locationId = req.query?.location_id || "";
        var clientId = req.query?.client_id || "";
        var serviceIds = [];
        var date = req.query?.date || "";
        var startTime = req.query?.start_time || "";
        var offerId = req.query?.offer_id || "";

        if (req.query?.service_ids && isValidJson(req.query?.service_ids)) {
            serviceIds = JSON.parse(req.query?.service_ids);
        }

        var todayDate = new Date();
        todayDate = dateFormat(todayDate, "yyyy-mm-dd");

        var query = { location_id: { $in: [locationId, null] }, status: 1, is_offer_module: 1 };

        if (req.query.company_id) {
            query.company_id = req.query.company_id;
        }

        if (date) {
            query['$or'] = [
                { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
                { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
            ];
        }

        if (clientId) {
            query['$and'] = [{
                $or: [{ customer_arr: { $elemMatch: { $eq: clientId.toString() } } },
                { all_customer: 1 }]
            }];
        }

        if (serviceIds && isValidJson(serviceIds)) { serviceIds = JSON.parse(serviceIds); }

        if (offerId) {
            query._id = ObjectId(offerId);
        }

        // else if (serviceIds && serviceIds.length > 0) {
        //     query['service_id'] = { $elemMatch: { $in: serviceIds } }
        // }
        // console.log('query',query,'and',query['$and'],'or',query['$or'])

        var serviceFlag = false;
        var disTimeError = false;
        var outOfRangeError = false;
        var discount = await DiscountService.getDiscountOne(query) || null;
        if (discount && discount._id) {
            if (discount?.all_online_services == 1) {
                var onlineSers = await ServiceService.getServiceSpecific({ status: 1, online_status: 1, location_id: locationId });
                discount.service_id = onlineSers;
            }

            var service_id = discount.service_id;
            if (service_id && service_id.length > 0 && serviceIds && serviceIds.length > 0) {
                service_id = service_id.map(s => s._id);
                serviceFlag = false;
                for (var i = 0; i < serviceIds.length; i++) {
                    var index = service_id.map(function (e) { return e; }).indexOf(serviceIds[i]);
                    if (index != -1) {
                        serviceFlag = true;
                    }
                }
            }

            if (startTime && discount?.start_time && discount?.end_time) {
                var stime = timeToNum(startTime);
                var dst = timeToNum(discount.start_time);
                var det = timeToNum(discount.end_time);
                var in_range = inRange(stime, dst, det);
                if (!in_range) {
                    disTimeError = true;
                }
            }

            if (serviceFlag == false) {
                discount = null;
            }
        } else {
            if (date) {
                query['$and'] = [{ end_date: { $gte: todayDate } }, { end_date: { $lte: date } }];
            }

            discount = await DiscountService.getDiscountOne(query) || null;
            if (discount && discount._id) {
                outOfRangeError = true;
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: discount,
            dis_time_error: disTimeError,
            out_of_range_error: outOfRangeError,
            message: "Discount offer received succesfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createAppliedDiscount = async function (req, res, next) {
    try {
        // Calling the AppliedDiscount function with the new object from the Request Body
        var createdDiscount = await AppliedDiscount.createAppliedDiscount(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdDiscount, message: "Applied Discount created succesfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// for only discont code front-end with calculation
//with individual discount calucation on services
exports.getDiscountSpecific = async function (req, res, next) {

    if (!req.body.company_id) {
        return res.status(200).json({
            status: 200,
            flag: false,
            message: "Company Id must be present!"
        })
    }

    var company_id = req.body.company_id;
    var location_id = req.body.location_id;
    var discount_code = req.body.discount_code;
    var customer_id = req.body.client_id;
    var date = req.body.date;
    var get_service_id = req.body.service_id;
    var query = { company_id: company_id, status: 1 };

    query['location_id'] = { $in: [location_id, null] }

    query['$or'] = [
        { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
        { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
    ];

    var days_name = new Date(date).toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    query['discount_code'] = { $regex: '^' + discount_code + '$', $options: 'i' };

    if (req.body.is_offer_module && req.body.is_offer_module == 1) {
        query['is_offer_module'] = 1;
        discount_code = req.body.offer_discount_code;
        query['discount_code'] = { $regex: '^' + discount_code + '$', $options: 'i' };
    } else {
        query['is_offer_module'] = { $ne: 1 };
    }

    console.log('query', query)

    var total_price = 0; // total price without discount
    var discounted_price = 0; // discount price upon
    var price = 0; // total amount with discounting
    var code_applied = false; // flag for applied coupon
    var code_valid = false;
    var req_code_price = false; // flag for min order val
    var req_min_price = 0; // min order value
    var req_max_price_flag = false; // flag for max order val
    var req_max_price = 0; // max order value
    var service_flag = false;
    var per_user_occurances = false; // flag for per user occurances
    var max_occurances = false; // flag for max discount code occurances
    var weekend_flag = false;
    var holiday_flag = false;
    var days_error = false;
    var days_error_msg = "This code valid on ";
    var paid_service_error = false;
    var paid_service_msg = "You have to place this ";
    var timing_err = false;
    var timing_err_msg = '';
    var is_expired = false;
    var is_invalid = false;
    var expiry_date = '';
    var start_date = '';

    var service_type = { service_id: [], discount_type: "" };
    var st = 0;
    if (req.body.start_time) {
        st = timeToNum(req.body.start_time);
    }

    try {
        var discounts = await DiscountService.getDiscountSpecific(query)

        var discount_detail = await DiscountService.getSingleDiscount({ location_id: location_id, status: 1, discount_code: { $regex: '^' + discount_code + '$', $options: 'i' } })

        var rmst = false;
        var rest = false;
        var today_date = new Date(date);
        var final_today_date = dateFormat(today_date, "yyyy-mm-dd")

        if (discounts?.length > 0) {
            code_valid = false;
            var discount = discounts[0];
            if (discount.start_time && discount.end_time && st) {
                var mst = timeToNum(discount.start_time);
                met = timeToNum(discount.end_time);
                rmst = inRange(st, mst, met);

            }

            if (discount.evening_start_time && discount.evening_end_time && st) {
                var est = timeToNum(discount.evening_start_time);
                eet = timeToNum(discount.evening_end_time);
                rest = inRange(st, est, eet);
            }

            if (!rmst && !rest) {
                if (discount.start_time && discount.end_time && discount.evening_start_time && discount.evening_end_time) {
                    timing_err = true;
                    timing_err_msg = "Discount code apply between " + discount.start_time_meridiem + " to " + discount.end_time_meridiem + " and " + discount.evening_start_time_meridiem + " to " + discount.evening_end_time_meridiem;
                } else if (discount.start_time && discount.end_time) {
                    timing_err = true;
                    timing_err_msg = "Discount code apply between " + discount.start_time_meridiem + " to " + discount.end_time_meridiem;

                } else if (discount.evening_start_time && discount.evening_end_time) {
                    timing_err = true;
                    timing_err_msg = "Discount code apply between " + discount.evening_start_time_meridiem + " to " + discount.evening_end_time_meridiem;
                }
            }

            if (discount && ((discount.customer_id != '' && discount.customer_id == customer_id.toString()) || (discount.customer_id == '' || discount.customer_id == undefined)) || req.body.offer_discount_code && (rmst || rest)) {
                code_valid = false;
            } else {
                code_valid = true;
            }

            var discount_id = discount._id;
            var appliedQuery = { user_id: req.body.client_id, discount_id: discount_id };
            var maxAppQuery = { discount_id: discount_id };
            if (req.body.appointment_id && req.body.appointment_id != 'undefined') {
                appliedQuery['appointment_id'] = { $nin: req.body.appointment_id };
                maxAppQuery['appointment_id'] = { $nin: req.body.appointment_id };
            }

            var applied = await AppliedDiscount.getAppliedDiscountSpecific(appliedQuery)
            var maxApplied = await AppliedDiscount.getAppliedDiscountSpecific(maxAppQuery);

            var holidays = await HolidayService.getHolidaysSpecific({ location_id: location_id, status: 1 })
        } else {
            code_valid = true;
        }

        if (discounts && discounts?.length > 0) {
            if (discount?.all_online_services == 1) {
                var onlineSers = await ServiceService.getServiceSpecific({ status: 1, online_status: 1, location_id: location_id });
                discount.service_id = onlineSers.map(s => s._id);
            }

            var service_id = discount.service_id;
            if (service_id) {
                for (var i = 0; i < get_service_id.length; i++) {
                    var index = service_id.map(function (e) { return e; }).indexOf(get_service_id[i]._id);
                    if (index != -1) {
                        service_flag = true;
                    }
                }
            }

            if (parseInt(discount.max_occurances) <= maxApplied.length) {
                max_occurances = true;
            }

            if (parseInt(discount.per_user_occurances) <= applied.length) {
                per_user_occurances = true;
            }

            if (discount.weekend == "no") {
                var get_weekend = today_date.getDay();
                if (get_weekend == 6 || get_weekend == 0) {
                    weekend_flag = true;
                }
            }

            if (discount.holiday === "no") {
                for (var i = 0; i < holidays.length; i++) {
                    if (final_today_date == dateFormat(holidays[i].date, "yyyy-mm-dd")) {
                        holiday_flag = true;
                        break;
                    }
                }
            }

            if (discount.days && discount.days.length) {
                var names_of_day = "";
                for (var j = 0; j < discount.days.length; j++) {
                    if (days_name == discount.days[j]) {
                        days_error = false;
                        break;
                    } else {
                        days_error = true;
                        names_of_day += discount.days[j] + ", ";
                    }
                }
                rmv_comma = names_of_day.lastIndexOf(",");
                names_of_day = names_of_day.substring(0, rmv_comma);
                days_error_msg = days_error_msg + names_of_day.trim();
            }
        }

        if (!service_flag) {
            code_valid = true
            if (discount && discount.discount_type == "service") {
                code_valid = false
                service_flag = true
            }
        }

        var tot_val = 0;
        if (!code_valid && !timing_err) {
            if (!days_error) {
                if (!weekend_flag) {
                    if (!holiday_flag) {
                        if (!max_occurances) {
                            if (!per_user_occurances) {
                                if (service_flag) {
                                    if (discount.discount_type == "value") {
                                        for (var j = 0; j < get_service_id.length; j++) {
                                            var dis_service_id = discount.service_id;
                                            var s_index = dis_service_id.map(function (e) { return e; }).indexOf(get_service_id[j]?._id);

                                            var service = get_service_id[j];//await ServiceService.getService(get_service_id[j]);

                                            tot_val += service.price;

                                            if ((parseFloat(discount.min_order_val) > 0 || discount.min_order_val == "") && (parseFloat(discount.max_order_val) || discount.max_order_val == "") && s_index != -1) {
                                                total_price += service.price;

                                                if (total_price >= parseFloat(discount.min_order_val) || discount.min_order_val == "") {

                                                    if (total_price <= parseFloat(discount.max_order_val) || discount.max_order_val == "") {
                                                        discounted_price = parseFloat(discount.discount_value);

                                                        if (parseFloat(discount.min_discount) > 0 && parseFloat(discount.max_discount) > 0 || discount.min_discount == "" || discount.max_discount == "") {

                                                            if (discounted_price >= parseFloat(discount.min_discount) || discount.min_discount == "") {

                                                                if (discounted_price <= parseFloat(discount.max_discount) || discount.max_discount == "") {

                                                                    price = total_price - discounted_price;
                                                                    code_applied = true;
                                                                    code_valid = false;
                                                                    req_code_price = false;
                                                                    req_min_price = "";
                                                                } else {
                                                                    var max_price = parseFloat(discount.max_discount);

                                                                    if (total_price > parseFloat(discount.min_discount)) {
                                                                        var tmpPrice = total_price - max_price;

                                                                        if (tmpPrice > 0) {
                                                                            price = tmpPrice;
                                                                            discounted_price = max_price;
                                                                            code_applied = true;
                                                                            code_valid = false;
                                                                            req_code_price = false;
                                                                            req_min_price = "";
                                                                        } else {
                                                                            code_valid = true;
                                                                        }
                                                                    } else {
                                                                        code_valid = true;
                                                                    }
                                                                }
                                                            } else {
                                                                var min_price = parseFloat(discount.min_discount);
                                                                if (total_price > parseFloat(discount.min_discount)) {
                                                                    var tmpPrice = total_price - min_price;
                                                                    if (tmpPrice > 0) {
                                                                        price = tmpPrice;
                                                                        discounted_price = min_price;
                                                                        code_applied = true;
                                                                        code_valid = false;
                                                                        req_code_price = false;
                                                                        req_min_price = "";
                                                                    } else {
                                                                        code_valid = true;
                                                                    }
                                                                } else {
                                                                    code_valid = true;
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        price = total_price;
                                                        code_valid = false;
                                                        req_max_price_flag = true;
                                                        req_max_price = discount.max_order_val;
                                                        code_applied = false;
                                                        req_code_price = false;
                                                        req_min_price = "";
                                                    }
                                                } else {
                                                    price = total_price;
                                                    code_valid = false;
                                                    req_code_price = true;
                                                    req_min_price = discount.min_order_val;
                                                    code_applied = false;
                                                    req_max_price_flag = false;
                                                    req_max_price = "";
                                                }
                                            }
                                        }
                                    }

                                    if (discount.discount_type == "percentage") {
                                        for (var k = 0; k < get_service_id.length; k++) {
                                            var dis_service_id = discount.service_id;
                                            var s_index = dis_service_id.map(function (e) { return e; }).indexOf(get_service_id[k]?._id);

                                            var service = get_service_id[k] //await ServiceService.getService(get_service_id[k]);

                                            tot_val += service.price;

                                            if ((parseFloat(discount.min_order_val) > 0 || discount.min_order_val == "") && (parseFloat(discount.max_order_val) > 0 || discount.max_order_val == "") && s_index != -1) {
                                                total_price += service.price;

                                                if (total_price >= parseFloat(discount.min_order_val) || discount.min_order_val == "") {
                                                    if (total_price <= parseFloat(discount.max_order_val) || discount.max_order_val == "") {
                                                        var percen = parseFloat(discount.discount_value);
                                                        discounted_price = (total_price * percen) / 100;

                                                        if (parseFloat(discount.min_discount) > 0 && parseFloat(discount.max_discount) > 0 || discount.min_discount == "" || discount.max_discount == "") {
                                                            if (discounted_price >= parseFloat(discount.min_discount) || discount.min_discount == "") {
                                                                if (discounted_price <= parseFloat(discount.max_discount) || discount.max_discount == "") {
                                                                    price = total_price - discounted_price;
                                                                    code_applied = true;
                                                                    code_valid = false;
                                                                    req_code_price = false;
                                                                    req_min_price = "";
                                                                } else {
                                                                    var max_price = parseFloat(discount.max_discount);
                                                                    if (total_price > parseFloat(discount.min_discount)) {
                                                                        var tmpPrice = total_price - max_price;
                                                                        if (tmpPrice > 0) {
                                                                            price = tmpPrice;
                                                                            discounted_price = max_price;
                                                                            code_applied = true;
                                                                            code_valid = false;
                                                                            req_code_price = false;
                                                                            req_min_price = "";
                                                                        } else {
                                                                            code_valid = true;
                                                                        }
                                                                    } else {
                                                                        code_valid = true;
                                                                    }
                                                                }
                                                            } else {
                                                                var min_price = parseFloat(discount.min_discount);
                                                                if (total_price > parseFloat(discount.min_discount)) {
                                                                    var tmpPrice = total_price - min_price;
                                                                    if (tmpPrice > 0) {
                                                                        price = tmpPrice;
                                                                        discounted_price = min_price;
                                                                        code_applied = true;
                                                                        code_valid = false;
                                                                        req_code_price = false;
                                                                        req_min_price = "";
                                                                    } else {
                                                                        code_valid = true;
                                                                    }
                                                                } else {
                                                                    code_valid = true;
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        price = total_price;
                                                        code_valid = false;
                                                        req_max_price_flag = true;
                                                        req_max_price = discount.max_order_val;
                                                        code_applied = false;
                                                        req_code_price = false;
                                                        req_min_price = "";
                                                    }
                                                } else {
                                                    price = total_price;
                                                    code_valid = false;
                                                    req_code_price = true;
                                                    req_min_price = discount.min_order_val;
                                                    code_applied = false;
                                                    req_max_price_flag = false;
                                                    req_max_price = "";
                                                }
                                            }
                                        }
                                    }

                                    if (discount.discount_type == "service") {
                                        total_price = 0;
                                        discounted_price = 0;
                                        price = 0;
                                        service_type.discount_type = "service";
                                        var service_id = discount.service_id;

                                        if (service_id?.length) {
                                            for (var k = 0; k < service_id.length; k++) {
                                                var service = await ServiceService.getService(service_id[k]);
                                                total_price += service.price;
                                                service_type.service_id.push(service);

                                                tot_val += service.price;
                                            }

                                            discounted_price = total_price;
                                            price = total_price - discounted_price;
                                            code_applied = true;
                                            code_valid = false;
                                        } else {
                                            code_applied = false;
                                            code_valid = true;

                                            total_price = 0;
                                            discounted_price = 0;
                                            price = 0;
                                        }

                                        if (discount.paid_service_id && discount.paid_service_id.length) {
                                            var paid_service_id = discount.paid_service_id;
                                            var compare_currnt_service = [];
                                            var pd_ser_name = "";
                                            for (var l = 0; l < paid_service_id.length; l++) {
                                                var paid_service = await ServiceService.getService(paid_service_id[l]);

                                                if (paid_service && paid_service._id) {
                                                    pd_ser_name += paid_service.name + ", ";
                                                }

                                                var mtc_index = get_service_id.findIndex(x => x._id == paid_service_id[l])


                                                //var mtc_index = get_service_id.indexOf(paid_service_id[l]);

                                                if (mtc_index != -1) {
                                                    compare_currnt_service.push(get_service_id[mtc_index]._id);
                                                }
                                            }

                                            if (JSON.stringify(paid_service_id) == JSON.stringify(compare_currnt_service)) {
                                                paid_service_error = false;
                                                code_valid = false;
                                                code_applied = true;
                                            } else {
                                                paid_service_error = true;
                                                code_applied = false;
                                                code_valid = false;

                                                rmv_ser_comma = pd_ser_name.lastIndexOf(",");
                                                pd_ser_name = pd_ser_name.substring(0, rmv_ser_comma);
                                                paid_service_msg = paid_service_msg + "(" + pd_ser_name.trim() + ") services first for this code";
                                            }
                                        }

                                        req_max_price_flag = false;
                                        req_code_price = false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (code_valid && discount_detail) {
            date = new Date(date);
            expiry_date = discount_detail?.end_date;
            start_date = discount_detail?.start_date;
            if (start_date && expiry_date && (date < start_date || date > expiry_date)) {
                is_expired = true;
            } else {
                is_invalid = true;
            }
        } else if (code_valid) {
            is_invalid = true;
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: discounts,
            total_price: tot_val,
            discounted_price: discounted_price,
            price: tot_val - discounted_price,
            code_applied: code_applied,
            max_occurances: max_occurances,
            per_user_occurances: per_user_occurances,
            code_valid: code_valid,
            req_code_price: req_code_price,
            req_min_price: req_min_price,
            req_max_price_flag: req_max_price_flag,
            req_max_price: req_max_price,
            holiday_flag: holiday_flag,
            weekend_flag: weekend_flag,
            service_type: service_type,
            days_error: days_error,
            days_error_msg: days_error_msg,
            paid_service_error: paid_service_error,
            paid_service_msg: paid_service_msg,
            timing_err: timing_err,
            timing_err_msg: timing_err_msg,
            discount_detail: discount_detail,
            is_expired: is_expired,
            is_invalid: is_invalid,
            start_date: start_date,
            expiry_date: expiry_date,
            message: "Succesfully Discount Recieved"
        })
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

//without individual discount calucation on services 
exports.getDiscountSpecificBK = async function (req, res, next) {
    var location_id = req.body.location_id;
    var discount_code = req.body.discount_code;
    var customer_id = req.body.client_id;
    var date = req.body.date;
    var get_service_id = req.body.service_id;

    var query = { location_id: location_id, $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }], status: 1 };

    var days_name = new Date(date).toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    query['discount_code'] = { $regex: '^' + discount_code + '$', $options: 'i' };

    if (req.body.is_offer_module && req.body.is_offer_module == 1) {
        query['is_offer_module'] = 1;
        discount_code = req.body.offer_discount_code;
        query['discount_code'] = { $regex: '^' + discount_code + '$', $options: 'i' };
    } else {
        query['is_offer_module'] = { $ne: 1 };
    }

    var total_price = 0; // total price without discount
    var discounted_price = 0; // discount price upon
    var price = 0; // total amount with discounting
    var code_applied = false; // flag for applied coupon
    var code_valid = false;
    var req_code_price = false; // flag for min order val
    var req_min_price = 0; // min order value
    var req_max_price_flag = false; // flag for max order val
    var req_max_price = 0; // max order value
    var service_flag = false;
    var per_user_occurances = false; // flag for per user occurances
    var max_occurances = false; // flag for max discount code occurances
    var weekend_flag = false;
    var holiday_flag = false;
    var days_error = false;
    var days_error_msg = "This code valid on ";
    var paid_service_error = false;
    var paid_service_msg = "You have to place this ";
    var timing_err = false;
    var timing_err_msg = '';

    var service_type = { service_id: [], discount_type: "" };
    var st = 0;
    if (req.body.start_time) {
        st = timeToNum(req.body.start_time);
    }
    try {
        var discounts = await DiscountService.getDiscountSpecific(query)
        var rmst = false;
        var rest = false;
        var today_date = new Date(date);
        var final_today_date = dateFormat(today_date, "yyyy-mm-dd")

        if (discounts.length > 0) {
            code_valid = false;
            var discount = discounts[0];
            if (discount.start_time && discount.end_time && st) {
                mst = timeToNum(discount.start_time);
                met = timeToNum(discount.end_time);
                rmst = inRange(st, mst, met);

            }

            if (discount.evening_start_time && discount.evening_end_time && st) {
                est = timeToNum(discount.evening_start_time);
                eet = timeToNum(discount.evening_end_time);
                rest = inRange(st, est, eet);
            }

            if (!rmst && !rest) {
                if (discount.start_time && discount.end_time && discount.evening_start_time && discount.evening_end_time) {
                    timing_err = true;
                    timing_err_msg = "Discount code apply between " + discount.start_time_meridiem + " to " + discount.end_time_meridiem + " and " + discount.evening_start_time_meridiem + " to " + discount.evening_end_time_meridiem;
                } else if (discount.start_time && discount.end_time) {
                    timing_err = true;
                    timing_err_msg = "Discount code apply between " + discount.start_time_meridiem + " to " + discount.end_time_meridiem;

                } else if (discount.evening_start_time && discount.evening_end_time) {
                    timing_err = true;
                    timing_err_msg = "Discount code apply between " + discount.evening_start_time_meridiem + " to " + discount.evening_end_time_meridiem;
                }
            }

            if (discount && ((discount.customer_id != '' && discount.customer_id == customer_id.toString()) || (discount.customer_id == '' || discount.customer_id == undefined)) || req.body.offer_discount_code && (rmst || rest)) {
                code_valid = false;
            } else {
                code_valid = true;
            }

            var discount_id = discount._id;
            var appliedQuery = { user_id: req.body.client_id, discount_id: discount_id };
            var maxAppQuery = { discount_id: discount_id };
            if (req.body.appointment_id && req.body.appointment_id != 'undefined') {
                appliedQuery['appointment_id'] = { $nin: req.body.appointment_id };
                maxAppQuery['appointment_id'] = { $nin: req.body.appointment_id };
            }

            var applied = await AppliedDiscount.getAppliedDiscountSpecific(appliedQuery)
            var maxApplied = await AppliedDiscount.getAppliedDiscountSpecific(maxAppQuery);

            var holidays = await HolidayService.getHolidaysSpecific({ location_id: location_id, status: 1 })
        } else {
            code_valid = true;
        }

        if (discounts && discounts.length > 0) {
            if (discount?.all_online_services == 1) {
                var onlineSers = await ServiceService.getServiceSpecific({ status: 1, online_status: 1, location_id: location_id });

                discount.service_id = onlineSers.map(s => s._id);
            }
            else if (discount?.apply_on_all_services == 1) {
                var onlineSers = await ServiceService.getServiceSpecific({ status: 1, location_id: location_id });

                discount.service_id = onlineSers.map(s => s._id);
            }

            var service_id = discount.service_id;
            if (service_id) {
                for (var i = 0; i < get_service_id.length; i++) {
                    var index = service_id.map(function (e) { return e; }).indexOf(get_service_id[i]);
                    if (index != -1) {
                        service_flag = true;
                    }
                }
            }

            if (parseInt(discount.max_occurances) <= maxApplied.length) {
                max_occurances = true;
            }

            if (parseInt(discount.per_user_occurances) <= applied.length) {
                per_user_occurances = true;
            }

            if (discount.weekend == "no") {
                var get_weekend = today_date.getDay();
                if (get_weekend == 6 || get_weekend == 0) {
                    weekend_flag = true;
                }
            }

            if (discount.holiday === "no") {
                for (var i = 0; i < holidays.length; i++) {
                    if (final_today_date == dateFormat(holidays[i].date, "yyyy-mm-dd")) {
                        holiday_flag = true;
                        break;
                    }
                }
            }

            if (discount.days && discount.days.length) {
                var names_of_day = "";
                for (var j = 0; j < discount.days.length; j++) {
                    if (days_name == discount.days[j]) {
                        days_error = false;
                        break;
                    } else {
                        days_error = true;
                        names_of_day += discount.days[j] + ", ";
                    }
                }
                rmv_comma = names_of_day.lastIndexOf(",");
                names_of_day = names_of_day.substring(0, rmv_comma);
                days_error_msg = days_error_msg + names_of_day.trim();
            }
        }

        if (!service_flag) {
            code_valid = true
            if (discount && discount.discount_type == "service") {
                code_valid = false
                service_flag = true
            }
        }
        var tot_val = 0;
        if (!code_valid && !timing_err) {
            if (!days_error) {
                if (!weekend_flag) {
                    if (!holiday_flag) {
                        if (!max_occurances) {
                            if (!per_user_occurances) {
                                if (service_flag) {
                                    if (discount.discount_type == "value") {
                                        for (var j = 0; j < get_service_id.length; j++) {

                                            var dis_service_id = discount.service_id;
                                            var s_index = dis_service_id.map(function (e) { return e; }).indexOf(get_service_id[j]);

                                            var service = await ServiceService.getService(get_service_id[j]);

                                            tot_val += service.price;

                                            if ((parseFloat(discount.min_order_val) > 0 || discount.min_order_val == "") && (parseFloat(discount.max_order_val) || discount.max_order_val == "") && s_index != -1) {

                                                total_price += service.price;

                                                if (total_price >= parseFloat(discount.min_order_val) || discount.min_order_val == "") {

                                                    if (total_price <= parseFloat(discount.max_order_val) || discount.max_order_val == "") {

                                                        discounted_price = parseFloat(discount.discount_value);

                                                        if (parseFloat(discount.min_discount) > 0 && parseFloat(discount.max_discount) > 0 || discount.min_discount == "" || discount.max_discount == "") {

                                                            if (discounted_price >= parseFloat(discount.min_discount) || discount.min_discount == "") {

                                                                if (discounted_price <= parseFloat(discount.max_discount) || discount.max_discount == "") {

                                                                    price = total_price - discounted_price;
                                                                    code_applied = true;
                                                                    code_valid = false;
                                                                    req_code_price = false;
                                                                    req_min_price = "";
                                                                } else {
                                                                    var max_price = parseFloat(discount.max_discount);

                                                                    if (total_price > parseFloat(discount.min_discount)) {
                                                                        var tmpPrice = total_price - max_price;

                                                                        if (tmpPrice > 0) {
                                                                            price = tmpPrice;
                                                                            discounted_price = max_price;
                                                                            code_applied = true;
                                                                            code_valid = false;
                                                                            req_code_price = false;
                                                                            req_min_price = "";
                                                                        } else {
                                                                            code_valid = true;
                                                                        }
                                                                    } else {
                                                                        code_valid = true;
                                                                    }
                                                                }
                                                            } else {
                                                                var min_price = parseFloat(discount.min_discount);
                                                                if (total_price > parseFloat(discount.min_discount)) {
                                                                    var tmpPrice = total_price - min_price;
                                                                    if (tmpPrice > 0) {
                                                                        price = tmpPrice;
                                                                        discounted_price = min_price;
                                                                        code_applied = true;
                                                                        code_valid = false;
                                                                        req_code_price = false;
                                                                        req_min_price = "";
                                                                    } else {
                                                                        code_valid = true;
                                                                    }
                                                                } else {
                                                                    code_valid = true;
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        price = total_price;
                                                        code_valid = false;
                                                        req_max_price_flag = true;
                                                        req_max_price = discount.max_order_val;
                                                        code_applied = false;
                                                        req_code_price = false;
                                                        req_min_price = "";
                                                    }
                                                } else {
                                                    price = total_price;
                                                    code_valid = false;
                                                    req_code_price = true;
                                                    req_min_price = discount.min_order_val;
                                                    code_applied = false;
                                                    req_max_price_flag = false;
                                                    req_max_price = "";
                                                }
                                            }

                                        }
                                    }

                                    if (discount.discount_type == "percentage") {
                                        for (var k = 0; k < get_service_id.length; k++) {

                                            var dis_service_id = discount.service_id;
                                            var s_index = dis_service_id.map(function (e) { return e; }).indexOf(get_service_id[k]);

                                            var service = await ServiceService.getService(get_service_id[k]);

                                            tot_val += service.price;

                                            if ((parseFloat(discount.min_order_val) > 0 || discount.min_order_val == "") && (parseFloat(discount.max_order_val) > 0 || discount.max_order_val == "") && s_index != -1) {

                                                total_price += service.price;

                                                if (total_price >= parseFloat(discount.min_order_val) || discount.min_order_val == "") {
                                                    if (total_price <= parseFloat(discount.max_order_val) || discount.max_order_val == "") {
                                                        var percen = parseFloat(discount.discount_value);
                                                        discounted_price = (total_price * percen) / 100;

                                                        if (parseFloat(discount.min_discount) > 0 && parseFloat(discount.max_discount) > 0 || discount.min_discount == "" || discount.max_discount == "") {
                                                            if (discounted_price >= parseFloat(discount.min_discount) || discount.min_discount == "") {
                                                                if (discounted_price <= parseFloat(discount.max_discount) || discount.max_discount == "") {
                                                                    price = total_price - discounted_price;
                                                                    code_applied = true;
                                                                    code_valid = false;
                                                                    req_code_price = false;
                                                                    req_min_price = "";
                                                                } else {
                                                                    var max_price = parseFloat(discount.max_discount);
                                                                    if (total_price > parseFloat(discount.min_discount)) {
                                                                        var tmpPrice = total_price - max_price;
                                                                        if (tmpPrice > 0) {
                                                                            price = tmpPrice;
                                                                            discounted_price = max_price;
                                                                            code_applied = true;
                                                                            code_valid = false;
                                                                            req_code_price = false;
                                                                            req_min_price = "";
                                                                        } else {
                                                                            code_valid = true;
                                                                        }
                                                                    } else {
                                                                        code_valid = true;
                                                                    }
                                                                }
                                                            } else {
                                                                var min_price = parseFloat(discount.min_discount);
                                                                if (total_price > parseFloat(discount.min_discount)) {
                                                                    var tmpPrice = total_price - min_price;
                                                                    if (tmpPrice > 0) {
                                                                        price = tmpPrice;
                                                                        discounted_price = min_price;
                                                                        code_applied = true;
                                                                        code_valid = false;
                                                                        req_code_price = false;
                                                                        req_min_price = "";
                                                                    } else {
                                                                        code_valid = true;
                                                                    }
                                                                } else {
                                                                    code_valid = true;
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        price = total_price;
                                                        code_valid = false;
                                                        req_max_price_flag = true;
                                                        req_max_price = discount.max_order_val;
                                                        code_applied = false;
                                                        req_code_price = false;
                                                        req_min_price = "";
                                                    }
                                                } else {
                                                    price = total_price;
                                                    code_valid = false;
                                                    req_code_price = true;
                                                    req_min_price = discount.min_order_val;
                                                    code_applied = false;
                                                    req_max_price_flag = false;
                                                    req_max_price = "";
                                                }
                                            }
                                        }
                                    }

                                    if (discount.discount_type == "service") {

                                        total_price = 0;
                                        discounted_price = 0;
                                        price = 0;
                                        service_type.discount_type = "service";
                                        var service_id = discount.service_id;

                                        if (service_id.length) {
                                            for (var k = 0; k < service_id.length; k++) {
                                                var service = await ServiceService.getService(service_id[k]);
                                                total_price += service.price;
                                                service_type.service_id.push(service);

                                                tot_val += service.price;
                                            }

                                            discounted_price = total_price;
                                            price = total_price - discounted_price;
                                            code_applied = true;
                                            code_valid = false;
                                        } else {
                                            code_applied = false;
                                            code_valid = true;

                                            total_price = 0;
                                            discounted_price = 0;
                                            price = 0;
                                        }

                                        if (discount.paid_service_id && discount.paid_service_id.length) {
                                            var paid_service_id = discount.paid_service_id;
                                            var compare_currnt_service = [];
                                            var pd_ser_name = "";
                                            for (var l = 0; l < paid_service_id.length; l++) {
                                                var paid_service = await ServiceService.getService(paid_service_id[l]);

                                                if (paid_service && paid_service._id) {
                                                    pd_ser_name += paid_service.name + ", ";
                                                }

                                                var mtc_index = get_service_id.indexOf(paid_service_id[l]);

                                                if (mtc_index != -1) {
                                                    compare_currnt_service.push(get_service_id[mtc_index]);
                                                }
                                            }

                                            if (JSON.stringify(paid_service_id) == JSON.stringify(compare_currnt_service)) {
                                                paid_service_error = false;
                                                code_valid = false;
                                                code_applied = true;
                                            } else {
                                                paid_service_error = true;
                                                code_applied = false;
                                                code_valid = false;

                                                rmv_ser_comma = pd_ser_name.lastIndexOf(",");
                                                pd_ser_name = pd_ser_name.substring(0, rmv_ser_comma);
                                                paid_service_msg = paid_service_msg + "(" + pd_ser_name.trim() + ") services first for this code";
                                            }
                                        }

                                        req_max_price_flag = false;
                                        req_code_price = false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: discounts,
            total_price: tot_val,
            discounted_price: discounted_price,
            price: tot_val - discounted_price,
            code_applied: code_applied,
            max_occurances: max_occurances,
            per_user_occurances: per_user_occurances,
            code_valid: code_valid,
            req_code_price: req_code_price,
            req_min_price: req_min_price,
            req_max_price_flag: req_max_price_flag,
            req_max_price: req_max_price,
            holiday_flag: holiday_flag,
            weekend_flag: weekend_flag,
            service_type: service_type,
            days_error: days_error,
            days_error_msg: days_error_msg,
            paid_service_error: paid_service_error,
            paid_service_msg: paid_service_msg,
            timing_err: timing_err,
            timing_err_msg: timing_err_msg,
            message: "Discount received succesfully!"
        })
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

const sendOfferEmail = (to, name, subject, temFile, html, toMail) => new Promise(
    announcePDFReady => {
        Promise.
            all([]).
            then(async function ([results1, results2]) {
                var createdMail = await SendEmailSmsService.sendMail(to, name, subject, temFile, html, toMail)

                announcePDFReady(createdMail)
            })
    }
)

exports.sendDiscountSms = async function (req, res, next) {
    try {
        var cust_query = { is_customer: 1, location_id: "60bf6d91768da009dbe78472" }
        var customers = await CustomerService.getCustomersSpecific(cust_query)
        if (customers && customers.length > 0) {
            var loc_query = { _id: ObjectId("60bf6d91768da009dbe78472") }
            var location = await LocationService.getLocationComapany(loc_query)

        }
        return res.status(200).json({ status: 200, flag: true, data: customers, message: "Succesfully Send Discount SMS" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createDiscount = async function (req, res, next) {
    try {
        if (req.body?.start_time) {
            var stime = req.body.start_time
            var showStartTimeSpilt = stime.split(':')
            var end_hour = showStartTimeSpilt[0]
            var stimeToNum = end_hour >= 12 ? 'PM' : 'AM'
            end_hour = end_hour > 12 ? end_hour - 12 : end_hour
            showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
            stime = showStartTimeSpilt.join(':')

            req.body.start_time_meridiem = stime + " " + stimeToNum
        }

        if (req.body?.end_time) {
            var etime = req.body.end_time
            var showEndTimeSpilt = etime.split(':')
            var end_hour = showEndTimeSpilt[0]
            var etimeToNum = end_hour >= 12 ? 'PM' : 'AM'
            end_hour = end_hour > 12 ? end_hour - 12 : end_hour
            showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
            etime = showEndTimeSpilt.join(':')

            req.body.end_time_meridiem = etime + " " + etimeToNum
        }

        if (req.body?.evening_start_time) {
            var stime = req.body.evening_start_time
            var showStartTimeSpilt = stime.split(':')
            var end_hour = showStartTimeSpilt[0]
            var stimeToNum = end_hour >= 12 ? 'PM' : 'AM'
            end_hour = end_hour > 12 ? end_hour - 12 : end_hour
            showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
            stime = showStartTimeSpilt.join(':')

            req.body.evening_start_time_meridiem = stime + " " + stimeToNum
        }

        if (req.body.evening_end_time) {
            var etime = req.body.evening_end_time
            var showEndTimeSpilt = etime.split(':')
            var end_hour = showEndTimeSpilt[0]
            var etimeToNum = end_hour >= 12 ? 'PM' : 'AM'
            end_hour = end_hour > 12 ? end_hour - 12 : end_hour
            showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
            etime = showEndTimeSpilt.join(':')

            req.body.evening_end_time_meridiem = etime + " " + etimeToNum
        }

        var createdDiscount = await DiscountService.createDiscount(req.body)
        var customers = []
        if (req.body.all_customer && req.body.all_customer != false) {
            var cust_query = { is_customer: 1, location_ids: { $elemMatch: { $eq: createdDiscount.location_id } } }
            customers = await CustomerService.getCustomersSpecific(cust_query)
        } else if (createdDiscount && createdDiscount.customer_arr && createdDiscount.customer_arr.length > 0) {
            var cust_query = { _id: { $in: createdDiscount.customer_arr }, is_customer: 1 }
            customers = await CustomerService.getCustomersSpecific(cust_query)
        }

        if (customers && customers?.length > 0 && req.body.send_email && req.body.send_email == 1) {
            var loc_query = { _id: ObjectId(req.body.location_id.toString()) }
            var location = await LocationService.getLocationComapany(loc_query)

            var currency = location[0]?.currency ? location[0]?.currency.symbol : "£";

            var booking_url = process.env.SITE_URL + "/booking/" + createdDiscount._id
            var discount_value = createdDiscount?.discount_value || 0
            if (createdDiscount?.discount_type == 'value') {
                discount_value = '£' + discount_value
            } else {
                discount_value = discount_value + '%'
            }

            var toMail = {}
            toMail['site_url'] = process.env.API_URL
            toMail['link_url'] = process.env.SITE_URL
            toMail['location_name'] = location[0]?.name
            toMail['location_contact'] = location[0]?.contact_number
            toMail['location_domain'] = location[0]?.domain
            toMail['company_name'] = location[0]?.comapny_name
            toMail['front_url'] = process.env.FRONT_URL

            toMail['booking_url'] = booking_url
            toMail['company_website'] = location[0]?.contact_link
            toMail['start_date'] = dateFormat(createdDiscount.start_date, "dd-mmm-yyyy")
            toMail['end_date'] = dateFormat(createdDiscount.end_date, "dd-mmm-yyyy")
            toMail['start_time_meridiem'] = createdDiscount.start_time_meridiem
            toMail['end_time_meridiem'] = createdDiscount.end_time_meridiem
            toMail['discount_value'] = discount_value

            var email_template = {}
            var sub = "Client Special Offer"
            html = req.body.offer_email_template
            var template_link = ''
            if (createdDiscount._id && createdDiscount.is_offer_module) {
                var host = process.env.SITE_URL + "/offer-template"
                var link = host + "/" + createdDiscount._id
                var unique_id = (new Date()).getTime().toString(36)
                const alias_data = { 'url': link, "domain": "apgem.co", 'alias': unique_id }
                const post_data = JSON.stringify(alias_data)
                var short_link = await SendEmailSmsService.generateShortLink(link, unique_id)
                if (short_link && short_link != '') {
                    template_link = short_link
                }
            }

            var maillist = []
            var temFile = "offer_mail.hjs"
            var subject = sub
            if (template_link && template_link != '' && customers) {
                for (var c = 0; c < customers?.length; c++) {
                    if (customers[c].email && customers[c].email != '' && customers[c].marketing_email_notification != 0 && createdDiscount.email_notification) {
                        maillist.push(customers[c].email)
                        toMail['client_id'] = customers[c]._id
                        toMail['client_name'] = customers[c].name
                        toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + customers[c]._id
                        var name = customers[c].name;
                        var to = customers[c].email;

                        var emailData = {
                            company_id: location[0]?.company_id,
                            location_id: location[0]?._id,
                            client_id: customers[c]._id,
                            subject: subject,
                            name: customers[c].name,
                            type: "offer",
                            file_type: "offer_mail",
                            temp_file: temFile,
                            html: html,
                            data: toMail,
                            date: Date(),
                            to_email: to,
                            status: "initial",
                            response: null,
                            response_status: '',
                            email_type: 'marketing'
                        }

                        var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
                        var tillDate = increaseDateDays(new Date, days)
                        if (tillDate) {
                            emailData.till_date = tillDate
                        }

                        var eLog = EmailLogService.createEmailLog(emailData)
                    }

                    if (customers[c].mobile && customers[c].mobile != '' && customers[c].marketing_sms_notification != 0 && createdDiscount.sms_notification) {
                        var msg = "New offer is available at " + location[0]?.comapny_name + " " + location[0]?.name + ". To view it, Please visit " + template_link + " to know more about the offer."
                        var number = customers[c].mobile
                        number = parseInt(number, 10)

                        var days = process.env?.SMS_MAX_DATE_LIMIT || 2
                        var tillDate = increaseDateDays(new Date, days)

                        var is_wa_exist = customers[c].wa_verified ?? 0;
                        var is_WA_set = await getWhatsAppDetails(location?._id)

                        if (is_wa_exist && is_WA_set) {
                            var waMsgData = {
                                company_id: location[0]?.company_id,
                                location_id: location[0]?._id,
                                client_id: customers[c]._id,
                                type: "cron",
                                msg_type: "client_offer",
                                date: Date(),
                                mobile: customers[c].mobile,
                                content: msg,
                                status: "initial",
                                till_date: tillDate ?? null
                            }
                            await WhatsAppLogService.createWhatsAppLog(waMsgData)
                        }

                        if (!is_wa_exist || !is_WA_set) {
                            var country_code = location.length ? location[0].country_code : 44
                            var params = {
                                Message: msg,
                                PhoneNumber: '+' + country_code + number
                            }
                            var numSegments = 1
                            var smsData = {
                                company_id: location[0]?.company_id,
                                location_id: location[0]?._id,
                                client_id: customers[c]._id,
                                type: "cron",
                                sms_type: "client_offer",
                                date: Date(),
                                mobile: customers[c].mobile,
                                content: msg,
                                sms_count: numSegments,
                                sms_setting: location[0]?.sms_setting,
                                status: "initial",
                                till_date: tillDate ?? null
                            }
                            var smsLog = await SmslogService.createSmsLog(smsData)
                        }
                    }
                }

                // if (maillist && maillist?.length > 0) {
                //     var to = maillist.toString()
                //     var createdMail = await SendEmailSmsService.sendEmailToMultipleRecipients(to, name, subject, temFile, html, toMail)
                // }
            }
        }

        var location = await LocationService.getActiveLocations({ _id: ObjectId(req.body.location_id), status: 1 })
        var client_query = { _id: { $in: createdDiscount.customer_arr } }
        var customers = await CustomerService.getClients(client_query)
        createdDiscount.customer_arr = customers //with name

        var service_id = createdDiscount.service_id
        var q = { _id: { $in: service_id } }
        var service = await ServiceService.getServiceSpecific(q) // for replace service name
        createdDiscount.service_id = service //replace service name
        if (createdDiscount?.paid_service_id && createdDiscount.paid_service_id?.length) {
            var paid_service_id = createdDiscount.paid_service_id
            var qpaid = { _id: { $in: paid_service_id } }
            var paid_service = await ServiceService.getServiceSpecific(qpaid)
            createdDiscount.paid_service_id = paid_service
        }

        return res.status(200).json({ status: 200, flag: true, data: createdDiscount, location: location, services: service, message: "Discount created succesfully!" })
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateDiscount = async function (req, res, next) {
    // Id is necessary for the update
    try {
        if (!req.body._id) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: "Id must be present!"
            })
        }

        if (req.body?.start_time) {
            var stime = req.body.start_time
            var showStartTimeSpilt = stime.split(':')
            var end_hour = showStartTimeSpilt[0]
            var stimeToNum = end_hour >= 12 ? 'PM' : 'AM'
            end_hour = end_hour > 12 ? end_hour - 12 : end_hour
            showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
            stime = showStartTimeSpilt.join(':')

            req.body.start_time_meridiem = stime + " " + stimeToNum
        }

        if (req.body?.end_time) {
            var etime = req.body.end_time
            var showEndTimeSpilt = etime.split(':')
            var end_hour = showEndTimeSpilt[0]
            var etimeToNum = end_hour >= 12 ? 'PM' : 'AM'
            end_hour = end_hour > 12 ? end_hour - 12 : end_hour
            showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
            etime = showEndTimeSpilt.join(':')

            req.body.end_time_meridiem = etime + " " + etimeToNum
        }

        if (req.body?.evening_start_time) {
            var stime = req.body.evening_start_time
            var showStartTimeSpilt = stime.split(':')
            var end_hour = showStartTimeSpilt[0]
            var stimeToNum = end_hour >= 12 ? 'PM' : 'AM'
            end_hour = end_hour > 12 ? end_hour - 12 : end_hour
            showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
            stime = showStartTimeSpilt.join(':')
            req.body.evening_start_time_meridiem = stime + " " + stimeToNum
        }

        if (req.body?.evening_end_time) {
            var etime = req.body.evening_end_time
            var showEndTimeSpilt = etime.split(':')
            var end_hour = showEndTimeSpilt[0]
            var etimeToNum = end_hour >= 12 ? 'PM' : 'AM'
            end_hour = end_hour > 12 ? end_hour - 12 : end_hour
            showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
            etime = showEndTimeSpilt.join(':')

            req.body.evening_end_time_meridiem = etime + " " + etimeToNum
        }

        req.body.offer_image = "/images/special-offer-banner.png"
        var discount = await DiscountService.updateDiscount(req.body)

        var location = await LocationService.getActiveLocations({ _id: ObjectId(req.body.location_id), status: 1 })
        var client_query = { _id: { $in: discount.customer_arr } }
        var customer_arr = await CustomerService.getClients(client_query)
        discount.customer_arr = customer_arr // with name

        var customers = []
        if (discount.all_customer && discount.all_customer == 1) {
            var cust_query = { is_customer: 1, location_ids: { $elemMatch: { $eq: discount.location_id } } }
            customers = await CustomerService.getCustomersSpecific(cust_query)
        } else if (discount && discount?.customer_arr?.length > 0) {
            customers = discount.customer_arr
        }

        if (customers && customers?.length > 0 && req.body.send_email && req.body.send_email == 1) {
            var loc_query = { _id: ObjectId(req.body.location_id.toString()) }
            var location = await LocationService.getLocationComapany(loc_query)
            var booking_url = process.env.SITE_URL + "/booking/" + discount._id
            var discount_value = discount?.discount_value || 0
            if (discount.discount_type == 'value') {
                discount_value = '£' + discount_value
            } else {
                discount_value = discount_value + '%'
            }

            var toMail = {}
            toMail['site_url'] = process.env.API_URL
            toMail['link_url'] = process.env.SITE_URL
            toMail['location_name'] = location[0].name
            toMail['location_contact'] = location[0].contact_number
            toMail['location_domain'] = location[0].domain
            toMail['front_url'] = process.env.FRONT_URL
            toMail['company_name'] = location[0].comapny_name
            toMail['booking_url'] = booking_url
            toMail['company_website'] = location[0].contact_link
            toMail['start_date'] = dateFormat(discount.start_date, "dd-mmm-yyyy")
            toMail['end_date'] = dateFormat(discount.end_date, "dd-mmm-yyyy")
            toMail['start_time_meridiem'] = discount.start_time_meridiem
            toMail['end_time_meridiem'] = discount.end_time_meridiem
            toMail['discount_value'] = discount_value


            var email_template = {}
            var sub = req.body.offer_email_subject
            if (!req.body.offer_email_template) {
                toMail['title'] = req.body.email_title
                toMail['desc'] = req.body.email_desc
                toMail['offer_image'] = process.env.API_URL + "/images/special-offer-banner.png"
                var temFile = "offer_template_mail.hjs"
                var rtemplate = fs.readFileSync('./templates/backup/' + temFile, 'utf-8')
                var compiledTemplate = Hogan.compile(rtemplate)
                text = toMail
                html = compiledTemplate.render({ text })
                discount.offer_email_template = html
                discount.offer_image = "/images/special-offer-banner.png"

                await DiscountService.updateDiscount(discount)
            } else {
                html = req.body.offer_email_template
            }

            var template_link = '';
            if (discount?._id && discount?.is_offer_module) {
                var host = process.env.SITE_URL + "/offer-template"
                var link = host + "/" + discount._id
                var unique_id = (new Date()).getTime().toString(36)
                const alias_data = { 'url': link, "domain": "apgem.co", 'alias': unique_id }
                const post_data = JSON.stringify(alias_data)
                var short_link = await SendEmailSmsService.generateShortLink(link, unique_id)
                if (short_link && short_link != '') {
                    template_link = short_link
                }
            }

            var maillist = []
            var temFile = "offer_mail.hjs"
            var subject = sub
            if (template_link && template_link != '') {
                for (var c = 0; c < customers?.length; c++) {
                    if (customers[c].email && customers[c].email != '' && customers[c].marketing_email_notification != 0 && discount.email_notification) {
                        maillist.push(customers[c].email)
                        toMail['client_id'] = customers[c]._id
                        toMail['client_name'] = customers[c].name
                        toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + customers[c]._id
                        var name = customers[c].name
                        var to = customers[c].email

                        var emailData = {
                            company_id: location[0].company_id,
                            location_id: location[0]._id,
                            client_id: customers[c]._id,
                            subject: subject,
                            name: customers[c].name,
                            type: "offer",
                            file_type: "offer_mail",
                            temp_file: temFile,
                            html: html,
                            data: toMail,
                            date: Date(),
                            to_email: to,
                            status: "initial",
                            response: null,
                            response_status: '',
                        }

                        var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
                        var tillDate = increaseDateDays(new Date, days)
                        if (tillDate) {
                            emailData.till_date = tillDate
                        }

                        var eLog = EmailLogService.createEmailLog(emailData)
                    }

                    if (customers[c].mobile && customers[c].mobile != '' && customers[c].marketing_sms_notification != 0 && discount.sms_notification) {
                        var msg = "New offer is available at " + location[0].comapny_name + " " + location[0].name + ". To view it, Please visit " + template_link + " to know more about the offer."

                        var number = customers[c].mobile
                        number = parseInt(number, 10)

                        var days = process.env?.SMS_MAX_DATE_LIMIT || 2
                        var tillDate = increaseDateDays(new Date, days)

                        var is_wa_exist = customers[c].wa_verified ?? 0;
                        var is_WA_set = await getWhatsAppDetails(location?._id)

                        if (is_wa_exist && is_WA_set) {

                            var waMsgData = {
                                company_id: location[0].company_id,
                                location_id: location[0]._id,
                                client_id: customers[c]._id,
                                type: "cron",
                                msg_type: "client_offer",
                                date: Date(),
                                mobile: customers[c].mobile,
                                content: msg,
                                status: "initial",
                                till_date: tillDate ?? null
                            }
                            await WhatsAppLogService.createWhatsAppLog(waMsgData)
                        }

                        if (!is_wa_exist || !is_WA_set) {

                            var country_code = location.length ? location[0].country_code : 44
                            var params = {
                                Message: msg,
                                PhoneNumber: '+' + country_code + number
                            }

                            var numSegments = 1
                            var smsData = {
                                company_id: location[0].company_id,
                                location_id: location[0]._id,
                                client_id: customers[c]._id,
                                type: "cron",
                                sms_type: "client_offer",
                                date: Date(),
                                mobile: customers[c].mobile,
                                content: msg,
                                sms_count: numSegments,
                                sms_setting: location[0].sms_setting,
                                status: "initial",
                                till_date: tillDate ?? null
                            }
                            var smsLog = await SmslogService.createSmsLog(smsData)
                        }
                    }
                }

                // if (maillist && maillist?.length > 0) {
                //     var to = maillist.toString()
                //     var createdMail = await SendEmailSmsService.sendEmailToMultipleRecipients(to, name, subject, temFile, html, toMail)
                // }
            }
        }

        var service_id = discount.service_id
        var q = { _id: { $in: service_id } }
        var service = await ServiceService.getServiceSpecific(q) // for replace service name
        discount.service_id = service // replace service name

        if (discount?.paid_service_id && discount.paid_service_id?.length) {
            var paid_service_id = discount.paid_service_id
            var qpaid = { _id: { $in: paid_service_id } }
            var paid_service = await ServiceService.getServiceSpecific(qpaid)
            discount.paid_service_id = paid_service
        }

        return res.status(200).json({ status: 200, flag: true, data: discount, location: location, services: service, message: "Discount updated succesfully!" })
    } catch (e) {
        // console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeDiscount = async function (req, res, next) {
    var id = req.params.id
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await DiscountService.deleteDiscount(id)
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

const numToTime = function (num) {
    m = num % 60
    h = parseInt(num / 60)
    // console.log('m',m)
    // console.log('h',h)
    return (h > 9 ? h : "0" + h) + ":" + (m > 9 ? m : "0" + m)
} //ex: $num=605 605%60 == 5 ,605/60 == 10  return 10:05

exports.removeMultipleData = async function (req, res, next) {
    var ids = req.body.ids
    if (ids?.length == 0) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var query = { _id: { $in: req.body.ids } }
        var deleted = await DiscountService.updateManyDiscountStatus(query)
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// Discont code with calculation
exports.getDiscountCodeMatch = async function (req, res, next) {
    try {
        var date = req.body?.date || "";
        var startTime = req.body?.start_time || "";
        var customerId = req.body?.client_id || "";
        var company_id = req.body.company_id;
        var locationId = req.body?.location_id || "";
        var serviceIds = req.body?.service_ids || [];
        var discountCode = req.body?.discount_code || "";
        var appointmentId = req.body?.appointment_id || "";
        var isOfferModule = req.body?.is_offer_module || 0;
        var offerDiscountCode = req.body?.offer_discount_code || "";

        if (date) { date = formatDate(date, "YYYY-MM-DD"); }

        var query = { company_id: company_id, status: 1 };

        query['location_id'] = { $in: [locationId, null] }

        query['$or'] = [
            { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
            { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
        ];

        query.discount_code = { $regex: '^' + discountCode + '$', $options: 'i' };

        if (serviceIds && isValidJson(serviceIds)) { serviceIds = JSON.parse(serviceIds); }

        query['is_offer_module'] = { $ne: 1 };
        if (isOfferModule == 1) {
            query['is_offer_module'] = 1;
            query['discount_code'] = { $regex: '^' + offerDiscountCode + '$', $options: 'i' };
        }

        var daysName = new Date(date)?.toLocaleString('en-us', { weekday: 'long' })?.toLowerCase() || "";
        var todayDate = new Date(date);
        var finalTodayDate = dateFormat(todayDate, "yyyy-mm-dd");

        var serviceType = { service_id: [], discount_type: "" };
        var st = 0;
        if (startTime) { st = timeToNum(startTime); }

        var message = "Discount code received succesfully!";

        var rmst = false;
        var rest = false;
        var codeValid = true;
        var serviceFlag = false;
        var weekendFlag = false;
        var holidayFlag = false;
        var codeApplied = false; // flag for applied coupon
        var maxOccurances = false; // flag for max discount code occurances
        var perUserOccurances = false; // flag for per user occurances
        var daysError = false;
        var daysErrorMsg = "This code valid on ";
        var timingError = false;
        var timingErrorMsg = "";
        var paidServiceError = false;
        var paidServiceMsg = "You have to place this ";
        var isExpired = false;
        var isInvalid = false;
        var expiryDate = "";
        var startDate = "";

        var totalPrice = 0; // total price without discount
        var discountType = ""; // Type of discount (value|percent)
        var discountedPrice = 0; // discount price upon
        var price = 0; // total amount with discounting

        var reqCodePrice = false; // flag for min order val
        var reqMinPrice = 0; // min order value
        var reqMaxPriceFlag = false; // flag for max order val
        var reqMaxPrice = 0; // max order value

        var discount = await DiscountService.getDiscountSpecific(query) || null;
        var discountDetail = await DiscountService.getSingleDiscount({ location_id: locationId, status: 1, discount_code: { $regex: '^' + discountCode + '$', $options: 'i' } });
        if (discount && discount.length) { discount = discount[0] || null; }

        if (discount && discount._id) {
            if (discount?.start_time && discount?.end_time && st) {
                var mst = timeToNum(discount.start_time);
                var met = timeToNum(discount.end_time);
                rmst = inRange(st, mst, met);
            }

            if (discount?.evening_start_time && discount?.evening_end_time && st) {
                var est = timeToNum(discount.evening_start_time);
                var eet = timeToNum(discount.evening_end_time);
                rest = inRange(st, est, eet);
            }

            if (!rmst && !rest) {
                if (discount?.start_time && discount?.end_time && discount?.evening_start_time && discount?.evening_end_time) {
                    timingError = true;
                    timingErrorMsg = "Discount code apply between " + discount.start_time_meridiem + " to " + discount.end_time_meridiem + " and " + discount.evening_start_time_meridiem + " to " + discount.evening_end_time_meridiem;
                } else if (discount.start_time && discount.end_time) {
                    timingError = true;
                    timingErrorMsg = "Discount code apply between " + discount.start_time_meridiem + " to " + discount.end_time_meridiem;
                } else if (discount.evening_start_time && discount.evening_end_time) {
                    timingError = true;
                    timingErrorMsg = "Discount code apply between " + discount.evening_start_time_meridiem + " to " + discount.evening_end_time_meridiem;
                }
            }

            codeValid = true;
            if ((discount?.customer_id == customerId || discount?.customer_id == '') || offerDiscountCode && (rmst || rest)) { codeValid = false; }

            var discountId = discount?._id || "";
            var appliedQuery = { user_id: customerId, discount_id: discountId };
            var maxAppQuery = { discount_id: discountId };
            if (appointmentId) {
                appliedQuery.appointment_id = { $nin: appointmentId };
                maxAppQuery.appointment_id = { $nin: appointmentId };
            }

            var applied = await AppliedDiscount.getAppliedDiscountSpecific(appliedQuery);
            var maxApplied = await AppliedDiscount.getAppliedDiscountSpecific(maxAppQuery);

            var holidays = await HolidayService.getHolidaysSpecific({
                location_id: locationId,
                status: 1
            });

            if (discount?.all_online_services == 1) {
                var onlineSers = await ServiceService.getServiceSpecific({ status: 1, online_status: 1, location_id: locationId });

                discount.service_id = onlineSers.map(s => s._id);
            }

            var serviceId = discount?.service_id || [];
            for (let i = 0; i < serviceIds.length; i++) {
                var srvicId = serviceIds[i]?._id || serviceIds[i] || ""
                var index = serviceId.map(function (item) {
                    var servId = item?._id ? item._id : item || "";
                    return servId;
                }).indexOf(srvicId)
                if (index != -1) {
                    codeValid = false;
                    serviceFlag = true;
                }
            }

            if (parseInt(discount?.max_occurances) <= maxApplied?.length) {
                maxOccurances = true;
            }

            if (parseInt(discount?.per_user_occurances) <= applied?.length) {
                perUserOccurances = true;
            }

            if (discount?.weekend == "no") {
                var getWeekend = todayDate.getDay();
                if (getWeekend == 6 || getWeekend == 0) { weekendFlag = true; }
            }

            if (discount.holiday === "no") {
                var holiIndex = holidays.map(function (item) {
                    var holiDate = "";
                    if (item?.date) {
                        holiDate = dateFormat(item.date, "yyyy-mm-dd");
                    }

                    return holiDate;
                }).indexOf(finalTodayDate);
                if (holiIndex != -1) { holidayFlag = true; }
            }

            if (discount?.days && discount.days?.length) {
                var namesOfDay = "";
                for (var j = 0; j < discount.days.length; j++) {
                    if (daysName == discount.days[j]) {
                        daysError = false;
                        break
                    } else {
                        daysError = true;
                        namesOfDay += discount.days[j] + ", ";
                    }
                }

                var rmvComma = namesOfDay?.lastIndexOf(",");
                namesOfDay = namesOfDay?.substring(0, rmvComma);
                daysErrorMsg = daysErrorMsg + namesOfDay?.trim();
            }

            if (!serviceFlag) {
                codeValid = true;
                if (discount?.discount_type == "service") {
                    codeValid = false;
                    serviceFlag = true;
                }
            }

            var totalVal = 0;
            if ((!codeValid && !timingError && !daysError && !weekendFlag && !holidayFlag && !maxOccurances && !perUserOccurances) && serviceFlag) {
                var discountTypes = ["value", "percentage"];
                discountType = discount?.discount_type || "";
                if (discountTypes.indexOf(discountType) != -1) {
                    /* Discount type value and percent */
                    for (var j = 0; j < serviceIds.length; j++) {
                        var serviceId = serviceIds[j]?._id || serviceIds[j] || "";
                        var disServiceId = discount?.service_id || [];
                        var srvIndex = disServiceId.map(function (item) {
                            var servId = item?._id ? item._id : item || "";
                            return servId;
                        }).indexOf(serviceId);

                        // var service = await ServiceService.getServiceOne({ _id: serviceId });
                        var service = serviceIds[j];
                        totalVal += service?.price || 0;

                        var minOrderVal = discount?.min_order_val || "";
                        var maxOrderVal = discount?.max_order_val || "";
                        var minDiscount = discount?.min_discount || "";
                        var maxDiscount = discount?.max_discount || "";
                        if ((parseFloat(minOrderVal) > 0 || minOrderVal == "") && (parseFloat(maxOrderVal) || maxOrderVal == "") && srvIndex != -1) {
                            totalPrice += service.price;

                            if (totalPrice >= parseFloat(minOrderVal) || minOrderVal == "") {
                                if (totalPrice <= parseFloat(maxOrderVal) || maxOrderVal == "") {
                                    if (discountType == "percentage") {
                                        var percen = parseFloat(discount?.discount_value)
                                        discountedPrice = calPercentage(totalPrice, percen);
                                    } else {
                                        discountedPrice = parseFloat(discount?.discount_value || 0);
                                    }

                                    if ((parseFloat(minDiscount) > 0 || minDiscount == "") && (parseFloat(maxDiscount) > 0 || maxDiscount == "")) {
                                        if (discountedPrice >= parseFloat(minDiscount) || minDiscount == "") {
                                            if (discountedPrice <= parseFloat(maxDiscount) || maxDiscount == "") {
                                                price = totalPrice - discountedPrice;
                                                codeApplied = true;
                                                codeValid = false;
                                                reqCodePrice = false;
                                                reqMinPrice = "";
                                            } else {
                                                var maxPrice = parseFloat(maxDiscount)
                                                if (totalPrice > parseFloat(minDiscount)) {
                                                    var tmpPrice = totalPrice - maxPrice;
                                                    if (tmpPrice > 0) {
                                                        price = tmpPrice;
                                                        discountedPrice = maxPrice;
                                                        codeApplied = true;
                                                        codeValid = false;
                                                        reqCodePrice = false;
                                                        reqMinPrice = "";
                                                    } else {
                                                        codeValid = true;
                                                    }
                                                } else {
                                                    codeValid = true;
                                                }
                                            }
                                        } else {
                                            var minPrice = parseFloat(minDiscount)
                                            if (totalPrice > parseFloat(minDiscount)) {
                                                var tmpPrice = totalPrice - minPrice;
                                                if (tmpPrice > 0) {
                                                    price = tmpPrice;
                                                    discountedPrice = minPrice;
                                                    codeApplied = true;
                                                    codeValid = false;
                                                    reqCodePrice = false;
                                                    reqMinPrice = "";
                                                } else {
                                                    codeValid = true;
                                                }
                                            } else {
                                                codeValid = true;
                                            }
                                        }
                                    }
                                } else {
                                    price = totalPrice;
                                    codeValid = false;
                                    reqMaxPriceFlag = true;
                                    reqMaxPrice = maxOrderVal;
                                    codeApplied = false;
                                    reqCodePrice = false;
                                    reqMinPrice = "";
                                }
                            } else {
                                price = total_price;
                                codeValid = false;
                                reqCodePrice = true;
                                reqMinPrice = minOrderVal;
                                codeApplied = false;
                                reqMaxPriceFlag = false;
                                reqMaxPrice = "";
                            }
                        }
                    }
                    /* /Discount type value and percent */
                } else if (discountType == "service") {
                    totalPrice = 0;
                    discountedPrice = 0;
                    price = 0;
                    serviceType.discount_type = "service";
                    var disServiceIds = discount?.service_id || [];
                    if (disServiceIds && disServiceIds.length) {
                        for (var k = 0; k < disServiceIds.length; k++) {
                            var service = await ServiceService.getServiceOne({ _id: disServiceIds[k] });
                            totalPrice += service?.price || 0;
                            serviceType.service_id.push(service);
                            totalVal += service?.price || 0;
                        }

                        discountedPrice = totalPrice;
                        price = totalPrice - discountedPrice;
                        codeApplied = true;
                        codeValid = false;
                    } else {
                        codeApplied = false;
                        codeValid = true;

                        totalPrice = 0;
                        discountedPrice = 0;
                        price = 0;
                    }

                    if (discount?.paid_service_id && discount.paid_service_id?.length) {
                        var paidServiceIds = discount.paid_service_id;
                        var compareCurrntService = [];
                        var pdSerName = "";
                        for (var l = 0; l < paidServiceIds.length; l++) {
                            var paidService = await ServiceService.getServiceOne({ _id: paidServiceIds[l] });
                            if (paidService && paidService._id) {
                                pdSerName += paidService.name + ", ";
                            }

                            var servItems = serviceIds.map((item) => {
                                return item?._id || item || "";
                            });
                            var mtcIndex = servItems.indexOf(paidServiceIds[l]);
                            if (mtcIndex != -1) {
                                compareCurrntService.push(servItems[mtcIndex]);
                            }
                        }

                        if (JSON.stringify(paidServiceIds) == JSON.stringify(compareCurrntService)) {
                            paidServiceError = false;
                            codeValid = false;
                            codeApplied = true;
                        } else {
                            paidServiceError = true;
                            codeApplied = false;
                            codeValid = false;

                            var rmvSerComma = pdSerName.lastIndexOf(",");
                            pdSerName = pdSerName.substring(0, rmvSerComma);
                            paidServiceMsg = paidServiceMsg + "(" + pdSerName.trim() + ") services first for this code";
                        }
                    }

                    reqMaxPriceFlag = false;
                    reqCodePrice = false;
                }
            }
        }

        if (codeValid && discountDetail) {
            date = new Date(date);
            expiryDate = discountDetail?.end_date;
            startDate = discountDetail?.start_date;
            if (startDate && expiryDate && (date < startDate || date > expiryDate)) {
                isExpired = true;
            } else {
                isInvalid = true;
            }
        } else if (codeValid) {
            isInvalid = true;
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: discount,
            service_type: serviceType,

            total_price: totalVal,
            discounted_price: discountedPrice,
            price: totalVal - discountedPrice,

            req_code_price: reqCodePrice,
            req_min_price: reqMinPrice,
            req_max_price: reqMaxPrice,
            req_max_price_flag: reqMaxPriceFlag,

            holiday_flag: holidayFlag,
            weekend_flag: weekendFlag,

            code_valid: codeValid,
            code_applied: codeApplied,
            days_error: daysError,
            timing_error: timingError,
            max_occurances: maxOccurances,
            paid_service_error: paidServiceError,
            per_user_occurances: perUserOccurances,

            days_error_msg: daysErrorMsg,
            timing_error_msg: timingErrorMsg,
            paid_service_msg: paidServiceMsg,

            discount_detail: discountDetail,
            is_expired: isExpired,
            is_invalid: isInvalid,
            start_date: startDate,
            expiry_date: expiryDate,
            message: message
        })
    } catch (e) {
        console.log("Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// get discount types
exports.getDiscountTypes = async function (req, res, next) {
    try {
        var start_date = req.query.start_date;
        var end_date = req.query.end_date;
        var isOfferModule = Number(req.query?.is_offer_module) || 0
        var query = {}

        if (isOfferModule) {
            query.is_offer_module = 1;
        } else {
            query.is_offer_module = 0;
        }

        if (req.query?.company_id) {
            query.company_id = req.query.company_id;
        }

        if (req.query?.location_id) {
            query['location_id'] = { $in: [req.query.location_id, null] }

        }

        var types = await DiscountService.getDiscountsTypes(query);

        return res.status(200).json({
            status: 200,
            flag: true,
            data: types,
            message: "Discount types received succesfully!"
        })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}


// get discount types
exports.getDiscountAndOffer = async function (req, res, next) {
    try {
        var serviceData;
        var serviceIds
        if (req.query.category_id) {
            // Retrieve the service data
            var serviceQuery = {
                category_id: req.query.category_id,
                status: 1,
                location_id: req.query?.location_id
            };
            serviceData = await ServiceService.getCategorySpecificServiceId(serviceQuery);
            // Extracting the _id values into an array

            if (!serviceData || serviceData.length === 0) {
                return res.status(404).json({
                    status: 404,
                    flag: false,
                    message: "Service not found."
                });
            }
            serviceIds = serviceData.map(service => String(service._id));
        } else if (req.query?.service_ids) {
            serviceIds = req.query?.service_ids;
            if (serviceIds && serviceIds.split(",")) {
                serviceIds = serviceIds.split(",")
            }
        } else {
            serviceIds = [req.query?.service_id];
        }

        var offer_discount = [];
        if (serviceIds && serviceIds.length) {

            for (let i = 0; i < serviceIds.length; i++) {

                // Check the service's online status
                let discountQuery;
                discountQuery = {
                    show_to_customer: 1,
                    is_expired: 0,
                    status: 1,
                    service_id: { $in: serviceIds[i] },
                    $and: [
                        {
                            $or: [
                                { customer_arr: null },
                                { customer_arr: '' }
                            ]
                        },
                        {
                            $or: [
                                { customer_id: null },
                                { customer_id: '' }
                            ]
                        }
                    ]
                };

                if (req.query?.company_id) {
                    discountQuery.company_id = req.query.company_id;
                }

                if (req.query?.location_id) {
                    discountQuery.location_id = req.query.location_id;
                }
                if (serviceIds[i]) {
                    // Retrieve the discount and offer types based on the prepared queries with pagination
                    const offerDiscount = await Promise.all([
                        DiscountService.getDiscountAndOffer(discountQuery),
                    ]);
                    // console.log(offerDiscount[0]?._id,"offerDiscount",i);
                    if (offerDiscount && offerDiscount[0] && offerDiscount[0]._id) {
                        offer_discount = offerDiscount[0];
                        break;
                    }
                }
            }
        }

        // Return the response with the retrieved discount types and pagination info
        return res.status(200).json({
            status: 200,
            flag: true,
            data: offer_discount,
            message: "Discount received successfully!"
        });
    } catch (e) {
        return res.status(500).json({
            status: 500,
            flag: false,
            message: e.message
        });
    }
}


// Public offer and discount
exports.getPublicOfferDiscount = async function (req, res, next) {
    try {
        var page = Number(req.query?.page) || 1;
        var limit = Number(req.query?.limit) || 0;
        var sortBy = req.query?.sortBy || '_id';
        var sortOrder = req.query.sortOrder && JSON.parse(req.query.sortOrder) ? '1' : '-1';
        var search = req.query?.searchText ? req.query.searchText : "";
        var pageIndex = 0;
        var startIndex = 0;
        var endIndex = 0;

        var date = req.query?.date || "";
        var isOfferModule = Number(req.query?.is_offer_module) || 0;
        if (!date) { date = new Date(); }

        var query = {
            customer_id: null,
            customer_arr: null,
            status: 1,
            is_offer_module: { $ne: 1 },
            show_to_customer: 1
        }

        if (isOfferModule) {
            query.is_offer_module = 1;
            query.all_customer = 1;
        }

        if (date) {
            date = formatDate(date, "YYYY-MM-DD");
            query["$and"] = [{ start_date: { $lte: date } }, { end_date: { $gte: date } }];
        }

        if (req.query?.company_id) {
            query.company_id = req.query.company_id;
        }

        if (req.query?.location_id) {
            query.location_id = req.query.location_id;
        }

        if (search) {
            search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&');
            query['$or'] = [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { discount_code: { $regex: '.*' + search + '.*', $options: 'i' } }
            ];
        }

        var count = await DiscountService.getDiscountsCount(query) || 0;
        var discount = await DiscountService.getDiscountList(query, Number(page), Number(limit), sortBy, Number(sortOrder)) || [];
        if (!discount || !discount?.length) {
            if (Number(req.query?.page) && Number(req.query.page) > 0) {
                page = 1;
                discount = await DiscountService.getDiscountList(query, Number(page), Number(limit), sortBy, Number(sortOrder));
            }
        }

        if (discount && discount.length) {
            pageIndex = Number(page - 1);
            startIndex = (pageIndex * limit) + 1;
            endIndex = Math.min(startIndex - 1 + limit, count);
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: discount,
            pages: limit ? Math.ceil(count / limit) : 0,
            total: count,
            pageIndex: pageIndex,
            startIndex: startIndex,
            endIndex: endIndex,
            message: "Discount offer received succesfully!"
        })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}


const getWhatsAppDetails = async function (location_id) {

    try {
        if (location_id) {
            var location = await LocationService.getLocationOneHidden({ _id: location_id });

            if (location && location?.whatsapp_access_token && location?.whatsapp_instance_id) {
                var countryCode = location?.company_id?.country_code || 44
                var customParameter = {
                    countryCode: countryCode,
                    whatsapp_access_token: location?.whatsapp_access_token,
                    whatsapp_instance_id: location?.whatsapp_instance_id
                };
                return true;

            } else {
                return false;
            }
        }
        return false;
    } catch (e) {
        console.log(e)
        return customParameter
    }
}
