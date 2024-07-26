// Gettign the Newly created Mongoose Model we just created 
var EmployeeService = require('../models/EmployeeService.model');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the EmployeeService List
exports.getEmployeeServices = async function (query, page, limit) {

    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var EmployeeServices = await EmployeeService.paginate(query, options)
        // Return the EmployeeServiced list that was retured by the mongoose promise
        return EmployeeServices;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating EmployeeServices');
    }
}

exports.getEmployeeService = async function (id) {

    try {
        // Find the Data 
        var _details = await EmployeeService.findOne({
            _id: id
        });
        if(_details._id){
            return _details;
        }else{
            throw Error("EmployeeService not available");
        }
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("EmployeeService not available");
    }

}


exports.createEmployeeService = async function (employeeService) {
    
    var newEmployeeService = new EmployeeService({
        location_id: employeeService.location_id ? employeeService.location_id : "",
        user_id: employeeService.user_id ? employeeService.user_id : "",
        service_type_id: employeeService.service_type_id ? employeeService.service_type_id : "",
        service_id: employeeService.service_id ? employeeService.service_id : "",
        name:employeeService.name ? employeeService.name : "",
        status: employeeService.status ? employeeService.status : 1  
    })

    try {
        // Saving the EmployeeService 
        var savedEmployeeService = await newEmployeeService.save();
        return savedEmployeeService;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating EmployeeService")
    }
}

exports.updateEmployeeService = async function (employeeService) {

    var id = employeeService._id
    try {

        //Find the old EmployeeService Object by the Id
        var oldEmployeeService = await EmployeeService.findById(id);
        console.log('OldEmployeeService ',oldEmployeeService)
    } catch (e) {
        throw Error("Error occured while Finding the EmployeeService")
    }
    // If no old EmployeeService Object exists return false
    if (!oldEmployeeService) {
        return false;
    }

    //Edit the EmployeeService Object
    if(employeeService.user_id){
        oldEmployeeService.user_id = employeeService.user_id;
    }
    if(employeeService.service_type_id){
        oldEmployeeService.service_type_id = employeeService.service_type_id;
    }
    if(employeeService.service_id){
        oldEmployeeService.service_id = employeeService.service_id;
    }
    if(employeeService.location_id){
        oldEmployeeService.location_id = employeeService.location_id;
    }
     if(employeeService.name){
        oldEmployeeService.name = employeeService.name;
    }
   
    try {
        var savedEmployeeService = await oldEmployeeService.save()
        return savedEmployeeService;
    } catch (e) {
        throw Error("And Error occured while updating the EmployeeService");
    }
}

exports.deleteEmployeeService = async function (id) {

    // Delete the EmployeeService
    try {
        var deleted = await EmployeeService.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("EmployeeService Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the EmployeeService")
    }
}


exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await EmployeeService.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the EmployeeService")
    }
}




