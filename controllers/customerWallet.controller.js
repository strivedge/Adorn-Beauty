var CustomerWalletService = require('../services/customerWallet.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getCustomerWallets = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';
    
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id' ] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    if(req.query.searchText && req.query.searchText != 'undefined'){
        query['$or'] = [ { name: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }, { desc: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }];
    }

    try {
        var CustomerWallets = await CustomerWalletService.getCustomerWallets(query, parseInt(page), parseInt(limit),order_name,Number(order),searchText)
        // Return the CustomerWallets list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: CustomerWallets, message: "Successfully CustomerWallets Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getActiveCustomerWallets = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id' ] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.status == 1) {
        query['status' ] = 1;
    }
    try {
        // console.log("query ",query)
        var CustomerWallets = await CustomerWalletService.getActiveCustomerWallets(query)
        // Return the CustomerWallets list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: CustomerWallets, message: "Successfully CustomerWallets Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getCustomerWallet = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var CustomerWallet = await CustomerWalletService.getCustomerWallet(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: CustomerWallet, message: "Successfully CustomerWallet Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createCustomerWallet = async function (req, res, next) {

    try {
        // Calling the Service function with the new object from the Request Body
        var createdCustomerWallet = await CustomerWalletService.createCustomerWallet(req.body)
        return res.status(200).json({status:200, flag: true,data: createdCustomerWallet, message: "Successfully Created CustomerWallet"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "CustomerWallet Creation was Unsuccesfull"})
    }
    
}

exports.updateCustomerWallet = async function (req, res, next) {

    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedCustomerWallet = await CustomerWalletService.updateCustomerWallet(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedCustomerWallet, message: "Successfully Updated CustomerWallet"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeCustomerWallet = async function (req, res, next) {

    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    try {
        var deleted = await CustomerWalletService.deleteCustomerWallet(id);
        res.status(200).send({status: 200, flag: true,message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

