// Gettign the Newly created Mongoose Model we just created 
var DashboardRef = require('../models/DashboardRef.model');

// Saving the context of this module inside the _the variable
_this = this



exports.getDashboardRefs = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var dashboardRefs = await DashboardRef.findOne(query)
        // Return the dashboardRefd list that was retured by the mongoose promise
        return dashboardRefs;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding dashboardRefs');
    }
}

exports.getDashboardRef = async function (id) {
    try {
        // Find the Data 
        var _details = await DashboardRef.findOne({
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
        //throw Error("DashboardRef not available");
    }
}

// getting all dashboardRefs for company copy
exports.getDashboardRefSpecific = async function (query) {
    
    // Try Catch the awaited promise to handle the error 
    try {
        var dashboardRefs = await DashboardRef.find(query).sort({ "date": 1});
        // Return the Serviced list that was retured by the mongoose promise
        return dashboardRefs;

    } catch (e) {
        console.log('e',e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating dashboardRef');
    }
}


exports.createDashboardRef = async function (dashboardRef) {
    var newDashboardRef = new DashboardRef({
        location_id: dashboardRef.location_id ? dashboardRef.location_id : "",
        date: dashboardRef.date ? dashboardRef.date : "",
        data: dashboardRef.data ? dashboardRef.data : null,
        re_bookings: dashboardRef.re_bookings ? dashboardRef.re_bookings : null 
    })

    try {
        // Saving the DashboardRef 
        var savedDashboardRef = await newDashboardRef.save();
        return savedDashboardRef;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating dashboardRef")
    }
}

exports.updateDashboardRef = async function (dashboardRef) {
    var id = dashboardRef._id
    try {
        //Find the old DashboardRef Object by the Id
        var oldDashboardRef = await DashboardRef.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the dashboardRef")
    }
    // If no old DashboardRef Object exists return false
    if (!oldDashboardRef) {
        return false;
    }

    //Edit the DashboardRef Object
    if(dashboardRef.data) {
        oldDashboardRef.data = dashboardRef.data
    }

    if(dashboardRef.re_bookings) {
        oldDashboardRef.re_bookings = dashboardRef.re_bookings;
    }

    try {
        var savedDashboardRef = await oldDashboardRef.save()
        return savedDashboardRef;
    } catch (e) {
        console.log(e)
        throw Error("And Error occured while updating the dashboardRef");
    }
}

exports.deleteDashboardRef = async function (id) {
    // Delete the dashboardRef
    try {
        var deleted = await DashboardRef.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("DashboardRef Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the dashboardRef")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await DashboardRef.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the dashboardRef")
    }
}