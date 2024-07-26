var moment = require('moment')
var UserService = require('../services/user.service')
var CustomerService = require('../services/customer.service')
var BlockTimeService = require('../services/blockTime.service')
var ServiceService = require('../services/service.service')
var LocationService = require('../services/location.service')
var LocationTimingService = require('../services/locationTiming.service')
var AppointmentService = require('../services/appointment.service')
var AppListRefService = require('../services/appListRef.service')
var CategoryService = require('../services/category.service')
var ConsultantFormService = require('../services/consultantForm.service')
var EmployeeNumberLog = require('../services/employeeNumberLog.service')
var EmployeeFilterLog = require('../services/employeeFilterLog.service')
var EmployeeTimingService = require('../services/employeeTiming.service')
var DashboardRefService = require('../services/dashboardRef.service')
var MachineService = require('../services/machine.service')

var dateFormat = require('dateformat')
var ObjectId = require('mongodb').ObjectId


const inRange = function (x, min, max) {
    return ((x - min) * (x - max) <= 0)
}

const timeToNum = function (time) {
    // console.log('timeToNum time >> ', time)
    var matches = time.match(/(\d\d):(\d\d)/)
    //console.log('matches',matches)
    return parseInt(60 * matches[1]) + parseInt(matches[2])
} // ex: 10:05 = 60*10+05 = 605

const numToTime = function (num) {
    //console.log('num',num)
    m = num % 60;
    h = parseInt(num / 60);
    //console.log('m',m)
    //console.log('h',h)
    return (h > 9 ? h : "0" + h) + ":" + (m > 9 ? m : "0" + m);
} //ex: $num=605 605%60 == 5 ,605/60 == 10  return 10:05

const isObjEmpty = (obj) => Object.keys(obj).length === 0

const formatDate = (date = "", format = "MM-DD-YYYY") => {
    if (!date) {
        date = new Date()
    }

    return moment(new Date(date)).format(format)
}

const isValidJson = function (string = "") {
    let valid = false
    try {
        JSON.parse(string)
        valid = true
    } catch (error) {
        valid = false
        console.log('>>>>: helper/index.js : isValidJson -> error', error)
    }

    return valid
}

const getRandPswd = function () {
    return Math.random().toString(36).slice(-8)
}

const get4DigitCode = function () {
    return Math.floor(1000 + Math.random() * 9000)
}

const getDecimalFormat = (value = 0) => {
    if (value) {
        return parseFloat(value).toFixed(2)
    }

    return "0.00"
}

// Calculate Percentage
const calPercentage = function (num = 0, per = 0) {
    try {
        const result = (num / 100) * per
        return getDecimalFormat(result)
    } catch (error) {
        console.log('>>>>: helper/index.js : calPercentage -> error', error)
        return 0.00
    }
}

// for Generate datetime unique id
const generateUniqueId = function () {
    var uid = JSON.stringify(Date.now() + Math.random())
    uid = uid.replace(/\./g, '')
    return uid
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

const increaseDateDays = function (date = null, days = 0, format = "") {
    if (!date) {
        date = new Date()
    }

    var increasedDate = moment(date).add(days, 'day')
    if (format) {
        increasedDate = increasedDate.format(format)
    }

    return increasedDate || null
}

const arrayContainsAll = function (matchArr = [], mainArr = []) {
    for (let i = 0; i < matchArr.length; i++) {
        if (mainArr.indexOf(matchArr[i]?.toString()) == -1) {
            return false
        }
    }

    return true
}

const isArrayContainingObject = function (arrayData = [], field = "_id") {
    var isArrObject = false
    if (arrayData && arrayData.length) {
        isArrObject = arrayData.some(element => {
            if (element && element[field]) {
                return true
            }

            return false
        })
    }

    return isArrObject
}

const checkTimeBetween = function (time) {
    let timing = time;
    if ((time >= 0) && time <= 14) {
        timing = '00';
    } else if (time >= 15 && time <= 29) {
        timing = 15;
    } else if (time >= 30 && time <= 44) {
        timing = 30;
    } else if (time >= 45 && time <= 59) {
        timing = 45;
    }
    return timing;
}

const between = function (x, min, max) {
    return x >= min && x <= max;
}

const checkInvTimeBetween = function (start_time, end_time) {
    var start_time_split = start_time.split(':');
    var end_time_split = end_time.split(':');
    var times = [];
    var quarterHours = ["00", "15", "30", "45"];

    var endtime = parseInt(end_time_split[0]) + 1;
    var enttimes = end_time_split[0] + ":" + end_time_split[1];

    for (var t = start_time_split[0]; t < endtime; t++) {
        for (var j = 0; j < 4; j++) {
            var time = parseInt(t) + ":" + quarterHours[j];
            if (parseInt(t) > 9) {
                time = time;
            } else {
                time = '0' + time;
            }
            var ctime = timeToNum(time);
            var cst = timeToNum(start_time);
            var cet = timeToNum(enttimes);
            var isInRange = inRange(ctime, cst, cet);
            if (isInRange) {
                times.push(time);
            }
        }
    }
    return times;
}


let checker = (arr, target) => target.every(v => arr.includes(v));

async function checkAppListRefData(params) {
    try {
        var query = { location_id: params.location_id, date: params.date }
        var appListData = await AppListRefService.getAppListRefs(query);
        appListData.block_data = await getBlockTime(query)

        return appListData
    } catch (e) {
        return null
    }
}

async function getAppointmentsData(params) {
    try {
        var date = params.date;
        var client_query = {};
        var service_query = {};
        var query = { location_id: params.location_id };
        query['date'] = { $eq: date };
        var app = [];
        var appointment = await AppointmentService.getAppointmentSpecific(query);
        for (var i = 0; i < appointment.length; i++) {
            var ser = appointment[i].service_id;
            var cat = [];

            if (appointment[i].service_id && appointment[i].service_id.length > 0) {
                if (appointment[i].service_id[0] && ((typeof appointment[i].service_id[0] === 'string' || appointment[i].service_id[0] instanceof String))) {
                    service_query['_id'] = { $in: appointment[i].service_id };
                    var service = await ServiceService.getServiceSpecific(service_query);
                    appointment[i].service_id = service; //services with name and price
                    cat = service.map(s => s.category_id);

                    cat = Array.from(new Set(cat));
                }
            }

            var consultant_data = await ConsultantFormService.getConsultantFormsSpecific({ booking_id: appointment[i]._id });

            if (consultant_data && consultant_data.length) {
                if (consultant_data[0].status == 0) {
                    appointment[i].consultant_status = 1;
                } else if (consultant_data[0].before.length == 0 && consultant_data[0].customer_signature != '' && consultant_data[0].therapist_signature != '') {
                    appointment[i].consultant_status = 2;
                } else if (consultant_data[0].before.length == 0 && consultant_data[0].customer_signature != '' && consultant_data[0].therapist_signature == '') {
                    appointment[i].consultant_status = 1;
                } else if (consultant_data[0].before.length == 0 && consultant_data[0].customer_signature == '' && consultant_data[0].therapist_signature == '') {
                    appointment[i].consultant_status = 5;
                } else {
                    appointment[i].consultant_status = consultant_data[0].status;
                }

            } else {
                var con_query = { client_id: appointment[i].client_id[0], booking_id: { $ne: appointment[i]._id } };

                con_query['$or'] = [
                    { $and: [{ service_id: { $all: ser } }] },
                    { $and: [{ category_id: { $all: cat } }] },

                ];

                var consultant_data = await ConsultantFormService.getConsultantFormsSpecific(con_query);

                if (consultant_data.length > 0) {

                    appointment[i].consultant_status = 1;

                } else {
                    con_query['$or'] = [
                        { $and: [{ service_id: { $in: ser } }] },
                        { $and: [{ category_id: { $in: cat } }] }
                    ];

                    consultant_data = await ConsultantFormService.getConsultantFormsSpecific(con_query);

                    if (consultant_data.length) {
                        appointment[i].consultant_status = 4;
                    } else {
                        appointment[i].consultant_status = 0;
                    }

                }
            }

            client_query['_id'] = { $in: appointment[i].client_id };
            if (appointment[i].client_id && appointment[i].client_id[0]) {
                var client = await CustomerService.getClients(client_query);

                if (client && client.length > 0) {
                    var company_id = appointment[i].company_id ?? '';
                    if (!company_id || company_id == '') {
                        var locData = await LocationService.getLocation(params.location_id);
                        company_id = locData?.company_id
                    }
                    var i_ind = -1;
                    if (company_id && client[0].customer_icons) {
                        i_ind = client[0].customer_icons.findIndex(x => x.company_id == company_id)
                    }
                    if (i_ind > -1) {
                        client[0].customer_icon = client[0]?.customer_icons[i_ind]?.icon;
                    }
                }
                appointment[i].client_id = client; //with name
            }
            var gdata = [];

            appointment[i].group_data = appointment[i].service_data;

            if (appointment[i].group_data.length > 0) {
                for (var j = 0; j < appointment[i].group_data.length; j++) {

                    if (appointment[i].group_data[j].service_id && ((typeof appointment[i].group_data[j].service_id === 'string' || appointment[i].group_data[j].service_id instanceof String) || appointment[i].group_data[j].service_id.length > 0)) {

                        if ((typeof appointment[i].group_data[j].service_id === 'string' || appointment[i].group_data[j].service_id instanceof String)) {

                            appointment[i].group_data[j].service_id = [appointment[i].group_data[j].service_id]
                        }

                        service_query['_id'] = { $in: appointment[i].group_data[j].service_id };
                        var group_service = await ServiceService.getServiceSpecific(service_query);


                        appointment[i].group_data[j].service_id = group_service;
                        appointment[i].group_data[j].services = group_service;

                        if (j != 0 && appointment[i].group_data[j - 1]) {
                            if (appointment[i].group_data[j - 1].employee_id == appointment[i].group_data[j].employee_id) {

                                var e_ind = gdata.findIndex(x => x.employee_id?.toString() == appointment[i].group_data[j].employee_id?.toString());

                                if (e_ind == -1) {
                                    var gobj = {
                                        employee_id: appointment[i].group_data[j - 1].employee_id,
                                        end_time: appointment[i].group_data[j - 1].end_time,
                                        end_time_meridiem: appointment[i].group_data[j - 1].end_time_meridiem,
                                        services: appointment[i].group_data[j - 1].services,
                                        service_id: appointment[i].group_data[j - 1].service_id,
                                        start_time: appointment[i].group_data[j - 1].start_time,
                                        start_time_meridiem: appointment[i].group_data[j - 1].start_time_meridiem,
                                        service_name: '',
                                    };

                                    gdata.push(gobj);
                                }

                                if (e_ind > -1) {
                                    gdata[e_ind].end_time = appointment[i].group_data[j].end_time;
                                    gdata[e_ind].end_time_meridiem = appointment[i].group_data[j].end_time_meridiem;

                                    var services = appointment[i].group_data[j].service_id.map(s => s.name);
                                    if (gdata[e_ind].service_name != '') {
                                        gdata[e_ind].service_name += ', ' + services.join(', ');
                                    } else {
                                        gdata[e_ind].service_name += services.join(', ');
                                    }

                                }

                            } else {
                                var gobj = {
                                    employee_id: appointment[i].group_data[j].employee_id,
                                    end_time: appointment[i].group_data[j].end_time,
                                    end_time_meridiem: appointment[i].group_data[j].end_time_meridiem,
                                    services: appointment[i].group_data[j].services,
                                    service_id: appointment[i].group_data[j].service_id,
                                    start_time: appointment[i].group_data[j].start_time,
                                    start_time_meridiem: appointment[i].group_data[j].start_time_meridiem,
                                    service_name: group_service.map(s => s.name).join(', '), //group_service.name,
                                };


                                gdata.push(gobj);
                            }

                        } else {

                            var gobj = {
                                employee_id: appointment[i].group_data[j].employee_id,
                                end_time: appointment[i].group_data[j].end_time,
                                end_time_meridiem: appointment[i].group_data[j].end_time_meridiem,
                                services: appointment[i].group_data[j].services,
                                service_id: appointment[i].group_data[j].service_id,
                                start_time: appointment[i].group_data[j].start_time,
                                start_time_meridiem: appointment[i].group_data[j].start_time_meridiem,
                                service_name: group_service.map(s => s.name).join(', '),
                            };
                            gdata.push(gobj);
                        }
                    }
                }
                appointment[i].group_data = gdata;
            }

            var employee_id = appointment[i].service_data.map(s => s.employee_id);
            employee_id = Array.from(new Set(employee_id));
            if (employee_id.length > 1) {
                appointment[i].index_id = i + 1;
            }

            if (appointment[i].group_booking_ids && appointment[i].group_booking_ids.length > 0) {
                for (var j = 0; j < appointment[i].group_booking_ids.length; j++) {
                    var ind = appointment.findIndex(x => x._id?.toString() == appointment[i].group_booking_ids[j]?.toString());
                    if (ind > -1) {
                        appointment[ind].index_id = i + 1;
                        appointment[i].index_id = i + 1;
                    }
                }
            }

            if (client.length > 0) {
                app.push(appointment[i]);
            }
        }

        return app;
    } catch (e) {
        console.log(e)
        return null
    }
}

async function generateTimeSlot(today_start_time, today_end_time, end_time, start_time) {
    try {
        today_start_time = parseInt(today_start_time);
        var quarterHours = ["00", "15", "30", "45"];
        var times = [];
        for (var t = today_start_time; t <= today_end_time; t++) {
            for (var j = 0; j < 4; j++) {
                let time = t + ":" + quarterHours[j];

                if (t < 10) {
                    time = '0' + time;
                }
                if (today_end_time == t) {
                    if (end_time >= quarterHours[j]) {
                        times.push(time);
                    }

                } else {
                    times.push(time);
                }
            }
        }
        return times;

    } catch (e) {
        console.log(e)
        return null
    }
}

async function setAppObjectData(adata, service_data, is_unassign) {
    try {
        if (is_unassign) {
            service_data = service_data;
        } else {
            service_data = [service_data];
        }
        var source = '';
        if (adata.source_url == 'adorn.beauty') {
            adata.source_url = 'adornbeauty';
            source = 'Adorn.beauty';
        } else if (adata.source_url == 'adorn-beauty') {
            source = 'Adorn-beauty.com';
        } else if (adata.source_url == 'customer-adorn-mobile') {
            source = 'AppointGEM - Customer App';
        } else if (adata.source_url == 'calista-beauty') {
            source = 'Calista-beauty.com';
        } else if (adata.source_url == 'adorn' || adata.source_url == 'calista') {
            source = 'AppointGEM - Online';
        } else if (adata.source_url == 'adorn-admin' || adata.source_url == 'calista-admin') {
            source = 'AppointGEM - Offline';
        }

        var new_data = {
            _id: adata._id,
            client_id: adata.client_id,
            customer_icon: adata.customer_icon,
            service_data: adata.service_data,
            show_data: service_data,
            date: adata.date,
            comments: adata.comments,
            employee_comments: adata.employee_comments,
            total_price: adata.total_price,
            discounted_price: adata.discounted_price,
            price: adata.price,
            app_datetime: adata.app_datetime,
            front_booking: adata.front_booking,
            employee_name: adata.employee_name,
            start_time_meridiem: adata.start_time_meridiem,
            end_time_meridiem: adata.end_time_meridiem,
            consultant_status: adata.consultant_status,
            createdAt: adata.createdAt,
            createdDate: adata.createdDate,
            paid_amount: adata.paid_amount,
            remaining_amount: adata.remaining_amount,
            total_amount: adata.total_amount,
            grand_total: adata.grand_total,
            grand_total_price: adata.grand_total_price,
            grand_discounted_price: adata.grand_discounted_price,
            grand_final_price: adata.grand_final_price,
            index_id: adata.index_id,
            isMatchSlot: adata.isMatchSlot,
            appClass: adata.appClass,
            client_name: adata.client_name,
            service_name: adata.service_name,
            start_time_num: adata.start_time_num,
            end_time_num: adata.end_time_num,
            source_url: adata.source_url,
            source: source,
        };
        return new_data;
    } catch (e) {
        return null
    }
}

async function generateTableTimeSlot(params) {
    try {
        //console.log('params.date before',params.date)
        var today_timing = params.today_timing;
        var times = params.times;
        var allEmpTiming = params.allEmpTiming;
        var allEmployees = params.allEmployees;
        var app_data = params.app_data;
        var block_data = params.block_data;
        var todayStartTime = today_timing.start_time;
        var todayEndTime = today_timing.end_time;
        var filter_employees = params.filter_employees;

        var tableData = [];
        var showUnassign = false;
        for (var t = 0; t < times.length; t++) {
            var timeNum = timeToNum(times[t]);

            var showTimeSpilt = times[t].split(':');
            let min = showTimeSpilt[1];
            let hour = showTimeSpilt[0];
            hour = hour > 12 ? hour - 12 : hour;
            showTimeSpilt[0] = (hour + '').length == 1 ? '0' + hour : hour;

            var showTime = showTimeSpilt.join(':');
            tableData.push({ time: times[t], showTime: showTime, timeNum: timeNum, nextTimeNum: Number(timeNum) + 15, data: [] })
            if (allEmployees && allEmployees.length > 0) {

                for (var e = 0; e < allEmployees.length; e++) {

                    var obj = { employee_id: allEmployees[e]._id, data: [], isBlockMatchSlot: false, isMatchSlot: false, appClass: '', editCase: false, blocktime: [], is_block: false, is_unassign: false };

                    for (var a = 0; a < app_data.length; a++) { //appointmnet
                        new_data = {};
                        var adata = app_data[a];

                        var emp_arr = [];
                        var is_unassign = false;
                        if (app_data[a].group_data && app_data[a].group_data.length > 0) {
                            var emp_grp_arr = app_data[a].group_data.map(s => s.employee_id);
                            emp_arr = emp_arr.concat(emp_grp_arr);

                            let isFounded = emp_grp_arr.some(ai => filter_employees.includes(ai));

                            if (emp_grp_arr.indexOf('') != -1) {
                                is_unassign = true;
                            } else if (filter_employees && filter_employees.length > 0 && allEmployees[e]._id == '' && !isFounded) {
                                is_unassign = true;
                            }
                        }

                        var unique_emp_arr = emp_arr.filter((x, i) => i === emp_arr.indexOf(x));

                        var eeId = '' + (allEmployees[e]._id);
                        //console.log('unique_emp_arr',unique_emp_arr,eeId,unique_emp_arr.indexOf(allEmployees[e]._id))

                        if ((unique_emp_arr.indexOf(eeId?.toString()) != -1) || (is_unassign)) {

                            var time_split = app_data[a].start_time.split(':');
                            time_split[1] = await checkTimeBetween(time_split[1]);
                            var tm = time_split.join(':');
                            var className = 'bg-info text-white calendar-box1';

                            adata.isMatchSlot = false;

                            if (app_data[a].extended_time && timeToNum(app_data[a].extended_time) > timeToNum(app_data[a].end_time)) {
                                app_data[a].end_time = app_data[a].extended_time ? app_data[a].extended_time : app_data[a].end_time;
                            }
                            var ctime = timeToNum(times[t]);
                            var cst = timeToNum(app_data[a].start_time);
                            var cet = timeToNum(app_data[a].end_time) + 1;
                            var isInRange = inRange(ctime, cst, cet);

                            if ((times[t] == tm || isInRange && cet > ctime) || cst >= ctime && cst < (ctime) + 15) {

                                let sgi = app_data[a].group_data.filter(item => item.employee_id.indexOf(allEmployees[e]?._id?.toString()) != -1);
                                if (sgi.length > 0 && (app_data[a].booking_status != 'no_shows' && app_data[a].booking_status != 'cancel')) {
                                    for (var gi = 0; gi < sgi.length; gi++) {
                                        var ctime = timeToNum(times[t]);
                                        var cst = timeToNum(sgi[gi].start_time);
                                        var cet = timeToNum(sgi[gi].end_time) + 1;
                                        var isInRange = inRange(ctime, cst, cet);

                                        if ((isInRange && cet > ctime) || cst >= ctime && cst < (ctime) + 15) {
                                            obj.editCase = true;
                                        }
                                    }
                                }
                                if (app_data[a].booking_status == 'complete') {
                                    className = 'bg-success text-white';
                                } else if (app_data[a].booking_status == 'no_shows') {
                                    className = 'bg-warning text-white';
                                } else if (app_data[a].booking_status == 'cancel') {
                                    className = 'bg-primary text-white';
                                }

                                if (app_data[a].booking_status == 'pending' && app_data[a].front_booking != "true") {
                                    className = 'bg-purple text-white';
                                }
                                adata.appClass = className;

                                var client_name = '';
                                for (var c = 0; c < app_data[a].client_id.length; c++) {
                                    if (c == 0) {
                                        client_name += app_data[a].client_id[c].name;
                                    } else {
                                        client_name += ', ' + app_data[a].client_id[c].name;
                                    }
                                }
                                adata.client_name = client_name;
                                var service_name = '';
                                if (app_data[a].service_id) {
                                    for (var s = 0; s < app_data[a].service_id.length; s++) {
                                        if (app_data[a].service_id[s]) {
                                            if (s == 0) {
                                                service_name += app_data[a].service_id[s].name;
                                            } else {
                                                service_name += ', ' + app_data[a].service_id[s].name;
                                            }
                                        }
                                    }
                                }

                                var g = -1;
                                for (var sg = 0; sg < app_data[a].group_data.length; sg++) {
                                    var ctime = timeToNum(times[t]);
                                    var cst = timeToNum(app_data[a].group_data[sg].start_time);

                                    var time_split = app_data[a].group_data[sg].start_time.split(':');
                                    time_split[1] = checkTimeBetween(time_split[1]);
                                    var tm2 = time_split.join(':');

                                    if (times[t] == tm2 && allEmployees[e]?._id?.toString() == app_data[a].group_data[sg].employee_id) {
                                        g = sg;
                                    } else {
                                        g = -1;
                                    }

                                    if (is_unassign && allEmployees[e]._id == '') {
                                        adata.start_time_num = timeToNum(app_data[a].start_time);
                                        adata.end_time_num = timeToNum(app_data[a].end_time) + 1;
                                        adata.emp_name = "Unassign";

                                        for (let esg = 0; esg < adata.group_data.length; esg++) {
                                            adata.group_data[esg].emp_name = "Unassign";
                                        }

                                        var ctime = timeToNum(times[t]);
                                        var cst = timeToNum(app_data[a].start_time);
                                        var cet = timeToNum(app_data[a].end_time) + 1;
                                        var isInRange = inRange(ctime, cst, cet);

                                        if ((times[t] == app_data[a].start_time || times[t] == tm2) && ((isInRange && cet > ctime) || cst >= ctime && cst < (ctime) + 15)) {
                                            obj.isMatchSlot = true;
                                            obj.editCase = true;

                                            new_data = await setAppObjectData(adata, adata.group_data, is_unassign);
                                            obj.data.push(new_data);
                                            //obj.data.push(adata);

                                        }
                                    }

                                    if (g > -1) {

                                        let e_ind = allEmployees.findIndex(x => x._id == app_data[a].group_data[g].employee_id);
                                        adata.group_data[g].emp_name = '';

                                        adata.group_data[g].start_time_num = timeToNum(app_data[a].group_data[g].start_time);

                                        adata.group_data[g].end_time_num = timeToNum(app_data[a].group_data[g].end_time) + 1;

                                        if (e_ind > -1) {
                                            adata.group_data[g].emp_name = allEmployees[e_ind].name;
                                        } else {
                                            adata.group_data[g].emp_name = "Unassign";
                                        }

                                        var ctime = timeToNum(times[t]);
                                        var cst = timeToNum(app_data[a].group_data[g].start_time);
                                        var cet = timeToNum(app_data[a].group_data[g].end_time) + 1;
                                        var isInRange = inRange(ctime, cst, cet);

                                        if ((isInRange && cet > ctime) || cst >= ctime && cst < (ctime) + 15) {
                                            obj.editCase = true;
                                        }

                                        if (app_data[a].booking_status == 'no_shows' || app_data[a].booking_status == 'cancel') {
                                            //obj.editCase=true;
                                            if (times[t] == app_data[a].group_data[g].start_time || times[t] == tm2) {
                                                obj.editCase = true;
                                            } else {
                                                obj.editCase = false;
                                            }
                                        }

                                        if ((times[t] == app_data[a].group_data[g].start_time || times[t] == tm2) && ((isInRange && cet > ctime) || cst >= ctime && cst < (ctime) + 15)) {
                                            obj.isMatchSlot = true;
                                            obj.editCase = true;

                                            if (obj.editCase) {
                                                if (app_data[a].group_data[g].service_id) {
                                                    adata.service = app_data[a].group_data[g].service_id.map(s => s._id);
                                                }

                                                adata.start_time_num = timeToNum(app_data[a].group_data[g].start_time);

                                                adata.end_time_num = timeToNum(app_data[a].group_data[g].end_time) + 1;

                                                new_data = await setAppObjectData(adata, adata.group_data[g]);
                                            }
                                        }

                                        if (new_data && (Object.keys(new_data).length > 0)) {
                                            let b_ind = obj.data.findIndex(x => x._id == new_data._id);
                                            if (b_ind == -1) {
                                                obj.data.push(new_data);
                                            }
                                        }

                                    }

                                } //sd for loop

                            }

                        }
                    }

                    let e_ind = allEmpTiming.findIndex(x => x.employee_id == allEmployees[e]._id);

                    if (e_ind != -1 && allEmpTiming[e_ind].shift_end_time != "00:00") {
                        var ct = timeToNum(times[t]);
                        var shift_start_time = timeToNum(allEmpTiming[e_ind].shift_start_time);
                        var shift_end_time = timeToNum(allEmpTiming[e_ind].shift_end_time);

                        if (!between(ct, shift_start_time, shift_end_time - 15)) {
                            obj.is_block = true;
                        }
                        if (allEmpTiming[e_ind].sec_shift_start_time != "" && allEmpTiming[e_ind].sec_shift_end_time != "") {
                            var shift_start_time = timeToNum(allEmpTiming[e_ind].sec_shift_start_time);
                            var shift_end_time = timeToNum(allEmpTiming[e_ind].sec_shift_end_time);
                            if (obj.is_block && !between(ct, shift_start_time, shift_end_time)) {
                                obj.is_block = true;
                            } else {
                                obj.is_block = false;
                            }
                        }
                    } else if (todayStartTime && todayEndTime) {
                        var ct = timeToNum(times[t]);
                        var shift_start_time = timeToNum(todayStartTime);
                        var shift_end_time = timeToNum(todayEndTime);

                        if (!between(ct, shift_start_time, shift_end_time - 15)) {
                            obj.is_block = true;
                        }
                    }

                    if (block_data && block_data.length > 0) {
                        for (var b = 0; b < block_data.length; b++) { //block timing
                            var block_emp_id = block_data[b].employee_id;

                            let e_index = block_emp_id.findIndex(x => x == allEmployees[e]?._id?.toString());

                            if (e_index != -1 || block_data[b].employee_all == 1) {
                                var time_arr = await checkInvTimeBetween(block_data[b].start_time, block_data[b].end_time);

                                for (var timea = 0; timea < time_arr.length; timea++) {
                                    var time_split = time_arr[timea].split(':');
                                    var time = time_split[1];
                                    time = parseInt(time)

                                    let timing = time;
                                    if ((time >= 0) && time <= 14) {
                                        timing = '00';
                                    } else if (time >= 15 && time <= 29) {
                                        timing = 15;
                                    } else if (time >= 30 && time <= 44) {
                                        timing = 30;
                                    } else if (time >= 45 && time <= 59) {
                                        timing = 45;
                                    }
                                    time_split[1] = (timing);
                                    var tm = time_split.join(':');
                                    if (timeToNum(times[t]) == timeToNum(tm) && timeToNum(block_data[b].end_time) > timeToNum(times[t])) {
                                        if (timea == 0) {
                                            obj.isBlockMatchSlot = true;
                                        }
                                        obj.is_block = true;
                                        obj.blocktime.push(block_data[b])
                                    }
                                }
                            }
                        }
                    }

                    if (obj.employee_id == '' && obj.data.length > 0) {
                        showUnassign = true;
                    }
                    tableData[t].data.push(obj)
                }
            }
        }
        if (!showUnassign && allEmployees) {
            allEmployees = allEmployees.filter(item => (item._id != ''));
            tableData = tableData.map(({ ...el }) => {
                el.data = el.data.filter(function (o) { return o.employee_id != ''; })
                return el;
            });
        }
        //console.log('allEmployees 123',allEmployees.length)
        var reqData = { location_id: params.location_id, date: params.date, employee: allEmployees, tableData: tableData };
        if (params.location_id && params.date && tableData && tableData.length > 0) {

            await AppListRefService.deleteMultiple({ location_id: params.location_id, date: params.date });
            await AppListRefService.createAppListRef(reqData);
        }

        return tableData
    } catch (e) {
        console.log(e)
        return null
    }
}

async function getTodayTiming(params) {
    try {
        date = params.date;
        var dateObj = new Date(date);
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
        weekday = weekday.toLowerCase();
        var today_timing = {};
        if (weekday && params.location_id) {
            var location = await LocationService.getLocation(params.location_id);
            today_timing = await LocationTimingService.getSpecificLocationTimings(params.location_id, weekday); //get location time by day name

            if (location?.group_special_hours && location?.group_special_hours.length > 0) {
                var ind = location?.group_special_hours.findIndex(x => date >= dateFormat(x.special_hour_start_date, "yyyy-mm-dd") && date <= dateFormat(x.special_hour_end_date, "yyyy-mm-dd"));
                if (ind != -1) {
                    today_timing.start_time = location?.group_special_hours[ind].special_hour_from_time;

                    today_timing.end_time = location?.group_special_hours[ind].special_hour_end_time;
                }
            }

        }

        return today_timing
    } catch (e) {
        console.log(e)
        return null
    }
}

async function getAvailableEmployee(params) {
    try {
        var users = []
        var order_by = params?.order_by ? params.order_by : '';
        var allEmpQuery = { status: 1 }
        var query = { status: 1, is_employee: 1 }

        if (params.location_id && params.location_id != 'undefined') {
            query['location_id'] = params.location_id
        }

        if (params.employees && params.employees.length > 0) {
            query['_id'] = { $nin: params.employees }
        }

        if (params.employee_id && params.employee_id != 'undefined') {
            query['_id'] = params.employee_id?.toString()
        }

        var filter_employees = params.filter_employees ? params.filter_employees : []

        var date = params.date
        var dateObj = new Date(date)
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }) // get day name
        weekday = weekday?.toLowerCase() || ""
        var close_day = false
        var close_day_name = ''

        var location = await LocationService.getLocation(params.location_id)
        if (location?.group_close_days && location?.group_close_days.length > 0) {
            var ind = location?.group_close_days.findIndex(x => date >= dateFormat(x.close_day_start_date, "yyyy-mm-dd") && date <= dateFormat(x.close_day_end_date, "yyyy-mm-dd"))
            if (ind != -1) {
                close_day = true
                close_day_name = location?.group_close_days[ind].close_day_name
            }
        }

        // var fquery = { location_id: params.location_id, date: params.date }
        // var getFilterData = await EmployeeFilterLog.getEmployeeFilterLogsSpecific(fquery)
        // if (getFilterData.length > 0) {
        //     var eQuery = { _id: { $in: getFilterData[0].employee_ids } }
        //     var emp = await UserService.getAvilEmployees(eQuery)
        //     filter_employees = getFilterData[0].employee_ids
        //     getFilterData[0].employee_ids = emp // with name
        //     params.order_by = "user_order"
        // }

        var on_leave_emp = [];
        if (params.is_available == 1 && !close_day) {
            var off_day_emp = await EmployeeTimingService.getEmployeeAllTimings({
                location_id: params.location_id,
                day: weekday,
                //days_off:{$eq:1},
                $or: [
                    { $and: [{ repeat: { $eq: 'weekly' } }, { end_repeat: { $eq: 'ongoing' } }, { date: { $lte: date } }] },
                    { $and: [{ repeat: { $eq: '' } }, { date: { $eq: date } }] },
                    { $and: [{ end_repeat: { $eq: 'date' } }, { date: { $lte: date } }, { repeat_specific_date: { $gte: date } }] }
                ]
            })

            var result_emp = []
            var off_day_emp_arr = []
            var off_day_emp_filter = []

            var result_emp = off_day_emp.reduce((unique, o) => {
                if (!unique.some(obj => obj.employee_id === o.employee_id)) {
                    unique.push(o)
                }
                return unique
            }, [])

            off_day_emp = result_emp;

            if (off_day_emp.length > 0) {
                off_day_emp_arr = off_day_emp.map(s => s.employee_id)
            }

            for (var oemp = 0; oemp < off_day_emp_arr.length; oemp++) {
                var em_id = off_day_emp[oemp].employee_id;
                var pri_ind = off_day_emp.findIndex(x => x.employee_id == em_id)
                if (pri_ind > -1) {
                    if (off_day_emp[pri_ind].days_off == 1) {
                        off_day_emp_filter.push(off_day_emp[pri_ind])
                    }
                }
            }

            if (off_day_emp_filter.length > 0) {
                on_leave_emp = off_day_emp_filter.map(s => s.employee_id)
            }

            if (on_leave_emp.length > 0) {
                if (params.employees && params.employees.length > 0) {
                    on_leave_emp = on_leave_emp.concat(params.employees)
                }

                allEmpQuery['_id'] = { $nin: on_leave_emp }
                if (filter_employees && filter_employees.length > 0) {
                    query['$and'] = [{ _id: { $in: filter_employees } }, { _id: { $nin: on_leave_emp } }]
                } else {
                    query['_id'] = { $nin: on_leave_emp }
                }
            } else {
                if (filter_employees && filter_employees.length > 0) {
                    query['_id'] = { $in: filter_employees }
                }
            }
        }

        users = await UserService.getAvilEmployees(query, order_by)

        for (var i = 0; i < users.length; i++) {
            var query = { location_id: params.location_id, employee_id: users[i]._id?.toString(), date: params.date }
            var getData = await EmployeeNumberLog.getEmployeeNumberLogsSpecific(query)
            let e_ind = -1;
            if (result_emp) {
                e_ind = result_emp.findIndex(x => x.employee_id == users[i]._id)
            }
            if (e_ind != -1 && result_emp[e_ind].shift_end_time != "00:00") {
                users[i].shift_start_time = result_emp[e_ind].shift_start_time
                users[i].shift_end_time = result_emp[e_ind].shift_end_time
                users[i].sec_shift_start_time = result_emp[e_ind].sec_shift_start_time
                users[i].sec_shift_end_time = result_emp[e_ind].sec_shift_end_time
            }

            if (getData.length > 0) {
                users[i].user_order = getData[0].user_order
            } else {
                users[i].user_order = 0
            }
        }

        users.sort((a, b) => parseInt(a.user_order) - parseInt(b.user_order))

        // var unEmp = { _id: "", first_name: "Unassign" };
        // users.push(unEmp);

        return { users: users, allEmpTiming: result_emp };
    } catch (e) {
        console.log(e)
        return null;
    }
}

async function getBlockTime(params) {
    try {
        var date = params.date;
        var dateObj = new Date(date);
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
        weekday = weekday.toLowerCase();
        var block_times = await BlockTimeService.getBlockSpecific(
            {
                location_id: params.location_id,
                status: 1,
                $or: [
                    { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
                    { $and: [{ start_date: { $lte: date } }, { end: { $eq: 'always' } }] }
                ]
            });


        for (var i = 0; i < block_times.length; i++) {
            var week_days = block_times[i].every_week;
            if (block_times[i].repeat == 'every_week' && week_days) {
                var index = week_days.map(function (e) { return e; }).indexOf(weekday); //check service types 
                if (index != -1) {
                } else {
                    block_times.splice(i, 1);
                }
            }
        }

        for (var i = 0; i < block_times.length; i++) {
            var alternate_day = block_times[i].alternate_day;

            if (block_times[i].repeat == 'every_alternate_week' && alternate_day) {
                var index = alternate_day.map(function (e) { return e; }).indexOf(weekday); //check service types 
                if (index != -1) {
                } else {
                    block_times.splice(i, 1);
                }
            }
        }

        for (var i = 0; i < block_times.length; i++) {
            var employee_id = block_times[i].employee_id;
            var q = { _id: { $in: employee_id } };
            var employee = await UserService.getEmployeeSpecific(q); // for replace service name
            block_times[i].employee_list = employee; //replace service name
        }

        return block_times
    } catch (e) {
        console.log(e)
        return null
    }
}

async function setAppListTableData(params) {
    try {
        var today_timing = await getTodayTiming(params)

        var today_start_time_split = today_timing.start_time.split(':');
        var today_end_time_split = today_timing.end_time.split(':');

        var today_start_time = today_start_time_split[0];
        var today_end_time = today_end_time_split[0];

        if (!today_start_time) {
            today_start_time = 1;
        }
        if (!today_end_time) {
            today_end_time = 25;
        }

        var times = await generateTimeSlot(today_start_time, today_end_time, today_end_time_split[1], today_start_time_split[1])

        var empData = await getAvailableEmployee(params)

        var availEmp = empData?.users;
        var allEmpTiming = empData?.allEmpTiming;
        var block_data = await getBlockTime(params)
        var app_data = await getAppointmentsData(params)

        var paramData = {
            date: params.date,
            location_id: params.location_id,
            today_timing: today_timing,
            times: times,
            allEmployees: availEmp,
            block_data: block_data,
            app_data: app_data,
            allEmpTiming: allEmpTiming,
            filter_employees: params.filter_employees
        }
        var appListData = await generateTableTimeSlot(paramData)

        return { employee: availEmp, tableData: appListData }
    } catch (e) {
        console.log(e)
        return null
    }
}

async function getBookingData(appData, availEmp) {
    try {
        var bookingData = [];
        if (appData && appData.length > 0) {
            for (var u = 0; u < availEmp.length; u++) {
                var obj = { emp: availEmp[u], appData: [] }
                var empApp = [];
                var empApp1 = appData.map(({ ...el }) => {

                    var service_data = el.service_data.filter(function (o) { return o["employee_id"] == availEmp[u]._id });
                    if (service_data && service_data.length > 0) {
                        el.show_data = service_data;
                        empApp.push(el);
                    }
                    return el;

                }) // Filter before questions 

                obj.appData = empApp;
                bookingData.push(obj)
            }
        } else {
            if (availEmp && availEmp.length > 0) {
                for (var u = 0; u < availEmp.length; u++) {
                    var obj = { emp: availEmp[u], appData: [] }
                    bookingData.push(obj)
                }
            }

        }

        return bookingData;
    } catch (e) {
        console.log(e)
        return null;
    }
}

async function updateAppListTableData(params) {
    try {
        var type = params.type;
        //var params = { location_id: location_id.toString, employee_id: '', date: date,  order_by: 'user_order', is_employee: 1, is_available: 1,type:'booking' };
        //type = booking|blocktime|emp_timing|consultation
        var query = { location_id: params.location_id, date: params.date }
        var appListData = await AppListRefService.getAppListRefs(query);
        if (appListData && type) {
            if (type == 'booking' || type == 'emp_timing' || type == 'consultation') {
                var empData = await getAvailableEmployee(params);
                var availEmp = empData?.users;
                var app_data = await getAppointmentsData(params);
                var bookingData = await getBookingData(app_data, availEmp);

                var reqData = { _id: appListData._id, employee: availEmp, bookingData: bookingData, }

                var refData = await AppListRefService.updateAppListRef(reqData);
            } else if (type == 'blocktime') {

                var block_data = await getBlockTime(params)
                var reqData = { _id: appListData._id, block_data: block_data };
                var refData = await AppListRefService.updateAppListRef(reqData);
            }
        } else {
            var today_timing = await getTodayTiming(params)
            var empData = await getAvailableEmployee(params)
            var availEmp = empData?.users;
            var allEmpTiming = empData?.allEmpTiming;
            var block_data = await getBlockTime(params)
            var app_data = await getAppointmentsData(params)

            var bookingData = await getBookingData(app_data, availEmp);

            if (params.location_id && params.date) {

                await AppListRefService.deleteMultiple({ location_id: params.location_id, date: params.date });
                var reqData = { location_id: params.location_id, date: params.date, today_timing: today_timing, bookingData: bookingData, block_data: block_data, employee: availEmp }
                await AppListRefService.createAppListRef(reqData);
            }
        }

        return refData;
    } catch (e) {
        console.log(e)
        return null
    }
}

async function generateTableTimeSlotNew(data, params) {
    try {
        var today_timing = data.today_timing;
        var today_start_time;
        var today_end_time;
        var today_start_time_split;
        var today_end_time_split;
        if (!today_timing) {
            today_timing = await getTodayTiming(params)
        }
        if (today_timing) {
            today_start_time_split = today_timing?.start_time.split(':');
            today_end_time_split = today_timing?.end_time.split(':');

            today_start_time = today_start_time_split[0];
            today_end_time = today_end_time_split[0];
        }

        if (!today_start_time) {
            today_start_time = 1;
        }
        if (!today_end_time) {
            today_end_time = 25;
        }
        var times = []
        if (today_end_time_split && today_start_time_split) {
            times = await generateTimeSlot(today_start_time, today_end_time, today_end_time_split[1], today_start_time_split[1]);
        }

        var empData = await getAvailableEmployee(params)
        var allEmpTiming = empData?.allEmpTiming;

        var allEmployees = data.bookingData;

        if (!data.bookingData || data.bookingData.length == 0) {

        }
        //var app_data = params.app_data;
        //var block_data = data?.block_data;
        var block_data = await getBlockTime(params)
        var todayStartTime = today_timing?.start_time;
        var todayEndTime = today_timing?.end_time;
        var filter_employees = [];

        var tableData = [];
        var showUnassign = false;
        for (var t = 0; t < times.length; t++) {
            var timeNum = timeToNum(times[t]);

            var showTimeSpilt = times[t].split(':');
            let min = showTimeSpilt[1];
            let hour = showTimeSpilt[0];
            hour = hour > 12 ? hour - 12 : hour;
            showTimeSpilt[0] = (hour + '').length == 1 ? '0' + hour : hour;

            var showTime = showTimeSpilt.join(':');
            tableData.push({ time: times[t], showTime: showTime, timeNum: timeNum, nextTimeNum: Number(timeNum) + 15, data: [] })
            if (allEmployees && allEmployees.length > 0) {

                for (var e = 0; e < allEmployees.length; e++) {

                    allEmployees[e]._id = allEmployees[e].emp._id;

                    var obj = { employee_id: allEmployees[e]._id, data: [], isBlockMatchSlot: false, isMatchSlot: false, appClass: '', editCase: false, blocktime: [], is_block: false, is_unassign: false };
                    var app_data = allEmployees[e].appData;

                    if (app_data && app_data.length > 0) {
                        for (var a = 0; a < app_data.length; a++) { //appointmnet
                            new_data = {};
                            var adata = app_data[a];

                            var emp_arr = [];
                            var is_unassign = false;
                            if (app_data[a].group_data && app_data[a].group_data.length > 0) {
                                var emp_grp_arr = app_data[a].group_data.map(s => s.employee_id);
                                emp_arr = emp_arr.concat(emp_grp_arr);

                                let isFounded = emp_grp_arr.some(ai => filter_employees.includes(ai));

                                if (emp_grp_arr.indexOf('') != -1) {
                                    is_unassign = true;
                                } else if (filter_employees && filter_employees.length > 0 && allEmployees[e]._id == '' && !isFounded) {
                                    is_unassign = true;
                                }
                            }

                            var unique_emp_arr = emp_arr.filter((x, i) => i === emp_arr.indexOf(x));

                            var eeId = '' + (allEmployees[e]._id);
                            //console.log('unique_emp_arr',unique_emp_arr,eeId,unique_emp_arr.indexOf(eeId.toString()))

                            if ((unique_emp_arr.indexOf(eeId?.toString()) != -1) || (is_unassign)) {

                                var time_split = app_data[a].start_time.split(':');
                                time_split[1] = await checkTimeBetween(time_split[1]);
                                var tm = time_split.join(':');
                                var className = 'bg-info text-white calendar-box1';

                                adata.isMatchSlot = false;

                                if (app_data[a].extended_time && timeToNum(app_data[a].extended_time) > timeToNum(app_data[a].end_time)) {
                                    app_data[a].end_time = app_data[a].extended_time ? app_data[a].extended_time : app_data[a].end_time;
                                }
                                var ctime = timeToNum(times[t]);
                                var cst = timeToNum(app_data[a].start_time);
                                var cet = timeToNum(app_data[a].end_time) + 1;
                                var isInRange = inRange(ctime, cst, cet);

                                if ((times[t] == tm || isInRange && cet > ctime) || cst >= ctime && cst < (ctime) + 15) {

                                    let sgi = app_data[a].group_data.filter(item => item.employee_id.indexOf(allEmployees[e]?._id?.toString()) != -1);

                                    if (sgi.length > 0 && (app_data[a].booking_status != 'no_shows' && app_data[a].booking_status != 'cancel')) {
                                        for (var gi = 0; gi < sgi.length; gi++) {
                                            var ctime = timeToNum(times[t]);
                                            var cst = timeToNum(sgi[gi].start_time);
                                            var cet = timeToNum(sgi[gi].end_time) + 1;
                                            var isInRange = inRange(ctime, cst, cet);

                                            if ((isInRange && cet > ctime) || cst >= ctime && cst < (ctime) + 15) {
                                                obj.editCase = true;
                                            }
                                        }
                                    }
                                    if (app_data[a].booking_status == 'complete') {
                                        className = 'bg-success text-white';
                                    } else if (app_data[a].booking_status == 'no_shows') {
                                        className = 'bg-warning text-white';
                                    } else if (app_data[a].booking_status == 'cancel') {
                                        className = 'bg-primary text-white';
                                    }

                                    if (app_data[a].booking_status == 'pending' && app_data[a].front_booking != "true") {
                                        className = 'bg-purple text-white';
                                    }
                                    adata.appClass = className;
                                    if (app_data[a].client_id && app_data[a].client_id.length) {
                                        adata.client_name = app_data[a].client_id[0].name;
                                    }

                                    var g = -1;
                                    for (var sg = 0; sg < app_data[a].group_data.length; sg++) {
                                        var ctime = timeToNum(times[t]);
                                        var cst = timeToNum(app_data[a].group_data[sg].start_time);

                                        var time_split = app_data[a].group_data[sg].start_time.split(':');
                                        time_split[1] = checkTimeBetween(time_split[1]);
                                        var tm2 = time_split.join(':');

                                        if (times[t] == tm2 && allEmployees[e]._id?.toString() == app_data[a].group_data[sg].employee_id) {
                                            g = sg;
                                        } else {
                                            g = -1;
                                        }

                                        if (is_unassign && allEmployees[e]._id == '') {
                                            adata.start_time_num = timeToNum(app_data[a].start_time);
                                            adata.end_time_num = timeToNum(app_data[a].end_time) + 1;
                                            adata.emp_name = "Unassign";

                                            for (let esg = 0; esg < adata.group_data.length; esg++) {
                                                adata.group_data[esg].emp_name = "Unassign";
                                            }

                                            var ctime = timeToNum(times[t]);
                                            var cst = timeToNum(app_data[a].start_time);
                                            var cet = timeToNum(app_data[a].end_time) + 1;
                                            var isInRange = inRange(ctime, cst, cet);

                                            if ((times[t] == app_data[a].start_time || times[t] == tm2) && ((isInRange && cet > ctime) || cst >= ctime && cst < (ctime) + 15)) {
                                                obj.isMatchSlot = true;
                                                obj.editCase = true;

                                                new_data = await setAppObjectData(adata, adata.group_data, is_unassign);
                                                obj.data.push(new_data);
                                                //obj.data.push(adata);

                                            }
                                        }

                                        if (g > -1) {

                                            let e_ind = allEmployees.findIndex(x => x._id == app_data[a].group_data[g].employee_id);
                                            adata.group_data[g].emp_name = '';

                                            adata.group_data[g].start_time_num = timeToNum(app_data[a].group_data[g].start_time);

                                            adata.group_data[g].end_time_num = timeToNum(app_data[a].group_data[g].end_time) + 1;

                                            if (e_ind > -1) {
                                                adata.group_data[g].emp_name = allEmployees[e_ind].name;
                                            } else {
                                                adata.group_data[g].emp_name = "Unassign";
                                            }

                                            var ctime = timeToNum(times[t]);
                                            var cst = timeToNum(app_data[a].group_data[g].start_time);
                                            var cet = timeToNum(app_data[a].group_data[g].end_time) + 1;
                                            var isInRange = inRange(ctime, cst, cet);

                                            if ((isInRange && cet > ctime) || cst >= ctime && cst < (ctime) + 15) {
                                                obj.editCase = true;
                                            }

                                            if (app_data[a].booking_status == 'no_shows' || app_data[a].booking_status == 'cancel') {
                                                //obj.editCase=true;
                                                if (times[t] == app_data[a].group_data[g].start_time || times[t] == tm2) {
                                                    obj.editCase = true;
                                                } else {
                                                    obj.editCase = false;
                                                }
                                            }

                                            if ((times[t] == app_data[a].group_data[g].start_time || times[t] == tm2) && ((isInRange && cet > ctime) || cst >= ctime && cst < (ctime) + 15)) {
                                                obj.isMatchSlot = true;
                                                obj.editCase = true;

                                                if (obj.editCase) {
                                                    if (app_data[a].group_data[g].service_id) {
                                                        adata.service = app_data[a].group_data[g].service_id.map(s => s._id);
                                                    }

                                                    adata.start_time_num = timeToNum(app_data[a].group_data[g].start_time);

                                                    adata.end_time_num = timeToNum(app_data[a].group_data[g].end_time) + 1;

                                                    new_data = await setAppObjectData(adata, adata.group_data[g]);
                                                }
                                            }

                                            if (new_data && (Object.keys(new_data).length > 0)) {
                                                let b_ind = obj.data.findIndex(x => x._id == new_data._id);
                                                if (b_ind == -1) {
                                                    obj.data.push(new_data);
                                                }
                                            }

                                        }

                                    } //sd for loop

                                }

                            }
                        }
                    }
                    let e_ind = -1;
                    if (allEmpTiming && allEmpTiming.length) {
                        e_ind = allEmpTiming.findIndex(x => x.employee_id == allEmployees[e]._id);
                    }

                    if (e_ind != -1 && allEmpTiming[e_ind].shift_end_time != "00:00") {
                        var ct = timeToNum(times[t]);
                        var shift_start_time = timeToNum(allEmpTiming[e_ind].shift_start_time);
                        var shift_end_time = timeToNum(allEmpTiming[e_ind].shift_end_time);

                        if (!between(ct, shift_start_time, shift_end_time - 15)) {
                            obj.is_block = true;
                        }
                        if (allEmpTiming[e_ind].sec_shift_start_time != "" && allEmpTiming[e_ind].sec_shift_end_time != "") {
                            var shift_start_time = timeToNum(allEmpTiming[e_ind].sec_shift_start_time);
                            var shift_end_time = timeToNum(allEmpTiming[e_ind].sec_shift_end_time);
                            if (obj.is_block && !between(ct, shift_start_time, shift_end_time)) {
                                obj.is_block = true;
                            } else {
                                obj.is_block = false;
                            }
                        }
                    } else if (todayStartTime && todayEndTime) {
                        var ct = timeToNum(times[t]);
                        var shift_start_time = timeToNum(todayStartTime);
                        var shift_end_time = timeToNum(todayEndTime);

                        if (!between(ct, shift_start_time, shift_end_time - 15)) {
                            obj.is_block = true;
                        }
                    }

                    if (block_data && block_data.length > 0 && allEmployees[e]._id) {
                        for (var b = 0; b < block_data.length; b++) { //block timing
                            var block_emp_id = block_data[b].employee_id;

                            let e_index = block_emp_id.findIndex(x => x == allEmployees[e]._id?.toString());

                            if (e_index != -1 || block_data[b].employee_all == 1) {
                                var time_arr = await checkInvTimeBetween(block_data[b].start_time, block_data[b].end_time);

                                for (var timea = 0; timea < time_arr.length; timea++) {
                                    var time_split = time_arr[timea].split(':');
                                    var time = time_split[1];
                                    time = parseInt(time)

                                    let timing = time;
                                    if ((time >= 0) && time <= 14) {
                                        timing = '00';
                                    } else if (time >= 15 && time <= 29) {
                                        timing = 15;
                                    } else if (time >= 30 && time <= 44) {
                                        timing = 30;
                                    } else if (time >= 45 && time <= 59) {
                                        timing = 45;
                                    }
                                    time_split[1] = (timing);
                                    var tm = time_split.join(':');

                                    if (timeToNum(times[t]) == timeToNum(tm) && timeToNum(block_data[b].end_time) > timeToNum(times[t])) {
                                        if (timea == 0) {
                                            obj.isBlockMatchSlot = true;
                                        }
                                        obj.is_block = true;
                                        obj.blocktime.push(block_data[b])
                                    }
                                }
                            }
                        }
                    }

                    if (obj.employee_id == '' && obj.data.length > 0) {
                        showUnassign = true;
                    }
                    tableData[t].data.push(obj)
                }
            }
        }
        if (!showUnassign && allEmployees) {
            allEmployees = allEmployees.filter(item => (item._id != ''));
            tableData = tableData.map(({ ...el }) => {
                el.data = el.data.filter(function (o) { return o.employee_id != ''; })
                return el;
            });
        }
        //console.log('allEmployees 123',allEmployees.length)

        return tableData
    } catch (e) {
        console.log(e)
        return null
    }
}

async function getDates(startDate, stopDate) {
    var dateArray = new Array();
    currentDate = new Date(startDate);
    stopDate = new Date(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push(dateFormat((currentDate), "yyyy-mm-dd"));
        currentDate = new Date(currentDate)
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
}

async function setAppointmentsListRefData(params) {
    try {
        var app = [];
        var date = new Date();
        var start_date = params.start_date;
        var end_date = params.end_date;
        var type = params.type ?? '';

        var location_id = params.location_id;
        var dateArr = [];
        if (location_id && start_date && end_date) {

            if (start_date == end_date) {

                var params = { location_id: location_id?.toString(), employee_id: '', date: start_date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: type };

                var refData = await updateAppListTableData(params);

            } else {
                dateArr = await getDates(start_date, end_date);
                if (dateArr && dateArr.length > 0) {
                    for (var d = 0; d < dateArr.length; d++) {
                        var params = { location_id: location_id?.toString(), employee_id: '', date: dateArr[d], filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: type };

                        var refData = await updateAppListTableData(params);
                    }

                }
            }

        } else if (location_id && start_date && !end_date) {

            var query = { location_id: params.location_id, date: { $gte: start_date } };

            var appListData = await AppListRefService.getAppListRefSpecific(query);

            if (appListData && appListData.length > 0) {

                for (var d = 0; d < appListData.length; d++) {
                    var date = dateFormat(appListData[d].date, "yyyy-mm-dd");
                    var params = { location_id: params.location_id, employee_id: '', date: date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: type };

                    var refData = await updateAppListTableData(params);
                }
            }
        }
        console.log('dateArr', dateArr)
        return dateArr;
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return null;
    }
}

async function getDashRefReBookings(params) {
    try {

        var startDate = params?.start_date || ""
        var endDate = params?.end_date || ""
        var locationId = params?.location_id || ""

        var rbQuery = {}
        var recQuery = {}
        var serviceQuery = {}

        var reBooking = []
        if (locationId) {
            rbQuery['location_id'] = locationId
            recQuery['location_id'] = locationId
        }

        if (startDate && endDate) {
            var rowDate = new Date(startDate)
            // minus 30 day from startDate 
            rowDate = rowDate.setDate(rowDate.getDate() - 30)
            var monthDate = dateFormat(rowDate, "yyyy-mm-dd")
            rbQuery['date'] = { $gte: monthDate, $lte: endDate }
        }

        rbQuery['booking_status'] = { $nin: ['cancel', 'no_shows'] }

        var appointments = await AppointmentService.getAppointmentsOne(rbQuery) || []
        if (appointments && appointments.length) {
            for (var i = 0; i < appointments.length; i++) {
                var clientId = ""
                if (appointments[i]?.client_id && appointments[i]?.client_id?.length) {
                    clientId = appointments[i]?.client_id[0]?._id ? appointments[i]?.client_id[0]?._id : appointments[i]?.client_id[0] || ""
                }

                if (appointments[i].service_data && appointments[i].service_data.length > 0) {
                    for (var j = 0; j < appointments[i].service_data.length; j++) {
                        if ((typeof appointments[i]?.service_data[j]?.service_id === 'string' || appointments[i]?.service_data[j]?.service_id instanceof String)) {
                            appointments[i].service_data[j].service_id = [appointments[i].service_data[j].service_id]
                        }

                        var serviceQuery = { _id: { $in: appointments[i]?.service_data[j]?.service_id } }
                        var groupService = await ServiceService.getServiceSpecific(serviceQuery) || []
                        appointments[i].service_data[j].service_id = groupService
                    }
                }

                var rebooking_flag = false
                if (appointments[i].service_id && appointments[i].service_id.length) {
                    for (var j = 0; j < appointments[i].service_id.length; j++) {
                        var service = appointments[i].service_id[j]
                        if (service && service._id) {
                            if (parseInt(service?.reminder) && parseInt(service?.reminder) > 0) {
                                var dateObject = new Date(appointments[i].date)
                                var serviceDate = dateObject.setDate(dateObject.getDate() + parseInt(service.reminder))
                                var nextServiceDate = dateFormat(serviceDate, "yyyy-mm-dd")

                                if (service.reminder && nextServiceDate <= endDate && nextServiceDate >= startDate && clientId) {
                                    appointments[i].next_service_date = nextServiceDate
                                    recQuery['date'] = { $gte: startDate }
                                    recQuery['client_id'] = { $in: [clientId] }
                                    recQuery['booking_status'] = { $nin: ['cancel', 'no_shows'] }
                                    var recentBooking = await AppointmentService.getAppointmentSpecific(recQuery)
                                    if (recentBooking && recentBooking?.length == 0) {
                                        rebooking_flag = true
                                    }
                                }
                            }
                        }
                    }
                }

                if (rebooking_flag) {
                    reBooking.push(appointments[i])
                }
            }
        }

        return reBooking;
    } catch (e) {
        console.log(e)
        return null
    }
}

async function getDashRefStatData(params) {
    try {

        var startDate = params.start_date || "";
        var endDate = params?.end_date || "";
        var startTargetDate = new Date(startDate);
        var endTargetDate = new Date(endDate);
        var todayDate = dateFormat(new Date(), "yyyy-mm-dd");
        var locationId = params?.location_id || "";
        var filterEmpId = params?.filter_emp_id || "";
        var type = "single";

        var query = {}
        var cQuery = {}
        var eQuery = {}
        var rbQuery = {}
        var recQuery = {}
        var paidQuery = {}
        var bookQuery = {}
        var unpaidQuery = {}
        if (locationId) {
            query['location_id'] = locationId
            cQuery['location_id'] = locationId
            eQuery['location_id'] = locationId
            rbQuery['location_id'] = locationId
            recQuery['location_id'] = locationId
            paidQuery['location_id'] = locationId
            bookQuery['location_id'] = locationId
            unpaidQuery['location_id'] = locationId
        }

        if (filterEmpId) {
            query['service_data'] = { $elemMatch: { employee_id: filterEmpId } }
            cQuery['service_data'] = { $elemMatch: { employee_id: filterEmpId } }
        }

        if (startDate && endDate) {
            query['date'] = { $gte: startDate, $lte: endDate }
            cQuery['date'] = { $gte: startDate, $lte: endDate }
            eQuery['date'] = { $gte: startDate, $lte: endDate }
            paidQuery['date'] = { $gte: startDate, $lte: endDate }
            bookQuery['date'] = { $gte: startDate, $lte: endDate }
            unpaidQuery['date'] = { $gte: startDate, $lte: endDate }

            query['date'] = {
                $gte: new Date(startTargetDate.setHours(0, 0, 0, 0)), // Start of the day
                $lt: new Date(endTargetDate.setHours(23, 59, 59, 999)), // End of the day
            }

            var rowDate = new Date(startDate)
            // minus 30 day from startDate 
            rowDate = rowDate.setDate(rowDate.getDate() - 30)
            var monthDate = dateFormat(rowDate, "yyyy-mm-dd")
            rbQuery['date'] = { $gte: monthDate, $lte: endDate }
        }


        query['booking_status'] = { $nin: ["cancel", "no_shows"] }
        var totalAppointment = await AppointmentService.getAppointmentsOne(query)
        totalAppointment = totalAppointment?.length || 0

        bookQuery['booking_status'] = { $nin: ["cancel", "no_shows"] }
        bookQuery['front_booking'] = "true"
        var totalOnlineAppointment = await AppointmentService.getAppointmentsOne(bookQuery)
        totalOnlineAppointment = totalOnlineAppointment?.length || 0

        bookQuery['createdAt'] = { $lt: endDate }

        bookQuery['front_booking'] = { $ne: "true" }
        var phoneBooking = await AppointmentService.getAppointmentsOne(bookQuery)
        phoneBooking = phoneBooking?.length || 0

        bookQuery['createdAt'] = {
            $gte: new Date(endTargetDate.setHours(0, 0, 0, 0)), // Start of the day
            $lt: new Date(endTargetDate.setHours(23, 59, 59, 999)), // End of the day
        }
        bookQuery['front_booking'] = { $ne: "true" }
        var todayWalkinAppointment = await AppointmentService.getAppointmentsOne(bookQuery)
        todayWalkinAppointment = todayWalkinAppointment?.length || 0

        cQuery['booking_status'] = "cancel"
        var totalAppointmentCancel = await AppointmentService.getAppointmentDataGroup(cQuery)
        var totalCancelBookingAmt = totalAppointmentCancel?.map(b => b.remaining_amount) || 0
        totalCancelBookingAmt = totalCancelBookingAmt?.reduce((partialSum, a) => partialSum + a, 0) || 0
        totalAppointmentCancel = totalAppointmentCancel?.length || 0

        cQuery['booking_status'] = "no_shows"
        var totalBookingNoShow = await AppointmentService.getAppointmentDataGroup(cQuery)
        var totalNoShowBookingAmt = totalBookingNoShow?.map(b => b.remaining_amount) || 0
        totalNoShowBookingAmt = totalNoShowBookingAmt?.reduce((partialSum, a) => partialSum + a, 0) || 0
        totalBookingNoShow = totalBookingNoShow?.length || 0

        unpaidQuery['booking_status'] = { $nin: ["cancel", "no_shows"] }
        unpaidQuery['paid_amount'] = { $eq: 0 }
        var totalUnpaidBooking = await AppointmentService.getAppointmentsOne(unpaidQuery)
        var totalUnpaidBookingAmt = totalUnpaidBooking?.map(b => b.remaining_amount) || 0
        totalUnpaidBookingAmt = totalUnpaidBookingAmt?.reduce((partialSum, a) => partialSum + a, 0) || 0

        paidQuery['booking_status'] = { $nin: ["cancel", "no_shows"] }
        paidQuery['paid_amount'] = { $gt: 0 }
        var totalPaidBooking = await AppointmentService.getAppointmentDataGroup(paidQuery)
        var totalPaidBookingAmt = totalPaidBooking?.map(b => b.paid_amount) || 0
        totalPaidBookingAmt = totalPaidBookingAmt?.reduce((partialSum, a) => partialSum + a, 0) || 0

        var totalAmt = (totalUnpaidBookingAmt + totalPaidBookingAmt + totalCancelBookingAmt + totalNoShowBookingAmt)
        var netAmt = (totalUnpaidBookingAmt + totalPaidBookingAmt)

        // Return the Dashboards list with Code and Message.
        data = {
            /* Appointment */
            total_booking: totalAppointment,
            total_booking_noshow: totalBookingNoShow,
            total_booking_cancel: totalAppointmentCancel,
            total_online_appointment: totalOnlineAppointment,
            today_walkin_appointment: todayWalkinAppointment,
            phone_booking: phoneBooking,
            total_amt: totalAmt,
            net_amt: netAmt,
            total_noshow_booking_amt: totalNoShowBookingAmt,
            total_cancel_booking_amt: totalCancelBookingAmt,
            total_paid_booking_amt: totalPaidBookingAmt,
            total_unpaid_booking_amt: totalUnpaidBookingAmt,
            /* Sales */
        };


        return data;
    } catch (e) {
        console.log(e)
        return null
    }
}

async function checkDashRefData(params) {
    try {
        var query = { location_id: params.location_id, date: params.date }
        var dashData = await DashboardRefService.getDashboardRefs(query);

        return dashData
    } catch (e) {
        return null
    }
}

async function setDashboardRefData(params) {
    try {

        var date = new Date(params.date);
        date = dateFormat(date, "yyyy-mm-dd");
        var location_id = params.location_id;
        var all_future = params.all_future ?? 0;
        var statData = {};

        if (params.location_id && params.date && all_future != 1) {

            var reqParams = { location_id: location_id?.toString(), date: date, start_date: date, end_date: date };

            statData = await getDashRefStatData(reqParams);

            var checkRefData = await checkDashRefData(reqParams);

            if (!checkRefData || !checkRefData.data) {

                if (params.location_id && params.date) {
                    var reqData = { location_id: params.location_id, date: params.date, data: statData, re_bookings: [] };

                    await DashboardRefService.deleteMultiple(params);
                    refData = await DashboardRefService.createDashboardRef(reqData);
                }
            } else {
                var reqData = { _id: checkRefData._id, data: statData };
                await DashboardRefService.updateDashboardRef(reqData);
            }
        } else if (location_id && all_future == 1) {

            var query = { location_id: params.location_id, date: { $gte: date } };

            var dashData = await DashboardRefService.getDashboardRefs(query);

            if (dashData && dashData.length > 0) {

                for (var d = 0; d < dashData.length; d++) {
                    var date = dateFormat(dashData[d].date, "yyyy-mm-dd");

                    var reqParams = { location_id: location_id?.toString(), date: date, start_date: date, end_date: date };

                    statData = await getDashRefStatData(reqParams);

                    var checkRefData = await checkDashRefData(reqParams);

                    if (!checkRefData || !checkRefData.data) {

                        if (params.location_id && params.date) {
                            var reqData = { location_id: params.location_id, date: date, data: statData, re_bookings: [] };

                            await DashboardRefService.deleteMultiple(params);
                            refData = await DashboardRefService.createDashboardRef(reqData);
                        }
                    } else {
                        var reqData = { _id: checkRefData._id, data: statData };
                        await DashboardRefService.updateDashboardRef(reqData);
                    }
                }
            }

        }

        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return statData;
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return null;
    }
}

async function getPatchTestBooking(params) {

    var client_id = [params.client_id];
    var date = params.date;
    var services = params?.services || [];
    var services_arr = [];
    if (services && services?.length > 0) {
        services_arr = services.map(s => s._id);
        booking_arr = services.map(s => s._id);
    }

    try {
        var client_data = await CustomerService.getCustomerById(params.client_id);
        var patch_booking = [];
        if (services_arr && services_arr?.length > 0) {
            var ser_query = { _id: { $in: services_arr } };
            var sel_service = await ServiceService.getServiceSpecific(ser_query);

            var cat_arr = sel_service.map(c => c?.test_id?.toString());
            var resultArray = Array.prototype.concat.apply([], cat_arr);
            cat_arr = Array.from(new Set(resultArray)); //unique ids

            var all_ser_query = { test_id: { $in: cat_arr } };
            var all_service = await ServiceService.getServiceSpecific(all_ser_query);

            var all_service_arr = all_service.map(s => s._id?.toString());

            var patch_query = {
                client_id: { $elemMatch: { $in: client_id } },
                date: { $lte: date },
                service_id: { $elemMatch: { $in: all_service_arr } },
                patch_test_booking: 1,
                booking_status: { $nin: ['cancel', 'no_shows'] }
            };

            if (params.app_id && params.app_id != '') {
                patch_query['_id'] = { $ne: ObjectId(params.app_id) };
            }

            patch_booking = await AppointmentService.getAppointmentWithServices(patch_query, 0, 1);

            if (patch_booking && patch_booking?.length > 0) {

                var ser = Array.prototype.map.call(patch_booking[0].service_id, function (item) { return item.name; }).join(", ");

                patch_booking[0].service_id = ser;
                patch_booking[0].client_name = client_data.name;
            }
        }
        return patch_booking;


    } catch (e) {
        console.log(e)
        return null;
    }
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


async function checkServiceLimit(params) {

    var query = {};
    var location_id = params.location_id;
    var date = params.date;
    var start_time = params.start_time;
    var end_time = params.end_time;
    var group_data = params.group_data ? params.group_data : 0;
    params.all_ser = params.all_ser ? params.all_ser : [];

    var client_id = [params.client_id];

    var services = params?.services || [];
    var services_arr = [];
    if (services && services?.length > 0) {
        services_arr = services.map(s => s._id);
        booking_arr = services.map(s => s._id);
    }

    try {
        var limit_exceed = false;
        var limit_exceed_msg = 'This slot is unavailable for ';
        var appointments = [];
        var ser_arr = [];
        var app = [];
        var app_ser = [];
        if (start_time && end_time) {
            query['services'] = { $elemMatch: { $in: services_arr } };
            ser_arr = await MachineService.getActiveMachines(query);
            var app_query = { location_id: location_id, date: date };

            app_query['booking_status'] = { $nin: ['cancel', 'no_shows', 'complete'] };

            if (params.app_id && params.app_id != '') {
                app_query['_id'] = { $ne: ObjectId(params.app_id) };
            }


            if (ser_arr && ser_arr?.length > 0) {
                var all_machine_ser = ser_arr.map(s => s.services);
                all_machine_ser = [].concat.apply([], all_machine_ser);
                app_query['service_id'] = { $elemMatch: { $in: all_machine_ser } };
            } else {
                app_query['service_id'] = { $elemMatch: { $in: services_arr } };
            }

            appointments = await AppointmentService.getAppointmentSpecific(app_query);
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

                var cat_arr = mach_service.map(c => c.category_id?.toString());
                var resultArray = Array.prototype.concat.apply([], cat_arr);
                cat_arr = Array.from(new Set(resultArray)); //unique ids

                const catArray = cat_arr.filter(value => params.all_ser.includes(value));
                var max_occurances = 0;
                if (catArray && catArray?.length > 0) {
                    for (var ci = 0; ci < catArray.length; ci++) {
                        var occ = checkOccurrence(params.all_ser, catArray[ci]);
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
                var ser_arr_data = await ServiceService.getServicesbyLocation(squery);

                ser_arr_data = ser_arr_data.map(s => s.name);
                ser_arr_data = ser_arr_data?.toString();

                limit_exceed_msg += ser_arr_data;
            }
        }

        return { limit_exceed: limit_exceed, limit_exceed_msg: limit_exceed_msg, data: ser_arr };
    } catch (e) {
        console.log(e)
        return null;
    }
}

async function getEmployeeListByServices(params) {
    try {
        var query = { is_employee: 1, status: 1 }

        if (params.online_status && params.online_status == 1) {
            query['online_status'] = params.online_status;
        }

        if (params.location_id && params.location_id != 'undefined') {
            query['location_id'] = params.location_id;
        }

        var date = params.date;
        var dateObj = new Date(date);
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
        weekday = weekday.toLowerCase();
        var employee_ids = params.employees ? params.employees : [];
        var employee_id = params.employee_id;
        var service_ids = params.service_id;
        var allServices = false
        var emp = []
        var cat_arr = []

        var service_query = { _id: { $in: service_ids } };
        var service = await ServiceService.getServiceSpecificWithCategory(service_query);
        if (service.length > 0) {
            cat_arr = service.map(s => s.category_id);
        }

        var on_leave_emp = [];

        if (date) {
            var off_day_emp = await EmployeeTimingService.getEmployeeAllTimings(
                {
                    location_id: params.location_id,
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

            if (off_day_emp.length > 0) {
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

            if (off_day_emp_filter.length > 0) {
                on_leave_emp = off_day_emp_filter.map(s => s.employee_id);
            }

            if (on_leave_emp.length > 0) {
                employee_ids = employee_ids.concat(on_leave_emp);

            }
        }

        if (employee_id && employee_id != '') {
            query['$and'] = [{ _id: employee_id }, { _id: { $nin: employee_ids } }];
        } else {
            query['_id'] = { $nin: employee_ids }
        }

        var arr1 = cat_arr.filter((x, i) => i === cat_arr.indexOf(x)); //unique_cat_arr

        query['services'] = { "$all": arr1 };

        //console.log('query',query)

        var employees = await UserService.getAvilEmployees(query, 'employee_priority');

        // for (var e = 0; e < employees.length; e++) {
        //     var category = employees[e].services;

        //     var arr2 = category;
        //     // console.log('arr2',arr2)
        //     var match = arrayContainsAll(arr1, arr2);
        //     if (match) {
        //         emp.push(employees[e]);
        //     }
        // }

        return employees;
    } catch (e) {
        console.log(e)
        return null
    }
}

module.exports = {
    inRange,
    timeToNum,
    numToTime,
    formatDate,
    isObjEmpty,
    isValidJson,
    getRandPswd,
    get4DigitCode,
    calPercentage,
    generateUniqueId,
    increaseDateDays,
    arrayContainsAll,
    isArrayContainingObject,
    checkTimeBetween,
    between,
    checkInvTimeBetween,
    getDecimalFormat,
    getTodayTiming,
    getAvailableEmployee,
    checkAppListRefData,
    setAppListTableData,
    updateAppListTableData,
    generateTableTimeSlotNew,
    setAppointmentsListRefData,
    setDashboardRefData,
    getPatchTestBooking,
    checkServiceLimit,
    getEmployeeListByServices
}