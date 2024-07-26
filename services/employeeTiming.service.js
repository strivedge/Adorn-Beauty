// Gettign the Newly created Mongoose Model we just created 
var EmployeeTiming = require('../models/EmployeeTiming.model');
var User = require('../models/User.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the EmployeeTiming List
exports.getEmployeeTimings = async function (query, data) {
    //console.log('query',query)

    // Try Catch the awaited promise to handle the error 
    var location_id = data.location_id;
    var start_date = data.start_date;
    var end_date = data.end_date;
    try {
        //var EmployeesTiming = await EmployeeTiming.paginate(query, options);
        var employeesTiming = await User.find(query).select({_id:1,name:1,first_name:1,last_name:1});

         var t_query = {
                location_id:location_id,
                //day:weekday,
                $or: [
                    { $and: [{repeat:{$eq:'weekly'}},{end_repeat:{$eq:'ongoing'}},{date:{$lte:end_date}}] },
                    { $and: [{repeat:{$eq:''}}, {date:{$gte:start_date,$lte:end_date}}] },
                    { $and: [ {end_repeat:{$eq:'date'}}, {date:{$lte:end_date}},{repeat_specific_date:{$gte:start_date}} ] }
                 ], 
               };

        if(employeesTiming && employeesTiming.length > 0) {
            for (var i = 0; i < employeesTiming.length; i++) {
                t_query['employee_id'] = employeesTiming[i]._id.toString();
                //console.log('t_query',t_query)
                //var empTiming = await EmployeeTiming.find({employee_id:employeesTiming[i]._id});
                var empTiming = await EmployeeTiming.aggregate([{
                                            $addFields: {
                                                date: {
                                                    $dateToString: {
                                                        format: '%Y-%m-%d',
                                                        date: '$date'
                                                    }
                                                },
                                                repeat_specific_date: {
                                                    $dateToString: {
                                                        format: '%Y-%m-%d',
                                                        date: '$repeat_specific_date'
                                                    }
                                                },
                                            }
                                        }, 
                                        {$match: t_query },
                                        { "$sort": { "updatedAt": -1} },
                                    ]);
                //console.log('empTiming',empTiming);
                if (empTiming && empTiming.length > 0) {
                   employeesTiming[i].timing = empTiming;
                }
            }
                
        }

        return employeesTiming;


    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('EmployeeTiming not available');
    }
}

exports.getEmployeeUniqueTimings = async function (query) {
    //console.log('query',query)

    // Try Catch the awaited promise to handle the error 
    try {

        var _details = await EmployeeTiming.aggregate([{
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    },
                    repeat_specific_date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$repeat_specific_date'
                        }
                    },
                }
            }, 
            {$match: query },
            { "$sort": { "updatedAt": -1} },
             { $group: {
                "_id": "$employee_id",
                 "employee_id": { "$first": "$employee_id" },
                 day : { $first: '$day' },
                 shift_start_time : { $first: '$shift_start_time' },
                 shift_end_time : { $first: '$shift_end_time' },
                 sec_shift_start_time: { $first: '$sec_shift_start_time' },
                 sec_shift_end_time: { $first: '$sec_shift_end_time' },
                 days_off : { $first: '$days_off' },
                 repeat : { $first: '$repeat' },
                 date : { $first: '$date' },
                 end_repeat : { $first: '$end_repeat' },
                 repeat_specific_date : { $first: '$repeat_specific_date' },
                 update_upcoming_shift: { $first: '$update_upcoming_shift'},
                 update_specific_shift: { $first: '$update_specific_shift'},
                 everyday: {  $first: '$everyday' },
            }},
        ]);
        //console.log('if dat',_details)
        
        
        // Return the EmployeeTimingd list that was retured by the mongoose promise
        return _details;

    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('EmployeeTiming not available');
    }
}

exports.getEmployeeAllTimings = async function (query) {
    //console.log('query',query)

    // Try Catch the awaited promise to handle the error 
    try {

        var _details = await EmployeeTiming.aggregate([{
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    },
                    repeat_specific_date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$repeat_specific_date'
                        }
                    },
                }
            }, 
            {$match: query },
            { "$sort": { "updatedAt": -1} },
            //  { $group: {
            //     "_id": "$employee_id",
            //      "employee_id": { "$first": "$employee_id" },
            // }}
        ]);
        //console.log('if dat',_details)
        
        
        // Return the EmployeeTimingd list that was retured by the mongoose promise
        return _details;

    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('EmployeeTiming not available');
    }
}

// Async function to get the EmployeeTiming List
exports.getSpecificEmployeeTimings = async function (employee_id,day,date='') {
    //console.log('employee_id',employee_id)
    //console.log('day',day)
    //console.log('date',date)


    // Try Catch the awaited promise to handle the error 
    try {
        if(date && date != ''){

            var _details = await EmployeeTiming.aggregate([{
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    },
                }
            }, 
            {$match: {
                employee_id:employee_id,
                day:day,
                date:date
            }},
            { "$sort": { "updatedAt": -1} },
        ]);

        _details =_details[0];
        //console.log('if dat',_details[0])
        }else{
            var _details = await EmployeeTiming.findOne({
                employee_id:employee_id,
                day:day
            });
            //console.log('else date',_details)
        }
        
        // Return the EmployeeTimingd list that was retured by the mongoose promise
        return _details;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('EmployeeTiming not available');
    }
}

exports.getEmployeeTiming = async function (id) {

    try {
        // Find the User 
        var _details = await EmployeeTiming.findOne({
            _id:id
        });
        return _details;
        
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("EmployeeTiming not available");
    }

}


exports.createEmployeeTiming = async function (employeeTiming) {
    
    var newEmployeeTiming = new EmployeeTiming({
        location_id: employeeTiming.location_id ? employeeTiming.location_id : "",
        employee_id: employeeTiming.employee_id ? employeeTiming.employee_id : '',
        day: employeeTiming.day? employeeTiming.day : '',
        shift_start_time: employeeTiming.shift_start_time? employeeTiming.shift_start_time :'',
        shift_end_time: employeeTiming.shift_end_time? employeeTiming.shift_end_time : '',
        sec_shift_start_time: employeeTiming.sec_shift_start_time? employeeTiming.sec_shift_start_time :'',
        sec_shift_end_time: employeeTiming.sec_shift_end_time? employeeTiming.sec_shift_end_time : '',
        days_off: employeeTiming.days_off? employeeTiming.days_off : 0,
        repeat:employeeTiming.repeat? employeeTiming.repeat : '',
        date: employeeTiming.date? employeeTiming.date : '',
        end_repeat:employeeTiming.end_repeat? employeeTiming.end_repeat : '',
        repeat_specific_date:employeeTiming.repeat_specific_date? employeeTiming.repeat_specific_date : '',
        update_upcoming_shift: employeeTiming.update_upcoming_shift? employeeTiming.update_upcoming_shift : 0,
        update_specific_shift: employeeTiming.update_specific_shift? employeeTiming.update_specific_shift : 0,
        status: employeeTiming.status ? employeeTiming.status : 1,
        everyday:employeeTiming.everyday? employeeTiming.everyday : '',  
    })

    try {
        // Saving the EmployeeTiming 
        var savedEmployeeTiming = await newEmployeeTiming.save();
        return savedEmployeeTiming;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating EmployeeTiming")
    }
}

exports.updateEmployeeTiming = async function (employeeTiming) {

    var id = employeeTiming._id
    console.log('update id',id)
    try {
        //Find the old EmployeeTiming Object by the Id
        var oldEmployeeTiming = await EmployeeTiming.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the EmployeeTiming")
    }
    // If no old EmployeeTiming Object exists return false
    if (!oldEmployeeTiming) {
        return false;
    }

    //Edit the EmployeeTiming Object
    if(employeeTiming.location_id){
        oldEmployeeTiming.location_id = employeeTiming.location_id;
    }
    if(employeeTiming.employee_id){
        oldEmployeeTiming.employee_id = employeeTiming.employee_id;
    }

    if(employeeTiming.day){
        oldEmployeeTiming.day = employeeTiming.day;
    }
    if(employeeTiming.shift_start_time){
        oldEmployeeTiming.shift_start_time = employeeTiming.shift_start_time;
    }
    if(employeeTiming.shift_end_time){
        oldEmployeeTiming.shift_end_time = employeeTiming.shift_end_time;
    }

    if(employeeTiming.date){
        oldEmployeeTiming.date = employeeTiming.date;
    }
    
    oldEmployeeTiming.sec_shift_start_time = employeeTiming.sec_shift_start_time? employeeTiming.sec_shift_start_time :'';
    oldEmployeeTiming.sec_shift_end_time = employeeTiming.sec_shift_end_time? employeeTiming.sec_shift_end_time : '';
    oldEmployeeTiming.days_off = employeeTiming.days_off? employeeTiming.days_off : 0;
    oldEmployeeTiming.repeat = employeeTiming.repeat? employeeTiming.repeat : '';
    oldEmployeeTiming.end_repeat = employeeTiming.end_repeat? employeeTiming.end_repeat : '';
    oldEmployeeTiming.repeat_specific_date = employeeTiming.repeat_specific_date? employeeTiming.repeat_specific_date : '';
    //oldEmployeeTiming.date = employeeTiming.date? employeeTiming.date : '';
    oldEmployeeTiming.update_upcoming_shift = employeeTiming.update_upcoming_shift? employeeTiming.update_upcoming_shift : 0;
    oldEmployeeTiming.update_specific_shift = employeeTiming.update_specific_shift? employeeTiming.update_specific_shift : 0;

     oldEmployeeTiming.everyday = employeeTiming.everyday? employeeTiming.everyday : ''; 

    try {
        var savedEmployeeTiming = await oldEmployeeTiming.save()
        return savedEmployeeTiming;
    } catch (e) {
        throw Error("And Error occured while updating the EmployeeTiming");
    }
}

exports.deleteEmployeeTimingByDay = async function (employee_id,day) {

    // Delete the EmployeeTiming
    try {
        var deleted = await EmployeeTiming.remove({
            employee_id:employee_id,
            day: day
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("EmployeeTiming Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the EmployeeTiming")
    }
}

exports.deleteEmployeeTiming = async function (id) {

    // Delete the EmployeeTiming
    try {
        var deleted = await EmployeeTiming.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("EmployeeTiming Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the EmployeeTiming")
    }
}

exports.deleteTimingByEmployee = async function (Employee_id) {

    // Delete the EmployeeTiming
    try {
        var deleted = await EmployeeTiming.remove({
            employee_id: employee_id
        })
        
        return deleted;
    } catch (e) {
        console.log('e time day',e)
        throw Error("Error Occured while Deleting the EmployeeTiming")
    }
}


exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await EmployeeTiming.remove(query)
       
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the EmployeeTiming")
    }
}



