// Gettign the Newly created Mongoose Model we just created 
var EmployeeFilterLog = require('../models/EmployeeFilterLog.model');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this


// getting all EmployeeFilterLogs for company copy
exports.getEmployeeFilterLogsSpecific = async function (query) {
    
    // console.log('query',query)
    // Try Catch the awaited promise to handle the error 
    try {
        //var EmployeeFilterLogs = await EmployeeFilterLog.find(query);

        var EmployeeFilterLogs = await EmployeeFilterLog.aggregate([{
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
        return EmployeeFilterLogs;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Location');
    }
}

exports.updatePackage = async function (data) {
    var id = data._id
    try {
        //Find the old Package Object by the Id
        var oldData= await EmployeeFilterLog.findById(id);
        //console.log('oldData ',oldData)
    } catch (e) {
        throw Error("Error occured while Finding the Data")
    }
    // If no old Package Object exists return false
    if (!oldData) {
        return false;
    }
   
    oldData.employee_ids = data.employee_ids?data.employee_ids:[];

    try {
        var savedData = await oldData.save()
        return savedData;
    } catch (e) {
        throw Error("And Error occured while updating the Data");
    }
}


exports.updateData = async function (query,employee_ids) {
    try {
        // Find the Data and replace booking status
        var EmployeeFilterLog = await EmployeeFilterLog.updateMany(query, {$set: {employee_ids: employee_ids}})

        return EmployeeFilterLog;
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("EmployeeFilterLog not available");
    }

}

exports.createEmployeeFilterLog = async function (employeeFilterLog) {
    var newEmployeeFilterLog = new EmployeeFilterLog({
        location_id: employeeFilterLog.location_id ? employeeFilterLog.location_id : "",
        employee_ids: employeeFilterLog.employee_ids ? employeeFilterLog.employee_ids : [],
        date: employeeFilterLog.date ? employeeFilterLog.date : "",     
    })

    try {
        // Saving the EmployeeFilterLog 
        var savedEmployeeFilterLog = await newEmployeeFilterLog.save();
        return savedEmployeeFilterLog;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating EmployeeFilterLog")
    }
}



exports.deleteEmployeeFilterLog = async function (id) {
    // Delete the EmployeeFilterLog
    try {
        var deleted = await EmployeeFilterLog.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("EmployeeFilterLog Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the EmployeeFilterLog")
    }
}


exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await EmployeeFilterLog.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the EmployeeFilterLog")
    }
}
