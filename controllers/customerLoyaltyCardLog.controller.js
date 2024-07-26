var ObjectId = require('mongodb').ObjectId
var CustomerLoyaltyCardLogService = require('../services/customerLoyaltyCardLog.service')
var LocationService = require('../services/location.service')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getCustomerLoyaltyCardLogs = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = ObjectId(req.query.company_id);
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = ObjectId(req.query.location_id);
    }

    if (req.query.loyalty_card_id && req.query.loyalty_card_id != 'undefined') {
        query['loyalty_card_id'] = ObjectId(req.query.loyalty_card_id);
    }

    if (req.query.customer_loyalty_card_id && req.query.customer_loyalty_card_id != 'undefined') {
        query['customer_loyalty_card_id'] = ObjectId(req.query.customer_loyalty_card_id);
    }

    if (req.query.customer_id && req.query.customer_id != 'undefined') {
        query['customer_id'] = ObjectId(req.query.customer_id);
    }

    // if(req.query.searchText && req.query.searchText != 'undefined'){
    //     query['$or'] = [ { name: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }, { desc: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }];
    // }

    try {
        var CustomerLoyaltyCardLogs = await CustomerLoyaltyCardLogService.getCustomerLoyaltyCardLogs(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText);


        var customerCardCount = await CustomerLoyaltyCardLogService.getCustomerLoyaltyCardLogCount(query);

        // Return the CustomerLoyaltyCardLogs list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: CustomerLoyaltyCardLogs, sessionCount: customerCardCount, message: "Successfully CustomerLoyaltyCardLogs Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getActiveCustomerLoyaltyCardLogs = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    try {
        // console.log("query ",query)
        var CustomerLoyaltyCardLogs = await CustomerLoyaltyCardLogService.getActiveCustomerLoyaltyCardLogs(query)
        // Return the CustomerLoyaltyCardLogs list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: CustomerLoyaltyCardLogs, location: location, message: "Successfully CustomerLoyaltyCardLogs Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomerLoyaltyCardLog = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var CustomerLoyaltyCardLog = await CustomerLoyaltyCardLogService.getCustomerLoyaltyCardLog(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: CustomerLoyaltyCardLog, message: "Successfully CustomerLoyaltyCardLog Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createCustomerLoyaltyCardLog = async function (req, res, next) {
    //console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdCustomerLoyaltyCardLog = await CustomerLoyaltyCardLogService.createCustomerLoyaltyCardLog(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdCustomerLoyaltyCardLog, message: "Successfully Created CustomerLoyaltyCardLog" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "CustomerLoyaltyCardLog Creation was Unsuccesfull" })
    }
}

exports.updateCustomerLoyaltyCardLog = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedCustomerLoyaltyCardLog = await CustomerLoyaltyCardLogService.updateCustomerLoyaltyCardLog(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedCustomerLoyaltyCardLog, message: "Successfully Updated CustomerLoyaltyCardLog" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCustomerLoyaltyCardLog = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await CustomerLoyaltyCardLogService.deleteCustomerLoyaltyCardLog(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getTransformToObjectIdLogScript = async function (req, res, next) {
    try {
        var customerLoyaltyCardLogs = await CustomerLoyaltyCardLogService.getActiveCustomerLoyaltyCardLogs({ customer_loyalty_card_id: { $type: "string" } })
        if (customerLoyaltyCardLogs && customerLoyaltyCardLogs.length) {
            for (let index = 0; index < customerLoyaltyCardLogs.length; index++) {
                var element = customerLoyaltyCardLogs[index];
                if (element && element._id) {
                    var id = element._id
                    var companyId = element?.company_id || null
                    var locationId = element?.location_id || null
                    var loyaltyCardId = element?.loyalty_card_id || null
                    var customerLoyaltyCardId = element?.customer_loyalty_card_id || null
                    var appointmentId = element?.appointment_id || null
                    var customerId = element?.customer_id || null
                    if (companyId) { companyId = ObjectId(companyId) }

                    if (locationId) { locationId = ObjectId(locationId) }

                    if (loyaltyCardId) { loyaltyCardId = ObjectId(loyaltyCardId) }

                    if (customerLoyaltyCardId) { customerLoyaltyCardId = ObjectId(customerLoyaltyCardId) }

                    if (appointmentId) { appointmentId = ObjectId(appointmentId) }

                    if (customerId) { customerId = ObjectId(customerId) }

                    var updateData = {
                        _id: id,
                        company_id: companyId,
                        location_id: locationId,
                        loyalty_card_id: loyaltyCardId,
                        customer_loyalty_card_id: customerLoyaltyCardId,
                        appointment_id: appointmentId,
                        customer_id: customerId
                    }

                    await CustomerLoyaltyCardLogService.updateCustomerLoyaltyCardLog(updateData)
                }
            }
        }

        return res.status(200).send({
            status: 200,
            flag: true,
            message: "Customer loyalty card logs transfomed successfully!"
        })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
