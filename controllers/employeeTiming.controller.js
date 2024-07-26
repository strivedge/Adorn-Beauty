var EmployeeTimingService = require('../services/employeeTiming.service');
var UserService = require('../services/user.service');
var dateFormat = require('dateformat');

const { getTodayTiming, getAvailableEmployee, checkAppListRefData,setAppListTableData, updateAppListTableData, generateTableTimeSlotNew, setAppointmentsListRefData } = require('../common')
// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getEmployeeTimings = async function (req, res, next) {

    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = {status:1,is_employee:1};
    var equery = {status:1,is_employee:1};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
        equery['location_id'] = req.query.location_id;
    }
    if (req.query.employee_id && req.query.employee_id != 'undefined') {
        query['_id'] = req.query.employee_id.toString();
    }
    try {
        //var EmployeeTimings = await EmployeeTimingService.getEmployeeTimings(query, page, limit)

        var EmployeeTimings = await EmployeeTimingService.getEmployeeTimings(query, req.query);

        var allEmployee = await UserService.getEmployees(equery);
        // Return the EmployeeTimings list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: EmployeeTimings, all_employee:allEmployee, message: "Successfully EmployeeTimings Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

function getAllIndexes(arr, val) {
      var indexes = [], i;
      for(i = 0; i < arr.length; i++)
          if (arr[i].day === val)
              indexes.push(i);
      return indexes;
  }


exports.getEmployeeTiming = async function (req, res, next) {

    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var EmployeeTiming = await EmployeeTimingService.getEmployeeTiming(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: EmployeeTiming, message: "Successfully EmployeeTiming Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getEmployeeTimingsbyLocation = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    // console.log("req Categories ",req.query)
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000; 
    var query = { location_id: req.query.location_id };

    // console.log('getEmployeeTimingsbyLocation ',query)
    try {
        var EmployeeTimings = await EmployeeTimingService.getEmployeeTimingsbyLocation(query, page, limit)
        // console.log("EmployeeTimings ",EmployeeTimings)
        // Return the Categories list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: EmployeeTimings, message: "Successfully Categories Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createEmployeeTiming = async function (req, res, next) {

    //console.log('req body',req.body)

    var weekday = req.body.day;
    if(req.body.date){
        req.body.date = dateFormat(new Date(req.body.date), "yyyy-mm-dd");
    }
    var repeat = req.body.repeat
    var end_repeat = req.body.end_repeat
    
    if(req.body.repeat_specific_date){
        req.body.repeat_specific_date = dateFormat(new Date(req.body.repeat_specific_date), "yyyy-mm-dd");
    }
    
    try {

        if (repeat == 'everyday') {
            var days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday","sunday"];
            repeat = 'weekly';
            req.body.repeat = 'weekly';
            req.body.everyday = 'everyday';
        }else{
            var days = [weekday];
        }

        //console.log('days',days)

        for (var i = 0; i < days.length; i++) {

            weekday = days[i];
            req.body.day = days[i];

            var createdEmployeeTiming = await EmployeeTimingService.createEmployeeTiming(req.body);
        }

        if(!req.body.repeat || req.body.repeat == ''){
            var params = { location_id: req.body.location_id, employee_id: '', date: req.body.date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1,type:'emp_timing' };
            refData = updateAppListTableData(params);   

        }else if(req.body.date && req.body.repeat_specific_date){
            var params = { location_id: req.body.location_id,start_date : req.body.date, end_date: req.body.repeat_specific_date, type:'emp_timing' };
            var refData = setAppointmentsListRefData(params);

        }else if(req.body.end_repeat == 'ongoing'){
            var params = { location_id: req.body.location_id,start_date : req.body.date, type:'emp_timing' };
            var refData = setAppointmentsListRefData(params);
        }

        
        return res.status(200).json({status:200, flag: true,data: createdEmployeeTiming, message: "Successfully Created EmployeeTiming"})
    } catch (e) {
        console.log('e',e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "EmployeeTiming Creation was Unsuccesfull"})
    }

        // var query = {
        //         location_id:req.body.location_id,
        //         day:weekday,
        //         $or: [
        //             { $and: [{repeat:{$eq:'weekly'}},{end_repeat:{$eq:'ongoing'}},{date:{$lte:date}}] },
        //             { $and: [{repeat:{$eq:''}},{date:{$eq:date}}] },
        //             { $and: [ {end_repeat:{$eq:'date'}}, {date:{$lte:date}},{repeat_specific_date:{$gte:date}} ] }
        //          ], 
        //        };

        // if(req.body.update_specific_shift == 1){
        //     console.log('if update_specific_shift')
        //     var checkEmployeeTiming = await EmployeeTimingService.getSpecificEmployeeTimings(req.body.employee_id,req.body.day,req.body.date);
        // }else{
        //     console.log('else not update_specific_shift')
        //     var checkEmployeeTiming = await EmployeeTimingService.getSpecificEmployeeTimings(req.body.employee_id,req.body.day);

        //     // if(req.body.days_off == 1 && checkEmployeeTiming){
        //     //     var isdeleted = await EmployeeTimingService.deleteEmployeeTimingByDay(req.body.employee_id,req.body.day);
        //     //     console.log('isdeleted',isdeleted);
        //     //     checkEmployeeTiming={};
        //     // }
        // }
       
        //console.log('checkEmployeeTiming',checkEmployeeTiming)

    
}

exports.updateEmployeeTiming = async function (req, res, next) {

    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {

        var employeeTiming = await EmployeeTimingService.getEmployeeTiming(req.body._id)

         var updatedEmployeeTiming = await EmployeeTimingService.updateEmployeeTiming(req.body)


        if(employeeTiming){
            var date = dateFormat(employeeTiming.date, "yyyy-mm-dd")
        
            if(!employeeTiming.repeat || employeeTiming.repeat == ''){
                var params = { location_id: employeeTiming.location_id, employee_id: '', date: date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1,type:'emp_timing' };
                refData = updateAppListTableData(params);   

            }else if(employeeTiming.date && employeeTiming.repeat_specific_date){
                var repeat_specific_date = dateFormat(employeeTiming.repeat_specific_date, "yyyy-mm-dd")
                var params = { location_id: employeeTiming.location_id,start_date : date, end_date: repeat_specific_date, type:'emp_timing' };
                var refData = setAppointmentsListRefData(params);

            }else if(employeeTiming.end_repeat == 'ongoing'){
                var params = { location_id: req.body.location_id, start_date : date, type:'emp_timing' };
                var refData = setAppointmentsListRefData(params);
            }
        }

        if(req.body.date){
            req.body.date = dateFormat(new Date(req.body.date), "yyyy-mm-dd");
        }
        
        if(req.body.repeat_specific_date){
            req.body.repeat_specific_date = dateFormat(new Date(req.body.repeat_specific_date), "yyyy-mm-dd");
        }
        
        if(!req.body.repeat || req.body.repeat == ''){
            var params = { location_id: req.body.location_id, employee_id: '', date: req.body.date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1,type:'emp_timing' };
            var refData = updateAppListTableData(params);   

        }else if(req.body.date && req.body.repeat_specific_date){
            var params = { location_id: req.body.location_id,start_date : req.body.date, end_date: req.body.repeat_specific_date, type:'emp_timing' };
            var refData = setAppointmentsListRefData(params);

        }else if(req.body.end_repeat == 'ongoing'){
            var params = { location_id: req.body.location_id,start_date : req.body.date, type:'emp_timing' };
            var refData = setAppointmentsListRefData(params);
        }

        return res.status(200).json({status: 200, flag: true, data: updatedEmployeeTiming, message: "Successfully Updated EmployeeTiming"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeEmployeeTiming = async function (req, res, next) {

    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    try {

        var employeeTiming = await EmployeeTimingService.getEmployeeTiming(id);

        var deleted = await EmployeeTimingService.deleteEmployeeTiming(id);

        if(employeeTiming){
            var date = dateFormat(employeeTiming.date, "yyyy-mm-dd")
        
            if(!employeeTiming.repeat || employeeTiming.repeat == ''){
                var params = { location_id: employeeTiming.location_id, employee_id: '', date: date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1,type:'emp_timing' };
                refData = updateAppListTableData(params);   

            }else if(employeeTiming.date && employeeTiming.repeat_specific_date){
                var repeat_specific_date = dateFormat(employeeTiming.repeat_specific_date, "yyyy-mm-dd")
                var params = { location_id: employeeTiming.location_id,start_date : date, end_date: repeat_specific_date, type:'emp_timing' };
                var refData = setAppointmentsListRefData(params);

            }else if(employeeTiming.end_repeat == 'ongoing'){
                var params = { location_id: employeeTiming.location_id, start_date : date, type:'emp_timing' };
                var refData = setAppointmentsListRefData(params);
            }

        }
        
        
        res.status(200).send({status: 200, flag: true,message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}





