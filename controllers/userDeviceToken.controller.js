var UserDeviceTokenService = require('../services/userDeviceToken.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getUserDeviceTokens = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';
    
    var query = {};
    if (req.query.user_id && req.query.user_id != 'undefined') {
        query['user_id' ] = req.query.user_id;
    }
    if (req.query.device_type && req.query.device_type != 'undefined') {
        query['device_type'] = req.query.device_type;
    }

    if(req.query.searchText && req.query.searchText != 'undefined'){
        query['$or'] = [ { device_type: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'} }];
    }

    try {
        var UserDeviceTokens = await UserDeviceTokenService.getUserDeviceTokens(query, parseInt(page), parseInt(limit),order_name,Number(order),searchText)
        // Return the UserDeviceTokens list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: UserDeviceTokens, message: "Successfully UserDeviceTokens Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getActiveUserDeviceTokens = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.query.user_id && req.query.user_id != 'undefined') {
        query['user_id' ] = req.query.user_id;
    }
    if (req.query.device_type && req.query.device_type != 'undefined') {
        query['device_type'] = req.query.device_type;
    }
    if (req.query.status == 1) {
        query['status' ] = 1;
    }
    try {
        // console.log("query ",query)
        var UserDeviceTokens = await UserDeviceTokenService.getActiveUserDeviceTokens(query)
        // Return the UserDeviceTokens list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: UserDeviceTokens, message: "Successfully UserDeviceTokens Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getUserDeviceToken = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var UserDeviceToken = await UserDeviceTokenService.getUserDeviceToken(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: UserDeviceToken, message: "Successfully UserDeviceToken Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createUserDeviceToken = async function (req, res, next) {

    try {
        // Calling the Service function with the new object from the Request Body
        var createdUserDeviceToken = await UserDeviceTokenService.createUserDeviceToken(req.body)
        return res.status(200).json({status:200, flag: true,data: createdUserDeviceToken, message: "Successfully Created UserDeviceToken"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "UserDeviceToken Creation was Unsuccesfull"})
    }
    
}

exports.updateUserDeviceToken = async function (req, res, next) {

    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedUserDeviceToken = await UserDeviceTokenService.updateUserDeviceToken(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedUserDeviceToken, message: "Successfully Updated UserDeviceToken"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeUserDeviceToken = async function (req, res, next) {

    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    try {
        var deleted = await UserDeviceTokenService.deleteUserDeviceToken(id);
        res.status(200).send({status: 200, flag: true,message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}


exports.removeCustomerDeviceToken = async function (req, res, next) {

    var user_id = req.query.customer_id;
    var device_token = req.query?.device_token || "";
    var required = false;

    if (!user_id) {
        required = true
        message = "User Id must be present!"
    } 
    if (!device_token) {
        required = true
        message = "Device Token must be present!"
    }

      if (required) {
        return res.status(200).json({
            status: 200,
            flag: false,
            data: null,
            message: message
        })
    }   

    try {
        var query = {user_id: user_id, device_token: device_token }
        var deleted = await UserDeviceTokenService.deleteMultiple(query);
        
        return res.status(200).send({status: 200, flag: true,message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}
