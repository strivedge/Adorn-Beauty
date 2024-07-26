var AppliedDiscountService = require('../services/appliedDiscount.service');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this;

//process.env.SECRET = 'supersecret';

// Async Controller function to get the To do List
exports.getAppliedDiscounts = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = {};

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    try {
        var appliedDiscounts = await AppliedDiscountService.getAppliedDiscounts(query, page, limit)
        // Return the AppliedDiscounts list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: appliedDiscounts, message: "Succesfully AppliedDiscounts Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getAppliedDiscount = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var appliedDiscount = await AppliedDiscountService.getAppliedDiscount(id)
        // Return the AppliedDiscount list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: appliedDiscount, message: "Succesfully AppliedDiscount Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getAppointmentAppliedDiscount = async function (req, res, next) {
    if (!req.query.appointment_id) {
        return res.status(200).json({status: 200, flag: false, message: "Appointment Id must be present"})
    }
    var query = {appointment_id: req.query.appointment_id};
    try {
        var appliedDiscount = await AppliedDiscountService.getAppliedCouponSpecific(query)
        // Return the AppliedDiscount list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: appliedDiscount, message: "Succesfully AppliedDiscount Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createAppliedDiscount = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdAppliedDiscount = await AppliedDiscountService.createAppliedDiscount(req.body)
        return res.status(200).json({status:200, flag: true, data: createdAppliedDiscount, message: "Succesfully Created AppliedDiscount"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "AppliedDiscount Creation was Unsuccesfull"})
    }
    
}

exports.updateAppliedDiscount = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedAppliedDiscount = await AppliedDiscountService.updateAppliedDiscount(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedAppliedDiscount, message: "Succesfully Updated AppliedDiscount"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeAppliedDiscount = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    
    try {
        var deleted = await AppliedDiscountService.deleteAppliedDiscount(id);
        res.status(200).send({status: 200, flag: true, message: "Succesfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}