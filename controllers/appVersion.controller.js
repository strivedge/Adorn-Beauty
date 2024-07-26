var AppVersionService = require('../services/appVersion.service');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this;

//process.env.SECRET = 'supersecret';

// Async Controller function to get the To do List
exports.getAppVersions = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
    var limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 100;
    var query = {};
    try {
        var AppVersions = await AppVersionService.getAppVersions(query, page, limit)
        // Return the AppVersions list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: AppVersions, message: "Succesfully AppVersions Recieved"});
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getAppVersion = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var AppVersion = await AppVersionService.getAppVersion(id)
        // Return the AppVersion list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: AppVersion, message: "Succesfully AppVersion Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createAppVersion = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdAppVersion = await AppVersionService.createAppVersion(req.body)
        return res.status(200).json({status:200, flag: true,data: createdAppVersion, message: "Succesfully Created AppVersion"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "AppVersion Creation was Unsuccesfull"})
    }
    
}

exports.updateAppVersion = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedAppVersion = await AppVersionService.updateAppVersion(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedAppVersion, message: "Succesfully Updated AppVersion"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeAppVersion = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    
    try {
        var deleted = await AppVersionService.deleteAppVersion(id);
        res.status(200).send({status: 200, flag: true, message: "Succesfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}