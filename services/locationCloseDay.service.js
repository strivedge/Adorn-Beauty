// Gettign the Newly created Mongoose Model we just created 
var LocationCloseDay = require('../models/LocationCloseDay.model');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the LocationCloseDay List
exports.getLocationCloseDays = async function (query, page, limit) {

    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var LocationCloseDays = await LocationCloseDay.paginate(query, options)
        // Return the LocationCloseDayd list that was retured by the mongoose promise
        return LocationCloseDays;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Location Close Days');
    }
}

// Async function to get the LocationTiming List
exports.getSpecificLocationCloseDay = async function (location_id) {


    // Try Catch the awaited promise to handle the error 
    try {
        var _details = await LocationCloseDay.findOne({
            location_id:location_id
        });
        return _details;
        // Return the LocationTimingd list that was retured by the mongoose promise
        return _details;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Location Close Day not available');
    }
}

exports.getLocationCloseDay = async function (location_id) {

    try {
        // Find the Data 
        var _details = await LocationCloseDay.findOne({
            location_id: location_id
        });
        return _details;
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("LocationCloseDay not available");
    }

}


exports.createLocationCloseDay = async function (locationCloseDay) {
    
    var newLocationCloseDay = new LocationCloseDay({
        location_id: locationCloseDay.location_id,
        name: locationCloseDay.name,
        start_date: locationCloseDay.start_date,
        end_date: locationCloseDay.end_date,
        status: locationCloseDay.status ? locationCloseDay.status : 1  
    })

    try {
        // Saving the LocationCloseDay 
        var savedLocationCloseDay = await newLocationCloseDay.save();
        return savedLocationCloseDay;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating LocationCloseDay")
    }
}

exports.updateLocationCloseDay = async function (locationCloseDay) {

    var id = locationCloseDay._id
    try {
        //Find the old LocationCloseDay Object by the Id
        var oldLocationCloseDay = await LocationCloseDay.findById(id);
        console.log('OldLocationCloseDay ',oldLocationCloseDay)
    } catch (e) {
        throw Error("Error occured while Finding the LocationCloseDay")
    }
    // If no old LocationCloseDay Object exists return false
    if (!oldLocationCloseDay) {
        return false;
    }

    //Edit the LocationCloseDay Object

    if(locationCloseDay.name){
        oldLocationCloseDay.name = locationCloseDay.name;
    }
    if(locationCloseDay.start_date){
        oldLocationCloseDay.start_date = locationCloseDay.start_date;
    }
    if(locationCloseDay.end_date){
        oldLocationCloseDay.end_date = locationCloseDay.end_date;
    }
    

    try {
        var savedLocationCloseDay = await oldLocationCloseDay.save()
        return savedLocationCloseDay;
    } catch (e) {
        throw Error("And Error occured while updating the LocationCloseDay");
    }
}

exports.deleteLocationCloseDay = async function (id) {

    // Delete the LocationCloseDay
    try {
        var deleted = await LocationCloseDay.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("LocationCloseDay Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the LocationCloseDay")
    }
}

exports.deleteCloseDayByLocation = async function (location_id) {

    // Delete the LocationTiming
    try {
        var deleted = await LocationCloseDay.remove({
            location_id: location_id
        })
        
        return deleted;
    } catch (e) {
        console.log('e close day',e)
        throw Error("Error Occured while Deleting the LocationTiming")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await LocationCloseDay.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the LocationCloseDay")
    }
}




