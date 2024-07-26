const moment = require("moment")
var ObjectId = require('mongodb').ObjectID

var UserService = require('../services/user.service')
var CustomerService = require('../services/customer.service')
var ServiceService = require('../services/service.service')
var MachineService = require('../services/machine.service')
var CategoryService = require('../services/category.service')
var BlockTimeService = require('../services/blockTime.service')
var AppointmentService = require('../services/appointment.service')
var LocationTimingService = require('../services/locationTiming.service')
var EmployeeTimingService = require('../services/employeeTiming.service')
var MasterService = require('../services/masterService.service')
var MasterCategoryService = require('../services/masterCategory.service')
var CategoryService = require('../services/category.service')
var TestService = require('../services/test.service');
const { isObjEmpty, isValidJson, arrayContainsAll } = require('../helper')

const { getPatchTestBooking, checkServiceLimit, getEmployeeListByServices } = require('../common')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getServices = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : '_id';
    var order = req.query.order ? req.query.order : '1';

    var query = { status: 1 }
    if (req.query.online_status && req.body.online_status == 1) {
        query['online_status'] = 1;
    }

    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    if (req.query.category_id && req.query.category_id != 'undefined') {
        query['category_id'] = req.query.category_id;
    }

    if (req.query.searchText && req.query.searchText != 'undefined') {

        if (!isNaN(req.query.searchText)) {
            query['price'] = { $eq: Number(req.query.searchText), $exists: true };
        } else {
            req.query.searchText = req.query.searchText.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
            query['$or'] = [
                { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                { gender: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                { desc: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                { price: { $eq: req.query.searchText } }
            ]
        }
    }

    try {
        var Services = await ServiceService.getServices(query, parseInt(page), parseInt(limit), order_name, Number(order))

        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Services, message: "Successfully Services Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getServiceSpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = { status: 1 };
    if (req.query.online_status == 1) {
        query['online_status'] = 1;
    }

    if (req.query.company_id) {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id) {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.category_id) {
        query['category_id'] = req.query.category_id;
    }

    if (req.query?.gender) {
        query['gender'] = { $in: [req.query.gender.toLowerCase(), 'unisex'] }
    }


    if (req.query.searchText) {
        if (!isNaN(req.query.searchText)) {
            query['price'] = { $eq: Number(req.query.searchText), $exists: true }
        } else {
            req.query.searchText = req.query.searchText.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
            query['$or'] = [
                { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
            ]
        }
    }
    try {
        var Services = await ServiceService.getServiceSpecific(query, page, limit)

        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Services, message: "Successfully Services Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// for branch copy
exports.getServicesbyLocation = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = { location_id: req.query.location_id };


    if (req.query.status == 1) {
        query['status'] = 1;
    }

    if (req.query.online_status == 1) {
        query['online_status'] = 1;
    }

    try {
        var service = await ServiceService.getServicesbyLocation(query, page, limit)
        // Return the Categories list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: service, message: "Successfully Categories Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getService = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Service = await ServiceService.getService(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Service, message: "Successfully Service Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

const mode = function (arr) {

    return arr.sort((a, b) =>
        arr.filter(v => v === a).length
        - arr.filter(v => v === b).length
    ).pop();

}

const checkOccurrence = (array, element) => {
    let counter = 0;
    for (item of array) {
        if (item == element) {
            counter++;
        }
    };
    return counter;
}

exports.checkServiceLimit = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 100;
    var query = {};
    var location_id = req.body.location_id;
    var date = req.body.date;
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;
    var group_data = req.body.group_data ? req.body.group_data : 0;
    req.body.all_ser = req.body.all_ser ? req.body.all_ser : [];

    var client_id = [req.body.client_id];

    var services = req.body?.services || [];
    var services_arr = [];
    if (services && services?.length > 0) {
        services_arr = services.map(s => s._id);
        booking_arr = services.map(s => s._id);
    }

    try {
        var client_data = await CustomerService.getCustomerById(client_id);
        var patch_booking = [];
        if (services_arr && services_arr?.length > 0) {
            var ser_query = { _id: { $in: services_arr } };
            var sel_service = await ServiceService.getServiceSpecific(ser_query);

            var cat_arr = sel_service.map(c => c.test_id.toString());
            var resultArray = Array.prototype.concat.apply([], cat_arr);
            cat_arr = Array.from(new Set(resultArray)); //unique ids

            var all_ser_query = { test_id: { $in: cat_arr } };
            var all_service = await ServiceService.getServiceSpecific(all_ser_query);

            var all_service_arr = all_service.map(s => s._id.toString());

            var patch_query = {
                client_id: { $elemMatch: { $in: client_id } },
                date: { $lte: date },
                service_id: { $elemMatch: { $in: all_service_arr } },
                patch_test_booking: 1,
                booking_status: { $nin: ['cancel', 'no_shows'] }
            };

            if (req.body.app_id && req.body.app_id != '') {
                patch_query['_id'] = { $ne: ObjectId(req.body.app_id) };
            }

            patch_booking = await AppointmentService.getNotShowAppointment(patch_query, 0, 1);
            if (patch_booking && patch_booking?.length > 0) {
                var service_query = {};
                service_query['_id'] = { $in: patch_booking[0].service_id };
                var service = await ServiceService.getServiceSpecific(service_query);
                var ser = '';
                for (var s = 0; s < service.length; s++) {
                    ser += service[s].name + ", ";
                }

                ser = ser.replace(/,\s*$/, "");

                patch_booking[0].service_id = ser;
                patch_booking[0].client_name = client_data.name;
            }
        }

        var limit_exceed = false;
        var limit_exceed_msg = 'This slot is unavailable for ';
        var appointments = [];
        var ser_arr = [];
        if (start_time && end_time) {
            query['services'] = { $elemMatch: { $in: services_arr } };
            ser_arr = await MachineService.getActiveMachines(query);
            var app_query = { location_id: location_id, date: date };

            app_query['booking_status'] = { $nin: ['cancel', 'no_shows', 'complete'] };

            if (req.body.app_id && req.body.app_id != '') {
                app_query['_id'] = { $ne: ObjectId(req.body.app_id) };
            }

            var app = [];
            var app_ser = [];
            if (ser_arr && ser_arr?.length > 0) {
                var all_machine_ser = ser_arr.map(s => s.services);
                all_machine_ser = [].concat.apply([], all_machine_ser);
                app_query['service_id'] = { $elemMatch: { $in: all_machine_ser } };
            } else {
                app_query['service_id'] = { $elemMatch: { $in: services_arr } };
            }

            appointments = await AppointmentService.getAppointmentSpecific(app_query, page, limit);
            var time = timeToNum(start_time);
            var stime = time;
            if (end_time) {
                var etime = timeToNum(end_time);
            }

            var start_time_split = start_time.split(':');
            var end_time_split = end_time.split(':');

            var booked_time_slots = timeSlotGenerateInNum2(parseInt(start_time_split[0]), parseInt(end_time_split[0]), parseInt(start_time_split[1]), parseInt(end_time_split[1]));

            for (var i = 0; i < appointments.length; i++) {
                if (appointments[i].start_time && appointments[i].end_time) {

                    var st = timeToNum(appointments[i].start_time);
                    var et = timeToNum(appointments[i].end_time);
                    var isInRangeEndTime = false; //start_time

                    if (end_time && booked_time_slots.length > 0) {
                        for (var bs = 0; bs < booked_time_slots.length; bs++) {

                            if (booked_time_slots[bs] != stime && booked_time_slots[bs] != etime && booked_time_slots.length != 2) {
                                var inStartEndRange = inRange(booked_time_slots[bs], st, et);
                                if (inStartEndRange) {
                                    isInRangeEndTime = inStartEndRange;
                                }
                            } else if (booked_time_slots.length == 2 && booked_time_slots[0] >= st && booked_time_slots[1] <= et) {

                                var inStartEndRange = inRange(booked_time_slots[bs], st, et);
                                if (inStartEndRange) {
                                    isInRangeEndTime = inStartEndRange;
                                }
                            }
                        }
                    }
                    if (stime) {
                        var inStartEndRange = inRange(stime, st, et);
                        if (inStartEndRange) {
                            isInRangeEndTime = inStartEndRange;
                        }
                    }
                    if (etime) {
                        var inStartEndRange = inRange(etime, st, et);
                        if (inStartEndRange) {
                            isInRangeEndTime = inStartEndRange;
                        }
                    }

                    if (isInRangeEndTime && all_machine_ser) {
                        var array1 = appointments[i].service_id;
                        const matchArr = array1.filter(element => all_machine_ser.includes(element));
                        if (matchArr.length > 0) {
                            app.push(appointments[i]);
                            app_ser = app_ser.concat(matchArr)
                        }
                    }
                }
            }

            var limit_exceed_ser = [];

            for (var i = 0; i < ser_arr.length; i++) {
                //for(var j = 0; j < ser_arr[i].services.length; j++){
                //var count = countOccurrences(app_ser,ser_arr[i].services[j].toString());
                var count = app_ser.length;
                //const filteredArray = ser_arr[i].services.filter(value => app_ser.includes(value));
                //var count = filteredArray.length;

                const filteredArray2 = ser_arr[i].services.filter(value => booking_arr.includes(value));

                var ser_query = { _id: { $in: ser_arr[i].services } };
                var mach_service = await ServiceService.getServiceSpecific(ser_query);

                var cat_arr = mach_service.map(c => c.category_id.toString());
                var resultArray = Array.prototype.concat.apply([], cat_arr);
                cat_arr = Array.from(new Set(resultArray)); //unique ids

                const catArray = cat_arr.filter(value => req.body.all_ser.includes(value));
                var max_occurances = 0;
                if (catArray && catArray?.length > 0) {
                    for (var ci = 0; ci < catArray.length; ci++) {
                        var occ = checkOccurrence(req.body.all_ser, catArray[ci]);
                        if (occ > max_occurances) {
                            max_occurances = occ;
                        }
                    }
                }
                if (max_occurances > 1) {
                    group_data = max_occurances;
                } else {
                    group_data = 1;
                }

                if (filteredArray2.length > 0) {
                    count = count + group_data;
                }

                if (ser_arr[i].limit > 0 || ser_arr[i].limit == 0) {
                    if (count > ser_arr[i].limit || ser_arr[i].limit == 0) { //
                        limit_exceed = true;
                        limit_exceed_ser.push(ser_arr[i].services)
                    }
                }
            }

            limit_exceed_ser = [].concat.apply([], limit_exceed_ser);
            if (limit_exceed && limit_exceed_ser?.length > 0) {
                limit_exceed_ser = Array.from(new Set(limit_exceed_ser)); //remove duplicates

                var squery = {};
                const filteredArray = limit_exceed_ser.filter(value => booking_arr.includes(value));

                squery['_id'] = { $in: filteredArray };
                var ser_arr_data = await ServiceService.getServicesbyLocation(squery, page, limit);

                ser_arr_data = ser_arr_data.map(s => s.name).join(", ");
                ser_arr_data = ser_arr_data.toString();

                limit_exceed_msg += ser_arr_data;
            }
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, limit_exceed: limit_exceed, limit_exceed_msg: limit_exceed_msg, app_ser: app_ser, app: app, appointments: appointments, data: ser_arr, patch_booking: patch_booking, message: "Service limit recieved successfully!" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.checkServiceLimit_old = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 5000;
    var query = {};
    var location_id = req.body.location_id;
    var date = req.body.date;
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;

    var client_id = [req.body.client_id];

    var services = req.body.services;
    var services_arr = [];
    if (services.length > 0) {
        services_arr = services.map(s => s._id);
    }
    query['_id'] = { $in: services_arr };

    try {
        var client_data = await CustomerService.getCustomerById(client_id);
        var patch_booking = [];
        if (services_arr.length > 0) {

            var patch_query = {
                location_id: req.body.location_id,
                client_id: { $elemMatch: { $in: client_id } },
                date: { $lte: date },
                service_id: { $elemMatch: { $in: services_arr } },
                patch_test_booking: 1,
                booking_status: { $nin: ['cancel', 'no_shows'] }
            };

            if (req.body.app_id && req.body.app_id != '') {
                patch_query['_id'] = { $ne: ObjectId(req.body.app_id) };
            }
            patch_booking = await AppointmentService.getNotShowAppointment(patch_query, 0, 1);

            if (patch_booking.length > 0) {
                var service_query = {};
                service_query['_id'] = { $in: patch_booking[0].service_id };
                var service = await ServiceService.getServiceSpecific(service_query);
                var ser = '';
                for (var s = 0; s < service.length; s++) {
                    if (services_arr.indexOf(service[s]._id.toString()) !== -1) {
                        ser += service[s].name + ", ";
                    }
                }

                ser = ser.replace(/,\s*$/, "");

                patch_booking[0].service_id = ser;
                patch_booking[0].client_name = client_data.name;
            }
        }

        var limit_exceed = false;
        var limit_exceed_msg = 'This slot is unavailable for ';
        var appointments = [];
        var ser_arr = [];
        if (start_time && end_time) {

            ser_arr = await ServiceService.getServicesbyLocation(query, page, limit);

            var app_query = {
                location_id: location_id, date: date
            };

            app_query['booking_status'] = { $nin: ['cancel', 'no_shows', 'complete'] };

            if (req.body.app_id && req.body.app_id != '') {
                app_query['_id'] = { $ne: ObjectId(req.body.app_id) };
            }
            var app = [];

            var app_ser = [];

            app_ser = app_ser.concat(services_arr)
            appointments = await AppointmentService.getAppointmentSpecific(app_query, page, limit);
            var time = timeToNum(start_time);

            var stime = time;
            if (end_time) {
                var etime = timeToNum(end_time);
            }

            var start_time_split = start_time.split(':');
            var end_time_split = end_time.split(':');

            var booked_time_slots = timeSlotGenerateInNum2(parseInt(start_time_split[0]), parseInt(end_time_split[0]), parseInt(start_time_split[1]), parseInt(end_time_split[1]));

            for (var i = 0; i < appointments.length; i++) {
                if (appointments[i].start_time && appointments[i].end_time) {

                    var st = timeToNum(appointments[i].start_time);
                    var et = timeToNum(appointments[i].end_time);
                    var isInRangeEndTime = false; //start_time

                    if (end_time && booked_time_slots.length > 0) {
                        for (var bs = 0; bs < booked_time_slots.length; bs++) {

                            if (booked_time_slots[bs] != stime && booked_time_slots[bs] != etime && booked_time_slots.length != 2) {
                                var inStartEndRange = inRange(booked_time_slots[bs], st, et);
                                if (inStartEndRange) {
                                    isInRangeEndTime = inStartEndRange;
                                }
                            } else if (booked_time_slots.length == 2 && booked_time_slots[0] >= st && booked_time_slots[1] <= et) {

                                var inStartEndRange = inRange(booked_time_slots[bs], st, et);
                                if (inStartEndRange) {
                                    isInRangeEndTime = inStartEndRange;
                                }
                            }

                        }
                    }

                    if (isInRangeEndTime) {
                        var array1 = appointments[i].service_id;

                        for (var g = 0; g < appointments[i].group_data.length; g++) {
                            var array2 = appointments[i].group_data[g].service_id;
                            array1 = array1.concat(array2)
                        }
                        const matchArr = array1.filter(element => services_arr.includes(element));
                        if (matchArr.length > 0) {
                            app.push(appointments[i]);
                            app_ser = app_ser.concat(matchArr);
                        }
                    }
                }
            }
            for (var i = 0; i < ser_arr.length; i++) {

                var count = countOccurrences(app_ser, ser_arr[i]._id.toString());
                if (ser_arr[i].service_limit > 0) {
                    if (count > ser_arr[i].service_limit) {
                        limit_exceed = true;
                        limit_exceed_msg += ser_arr[i].name + ', ';
                    }
                }
            }
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, limit_exceed: limit_exceed, limit_exceed_msg: limit_exceed_msg, app_ser: app_ser, app: app, appointments: appointments, data: ser_arr, patch_booking: patch_booking, message: "Successfully Service Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}
const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

const inRange = function (x, min, max) {
    return ((x - min) * (x - max) <= 0);
}

const numToTime = function (num) {
    m = num % 60;
    h = parseInt(num / 60);
    // console.log('m',m)
    // console.log('h',h)
    return (h > 9 ? h : "0" + h) + ":" + (m > 9 ? m : "0" + m);
} //ex: $num=605 605%60 == 5 ,605/60 == 10  return 10:05

const timeToNum = function (time) {
    var matches = time.match(/(\d\d):(\d\d)/);
    //console.log('matches',matches)
    return parseInt(60 * matches[1]) + parseInt(matches[2]);
} //ex: 10:00 = 60*10+05 = 605

const timeSlotGenerateInNum2 = function (today_start_time, today_end_time, start_time, end_time) {

    var td_data = [];
    var quarterHours = ["00", "15", "30", "45"];
    var times = [];
    for (var t = today_start_time; t <= today_end_time; t++) {
        for (var j = 0; j < 4; j++) {

            let time = t + ":" + quarterHours[j];

            if (t > 9) {
                time = time;
            }
            else {
                time = '0' + time;
            }
            var time_num = timeToNum(time);

            if (today_end_time == t && today_start_time == t) {
                if (end_time >= quarterHours[j] && start_time <= quarterHours[j]) {
                    times.push(time_num);
                }

            } else if (today_end_time == t) {
                if (end_time >= quarterHours[j]) {
                    times.push(time_num);
                }
            } else if (today_start_time == t) {
                if (start_time <= quarterHours[j]) {
                    times.push(time_num);
                }

            } else {
                times.push(time_num);
            }

            var obj = { time: time }; // time slot
        }
    }
    return times;

}

exports.getEmployeeService = async function (req, res, next) {
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = { location_id: req.body.location_id };

    if (req.body.status && req.body.status == 1) {
        query['status'] = 1;
    }
    if (req.body.online_status && req.body.online_status == 1) {
        query['online_status'] = 1;
    }

    gender = req.body.gender.toLowerCase();

    category_id = req.body.category_id;

    try {
        var Service = [];
        var timeSlot = "";
        var users = await UserService.getEmployees({ _id: req.body.employee_id, status: 1 }, page, limit);
        category = users[0].services; //get all service types
        var cat_query = {}
        if (req.body.status && req.body.status == 1) {
            cat_query['status'] = 1;
        }
        if (req.body.online_status && req.body.online_status == 1) {
            cat_query['online_status'] = 1;
        }

        cat_query['_id'] = { $in: category };
        if (gender) {
            cat_query['$or'] = [{ gender: { $eq: gender.toLowerCase() } }, { gender: { $eq: 'unisex' } }];
        }

        var Categorys = await CategoryService.getActiveCategories(cat_query);

        category = Categorys.map(function (item) { return item._id; })
        if (category && category_id) {
            var index = category.map(function (e) { return e; }).indexOf(category_id); //check service types 
            if (index != -1) {
                query['category_id'] = category_id;

                var Service = await ServiceService.getServiceSpecific(query);
            }
        } else {
            query['category_id'] = { $in: category };
            var Service = await ServiceService.getServiceSpecific(query);
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, Categorys: Categorys, data: Service, message: "Successfully Service Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getAvailableTime = async function (req, res, next) {
    if (weekday && req.body.location_id) {
        timeSlot = await LocationTimingService.getSpecificLocationTimings(req.body.location_id, weekday); //get location time by day name
    }
    if (timeSlot && timeSlot.start_time && timeSlot.end_time) {
        salon_opening_time = timeSlot.start_time;
        salon_closing_time = timeSlot.end_time;
    } else {
        salon_opening_time = "";
        salon_closing_time = "";
    }

    var opening_hours = [[salon_opening_time, salon_closing_time]];

    var occupied_slotss = [];
    var book_slots = [];


    var appointments = await AppointmentService.getAppointmentSpecific({ employee_id: req.body.employee_id, date: date, booking_status: { $ne: 'cancel' } }, page, limit) //get booking slot

    if (appointments.length > 0) {
        for (var i = 0; i < appointments.length; i++) {
            var starttime = appointments[i].start_time;
            var endtime = appointments[i].end_time;
            occupied_slotss.push([starttime, endtime]);
            book_slots.push(starttime, endtime)
        }
    }

    var blockTimes = await BlockTimeService.getBlockSpecific(
        {
            location_id: req.body.location_id,
            status: 1,
            //$and:[{start_date:{$lte:date}},{end_date:{$gte:date}}],
            $or: [
                //{ $and: [{start_date:{$gte:date}},{end_date:{$lte:date}}] },
                { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
                { $and: [{ start_date: { $lte: date } }, { end: { $eq: 'always' } }] }
            ],
            //employee_id: { $elemMatch: { $eq: employee_id.toString()} }, 
            $and: [
                { $or: [{ employee_id: { $elemMatch: { $eq: req.body.employee_id.toString() } } }, { employee_all: { $eq: 1 } }] },
            ],
        }, page, limit);


    if (blockTimes && blockTimes.length > 0) {
        for (var i = 0; i < blockTimes.length; i++) {
            var emp = blockTimes[i].employee_id;

            occupied_slotss.push([blockTimes[i].start_time, blockTimes[i].end_time]);
            book_slots.push(blockTimes[i].start_time, blockTimes[i].end_time)
        }
    }

    occupied_slotss.sort();
    book_slots.sort();

    for (let i = 0; i < book_slots.length; i++) {
        if (book_slots[i + 1] === book_slots[i]) {
            book_slots.splice((i + 1), 1);
            book_slots.splice(i, 1);
        }
    }
    occupied_slotss = [];
    for (let i = 0; i < book_slots.length; i += 2) {
        occupied_slotss.push([book_slots[i], book_slots[i + 1]]);
    }

    let x = {
        slotInterval: 1, //
        openTime: salon_opening_time,
        closeTime: salon_closing_time
    };
    var block_closing_time = false;
    let startTime = moment(x.openTime, "HH:mm");
    let endTime = moment(x.closeTime, "HH:mm");
    let allTimes = [];
    var avail_slots = [];
    var str = '';
    if (occupied_slotss.length > 0) {

        while (startTime < endTime) {
            allTimes.push(startTime.format("HH:mm"));
            //Add interval of x minutes
            startTime.add(x.slotInterval, 'minutes');
        }

        for (var s = 0; s < allTimes.length; s++) {
            for (var i = 0; i < occupied_slotss.length; i++) {
                var ost = occupied_slotss[i];

                if (allTimes[s] == occupied_slotss[i][0]) {
                    if (occupied_slotss[i][0] == allTimes[0]) { //salon_opening_time is booked
                        str += 'Free Time of Staff is ' + occupied_slotss[i][1] + ' to ';
                    } else {

                        if (occupied_slotss[i][1] != salon_closing_time) { //salon_closing_time

                            st = (occupied_slotss[i][0]).toString();

                            if (salon_closing_time > occupied_slotss[i][1]) {
                                str += occupied_slotss[i][0] + ',' + occupied_slotss[i][1] + ' to ';
                            } else {
                                block_closing_time = true;
                                str += occupied_slotss[i][0] + '.'
                            }

                        } else {
                            block_closing_time = true;
                            str += occupied_slotss[i][0] + '.';

                        }

                    }

                } else {
                    if (s == 0 && i == 0) {
                        if (occupied_slotss[i][1] > salon_opening_time && occupied_slotss[i][0] < salon_opening_time) { //if salon_opening_time is booked and between occupied slots 
                            str += 'Free Time of Staff is ' + occupied_slotss[i][1] + ' to ';
                        } else { //salon_opening_time
                            str += 'Free Time of Staff is ' + allTimes[0] + ' to ';
                        }

                    }

                }
            }
        }
        if (!block_closing_time) {
            str += salon_closing_time + '.';
        }
    } else {
        if (salon_opening_time && salon_closing_time) {
            str += 'Free Time of Staff is ' + salon_opening_time + ' to ';
            str += salon_closing_time + '.';
        } else {
            str = '';
        }

    }
    return str;
}

exports.getEmployeeAllService = async function (req, res, next) {
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.body.company_id && req.body.company_id != 'undefined') {
        query['company_id'] = req.body.company_id;
    }
    if (req.body.location_id && req.body.location_id != 'undefined') {
        query['location_id'] = req.body.location_id;
    }
    gender = req.body.gender.toLowerCase();
    date = req.body.date;

    var dateObj = new Date(date);
    var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
    weekday = weekday.toLowerCase();

    try {
        var Service = [];
        var timeSlot = "";
        var users = await UserService.getEmployees({ _id: req.body.employee_id, status: 1 }, page, limit);
        category = users[0].services; //get all service types

        if (category) {
            if (gender) {
                //query['gender'] = gender;
                query['$or'] = [{ gender: { $eq: gender } }, { gender: { $eq: 'unisex' } }];

            }

            if (req.body.status && req.body.status == 1) {
                query['status'] = 1;
            }
            if (req.body.online_status && req.body.online_status == 1) {
                query['online_status'] = 1;
            }
            query['category_id'] = { $in: category };
            var Service = await ServiceService.getServiceSpecific(query);
        }

        if (weekday && req.body.location_id) {
            timeSlot = await LocationTimingService.getSpecificLocationTimings(req.body.location_id, weekday); //get location time by day name
        }
        if (timeSlot && timeSlot.start_time && timeSlot.end_time) {
            salon_opening_time = timeSlot.start_time;
            salon_closing_time = timeSlot.end_time;
        } else {
            salon_opening_time = "";
            salon_closing_time = "";
        }

        var opening_hours = [[salon_opening_time, salon_closing_time]];

        var occupied_slotss = [];
        var book_slots = [];

        var appointments = await AppointmentService.getAppointmentSpecific({ employee_id: req.body.employee_id, date: date, booking_status: { $ne: 'cancel' } }, page, limit) //get booking slot

        if (appointments.length > 0) {
            for (var i = 0; i < appointments.length; i++) {
                var starttime = appointments[i].start_time;
                var endtime = appointments[i].end_time;
                occupied_slotss.push([starttime, endtime]);
                book_slots.push(starttime, endtime)
            }
        }
        var blockTimes = await BlockTimeService.getBlockSpecific({ location_id: req.body.location_id, status: 1, $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] }, page, limit); //get blocked slot

        if (blockTimes && blockTimes.length > 0) {
            for (var i = 0; i < blockTimes.length; i++) {
                var emp = blockTimes[i].employee_id;
                var index = emp.map(function (e) { return e._id; }).indexOf(req.body.employee_id);
                if (index > -1) {

                    occupied_slotss.push([blockTimes[i].start_time, blockTimes[i].end_time]);
                    book_slots.push(blockTimes[i].start_time, blockTimes[i].end_time)
                } else {
                    //blockTimes.splice(index, 1)
                }
            }
        }

        occupied_slotss.sort();
        book_slots.sort();

        for (let i = 0; i < book_slots.length; i++) {
            if (book_slots[i + 1] === book_slots[i]) {
                book_slots.splice((i + 1), 1);
                book_slots.splice(i, 1);
            }
        }
        occupied_slotss = [];
        for (let i = 0; i < book_slots.length; i += 2) {
            occupied_slotss.push([book_slots[i], book_slots[i + 1]]);
        }

        let x = {
            slotInterval: 1, //
            openTime: salon_opening_time,
            closeTime: salon_closing_time
        };
        var block_closing_time = false;
        let startTime = moment(x.openTime, "HH:mm");
        let endTime = moment(x.closeTime, "HH:mm");
        let allTimes = [];
        var avail_slots = [];
        var str = '';
        if (occupied_slotss.length > 0 && allTimes.length > 0) {

            while (startTime < endTime) {
                allTimes.push(startTime.format("HH:mm"));
                //Add interval of x minutes
                startTime.add(x.slotInterval, 'minutes');
            }

            for (var s = 0; s < allTimes.length; s++) {
                for (var i = 0; i < occupied_slotss.length; i++) {
                    var ost = occupied_slotss[i];
                    if (allTimes[s] == occupied_slotss[i][0]) {
                        if (occupied_slotss[i][0] == allTimes[0]) { //salon_opening_time is booked
                            str += 'Free Time of Staff is ' + occupied_slotss[i][1] + ' to ';
                        } else {

                            if (occupied_slotss[i][1] != salon_closing_time) { //salon_closing_time

                                st = (occupied_slotss[i][0]).toString();

                                if (salon_closing_time > occupied_slotss[i][1]) {
                                    str += occupied_slotss[i][0] + ',' + occupied_slotss[i][1] + ' to ';
                                } else {
                                    block_closing_time = true;
                                    str += occupied_slotss[i][0] + '.'
                                }

                            } else {
                                block_closing_time = true;
                                str += occupied_slotss[i][0] + '.';
                            }

                        }

                    } else {
                        if (s == 0 && i == 0) {
                            if (occupied_slotss[i][1] > salon_opening_time && occupied_slotss[i][0] < salon_opening_time) { //if salon_opening_time is booked and between occupied slots 
                                str += 'Free Time of Staff is ' + occupied_slotss[i][1] + ' to ';
                            } else { //salon_opening_time
                                str += 'Free Time of Staff is ' + allTimes[0] + ' to ';
                            }

                        }

                    }
                }
            }
            if (!block_closing_time) {
                str += salon_closing_time + '.';
            }
        } else {
            if (salon_opening_time && salon_closing_time) {
                str += 'Free Time of Staff is ' + salon_opening_time + ' to ';
                str += salon_closing_time + '.';
            } else {
                str = '';
            }

        }
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Service, time_slot: str, message: "Successfully Service Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

function getAllIndexes(arr, val) {
    var indexes = [], i;
    for (i = 0; i < arr.length; i++)
        if (arr[i].employee_id === val)
            indexes.push(i);
    return indexes;
}

exports.getEmployeeByServices = async function (req, res, next) {
    try {
        var query = { is_employee: 1, status: 1 }

        if (req.body.online_status && req.body.online_status == 1) {
            query['online_status'] = req.body.online_status;
        }

        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id;
        }

        var date = req.body.date;
        var dateObj = new Date(date);
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
        weekday = weekday.toLowerCase();
        var employee_ids = req.body.employees ? req.body.employees : [];
        var employee_id = req.body.employee_id;
        var service_ids = req.body.service_id;
        var allServices = false
        var emp = []
        var cat_arr = []

        var service_query = { _id: { $in: service_ids } };
        var service = await ServiceService.getServiceSpecificWithCategory(service_query);
        if (service && service.length > 0) {
            cat_arr = service.map(s => s.category_id);
        }

        var on_leave_emp = [];
        if (date) {
            var off_day_emp = await EmployeeTimingService.getEmployeeAllTimings({
                location_id: req.body.location_id,
                day: weekday,
                $or: [
                    { $and: [{ repeat: { $eq: 'weekly' } }, { end_repeat: { $eq: 'ongoing' } }, { date: { $lte: date } }] },
                    { $and: [{ repeat: { $eq: '' } }, { date: { $eq: date } }] },
                    { $and: [{ end_repeat: { $eq: 'date' } }, { date: { $lte: date } }, { repeat_specific_date: { $gte: date } }] }
                ],
            });


            var off_day_emp_filter = [];
            var off_day_emp_arr = [];
            var result_emp = off_day_emp.reduce((unique, o) => {
                if (!unique.some(obj => obj.employee_id === o.employee_id)) {
                    unique.push(o);
                }
                return unique;
            }, []);

            off_day_emp = result_emp;
            if (off_day_emp && off_day_emp.length > 0) {
                off_day_emp_arr = off_day_emp.map(s => s.employee_id);
            }

            for (var oemp = 0; oemp < off_day_emp_arr.length; oemp++) {
                var em_id = off_day_emp[oemp].employee_id;
                var pri_ind = off_day_emp.findIndex(x => x.employee_id == em_id);
                if (pri_ind > -1) {
                    if (off_day_emp[pri_ind].days_off == 1) {
                        off_day_emp_filter.push(off_day_emp[pri_ind])
                    }
                }
            }

            if (off_day_emp_filter && off_day_emp_filter.length > 0) {
                on_leave_emp = off_day_emp_filter.map(s => s.employee_id);
            }

            if (on_leave_emp && on_leave_emp.length > 0) {
                employee_ids = employee_ids.concat(on_leave_emp);
            }
        }

        if (employee_id && employee_id != '') {
            query['$and'] = [{ _id: employee_id }, { _id: { $nin: employee_ids } }];
        } else {
            query['_id'] = { $nin: employee_ids }
        }

        var employees = await UserService.getEmployees(query);
        var arr1 = cat_arr.filter((x, i) => i === cat_arr.indexOf(x)); // unique_cat_arr
        for (var e = 0; e < employees.length; e++) {
            var category = employees[e].services;
            var arr2 = category;
            var match = arrayContainsAll(arr1, arr2);
            if (match) {
                emp.push(employees[e]);
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            off_day_emp: off_day_emp,
            on_leave_emp: on_leave_emp,
            employees: employees,
            data: emp,
            message: "Employees received successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createService = async function (req, res, next) {

    try {
        var Category = await CategoryService.getCategory(req.body.category_id)
        req.body.master_category_id = Category.master_category_id

        var Test = await TestService.getTest(req.body.test_id)
        req.body.master_test_id = Test.master_test_id
        if (!req.body.master_service_id) {
            var getMasterServiceId = await ServiceService.getMasterServiceId(req.body)
            req.body.master_service_id = getMasterServiceId;
        }
        // Calling the Service function with the new object from the Request Body
        var createdService = await ServiceService.createService(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdService, message: "Successfully Created Service" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Service Creation was Unsuccesfull" })
    }

}

exports.updateService = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedService = await ServiceService.updateService(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedService, message: "Successfully Updated Service" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeService = async function (req, res, next) {

    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var deleted = await ServiceService.deleteService(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMultipleService = async function (req, res, next) {

    var ids = req.body.ids;
    if (ids.length == 0) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var query = {
            _id: { $in: req.body.ids }
        };

        var deleted = await ServiceService.updateManyServiceStatus(query)

        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.searchService = async function (req, res, next) {
    var location_id = req.query.location_id;
    var service = req.query.service;
    if (!location_id || !service) {
        return res.status(200).json({ status: 200, flag: false, message: "Location Id and Service must be present" })
    }
    var query = { status: 1 };
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.service && req.query.service != 'undefined') {

        service = service.replace(/[-]+/g, " ").toLowerCase();
        service = service.replace(/[(]+/g, "\\(");
        service = service.replace(/[)]+/g, "\\)");
        service = service.toString();
        query['name'] = { '$regex': service, '$options': 'i' };
    }
    try {
        var serviceData = { service: null };
        var service = await ServiceService.getServiceSpecific(query);
        if (service && service.length > 0) {
            serviceData.service = service;
        }

        res.status(200).send({ status: 200, flag: true, data: serviceData, message: "Successfully services received... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getServicesDropdown = async function (req, res, next) {
    try {
        var orderName = req.body?.order_name ? req.body.order_name : 'menu_order';
        var order = req.body?.order ? req.body.order : '1';
        var search = req.body?.searchText ? req.body.searchText : "";

        var query = {};
        var existQuery = {};
        if (req.body?.status == "active") {
            query.status = 1;
        }

        if (req.body.online_status && req.body.online_status == 1) {
            query.online_status = 1;
        }

        if (req.body?.company_id) {
            query.company_id = req.body.company_id;
        }

        if (req.body?.location_id) {
            query.location_id = req.body.location_id;
        }

        if (req.body?.category_id) {
            query.category_id = req.body.category_id;
        }

        // if (req.body?.gender) {
        //     query['$or'] = [
        //         { gender: { $eq: req.body.gender } },
        //         { gender: { $eq: 'unisex' } }
        //     ]
        // }

        if (req.body?.gender) {
            query.gender = { $in: [req.body.gender.toLowerCase(), 'unisex'] };
        }

        if (req.body?.id) {
            query._id = req.body.id;
        }

        if (req.body?.ids && req.body.ids?.length) {
            var ids = req.body.ids
            query._id = { $nin: ids }
            existQuery._id = { $in: ids }
        }

        if (search) {
            if (!isNaN(search)) {
                query.price = { $eq: Number(search), $exists: true };
            } else {
                search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&');
                query['$or'] = [
                    { name: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }
        }
        // console.log('existQuery', existQuery)
        var existServices = []
        if (!isObjEmpty(existQuery)) {
            existQuery['status'] = 1;
            existServices = await ServiceService.getServicesDropdown(existQuery, orderName, order) || [];
        }

        // console.log('getServicesDropdown query', query)

        var services = await ServiceService.getServicesDropdown(query, orderName, order) || [];
        services = existServices.concat(services) || [];

        return res.status(200).send({ status: 200, flag: true, data: services, message: "Services dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

// This is only for machine dropdown
exports.getMachineServicesDropdown = async function (req, res, next) {
    try {
        var orderName = req.body?.order_name ? req.body.order_name : 'menu_order'
        var order = req.body?.order ? req.body.order : '1'
        var search = req.body?.searchText ? req.body.searchText : ""

        var query = {}
        var existQuery = {}
        if (req.body?.status == "active") {
            query['status'] = 1
        }

        if (req.body.online_status && req.body.online_status == 1) {
            query['online_status'] = 1
        }

        if (req.body?.company_id) {
            query['company_id'] = req.body.company_id
        }

        if (req.body?.location_id) {
            query['location_id'] = req.body.location_id
        }

        if (req.body?.category_id) {
            query['category_id'] = req.body.category_id
        }

        if (req.body?.gender) {
            query['gender'] = { $in: [req.body.gender.toLowerCase(), 'unisex'] }
        }

        if (req.body?.id) {
            query['_id'] = req.body.id
        }

        if (req.body?.ids && req.body.ids?.length) {
            var ids = req.body.ids
            query['_id'] = { $nin: ids }
            existQuery['_id'] = { $in: ids }
        }

        if (search) {
            if (!isNaN(search)) {
                query['price'] = { $eq: Number(search), $exists: true }
            } else {
                search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
                query['$or'] = [
                    { name: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }
        }

        var existServices = [];
        var services = [];
        if (!isObjEmpty(existQuery)) {
            existQuery['status'] = 1;
            existServices = await ServiceService.getServicesDropdown(existQuery, orderName, order) || []
            services = existServices.concat(services) || []
        } else {
            services = await ServiceService.getServicesDropdown(query, orderName, order) || []
            services = existServices.concat(services) || []
        }


        return res.status(200).send({ status: 200, flag: true, data: services, message: "Services dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

exports.getCartServices = async function (req, res, next) {
    if (!req.query?.ids) {
        return res.status(200).json({
            status: 200,
            flag: false,
            data: [],
            message: "Cart service ids must be present!"
        })
    }

    try {
        var query = {};
        if (req.query?.status == "active") {
            query.status = 1;
        }

        if (req.query.online_status && req.query.online_status == 1) {
            query.online_status = 1;
        }

        if (req.query?.company_id) {
            query.company_id = req.query.company_id;
        }

        if (req.query?.location_id) {
            query.location_id = req.query.location_id;
        }

        if (req.query?.gender) {
            query.gender = { $in: [req.query.gender.toLowerCase(), 'unisex'] };
        }

        if (req.query?.ids && isValidJson(req.query.ids)) {
            var ids = JSON.parse(req.query.ids);
            query._id = { $in: ids };
        }

        var services = await ServiceService.getServicesDropdown(query) || [];

        return res.status(200).send({ status: 200, flag: true, data: services, message: "Cart services received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

exports.checkCustomerServiceData = async function (req, res, next) {
    if (!req.body.client_id || !req.body.services) {
        return res.status(200).json({ status: 200, flag: false, message: "Client Id and Service must be present" })
    }

    try {
        var patch_booking = await getPatchTestBooking(req.body)

        var ser_limit = await checkServiceLimit(req.body)
        //var appointments = ser_limit?.appointments ?? [];
        var limit_exceed = ser_limit?.limit_exceed ?? false;
        var limit_exceed_msg = ser_limit?.limit_exceed_msg ?? '';


        var ser_emp = [];

        if (req.body.service_id && req.body.service_id.length > 0) {
            for (var i = 0; i < req.body.service_id.length; i++) {
                var params = { location_id: req.body.location_id, service_id: req.body.service_id[i], employees: req.body.employees, date: req.body.date };
                var employees = await getEmployeeListByServices(params)
                ser_emp.push({ service: req.body.service_id[i], employees: employees })
            }
        }

        res.status(200).send({ status: 200, flag: true, patch_booking: patch_booking, limit_exceed: limit_exceed, limit_exceed_msg: limit_exceed_msg, data: ser_emp, message: "Successfully Received... " });
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getOnlineServices = async function (req, res, next) {
    try {
        var location_id = req.query.location_id;
        if (!location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present" })
        }

        var query = { status: 1 }

        if (req.query.online_status && req.body.online_status == 1) {
            query['online_status'] = 1;
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
        }

        if (req.query.category_id && req.query.category_id != 'undefined') {
            query['category_id'] = req.query.category_id;
        }
        var services = await ServiceService.getServiceSpecific(query)

        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: services, message: "Successfully" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// Wordpress api
exports.getCategoryServiceData = async function (req, res, next) {
    try {
        var type = req.query?.type || "";
        var companyId = req.query?.company_id || "";
        var locationId = req.query?.location_id || "";
        var categoryId = req.query?.category_id || "";
        var serviceId = req.query?.service_id || "";
        var serviceIds = req.query?.service_ids || "";
        var onlineStatus = req.query?.online_status || 0;

        var query = { status: 1 };
        if (onlineStatus) { query['online_status'] = 1; }

        if (companyId) { query['company_id'] = companyId; }
        if (locationId) { query['location_id'] = locationId; }

        if (serviceIds && serviceIds.split(",")) {
            serviceIds = serviceIds.split(",")
        }

        if (type) {
            if (type == "category") {
                if (categoryId) {
                    // query['name'] = { $regex: '^' + category_name + '$', $options: 'i' };
                    query['_id'] = categoryId;
                    var category = await CategoryService.getCategoryDetail(query);
                    return res.status(200).send({ status: 200, flag: true, category: category, message: "Category detail received successfully..." })
                } else {
                    return res.status(200).send({ status: 200, flag: false, category: null, message: "Category name not defined" })
                }
            } else if (type == "service") {
                if (categoryId || serviceId) {
                    if (categoryId) {
                        query['category_id'] = categoryId;
                        query['gender'] = "male";
                        var maleData = await ServiceService.getServicesDropdown(query) || [];
                        query['gender'] = "female";
                        var femaleData = await ServiceService.getServicesDropdown(query) || [];
                        query['gender'] = "unisex";
                        var unisexData = await ServiceService.getServicesDropdown(query) || [];

                        var data = { male: maleData, female: femaleData, unisex: unisexData };
                        return res.status(200).send({ status: 200, flag: true, data: data, message: "Service detail received successfully..." })
                    } else if (serviceId) {
                        query['_id'] = serviceId;
                        var service = await ServiceService.getServiceDetail(query);
                        return res.status(200).send({ status: 200, flag: true, service: service, message: "Service detail received successfully..." })
                    }
                } else if (serviceIds && serviceIds.length) {
                    var services = [];

                    for (let i = 0; i < serviceIds.length; i++) {
                        if (serviceIds[i]) {
                            query['_id'] = serviceIds[i];
                            var service = await ServiceService.getServiceDetail(query);
                            if (service && service?._id) {
                                services.push(service);
                            }
                        }
                    }

                    return res.status(200).send({ status: 200, flag: true, services: services, message: "Service detail received successfully..." })
                } else {
                    return res.status(200).send({ status: 200, flag: false, data: null, message: "Service id or Category id not defined" })
                }
            }
        } else {
            return res.status(200).send({ status: 200, flag: false, data: null, message: "Api type not defined" })
        }

        return res.status(200).send({ status: 200, flag: true, data: [], message: "Services received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

exports.importServiceDataFromExcel = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var data = req.body.data;
    var location_id = req.body.location_id;
    var category_id = req.body.category_id;
    var ignoreData = [];
    try {

        if (!location_id) {
            return res.status(200).json({
                status: 200, flag: false, data: null, message: 'Location Id must present!'
            })
        }

        if (!category_id) {
            return res.status(200).json({
                status: 200, flag: false, data: null, message: 'Category Id must present!'
            })
        }

        var genderArr = ['male', 'female', 'unisex'];
        if (data && data.length > 0 && category_id) {
            for (var i = 0; i < data.length; i++) {
                var sQuery = { location_id: location_id, category_id: category_id }
                if (data[i]._id && data[i].name) {
                    sQuery['$or'] = [{ _id: ObjectId(data[i]._id) }, { name: data[i].name }];
                } else if (data[i].name) {
                    sQuery['name'] = data[i].name
                } else if (data[i]._id) {
                    sQuery['_id'] = ObjectId(data[i]._id)
                }
                if ((data[i].name).trim() && data[i].gender && genderArr.includes(data[i].gender.toLowerCase())) {
                    var services = await ServiceService.checkServiceExist(sQuery) || null;

                    if (!services) {

                        var mservice = await MasterService.getMasterServicesOne({ name: data[i].name }) || [];
                        if (mservice?.length == 0) {
                            if (data[i]?.category_name) {
                                var mcat = await MasterCategoryService.getMasterCategoriesOne({ name: data[i]?.category_name }) || [];
                                if (mcat?.length == 0) {
                                    var catData = {
                                        name: data[i]?.category_name,
                                        gender: data[i].gender,
                                        status: 1
                                    }
                                    var createdMasterCat = await MasterCategoryService.createMasterCategory(catData)

                                    data[i].master_category_id = createdMasterCat ? createdMasterCat._id : '';
                                } else {
                                    data[i].master_category_id = mcat ? mcat[0]?._id : null;
                                }
                            }

                            data[i].status = 1;
                            var createdMasterSer = await MasterService.createMasterService(data[i])

                            data[i].master_test_id = createdMasterSer ? createdMasterSer.master_test_id : null;
                            data[i].master_category_id = createdMasterSer ? createdMasterSer.master_category_id : null;

                            data[i].master_service_id = createdMasterSer ? createdMasterSer._id : null;
                        } else {
                            data[i].master_test_id = null;
                            data[i].master_category_id = null;
                            data[i].master_service_id = mservice[0]._id;
                        }

                        data[i].location_id = location_id;
                        data[i].category_id = category_id;
                        data[i].status = 1;
                        var createdData = await ServiceService.createService(data[i])
                    } else if (services && services._id) {
                        data[i]._id = services._id;
                        data[i].status = 1;
                        var updateData = await ServiceService.updateService(data[i])

                    }
                } else {
                    ignoreData.push(data[i])

                }
            }
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: ignoreData, message: "Import Services Successfully" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.exportServiceDataToExcel = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var location_id = req.body.location_id;
    var category_id = req.body.category_id;
    var service_ids = req.body.service_ids;
    var searchText = req.body.searchText;
    try {
        if (!location_id) {
            return res.status(200).json({
                status: 200, flag: false, data: null, message: 'Localtion Id required'
            })
        }
        var data = [];
        var catQuery = { status: 1, location_id: location_id };
        if (category_id) {
            catQuery['_id'] = ObjectId(category_id)
        }
        var categories = await CategoryService.getExportCategories(catQuery) || [];
        if (categories && categories.length > 0) {
            for (var i = 0; i < categories.length; i++) {
                var serQuery = { status: 1, location_id: location_id, category_id: categories[i]._id };
                if (service_ids && service_ids.length > 0) {
                    serQuery['_id'] = { $in: service_ids }
                }
                if (searchText) {

                    if (!isNaN(searchText)) {
                        serQuery['price'] = { $eq: Number(searchText), $exists: true };
                    } else {
                        searchText = searchText.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
                        serQuery['$or'] = [
                            { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                            { gender: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                            { desc: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                        ]
                    }
                }
                var services = await ServiceService.getExportServices(serQuery) || [];
                services.forEach(object => {
                    object.category_name = categories[i].name;
                });
                data.push(...services);
            }

        }
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: data, message: "Successfully Exported Services" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}