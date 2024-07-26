var CustomerReviewService = require('../services/customerReview.service');
var UserService = require('../services/user.service');

// Saving the context of this module inside the _the variable
_this = this;

//process.env.SECRET = 'supersecret';

// Async Controller function to get the To do List
exports.getCustomerReviews = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';
    
    var query = {};
    
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.customer_id && req.query.customer_id != 'undefined') {
        query['customer_id'] = req.query.customer_id;
    }
    if (req.query.name && req.query.name != 'undefined') {
        query['name'] = req.query.name;
    }
    if (req.query.email && req.query.email != 'undefined') {
        query['email'] = req.query.email;
    }
    if(req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [ { rating: req.query.searchText },
        { name: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'} },{ review: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'} }];
    }
    try {
        var CustomerReviews = await CustomerReviewService.getCustomerReviews(query, parseInt(page), parseInt(limit),order_name,Number(order), searchText)
        // Return the CustomerReviews list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: CustomerReviews, message: "Succesfully CustomerReviews Recieved"});
    } catch (e) {
        // console.log('err',e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getCustomerSpecificReview = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
   if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.customer_id && req.query.customer_id != 'undefined') {
        query['customer_id'] = req.query.customer_id;
    }
    if (req.query.name && req.query.name != 'undefined') {
        query['name'] = req.query.name;
    }
     if (req.query.email && req.query.email != 'undefined') {
        query['email'] = req.query.email;
    }
    try {
        var CustomerReview = await CustomerReviewService.getCustomerRewardsSpecific(query)
        // Return the CustomerReview list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: CustomerReview, message: "Succesfully CustomerReview Recieved"});
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getCustomerReview = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var CustomerReview = await CustomerReviewService.getCustomerReview(id)
        // Return the CustomerReview list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: CustomerReview, message: "Succesfully CustomerReview Recieved"});
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}


exports.createCustomerReview = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        var createdCustomerReview = await CustomerReviewService.createCustomerReview(req.body);

        return res.status(200).json({status:200, flag: true,data: createdCustomerReview, message: "Succesfully Created CustomerReview"})
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "CustomerReview Creation was Unsuccesfull"})
    }
}

exports.updateCustomerReview = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedCustomerReview = await CustomerReviewService.updateCustomerReview(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedCustomerReview, message: "Succesfully Updated CustomerReview"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeCustomerReview = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    
    try {
        var deleted = await CustomerReviewService.deleteCustomerReview(id);
        res.status(200).send({status: 200, flag: true, message: "Succesfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}