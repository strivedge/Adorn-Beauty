// Gettign the Newly created Mongoose Model we just created 
var EmployeeNumberLog = require('../models/EmployeeNumberLog.model');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this


// getting all EmployeeNumberLogs for company copy
exports.getEmployeeNumberLogsSpecific = async function (query) {
    
    // console.log('query',query)
    // Try Catch the awaited promise to handle the error 
    try {
        //var EmployeeNumberLogs = await EmployeeNumberLog.find(query);

        var EmployeeNumberLogs = await EmployeeNumberLog.aggregate([{
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            }, 
            {$match: query},
        ]);

        // Return the Serviced list that was retured by the mongoose promise
        return EmployeeNumberLogs;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Location');
    }
}


exports.updateData = async function (query,user_order) {
    try {
        // Find the Data and replace booking status
        var employeeNumberLog = await EmployeeNumberLog.updateMany(query, {$set: {user_order: user_order}})

        return employeeNumberLog;
        
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("EmployeeNumberLog not available");
    }

}

exports.createEmployeeNumberLog = async function (employeeNumberLog) {
    var newEmployeeNumberLog = new EmployeeNumberLog({
        location_id: employeeNumberLog.location_id ? employeeNumberLog.location_id : "",
        employee_id: employeeNumberLog.employee_id ? employeeNumberLog.employee_id : "",
        date: employeeNumberLog.date ? employeeNumberLog.date : "",   
        user_order: employeeNumberLog.user_order ? employeeNumberLog.user_order : 0,  
    })

    try {
        // Saving the EmployeeNumberLog 
        var savedEmployeeNumberLog = await newEmployeeNumberLog.save();
        return savedEmployeeNumberLog;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating EmployeeNumberLog")
    }
}



exports.deleteEmployeeNumberLog = async function (id) {
    // Delete the EmployeeNumberLog
    try {
        var deleted = await EmployeeNumberLog.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("EmployeeNumberLog Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the EmployeeNumberLog")
    }
}


exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await EmployeeNumberLog.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the EmployeeNumberLog")
    }
}
