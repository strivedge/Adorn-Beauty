var ObjectId = require('mongodb').ObjectId

var LocationService = require('../services/location.service')
var LoyaltyCardService = require('../services/loyaltyCard.service')

const { isObjEmpty, isValidJson } = require('../helper')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getLoyaltyCards = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = { status: 1 }
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    if (req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [
            { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
            { desc: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
        ]
    }

    try {
        var loyaltyCards = await LoyaltyCardService.getLoyaltyCards(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText);

        var locQuery = { _id: ObjectId(req.query.location_id) }
        var location = await LocationService.getLocationComapany(locQuery)

        return res.status(200).json({ status: 200, flag: true, data: loyaltyCards, location: location, message: "Successfully LoyaltyCards Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getActiveLoyaltyCards = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.status == 1) {
        query['status'] = 1;
    }

    try {
        // console.log("query ",query)
        var LoyaltyCards = await LoyaltyCardService.getActiveLoyaltyCards(query)
        // Return the LoyaltyCards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: LoyaltyCards, message: "Successfully LoyaltyCards Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getLoyaltyCard = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var loyaltyCard = await LoyaltyCardService.getLoyaltyCard(id);
        var location = [];
        if (loyaltyCard.location_id) {
            var loc_query = { _id: ObjectId(loyaltyCard.location_id) };
            location = await LocationService.getLocationComapany(loc_query);
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: loyaltyCard, location: location, message: "Successfully LoyaltyCard Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createLoyaltyCard = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var createdLoyaltyCard = await LoyaltyCardService.createLoyaltyCard(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdLoyaltyCard, message: "Successfully Created LoyaltyCard" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "LoyaltyCard Creation was Unsuccesfull" })
    }
}

exports.updateLoyaltyCard = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedLoyaltyCard = await LoyaltyCardService.updateLoyaltyCard(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedLoyaltyCard, message: "Successfully Updated LoyaltyCard" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeLoyaltyCard = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await LoyaltyCardService.deleteLoyaltyCard(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getLoyaltyCardsDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : ''
        var order = req.query?.order ? req.query.order : '1'
        var search = req.query?.searchText ? req.query.searchText : ""

        var query = {}
        var existQuery = {}
        if (req.query?.status == "active") {
            query['status'] = 1
        }

        if (req.query?.location_id) {
            query['location_id'] = req.query.location_id
        }

        if (req.query?.id) {
            query['_id'] = req.query.id
        }

        if (req.query?.ids && isValidJson(req.query.ids)) {
            var ids = JSON.parse(req.query.ids)
            query['_id'] = { $nin: ids }
            existQuery['_id'] = { $in: ids }
        }

        if (search) {
            search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
            query['$or'] = [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { desc: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        }

        var existLoyaltyCards = []
        if (!isObjEmpty(existQuery)) {
            existLoyaltyCards = await LoyaltyCardService.getLoyaltyCardsDropdown(existQuery, orderName, order) || []
        }

        var loyaltyCards = await LoyaltyCardService.getLoyaltyCardsDropdown(query, orderName, order) || []
        loyaltyCards = existLoyaltyCards.concat(loyaltyCards) || []

        return res.status(200).send({ status: 200, flag: true, data: loyaltyCards, message: "Loyalty cards dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}
