// Gettign the Newly created Mongoose Model we just created 
var Holiday = require('../models/Holiday.model');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Holiday List
exports.getHolidays = async function (query, page, limit, order_name, order, searchText) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {}
        sort[order_name] = order

        const facetedPipeline = [
            { $match: query },
            { $sort: sort },
            {
                "$facet": {
                    "data": [
                        { "$skip": page },
                        { "$limit": limit }
                    ],
                    "pagination": [
                        { "$count": "total" }
                    ]
                }
            }
        ]

        var Holidays = await Holiday.aggregate(facetedPipeline)

        // Return the Holiday list that was retured by the mongoose promise
        return Holidays
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Holidays')
    }
}

exports.getHolidaysOne = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var holidays = await Holiday.find(query)

        // Return the Serviced list that was retured by the mongoose promise
        return holidays
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting Holidays')
    }
}

exports.getHolidaysSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Holidays = await Holiday.find(query)

        // Return the Serviced list that was retured by the mongoose promise
        return Holidays
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting Holidays')
    }
}

exports.getHoliday = async function (id) {
    try {
        // Find the Data 
        var _details = await Holiday.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Holiday not available")
    }
}

exports.createHoliday = async function (holiday) {
    var newHoliday = new Holiday({
        company_id: holiday.company_id ? holiday.company_id : "",
        location_id: holiday.location_id ? holiday.location_id : "",
        name: holiday.name ? holiday.name : "",
        date: holiday.date ? holiday.date : null,
        status: holiday.status ? holiday.status : 0
    })

    try {
        // Saving the Holiday 
        var savedHoliday = await newHoliday.save();
        return savedHoliday;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Holiday")
    }
}

exports.updateHoliday = async function (holiday) {
    var id = holiday._id
    try {
        //Find the old Category Object by the Id
        var oldHoliday = await Holiday.findById(id);
        // console.log('OldHoliday ',oldHoliday)
    } catch (e) {
        throw Error("Error occured while Finding the Holiday")
    }
    // If no old Holiday Object exists return false
    if (!oldHoliday) {
        return false;
    }

    //Edit the Holiday Object
    if (holiday.company_id) {
        oldHoliday.company_id = holiday.company_id;
    }

    if (holiday.location_id) {
        oldHoliday.location_id = holiday.location_id;
    }

    if (holiday.name) {
        oldHoliday.name = holiday.name;
    }

    if (holiday.date) {
        oldHoliday.date = holiday.date;
    }

    oldHoliday.status = holiday.status ? holiday.status : 0;

    try {
        var savedHoliday = await oldHoliday.save()
        return savedHoliday;
    } catch (e) {
        throw Error("And Error occured while updating the Holiday");
    }
}

exports.deleteHoliday = async function (id) {
    // Delete the Holiday
    try {
        var deleted = await Holiday.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Holiday Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Holiday")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Holiday.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Holiday")
    }
}
