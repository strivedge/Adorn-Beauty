var MachineService = require('../services/machine.service');
var ServiceService = require('../services/service.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getMachines = async function (req, res, next) {
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

    if(req.query.searchText && req.query.searchText != 'undefined'){
        query['$or'] = [ { name: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }, { desc: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }];
    }

    try {
        var machines = await MachineService.getMachines(query, parseInt(page), parseInt(limit),order_name,Number(order),searchText)

        // Return the Machines list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: machines, message: "Successfully Machines Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getActiveMachines = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
   
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.status == 1) {
        query['status' ] = 1;
    }
    try {
        // console.log("query ",query)
        var Machines = await MachineService.getActiveMachines(query)
        // Return the Machines list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Machines, message: "Successfully Machines Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getMachine = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Machine = await MachineService.getMachine(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Machine, message: "Successfully Machine Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

// getting all Machines for company copy
exports.getMachinesCompanySpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var data = req.body;
    try {
        var location_id = [];
        for(var i = 0; i < data.length; i++) {
            location_id.push(data[i]);
        }
        var query = {location_id: {$in: location_id}};
        var Machines = await MachineService.getMachinesCompanySpecific(query, page, limit)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Machines, message: "Successfully Services Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getMachinesbyLocation = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    // console.log("req Categories ",req.query)
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000; 
    var query = { location_id: req.query.location_id };

    // console.log('getMachinesbyLocation ',query)
    try {
        var Machines = await MachineService.getMachinesbyLocation(query, page, limit)
        // console.log("Machines ",Machines)
        // Return the Categories list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: Machines, message: "Successfully Machines Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createMachine = async function (req, res, next) {

    try {
        // Calling the Service function with the new object from the Request Body
        var createdMachine = await MachineService.createMachine(req.body)
        return res.status(200).json({status:200, flag: true,data: createdMachine, message: "Successfully Created Machine"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "Machine Creation was Unsuccesfull"})
    }
    
}

exports.updateMachine = async function (req, res, next) {

    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedMachine = await MachineService.updateMachine(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedMachine, message: "Successfully Updated Machine"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeMachine = async function (req, res, next) {

    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    try {
        var deleted = await MachineService.deleteMachine(id);
        res.status(200).send({status: 200, flag: true,message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}





