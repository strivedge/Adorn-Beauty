var moment = require('moment')
var dateFormat = require("dateformat")
var ObjectId = require('mongodb').ObjectID

var AppointmentService = require('../services/appointment.service')
var BlockTimeService = require('../services/blockTime.service')
var EmployeeTimingService = require('../services/employeeTiming.service')
var LocationService = require('../services/location.service')
var LocationTimingService = require('../services/locationTiming.service')
var MachineService = require('../services/machine.service')
var PaidTimingService = require('../services/paidTiming.service')
var ServiceService = require('../services/service.service')
var UserService = require('../services/user.service')
var CustomerService = require('../services/customer.service')

const { getTodayTiming, getAvailableEmployee, checkAppListRefData, setAppListTableData, updateAppListTableData, generateTableTimeSlotNew, setAppointmentsListRefData, setDashboardRefData, getEmployeeListByServices } = require('../common')

const { inRange, timeToNum, isValidJson, getCustomParameterData } = require('../helper');

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getBlockTimes = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    const todayDate = moment().format('YYYY-MM-DD');
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (startOfMonth && startOfMonth != 'undefined') {
        //query['start_date'] = {$gte: startOfMonth};
        query['end_date'] = { $gte: todayDate };
    }
    if (req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [{ desc: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { start_time: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { end_time: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }];
    }
    try {
        var blockTimes = await BlockTimeService.getBlockTimes(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText)
        var blockTime = blockTimes[0].data;
        var pagination = blockTimes[0].pagination;
        for (var i = 0; i < blockTime.length; i++) {
            var employee_id = blockTime[i].employee_id;
            var q = { _id: { $in: employee_id } };
            var employee = await UserService.getEmployeeSpecific(q, 1, 100); // for replace service name
            blockTime[i].employee_id = employee; //replace service name
        }
        blockTimes[0].data = blockTime;
        blockTimes[0].pagination = pagination;
        // Return the BlockTimes list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: blockTimes, message: "Successfully BlockTimes Recieved" });
    } catch (e) {
        // console.log("Error ",e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.checkSlotIsAvailable = async function (req, res, next) {
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var location_id = req.body.location_id;
    var start_time = req.body.start_time ? req.body.start_time : "00:00";
    var end_time = req.body.end_time ? req.body.end_time : "00:00";
    var date = req.body.date;
    var dateObj = new Date(date);
    var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
    weekday = weekday.toLowerCase();

    st = timeToNum(start_time);
    et = timeToNum(end_time);
    var slot_flag = false;


    try {

        var blockTimes = await BlockTimeService.getBlockSpecific(
            {
                location_id: req.body.location_id,
                status: 1,
                //employee_id: { $elemMatch: { $eq: '609534d3ef9ae2327c695441' } },
                //$and:[{start_date:{$lte:date}},{end_date:{$gte:date}}],
                $or: [
                    { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
                    { $and: [{ start_date: { $lte: date } }, { end: { $eq: 'always' } }] }
                ]
            }, page, limit);

        for (var i = 0; i < blockTimes.length; i++) {
            var week_days = blockTimes[i].every_week;
            var alternate_day = blockTimes[i].alternate_day;
            if (blockTimes[i].repeat == 'every_week' && week_days) {
                var index = week_days.map(function (e) { return e; }).indexOf(weekday); //check service types 
                if (index != -1) {

                } else {
                    blockTimes.splice(i, 1);
                }
            }
            if (blockTimes[i].repeat == 'every_alternate_week' && alternate_day) {
                var index = alternate_day.map(function (e) { return e; }).indexOf(weekday); //check service types 
                if (index != -1) {

                } else {
                    blockTimes.splice(i, 1);
                }
            }
        }

        if (blockTimes && blockTimes.length > 0) {
            for (var i = 0; i < blockTimes.length; i++) {
                var emp = blockTimes[i].employee_id;
                var index = emp.map(function (e) { return e; }).indexOf(req.body.employee_id);
                if (index > -1 || blockTimes[i].employee_all == 1) {

                    bst = timeToNum(blockTimes[i].start_time);
                    bet = timeToNum(blockTimes[i].end_time);

                    rst = inRange(st, bst, bet);
                    ret = inRange(et, bst, bet);

                    if (rst || ret) {
                        slot_flag = true; //not available
                    }
                }
            }
        }

        var appointments = await AppointmentService.getAppointmentSpecific({
            employee_id: employee_id.toString(), date: date, booking_status: { $ne: 'cancel' }
        }, page, limit);
        if (appointments.length > 0) {
            for (var a = 0; a < appointments.length; a++) {
                var ast = timeToNum(appointments[a].start_time);
                var aet = timeToNum(appointments[a].end_time);
                var startTimeInRange = inRange(st, ast, aet);
                var endTimeInRange = inRange(et, ast, aet);
                if (startTimeInRange || endTimeInRange) {
                    slot_flag = true; //time slot is available
                }
            }
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, appointments: appointments, data: blockTimes, slot_flag: slot_flag, message: "Successfully BlockTime Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getEmployeeAvailableSlot = async function (req, res, next) {
    var duration = req.body.duration;
    var online_status = req.body.online_status;
    var employee_id = req.body.employee_id;
    var services = req.body.services;

    var app_id = req.body.application_id;
    var date = req.body.date;
    var dateObj = new Date(date);
    var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
    weekday = weekday.toLowerCase();

    try {
        var slots = [];
        var data = { location_id: req.body.location_id, date: req.body.date, services: services, app_id: app_id, weekday: weekday, start_time: req.body.start_time, online_status: online_status, duration: duration, employee_id: employee_id, emp_slot: 1, admin_booking: req.body.admin_booking }
        var result = await getEmployeeByServices(data);
        if (result && result.emp.length > 0 && result.emp[0].service_data.length > 0 && result.emp[0].service_data[0].employee_data.length > 0) {
            slots = result.emp[0].service_data[0].employee_data[0].employee_timing;
        }

        var end_slot = [];
        for (var i = 0; i < slots.length; i++) {
            var cur_time = slots[i];//timeToNum(slots[i]);
            var total_min = parseInt(duration) + parseInt(cur_time);

            total_min = numToTime(total_min);
            //check end time slot is free
            var ind = slots.map(function (e) { return e; }).indexOf(total_min);
            if (ind == -1) {
                end_slot.push(slots[i]);
            }
        }
        for (var es = 0; es < end_slot.length; es++) {
            var index = slots.map(function (e) { return e; }).indexOf(end_slot[es]);
            if (index == -1) {
                slots.splice(index, 1)
            } else {
                slots[index] = numToTime(slots[index]);
            }

        }

        return res.status(200).json({ status: 200, flag: true, data: slots, message: "Successfully Available Slot Recieved" });
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

const getAvailableSlot = async function (data) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = 1
    var limit = 1000;
    var query = { status: 1 };
    var empQuery = { status: 1 };

    if (data.location_id && data.location_id != 'undefined') {
        query['location_id'] = data.location_id;
        empQuery['location_id'] = data.location_id;
    }
    var duration = data.duration;
    var category_id = data.category_id;
    var online_status = data.online_status;
    var employee_id = [];
    var services = data.services;
    var app_id = data.application_id;
    var date = data.date;
    var dateObj = new Date(date);
    var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
    weekday = weekday.toLowerCase();
    var start_time = timeToNum(data.start_time);


    var data = { location_id: data.location_id, date: data.date, services: services, app_id: app_id, weekday: weekday, start_time: data.start_time, online_status: online_status, duration: duration, employee_id: data.employee_id }
    result = await getEmployeeByServices(data);

    var time_slots = [];
    var time_slots2 = [];
    var is_slot_avail = false;
    var time_slots = []; //available common slot
    var availEmp = [];

    empQuery['is_employee'] = 1;
    if (weekday && data.location_id) {

        var result_final_arr = [];

        if (result.emp.length > 0) {
            for (var i = 0; i < result.emp.length; i++) {
                var final_arr = [];

                if (result.emp[i].service_data.length > 0) {
                    var emp_ids_arrays = result.emp[i].service_data.map(s => s.employee_ids); //merge array of employee ids
                    var emp_ids_arr = [].concat.apply([], emp_ids_arrays); //merge all employee ids

                    var emp_ids_arr = emp_ids_arr.byCount(); //sorting by count
                    if (start_time) {
                        var res_emp_ids = await employeeByAvailability(result.emp[i].service_data, data.start_time); //sorting by count
                        if (res_emp_ids && res_emp_ids.emp_ids.length > 0) {
                            emp_ids_arr = res_emp_ids.emp_ids
                        }
                    }

                    result.emp[i].most_common_emp = emp_ids_arr;

                    if (emp_ids_arr.length == 0) {
                        result.emp[i].union_timing = [];
                    }

                    for (var e = 0; e < emp_ids_arr.length; e++) {

                        var item = result.emp[i].service_data.filter(res => res.employee_ids.indexOf(emp_ids_arr[e]) !== -1); //sort by most common employee 

                        item = Array.from(new Set(item)); //remove duplicates
                        final_arr.push(item)
                    }
                }

                final_arr = [].concat.apply([], final_arr);
                result_arr = final_arr.reduce((unique, o) => {
                    if (!unique.some(obj => obj.service_id === o.service_id && obj.employee_ids === o.employee_ids)) {
                        unique.push(o);
                    }
                    return unique;
                }, []); //remove duplicates

                result_final_arr.push({ service_data: result_arr, common_emp: result.emp[i].common_emp, all_ser_duration: result.emp[i].all_ser_duration, most_common_emp: result.emp[i].most_common_emp, union_timing: result.emp[i].union_timing, all_service: result.emp[i].all_service });
            }
        }
    }

    var resultArray = { data: time_slots, is_slot_avail: is_slot_avail, result_final_arr: result_final_arr }
    return resultArray;

}

function GFG_Fun(all_arr) {
    arr4 = all_arr.slice();

    var common = arr4.shift().filter(function (v) {
        return arr4.every(function (a) {
            return a.indexOf(v) !== -1;
        });
    });
    return common;

}

Array.prototype.byCount = function () {
    var itm, a = [], L = this.length, o = {};
    for (var i = 0; i < L; i++) {
        itm = this[i];
        if (!itm) continue;
        if (o[itm] == undefined) o[itm] = 1;
        else ++o[itm];
    }
    for (var p in o) a[a.length] = p;
    return a.sort(function (a, b) {
        return o[b] - o[a];
    });
}

function intersect_arrays(a, b) {
    var sorted_a = a.concat().sort();
    var sorted_b = b.concat().sort();
    var common = [];
    var a_i = 0;
    var b_i = 0;

    while (a_i < a.length
        && b_i < b.length) {
        if (sorted_a[a_i] === sorted_b[b_i]) {
            common.push(sorted_a[a_i]);
            a_i++;
            b_i++;
        }
        else if (sorted_a[a_i] < sorted_b[b_i]) {
            a_i++;
        }
        else {
            b_i++;
        }
    }
    return common;
}

const employeeByAvailability = async function (service_data, start_time) {
    try {

        var emp_data_arrays = service_data.map(s => s.employee_data);
        var service_id_arr = service_data.map(s => s.service_id);

        service_id_arr = [].concat.apply([], service_id_arr); //merge all array of object

        var service_query = { _id: { $in: service_id_arr } };
        var service = await ServiceService.getServiceSpecific(service_query);
        var cat_arr = service.map(s => s.category_id);


        var dura_arrays = service_data.map(s => s.duration);

        var tot_dura = dura_arrays.reduce(function (a, b) { return a + b; }, 0);

        emp_data_arrays = [].concat.apply([], emp_data_arrays); //merge all array of object

        emp_data_arrays = emp_data_arrays.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.employee_id === value.employee_id))
        ); // remove duplicated

        var emp_ids_arrays = service_data.map(s => s.employee_ids); //merge array of employee ids
        var emp_ids_arr = [].concat.apply([], emp_ids_arrays); //merge all employee ids
        var emp_ids_arr = emp_ids_arr.byCount(); //sorting by count

        var emp_ids = [];

        if (emp_ids_arr.length > 0 && tot_dura > 0 && start_time) {
            for (var i = 0; i < emp_ids_arr.length; i++) {

                var et_ind = emp_data_arrays.findIndex(x => x.employee_id.toString() == emp_ids_arr[i]);
                if (et_ind != -1) {

                    var dur_slots = timeSlotGenerateByDuration(timeToNum(start_time), tot_dura);

                    var slot_avail = arrayContainsAll(dur_slots, emp_data_arrays[et_ind].employee_timing, 1);
                    var user = await UserService.getUser(emp_data_arrays[et_ind].employee_id)
                    var priority = user.employee_priority ? user.employee_priority : 1;

                    if (slot_avail) {
                        var ser_avail = arrayContainsAll(cat_arr, user.services);
                        if (ser_avail) {
                            emp_ids.push({ priority: priority + 4, employee_id: emp_data_arrays[et_ind].employee_id })
                        } else {
                            emp_ids.push({ priority: priority + 5, employee_id: emp_data_arrays[et_ind].employee_id })
                        }
                    } else {
                        emp_ids.push({ priority: priority + 6, employee_id: emp_data_arrays[et_ind].employee_id })
                    }
                }
            }

        }
        emp_ids = emp_ids.sort((a, b) => a.priority - b.priority); // b - a for reverse sort;
        var emp_ids_arr = emp_ids.map(s => s.employee_id);

        return { emp_ids: emp_ids_arr };

    } catch (e) {
        console.log(e)
        return { emp: [], union_timing: [] }
    }

}

const findRepeatingNumbers = async function (numbers, count) {
    numbers.sort((a, b) => a - b);

    const found = [];
    let counter = 1;

    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i - 1] == numbers[i]) {
            counter += 1;
        } else {
            if (counter === count || counter > count) {
                found.push(numbers[i - 1]);
            }
            counter = 1;
        }
    }

    if (counter == count || counter > count) {
        found.push(numbers[numbers.length - 1]);
    }

    return found;
}

const calculatePaidHourSlots = async function (data = {}) {
    try {
        var locationId = data?.location_id || "";
        var date = data?.date || "";
        var paidSlots = [];
        var query = {
            location_id: locationId,
            date: date
        };

        let paidTiming = await PaidTimingService.findOne(query);
        if (paidTiming?.slots && paidTiming.slots?.length) {
            for (var i = 0; i < paidTiming.slots.length; i++) {
                var startTimeSplit = paidTiming.slots[i].start_time.split(':');
                var endTimeSplit = paidTiming.slots[i].end_time.split(':');

                var paidTimeSlots = timeSlotGenerateInNum2(parseInt(startTimeSplit[0]), parseInt(endTimeSplit[0]), parseInt(startTimeSplit[1]), parseInt(endTimeSplit[1]) - 15);
                paidSlots = paidSlots.concat(paidTimeSlots);
            }
        }

        paidSlots = Array.from(new Set(paidSlots)); // remove duplicates
        // Return the Users list with the appropriate HTTP password Code and Message.
        return paidSlots;
    } catch (e) {
        // console.log(e)
        return [];
    }
}

const checkServiceLimitBookedSlot = async function (data) {
    try {
        var query = {}
        var location_id = data.location_id
        var date = data.date;
        var duration = parseInt(data.duration);
        var group_data = data.group_data ? data.group_data : 0;
        data.all_ser = data.all_ser ? data.all_ser : [];

        const services_arr = Array.prototype.concat(...data.services);
        var appointments = [];
        var ser_arr = [];
        query['services'] = { $elemMatch: { $in: services_arr } };
        var machine_arr = await MachineService.getActiveMachines(query);
        var app_query = { location_id: location_id, date: date };

        app_query['booking_status'] = { $nin: ['cancel', 'no_shows', 'complete'] };

        if (data.app_id && data.app_id != '') {
            app_query['_id'] = { $ne: ObjectId(data.app_id) };
        }

        var app = []
        var allExceedSlot = []
        for (var m = 0; m < machine_arr.length; m++) {
            app_query['service_id'] = { $elemMatch: { $in: machine_arr[m].services } };
            appointments = await AppointmentService.getAppointmentSpecific(app_query);

            var allBookedSlot = [];

            for (var i = 0; i < appointments.length; i++) {
                if (appointments[i].start_time && appointments[i].end_time) {

                    var appSlot = { id: appointments[i]._id, start_time: appointments[i].start_time, end_time: appointments[i].end_time };

                    var start_time_split = appointments[i].start_time.split(':');
                    var end_time_split = appointments[i].end_time.split(':');

                    var booked_time_slots = await timeSlotGenerateInNum2(parseInt(start_time_split[0]), parseInt(end_time_split[0]), parseInt(start_time_split[1]), parseInt(end_time_split[1]));
                    allBookedSlot = allBookedSlot.concat(booked_time_slots)

                }
            }

            if (group_data > 0) {
                machine_arr[m].limit = machine_arr[m].limit - group_data;
            }

            var exceedSlot = await findRepeatingNumbers(allBookedSlot, machine_arr[m].limit);
            allExceedSlot = allExceedSlot.concat(exceedSlot);

            var availBlockSlot = [];
            var dur_slot_length = Math.ceil(duration / 15);
            for (var e = 0; e < allExceedSlot.length; e++) {
                for (var d = 1; d <= dur_slot_length; d++) {
                    availBlockSlot.push(allExceedSlot[e] - (15 * d))
                }
            }

            allExceedSlot = allExceedSlot.concat(availBlockSlot);
            allExceedSlot = Array.from(new Set(allExceedSlot)); //remove duplicates
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return { allBookedSlot: allBookedSlot, allExceedSlot: allExceedSlot };
    } catch (e) {
        return { allBookedSlot: [], allExceedSlot: [] }
    }
}

const checkServiceLimitBookedSlotNew = async function (data = {}) {
    try {
        var query = {};
        var locationId = data?.location_id || "";
        var date = data?.date || "";
        var appId = data?.app_id || "";
        var serviceIds = data?.service_ids || [];
        var duration = parseInt(data?.duration || 0);
        var groupData = data?.group_data || 0;
        data.all_ser = data?.all_ser || [];

        var servicesArr = Array.prototype.concat(...serviceIds);
        var appointments = [];

        query.services = { $elemMatch: { $in: servicesArr } };
        var machines = await MachineService.getActiveMachines(query);

        var appQuery = { location_id: locationId, date: date };
        appQuery.booking_status = { $nin: ['cancel', 'no_shows', 'complete'] };
        if (appId) { appQuery._id = { $ne: ObjectId(appId) }; }

        var app = [];
        var allExceedSlot = [];
        for (var m = 0; m < machines.length; m++) {
            appQuery.service_id = { $elemMatch: { $in: machines[m].services } };
            appointments = await AppointmentService.getAppointmentSpecific(appQuery);

            var allBookedSlot = [];
            for (var i = 0; i < appointments.length; i++) {
                if (appointments[i]?.start_time && appointments[i]?.end_time) {
                    var appSlot = { id: appointments[i]._id, start_time: appointments[i].start_time, end_time: appointments[i].end_time };

                    var startTimeSplit = appointments[i].start_time.split(':');
                    var endTimeSplit = appointments[i].end_time.split(':');

                    var bookedTimeSlots = timeSlotGenerateInNum2(parseInt(startTimeSplit[0]), parseInt(endTimeSplit[0]), parseInt(startTimeSplit[1]), parseInt(endTimeSplit[1]));
                    allBookedSlot = allBookedSlot.concat(bookedTimeSlots);
                }
            }

            if (groupData > 0) {
                machines[m].limit = machines[m].limit - groupData
            }

            var exceedSlot = await findRepeatingNumbers(allBookedSlot, machines[m].limit)
            allExceedSlot = allExceedSlot.concat(exceedSlot)

            var availBlockSlot = [];
            var durSlotLength = Math.ceil(duration / 15);
            for (var e = 0; e < allExceedSlot.length; e++) {
                for (var d = 1; d <= durSlotLength; d++) {
                    availBlockSlot.push(allExceedSlot[e] - (15 * d));
                }
            }

            allExceedSlot = allExceedSlot.concat(availBlockSlot);
            allExceedSlot = Array.from(new Set(allExceedSlot)); //remove duplicates
        }

        return { allBookedSlot: allBookedSlot, allExceedSlot: allExceedSlot };
    } catch (e) {
        return { allBookedSlot: [], allExceedSlot: [] };
    }
}

exports.createAvailableSlotWithIndex = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var query = { status: 1 }
        var empQuery = { status: 1 }

        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id;
            empQuery['location_id'] = req.body.location_id;
        }

        var duration = req.body.duration;
        var category_id = req.body.category_id;
        var online_status = req.body.online_status;
        var employee_id = [];
        var services = req.body.services;
        var locationId = req.body.location_id;
        var admin_booking = req.body.admin_booking;
        var requested_emp = req.body.requested_emp;
        var service_data = req.body.service_data;

        var app_id = req.body.application_id;
        var date = req.body.date;
        var dateObj = new Date(date);
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
        weekday = weekday.toLowerCase();

        if (req.body.start_time && req.body.start_time != '') {
            var start_time_num2 = timeToNum(req.body.start_time);
        }

        var close_day = false;
        var close_day_name = ""
        var location = await LocationService.getLocation(req.body.location_id)

        if (location?.group_close_days && location?.group_close_days.length > 0) {
            var ind = location?.group_close_days.findIndex(x => date >= dateFormat(x.close_day_start_date, "yyyy-mm-dd") && date <= dateFormat(x.close_day_end_date, "yyyy-mm-dd"));

            if (ind != -1) {
                close_day = true;
                close_day_name = location?.group_close_days[ind].close_day_name;
            }
        }

        var result = {}
        var ser_emp = [];

        if (!close_day) {
            var data = { location_id: req.body.location_id, date: req.body.date, services: services, app_id: app_id, weekday: weekday, start_time: req.body.start_time, online_status: online_status, duration: duration, is_front_booking: req.body.is_front_booking, selected_employee_id: req.body.employee_id, admin_booking: req.body.admin_booking, requested_employee_id: req.body.requested_employee_id }

            //result = await getEmployeeByServices(data)

            if (services && services.length > 0) {
                var start_time_num = timeToNum(req.body.start_time);
                //var st_roundup = roundDown15(start_time_num);

                for (var i = 0; i < service_data.length; i++) {
                    var params = { location_id: req.body.location_id, service_id: service_data[i].services, employees: req.body.employees, date: req.body.date };
                    var employees = await getEmployeeListByServices(params)
                    var service_query = { _id: { $in: service_data[i].services } };

                    var service = await ServiceService.getServiceSpecificWithCategory(service_query);
                    //var duration = service[0].duration
                    var duration = service.reduce((subtotal, item) => subtotal + item.duration, 0);

                    if (i == 0) {
                        start_time = start_time_num;
                    } else {
                        start_time = end_time;
                    }

                    end_time = start_time + service[0].duration;

                    var assign_emp = { employee_id: '', employee_timing: [], time_slots: [] }

                    if (employees && employees.length > 0) {
                        var reqEmp = requested_emp ?? '';

                        if (service_data[i].req_emp_id) {
                            reqEmp = service_data[i].req_emp_id;
                        }

                        if (i > 0 && reqEmp == '' && service_data[i - 1].req_emp_id) {
                            reqEmp = service_data[i - 1].req_emp_id;
                        }
                        var eind = employees.findIndex(x => x._id.toString() == reqEmp);

                        if (eind > 0) {
                            var empData = {
                                location_id: locationId,
                                date: date,
                                employee_id: [employees[eind]._id.toString()],
                                weekday: weekday,
                                app_id: app_id,
                                start_time: numToTime(start_time),
                                duration: duration,
                                admin_booking: admin_booking
                            }

                            var result = await getEmployeeCommonTiming(empData);

                            if (result.union_timing && result.union_timing.length > 0) {

                                var dur_slots = timeSlotWithRounDownByDuration(start_time, duration - 1);
                                slot_avail = arrayContainsAll(dur_slots, result.union_timing, 1);

                                if (slot_avail) {
                                    assign_emp.employee_id = employees[eind]._id.toString();
                                    assign_emp.employee_timing = result.union_timing;
                                    var timeSlots = result.union_timing.map(x => numToTime(x));
                                    assign_emp.time_slots = timeSlots;
                                }
                            }
                        }

                        if (assign_emp.employee_id == '') {
                            for (var e = 0; e < employees.length; e++) {
                                var empData = {
                                    location_id: locationId,
                                    date: date,
                                    employee_id: [employees[e]._id.toString()],
                                    weekday: weekday,
                                    app_id: app_id,
                                    start_time: numToTime(start_time),
                                    duration: duration,
                                    admin_booking: admin_booking
                                }

                                var result = await getEmployeeCommonTiming(empData);

                                if (result.union_timing && result.union_timing.length > 0) {
                                    var dur_slots = timeSlotWithRounDownByDuration(start_time, duration - 1);

                                    slot_avail = arrayContainsAll(dur_slots, result.union_timing, 1);

                                    if (slot_avail) {
                                        assign_emp.employee_id = employees[e]._id.toString();
                                        assign_emp.employee_timing = result.union_timing;
                                        var timeSlots = result.union_timing.map(x => numToTime(x));
                                        assign_emp.time_slots = timeSlots;
                                        break;
                                    }
                                }
                            }
                        }

                    }

                    var ser_obj = {
                        start_time: start_time,
                        end_time: end_time,
                        start_time_num: numToTime(start_time),
                        end_time_num: numToTime(end_time),
                        service: service,
                        service_id: service_data[i].services,
                        employee_ids: employees,
                        duration: duration,
                        employee_id: assign_emp.employee_id,
                        employee_data: assign_emp,
                        index: service_data[i].index

                    }

                    ser_emp.push(ser_obj)

                }
            }
        }

        var b_data = { location_id: req.body.location_id, date: req.body.date, services: services, app_id: app_id, duration: duration, group_data: req.body.group_data }
        var ser_limit_result = await checkServiceLimitBookedSlot(b_data);

        var paidSlots = [];
        if (req.body.reschedule && req.body.reschedule == 1) {
            paidSlots = await calculatePaidHourSlots({ location_id: req.body.location_id, date: req.body.date })
        }

        return res.status(200).json({ status: 200, flag: true, data: [], close_day: close_day, close_day_name: close_day_name, result: result, service_data: ser_emp, message: "Successfully BlockTimes Recieved" });

    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createAvailableSlot = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var query = { status: 1 }
        var empQuery = { status: 1 }

        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id;
            empQuery['location_id'] = req.body.location_id;
        }

        var duration = 0; //req.body.duration;
        var category_id = req.body.category_id;
        var online_status = req.body.online_status;
        var employee_id = [];
        var services = req.body.services;

        var app_id = req.body.application_id;
        var date = req.body.date;
        var dateObj = new Date(date);
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
        weekday = weekday.toLowerCase();

        if (req.body.start_time && req.body.start_time != '') {
            var start_time_num2 = timeToNum(req.body.start_time);
        }

        var close_day = false;
        var close_day_name = ""
        var location = await LocationService.getLocation(req.body.location_id)

        if (location?.group_close_days && location?.group_close_days.length > 0) {
            var ind = location?.group_close_days.findIndex(x => date >= dateFormat(x.close_day_start_date, "yyyy-mm-dd") && date <= dateFormat(x.close_day_end_date, "yyyy-mm-dd"));

            if (ind != -1) {
                close_day = true;
                close_day_name = location?.group_close_days[ind].close_day_name;
            }
        }

        var result = {}
        if (!close_day) {
            var data = { location_id: req.body.location_id, date: req.body.date, services: services, app_id: app_id, weekday: weekday, start_time: req.body.start_time, online_status: online_status, duration: duration, is_front_booking: req.body.is_front_booking, selected_employee_id: req.body.employee_id, admin_booking: req.body.admin_booking }

            result = await getEmployeeByServices(data)
        }

        var b_data = { location_id: req.body.location_id, date: req.body.date, services: services, app_id: app_id, duration: duration, group_data: req.body.group_data }
        var ser_limit_result = await checkServiceLimitBookedSlot(b_data);

        var paidSlots = [];
        if (req.body.reschedule && req.body.reschedule == 1) {
            paidSlots = await calculatePaidHourSlots({ location_id: req.body.location_id, date: req.body.date })
        }

        var time_slots = [];
        var time_slots2 = [];
        var is_slot_avail = false;
        var time_slots = []; //available common slot
        var availEmp = [];

        empQuery['is_employee'] = 1;
        var common_avail_slot = [];
        var all_unique_emp = [];
        var duration = [];

        if (weekday && req.body.location_id && !close_day) {

            var result_final_arr = [];

            if (result.emp.length > 0) {
                for (var i = 0; i < result.emp.length; i++) {
                    var final_arr = [];

                    if (result.emp[i].service_data.length > 0) {
                        var emp_ids_arrays = result.emp[i].service_data.map(s => s.employee_ids); //merge array of employee ids
                        var emp_ids_arr = [].concat.apply([], emp_ids_arrays); //merge all employee ids

                        var emp_ids_arr = emp_ids_arr.byCount(); //sorting by count
                        if (req.body.start_time) {
                            var res_emp_ids = await employeeByAvailability(result.emp[i].service_data, req.body.start_time); //sorting by count
                            if (res_emp_ids && res_emp_ids.emp_ids.length > 0) {
                                emp_ids_arr = res_emp_ids.emp_ids
                            }
                        }
                        result.emp[i].most_common_emp = emp_ids_arr;
                        if (emp_ids_arr.length == 0) {
                            result.emp[i].union_timing = [];
                        }

                        for (var e = 0; e < emp_ids_arr.length; e++) {
                            var item = result.emp[i].service_data.filter(res => res.employee_ids.indexOf(emp_ids_arr[e]) !== -1); //sort by most common employee 

                            item = Array.from(new Set(item)); //remove duplicates

                            final_arr.push(item)
                        }
                    }

                    final_arr = [].concat.apply([], final_arr);

                    result_arr = final_arr.reduce((unique, o) => {
                        if (!unique.some(obj => obj.service_id === o.service_id && obj.employee_ids === o.employee_ids)) {
                            unique.push(o);
                        }
                        return unique;
                    }, []); //remove duplicates
                    duration = result.emp[i].all_ser_duration;
                    result_final_arr.push({ service_data: result_arr, common_emp: result.emp[i].common_emp, all_ser_duration: result.emp[i].all_ser_duration, most_common_emp: result.emp[i].most_common_emp, union_timing: result.emp[i].union_timing, all_service: result.emp[i].all_service });
                }

                if (result_final_arr.length > 0) {
                    for (var i = 0; i < result_final_arr.length; i++) {
                        for (var j = 0; j < result_final_arr[i].service_data.length; j++) {
                            for (var k = 0; k < result_final_arr[i].service_data[j].employee_data.length; k++) {

                                var et_ind = all_unique_emp.findIndex(x => x.employee_id.toString() == result_final_arr[i].service_data[j].employee_data[k].employee_id.toString());
                                if (et_ind == -1) {
                                    all_unique_emp.push(result_final_arr[i].service_data[j].employee_data[k])
                                }
                            }
                        }
                    }

                    var emp_avail_slot_arr = all_unique_emp.map(s => s.employee_timing);
                    emp_avail_slot_arr = [].concat.apply([], emp_avail_slot_arr);
                    emp_avail_slot_arr.sort(function (a, b) {
                        return a - b;
                    });
                    common_avail_slot_arr = result_final_arr.map(s => s.union_timing);

                    common_avail_slot = getCommonElements(common_avail_slot_arr);

                    var req_emp = services.length;
                    var remove_slot = [];

                    if (common_avail_slot.length > 0) {
                        for (var c = 0; c < common_avail_slot.length; c++) {
                            var count = emp_avail_slot_arr.filter(x => x == common_avail_slot[c]).length  // -> 3
                            if (req_emp > count) {
                                remove_slot.push(common_avail_slot[c])
                            }
                        }

                        //service limit exceed slots
                        remove_slot = remove_slot.concat(ser_limit_result.allExceedSlot);

                        if (req.body.reschedule && req.body.reschedule == 1) {
                            remove_slot = remove_slot.concat(paidSlots);
                        }
                        if (remove_slot.length > 0) {
                            for (var es = 0; es < remove_slot.length; es++) {
                                var index = common_avail_slot.map(function (e) { return e; }).indexOf(remove_slot[es]);
                                if (index != -1) {
                                    common_avail_slot.splice(index, 1)
                                }
                            }
                        }
                        var dura = roundup15(duration);
                        var end_slot = [];
                        for (var i = 0; i < common_avail_slot?.length; i++) {
                            var cur_time = (common_avail_slot[i]);
                            var total_min = parseInt(dura) + parseInt(cur_time);

                            var ind = common_avail_slot.map(function (e) { return e; }).indexOf(total_min);
                            var all_slot_avail = true;
                            if (ind != -1) {
                                var dur_slots = timeSlotGenerateByDuration(parseInt(cur_time), dura);
                                all_slot_avail = arrayContainsAll(dur_slots, common_avail_slot, 1);
                            }

                            if (ind == -1 || !all_slot_avail) {
                                end_slot.push(common_avail_slot[i]);
                            }
                        }
                        if (end_slot.length > 0) {
                            for (var es = 0; es < end_slot.length; es++) {
                                var index = common_avail_slot.map(function (e) { return e; }).indexOf(end_slot[es]);
                                if (index != -1) {
                                    common_avail_slot.splice(index, 1)
                                }
                            }
                        }
                    }
                    var st_ind = -1;
                    if (req.body.start_time && req.body.start_time != '') {
                        var s_time = timeToNum(req.body.start_time);
                        var st_roundup = roundDown15(s_time);
                        st_ind = common_avail_slot.indexOf(st_roundup);

                        if (st_ind > -1) {
                            is_slot_avail = true;
                        }
                    }
                    for (var cs = 0; cs < common_avail_slot.length; cs++) {
                        common_avail_slot[cs] = numToTime(common_avail_slot[cs]);
                    }

                }

            }

        }
        // Return the BlockTimes list with the appropriate HTTP password Code and Message.
        //,timing_arr : timing_arr ,common:common 
        return res.status(200).json({ status: 200, flag: true, data: common_avail_slot, is_slot_avail: is_slot_avail, avail_emp: availEmp, close_day: close_day, close_day_name: close_day_name, result_final_arr: result_final_arr, message: "Successfully BlockTimes Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


const getEmployeeByServices = async function (data) {

    var query = { is_employee: 1, status: 1 };
    if (data.location_id && data.location_id != 'undefined') {
        query['location_id'] = data.location_id;
    }
    var date = data.date;
    var dateObj = new Date(date);
    var weekday = data.weekday;
    var services = data.services;
    var start_time = data.start_time;
    var online_status = data.online_status;
    var employee_id = data.employee_id ? data.employee_id : '';
    var selected_employee_id = data.selected_employee_id ? data.selected_employee_id : '';

    var allServices = false;
    var emp = [];
    var cat_arr = [];
    var off_day_emp = [];
    var union_timing = [];

    try {

        if (selected_employee_id && selected_employee_id != '') {
            var off_day_emp = await EmployeeTimingService.getEmployeeUniqueTimings(
                {
                    location_id: data.location_id,
                    day: weekday,
                    employee_id: selected_employee_id,
                    //days_off:{$eq:1},
                    $or: [
                        { $and: [{ repeat: { $eq: 'weekly' } }, { end_repeat: { $eq: 'ongoing' } }, { date: { $lte: date } }] },
                        { $and: [{ repeat: { $eq: '' } }, { date: { $eq: date } }] },
                        { $and: [{ end_repeat: { $eq: 'date' } }, { date: { $lte: date } }, { repeat_specific_date: { $gte: date } }] }
                    ],
                });

        } else {
            var off_day_emp = await EmployeeTimingService.getEmployeeUniqueTimings(
                {
                    location_id: data.location_id,
                    day: weekday,
                    //days_off:{$eq:1},
                    $or: [
                        { $and: [{ repeat: { $eq: 'weekly' } }, { end_repeat: { $eq: 'ongoing' } }, { date: { $lte: date } }] },
                        { $and: [{ repeat: { $eq: '' } }, { date: { $eq: date } }] },
                        { $and: [{ end_repeat: { $eq: 'date' } }, { date: { $lte: date } }, { repeat_specific_date: { $gte: date } }] }
                    ],
                });
        }

        var off_day_emp_filter = [];
        var off_day_emp_arr = [];


        if (off_day_emp.length > 0) {
            off_day_emp_arr = off_day_emp.map(s => s.employee_id);
        }

        var off_day_emp_filter = off_day_emp.filter(function (el) {
            return el.days_off == 1;
        });



        var on_leave_emp = [];

        if (off_day_emp_filter.length > 0) {
            on_leave_emp = off_day_emp_filter.map(s => s.employee_id);

        }
        if (employee_id && employee_id != '' && data.emp_slot != 1) {
            on_leave_emp.push(employee_id);
        }
        var services_arr = [];

        if (services && services.length > 0) {

            for (var s = 0; s < services.length; s++) {
                var s_arr = [];
                var all_ser_duration = 0;
                var union_timing = [];
                if (data.is_front_booking == 1) {
                    for (var si = 0; si < services[s].length; si++) {
                        var ser_obj = { service_id: [services[s][si]], employee_ids: [], employee_data: [], start_time: "", end_time: "", pre_duration: 0, duration: "", employee_id: "", services: [] };

                        var service_query = { _id: { $in: [services[s][si]] } };
                        var service = await ServiceService.getServiceSpecificWithCategory(service_query);

                        var dura = service.reduce((subtotal, item) => subtotal + item.duration, 0);

                        ser_obj.duration = dura;
                        all_ser_duration += dura;

                        if (service && service.length > 0) {
                            cat_arr = service.map(s => s.category_id);
                            query['services'] = { $all: cat_arr };
                            //query['services'] = { $elemMatch: { $in: cat_arr } };
                        }
                        if (selected_employee_id && selected_employee_id != '') {
                            query['_id'] = selected_employee_id;
                        } else if (off_day_emp.length > 0) {
                            query['_id'] = { $nin: on_leave_emp };
                        }
                        if (online_status && online_status != 'undefined') {
                            query['online_status'] = 1;
                        }
                        var employees = await UserService.getEmployees(query);

                        ser_obj.employee_ids = employees.map(s => s._id.toString());
                        if (ser_obj.employee_ids.length > 0) {
                            for (var e = 0; e < ser_obj.employee_ids.length; e++) {
                                var edata = { location_id: data.location_id, date: data.date, employee_id: [ser_obj.employee_ids[e]], weekday: weekday, app_id: data.app_id, start_time: data.start_time, duration: ser_obj.duration, admin_booking: 0 }

                                var result = await getEmployeeCommonTiming(edata);

                                if (start_time && start_time != '') {
                                    ser_emp = result.emp;
                                }

                                union_timing.push(result.union_timing);

                                ser_obj.employee_data.push({ employee_id: ser_obj.employee_ids[e], employee_timing: result.union_timing })

                            }
                            ser_obj.employee_ids = ser_obj.employee_data.map(s => s.employee_id.toString());

                        }

                        s_arr.push(ser_obj);
                    }
                } else {

                    var ser_obj = { service_id: services[s], employee_ids: [], employee_data: [], start_time: "", end_time: "", pre_duration: 0, duration: "", employee_id: "", services: [] };
                    var service_query = { _id: { $in: services[s] } };
                    var service = await ServiceService.getServiceSpecificWithCategory(service_query);

                    var dura = service.reduce((subtotal, item) => subtotal + item.duration, 0);

                    ser_obj.duration = dura;
                    if (service && service.length > 0) {
                        cat_arr = service.map(s => s.category_id);
                        query['services'] = { $all: cat_arr };
                        //query['services'] = { $elemMatch: { $in: cat_arr } };
                    }

                    if (off_day_emp.length > 0) {
                        query['_id'] = { $nin: on_leave_emp };
                    }
                    if (online_status && online_status != 'undefined') {
                        query['online_status'] = 1;
                    }
                    if (employee_id && employee_id != '' && data.emp_slot == 1) {
                        query['_id'] = ObjectId(employee_id);
                        if (cat_arr) {
                            query['services'] = { $all: cat_arr };
                        }
                    }

                    var employees = await UserService.getEmployees(query);

                    ser_obj.employee_ids = employees.map(s => s._id.toString());

                    if (ser_obj.employee_ids.length > 0) {
                        var emp_ind = ser_obj.employee_ids.findIndex(x => x == data.requested_employee_id);


                        for (var e = 0; e < ser_obj.employee_ids.length; e++) {

                            var edata = { location_id: data.location_id, date: data.date, employee_id: [ser_obj.employee_ids[e]], weekday: weekday, app_id: data.app_id, start_time: data.start_time, duration: ser_obj.duration, admin_booking: data.admin_booking }

                            var result = await getEmployeeCommonTiming(edata);

                            if (start_time && start_time != '') {
                                ser_emp = result.emp;
                            }
                            union_timing.push(result.union_timing);

                            ser_obj.employee_data.push({ employee_id: ser_obj.employee_ids[e], employee_timing: result.union_timing });

                        }
                        ser_obj.employee_ids = ser_obj.employee_data.map(s => s.employee_id.toString());
                        //}

                    }

                    s_arr.push(ser_obj);

                }


                var ser_emp = [];

                var common_emp = [];
                var all_emp_arr = [];

                if (s_arr) {

                    union_timing = [].concat.apply([], union_timing);
                    union_timing = Array.from(new Set(union_timing))
                    union_timing = union_timing.sort();

                    all_emp_arr = s_arr.map(s => s.employee_ids);
                    common_emp = GFG_Fun(all_emp_arr);
                }

                var common_obj = { service_data: s_arr, common_emp: common_emp, all_ser_duration: all_ser_duration, common_emp_timing: [], most_common_emp: [], union_timing: [], available_slot: [], all_service: services[s] };

                var edata = { location_id: data.location_id, date: data.date, employee_id: all_emp_arr, weekday: weekday, app_id: data.app_id, start_time: data.start_time, duration: data.duration }

                var employee_timing = union_timing;
                var avail_union_timing = []

                for (var emp = 0; emp < employee_timing.length; emp++) {
                    var dur_slots = timeSlotGenerateByDuration(employee_timing[emp], data.duration);

                    slot_avail = arrayContainsAll(dur_slots, employee_timing, 1);

                    if (slot_avail) {
                        avail_union_timing.push(employee_timing[emp]);
                    }
                }

                avail_union_timing = Array.from(new Set(avail_union_timing));

                common_obj.union_timing = avail_union_timing;
                services_arr.push(common_obj);
            }

        }
        var res = { emp: services_arr, union_timing: union_timing }
        return res
    } catch (e) {
        console.log(e)
        return { emp: [], union_timing: [] }
    }

}

const getEmployeeCommonTiming = async function (data) {
    var employee_id = data.employee_id;
    var date = data.date;
    var weekday = data.weekday;
    var app_id = data.app_id;

    empTime = [];
    var time_slots = [];
    var time_slots2 = [];
    var all_time_slots = [];
    var timing_arr = [];

    var availEmp = [];
    var start_time = data.start_time;
    var duration = data.duration;

    var location = await LocationService.getLocation(data.location_id);
    location_timing = await LocationTimingService.getSpecificLocationTimings(data.location_id, weekday); //get location time by day name

    if (location?.group_special_hours && location?.group_special_hours.length > 0) {
        var ind = location?.group_special_hours.findIndex(x => date >= dateFormat(x.special_hour_start_date, "yyyy-mm-dd") && date <= dateFormat(x.special_hour_end_date, "yyyy-mm-dd"));
        if (ind != -1) {
            var location_timing = { start_time: '', end_time: '', day: weekday, location_id: data.location_id };
            location_timing.start_time = location?.group_special_hours[ind].special_hour_from_time;

            location_timing.end_time = location?.group_special_hours[ind].special_hour_end_time;
        }
    }

    var delay_interval = 0;
    var customParaVal = await getCustomParameterData(location?.company_id, data.location_id, 'delay_interval');
    if (customParaVal && customParaVal?.formData && customParaVal?.formData?.delay_status && customParaVal?.formData?.delay_interval > 0) {
        delay_interval = customParaVal?.formData?.delay_interval;
    }

    for (var em = 0; em < employee_id.length; em++) {
        var block_slots = [];
        var emp_id = employee_id[em];

        var blockTimes = await BlockTimeService.getBlockSpecific(
            {
                location_id: data.location_id,
                status: 1,
                $and: [{
                    $or: [
                        { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
                        { $and: [{ start_date: { $lte: date } }, { end: { $eq: 'always' } }] }
                    ],
                },
                {
                    $or: [
                        { employee_id: { $elemMatch: { $in: [emp_id] } } }, { employee_all: 1 }
                    ],
                }
                ]

            });

        for (var i = 0; i < blockTimes.length; i++) {
            var week_days = blockTimes[i].every_week;
            var alternate_day = blockTimes[i].alternate_day;
            if (blockTimes[i]) {
                if (blockTimes[i].repeat == 'every_week' && week_days) {
                    var index = week_days.map(function (e) { return e; }).indexOf(weekday);
                    if (index == -1) {
                        blockTimes.splice(i, 1);
                    }
                }
            }
            if (blockTimes[i]) {
                if (blockTimes[i].repeat == 'every_alternate_week' && alternate_day) {
                    var index = alternate_day.map(function (e) { return e; }).indexOf(weekday);
                    if (index == -1) {
                        blockTimes.splice(i, 1);
                    }
                }
            }
        }

        var app_query = { date: date };

        if (app_id && app_id != '') {
            app_query['_id'] = { $ne: ObjectId(app_id) };
        }
        app_query['service_data'] = { $elemMatch: { employee_id: emp_id.toString() } };
        app_query['booking_status'] = { $nin: ['cancel', 'no_shows', 'complete'] };

        var appointments = await AppointmentService.getAppointmentSpecific(app_query);

        var today_timing = await EmployeeTimingService.getEmployeeUniqueTimings(
            {
                employee_id: emp_id.toString(),
                day: weekday,
                shift_start_time: { $ne: '00:00' },
                shift_end_time: { $ne: '00:00' },
                $or: [
                    { $and: [{ repeat: { $eq: 'weekly' } }, { end_repeat: { $eq: 'ongoing' } }, { date: { $lte: date } }] },
                    { $and: [{ repeat: { $eq: '' } }, { date: { $eq: date } }] },
                    { $and: [{ end_repeat: { $eq: 'date' } }, { date: { $lte: date } }, { repeat_specific_date: { $gte: date } }] }
                ],
            });

        var result_emp = today_timing.reduce((unique, o) => {
            if (!unique.some(obj => obj.employee_id === o.employee_id)) {
                unique.push(o);
            }
            return unique;
        }, []);

        today_timing = result_emp;

        var pri_ind = -1;

        if (today_timing && today_timing.length > 0) {
            pri_ind = 0;
        }

        var emp_timing = today_timing;

        if (today_timing.length == 0 || pri_ind == -1) {

            var today_start_time_split = location_timing?.start_time.split(':');
            var today_end_time_split = location_timing?.end_time.split(':');

            var today_start_time = today_start_time_split[0];
            var today_end_time = today_end_time_split[0];

            if (location_timing && today_start_time && today_end_time) {
                time_slots = timeSlotGenerateInNum(parseInt(today_start_time), parseInt(today_end_time), today_start_time_split[1], today_end_time_split[1], date, delay_interval, data.admin_booking);
            }
        } else {
            if (today_timing[0].shift_start_time < location_timing?.start_time) {
                today_timing[0].shift_start_time = location_timing?.start_time;
            }

            if (today_timing[0].shift_end_time > location_timing?.end_time) {
                today_timing[0].shift_end_time = location_timing?.end_time;
            }

            var today_start_time_split = today_timing[0].shift_start_time.split(':');
            var today_end_time_split = today_timing[0].shift_end_time.split(':');

            var now = new Date(today_timing[0].date);
            today_timing[0].date = dateFormat(now, "yyyy-mm-dd");

            if (today_timing[0].repeat_specific_date) {
                var dt2 = new Date(today_timing[0].repeat_specific_date);
                today_timing[0].repeat_specific_date = dateFormat(dt2, "yyyy-mm-dd");
            }

            if (today_timing[0].sec_shift_start_time != '' && today_timing[0].sec_shift_end_time != '' && ((today_timing[0].update_upcoming_shift == 1 && today_timing[0].date <= date && (today_timing[0].repeat_specific_date >= date || today_timing[0].end_repeat == 'ongoing')) || (today_timing[0].update_specific_shift == 1 && today_timing[0].date == date))) {

                if (today_timing[0].sec_shift_start_time < location_timing?.start_time) {
                    today_timing[0].sec_shift_start_time = location_timing?.start_time;
                }

                if (today_timing[0].sec_shift_end_time > location_timing?.end_time) {
                    today_timing[0].sec_shift_end_time = location_timing?.start_time;
                }

                today_sec_start_time_split = today_timing[0].sec_shift_start_time.split(':');
                today_sec_end_time_split = today_timing[0].sec_shift_end_time.split(':');

            }

            var today_start_time = today_start_time_split[0];
            var today_end_time = today_end_time_split[0];

            if (today_timing[0] && today_start_time && today_end_time) {
                all_time_slots = timeSlotGenerateInNum(parseInt(today_start_time), parseInt(today_end_time), today_start_time_split[1], today_end_time_split[1], date, delay_interval, data.admin_booking);
            }
            if (today_timing[0].sec_shift_start_time != '' && today_timing[0].sec_shift_start_time != '00:00' && today_timing[0].sec_shift_end_time != '' && today_timing[0].sec_shift_end_time != '00:00') {
                time_slots2 = timeSlotGenerateInNum(parseInt(today_sec_start_time_split[0]), parseInt(today_sec_end_time_split[0]), today_sec_start_time_split[1], today_sec_end_time_split[1], date, delay_interval, data.admin_booking);
            }

            time_slots = all_time_slots.concat(time_slots2);
            all_time_slots = all_time_slots.concat(time_slots2);

        }

        for (var ts = 0; ts < time_slots.length; ts++) {
            var time_flag = false;
            var time = time_slots[ts];

            if (appointments.length > 0) {
                for (var a = 0; a < appointments.length; a++) {

                    if (appointments[a].service_data) {

                        for (var sa = 0; sa < appointments[a].service_data.length; sa++) {
                            if (appointments[a].service_data[sa].employee_id == employee_id.toString()) {

                                var st = timeToNum(appointments[a].service_data[sa].start_time);
                                var et = timeToNum(appointments[a].service_data[sa].end_time);
                                var isInRange = inRange(time, st, et);

                                if (isInRange) {
                                    time_flag = true; //time slot is unavailable
                                }

                            }

                        }

                    }

                }

            }

            if (time_flag) {
                block_slots.push(time_slots[ts]);
            }

            if (blockTimes && blockTimes.length > 0) {
                for (var bk = 0; bk < blockTimes.length; bk++) {

                    bst = timeToNum(blockTimes[bk].start_time);
                    bet = timeToNum(blockTimes[bk].end_time);
                    rst = inRange(time, bst, bet);
                    if (rst) {
                        block_slots.push(time_slots[ts])
                    }

                }
            }
        }

        block_slots.sort();
        const all_block_slots = Array.from(new Set(block_slots))

        for (var bs = 0; bs < all_block_slots.length; bs++) {
            var index = time_slots.map(function (e) { return e; }).indexOf(all_block_slots[bs]);

            if (index != -1) {
                time_slots.splice(index, 1)
            }
        }
        if (start_time && start_time != '') {
            var stime = timeToNum(start_time);
            var etime = parseInt(stime) + parseInt(duration);
            etime = numToTime(etime);

            var start_time_split = start_time.split(':');
            var end_time_split = etime.split(':');

            var booked_time_slots = timeSlotGenerateInNum2(parseInt(start_time_split[0]), parseInt(end_time_split[0]), parseInt(start_time_split[1]), parseInt(end_time_split[1]));

            var avl_flag = true;

            if (booked_time_slots.length > 0) {
                for (var ab = 0; ab < booked_time_slots.length; ab++) {
                    var index = time_slots.map(function (e) { return e; }).indexOf(booked_time_slots[ab]);

                    if (index == -1) {
                        avl_flag = false;
                    }
                }
            }

            if (avl_flag) {
                availEmp.push(emp_id.toString());
            }
        }
        timing_arr.push(time_slots);


    }
    if (start_time && start_time != '') {
        emp = availEmp;
    } else {
        emp = employee_id;
    }


    var resultArray = Array.prototype.concat.apply([], timing_arr); //merge all array

    var resultArray = { emp: emp, union_timing: resultArray };
    return resultArray;

}

exports.reAssignBookingEmployee = async function (req, res, next) {
    var app_query = {};
    var service_query = {};
    var result = {};
    var noAvailEmp = false;
    var alot_emp = [];
    try {
        var emp_id = req.body.employee_id;
        var date = req.body.date;
        var day = req.body.day;
        var dateObj = new Date(date);
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
        weekday = weekday.toLowerCase();

        var app_query = {
            location_id: req.body.location_id,
            booking_status: { $nin: ['cancel', 'no_shows', 'complete'] },
        };
        app_query['service_data'] = { $elemMatch: { employee_id: req.body.employee_id } };
        if (req.body.repeat == "" && req.body.end_repeat == "") {

            app_query['onlyDate'] = { $eq: date };

        } else if (req.body.repeat == "weekly" && req.body.end_repeat == "ongoing") {
            app_query['day'] = day;
            app_query['onlyDate'] = { $gte: date };

        } else if (req.body.repeat == "weekly" && req.body.end_repeat == "date" && req.body.repeat_specific_date) {
            app_query['day'] = day;
            app_query['onlyDate'] = { $gte: date, $lte: req.body.repeat_specific_date };

        } else if (req.body.repeat == "everyday" && req.body.end_repeat == "ongoing") {

            app_query['onlyDate'] = { $gte: date };

        } else if (req.body.repeat == "everyday" && req.body.end_repeat == "date") {

            app_query['onlyDate'] = { $gte: date, $lte: req.body.repeat_specific_date };

        }

        var appointments = await AppointmentService.getAppointmentDateSpecific(app_query);
        var emp_app = [];

        if (appointments.length > 0) {
            for (var a = 0; a < appointments.length; a++) {
                if (appointments[a].service_data.length > 0) {

                    emp_app.push(appointments[a]);
                }
            }
        }

        var pending_booking = [];

        if (emp_app.length > 0) {
            for (var a = 0; a < emp_app.length; a++) {

                for (var s = 0; s < emp_app[a].service_data.length; s++) {

                    if (emp_id == emp_app[a].service_data[s].employee_id) {

                        var services = emp_app[a].service_data[s].service_id;

                        var totDuration = 0;

                        if (emp_app[a].service_data[s].service_id) {
                            totDuration = emp_app[a].service_data[s].service_id[0].duration;
                        }

                        var app_date = new Date(emp_app[a].date);
                        app_date = dateFormat(app_date, "yyyy-mm-dd");

                        var data = { location_id: req.body.location_id, date: app_date, services: [services], app_id: '', weekday: weekday, start_time: emp_app[a].service_data[s].start_time, online_status: 0, duration: totDuration, employee_id: emp_id, application_id: emp_app[a]._id };

                        result = await getAvailableSlot(data);

                        if (result.is_slot_avail) {

                            if (result.result_final_arr.length > 0) {

                                var ind = result.result_final_arr[0].service_data.findIndex(x => x.service_id == emp_app[a].service_data[s].service_id);

                                if (ind != -1 && result.result_final_arr[0].service_data[ind].employee_id != '') {

                                    var old_emp = await UserService.getUser(emp_app[a].service_data[s].employee_id)
                                    var new_emp = await UserService.getUser(result.result_final_arr[0].service_data[ind].employee_id)
                                    emp_app[a].service_data[s].employee_id = result.result_final_arr[0].service_data[ind].employee_id;
                                    if (ind > 0 && service_data[ind - 1] && service_data[ind].employee_id != service_data[ind - 1].employee_id) {

                                        emp_app[a].employee_comments += ' Was booked with ' + old_emp.name + '. Now rota deleted so assigned to ' + new_emp.name + '';

                                    } else if (ind == 0) {
                                        emp_app[a].employee_comments += ' Was booked with ' + old_emp.name + '. Now rota deleted so assigned to ' + new_emp.name + '';

                                    }

                                    var appointment = await AppointmentService.updateAppointment(emp_app[a]);

                                    var params = { location_id: emp_app[a].location_id, employee_id: '', date: app_date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: 'booking' };
                                    var refData = updateAppListTableData(params);
                                    var params2 = { location_id: emp_app[a].location_id, date: app_date, all_future: 1 };
                                    var refDashData = setDashboardRefData(params2);
                                } else {
                                    var app_ind = pending_booking.findIndex(x => x._id == emp_app[a]._id);
                                    if (app_ind == -1) {
                                        noAvailEmp = true;
                                        pending_booking.push(emp_app[a]);
                                    }
                                }

                            } else {
                                var app_ind = pending_booking.findIndex(x => x._id == emp_app[a]._id);
                                if (app_ind == -1) {
                                    noAvailEmp = true;
                                    pending_booking.push(emp_app[a]);
                                }
                            }

                        } else {
                            var app_ind = pending_booking.findIndex(x => x._id == emp_app[a]._id);
                            if (app_ind == -1) {
                                noAvailEmp = true;
                                pending_booking.push(emp_app[a]);
                            }
                        }

                    }
                }

                var eind = emp_app[a].service_data.findIndex(x => x.employee_id == '');
                if (eind > -1) {
                    noAvailEmp = true;
                    pending_booking.push(emp_app[a]);
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, appointments: appointments, data: emp_app, no_avail_emp: noAvailEmp, pending_booking: pending_booking, message: "Successfully Created BlockTime" })
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "BlockTime Creation was Unsuccesfull" })
    }

}

const arrayContainsAll = function (matchArr, mainArr, is_num = 0) {
    for (let i = 0; i < matchArr.length; i++) {
        if (is_num == 1) {
            if (mainArr.indexOf(matchArr[i]) == -1) {
                return false;
            }
        } else {
            if (mainArr.indexOf(matchArr[i].toString()) == -1) {
                return false;
            }
        }

    }

    return true;
}

const roundup15 = function (x) {
    return (x % 15) ? x - x % 15 + 15 : x
}

const roundDown15 = function (x) {
    return (x % 15) ? x - x % 15 : x
}


const numToTime = function (num) {
    //console.log('num',num)
    m = num % 60;
    h = parseInt(num / 60);
    // console.log('m',m)
    // console.log('h',h)
    return (h > 9 ? h : "0" + h) + ":" + (m > 9 ? m : "0" + m);
} //ex: $num=605 605%60 == 5 ,605/60 == 10  return 10:05



function getCommonElements(arrays = []) {//Assumes that we are dealing with an array of arrays of integers
    var currentValues = {};
    var commonValues = {};
    for (var i = arrays[0].length - 1; i >= 0; i--) {//Iterating backwards for efficiency
        currentValues[arrays[0][i]] = 1; //Doesn't really matter what we set it to
    }

    for (var i = arrays.length - 1; i > 0; i--) {
        var currentArray = arrays[i]
        for (var j = currentArray.length - 1; j >= 0; j--) {
            if (currentArray[j] in currentValues) {
                commonValues[currentArray[j]] = 1 // Once again, the `1` doesn't matter
            }
        }

        currentValues = commonValues
        commonValues = {}
    }

    return Object.keys(currentValues).map(function (value) {
        return parseInt(value)
    })
}


const timeSlotGenerate = function (today_start_time, today_end_time, start_time, end_time, date) {
    let date_ob = new Date();
    date_ob.toLocaleString('en-US', { timeZone: 'Europe/London' });
    todayDate = dateFormat(date_ob, "yyyy-mm-dd");

    var currentTime = date_ob.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/London' });
    //console.log('currentTime',currentTime)
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

            if (date == todayDate) {

                var c_time_num = timeToNum(currentTime);
                var time_num = timeToNum(time);
                if (c_time_num < time_num) {

                    if (today_end_time == t) {

                        if (end_time > quarterHours[j]) {

                            times.push(time);
                        }
                    } else if (today_start_time == t) {
                        if (start_time <= quarterHours[j]) {
                            times.push(time);
                        }

                    } else {
                        times.push(time);
                    }
                }

            } else {

                if (today_end_time == t) {
                    if (end_time > quarterHours[j]) {
                        times.push(time);
                    }
                } else if (today_start_time == t) {
                    if (start_time <= quarterHours[j]) {
                        times.push(time);
                    }

                } else {
                    times.push(time);
                }
            }


            var obj = { time: time }; // time slot
        }
    }
    return times;

}

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

const timeSlotWithRounDownByDuration = function (start_time, duration) {
    //start_time = roundDown15(start_time)
    var td_data = [];
    var end_time = start_time + duration;
    itr = duration / 15;
    //itr = parseInt(itr)

    var times = [];
    var time_num = roundDown15(start_time);
    times.push(time_num);

    for (var j = 0; j < itr; j++) {

        time_num += 15;
        if (time_num != roundup15(end_time)) {
            times.push(time_num);
        }

    }
    return times;

}


const timeSlotGenerateByDuration = function (start_time, duration) {
    var td_data = [];
    var end_time = start_time + duration;
    itr = duration / 15;
    var times = [];
    time_num = start_time;
    times.push(time_num);

    for (var j = 0; j < itr; j++) {

        time_num += 15;
        times.push(time_num);
    }
    return times;

}

const timeSlotGenerateInNum = function (today_start_time, today_end_time, start_time, end_time, date, delay_interval = 0, admin_booking = 0) {
    let date_ob = new Date();
    date_ob2 = date_ob.toLocaleString('en-GB', { timeZone: 'Europe/London' });
    todayDate = dateFormat(date_ob, "yyyy-mm-dd");

    date_ob2 = date_ob.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' })

    var currentTime = date_ob.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/London' });

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
            if (date == todayDate && !admin_booking) {

                var c_time_num = timeToNum(currentTime);

                if (delay_interval > 0 && !admin_booking) {
                    c_time_num = parseInt(c_time_num) + parseInt(delay_interval);
                }
                var pre_time_num = time_num - 15;

                if (c_time_num < time_num || (admin_booking && c_time_num >= pre_time_num && c_time_num <= time_num)) {

                    if (today_end_time == t) {

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
                }

            } else {


                if (today_end_time == t) {
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
            }


            var obj = { time: time }; // time slot
        }
    }
    return times;

}

exports.getBlockTime = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var BlockTime = await BlockTimeService.getBlockTime(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: BlockTime, message: "Successfully BlockTime Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createBlockTime = async function (req, res, next) {
    try {
        if (req.body.end_time) {
            var et = timeToNum(req.body.end_time)
            req.body.end_time = numToTime(et - 1);
        }
        // Calling the Service function with the new object from the Request Body
        var createdBlockTime = await BlockTimeService.createBlockTime(req.body);

        // if (req.body.start_date && req.body.end_date) {

        //     var params = { location_id: req.body.location_id, start_date: req.body.start_date, end_date: req.body.end_date, type: 'blocktime' };
        //     var refData = await setAppointmentsListRefData(params);
        // }

        return res.status(200).json({ status: 200, flag: true, data: createdBlockTime, message: "Successfully Created BlockTime" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "BlockTime Creation was Unsuccesfull" })
    }
}

exports.updateBlockTime = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        if (req.body.end_time) {
            var et = timeToNum(req.body.end_time)

            const lastDigit2Str = String(et).slice(-1);
            const lastDigit2Num = Number(lastDigit2Str);
            if (lastDigit2Num == 0 || lastDigit2Num == 5) {
                req.body.end_time = numToTime(et - 1);
            }
        }
        var preBlockTime = await BlockTimeService.getBlockTime(req.body._id)

        var updatedBlockTime = await BlockTimeService.updateBlockTime(req.body)

        return res.status(200).json({ status: 200, flag: true, data: updatedBlockTime, message: "Successfully Updated BlockTime" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeEmployeeBlockTime = async function (req, res, next) {
    // console.log("removeEmployeeBlockTime ",req.body)
    // Id is necessary for the update
    if (!req.body._id && !req.body.employee_id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id and employee_id must be present" })
    }

    try {

        var preBlockTime = await BlockTimeService.getBlockTime(req.body._id)

        var deleteBlockData = await BlockTimeService.deleteBlockTime(req.body._id);

        if (preBlockTime && preBlockTime.start_date && preBlockTime.end_date) {
            var start_date = dateFormat(preBlockTime.start_date, "yyyy-mm-dd")
            var end_date = dateFormat(preBlockTime.end_date, "yyyy-mm-dd")
            var params = { location_id: preBlockTime.location_id, start_date: start_date, end_date: end_date, type: 'blocktime' };
            var refData = await setAppointmentsListRefData(params);
        }


        return res.status(200).json({ status: 200, flag: true, data: updatedBlockTime, message: "Successfully Updated BlockTime" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeBlockTime = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {

        var preBlockTime = await BlockTimeService.getBlockTime(id)

        var deleted = await BlockTimeService.deleteBlockTime(id);

        if (preBlockTime && preBlockTime.start_date && preBlockTime.end_date) {
            var start_date = dateFormat(preBlockTime.start_date, "yyyy-mm-dd")
            var end_date = dateFormat(preBlockTime.end_date, "yyyy-mm-dd")
            var params = { location_id: preBlockTime.location_id, start_date: start_date, end_date: end_date, type: 'blocktime' };
            var refData = await setAppointmentsListRefData(params);
        }


        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}