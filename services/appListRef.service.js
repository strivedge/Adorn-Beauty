// Gettign the Newly created Mongoose Model we just created 
var AppListRef = require('../models/AppListRef.model');

// Saving the context of this module inside the _the variable
_this = this



exports.getAppListRefs = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var AppListRefs = await AppListRef.findOne(query)
        // Return the AppListRefd list that was retured by the mongoose promise
        return AppListRefs;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding AppListRefs');
    }
}

exports.getAppListRef = async function (id) {
    try {
        // Find the Data 
        var _details = await AppListRef.findOne({
            _id: id
        });
        if(_details._id) {
            return _details;
        } else {
            return {};
        }
        
    } catch (e) {
        return {};
        // return a Error message describing the reason     
        //throw Error("AppListRef not available");
    }
}

// getting all AppListRefs for company copy
exports.getAppListRefSpecific = async function (query) {
    
    // Try Catch the awaited promise to handle the error 
    try {
        var AppListRefs = await AppListRef.find(query);
        // Return the Serviced list that was retured by the mongoose promise
        return AppListRefs;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating AppListRef');
    }
}


exports.createAppListRef = async function (appListRef) {
    var newAppListRef = new AppListRef({
        location_id: appListRef.location_id ? appListRef.location_id : null,
        date: appListRef.date ? appListRef.date : null,
        employee: appListRef.employee ? appListRef.employee : null,
        tableData: appListRef.tableData ? appListRef.tableData : null,
        today_timing: appListRef.today_timing ? appListRef.today_timing : null,
        bookingData:appListRef.bookingData ? appListRef.bookingData : null,
        block_data:appListRef.block_data ? appListRef.block_data : null,
        allEmpTiming: appListRef.allEmpTiming ? appListRef.allEmpTiming : null,
    })

    try {
        // Saving the AppListRef 
        var savedAppListRef = await newAppListRef.save();
        return savedAppListRef;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating AppListRef")
    }
}

exports.updateAppListRef = async function (appListRef) {
    var id = appListRef._id
    try {
        //Find the old AppListRef Object by the Id
        var oldAppListRef = await AppListRef.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the AppListRef")
    }
    // If no old AppListRef Object exists return false
    if (!oldAppListRef) {
        return false;
    }

    //Edit the AppListRef Object
    if(appListRef.employee) {
        oldAppListRef.employee = appListRef.employee
    }

    if(appListRef.tableData) {
        oldAppListRef.tableData = appListRef.tableData;
    }

    if(appListRef.today_timing) {
        oldAppListRef.today_timing = appListRef.today_timing;
    }

    if(appListRef.bookingData) {
        oldAppListRef.bookingData = appListRef.bookingData;
    }

    if(appListRef.block_data) {
        oldAppListRef.block_data = appListRef.block_data;
    }

    if(appListRef.allEmpTiming){
        oldAppListRef.allEmpTiming = appListRef.allEmpTiming;
    }

    try {
        var savedAppListRef = await oldAppListRef.save()
        return savedAppListRef;
    } catch (e) {
        console.log(e)
        throw Error("And Error occured while updating the AppListRef");
    }
}

exports.deleteAppListRef = async function (id) {
    // Delete the AppListRef
    try {
        var deleted = await AppListRef.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("AppListRef Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the AppListRef")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await AppListRef.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the AppListRef")
    }
}