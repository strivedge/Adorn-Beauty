// Gettign the Newly created Mongoose Model we just created 
var Leave = require('../models/Leave.model');
var jwt = require('jsonwebtoken');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Rota List
exports.getLeaves = async function (query, page, limit, order_name, order, searchText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        // var leaves = await Leave.paginate(query, options)
        var sort = {};
        sort[order_name] = order;

        // if(searchText && searchText != '') {
        //     query['$text'] = { $search: searchText, $language:'en',$caseSensitive:false};
        // }

        var leaves = await Leave.aggregate([
            {$match: query},
            { 
                $project : {
                    _id: 1,
                    company_id:1,
                    location_id:1,
                    start_date: 1,
                    end_date: 1,
                    half_full_day: 1,
                    leave_type: 1,
                    description: 1,
                    status: 1,
                    createdAt:1,
                    employee_id: { $ne: [ "$employee_id", '' ] },
                    employee_id : {
                        $toObjectId : "$employee_id"
                    },
                }
            },
            { $lookup:
                {
                    from: 'users',
                        localField: 'employee_id',
                        foreignField: '_id',
                        as: 'employee_data'
                 },
            },
            { $unwind : "$employee_data"},

            { 
                $project : {
                    _id: 1,
                    company_id:1,
                    location_id:1,
                    start_date: 1,
                    end_date: 1,
                    half_full_day: 1,
                    leave_type: 1,
                    description: 1,
                    status: 1,
                    createdAt:1,
                    employee_id:1,
                    employee_name: "$employee_data.name",
                    employee_email: "$employee_data.email",
                    employee_mobile: "$employee_data.mobile",                
                }
            },
            { $sort : sort },
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
            },   
        ] );
        // Return the Leaves list that was retured by the mongoose promise
        return leaves;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Leaves');
    }
}

exports.getLeave = async function (id) {
    try {
        // Find the Leave 
        var _details = await Leave.findOne({
            _id: id
        });

        if(_details._id){
            return _details;
        } else {
            throw Error("Leave not available");
        }
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Leave not available");
    }

}

exports.createLeave = async function (leave) {
    var newLeave = new Leave({
        company_id: leave.company_id ? leave.company_id : "",
        location_id: leave.location_id ? leave.location_id : "",
        employee_id: leave.employee_id ? leave.employee_id : "",
        start_date: leave.start_date ? leave.start_date : "",
        end_date: leave.end_date ? leave.end_date : "",
        half_full_day: leave.half_full_day ? leave.half_full_day : "",
        leave_type: leave.leave_type ? leave.leave_type : "",
        description: leave.description ? leave.description : "",
        status: leave.status ? leave.status : 0,
    })

    try {
        // Saving the Leave 
        var savedLeave = await newLeave.save();
        return savedLeave;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Leave")
    }
}

exports.updateLeave = async function (leave) {
    var id = leave._id
    try {
        //Find the old Leave Object by the Id
        var oldLeave = await Leave.findById(id);
        console.log('oldLeave ',oldLeave)
    } catch (e) {
        console.log(e)
        throw Error("Error occured while Finding the Leave")
    }
    // If no old Leave Object exists return false
    if (!oldLeave) {
        return false;
    }

    //Edit the Leave Object
    if(leave.company_id) {
        oldLeave.company_id = leave.company_id;
    }

    if(leave.location_id) {
        oldLeave.location_id = leave.location_id;
    }

    if(leave.employee_id) {
        oldLeave.employee_id = leave.employee_id;
    }

    if(leave.start_date) {
        oldLeave.start_date = leave.start_date;
    }

    if(leave.end_date) {
        oldLeave.end_date = leave.end_date;
    }

    if(leave.leave_type) {
        oldLeave.leave_type = leave.leave_type;
    }

    if(leave.half_full_day) {
        oldLeave.half_full_day = leave.half_full_day;
    }

    oldLeave.description = leave.description ? leave.description : "";
    oldLeave.status = leave.status ? leave.status : 0;

    try {
        var savedLeave = await oldLeave.save()
        return savedLeave;
    } catch (e) {
        throw Error("And Error occured while updating the Leave");
    }
}

exports.deleteLeave = async function (id) {
    // Delete the Leave
    try {
        var deleted = await Leave.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Leave Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Leave")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Leave.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Leave")
    }
}