var BuySubscriptionService = require('../services/buySubscription.service');

// Saving the context of this module inside the _the variable
_this = this;

//process.env.SECRET = 'supersecret';

// Async Controller function to get the To do List
exports.getBuySubscriptions = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? parseInt(req.query.page) : 0; //skip raw value
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;
    var query = {};

    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }

    try {
        var buySubscriptions = await BuySubscriptionService.getBuySubscriptions(query, page, limit)
        // Return the BuySubscriptions list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: buySubscriptions, message: "Succesfully BuySubscriptions Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// get Inactive subscriptions for company
exports.getCompanyBuySubscriptions = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = { status: 0 };

    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }

    try {
        var buySubscriptions = await BuySubscriptionService.getBuySubscriptions(query, page, limit)
        // Return the BuySubscriptions list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: buySubscriptions, message: "Succesfully BuySubscriptions Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getBuySubscription = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var buySubscription = await BuySubscriptionService.getBuySubscription(id)
        // Return the BuySubscription list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: buySubscription, message: "Succesfully BuySubscription Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getBuySubscriptionCompany = async function (req, res, next) {
    if (!req.body.company_id) {
        return res.status(200).json({ status: 200, flag: false, message: "company_id Id must be present" })
    }

    var query = req.body;
    try {
        var buySubscription = await BuySubscriptionService.getBuySubscriptionCompany(query);
        // Return the BuySubscription list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: buySubscription, message: "Succesfully BuySubscription Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createBuySubscription = async function (req, res, next) {
    //console.log('createBuySubscription',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdBuySubscription = await BuySubscriptionService.createBuySubscription(req.body);
        createdBuySubscription = await BuySubscriptionService.getBuySubscription(createdBuySubscription._id);
        return res.status(200).json({ status: 200, flag: true, data: createdBuySubscription, message: "Succesfully Created BuySubscription" })
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateBuySubscription = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedBuySubscription = await BuySubscriptionService.updateBuySubscription(req.body);
        updatedBuySubscription = await BuySubscriptionService.getBuySubscription(updatedBuySubscription._id);
        return res.status(200).json({ status: 200, flag: true, data: updatedBuySubscription, message: "Succesfully Updated BuySubscription" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeBuySubscription = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await BuySubscriptionService.deleteBuySubscription(id);
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}