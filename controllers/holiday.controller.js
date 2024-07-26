var HolidayService = require('../services/holiday.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getHolidays = async function (req, res, next) {
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
    if(req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [ { name: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'} }];
    }
    // console.log('getCategories',query)
    try {
        var Holidays = await HolidayService.getHolidays(query, parseInt(page), parseInt(limit),order_name,Number(order),searchText)
        // Return the Holidays list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Holidays, message: "Successfully Holidays Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getHoliday = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Holiday = await HolidayService.getHoliday(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Holiday, message: "Successfully Holiday Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createHoliday = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdHoliday = await HolidayService.createHoliday(req.body)
        return res.status(200).json({status:200, flag: true,data: createdHoliday, message: "Successfully Created Holiday"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "Category Creation was Unsuccesfull"})
    } 
}

exports.updateHoliday = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedHoliday = await HolidayService.updateHoliday(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedHoliday, message: "Successfully Updated Holiday"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeHoliday = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    try {
        var deleted = await HolidayService.deleteHoliday(id);
        res.status(200).send({status: 200, flag: true, message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}