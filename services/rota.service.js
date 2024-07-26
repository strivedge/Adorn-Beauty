// Gettign the Newly created Mongoose Model we just created 
var Rota = require('../models/Rota.model');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Rota List
exports.getRotas = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var rotas = await Rota.paginate(query, options)
        // Return the Rotas list that was retured by the mongoose promise
        return rotas;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Rotas');
    }
}

exports.getRota = async function (id) {
    try {
        // Find the Rota 
        var _details = await Rota.findOne({
            _id: id
        });
        if(_details._id){
            return _details;
        } else {
            throw Error("Rota not available");
        }
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Rota not available");
    }

}

exports.createRota = async function (rota) {
    var newRota = new Rota({
        company_id: rota.company_id ? rota.company_id : "",
        location_id: rota.location_id ? rota.location_id : "",
        name: rota.name ? rota.name : "",
        start_date: rota.start_date ? rota.start_date : "",
        end_date: rota.end_date ? rota.end_date : "",
        opening_hours: rota.opening_hours ? rota.opening_hours : "",
        shift_start_time: rota.shift_start_time ? rota.shift_start_time : "",
        shift_end_time: rota.shift_end_time ? rota.shift_end_time : "",
        break_start_time: rota.break_start_time ? rota.break_start_time : "",
        break_end_time: rota.break_end_time ? rota.break_end_time : "",
        break_time_duration: rota.break_time_duration ? rota.break_time_duration : 0,
        status: rota.status ? rota.status : 0,
        days_off: rota.days_off ? rota.days_off : "",
    })

    try {
        // Saving the Rota 
        var savedRota = await newRota.save();
        return savedRota;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Rota")
    }
}

exports.updateRota = async function (rota) {
    var id = rota._id
    try {
        //Find the old Rota Object by the Id
        var oldRota = await Rota.findById(id);
        console.log('oldRota ',oldRota)
    } catch (e) {
        console.log(e)
        throw Error("Error occured while Finding the Rota")
    }
    // If no old Rota Object exists return false
    if (!oldRota) {
        return false;
    }

    //Edit the Rota Object
    if(rota.company_id) {
        oldRota.company_id = rota.company_id;
    }

    if(rota.location_id) {
        oldRota.location_id = rota.location_id;
    }

    if(rota.name) {
        oldRota.name = rota.name;
    }

    if(rota.start_date) {
        oldRota.start_date = rota.start_date;
    }

    if(rota.end_date) {
        oldRota.end_date = rota.end_date;
    }

    if(rota.opening_hours) {
        oldRota.opening_hours = rota.opening_hours;
    }
    
    if(rota.shift_start_time) {
        oldRota.shift_start_time = rota.shift_start_time;
    }

    if(rota.shift_end_time) {
        oldRota.shift_end_time = rota.shift_end_time;
    }

    if(rota.break_start_time) {
        oldRota.break_start_time = rota.break_start_time;
    }

    if(rota.break_end_time) {
        oldRota.break_end_time = rota.break_end_time;
    }

    if(rota.break_time_duration) {
        oldRota.break_time_duration = rota.break_time_duration;
    }

    oldRota.status = rota.status ? rota.status : 0;

    if(rota.days_off) {
        oldRota.days_off = rota.days_off;
    }

    try {
        var savedRota = await oldRota.save()
        return savedRota;
    } catch (e) {
        throw Error("And Error occured while updating the Rota");
    }
}

exports.deleteRota = async function (id) {
    // Delete the Rota
    try {
        var deleted = await Rota.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Rota Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Rota")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Rota.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Rota")
    }
}
