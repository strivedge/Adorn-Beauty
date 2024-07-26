var GiftCardService = require('../services/giftCard.service');
var ObjectId = require('mongodb').ObjectId
const { isObjEmpty, isValidJson, arrayContainsAll } = require('../helper')

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getGiftCards = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';
    
    var query = {};
    if (req.query.company_id) {
        query['company_id' ] = ObjectId(req.query.company_id);
    }
    if (req.query.location_id) {
        query['location_id'] = ObjectId(req.query.location_id);
    }

    if(req.query.searchText && req.query.searchText != 'undefined'){
        query['$or'] = [ { name: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }, { desc: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }];
    }

    try {
        var GiftCards = await GiftCardService.getGiftCards(query, parseInt(page), parseInt(limit),order_name,Number(order),searchText)
        // Return the GiftCards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: GiftCards, message: "Successfully GiftCards Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getActiveGiftCards = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.query.company_id) {
        query['company_id' ] = ObjectId(req.query.company_id);
    }
    if (req.query.location_id) {
        query['location_id'] = ObjectId(req.query.location_id);
    }
    if (req.query.status == 1) {
        query['status' ] = 1;
    }
    try {
        // console.log("query ",query)
        var GiftCards = await GiftCardService.getActiveGiftCards(query)
        // Return the GiftCards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: GiftCards, message: "Successfully GiftCards Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getGiftCard = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var GiftCard = await GiftCardService.getGiftCard(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: GiftCard, message: "Successfully GiftCard Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createGiftCard = async function (req, res, next) {

    try {
        // Calling the Service function with the new object from the Request Body
        var createdGiftCard = await GiftCardService.createGiftCard(req.body)
        return res.status(200).json({status:200, flag: true,data: createdGiftCard, message: "Successfully Created GiftCard"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "GiftCard Creation was Unsuccesfull"})
    }
    
}

exports.updateGiftCard = async function (req, res, next) {

    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedGiftCard = await GiftCardService.updateGiftCard(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedGiftCard, message: "Successfully Updated GiftCard"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeGiftCard = async function (req, res, next) {

    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    try {
        var deleted = await GiftCardService.deleteGiftCard(id);
        res.status(200).send({status: 200, flag: true,message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.getGiftCardDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : 'createdAt'
        var order = req.query?.order ? req.query.order : '1'
        var search = req.query?.searchText ? req.query.searchText : ""

        var query = {}
        var existQuery = {}
        if (req.query?.status == "active") {
            query['status'] = 1
        }

        if (req.query?.company_id) {
            query['company_id'] = ObjectId(req.query.company_id)
        }

        if (req.query?.location_id) {
            query['location_id'] = ObjectId(req.query.location_id)
        }

        if (req.query?.gender) {
            query['gender'] = { $in: [req.query.gender, 'unisex'] }
        }

        if (req.query?.id) {
            query['_id'] = req.query.id
        }

        if (search) {

            if (!isNaN(search)) {
                query['price'] = { $eq: Number(search), $exists: true }
            } else {
                //search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
                query['$or'] = [
                    { name: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }
        }
        console.log('query',query)

        var giftcard = await GiftCardService.getGiftCardsDropdown(query) || [];

        return res.status(200).send({ status: 200, flag: true, data: giftcard, message: "Gift Card dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

