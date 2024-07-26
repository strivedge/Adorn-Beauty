var ServiceTypeGroupService = require('../services/serviceTypeGroup.service');
var LocationService = require('../services/location.service');
var ServiceService = require('../services/service.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getServiceTypeGroups = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value

    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'menu_order';
    var order = req.query.order ? req.query.order : '1';
    var serachText = req.query.serachText ? req.query.serachText : '';
    
    var query = {status:1};
    if (req.query.status) {
        query['status' ] = 1;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    if(req.query.searchText && req.query.searchText != 'undefined'){
        query['$or'] = [ { name: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }, { desc: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }];
        
        //query['name'] = { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'} 
    }

    // console.log('getServiceTypeGroups',query)
    try {
        var ServiceTypeGroups = await ServiceTypeGroupService.getServiceTypeGroups(query, parseInt(page), parseInt(limit),order_name,Number(order),serachText)
        // Return the ServiceTypeGroups list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: ServiceTypeGroups, message: "Successfully ServiceTypeGroups Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}


exports.getServiceTypeGroupsSpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000; 
    var query = {status:1};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.category_id && req.query.category_id != 'undefined') {
        query['category_id'] = req.query.category_id;
    }
    
    // console.log('getServiceSpecific',query)
    try {
        var Services = await ServiceTypeGroupService.getServiceTypeGroupsSpecific(query, page, limit)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Services, message: "Successfully Services Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}


exports.getServiceTypeGroup = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var ServiceTypeGroup = await ServiceTypeGroupService.getServiceTypeGroup(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: ServiceTypeGroup, message: "Successfully ServiceTypeGroup Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createServiceTypeGroup = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdServiceTypeGroup = await ServiceTypeGroupService.createServiceTypeGroup(req.body)
        return res.status(200).json({status:200, flag: true,data: createdServiceTypeGroup, message: "Successfully Created ServiceTypeGroup"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "ServiceTypeGroup Creation was Unsuccesfull"})
    }
}

exports.updateServiceTypeGroup = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedServiceTypeGroup = await ServiceTypeGroupService.updateServiceTypeGroup(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedServiceTypeGroup, message: "Successfully Updated ServiceTypeGroup"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeServiceTypeGroup = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    try {
        var deleted = await ServiceTypeGroupService.deleteServiceTypeGroup(id);
        res.status(200).send({status: 200, flag: true,message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

