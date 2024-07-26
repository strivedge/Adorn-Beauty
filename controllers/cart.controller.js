var CartService = require('../services/cart.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getCarts = async function (req, res, next) {
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
        var Carts = await CartService.getCarts(query, parseInt(page), parseInt(limit),order_name,Number(order),searchText)
        // Return the Carts list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Carts, message: "Successfully Carts Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getActiveCarts = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
   
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.browser_id && req.query.browser_id != 'undefined') {
        query['browser_id'] = req.query.browser_id;
    }
    if (req.query.status) {
        query['status' ] = 1;
    }
    try {
        var Carts = await CartService.getActiveCarts(query)
        // Return the Carts list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Carts, message: "Successfully Carts Recieved"});
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getCart = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Cart = await CartService.getCart(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Cart, message: "Successfully Cart Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

// getting all Carts for company copy
exports.getCartSpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    try {
        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id;
        }
        if (req.body.browser_id && req.body.browser_id != 'undefined') {
            query['browser_id'] = req.body.browser_id;
        }
       
        var Carts = await CartService.getCartSpecific(query)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Carts, message: "Successfully Services Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createCart = async function (req, res, next) {

    try {
        // Calling the Service function with the new object from the Request Body
        var createdCart = await CartService.createCart(req.body)
        return res.status(200).json({status:200, flag: true,data: createdCart, message: "Successfully Created Cart"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "Cart Creation was Unsuccesfull"})
    }
    
}

exports.updateCart = async function (req, res, next) {

    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedCart = await CartService.updateCart(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedCart, message: "Successfully Updated Cart"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeCart = async function (req, res, next) {

    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    try {
        var deleted = await CartService.deleteCart(id);
        res.status(200).send({status: 200, flag: true,message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}


exports.removeServiceFromCart = async function (req, res, next) {
    var query = {};
    try {
        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id;
        }
        if (req.body.browser_id && req.body.browser_id != 'undefined') {
            query['browser_id'] = req.body.browser_id;
        }
        if (req.body.service_id && req.body.service_id != 'undefined') {
            query['service_id'] = req.body.service_id;
        }
       
        var deleted = await CartService.deleteMultiple(query);
        res.status(200).send({status: 200, flag: true,message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}





