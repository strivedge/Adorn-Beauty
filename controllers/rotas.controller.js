var RotaService = require('../services/rota.service');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this;

//process.env.SECRET = 'supersecret';

// Async Controller function to get the To do List
exports.getRotas = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        //query = {company_id: req.query.company_id,status: 1};
        query['company_id' ] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        //query = {location_id: req.query.location_id,status: 1};
        query['location_id'] = req.query.location_id;
    }
    try {
        var Rotas = await RotaService.getRotas(query, page, limit)
        // Return the Rotas list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Rotas, message: "Succesfully Rotas Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getRota = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Rota = await RotaService.getRota(id)
        // Return the Rota list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Rota, message: "Succesfully Rota Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createRota = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdRota = await RotaService.createRota(req.body)
        return res.status(200).json({status:200, flag: true,data: createdRota, message: "Succesfully Created Rota"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "Rota Creation was Unsuccesfull"})
    }
    
}

exports.updateRota = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedRota = await RotaService.updateRota(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedRota, message: "Succesfully Updated Rota"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeRota = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    
    try {
        var deleted = await RotaService.deleteRota(id);
        res.status(200).send({status: 200, flag: true, message: "Succesfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}