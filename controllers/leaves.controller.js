var LeaveService = require('../services/leave.service');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this;

//process.env.SECRET = 'supersecret';

// Async Controller function to get the To do List
exports.getLeaves = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';
    
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        //query = {company_id: req.query.company_id,status: 1};
        query['company_id' ] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        //query = {location_id: req.query.location_id,status: 1};
        query['location_id'] = req.query.location_id;
    }
    if (req.query.employee_id && req.query.employee_id != 'undefined') {
        query['employee_id'] = req.query.employee_id;
    }

    try {
        var Leaves = await LeaveService.getLeaves(query, parseInt(page), parseInt(limit), order_name,Number(order), searchText)
        // Return the Leaves list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Leaves, message: "Succesfully Leaves Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getLeave = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Leave = await LeaveService.getLeave(id)
        // Return the Leave list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Leave, message: "Succesfully Leave Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createLeave = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdLeave = await LeaveService.createLeave(req.body)
        return res.status(200).json({status:200, flag: true,data: createdLeave, message: "Succesfully Created Leave"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "Leave Creation was Unsuccesfull"})
    }
    
}

exports.updateLeave = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedLeave = await LeaveService.updateLeave(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedLeave, message: "Succesfully Updated Leave"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeLeave = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    
    try {
        var deleted = await LeaveService.deleteLeave(id);
        res.status(200).send({status: 200, flag: true, message: "Succesfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}