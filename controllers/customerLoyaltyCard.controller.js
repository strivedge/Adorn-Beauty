var ObjectId = require('mongodb').ObjectId;

var CompanyService = require('../services/company.service');
var CustomerLoyaltyCardService = require('../services/customerLoyaltyCard.service');
var CustomerLoyaltyCardLogService = require('../services/customerLoyaltyCardLog.service');
var LocationService = require('../services/location.service');
var LoyaltyCardService = require('../services/loyaltyCard.service');
var ServiceService = require('../services/service.service');

const { isObjEmpty, isValidJson, formatDate } = require('../helper');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getCustomerLoyaltyCards = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 0 //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt'
        var order = req.query.order ? req.query.order : '-1'
        var searchText = req.query.searchText ? req.query.searchText : ''

        var query = { status: 1 };
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
        }

        if (req.query.loyalty_card_id && req.query.loyalty_card_id != 'undefined') {
            query['loyalty_card_id'] = req.query.loyalty_card_id;
        }

        if (req.query.customer_id && req.query.customer_id != 'undefined') {
            query['customer_id'] = req.query.customer_id;
        } else {
            query['customer_id'] = { $ne: '' };
        }

        if (req.query.searchText && req.query.searchText != 'undefined') {
            query['$or'] = [
                { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                // { desc: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
            ];
        }

        var CustomerLoyaltyCards = await CustomerLoyaltyCardService.getCustomerLoyaltyCards(query, parseInt(page), parseInt(limit), order_name, Number(order))

        // Return the CustomerLoyaltyCards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: CustomerLoyaltyCards, message: "Customer loyalty cards received successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getClientCustomerLoyaltyCards = async function (req, res, next) {
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
            });
        }

        var date = formatDate(null, "YYYY-MM-DD");

        var query = { status: 1 };
        if (date) {
            query.start_date = { $lte: date };
            query.end_date = { $gte: date };
        }
        if (locationId) { query['location_id'] = locationId; }

        if (customerId) { query['customer_id'] = customerId; }

        var count = await CustomerLoyaltyCardService.getCustomerLoyaltyCardsCount(query);
        var customerLoyaltyCards = await CustomerLoyaltyCardService.getCustomerLoyaltyCardList(query, Number(page), Number(limit), sortBy, Number(sortOrder));
        if (!customerLoyaltyCards || !customerLoyaltyCards?.length) {
            if (Number(req.query?.page) && Number(req.query.page) > 0) {
                page = 1;
                customerLoyaltyCards = await CustomerLoyaltyCardService.getCustomerLoyaltyCardList(query, Number(page), Number(limit), sortBy, Number(sortOrder));
            }
        }

        if (customerLoyaltyCards && customerLoyaltyCards.length) {
            pageIndex = Number(page - 1);
            startIndex = (pageIndex * limit) + 1;
            endIndex = Math.min(startIndex - 1 + limit, count);
        }

        // Return the CustomerLoyaltyCards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: customerLoyaltyCards,
            pages: limit ? Math.ceil(count / limit) : 0,
            total: count,
            pageIndex: pageIndex,
            startIndex: startIndex,
            endIndex: endIndex,
            message: "Customer loyalty cards received successfully!"
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getActiveCustomerLoyaltyCards = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = { status: 1 };
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    try {
        // console.log("query ",query)
        var CustomerLoyaltyCards = await CustomerLoyaltyCardService.getActiveCustomerLoyaltyCards(query)
        // Return the CustomerLoyaltyCards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: CustomerLoyaltyCards,
            location: location,
            message: "Customer loyalty cards received successfully!"
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.checkCustomerLoyaltyCards = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var query = { status: 1 };
        var query2 = { status: 1 };
        var services = [];
        //req.body.services = ["60bf674f768da009dbe7843a", "60bf6a85768da009dbe7845b"]
        var companyId = null;
        var locationId = "";

        if (req.body.location_id) {
            locationId = req.body.location_id;
            query.location_id = req.body.location_id;
            query2.location_id = req.body.location_id;
        }

        if (req.body.customer_id) {
            query.customer_id = req.body.customer_id;
        }

        if (req.body.date) {
            //query['$and' ] = [{start_date:{$lte:req.body.date}},{end_date:{$gte:req.body.date}} ]
            query['$or'] = [
                { $and: [{ start_date: null }, { end_date: null }] },
                { $and: [{ start_date: { $lte: req.body.date } }, { end_date: { $gte: req.body.date } }] }
            ];

            query2['$or'] = [
                { $and: [{ start_date: null }, { end_date: null }] },
                { $and: [{ start_date: { $lte: req.body.date } }, { end_date: { $gte: req.body.date } }] }
            ];
        }

        if (req.body.services && req.body.services.length > 0) {
            services = req.body.services;
            services = services.map((item) => {
                return item ? ObjectId(item) : ""
            });

            query.service_id = { $in: services };
            query2.service_id = { $in: req.body.services };
        }

        if (req.body.online_status) { query2.online_status = 1; }

        query2.auto_assign = 1;

        var location = null;
        if (locationId) {
            location = await LocationService.getLocationOne({ _id: locationId });
            companyId = location?.company_id?._id ? location.company_id._id : location?.company_id || null;
        }
        var custAutoAssignCards = await LoyaltyCardService.checkAutoAssignLoyaltyCards(query2, req.body.customer_id);
        if (custAutoAssignCards && custAutoAssignCards.length) {
            for (var l = 0; l < custAutoAssignCards.length; l++) {
                var obj = {
                    company_id: companyId,
                    location_id: req.body.location_id,
                    customer_id: req.body.customer_id,
                    loyalty_card_id: custAutoAssignCards[l]._id,
                    category_id: custAutoAssignCards[l].category_id || null,
                    service_id: custAutoAssignCards[l].service_id || null,
                    name: custAutoAssignCards[l].name || "",
                    customer_signature: '',
                    start_date: custAutoAssignCards[l].start_date,
                    end_date: custAutoAssignCards[l].end_date,
                    comment: '',
                    loyalty_card_data: custAutoAssignCards[l] || null,
                    status: 1,
                };

                var existCustomerLoyaltyCard = await CustomerLoyaltyCardService.getActiveCustomerLoyaltyCards({ location_id: req.body.location_id, loyalty_card_id: custAutoAssignCards[l]._id, customer_id: req.body.customer_id });
                //console.log('existCustomerLoyaltyCard',existCustomerLoyaltyCard)
                if (existCustomerLoyaltyCard.length == 0) {
                    var createdCustomerLoyaltyCard = await CustomerLoyaltyCardService.createCustomerLoyaltyCard(obj);
                }
            }
        }

        var customerLoyaltyCards = await CustomerLoyaltyCardService.checkCustomerLoyaltyCards(query, services);
        //console.log('customerLoyaltyCards',customerLoyaltyCards.length)
        var customer_cards = [];
        if (customerLoyaltyCards && customerLoyaltyCards.length > 0) {
            for (var cl = 0; cl < customerLoyaltyCards.length; cl++) {
                // var service = await ServiceService.getService(customerLoyaltyCards[cl].service_id.toString());
                // customerLoyaltyCards[cl].loyalty_card_data.service_id = service;

                // console.log('req.body.online_status',req.body.online_status)
                // console.log('customerLoyaltyCards[cl].online_status',customerLoyaltyCards[cl].online_status)
                // console.log('customerLoyaltyCards[cl].status',customerLoyaltyCards[cl].status)

                if (((req.body.online_status && customerLoyaltyCards[cl].online_status) || !req.body.online_status) && customerLoyaltyCards[cl].status) {
                    var log_query = {
                        location_id: ObjectId(req.body.location_id),
                        loyalty_card_id: ObjectId(customerLoyaltyCards[cl].loyalty_card_id.toString()),
                        customer_loyalty_card_id: ObjectId(customerLoyaltyCards[cl]._id.toString()),
                        customer_id: ObjectId(req.body.customer_id)
                    };

                    if (req.body.appointment_id) {
                        log_query['appointment_id'] = { $ne: ObjectId(req.body.appointment_id) };
                    }

                    if (req.body.createdAt && req.body.action == 'edit') {
                        //log_query['date'] = { $lte: req.body.date };
                        log_query['createdAt'] = { $lte: new Date(req.body.createdAt) };
                    }

                    console.log('log_query',log_query)
                    var customerCardCount = await CustomerLoyaltyCardLogService.getCustomerLoyaltyCardLogCount(log_query);

                    console.log('customerCardCount',customerCardCount)

                    var card_data = customerLoyaltyCards[cl].loyalty_card_data;

                    var totRoundCount = 0;
                    if(parseInt(card_data.recurring_count) > 0){
                        totRoundCount = parseInt(card_data.recurring_count) * (parseInt(card_data.paid_count) + parseInt(card_data.free_count));
                    }

                    var is_free_service = false;
                    var current_use = 0;
                    if (card_data.recurring_count > 0) {
                        if ((customerCardCount < totRoundCount) || (customerCardCount == totRoundCount && req.body.appointment_id)) {
                            var ron_tot = parseInt(card_data.paid_count) + parseInt(card_data.free_count);

                            var r_no = (customerCardCount + 1) % ron_tot;
                            current_use = r_no;
                            if (r_no == 0 || (r_no > card_data.paid_count && r_no <= ron_tot)) {
                                is_free_service = true;
                                current_use = ron_tot;
                            }
                        }
                    } else {
                        var ron_tot = parseInt(card_data.paid_count) + parseInt(card_data.free_count);

                        var r_no = (customerCardCount + 1) % ron_tot;
                        current_use = r_no;
                        if (r_no == 0 || (r_no > card_data.paid_count && r_no <= ron_tot)) {
                            is_free_service = true;
                            current_use = ron_tot;
                        }
                    }
                    customerLoyaltyCards[cl].current_use = current_use;
                    customerLoyaltyCards[cl].is_stamp = true;
                    customerLoyaltyCards[cl].is_free_service = is_free_service;
                    customer_cards.push(customerLoyaltyCards[cl]);
                    //console.log('customer_cards',customer_cards)
                }
            }
        }

        var location = [];
        if (req.body.location_id) {
            var loc_query = { _id: ObjectId(req.body.location_id.toString()) };
            location = await LocationService.getLocationComapany(loc_query);
        }

        // Return the CustomerLoyaltyCards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            location: location,
            data: customer_cards,
            sessionCount: customerCardCount,
            customerAutoAssignLoyaltyCards: custAutoAssignCards,
            message: "Customer loyalty cards received successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getOrAutoAsignCustomerLoyaltyCards = async function (req, res, next) {
    try {
        var query = { status: 1 };
        var query2 = { auto_assign: 1, status: 1 };

        var date = req.query?.date || "";
        var action = req.query?.action || "";
        var companyId = "";
        var locationId = req.query?.location_id || "";
        var customerId = req.query?.customer_id || "";
        var serviceIds = req.query?.service_ids || [];
        var appointmentId = req.query?.appointment_id || "";
        var onlineStatus = Number(req.query?.online_status || 0);
        var hasOnlineStatus = req.query?.hasOwnProperty('online_status') || false;

        if (!serviceIds || !serviceIds?.length) {
            return res.status(200).json({ status: 200, flag: false, message: "Services id must be present!" })
        }

        if (locationId) {
            query.location_id = locationId;
            query2.location_id = locationId;
        }

        if (customerId) { query.customer_id = customerId; }

        if (date) {
            query['$or'] = [
                { $and: [{ start_date: null }, { end_date: null }] },
                { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] }
            ];

            query2['$or'] = [
                { $and: [{ start_date: null }, { end_date: null }] },
                { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] }
            ];
        }

        if (serviceIds && isValidJson(serviceIds)) {
            serviceIds = JSON.parse(serviceIds) || [];
            query2.service_id = { $in: serviceIds };

            serviceIds = serviceIds.map((item) => {
                return item ? ObjectId(item) : ""
            });

            query.service_id = { $in: serviceIds };
        }

        if (onlineStatus == 1) { query2.online_status = 1; }

        var location = null;
        if (locationId) {
            location = await LocationService.getLocationOne({ _id: locationId });
            companyId = location?.company_id?._id ? location.company_id._id : location?.company_id || null;
        }

        var custAutoAssignCards = await LoyaltyCardService.getLoyaltyCardsOne(query2);
        if (custAutoAssignCards && custAutoAssignCards.length) {
            for (var i = 0; i < custAutoAssignCards.length; i++) {
                var obj = {
                    company_id: companyId,
                    location_id: locationId,
                    customer_id: customerId,
                    loyalty_card_id: custAutoAssignCards[i]._id,
                    category_id: custAutoAssignCards[i]?.category_id || null,
                    service_id: custAutoAssignCards[i]?.service_id || null,
                    name: custAutoAssignCards[i]?.name || "",
                    customer_signature: '',
                    start_date: custAutoAssignCards[i].start_date,
                    end_date: custAutoAssignCards[i].end_date,
                    comment: '',
                    loyalty_card_data: custAutoAssignCards[i] || null,
                    status: 1
                }

                var existCustQuery = {
                    location_id: locationId,
                    loyalty_card_id: custAutoAssignCards[i]._id,
                    customer_id: customerId
                };
                var existCustomerLoyaltyCard = await CustomerLoyaltyCardService.getCustomerLoyaltyCardsOne(existCustQuery);
                if (existCustomerLoyaltyCard?.length == 0) {
                    var createdCustomerLoyaltyCard = await CustomerLoyaltyCardService.createCustomerLoyaltyCard(obj);
                }
            }
        }

        var customerLoyaltyCards = await CustomerLoyaltyCardService.checkCustomerLoyaltyCards(query);
        var customerCards = [];
        if (customerLoyaltyCards && customerLoyaltyCards?.length) {
            for (var cl = 0; cl < customerLoyaltyCards.length; cl++) {
                var loyaltyOnlineStatus = customerLoyaltyCards[cl]?.online_status ? customerLoyaltyCards[cl]?.online_status : customerLoyaltyCards[cl]?.loyalty_card_data?.online_status || 0;
                if (customerLoyaltyCards[cl].status && ((onlineStatus && loyaltyOnlineStatus) || !hasOnlineStatus)) {
                    var loyaltyCardId = customerLoyaltyCards[cl]?.loyalty_card_id?._id ? customerLoyaltyCards[cl]?.loyalty_card_id?._id : customerLoyaltyCards[cl]?.loyalty_card_id || "";
                    var logQuery = {
                        location_id: ObjectId(locationId),
                        loyalty_card_id: ObjectId(loyaltyCardId?.toString()) || "",
                        customer_loyalty_card_id: ObjectId(customerLoyaltyCards[cl]?._id?.toString()) || "",
                        customer_id: ObjectId(customerId)
                    }

                    if (appointmentId) {
                        logQuery.appointment_id = { $ne: ObjectId(appointmentId) };
                    }

                    if (date && action == 'edit') {
                        logQuery.date = { $lte: date };
                    }

                    var customerCardCount = await CustomerLoyaltyCardLogService.getCustomerLoyaltyCardLogCount(logQuery);

                    var cardData = customerLoyaltyCards[cl]?.loyalty_card_data || null;
                    var totRoundCount = parseInt(cardData.recurring_count) * (parseInt(cardData.paid_count) + parseInt(cardData.free_count));
                    var isFreeService = false;
                    var currentUse = 0;
                    if (cardData?.recurring_count > 0) {
                        if (customerCardCount <= totRoundCount) {
                            var ronTot = parseInt(cardData.paid_count) + parseInt(cardData.free_count);
                            var rNo = (customerCardCount + 1) % ronTot;
                            currentUse = rNo;
                            if (rNo == 0 || (rNo > cardData?.paid_count && rNo <= ronTot)) {
                                isFreeService = true;
                            }
                        }
                    } else {
                        var ronTot = parseInt(cardData?.paid_count || 0) + parseInt(cardData?.free_count || 0)
                        var rNo = (customerCardCount + 1) % ronTot;
                        currentUse = rNo;
                        if (rNo == 0 || (rNo > cardData?.paid_count && rNo <= ronTot)) {
                            isFreeService = true;
                            currentUse = ronTot;
                        }
                    }


                    customerLoyaltyCards[cl].current_use = currentUse;
                    customerLoyaltyCards[cl].is_stamp = true;
                    customerLoyaltyCards[cl].is_free_service = isFreeService;
                    customerCards.push(customerLoyaltyCards[cl]);
                }
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            location: location,
            data: customerCards,
            customerAutoAssignLoyaltyCards: custAutoAssignCards,
            message: "CustomerLoyaltyCards received successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCustomerLoyaltyCard = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id;
        var CustomerLoyaltyCard = await CustomerLoyaltyCardService.getCustomerLoyaltyCard(id);

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: CustomerLoyaltyCard, message: "Customer loyalty card received successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getClientCustomerLoyaltyCard = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var sessionCount = 0;
        var customerLoyaltyCardLog = [];
        var companyData = null;
        var recurringCount = 1;

        var id = req.params.id;
        var date = req.query?.date || "";
        var query = { _id: id };

        if (date) {
            query['$or'] = [
                { $and: [{ start_date: null }, { end_date: null }] },
                { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] }
            ];
        }

        var customerLoyaltyCard = await CustomerLoyaltyCardService.getCustomerLoyaltyCardOne(query);
        if (customerLoyaltyCard && customerLoyaltyCard._id) {
            var companyId = customerLoyaltyCard?.location_id?.company_id || "";
            var company = await CompanyService.getCompanyOne({ _id: companyId });
            if (company && company._id) {
                companyData = {
                    name: company?.name || "",
                    logo: company?.image || "",
                    contact_number: company?.contact_number || "",
                    contact_link: company?.contact_link || ""
                }
            }

            customerLoyaltyCardLog = await CustomerLoyaltyCardLogService.getCustomerLoyaltyCardLogsOne({ customer_loyalty_card_id: ObjectId(customerLoyaltyCard._id) });
            if (customerLoyaltyCardLog && customerLoyaltyCardLog.length) {
                sessionCount = customerLoyaltyCardLog.length;
                recurringCount = customerLoyaltyCard?.loyalty_card_id?.recurring_count;
                if (recurringCount == 0) {
                    var paidCount = customerLoyaltyCard?.loyalty_card_id?.paid_count || 0;
                    var freeCount = customerLoyaltyCard?.loyalty_card_id?.free_count || 0;
                    var round = parseInt(paidCount) + parseInt(freeCount);
                    var recCount = sessionCount / round;
                    recCount = parseInt(recCount.toFixed()) + 1;
                    recurringCount = recCount;
                }
            }

            var is_free_service = false;
            var current_use = 0;
            var totRoundCount = 0;
            if (customerLoyaltyCard?.status) {
                var log_query = {
                    location_id: ObjectId(req.query.location_id),
                    loyalty_card_id: ObjectId(customerLoyaltyCard.loyalty_card_id._id.toString()),
                    customer_loyalty_card_id: ObjectId(id.toString()),
                    customer_id: ObjectId(req.query.customer_id)
                }

                if (req.query.appointment_id) {
                    log_query['appointment_id'] = { $ne: ObjectId(req.query.appointment_id) };
                }

                var customerCardCount = await CustomerLoyaltyCardLogService.getCustomerLoyaltyCardLogCount(log_query);

                var card_data = customerLoyaltyCard.loyalty_card_id;
                totRoundCount = parseInt(card_data.recurring_count) * (parseInt(card_data.paid_count) + parseInt(card_data.free_count));

                if (card_data && card_data.recurring_count > 0) {
                    if ((customerCardCount < totRoundCount) || (customerCardCount == totRoundCount && req.body.appointment_id)) {
                        var ron_tot = parseInt(card_data.paid_count) + parseInt(card_data.free_count);

                        var r_no = (customerCardCount + 1) % ron_tot;
                        current_use = r_no;
                        if (r_no == 0 || (r_no > card_data.paid_count && r_no <= ron_tot)) {
                            is_free_service = true;
                            current_use = ron_tot;
                        }
                    }
                } else {
                    var ron_tot = parseInt(card_data.paid_count) + parseInt(card_data.free_count);
                    var r_no = (customerCardCount + 1) % ron_tot;
                    current_use = r_no;
                    if (r_no == 0 || (r_no > card_data.paid_count && r_no <= ron_tot)) {
                        is_free_service = true;
                        current_use = ron_tot;
                    }
                }

                customerLoyaltyCard.current_use = current_use;
                customerLoyaltyCard.is_free_service = is_free_service;
            }
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            companyData: companyData,
            data: customerLoyaltyCard,
            customerLoyaltyCardLog: customerLoyaltyCardLog,
            recurringCount: recurringCount,
            sessionCount: sessionCount,
            current_use: current_use,
            is_free_service: is_free_service,
            total_round: totRoundCount,
            message: "Customer loyalty card received successfully!"
        })
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createCustomerLoyaltyCard = async function (req, res, next) {
    try {
        var loyaltyCardId = req.body?.loyalty_card_id || "";

        var query = { status: 1 }
        if (req.body.location_id) { query['location_id'] = req.body.location_id; }
        if (req.body.customer_id) { query['customer_id'] = req.body.customer_id; }

        if (loyaltyCardId) {
            query['loyalty_card_id'] = loyaltyCardId;

            var loyaltyCard = await LoyaltyCardService.getLoyaltyCardSimple({ _id: loyaltyCardId });
            if (loyaltyCard && loyaltyCard?._id) {
                req.body.name = loyaltyCard?.name || "";
                req.body.category_id = loyaltyCard?.category_id || null;
                req.body.service_id = loyaltyCard?.service_id || null;
                req.body.loyalty_card_data = loyaltyCard;
            }
        }

        if (req.body.date) {
            query['$or'] = [
                { $and: [{ start_date: null }, { end_date: null }] },
                { $and: [{ start_date: { $lte: req.body.date } }, { end_date: { $gte: req.body.date } }] }];
        }

        var CustomerLoyaltyCards = await CustomerLoyaltyCardService.getActiveCustomerLoyaltyCards(query);
        if (CustomerLoyaltyCards?.length == 0 && req.body?.customer_id) {
            var createdCustomerLoyaltyCard = await CustomerLoyaltyCardService.createCustomerLoyaltyCard(req.body);

            return res.status(200).json({ status: 200, flag: true, data: createdCustomerLoyaltyCard, message: "Customer loyalty card created successfully!" })
        } else {
            return res.status(200).json({ status: 200, flag: false, data: {}, message: "Customer loyalty card already assign to seleced customer" })
        }
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateCustomerLoyaltyCard = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedCustomerLoyaltyCard = await CustomerLoyaltyCardService.updateCustomerLoyaltyCard(req.body);

        return res.status(200).json({ status: 200, flag: true, data: updatedCustomerLoyaltyCard, message: "Customer loyalty card updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCustomerLoyaltyCard = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await CustomerLoyaltyCardService.deleteCustomerLoyaltyCard(id);

        return res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getCustomerLoyaltyCardsDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : '';
        var order = req.query?.order ? req.query.order : '1';
        var search = req.query?.searchText ? req.query.searchText : "";

        var query = {};
        var existQuery = {};
        var loyltyQuery = {};
        if (req.query?.status == "active") {
            query['status'] = 1;
            loyltyQuery['status'] = 1;
        }

        if (req.query?.company_id) {
            query['company_id'] = req.query.company_id;
            loyltyQuery['company_id'] = req.query.company_id;
        }

        if (req.query?.location_id) {
            query['location_id'] = req.query.location_id;
            loyltyQuery['location_id'] = req.query.location_id;
        }

        if (req.query?.customer_id) {
            query['customer_id'] = req.query.customer_id;
        }

        if (req.query?.loyalty_card_id) {
            query['loyalty_card_id'] = req.query.loyalty_card_id;
        }

        if (req.query?.id) {
            query['_id'] = req.query.id;
        }

        if (req.query?.ids && isValidJson(req.query.ids)) {
            var ids = JSON.parse(req.query.ids);
            query['_id'] = { $nin: ids };
            existQuery['_id'] = { $in: ids };
        }

        if (search) {
            search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&');
            loyltyQuery['$or'] = [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { desc: { $regex: '.*' + search + '.*', $options: 'i' } }
            ];

            var loyaltyCardIds = await LoyaltyCardService.getLoyaltyCardsIds(loyltyQuery) || [];
            if (loyaltyCardIds && loyaltyCardIds.length) {
                query['loyalty_card_id'] = { $in: loyaltyCardIds };
            }
        }

        var existCustomerLoyaltyCards = [];
        if (!isObjEmpty(existQuery)) {
            existCustomerLoyaltyCards = await CustomerLoyaltyCardService.getCustomerLoyaltyCardsDropdown(existQuery, orderName, order) || [];
        }

        var customerLoyaltyCards = await CustomerLoyaltyCardService.getCustomerLoyaltyCardsDropdown(query, orderName, order) || [];
        customerLoyaltyCards = existCustomerLoyaltyCards.concat(customerLoyaltyCards) || [];

        return res.status(200).send({ status: 200, flag: true, data: customerLoyaltyCards, message: "Customer loyalty cards dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

exports.restructureCustomerLoyaltyCards = async function (req, res, next) {
    try {
        var query = { name: { $eq: "" } };

        var loyaltyCards = await LoyaltyCardService.getLoyaltyCardsSimple({});
        var customerLoyaltyCards = await CustomerLoyaltyCardService.getCustomerLoyaltyCardsOne(query);
        if (customerLoyaltyCards && customerLoyaltyCards?.length) {
            for (let i = 0; i < customerLoyaltyCards.length; i++) {
                let customerLoyaltyCard = customerLoyaltyCards[i];
                var loyaltyCardId = customerLoyaltyCard?.loyalty_card_id?._id ? customerLoyaltyCard.loyalty_card_id._id : customerLoyaltyCard?.loyalty_card_id || "";
                if (customerLoyaltyCard && customerLoyaltyCard?._id && loyaltyCardId) {
                    var payload = { _id: customerLoyaltyCard._id }
                    var loyaltyCard = loyaltyCards.find((x) => x._id?.toString() == loyaltyCardId?.toString()) || null;

                    var companyId = customerLoyaltyCard?.location_id?.company_id || "";
                    if (companyId) { payload.company_id = companyId; }

                    payload.name = loyaltyCard?.name || "";
                    payload.category_id = loyaltyCard?.category_id || null;
                    payload.service_id = loyaltyCard?.service_id || null;
                    payload.loyalty_card_data = loyaltyCard;

                    await CustomerLoyaltyCardService.updateCustomerLoyaltyCard(payload);
                }
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: customerLoyaltyCards,
            message: "Restructured customer loyalty cards succesfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
