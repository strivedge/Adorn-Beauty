// Gettign the Newly created Mongoose Model we just created 
var LocationTiming = require('../models/LocationTiming.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the LocationTiming List
exports.getLocationTimings = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var LocationsTiming = await LocationTiming.paginate(query, options);

        return LocationsTiming;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('LocationTiming not available');
    }
}

// Async function to get the LocationTiming List
exports.getSpecificLocationTimings = async function (location_id, day) {
    // Try Catch the awaited promise to handle the error 
    try {
        var _details = await LocationTiming.findOne({ location_id: location_id, day: day })

        return _details || null
        // Return the LocationTimingd list that was retured by the mongoose promise
    } catch (e) {
        // return a Error message describing the reason
        return null
        // throw Error('LocationTiming not available')
    }
}

exports.getLocationTiming = async function (id) {
    try {
        // Find the User 
        var _details = await LocationTiming.findOne({ _id: id })

        return _details
    } catch (e) {
        // return a Error message describing the reason     
        return null
        // throw Error("LocationTiming not available")
    }
}

exports.getLocationTimingsSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var LocationsTiming = await LocationTiming.find(query);

        return LocationsTiming;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('LocationTiming not available');
    }
}

exports.createLocationTiming = async function (locationTiming) {
    var newLocationTiming = new LocationTiming({
        location_id: locationTiming.location_id,
        day: locationTiming.day,
        start_time: locationTiming.start_time,
        end_time: locationTiming.end_time,
        status: locationTiming.status ? locationTiming.status : 1
    })

    try {
        // Saving the LocationTiming 
        var savedLocationTiming = await newLocationTiming.save();
        return savedLocationTiming;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating LocationTiming")
    }
}

exports.updateLocationTiming = async function (locationTiming) {
    var id = locationTiming._id
    //console.log('update id',id)
    try {
        //Find the old LocationTiming Object by the Id
        var oldLocationTiming = await LocationTiming.findById(id);
        //console.log('OldLocationTiming ',oldLocationTiming)
    } catch (e) {
        throw Error("Error occured while Finding the LocationTiming")
    }
    // If no old LocationTiming Object exists return false
    if (!oldLocationTiming) {
        return false;
    }

    //Edit the LocationTiming Object

    if (locationTiming.day) {
        oldLocationTiming.day = locationTiming.day;
    }
    if (locationTiming.start_time) {
        oldLocationTiming.start_time = locationTiming.start_time;
    }
    if (locationTiming.end_time) {
        oldLocationTiming.end_time = locationTiming.end_time;
    }

    try {
        var savedLocationTiming = await oldLocationTiming.save()
        return savedLocationTiming;
    } catch (e) {
        throw Error("And Error occured while updating the LocationTiming");
    }
}

exports.deleteLocationTiming = async function (id) {
    // Delete the LocationTiming
    try {
        var deleted = await LocationTiming.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("LocationTiming Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the LocationTiming")
    }
}

exports.deleteTimingByLocation = async function (location_id) {
    // Delete the LocationTiming
    try {
        var deleted = await LocationTiming.remove({
            location_id: location_id
        })

        return deleted;
    } catch (e) {
        console.log('e time day', e)
        throw Error("Error Occured while Deleting the LocationTiming")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await LocationTiming.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the LocationTiming")
    }
}