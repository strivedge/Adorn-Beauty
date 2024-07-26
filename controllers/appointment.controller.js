var fs = require('fs');
var Hogan = require('hogan.js');
var dateFormat = require('dateformat');
var ObjectId = require('mongodb').ObjectId;
const moment = require('moment');
const AppliedDiscountService = require('../services/appliedDiscount.service')
const AppListRefService = require('../services/appListRef.service')
const AppointmentService = require('../services/appointment.service')
const BlockTimeService = require('../services/blockTime.service')
const CartService = require('../services/cart.service')
const CategoryService = require('../services/category.service')
const CompanyService = require('../services/company.service')
const ConsultantFormService = require('../services/consultantForm.service')
const ConsultantServiceTypeQuestionService = require('../services/consultantServiceTypeQuestion.service')
const CustomerLoyaltyCardLogService = require('../services/customerLoyaltyCardLog.service')
const CustomerLoyaltyCardService = require('../services/customerLoyaltyCard.service')
const CustomerPackageService = require('../services/customerpackage.service')
const CustomerRewardService = require('../services/customerReward.service')
const CustomerService = require('../services/customer.service')
const CustomerUsagePackageService = require('../services/customerUsagePackageService.service')
const DiscountService = require('../services/discount.service')
const DiscountSlabService = require('../services/discountSlab.service')
const EmailLogService = require('../services/emailLog.service')
const EmployeeFilterLog = require('../services/employeeFilterLog.service')
const EmployeeNumberLog = require('../services/employeeNumberLog.service')
const EmployeeTimingService = require('../services/employeeTiming.service')
const FirebaseService = require('../services/firebase.service');
const LocationService = require('../services/location.service')
const LocationTimingService = require('../services/locationTiming.service')
const PackageService = require('../services/package.service')
const PushNotificationService = require('../services/pushNotification.service')
const QuickSmsLogService = require('../services/quickSmslog.service')
const SendEmailSmsService = require('../services/sendEmailSms.service')
const ServiceService = require('../services/service.service')
const SmslogService = require('../services/smslog.service')
const UserDeviceTokenService = require('../services/userDeviceToken.service');
const UserService = require('../services/user.service')
const WhatsAppLogService = require('../services/whatsAppLog.service')
const AppointmentProcessService = require('../services/appointmentProcess.service')

const {
    numToTime,
    timeToNum,
    formatDate,
    isObjEmpty,
    isValidJson,
    calPercentage,
    getDecimalFormat,
    increaseDateDays,
    getEmailTemplateData,
    getCustomParameterData,
    isArrayContainingObject,
    debitCustomerGiftCardBalance,
    creditCustomerGiftCardBalance
} = require('../helper');

const { getTodayTiming, getAvailableEmployee, checkAppListRefData, setAppListTableData, updateAppListTableData, generateTableTimeSlotNew, setDashboardRefData } = require('../common')


var AWS = require('aws-sdk')
AWS.config.update({ region: 'eu-west-2' })

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getAppointments = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = {};
    var service_query = {};

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.employee_id && req.query.employee_id != 'undefined') {
        query['service_data'] = { $elemMatch: { employee_id: req.query.employee_id } };
    }
    if (req.query.start_date && req.query.start_date != 'undefined' && req.query.start_date != 'null' && req.query.end_date && req.query.end_date != 'undefined' && req.query.end_date != 'null') {
        query['date'] = { $gte: req.query.start_date, $lte: req.query.end_date }
    }

    var client_query = {};
    try {
        var app = [];
        var appointment = { docs: {} }
        appointment.docs = await AppointmentService.getAppointmentSpecific(query, page, limit);

        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: appointment, message: "Successfully Appointments Received" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getUserBooking = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = {};
    var service_query = {};
    var s_query = {};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.body.client_id_arr && req.body.client_id_arr.length > 0) {
        var client_id = req.body.client_id_arr;
    }
    var client_id = req.body.client_id;
    var date = req.body.date ? req.body.date : new Date();
    var TodayDate = dateFormat(new Date(), "yyyy-mm-dd");

    var dateObj = new Date(date);
    var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
    weekday = weekday.toLowerCase();


    var st_date = new Date(date);
    st_date.setDate(1);

    var today_day = new Date(date);
    var lastDayOfMonth = new Date(today_day.getFullYear(), today_day.getMonth() + 1, 0);

    var first_date = dateFormat(st_date, "yyyy-mm-dd");
    var last_date = dateFormat(lastDayOfMonth, "yyyy-mm-dd");

    try {
        var client_arr = [];
        if (req.body.client_id_arr && req.body.client_id_arr.length > 0) {
            client_arr = req.body.client_id_arr;
        } else {
            client_arr.push(client_id);
        }

        if (req.body.email && req.body.mobile) {
            var query = { email: req.body.email }
            var query2 = { mobile: req.body.mobile };
            var user = await CustomerService.getCustomerByQuery(query);//check by email
            var user2 = await CustomerService.getCustomerByQuery(query2); //check by mobile
            if (user.length > 0) {
                client_arr.push(user[0]._id.toString());
            }

            if (user2.length > 0) {
                client_arr.push(user2[0]._id.toString());
            }
        }

        const client_ids = Array.from(new Set(client_arr));

        var b_query = {
            location_id: req.body.location_id,
            booking_status: { $nin: ['cancel', 'no_shows', 'complete'] },
            client_id: { $elemMatch: { $in: client_ids } }
        }

        b_query['date'] = { $gte: TodayDate };
        var appointment = await AppointmentService.getAppointmentSpecific(b_query, page, limit);

        var today_timing = {};

        var location = await LocationService.getLocation(req.body.location_id);
        if (weekday && req.body.location_id) {
            today_timing = await LocationTimingService.getSpecificLocationTimings(req.body.location_id, weekday); //get location time by day name

            if (location?.group_special_hours && location?.group_special_hours.length > 0) {
                var ind = location?.group_special_hours.findIndex(x => date >= dateFormat(x.special_hour_start_date, "yyyy-mm-dd") && date <= dateFormat(x.special_hour_end_date, "yyyy-mm-dd"));
                if (ind != -1) {

                    today_timing.start_time = location?.group_special_hours[ind].special_hour_from_time;

                    today_timing.end_time = location?.group_special_hours[ind].special_hour_end_time;
                }
            }
        }

        if (location && location?.company_id) {
            var company = await CompanyService.getCompany(location?.company_id);
            location.company_name = company.name;
        }

        var future_booking_limit = 1;
        var groupBookingLimit = 0;

        var customParaVal = await getCustomParameterData(location?.company_id, req.body.location_id, 'booking');
        if (customParaVal && customParaVal?.formData && customParaVal?.formData?.booking_status) {
            future_booking_limit = parseInt(customParaVal?.formData?.future_booking) || 1;
            groupBookingLimit = parseInt(customParaVal?.formData?.group_booking) || 0;
        }

        var client_data = await CustomerService.getCustomerById(client_id);

        var pkg_query = {
            location_id: req.body.location_id,
            customer_id: client_id,
            status: 1,
            start_date: { $lte: date }, end_date: { $gte: date }
        };
        var customer_package = await CustomerPackageService.getCustomerPackageSpecific(pkg_query);

        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: appointment, location: location, client_data: client_data, customer_package: customer_package, future_booking_limit: future_booking_limit, group_booking_limit: groupBookingLimit, today_timing: today_timing, message: "Successfully Appointments Received" });
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getUserBookings = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var clientIds = [];
        var companyId = "";
        var locationId = req.query?.location_id || "";
        var clientId = req.query?.client_id || "";
        var appointmentId = req.query?.appointment_id || "";
        var email = req.query?.email || "";
        var mobile = req.query?.mobile || "";

        var empQuery = { is_employee: 1 };
        if (locationId) {
            empQuery.location_id = locationId;
        }

        var date = req.query?.date || new Date();
        var todayDate = formatDate(new Date(), "YYYY-MM-DD")

        var dateObj = new Date(date);
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }); // get day name
        weekday = weekday.toLowerCase();

        var stDate = dateObj;
        stDate.setDate(1);

        var lastDayOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
        var firstDate = formatDate(stDate, "YYYY-MM-DD");
        var lastDate = formatDate(lastDayOfMonth, "YYYY-MM-DD");

        if (req.query?.client_ids && isValidJson(req.query.client_ids)) {
            clientIds = JSON.parse(req.query.client_ids);
        } else if (clientId) {
            clientIds.push(clientId);
        }

        if (email && mobile) {
            var query = { email: email };
            var user = await CustomerService.checkCustomerExist(query);
            if (user && user._id) {
                clientIds.push(user._id.toString());
            }

            var query = { mobile: mobile };
            var user = await CustomerService.checkCustomerExist(query);
            if (user && user._id) {
                clientIds.push(user._id.toString());
            }
        }

        clientIds = Array.from(new Set(clientIds));

        var query = {
            location_id: locationId,
            booking_status: { $nin: ['cancel', 'no_shows', 'complete'] },
            client_id: { $elemMatch: { $in: clientIds } }
        };

        var employees = await UserService.getUsersDropdown(empQuery) || [];

        query.date = { $gte: todayDate };
        var todayTiming = null;
        var appointments = await AppointmentService.getAppointmentsOne(query);

        var location = await LocationService.getLocationOne({ _id: locationId }) || null;
        companyId = location?.company_id?._id ? location?.company_id._id : location?.company_id || "";
        if (weekday && locationId) {
            todayTiming = await LocationTimingService.getSpecificLocationTimings(locationId, weekday); //get location time by day name
            if (location?.group_special_hours && location?.group_special_hours?.length > 0) {
                var ind = location?.group_special_hours.findIndex(x => date >= dateFormat(x.special_hour_start_date, "yyyy-mm-dd") && date <= dateFormat(x.special_hour_end_date, "yyyy-mm-dd"));
                if (ind != -1) {
                    todayTiming.start_time = location?.group_special_hours[ind].special_hour_from_time;

                    todayTiming.end_time = location?.group_special_hours[ind].special_hour_end_time;
                }
            }
        }

        var futureBookingLimit = 1;
        var groupBookingLimit = 0;

        var customParaVal = await getCustomParameterData(companyId, locationId, 'booking');
        if (customParaVal && customParaVal?.formData && customParaVal?.formData?.booking_status) {
            futureBookingLimit = parseInt(customParaVal?.formData?.future_booking) || 1;
            groupBookingLimit = parseInt(customParaVal?.formData?.group_booking) || 0;
        }


        var clientData = await CustomerService.getCustomerById(clientId);

        var pkgQuery = {
            location_id: locationId,
            customer_id: clientId,
            status: 1,
            start_date: { $lte: date }, end_date: { $gte: date }
        }

        var customerPackages = [];
        var custPackages = await CustomerPackageService.getCustomerPackagesOne(pkgQuery);

        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            client_data: clientData,
            customer_packages: customerPackages,
            data: appointments,
            group_booking_limit: groupBookingLimit,
            future_booking_limit: futureBookingLimit,
            location: location,
            today_timing: todayTiming,
            message: "User booking recieved successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

let checker = (arr, target) => target.every(v => arr.includes(v));


async function getAvailableEmployees(params) {
    try {
        var query = { status: 1 }
        var allEmpQuery = { status: 1 }

        if (params.location_id && params.location_id != 'undefined') {
            query['location_id'] = params.location_id
            allEmpQuery['location_id'] = params.location_id
        }

        if (params.employees && params.employees.length > 0) {
            query['_id'] = { $nin: params.employees }
            allEmpQuery['_id'] = { $nin: params.employees }
        }

        if (params.is_employee == 1) {
            query['is_employee'] = 1
            allEmpQuery['is_employee'] = 1
        }

        if (params.is_available == 1) {
            query['status'] = 1
            allEmpQuery['status'] = 1
        }

        if (params.employee_id && params.employee_id != 'undefined') {
            query['_id'] = params.employee_id.toString()
        }

        var filter_employees = params.filter_employees ? params.filter_employees : []

        date = params.date
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

        var fquery = { location_id: params.location_id, date: params.date }
        var getFilterData = await EmployeeFilterLog.getEmployeeFilterLogsSpecific(fquery)
        if (getFilterData.length > 0) {
            var eQuery = { _id: { $in: getFilterData[0].employee_ids } }
            var emp = await UserService.getAvilEmployees(eQuery)
            filter_employees = getFilterData[0].employee_ids
            getFilterData[0].employee_ids = emp // with name
            params.order_by = "user_order"
        }

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

            off_day_emp = result_emp

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

        var users = []
        var allEmp = []
        var order_by = params?.order_by ? params.order_by : ''
        if (!close_day) {
            allEmp = await UserService.getAvilEmployees(allEmpQuery)
            users = await UserService.getAvilEmployees(query, order_by)
            for (var i = 0; i < users.length; i++) {
                var query = { location_id: params.location_id, employee_id: users[i]._id.toString(), date: params.date }
                var getData = await EmployeeNumberLog.getEmployeeNumberLogsSpecific(query)
                let e_ind = result_emp.findIndex(x => x.employee_id == users[i]._id)
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
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return { off_day_emp: off_day_emp, data: users, all_emp: allEmp, close_day: close_day, filter_data: getFilterData, result_emp: result_emp, close_day_name: close_day_name };
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return null;
    }
}

exports.getAppointmentsListRefData = async function (req, res, next) {
    try {

        var app = [];
        req.body.is_available = 1;
        req.body.is_employee = 1;
        req.body.order_by = 'user_order';
        req.body.type = '';
        var employee_id = req.body.employee_id

        if (req.body.date) {
            req.body.date = dateFormat(new Date(req.body.date), "yyyy-mm-dd");
        }

        var params = { location_id: req.body.location_id, date: req.body.date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1 };
        var refData = await checkAppListRefData(req.body);


        if (!refData) {
            await updateAppListTableData(req.body);
            var refData = await checkAppListRefData(req.body);
        }
        var tableData = await generateTableTimeSlotNew(refData, params);

        var empData = await getAvailableEmployees(req.body)

        if (employee_id) {
            refData.employee = refData.employee.filter(function (el) {
                return el._id == employee_id;
            });

            if (tableData && tableData.length > 0) {
                for (let t = 0; t < tableData.length; t++) {
                    tableData[t].data = tableData[t].data.filter(x => x.employee_id == employee_id);
                }
            }
        }

        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, today_timing: refData.today_timing, data: tableData, allEmployees: refData.employee, refData: refData, empData: empData, message: "Successfully Appointments Received" });
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.setFutureAppointmentsListRefData = async function (req, res, next) {
    try {

        var app = [];
        var app_query = {};
        var date = new Date();
        var start_date = req.query.start_date;
        var end_date = req.query.end_date;
        var all_future = req.query.all_future;
        var st_date = new Date(date.getTime());
        st_date.setDate(date.getDate() - 7);

        st_date = dateFormat(st_date, "yyyy-mm-dd");

        var location_id = req.query.location_id;
        var dateArr = [];
        if (location_id) {
            app_query['location_id'] = location_id;
            if (start_date && end_date) {
                app_query['date'] = { $gte: start_date, $lte: end_date };
            } else if (start_date && all_future) {
                app_query['date'] = { $gte: start_date };
            } else if (start_date) {
                app_query['date'] = start_date;
            } else if (all_future) {
                app_query['date'] = { $gte: st_date };
            }
            var appointment = await AppointmentService.getAppointmentDatedSpecific(app_query);
            dateArr = appointment.map(a => a.date);
            dateArr = dateArr.map(x => dateFormat(x, "yyyy-mm-dd"));
            dateArr = dateArr.filter((item, pos) => dateArr.indexOf(item) === pos);

            if (dateArr && dateArr.length > 0) {
                for (var d = 0; d < dateArr.length; d++) {
                    var params = { location_id: location_id.toString(), employee_id: '', date: dateArr[d], filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: '' };

                    var refData = await updateAppListTableData(params);
                }

            }

        } else {
            var query = { status: 1 }
            var locations = await LocationService.getActiveLocations(query);
            for (var i = 0; i < locations.length; i++) {

                app_query['location_id'] = locations[i]._id;
                if (start_date && !all_future) {
                    app_query['date'] = start_date;
                } else if (start_date && all_future) {
                    app_query['date'] = { $gte: start_date };
                } else {
                    app_query['date'] = { $gte: st_date };
                }
                var appointment = await AppointmentService.getAppointmentDatedSpecific(app_query);
                dateArr = appointment.map(a => a.date);
                dateArr = dateArr.map(x => dateFormat(x, "yyyy-mm-dd"));
                dateArr = dateArr.filter((item, pos) => dateArr.indexOf(item) === pos);
                //dateArr = ['2023-11-02']
                if (dateArr && dateArr.length > 0) {
                    for (var d = 0; d < dateArr.length; d++) {
                        var params = { location_id: locations[i]._id.toString(), employee_id: '', date: dateArr[d], filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: '' };
                        var refData = await updateAppListTableData(params);
                    }

                }
            }
        }

        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, start_date: st_date, data: dateArr, message: "Successfully Appointments Received" });
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getAppointmentsDetails = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 1
        var limit = req.query.limit ? req.query.limit : 1000;
        var query = {};
        var service_query = {};
        var group_ser_query = {};
        var client_query = {};

        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id;
        }

        date = req.body.date;
        var dateObj = new Date(date);
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
        weekday = weekday.toLowerCase();

        var app = [];
        var today_timing = {};
        if (weekday && req.body.location_id) {
            var location = await LocationService.getLocation(req.body.location_id);
            today_timing = await LocationTimingService.getSpecificLocationTimings(req.body.location_id, weekday); //get location time by day name

            if (location?.group_special_hours && location?.group_special_hours.length > 0) {
                var ind = location?.group_special_hours.findIndex(x => date >= dateFormat(x.special_hour_start_date, "yyyy-mm-dd") && date <= dateFormat(x.special_hour_end_date, "yyyy-mm-dd"));
                if (ind != -1) {
                    today_timing.start_time = location?.group_special_hours[ind].special_hour_from_time;

                    today_timing.end_time = location?.group_special_hours[ind].special_hour_end_time;
                }
            }

        }

        var block_times = await BlockTimeService.getBlockSpecific(
            {
                location_id: req.body.location_id,
                status: 1,
                $or: [
                    { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
                    { $and: [{ start_date: { $lte: date } }, { end: { $eq: 'always' } }] }
                ]
            }, page, limit);


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
            var employee = await UserService.getEmployeeSpecific(q, 1, 100); // for replace service name
            block_times[i].employee_list = employee; //replace service name
        }

        query['date'] = { $eq: date };
        var appointment = await AppointmentService.getAppointmentSpecific(query, page, limit);

        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, today_timing: today_timing, block_times: block_times, data: appointment, message: "Successfully Appointments Received" });
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

async function getSpecificAppointments(locationId = "", query = {}, page = 1, limit = 0, sortBy = "", sortOrder = "") {
    try {
        if (!locationId) {
            return { error: "Location Id must be present!", data: [] }
        }

        var empQuery = { is_employee: 1 }
        if (locationId) {
            query.location_id = locationId
            empQuery.location_id = locationId
        }

        var employees = await UserService.getUsersDropdown(empQuery) || []

        var appointmentsData = []
        var appointments = await AppointmentService.getAppointmentsOne(query, Number(page), Number(limit), sortBy, Number(sortOrder)) || [];
        if (appointments && appointments.length) {
            for (var i = 0; i < appointments.length; i++) {
                var clientId = "";
                if (appointments[i]?.client_id && appointments[i]?.client_id?.length) {
                    clientId = appointments[i]?.client_id[0]?._id ? appointments[i]?.client_id[0]?._id : appointments[i]?.client_id[0] || "";
                }
                var catId = [];
                var services = [];
                var servId = appointments[i]?.service_id || [];

                var categories = [];
                var consultServType = [];
                var conQuery = { client_id: clientId.toString(), booking_id: { $ne: appointments[i]._id.toString() } };
                conQuery['$or'] = [
                    { $and: [{ service_id: { $all: servId } }] },
                    { $and: [{ category_id: { $all: catId } }] }
                ]

                var consultantData = await ConsultantFormService.getConsultantFormsSpecific(conQuery);

                if (consultServType && consultServType?.length || consultantData && consultantData?.length > 0) {
                    appointments[i].consultant_status = 1;
                } else {
                    conQuery['$or'] = [
                        { $and: [{ service_id: { $in: servId } }] },
                        { $and: [{ category_id: { $in: catId } }] }
                    ]

                    consultantData = await ConsultantFormService.getConsultantFormsSpecific(conQuery);
                    if (consultantData.length) {
                        appointments[i].consultant_status = 4;
                    } else {
                        appointments[i].consultant_status = 0;
                    }
                }

                if (appointments[i].discount_services && appointments[i].discount_services.length > 0) {
                    var serviceQuery = { _id: { $in: appointments[i].discount_services } }
                    var services = await ServiceService.getServiceSpecific(serviceQuery) || []
                    appointments[i].discount_services = services; //services with name and price
                }

                var gdata = [];
                appointments[i].group_data = appointments[i]?.service_data || []


                var employee_id = appointments[i].service_data.map(s => s.employee_id);
                employee_id = Array.from(new Set(employee_id));
                if (employee_id.length > 1) {
                    appointments[i].index_id = i + 1;
                }

                if (appointments[i]?.client_id && appointments[i]?.client_id?.length > 0) {
                    appointmentsData.push(appointments[i]);
                }
            }
        }

        return { error: "", data: appointmentsData }
    } catch (e) {
        return { error: e.message, data: [] }
    }
}

exports.getAppointmentListsDetail = async function (req, res, next) {
    try {
        var date = req.query?.date || null
        var locationId = req.query?.location_id || null

        var query = { date: { $eq: date } }

        var blkTimeQuery = { status: 1 }
        if (locationId) {
            query.location_id = locationId
            blkTimeQuery.location_id = locationId
        }

        var dateObj = new Date(date)
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }) // get day name
        weekday = weekday?.toLowerCase() || ""

        var todayTiming = null
        if (weekday && locationId) {
            var location = await LocationService.getLocation(locationId)
            todayTiming = await LocationTimingService.getSpecificLocationTimings(locationId, weekday) // get location time by day name

            if (location?.group_special_hours && location?.group_special_hours?.length > 0) {
                var ind = location?.group_special_hours.findIndex(x => date >= dateFormat(x.special_hour_start_date, "yyyy-mm-dd") && date <= dateFormat(x.special_hour_end_date, "yyyy-mm-dd"))
                if (ind != -1) {
                    todayTiming.start_time = location?.group_special_hours[ind].special_hour_from_time
                    todayTiming.end_time = location?.group_special_hours[ind].special_hour_end_time
                }
            }
        }

        blkTimeQuery['$or'] = [
            { $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }] },
            { $and: [{ start_date: { $lte: date } }, { end: { $eq: 'always' } }] }
        ]

        var blockTimes = await BlockTimeService.getBlockSpecific(blkTimeQuery) || []
        if (blockTimes && blockTimes.length) {
            for (var i = 0; i < blockTimes.length; i++) {
                var weekDays = blockTimes[i]?.every_week || []
                var alternateDay = blockTimes[i]?.alternate_day || []
                if (blockTimes[i]?.repeat == 'every_week' && weekDays) {
                    var index = weekDays.map(function (e) { return e }).indexOf(weekday) //check service types
                    if (index == -1) { blockTimes.splice(i, 1); }
                }

                if (blockTimes[i]?.repeat == 'every_alternate_week' && alternateDay) {
                    var index = alternateDay.map(function (e) { return e }).indexOf(weekday) //check service types
                    if (index == -1) { blockTimes.splice(i, 1); }
                }
            }
        }

        var appointments = await getSpecificAppointments(locationId, query)

        return res.status(200).json({
            status: 200,
            flag: appointments?.error ? false : true,
            data: appointments?.data || [],
            today_timing: todayTiming,
            block_times: blockTimes,
            message: appointments?.error ? appointments.error : "Appointments received successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        console.log("getAppointmentListsDetail catch >>> ", e);
        return res.status(200).json({
            status: 200,
            flag: false,
            message: e.message
        })
    }
}

async function getSpecificAppointment(query = {}, type = "") {
    try {
        var todayTiming = null;
        var appointment = null;
        if (isObjEmpty(query)) {
            return { error: "Filter query must be present!", data: appointment, todayTiming: todayTiming }
        }

        var empQuery = { is_employee: 1 };
        if (type == "detail") {
            appointment = await AppointmentService.getAppointmentOneDetail(query) || null;
        } else {
            appointment = await AppointmentService.getAppointmentOne(query) || null;
        }

        if (appointment && appointment._id) {
            var appointmentId = appointment._id;
            var locationId = appointment?.location_id || "";
            var date = appointment.date;
            var dateObj = new Date(date);
            var weekday = dateObj.toLocaleString("default", { weekday: "long" }); //get day name
            weekday = weekday.toLowerCase();

            if (weekday && locationId) {
                var location = await LocationService.getLocation(locationId);
                todayTiming = await LocationTimingService.getSpecificLocationTimings(locationId, weekday); //get location time by day name

                if (location?.group_special_hours && location?.group_special_hours.length > 0) {
                    var ind = location?.group_special_hours.findIndex(x => date >= dateFormat(x.special_hour_start_date, "yyyy-mm-dd") && date <= dateFormat(x.special_hour_end_date, "yyyy-mm-dd"));
                    if (ind != -1) {
                        todayTiming.start_time = location?.group_special_hours[ind].special_hour_from_time;

                        todayTiming.end_time = location?.group_special_hours[ind].special_hour_end_time;
                    }
                }
            }

            var clientId = "";
            if (appointment?.client_id && appointment?.client_id?.length) {
                clientId = appointment?.client_id[0]?._id ? appointment?.client_id[0]?._id : appointment?.client_id[0] || "";
            }


            empQuery.location_id = locationId;
            var employees = await UserService.getUsersDropdown(empQuery) || [];

            var catId = [];
            var services = [];
            var servId = appointment?.service_id || [];


            var categories = [];
            var consultServType = [];
            var conQuery = { client_id: clientId, booking_id: { $ne: appointmentId } };
            conQuery['$or'] = [
                { $and: [{ service_id: { $all: servId } }] },
                { $and: [{ category_id: { $all: catId } }] }
            ];

            var consultantData = await ConsultantFormService.getConsultantFormsSpecific(conQuery);
            if (consultServType && consultServType?.length || consultantData && consultantData?.length > 0) {
                appointment.consultant_status = 1;
            } else {
                conQuery['$or'] = [
                    { $and: [{ service_id: { $in: servId } }] },
                    { $and: [{ category_id: { $in: catId } }] }
                ];

                consultantData = await ConsultantFormService.getConsultantFormsSpecific(conQuery);
                if (consultantData && consultantData?.length) {
                    appointment.consultant_status = 4;
                } else {
                    appointment.consultant_status = 0;
                }
            }

            if (appointment.discount_services && appointment.discount_services.length > 0) {
                var serviceQuery = { _id: { $in: appointment.discount_services } };
                var services = await ServiceService.getServiceSpecific(serviceQuery) || [];
                appointment.discount_services = services; //services with name and price
            }

        }

        return { error: "", data: appointment || null, todayTiming: todayTiming || null }
    } catch (e) {
        console.log('error', e)
        return { error: e.message, data: null, todayTiming: null }
    }
}

exports.getAppointmentListDetail = async function (req, res, next) {
    try {
        var id = req.params?.id || "";
        var clientId = req.query?.client_id || "";
        var type = req.query?.type || "";
        var query = { _id: id };

        if (clientId) {
            query.client_id = { $in: [clientId] };
        }
        var appointment = await getSpecificAppointment(query, type) || null;

        return res.status(200).json({
            status: 200,
            flag: appointment?.error ? false : true,
            data: appointment?.data || null,
            today_timing: appointment?.todayTiming || null,
            message: appointment?.error ? appointment.error : "Appointment received successfully!"
        })
    } catch (e) {
        console.log("getAppointmentListDetail catch >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCustomerAppointmentLists = async function (req, res, next) {
    try {
        var page = Number(req.query?.page) || 1
        var limit = Number(req.query?.limit) || 0
        var sortBy = req.query?.sortBy || 'date'
        var sortOrder = req.query.sortOrder && JSON.parse(req.query.sortOrder) ? '1' : '-1'
        var pageIndex = 0
        var startIndex = 0
        var endIndex = 0

        var date = req.query?.date || ""
        var clientId = req.query?.client_id || ""
        var locationId = req.query?.location_id || ""

        if (!clientId) {
            return res.status(200).json({ status: 200, flag: false, data: [], message: "Customer Id must be present!" })
        }

        if (!locationId) {
            return res.status(200).json({ status: 200, flag: false, data: [], message: "Location Id must be present!" })
        }

        var query = {}
        if (date) {
            query['date'] = { $eq: date }
        }

        if (locationId) {
            query['location_id'] = locationId
        }

        if (clientId) {
            query['client_id'] = { $in: [clientId] }
        }

        var count = await AppointmentService.getAppointmentsCount(query)
        var appointments = await getSpecificAppointments(locationId, query, Number(page), Number(limit), sortBy, Number(sortOrder))
        if (!appointments?.data || !appointments?.data?.length) {
            if (Number(req.query?.page) && Number(req.query.page) > 0) {
                page = 1
                appointments = await getSpecificAppointments(locationId, query, Number(page), Number(limit), sortBy, Number(sortOrder))
            }
        }

        if (appointments?.data && appointments?.data.length) {
            pageIndex = Number(page - 1)
            startIndex = (pageIndex * limit) + 1
            endIndex = Math.min(startIndex - 1 + limit, count)
        }

        return res.status(200).json({
            status: 200,
            flag: appointments?.error ? false : true,
            data: appointments?.data || [],
            pages: limit ? Math.ceil(count / limit) : 0,
            total: count,
            pageIndex: pageIndex,
            startIndex: startIndex,
            endIndex: endIndex,
            message: appointments?.error ? appointments.error : "Appointments received successfully!"
        })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({
            status: 200,
            flag: false,
            data: [],
            message: e.message
        })
    }
}

exports.getBookingEmailContents = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    var appointmentId = req.params.id;
    try {
        var client_query = {};
        var service_query = {};
        //var appointment = await AppointmentService.getAppointment(id) || {};

        var appointment = await AppointmentService.getAppointmentOne({ _id: ObjectId(id) }) || null;

        var employee_data = {};
        let htmlContext = '';
        var toMail = {};

        if (appointment) {

            var location = await LocationService.getLocation(appointment.location_id);

            var company = { name: '' };
            var company_name = "";
            var company_website = "";
            var company_logo = "";
            if (location?.company_id) {
                company = await CompanyService.getCompany(location?.company_id);
                if (company.name) {
                    company_name = company.name;
                }
                if (company.contact_link) {
                    company_website = company.contact_link;
                }
                if (company.image) {
                    company_logo = company.image;
                }
            }

            var currency = company?.currency ? company?.currency?.symbol : "£"

            client_query['_id'] = { $in: appointment.client_id };
            var client = await CustomerService.getClients(client_query);
            appointment.client_id = client; //with name


            if (appointment?.service_data?.length > 0) {
                if (appointment.service_data[0].employee_id) {
                    employee_data = await UserService.getUserById(appointment.service_data[0].employee_id);
                }

                appointment.client_id = client;
            }

            var is_paypal = 0;
            var is_salon = 0;
            var total_paid_amount = 0;
            var total_used_gift_card_bal = 0;
            var total_remaining_amount = 0;

            service_query['_id'] = { $in: appointment.service_id };

            var service = appointment?.service_data.map(s => s?.service_id[0]);

            if (appointment.location_id && appointment.location_id != undefined) {
                service_query['location_id'] = appointment.location_id;
                client_query['location_id'] = appointment.location_id;
            }

            var dateObj = new Date(appointment.date);
            var dayOfMonth = dateObj.getDate();
            var weekday = dateObj.toLocaleString("default", { weekday: "long" });

            var month = dateObj.toLocaleString('default', { month: 'long' });

            var date = dateFormat(appointment.date, "dd-mm-yyyy");

            appointment.service_id = service; //services with name and price
            if (service?.length > 0) {
                cat_arr = service.map(s => s.category_id); //main user category
            }

            total_paid_amount += appointment.paid_amount;
            total_used_gift_card_bal += appointment.used_gift_card_bal || 0;
            total_remaining_amount += appointment.remaining_amount;

            appointment.paid_amount = appointment.paid_amount.toFixed(2);
            appointment.remaining_amount = appointment.remaining_amount.toFixed(2);
            appointment.total_amount = appointment.total_amount.toFixed(2);

            var services = '';
            if (appointment.service_id) {
                for (var i = 0; i < appointment.service_id.length; i++) {
                    if (i == 0) {
                        services += appointment.service_id[i].name + ' (' + currency + appointment.service_id[i].price + ') ';
                    } else {
                        services += ', ' + appointment.service_id[i].name + ' (' + currency + appointment.service_id[i].price + ') ';
                    }
                }
            }

            unique_cat_arr = cat_arr.filter((x, i) => i === cat_arr.indexOf(x));

            if (unique_cat_arr.length > 0) {
                var car_query = {};
                car_query['_id'] = { $in: unique_cat_arr };
                var cat_data = await CategoryService.getCategoriesSpecific(car_query, 0, 0)
            } else {
                cat_data = [];
            }
            for (var ct = 0; ct < cat_data.length; ct++) {
                cat_data[ct].url_name = cat_data[ct].name.replace(/\s+/g, '-').toLowerCase();
                cat_data[ct].url_name = cat_data[ct].url_name.replace(/[/]+/g, "_").toLowerCase();
            }

            var discount = {};
            var description = '';
            if (appointment.discount_id) {
                discount = await DiscountService.getDiscount(appointment.discount_id);
                if (discount.description) {
                    description = discount.description;
                }
            }
            var discount_slab_desc = '';
            if (appointment.discount_slab_id && appointment.discount_slab_id != '') {
                var discountSlab = await DiscountSlabService.getDiscountSlab(appointment.discount_slab_id);
                if (discountSlab) {
                    discount_slab_desc = discountSlab.desc
                }
            }
            var package_name = '';
            var total_session = 0;
            var available_session = 0;
            var package_detail = [];

            var group_data_flag = false;
            if (appointment?.group_data?.length > 0) {
                group_data_flag = true;
            }
            var permission_checked = 'checked';

            if (appointment.payment_type == 'paypal') {
                is_paypal = 1;
            } else {
                is_salon = 1;
            }

            var loc_name = ""
            if (location?.name) {
                loc_name = location?.name
                loc_name = loc_name.replace(/\s+/g, '-').toLowerCase()
                loc_name = loc_name.replace(/[(]+/g, "$").toLowerCase()
                loc_name = loc_name.replace(/[)]+/g, "&").toLowerCase()
                loc_name = loc_name.replace(/[/]+/g, "_").toLowerCase()
            }

            console.log('loc_name', loc_name)

            toMail = {
                'site_url': process.env.API_URL ? process.env.API_URL : "http://localhost:4200",
                'link_url': process.env.SITE_URL,
                'consultant_url': (process.env.SITE_URL ? process.env.SITE_URL : "http://localhost:4200") + "/client/consultation-form/" + appointment._id,
                'booking_preview_url': (process.env.SITE_URL ? process.env.SITE_URL : "http://localhost:4200") + "/booking-info/" + appointment._id,
                'unsubscribe_url': process.env.SITE_URL + "/unsubscribe/" + appointment.client_id[0]._id,
                'date': date,
                'company_name': company_name,
                'company_website': company_website,
                'company_logo': company_logo,
                'currency': company.currency ? company.currency.symbol : "£",
                'location_name': location?.name,
                'location_contact': location?.contact_number,
                'paypal_client_id': location?.paypal_client_id,
                'loc_name': loc_name,
                'data': appointment,
                'group_data_flag': group_data_flag,
                'description': description,
                'discount_slab_desc': discount_slab_desc,
                'package_data': package_detail,
                'available_session': available_session,
                'client_id': appointment.client_id[0]._id,
                'client_name': appointment.client_id[0].name,
                'client_email': appointment.client_id[0].email,
                'client_mobile': appointment.client_id[0].mobile,
                'services': services,
                'cat_data': cat_data,
                'is_paypal': is_paypal,
                'is_salon': is_salon,
                'grand_total': appointment.total_amount.toFixed(2),
                'total_paid_amount': total_paid_amount.toFixed(2),
                'total_used_gift_card_bal': total_used_gift_card_bal.toFixed(2),
                'total_remaining_amount': total_remaining_amount.toFixed(2),
                'permission_msg_flag': permission_checked,
                'permission_msg': 'By Clicking on the checkbox, user is giving their permission to receive email and sms confirmation. It is also confirmed that user shall be reminded for their session due, and other promotional offer from the ' + company_name + ' is only providing sms and email outbound facility to ' + company_name + '. if you want to opt-out from the offers, contact ' + company_name + ' directly.',
            };

            let html = "";
            let temFile = "booking_mail_preview.hjs";
            var gettingData = await getEmailTemplateData(company?._id, location?._id, 'booking_mail_preview', temFile);
            if (gettingData != null) {
                html = gettingData.contents;
            } else {
                html = "";
            }

            if (html != "") {
                var wtemplate = fs.writeFileSync('./templates/' + temFile, html, 'utf-8')
            }

            var rtemplate = fs.readFileSync('./templates/' + temFile, 'utf-8');
            var compiledTemplate = Hogan.compile(rtemplate);

            if (html == "") {
                var rtemplate = fs.readFileSync('./templates/backup/' + temFile, 'utf-8');
                var compiledTemplate = Hogan.compile(rtemplate);
            }

            let text = toMail
            htmlContext = await compiledTemplate.render({ text });
        }


        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: appointment, employee_data: employee_data, html_content: htmlContext ? htmlContext : '', email_data: toMail, message: "Successfully Appointment Received" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getAppointment = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id
        var Appointment = await AppointmentService.getAppointment(id)

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Appointment, message: "Successfully Appointment Received" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getReBookingAppointments = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var query = {}
        var service_query = {}
        var group_ser_query = {}
        var start_date = req.query.start_date
        var end_date = req.query.end_date

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        if (req.query.start_date && req.query.start_date != 'undefined' && req.query.end_date && req.query.end_date != 'undefined') {
            var row_date = new Date(start_date);
            // minus 30 day from start_date 
            row_date = row_date.setDate(row_date.getDate() - 30);
            var month_date = dateFormat(row_date, "yyyy-mm-dd");

            query['date'] = { $gte: month_date, $lte: req.query.end_date };

        }

        var client_query = {}
        var app = []
        query['booking_status'] = { $nin: ['cancel', 'no_shows'] }
        var appointment = await AppointmentService.getAppointmentSpecific(query)
        for (var i = 0; i < appointment?.length; i++) {
            service_query['_id'] = { $in: appointment[i].service_id }
            var service = await ServiceService.getServiceSpecific(service_query)
            appointment[i].service_id = service //services with name and price

            client_query['_id'] = { $in: appointment[i].client_id }
            var client = await CustomerService.getClients(client_query)
            appointment[i].client_id = client; //with name

            if (appointment[i].customer_package_id && appointment[i].customer_package_id?.length > 0) {
                var package_ids = appointment[i].customer_package_id.map(x => ObjectId(x))
                appointment[i].customer_package_id = await CustomerPackageService.getCustomerPackagesWithPackageData({ _id: { $in: package_ids } })
            }

            if (appointment[i].package_service && appointment[i].package_service.length > 0) {
                service_query['_id'] = { $in: appointment[i].package_service }
                var service = await ServiceService.getServiceSpecific(service_query)
                appointment[i].package_service = service //services with name and price
            }

            if (appointment[i].discount_services && appointment[i].discount_services.length > 0) {
                service_query['_id'] = { $in: appointment[i].discount_services }
                var service = await ServiceService.getServiceSpecific(service_query)
                appointment[i].discount_services = service; //services with name and price
            }

            if (appointment[i].group_data.length > 0) {
                for (var j = 0; j < appointment[i].group_data.length; j++) {
                    group_ser_query['_id'] = { $in: appointment[i].group_data[j].service_id };
                    var group_service = await ServiceService.getServiceSpecific(group_ser_query)
                    appointment[i].group_data[j].service_id = group_service
                }
            }

            for (var j = 0; j < service.length; j++) {
                if (parseInt(service[j].reminder) && parseInt(service[j].reminder) > 0) {
                    var date_object = new Date(appointment[i].date)
                    var service_date = date_object.setDate(date_object.getDate() + service[j].reminder)
                    // var service_date = date_object.setDate(date_object.getDate()+8);
                    var next_service_date = dateFormat(service_date, "yyyy-mm-dd")
                    if (service[j].reminder && next_service_date <= end_date && next_service_date >= start_date && client.length > 0) {
                        app.push(appointment[i])
                    }
                }
            }
        }

        // Return the appointment list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: app,
            message: "Successfully Appointments Received"
        })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getRescheduleUnreadBooking = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var query = { is_reschedule_readed: 1, reschedule_count: { $gt: 1 } }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        var today_date = new Date()
        var final_today_date = dateFormat(today_date, "yyyy-mm-dd")
        query['date'] = { $gte: final_today_date }

        var app = []
        var appointments = await AppointmentService.getAppointmentNotificationsUnreaded(query)

        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: app, message: "Successfully Unreaded Appointment Notifications Received" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.clearAllUnreadNotification = async function (req, res, next) {
    try {
        // Id is necessary for the update
        if (!req.query.location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present" })
        }

        var query = { location_id: req.query.location_id }
        var today_date = new Date()
        var final_today_date = dateFormat(today_date, "yyyy-mm-dd")
        query['date'] = { $gte: final_today_date }
        var getAppointments = await AppointmentService.getAppointmentData(query)
        query['_id'] = { $in: getAppointments }
        var updatedAppointment = await AppointmentService.updateBookingNotification(query)

        return res.status(200).json({ status: 200, flag: true, message: "Successfully Cleared Unreaded Notification of Booking" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateSpecificNotification = async function (req, res, next) {
    try {
        // Id is necessary for the update
        if (!req.body._id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
        }

        var updatedAppointment = await AppointmentService.updateBookingNotification(req.body)
        return res.status(200).json({ status: 200, flag: true, message: "Successfully Updated Notification of Booking" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createAppointment = async function (req, res, next) {
    try {
        var startTime = req.body?.start_time || ""
        var endTime = req.body?.end_time || ""

        var query = {}
        var client_query = {}
        var service_query = {}
        var group_ser_query = {}

        var cat_arr = []
        var group_booking_data = req.body?.group_data ? req.body.group_data : [];
        var group_booking_ids = [];

        var location_id = req.body.location_id;
        var location = await LocationService.getLocation(location_id)

        if (startTime) {
            req.body.start_time_meridiem = timeTomeridiem(startTime)
        }

        if (endTime) {
            req.body.end_time_meridiem = timeTomeridiem(endTime)
        }


        req.body.company_id = location?.company_id;
        req.body.group_booking_ids = group_booking_ids;
        req.body.grand_total = req.body.total_amount ? req.body.total_amount : 0;
        req.body.grand_total_price = req.body.total_amount ? req.body.total_amount : 0;
        req.body.grand_final_price = req.body.grand_final_price;
        req.body.grand_discounted_price = req.body.discounted_price;

        req.body.group_data = []

        var appointment = await AppointmentService.createAppointment(req.body);

        var updateDetail = updateDetailAfterCreateAppointment(req.body, appointment);

        return res.status(200).json({ status: 200, flag: true, data: appointment, refData: refData, message: "Appointment created successfully!" })
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

async function updateDetailAfterCreateAppointment(params, appointment) {
    try {
        var query = {}
        var client_query = {}
        var service_query = {}
        var group_ser_query = {}
        var total_session = 0
        var available_session = 0
        var package_name = ''
        var package_detail = [];

        var black_heart = params.black_heart ? "black_heart" : "normal"
        var cust_params = { _id: appointment.client_id[0], customer_heart: black_heart, location_id: appointment.location_id }

        var updatedUser = await CustomerService.updateCustomer(cust_params)

        var location = await LocationService.getLocation(appointment.location_id)

        var usedGiftCardBal = appointment?.used_gift_card_bal || params?.used_gift_card_bal || 0;
        if (usedGiftCardBal) {
            var giftParam = {
                company_id: appointment.company_id,
                location_id: appointment.location_id,
                customer_id: appointment.client_id[0],
                service_ids: appointment?.service_id || [],
                amount: usedGiftCardBal,
                appointment_id: appointment?._id || null,
                transaction_description: "Appointment booking"
            }

            var debitData = await debitCustomerGiftCardBalance(giftParam);
            if (debitData?.transaction_ids && debitData.transaction_ids?.length) {
                await AppointmentService.updateAppointment({
                    _id: appointment._id,
                    used_gift_card_bal: usedGiftCardBal,
                    gift_card_transaction_id: debitData.transaction_ids
                });
            }
        }

        if (appointment.loyalty_card_data && appointment.loyalty_card_data.length > 0) {
            var l_card = appointment.loyalty_card_data;
            for (var l = 0; l < l_card.length; l++) {
                var card_data = {
                    location_id: appointment.location_id,
                    loyalty_card_id: l_card[l].loyalty_card_id,
                    customer_loyalty_card_id: l_card[l].customer_loyalty_card_id,
                    appointment_id: appointment._id,
                    customer_id: appointment.client_id[0],
                    consume: 1,
                    date: params.date,
                    createdAt: appointment.createdAt
                }
                var customerLoyaltyCardLog = await CustomerLoyaltyCardLogService.createCustomerLoyaltyCardLog(card_data)
            }
        }

        if (appointment.discount_id) {
            var disData = { appointment_id: appointment._id, user_id: appointment.client_id[0], location_id: appointment.location_id, discount_id: appointment.discount_id, discount_code: appointment.discount_code };
            if (appointment.offer_discount_code) {
                disData.discount_code = appointment.offer_discount_code;
            }
            var createdAppliedDiscount = await AppliedDiscountService.createAppliedDiscount(disData)
        }


        var permission_msg_flag = 1;
        var permission_checked = 'checked';

        var company = { name: '' }
        var company_name = ""
        var company_website = ""
        var company_logo = ""
        if (location?.company_id) {
            company = await CompanyService.getCompany(location?.company_id)
            company_name = company?.name ?? '';
            company_website = company?.contact_link ?? '';
            company_logo = company?.image ?? ''
        }
        var currency = company.currency ? company.currency.symbol : "£"


        client_query['_id'] = { $in: appointment.client_id }
        var client = await CustomerService.getClients(client_query)
        appointment.client_id = client //with name

        var is_paypal = 0
        var is_salon = 0
        var total_paid_amount = 0
        var total_remaining_amount = 0
        var grand_total = 0

        var service = appointment.service_data.map(s => s?.service_id[0]);
        if (appointment.location_id && appointment.location_id != undefined) {
            service_query['location_id'] = appointment.location_id
            client_query['location_id'] = appointment.location_id
        }

        var dateObj = new Date(appointment.date)
        var dayOfMonth = dateObj.getDate()
        var weekday = dateObj.toLocaleString("default", { weekday: "long" })
        var month = dateObj.toLocaleString('default', { month: 'long' })
        var date = dateFormat(appointment.date, "dd-mm-yyyy")

        appointment.service_id = service //services with name and price
        if (service && service.length > 0) {
            cat_arr = service.map(s => s.category_id) //main user category
        }

        total_paid_amount += parseFloat(appointment.paid_amount)
        total_remaining_amount += parseFloat(appointment.remaining_amount)
        grand_total += parseFloat(appointment.total_amount)

        appointment.paid_amount = parseFloat(appointment.paid_amount).toFixed(2)
        appointment.remaining_amount = parseFloat(appointment.remaining_amount).toFixed(2)
        appointment.total_amount = parseFloat(appointment.total_amount).toFixed(2)

        var servicesEmp = ''
        for (var i = 0; i < appointment.service_data.length; i++) {
            var empData = await UserService.getUserById(appointment.service_data[i].employee_id)
            //service_query['_id'] = { $in: appointment.service_data[i].service_id }
            var serData = appointment.service_data[i].service_id
            var serName = serData.map((item) => { return item.name }).join(', ')
            if (i == 0) {
                servicesEmp += serName + ' (Booked with ' + empData.name + ')'
            } else {
                servicesEmp += ', ' + serName + ' (Booked with ' + empData.name + ')'
            }
        }

        unique_cat_arr = cat_arr.filter((x, i) => i === cat_arr.indexOf(x))
        var cat_data = []
        if (unique_cat_arr && unique_cat_arr?.length > 0) {
            var car_query = {}
            car_query['_id'] = { $in: unique_cat_arr }
            cat_data = await CategoryService.getCategoriesSpecific(car_query)
        }

        for (var ct = 0; ct < cat_data.length; ct++) {
            cat_data[ct].url_name = cat_data[ct].name.replace(/\s+/g, '-').toLowerCase()
            cat_data[ct].url_name = cat_data[ct].url_name.replace(/[/]+/g, "_").toLowerCase()
        }

        if (appointment._id && appointment.client_id && appointment.client_id[0]._id && params.source_url != 'customer-mobile') {
            let notificationPayload = {
                token: '',
                notification: {
                    title: "Appointment Booked",
                    body: "Appointment booked by " + appointment.client_id[0].name + " at " + company_name + " " + location?.name + " branch",

                }, data: {
                    type: "appointment",
                    id: appointment._id.toString(),
                }
            };

            let notiData = {
                location_id: location?._id,
                client_id: appointment.client_id[0]._id,
                noti_type: "new appointment",
            }

            let notificationResponse = PushNotificationService.sendPushNotification(notificationPayload, notiData);
        }

        if (!params.stop_email_sms && !params.patch_test_booking) {
            var discount = {}
            var description = ''
            if (appointment.discount_id) {
                discount = await DiscountService.getDiscount(appointment.discount_id)
                if (discount.description) {
                    description = discount.description
                }
            }

            var group_data_flag = false
            if (appointment.group_data && appointment.group_data.length > 0) {
                group_data_flag = true
            }

            if (appointment.payment_type == 'paypal') {
                is_paypal = 1
            } else {
                is_salon = 1
            }

            var loc_name = ""
            if (location?.name) {
                loc_name = location?.name
                loc_name = loc_name.replace(/\s+/g, '-').toLowerCase()
                loc_name = loc_name.replace(/[(]+/g, "$").toLowerCase()
                loc_name = loc_name.replace(/[)]+/g, "&").toLowerCase()
                loc_name = loc_name.replace(/[/]+/g, "_").toLowerCase()
            }

            var toMail = {}
            toMail['site_url'] = process.env.API_URL
            toMail['link_url'] = process.env.SITE_URL
            toMail['consultant_url'] = process.env.SITE_URL + "/client/consultation-form/" + appointment._id
            toMail['booking_preview_url'] = process.env.SITE_URL + "/booking-info/" + appointment._id
            toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + appointment.client_id[0]._id
            toMail['date'] = date
            toMail['loc_name'] = loc_name
            toMail['front_url'] = process.env.FRONT_URL
            toMail['company_name'] = company_name
            toMail['company_website'] = company_website
            toMail['company_logo'] = company_logo
            toMail['currency'] = company.currency ? company.currency.symbol : "£"
            toMail['location_name'] = location?.name
            toMail['location_contact'] = location?.contact_number
            toMail['location_domain'] = location?.domain
            toMail['data'] = appointment
            toMail['group_data_flag'] = group_data_flag
            toMail['description'] = description
            toMail['discount_slab_desc'] = discount_slab_desc
            toMail['package_data'] = package_detail
            toMail['package_name'] = package_name
            toMail['total_session'] = total_session
            toMail['available_session'] = parseInt(total_session) - parseInt(available_session)
            toMail['client_id'] = appointment.client_id[0]._id
            toMail['client_name'] = appointment.client_id[0].name
            toMail['client_email'] = appointment.client_id[0].email
            toMail['client_mobile'] = appointment.client_id[0].mobile
            toMail['services'] = services
            toMail['servicesEmp'] = servicesEmp
            toMail['cat_data'] = cat_data
            toMail['is_paypal'] = is_paypal
            toMail['is_salon'] = is_salon
            toMail['grand_total'] = parseFloat(grand_total).toFixed(2)
            toMail['total_paid_amount'] = parseFloat(total_paid_amount).toFixed(2)
            toMail['total_remaining_amount'] = parseFloat(total_remaining_amount).toFixed(2)
            toMail['permission_msg_flag'] = permission_msg_flag
            toMail['permission_checked'] = permission_checked

            if (params.is_unsubscribed) {
                toMail['permission_msg'] = 'By booking your appointment, you are accepting our privacy policy. You are also providing us with your consent to store your data and use it for your treatment purposes. We respect that your privacy and acknowledged already that you don’t want us to send any promotional offers. Clicking here, doesn’t allow us to send you promotional offers such as birthday reminders, special discounts. To opt-in again, kindly contact ' + company_name + '.'
            } else {
                toMail['permission_msg'] = 'By booking your appointment, you are accepting our privacy policy. You are also providing us with your consent to store your data and use it for your treatment purposes. Additionally, by agreeing, you are allowing us to share our promotional offers and newsletters with you via email, text platforms such as WhatsApp and SMS. If you do not wish to receive any texts or emails other than appointment confirmations, please contact the branch with which you are trying to book your appointment.'
            }

            if (is_paypal) {
                toMail['payment_msg'] = 'Dear ' + appointment.client_id[0].name + ',<br/>We charge ' + toMail['currency'] + toMail['total_paid_amount'] + ' as a deposit for the treatment(s) you are selecting. To cover the cost of Booking, If you are unable to attend your appointment for any reason, we will not refund this deposit to you under any circumstances. When you are booking the appointment with us means you are accepting this term. <br/>It will be our pleasure to serve you, <br/>' + company_name;
            }

            if (!params.stop_email_sms && appointment.client_id[0].email && appointment.client_id[0].email != '') {
                var to = appointment.client_id[0].email
                var name = appointment.client_id[0].name
                var subject = "Appointment booked by " + appointment.client_id[0].name + " at " + company_name + " " + location?.name + " branch"

                var html = "";
                var temFile = "appointment_mail.hjs"
                var gettingData = await getEmailTemplateData(company?._id, location?._id, 'client_appointment_booking', temFile);
                if (gettingData != null) {
                    html = gettingData.contents
                } else {
                    html = ""
                }

                var sendEmail = SendEmailSmsService.sendMailAwait(to, name, subject, temFile, html, toMail, 'transaction', location?._id, location?.company_id)

                var emailData = {
                    company_id: location?.company_id,
                    location_id: location?._id,
                    client_id: appointment.client_id[0]._id,
                    subject: subject,
                    name: name,
                    type: "single",
                    file_type: "client_appointment_booking",
                    temp_file: temFile,
                    html: '',
                    data: toMail,
                    date: Date(),
                    to_email: to,
                    status: "Sent",
                    response: null,
                    response_status: 'Sent',
                    email_type: 'transaction'
                }

                if (sendEmail && sendEmail?.status) {
                    emailData.response = sendEmail.response;
                    emailData.response_status = sendEmail.status;
                    emailData.status = sendEmail.status;
                }

                var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
                var tillDate = increaseDateDays(new Date, days)
                if (tillDate) {
                    emailData.till_date = tillDate
                }

                var eLog = await EmailLogService.createEmailLog(emailData)
            }
            //Client booking mail end

        }

        if (!params.stop_email_sms && !params.patch_test_booking) {
            var booking_msg_val = '';
            var customParaVal = await getCustomParameterData(location?.company_id, appointment.location_id, 'booking');

            if (customParaVal && customParaVal?.formData && customParaVal?.formData?.booking_status) {
                booking_msg_val = customParaVal?.formData?.booking_message || '';

            }
            var msg = "";
            var booking_link = process.env.SITE_URL + "/booking-info/" + appointment._id
            if (booking_msg_val) {
                booking_msg_val = booking_msg_val.replace('{start_time}', appointment.start_time);
                booking_msg_val = booking_msg_val.replace('{day_of_month}', dayOfMonth);
                booking_msg_val = booking_msg_val.replace('{month}', month);
                booking_msg_val = booking_msg_val.replace('{organisation_name}', company?.name);
                booking_msg_val = booking_msg_val.replace('{location_name}', location?.name);
                booking_msg_val = booking_msg_val.replace('{branch_number}', location?.contact_number);

                msg = booking_msg_val;

                var number = appointment.client_id[0].mobile; //without + sign
                number = parseInt(number, 10)

                var subject = "Booking"

                var host = process.env.SITE_URL + "/service/"
                var smslink = ""
                var fullSmsLink = booking_link
                var loc_name = ""
                if (location?.name) {
                    loc_name = location?.name
                    loc_name = loc_name.replace(/\s+/g, '-').toLowerCase()
                    loc_name = loc_name.replace(/[(]+/g, "$").toLowerCase()
                    loc_name = loc_name.replace(/[)]+/g, "&").toLowerCase()
                    loc_name = loc_name.replace(/[/]+/g, "_").toLowerCase()
                }

                if (service.length > 0) {
                    cat_arr = service.map(s => s.category_id); //get al main user category  
                }

                var link = booking_link
                var unique_id = (new Date()).getTime().toString(36)
                var short_link = await SendEmailSmsService.generateShortLink(link, unique_id)
                if (short_link && short_link != '') {
                    fullSmsLink = short_link
                }

                smslink = fullSmsLink
                if (smslink) {
                    msg += " " + smslink + " "
                }

                var days = process.env?.SMS_MAX_DATE_LIMIT || 2
                var tillDate = increaseDateDays(new Date, days)

                var is_wa_exist = appointment.client_id[0].wa_verified ?? 0;
                var is_WA_set = await getWhatsAppDetails(location?._id)
                console.log('is_WA_set', is_WA_set, 'is_wa_exist', is_wa_exist)
                if (is_wa_exist && is_WA_set) {
                    var waMsgData = {
                        company_id: location?.company_id,
                        location_id: location?._id,
                        client_id: appointment.client_id[0]._id,
                        type: "direct",
                        msg_type: "booking_sms",
                        date: Date(),
                        mobile: appointment.client_id[0].mobile,
                        content: msg,
                        status: "initial",
                        till_date: tillDate ?? null
                    }

                    await WhatsAppLogService.createWhatsAppLog(waMsgData)
                }

                if (!is_wa_exist || !is_WA_set) {
                    var country_code = company.country_code ? company.country_code : 44
                    var params = {
                        Message: msg,
                        PhoneNumber: '+' + country_code + number
                    }

                    numSegments = 0
                    var smsData = {
                        company_id: location?.company_id,
                        location_id: location?._id,
                        client_id: appointment.client_id[0]._id,
                        sms_type: "booking_sms",
                        date: Date(),
                        mobile: appointment.client_id[0].mobile,
                        content: msg,
                        sms_count: numSegments,
                        sms_setting: location?.sms_setting,
                        status: "initial",
                        till_date: tillDate ?? null
                    }
                    var smsLog = await SmslogService.createSmsLog(smsData)
                    if (smsLog && smsLog._id) {
                        var sendSms = await SendEmailSmsService.sendSMS(params, location?._id || "", '', 'direct')
                        if (sendSms) {
                            numSegments = sendSms?.numSegments ? parseInt(sendSms.numSegments) : 1
                            var smsData = {
                                _id: smsLog._id,
                                sms_count: numSegments,
                                sms_response: JSON.stringify(sendSms),
                                response_status: sendSms?.status || "",
                                status: "processed"
                            }

                            if (location?.sms_setting == "twillio") {
                                smsData.sms_response = null
                                smsData.twillio_response = JSON.stringify(sendSms)
                            }

                            await SmslogService.updateSmsLog(smsData)
                        }
                    }
                }
            }
        }

        return true;
    } catch (e) {
        console.log(e)
        return null;
    }
}

// for Quick Contact after appointment booked
exports.sendMsgAppointment = async function (req, res, next) {
    // Id is necessary for the update
    try {
        if (!req.body?.message) {
            return res.status(200).json({ status: 200, flag: false, message: "Message must be present" })
        }
        var toMail = {}
        toMail['site_url'] = process.env?.API_URL || ""
        toMail['link_url'] = process.env?.SITE_URL || ""

        var to = req.body?.email || ""
        var name = req.body?.name || ""
        var message = req.body?.message || ""
        var html = ""
        var company_id = null
        var company_name = ""
        var company_website = ""
        var company_logo = ""

        var customer = await CustomerService.getCustomer(req.body.client_id)
        if (req.body.location_id != "") {
            var location = await LocationService.getLocation(req.body.location_id)
            company_id = location?.company_id
            var company = await CompanyService.getCompany(company_id)
            if (company.name) {
                company_name = company.name
            }

            if (company.contact_link) {
                company_website = company.contact_link
            }

            if (company.image) {
                company_logo = company.image
            }

            toMail['client_id'] = req.body.client_id
            toMail['client_name'] = name
            toMail['message'] = message
            toMail['location_name'] = location?.name
            toMail['location_contact'] = location?.contact_number
            toMail['location_domain'] = location?.domain
            toMail['company_name'] = company_name
            toMail['front_url'] = process.env.FRONT_URL
            toMail['company_website'] = company_website
            toMail['company_logo'] = company_logo
            toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + req.body.client_id
        }

        if (!req.body.stop_email_sms && customer.email && customer.email != '' && customer.email_notification != 0) {
            var subject = "About your recent booking";
            var temFile = "app_booked_contact.hjs";
            var fileType = "appointment_booked_client_contact";

            var gettingData = await getEmailTemplateData(company_id, location?._id, 'appointment_booked_client_contact', temFile);
            if (gettingData != null) {
                html = gettingData.contents
            } else {
                html = ""
            }

            var sendEmail = SendEmailSmsService.sendMailAwait(to, name, subject, temFile, html, toMail, 'transaction', location?._id, location?.company_id)

            var emailData = {
                company_id: location?.company_id,
                location_id: location?._id,
                client_id: req.body.client_id,
                subject: subject,
                name: name,
                type: "single",
                file_type: "appointment_booked_client_contact",
                temp_file: temFile,
                html: '',
                data: toMail,
                date: Date(),
                to_email: to,
                status: "Sent",
                response: null,
                response_status: 'Sent',
                email_type: 'transaction'
            }

            if (sendEmail && sendEmail?.status) {
                emailData.response = sendEmail.response;
                emailData.response_status = sendEmail.status;
                emailData.status = sendEmail.status;
            }

            var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
            var tillDate = increaseDateDays(new Date, days)
            if (tillDate) {
                emailData.till_date = tillDate
            }

            var eLog = EmailLogService.createEmailLog(emailData)
        }

        if (!req.body.stop_email_sms && customer.mobile && customer.mobile != '' && customer.sms_notification != 0) {
            var number = req.body.mobile //without + sign
            number = parseInt(number, 10) // 58
            var subject = "Booking"
            var msg = "Dear " + name + ',' + '\n' + message

            var days = process.env?.SMS_MAX_DATE_LIMIT || 2
            var tillDate = increaseDateDays(new Date, days)

            var is_wa_exist = customer.wa_verified ?? 0;
            var is_WA_set = await getWhatsAppDetails(location?._id)

            if (is_wa_exist && is_WA_set) {
                var waMsgData = {
                    company_id: location?.company_id,
                    location_id: location?._id,
                    client_id: req.body.client_id,
                    type: "direct",
                    msg_type: "quick_contact_appointment",
                    date: Date(),
                    mobile: req.body.mobile,
                    content: msg,
                    status: "initial",
                    till_date: tillDate ?? null
                }
                await WhatsAppLogService.createWhatsAppLog(waMsgData)

                var waSend = await SendEmailSmsService.sendWhatsAppTextMessage({
                    PhoneNumber: req.body.mobile,
                    Message: msg
                }, location?._id || "", req.body.client_id, 'direct')

                if (waSend && waSend?.status) {
                    await WhatsAppLogService.updateWhatsAppLog({
                        _id: waSend._id,
                        response: waSend,
                        response_status: waSend.status,
                        status: waSend.status
                    })
                }
            }

            if (!is_wa_exist || !is_WA_set) {
                var country_code = company.country_code ? company.country_code : 44
                var params = {
                    Message: msg,
                    PhoneNumber: '+' + country_code + number
                }

                var numSegments = 0
                var smsData = {
                    company_id: location?.company_id,
                    location_id: location?._id,
                    booking_id: req.body.booking_id,
                    booking_date: req.body.booking_date,
                    user_id: req.body.user_id,
                    client_id: req.body.client_id,
                    sms_type: "quick_contact_appointment",
                    date: Date(),
                    mobile: req.body.mobile,
                    content: msg,
                    sms_count: numSegments,
                    sms_setting: location?.sms_setting,
                    status: "initial",
                    till_date: tillDate ?? null
                }

                var smsLog = await QuickSmsLogService.createQuickSmsLog(smsData)
                if (smsLog && smsLog._id) {
                    var sendSms = await SendEmailSmsService.sendSMS(params, location?._id || "", '', 'direct')
                    if (sendSms) {
                        numSegments = sendSms.numSegments ? parseInt(sendSms.numSegments) : 1
                        await QuickSmsLogService.updateQuickSmsLog({
                            _id: smsLog._id,
                            sms_count: numSegments,
                            sms_response: JSON.stringify(sendSms),
                            response_status: sendSms?.status || "",
                            status: "processed"
                        })
                    }
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, message: "Booked Appointment Message Sent..." })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateAppointment = async function (req, res, next) {
    try {
        // Id is necessary for the update
        if (!req.body._id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
        }

        var group_booking_data = []
        if (req.body.start_time) {
            var stime = req.body.start_time
            var stimeToNum = timeToNum(req.body.start_time)
            stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM'

            var showStartTimeSpilt = stime.split(':')
            var end_hour = showStartTimeSpilt[0]
            end_hour = end_hour > 12 ? end_hour - 12 : end_hour
            showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
            stime = showStartTimeSpilt.join(':')
            req.body.start_time_meridiem = stime + " " + stimeToNum
        }

        if (req.body.end_time) {
            var etime = req.body.end_time
            var etimeToNum = timeToNum(req.body.end_time)
            etimeToNum = etimeToNum >= 720 ? 'PM' : 'AM'

            var showEndTimeSpilt = etime.split(':')
            var end_hour = showEndTimeSpilt[0]
            end_hour = end_hour > 12 ? end_hour - 12 : end_hour
            showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
            etime = showEndTimeSpilt.join(':')
            req.body.end_time_meridiem = etime + " " + etimeToNum
        }
        var pre_app = await AppointmentService.getAppointment(req.body._id);
        req.body.company_id = null;
        var appointment = await AppointmentService.updateAppointment(req.body)

        var black_heart = req.body.black_heart ? "black_heart" : "normal"
        var cust_params = { _id: appointment.client_id[0], customer_heart: black_heart }
        var updatedUser = await CustomerService.updateCustomer(cust_params)

        if (req.body.group_booking_affect && appointment.group_booking_ids.length > 0) {
            if (appointment.booking_status == 'cancel' || appointment.booking_status == 'no_shows') {
                var g_app = await AppointmentService.updateManyBookingStatus({ _id: { $in: appointment.group_booking_ids } }, appointment.booking_status)
            }
        }
        var updateDetail = updateDetailAfterUpdateAppointment(req.body, appointment);

        return res.status(200).json({
            status: 200,
            flag: true,
            data: appointment,
            group_booking_data: group_booking_data,
            refData: refData,
            message: "Appointment updated successfully!"
        })
    } catch (e) {
        console.log('e', e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

async function updateDetailAfterUpdateAppointment(params, appointment) {
    try {
        var consultant_data = await ConsultantFormService.getConsultantFormsSpecific({ booking_id: params._id })

        if (appointment.discount_id) {
            var disData = { appointment_id: appointment._id, user_id: appointment.client_id[0], location_id: appointment.location_id, discount_id: appointment.discount_id, discount_code: appointment.discount_code };
            if (appointment.offer_discount_code) {
                disData.discount_code = appointment.offer_discount_code;
            }
            var disQuery = { appointment_id: appointment._id }
            var createdAppliedDiscount = await AppliedDiscountService.addOrUpdateData(disQuery, disData)
        }

        var total_session = 0;
        var available_session = 0;
        var package_name = '';
        if (params.old_loyalty_card_data && params.old_loyalty_card_data.length > 0) {
            var card_data = {
                location_id: appointment.location_id,
                appointment_id: appointment._id
            }

            var customerCardLogDelete = await CustomerLoyaltyCardLogService.deleteMultiple(card_data)
        }
        var location = await LocationService.getLocation(appointment.location_id)
        var companyId = appointment?.company_id?._id || appointment?.company_id || "";
        var locationId = appointment?.location_id?._id || appointment?.location_id || "";
        var customerId = appointment.client_id[0]?._id || appointment.client_id[0] || "";

        var customParaVal = await getCustomParameterData(location?.company_id, appointment.location_id, 'booking');
        if (customParaVal && customParaVal?.formData) {
        }

        var usedGiftCardBal = appointment?.used_gift_card_bal || params?.used_gift_card_bal || 0;
        if (usedGiftCardBal && !appointment?.gift_card_transaction_id?.length) {
            var serviceIds = appointment.service_id.map((item) => {
                return item?._id || item;
            });

            var giftParam = {
                company_id: companyId,
                location_id: locationId,
                customer_id: customerId,
                service_ids: serviceIds || [],
                amount: usedGiftCardBal,
                appointment_id: appointment?._id || null,
                transaction_description: "Appointment booking"
            }

            var debitData = await debitCustomerGiftCardBalance(giftParam);
            if (debitData?.transaction_ids && debitData.transaction_ids?.length) {
                await AppointmentService.updateAppointment({
                    _id: appointment._id,
                    used_gift_card_bal: usedGiftCardBal,
                    gift_card_transaction_id: debitData.transaction_ids,
                    removed_gift_card_transaction_id: []
                });

                appointment.used_gift_card_bal = usedGiftCardBal;
            }
        }

        if (appointment.loyalty_card_data && appointment.loyalty_card_data.length > 0 && appointment.booking_status != 'cancel' && appointment.booking_status != 'no_shows') {
            var l_card = appointment.loyalty_card_data
            for (var l = 0; l < l_card.length; l++) {
                var checkCard = await CustomerLoyaltyCardLogService.getCustomerLoyaltyCardLogsSpecific({ appointment_id: ObjectId(appointment._id) })

                if (checkCard.length == 0) {
                    var card_data = {
                        location_id: appointment.location_id,
                        loyalty_card_id: l_card[l].loyalty_card_id,
                        customer_loyalty_card_id: l_card[l].customer_loyalty_card_id,
                        appointment_id: appointment._id,
                        customer_id: appointment.client_id[0],
                        consume: 1,
                        date: params.date,
                        createdAt: appointment.createdAt
                    }

                    var customerLoyaltyCardLog = await CustomerLoyaltyCardLogService.createCustomerLoyaltyCardLog(card_data)
                }
            }
        }


        var service_query = {}
        var group_ser_query = {}
        var client_query = {}
        var query = {}

        var cat_arr = []
        var app_reward = []
        var discount_slab_desc = ""

        var location = await LocationService.getLocation(appointment.location_id)


        if (appointment.discount_slab_id && appointment.discount_slab_id != '') {
            var check_qry = { customer_id: appointment.client_id[0], appoitment_id: appointment._id?.toString(), action: 'redeem', discount_slab_id: appointment.discount_slab_id }
            app_reward = await CustomerRewardService.getSpecificCustomerRewards(check_qry)

            var discountSlab = await DiscountSlabService.getDiscountSlab(appointment.discount_slab_id)
            if (discountSlab && app_reward?.length == 0) {
                discount_slab_desc = discount_slab_desc.desc
                var booking_amt = appointment.grand_total
                var last_reward_query = { customer_id: appointment.client_id[0], company_id: location?.company_id }
                var last_reward = await CustomerRewardService.getCustomerLastRewards(last_reward_query)
                var last_total_points = 0
                if (last_reward && last_reward.length > 0) {
                    last_total_points = last_reward[0].total_points
                }

                var total_points = parseFloat(last_total_points) - parseFloat(discountSlab.no_of_points)

                var reward_data = {
                    company_id: location?.company_id,
                    location_id: appointment.location_id,
                    customer_id: appointment.client_id[0],
                    appoitment_id: appointment._id,
                    amount: booking_amt,
                    redeem_points: discountSlab.no_of_points.toFixed(2),
                    total_points: total_points.toFixed(2),
                    date: Date(),
                    action: 'redeem',
                    discount_slab_id: appointment.discount_slab_id
                }

                var cust_reward = await CustomerRewardService.createCustomerReward(reward_data)
            }
        }

        app_reward = []
        if (appointment.booking_status == 'complete') {
            var check_qry = { customer_id: appointment.client_id[0], appoitment_id: appointment._id?.toString(), action: 'gain' }
            app_reward = await CustomerRewardService.getSpecificCustomerRewards(check_qry)
        }

        if (params.reschedule != 1 && params.booking_status == 'cancel') {
            var dateObj = new Date(appointment.date)
            var dayOfMonth = dateObj.getDate()
            var weekday = dateObj.toLocaleString("default", { weekday: "long" })
            var month = dateObj.toLocaleString('default', { month: 'long' })
            var date = dateFormat(appointment.date, "dd-mm-yyyy")
            var m_date = dateFormat(appointment.date, "dd mmm-yyyy")

            var company = { name: '' };
            if (location?.company_id) {
                company = await CompanyService.getCompany(location?.company_id)
            }

            client_query['_id'] = { $in: appointment.client_id }
            var client = await CustomerService.getClients(client_query)
            appointment.client_id = client //with name

            if (appointment._id && appointment.client_id && appointment.client_id[0]._id && params.source_url != 'customer-mobile') {
                let notificationPayload = {
                    token: '',
                    notification: {
                        title: "Appointment Cancelled",
                        body: "Appointment cancelled at " + company.name + " " + location?.name + " branch with " + appointment.client_id[0].name + " on " + m_date

                    }, data: {
                        type: "appointment",
                        id: appointment._id?.toString(),
                    }
                };

                let notiData = {
                    location_id: location?._id,
                    client_id: appointment.client_id[0]._id,
                    noti_type: "cancel appointment",
                }

                let notificationResponse = PushNotificationService.sendPushNotification(notificationPayload, notiData);
            }

            var toMail = {}
            toMail['site_url'] = process.env.API_URL;
            toMail['link_url'] = process.env.SITE_URL;
            toMail['date'] = date;
            toMail['location_name'] = location?.name;
            toMail['location_contact'] = location?.contact_number;
            toMail['location_domain'] = location?.domain;
            toMail['company_name'] = company_name;
            toMail['front_url'] = process.env.FRONT_URL;
            toMail['data'] = appointment;
            toMail['client_id'] = appointment.client_id[0]._id;
            toMail['client_name'] = appointment.client_id[0].name
            toMail['client_email'] = appointment.client_id[0].email
            toMail['client_mobile'] = appointment.client_id[0].mobile
            toMail['currency'] = company.currency ? company.currency.symbol : "£"
            //Client booking mail start
            toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + appointment.client_id[0]._id

            if (!params.stop_email_sms && !params.patch_test_booking && appointment.client_id[0].email && appointment.client_id[0].email != '') {
                var to = appointment.client_id[0].email;
                var name = appointment.client_id[0].name;
                var subject = "Appointment cancelled at " + company.name + " " + location?.name + " branch with " + appointment.client_id[0].name + " on " + m_date;

                var html = "";
                var temFile = "cancel_appointment_mail.hjs";
                var gettingData = await getEmailTemplateData(company?._id, location?._id, 'client_cancel_appointment_booking', temFile);
                if (gettingData != null) {
                    html = gettingData.contents;
                } else {
                    html = "";
                }

                var sendEmail = SendEmailSmsService.sendMailAwait(to, name, subject, temFile, html, toMail, 'transaction', location?._id, location?.company_id);

                var emailData = {
                    company_id: location?.company_id,
                    location_id: location?._id,
                    client_id: appointment.client_id[0]._id,
                    subject: subject,
                    name: name,
                    type: "single",
                    file_type: "client_cancel_appointment_booking",
                    temp_file: temFile,
                    html: '',
                    data: toMail,
                    date: Date(),
                    to_email: to,
                    status: "Sent",
                    response: null,
                    response_status: 'Sent',
                    email_type: 'transaction'
                }

                if (sendEmail && sendEmail?.status) {
                    emailData.response = sendEmail.response;
                    emailData.response_status = sendEmail.status;
                    emailData.status = sendEmail.status;
                }

                var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                var tillDate = increaseDateDays(new Date, days);
                if (tillDate) { emailData.till_date = tillDate; }

                var eLog = await EmailLogService.createEmailLog(emailData)
            }

            //Client booking mail end

            if (!params.stop_email_sms && !params.patch_test_booking && appointment.client_id[0].mobile && appointment.client_id[0].mobile != '') {
                var number = appointment.client_id[0].mobile //without + sign
                number = parseInt(number, 10)

                var booking_msg_val = await getCustomParameterData(location?.company_id, appointment.location_id, 'cancel_booking');
                var msg = ""
                if (booking_msg_val && booking_msg_val?.formData && booking_msg_val?.formData?.cancel_booking_status && booking_msg_val?.formData?.cancel_booking_message) {

                    booking_msg_val = booking_msg_val?.formData?.cancel_booking_message;

                    booking_msg_val = booking_msg_val.replace('{start_time}', appointment.start_time);
                    booking_msg_val = booking_msg_val.replace('{day_of_month}', dayOfMonth);
                    booking_msg_val = booking_msg_val.replace('{month}', month);
                    booking_msg_val = booking_msg_val.replace('{organisation_name}', company.name);
                    booking_msg_val = booking_msg_val.replace('{location_name}', location?.name);
                    booking_msg_val = booking_msg_val.replace('{branch_number}', location?.contact_number);
                    msg = booking_msg_val;

                    var days = process.env?.SMS_MAX_DATE_LIMIT || 2
                    var tillDate = increaseDateDays(new Date, days)

                    var is_wa_exist = appointment.client_id[0].wa_verified ?? 0;
                    var is_WA_set = await getWhatsAppDetails(location?._id)

                    if (is_wa_exist && is_WA_set) {
                        var waMsgData = {
                            company_id: location?.company_id,
                            location_id: location?._id,
                            client_id: appointment.client_id[0]._id,
                            type: "direct",
                            msg_type: "cancel_booking_sms",
                            date: Date(),
                            mobile: appointment.client_id[0].mobile,
                            content: msg,
                            status: "initial",
                            till_date: tillDate ?? null
                        }

                        await WhatsAppLogService.createWhatsAppLog(waMsgData)
                    }

                    if (!is_wa_exist || !is_WA_set) {
                        var country_code = company.country_code ? company.country_code : 44
                        var params = {
                            Message: msg,
                            PhoneNumber: '+' + country_code + number
                        }

                        var numSegments = 0
                        var smsData = {
                            company_id: location?.company_id,
                            location_id: location?._id,
                            client_id: appointment.client_id[0]._id,
                            sms_type: "cancel_booking_sms",
                            date: Date(),
                            mobile: appointment.client_id[0].mobile,
                            content: msg,
                            sms_count: numSegments,
                            sms_setting: location?.sms_setting,
                            status: "initial",
                            till_date: tillDate ?? null
                        }

                        var smsLog = await SmslogService.createSmsLog(smsData)
                        if (smsLog && smsLog._id) {
                            var sendSms = await SendEmailSmsService.sendSMS(params, location?._id || "", '', 'direct')
                            if (sendSms) {
                                numSegments = sendSms?.numSegments ? parseInt(sendSms.numSegments) : 1

                                var smsData = {
                                    _id: smsLog._id,
                                    sms_count: numSegments,
                                    sms_response: JSON.stringify(sendSms),
                                    response_status: sendSms?.status || "",
                                    status: "processed"
                                }
                                if (location?.sms_setting == "twillio") {
                                    smsData.sms_response = null
                                    smsData.twillio_response = JSON.stringify(sendSms)
                                }

                                await SmslogService.updateSmsLog(smsData)
                            }
                        }
                    }
                }
            }
        } else if (params.reschedule == 1 && params.booking_status != 'cancel') {
            if (appointment.group_booking_ids && appointment.group_booking_ids.length == 0) {
                var id = [appointment._id?.toString()]
                var cgb_query = { group_booking_ids: { $elemMatch: { $in: id } } }
                var check_group_booking_data = await AppointmentService.getAppointmentSpecific(cgb_query)
                if (check_group_booking_data && check_group_booking_data.length > 0 && check_group_booking_data[0].group_booking_ids.length > 0) {
                    appointment.group_booking_ids = check_group_booking_data[0].group_booking_ids
                    var g_ind = appointment.group_booking_ids.indexOf(appointment._id?.toString())
                    if (g_ind !== -1) {
                        appointment.group_booking_ids.splice(g_ind, 1)
                    }

                    appointment.group_booking_ids.push(check_group_booking_data[0]._id?.toString())
                }
            }

            var dateObj = new Date(appointment.date);
            var dayOfMonth = dateObj.getDate();
            var weekday = dateObj.toLocaleString("default", { weekday: "long" });
            var month = dateObj.toLocaleString('default', { month: 'long' });
            var date = dateFormat(appointment.date, "dd-mm-yyyy");

            var location = await LocationService.getLocation(appointment.location_id);
            var company = { name: '' }
            var company_name = "";
            var company_website = "";
            var company_logo = "";
            if (location?.company_id) {
                company = await CompanyService.getCompany(location?.company_id)
                if (company.name) { company_name = company.name; }
                if (company.contact_link) { company_website = company.contact_link; }
                if (company.image) { company_logo = company.image; }
            }
            var currency = company?.currency ? company?.currency?.symbol : "£";

            client_query['_id'] = { $in: appointment.client_id }
            var client = await CustomerService.getClients(client_query)
            appointment.client_id = client //with name

            var is_paypal = 0;
            var is_salon = 0;
            var total_paid_amount = 0;
            var total_remaining_amount = 0;

            var service = appointment.service_data.map(s => s?.service_id[0]);
            appointment.service_id = service //services with name and price
            if (service && service.length > 0) {
                cat_arr = service.map(s => s.category_id);
            }

            total_paid_amount += appointment.paid_amount;
            total_remaining_amount += appointment.remaining_amount;
            appointment.paid_amount = appointment.paid_amount.toFixed(2);
            appointment.remaining_amount = appointment.remaining_amount.toFixed(2);
            appointment.total_amount = appointment.total_amount.toFixed(2);

            unique_cat_arr = cat_arr.filter((x, i) => i === cat_arr.indexOf(x))
            if (unique_cat_arr && unique_cat_arr.length > 0) {
                var car_query = {}
                car_query['_id'] = { $in: unique_cat_arr }
                var cat_data = await CategoryService.getCategoriesSpecific(car_query)
            } else {
                cat_data = []
            }

            var discount = {}
            var description = ''
            if (appointment.discount_id) {
                discount = await DiscountService.getDiscount(appointment.discount_id)
                if (discount.description) {
                    description = discount.description
                }
            }

            var group_data_flag = false
            if (appointment.group_data && appointment.group_data.length > 0) {
                group_data_flag = true
            }

            if (appointment.payment_type == 'paypal') {
                is_paypal = 1
            } else {
                is_salon = 1
            }

            if (appointment.reschedule_out_of_paid_amount > 0) {
                appointment.grand_final_price = appointment.grand_final_price + appointment.reschedule_out_of_paid_amount
                appointment.total_amount = appointment.total_amount + appointment.reschedule_out_of_paid_amount
                appointment.paid_amount = appointment.paid_amount + appointment.reschedule_out_of_paid_amount
                appointment.grand_total = appointment.grand_total + appointment.reschedule_out_of_paid_amount
            }

            if (appointment._id && appointment.client_id && appointment.client_id[0]._id && params.source_url != 'customer-mobile') {
                let notificationPayload = {
                    token: '',
                    notification: {
                        title: "Appointment Rescheduled",
                        body: "Appointment has been rescheduled at " + company_name + " " + location?.name + " branch",

                    }, data: {
                        type: "appointment",
                        id: appointment._id?.toString(),
                    }
                };

                let notiData = {
                    location_id: location?._id,
                    client_id: appointment.client_id[0]._id,
                    noti_type: "appointment reschedule",
                }

                let notificationResponse = PushNotificationService.sendPushNotification(notificationPayload, notiData);
            }

            var toMail = {};
            toMail['site_url'] = process.env.API_URL
            toMail['link_url'] = process.env.SITE_URL
            toMail['date'] = date
            toMail['location_name'] = location?.name
            toMail['location_contact'] = location?.contact_number
            toMail['location_domain'] = location?.domain
            toMail['front_url'] = process.env.FRONT_URL
            toMail['company_name'] = company_name
            toMail['company_website'] = company_website
            toMail['company_logo'] = company_logo
            toMail['currency'] = company.currency ? company.currency.symbol : "£"
            toMail['data'] = appointment
            toMail['group_data_flag'] = group_data_flag
            toMail['description'] = description
            toMail['discount_slab_desc'] = discount_slab_desc
            toMail['package_name'] = package_name
            toMail['total_session'] = total_session
            toMail['available_session'] = parseInt(total_session) - parseInt(available_session)
            toMail['client_id'] = appointment.client_id[0]._id
            toMail['client_name'] = appointment.client_id[0].name
            toMail['client_email'] = appointment.client_id[0].email
            toMail['client_mobile'] = appointment.client_id[0].mobile
            toMail['services'] = services
            toMail['cat_data'] = cat_data
            toMail['is_paypal'] = is_paypal
            toMail['is_salon'] = is_salon
            toMail['total_paid_amount'] = (total_paid_amount + appointment.reschedule_out_of_paid_amount).toFixed(2)
            toMail['total_remaining_amount'] = total_remaining_amount.toFixed(2)
            toMail['payment_agreement'] = params.payment_agreement ? params.payment_agreement : 0
            toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + appointment.client_id[0]._id

            if (params.payment_agreement) {
                toMail['total_booking_amt'] = parseFloat(params.total_booking_amt).toFixed(2)
                toMail['booking_fee'] = params.booking_fee.toFixed(2)
                toMail['reschedule_fee_percentage'] = params.reschedule_fee
                toMail['reschedule_extra_fee_percentage'] = params.reschedule_extra_fee
                toMail['reschedule_fee'] = params.reschedule_fee_amt.toFixed(2)
                toMail['reschedule_extra_fee'] = params.reschedule_extra_fee_amt.toFixed(2)
                toMail['reschedule_booking_amt'] = params.reschedule_booking_amt.toFixed(2)
                toMail['reschedule_remaining_amt'] = params.reschedule_remaining_amt.toFixed(2)
                toMail['reschedule_total_fee_percentage'] = params.reschedule_fee + params.reschedule_extra_fee
            }

            // Client booking mail start
            if (!params.stop_email_sms && !params.patch_test_booking && appointment.client_id[0].email && appointment.client_id[0].email != '') {
                var to = appointment.client_id[0].email
                var name = appointment.client_id[0].name
                var subject = "Appointment has been rescheduled at " + company_name + " " + location?.name + " branch"

                var html = "";
                var temFile = "reschedule_appointment_mail.hjs";
                var gettingData = await getEmailTemplateData(company?._id, location?._id, 'client_reschedule_appointment_booking', temFile);
                if (gettingData != null) {
                    html = gettingData.contents
                } else {
                    html = ""
                }

                var sendEmail = SendEmailSmsService.sendMailAwait(to, name, subject, temFile, html, toMail, 'transaction', location?._id, location?.company_id)

                var emailData = {
                    company_id: location?.company_id,
                    location_id: location?._id,
                    client_id: appointment.client_id[0]._id,
                    subject: subject,
                    name: name,
                    type: "single",
                    file_type: "client_reschedule_appointment_booking",
                    temp_file: temFile,
                    html: '',
                    data: toMail,
                    date: Date(),
                    to_email: to,
                    status: "Sent",
                    response: null,
                    response_status: 'Sent',
                    email_type: 'transaction'
                }

                if (sendEmail && sendEmail?.status) {
                    emailData.response = sendEmail.response;
                    emailData.response_status = sendEmail.status;
                    emailData.status = sendEmail.status;
                }

                var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
                var tillDate = increaseDateDays(new Date, days)
                if (tillDate) {
                    emailData.till_date = tillDate
                }

                var eLog = await EmailLogService.createEmailLog(emailData)
            }
            //Client booking mail end

            if (!params.stop_email_sms && !params.patch_test_booking && appointment.client_id[0].mobile && appointment.client_id[0].mobile != '') {
                var number = appointment.client_id[0].mobile //without + sign
                number = parseInt(number, 10)
                var subject = "Booking"

                var booking_msg_val = await getCustomParameterData(location?.company_id, appointment.location_id, 'reschedule');

                var msg = "";
                if (booking_msg_val && booking_msg_val?.formData && booking_msg_val?.formData?.reschedule_status && booking_msg_val?.formData?.reschedule_message) {
                    booking_msg_val = booking_msg_val?.formData?.reschedule_message;

                    booking_msg_val = booking_msg_val.replace('{start_time}', appointment.start_time);
                    booking_msg_val = booking_msg_val.replace('{day_of_month}', dayOfMonth);
                    booking_msg_val = booking_msg_val.replace('{month}', month);
                    booking_msg_val = booking_msg_val.replace('{organisation_name}', company?.name);
                    booking_msg_val = booking_msg_val.replace('{location_name}', location?.name);
                    booking_msg_val = booking_msg_val.replace('{branch_number}', location?.contact_number);

                    msg = booking_msg_val;
                }

                var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                var tillDate = increaseDateDays(new Date, days);

                var is_wa_exist = appointment.client_id[0].wa_verified ?? 0;
                var is_WA_set = await getWhatsAppDetails(location?._id)

                if (is_wa_exist && is_WA_set) {
                    var waMsgData = {
                        company_id: location?.company_id,
                        location_id: location?._id,
                        client_id: appointment.client_id[0]._id,
                        type: "direct",
                        msg_type: "reschedule_booking_sms",
                        date: Date(),
                        mobile: appointment.client_id[0].mobile,
                        content: msg,
                        status: "initial",
                        till_date: tillDate ?? null
                    }

                    await WhatsAppLogService.createWhatsAppLog(waMsgData)
                }

                if (!is_wa_exist || !is_WA_set) {
                    var country_code = company.country_code ? company.country_code : 44
                    var params = {
                        Message: msg,
                        PhoneNumber: '+' + country_code + number
                    }

                    var numSegments = 0
                    var smsData = {
                        company_id: location?.company_id,
                        location_id: location?._id,
                        client_id: appointment.client_id[0]._id,
                        sms_type: "reschedule_booking_sms",
                        date: Date(),
                        mobile: appointment.client_id[0].mobile,
                        content: msg,
                        sms_count: numSegments,
                        sms_setting: location?.sms_setting,
                        status: "initial",
                        till_date: tillDate ?? null
                    }

                    var smsLog = await SmslogService.createSmsLog(smsData)
                    if (smsLog && smsLog._id) {
                        var sendSms = await SendEmailSmsService.sendSMS(params, location?._id || "", '', 'direct')
                        if (sendSms) {
                            numSegments = sendSms?.numSegments ? parseInt(sendSms.numSegments) : 1
                            var smsData = {
                                _id: smsLog._id,
                                sms_count: numSegments,
                                sms_response: JSON.stringify(sendSms),
                                response_status: sendSms?.status || "",
                                status: "processed"
                            }

                            if (location?.sms_setting == "twillio") {
                                smsData.sms_response = null
                                smsData.twillio_response = JSON.stringify(sendSms)
                            }

                            await SmslogService.updateSmsLog(smsData)
                        }
                    }
                }
            }
        }

        if (params.booking_status == 'no_shows' && appointment._id && appointment.client_id && appointment.client_id[0]._id && params.source_url != 'customer-mobile') {
            let notificationPayload = {
                token: '',
                notification: {
                    title: "Appointment Missed",
                    body: "Appointment has been missed at " + company_name + " " + location?.name + " branch",

                }, data: {
                    type: "appointment",
                    id: appointment._id?.toString(),
                }
            };

            let notiData = {
                location_id: location?._id,
                client_id: appointment.client_id[0]._id,
                noti_type: "appointment missed",
            }

            let notificationResponse = PushNotificationService.sendPushNotification(notificationPayload, notiData);
        }

    } catch (e) {
        console.log(e)
        return null;
    }
}

exports.removeAppointment = async function (req, res, next) {
    try {
        var id = req.params.id
        if (!id) {
            return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
        }

        var appointment = await AppointmentService.getAppointment(id);
        if (appointment && appointment?._id) {
            var companyId = appointment?.company_id?._id || appointment?.company_id || "";
            var locationId = appointment?.location_id?._id || appointment?.location_id || "";
            var customerId = appointment.client_id[0]?._id || appointment.client_id[0] || "";
            if (appointment?.used_gift_card_bal && appointment?.gift_card_transaction_id && appointment.gift_card_transaction_id?.length) {
                var giftTransactionIds = appointment.gift_card_transaction_id.map((item) => {
                    return item?._id || item;
                });
                var serviceIds = appointment.service_id.map((item) => {
                    return item?._id || item;
                });

                var giftParam = {
                    company_id: companyId,
                    location_id: locationId,
                    customer_id: customerId,
                    service_ids: serviceIds,
                    appointment_id: appointment?._id || null,
                    transaction_ids: giftTransactionIds,
                    transaction_description: "Appointment removed"
                }

                await creditCustomerGiftCardBalance(giftParam);
            }


            var card_data = { appointment_id: id }
            var customerCardLogDelete = await CustomerLoyaltyCardLogService.deleteMultiple(card_data)

            var dis_log = { appointment_id: id }
            var deleteDiscountLog = await AppliedDiscountService.deleteMultiple(dis_log);

            var deleted = await AppointmentService.deleteAppointment(id)

        }

        return res.status(200).send({
            status: 200,
            flag: true,
            message: "Successfully Deleted..."
        });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.noShowsMessageCustomer = async function (req, res, next) {
    try {
        if (!req.body.location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present" })
        }

        if (!req.body.message) {
            return res.status(200).json({ status: 200, flag: false, message: "Message must be present" })
        }

        var location = await LocationService.getLocation(req.body.location_id);
        var company = await CompanyService.getCompany(location?.company_id);
        var appointment = await AppointmentService.getAppointment(req.body._id);
        var service_query = { _id: { $in: appointment.service_id } }
        var service = await ServiceService.getServiceSpecificWithCategory(service_query);
        appointment.service_id = service;
        var client = await CustomerService.getCustomer(req.body.client_id);
        var service_name = "";
        if (appointment.service_id) {
            for (var i = 0; i < appointment.service_id.length; i++) {
                service_name = service_name + appointment.service_id[i].name + ", "
            }
        }

        if (appointment && !appointment?.deposit_gift_card_bal && req.body?.deposit_gift_card_bal) {
            appointment.deposit_gift_card_bal = getDecimalFormat(req.body.deposit_gift_card_bal);
        }

        var company_website = "";
        var company_logo = "";
        if (company.contact_link) {
            company_website = company.contact_link;
        }

        if (company.image) {
            company_logo = company.image;
        } else {
            company_logo = "";
        }

        var html = "";
        var temFile = "appointment_booked_no_show.hjs";
        var gettingData = await getEmailTemplateData(location?.company_id, location?._id, 'appointment_booked_no_show', temFile);
        if (gettingData != null) {
            html = gettingData.contents;
        } else {
            html = "";
        }

        var apt_date = dateFormat(appointment.date, "yyyy-mm-dd");
        var toMail = {}
        toMail['site_url'] = process.env.API_URL;
        toMail['link_url'] = process.env.SITE_URL;
        var to = req.body.email;
        var name = req.body.name;
        var subject = "You have missed your appointment at " + company.name + " " + location?.name + " for " + service_name;
        toMail['name'] = name;
        toMail['date'] = apt_date;
        toMail['time'] = appointment.start_time;
        toMail['client_id'] = req.body.client_id;
        toMail['company_name'] = company.name;
        toMail['location_name'] = location?.name;
        toMail['data'] = appointment;
        toMail['location_contact'] = location?.contact_number;
        toMail['location_domain'] = location?.domain;
        toMail['contact_number'] = location?.contact_number;
        toMail['front_url'] = process.env.FRONT_URL;
        toMail['company_website'] = company_website;
        toMail['company_logo'] = company_logo;
        toMail['currency'] = company.currency ? company.currency.symbol : "£";
        toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + req.body.client_id;

        var sendEmail = SendEmailSmsService.sendMailAwait(to, name, subject, temFile, html, toMail, 'transaction', location?._id, location?.company_id)

        var emailData = {
            company_id: location?.company_id,
            location_id: location?._id,
            client_id: req.body.client_id,
            subject: subject,
            name: name,
            type: "single",
            file_type: "appointment_booked_no_show",
            temp_file: temFile,
            html: '',
            data: toMail,
            date: Date(),
            to_email: to,
            status: "Sent",
            response: null,
            response_status: 'Sent',
            email_type: 'transaction'
        }

        if (sendEmail && sendEmail?.status) {
            emailData.response = sendEmail.response;
            emailData.response_status = sendEmail.status;
            emailData.status = sendEmail.status;
        }

        var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
        var tillDate = increaseDateDays(new Date, days)
        if (tillDate) {
            emailData.till_date = tillDate
        }

        var eLog = EmailLogService.createEmailLog(emailData)

        var cMsg = req.body.message
        cMsg = cMsg.replace("{organisation_name}", company.name)
        cMsg = cMsg.replace("{location_name}", location?.name)
        cMsg = cMsg.replace("{branch_number}", location?.contact_number)
        cMsg = cMsg.replace("{organisation_website}", company_website)

        var number = parseInt(req.body.mobile, 10)
        var msg = cMsg

        var days = process.env?.SMS_MAX_DATE_LIMIT || 2
        var tillDate = increaseDateDays(new Date, days)

        var is_wa_exist = client.wa_verified ?? 0;
        var is_WA_set = await getWhatsAppDetails(location?._id)

        if (is_wa_exist && is_WA_set) {
            var waMsgData = {
                company_id: location?.company_id,
                location_id: location?._id,
                client_id: req.body.client_id,
                type: "direct",
                msg_type: "appointment_booked_no_show",
                date: Date(),
                mobile: req.body.mobile,
                content: msg,
                status: "initial",
                till_date: tillDate ?? null
            }
            await WhatsAppLogService.createWhatsAppLog(waMsgData)
        }

        if (!is_wa_exist || !is_WA_set) {
            var country_code = company.country_code ? company.country_code : 44
            var params = {
                Message: msg,
                PhoneNumber: '+' + country_code + number
            }

            var numSegments = 0
            var smsData = {
                company_id: location?.company_id,
                location_id: location?._id,
                client_id: req.body.client_id,
                sms_type: "appointment_booked_no_show",
                date: Date(),
                mobile: req.body.mobile,
                content: msg,
                sms_count: numSegments,
                sms_setting: location?.sms_setting,
                status: "initial",
                till_date: tillDate ?? null
            }

            var smsLog = await SmslogService.createSmsLog(smsData)
            if (smsLog && smsLog._id) {
                var sendSms = await SendEmailSmsService.sendSMS(params, location?._id || "", '', 'direct')
                if (sendSms) {
                    numSegments = sendSms?.numSegments ? parseInt(sendSms.numSegments) : 1

                    var smsData = {
                        _id: smsLog._id,
                        sms_count: numSegments,
                        sms_response: JSON.stringify(sendSms),
                        response_status: sendSms?.status || "",
                        status: "processed"
                    }
                    if (location?.sms_setting == "twillio") {
                        smsData.sms_response = null
                        smsData.twillio_response = JSON.stringify(sendSms)
                    }

                    await SmslogService.updateSmsLog(smsData)
                }
            }
        }

        res.status(200).send({ status: 200, flag: true, message: "Message sent to customer" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCustomerBooking = async function (req, res, next) {
    try {
        if (!req.query.client_id && !req.query.patch_test_booking) {
            return res.status(200).json({ status: 200, flag: false, message: "Customer Id must be present" })
        }
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000;
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        var order = req.query.order ? req.query.order : '-1';
        var searchText = req.query.searchText ? req.query.searchText : '';

        var query = {};
        var client_query = {};
        if (req.query.location_id && req.query.location_id != 'undefined') {
            //query['location_id'] = req.query.location_id;
        }

        if ((req.query.date && req.query.date != 'undefined') && (req.query.to_date && req.query.to_date != 'undefined')) {
            query['$and'] = [{ date: { $lte: req.query.to_date } }, { date: { $gte: req.query.date } }];
        }

        if (!req.query.to_date && req.query.date && req.query.date != 'undefined') {
            query['date'] = { $gte: req.query.date };
        }

        if (!req.query.date && req.query.to_date && req.query.to_date != 'undefined') {
            query['date'] = { $lte: req.query.to_date };
        }

        if (req.query.client_id && req.query.client_id != 'undefined') {
            query['client_id'] = { $elemMatch: { $eq: req.query.client_id?.toString() } };
        }

        if (req.query.service_id && req.query.service_id != 'undefined') {
            query['service_id'] = { $elemMatch: { $eq: req.query.service_id?.toString() } };
        }

        if (req.query.patch_test_booking && req.query.patch_test_booking == 1) {
            query['patch_test_booking'] = 1;
        }


        if (req.query.pagination == undefined || req.query.pagination == 1 || req.query.pagination != 0) {
            var appointments = await AppointmentService.getBookings(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText);

        } else {
            var appointments = [];
            var all_appointments = await AppointmentService.getAllAppointment(query, order_name, Number(order));
        }


        // Return the ConsultantForms list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: appointments, all_appointments: all_appointments, message: "Successfully Appointments Received" });
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomerAllBooking = async function (req, res, next) {
    if (!req.query.client_id && !req.query.patch_test_booking) {
        return res.status(200).json({ status: 200, flag: false, message: "Customer Id must be present" })
    }

    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    var client_query = {};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    if ((req.query.date && req.query.date != 'undefined') && (req.query.to_date && req.query.to_date != 'undefined')) {
        query['$and'] = [{ date: { $lte: req.query.to_date } }, { date: { $gte: req.query.date } }];
    }

    if (!req.query.date && req.query.to_date && req.query.to_date != 'undefined') {
        query['date'] = { $lte: req.query.to_date };
    }

    if (req.query.client_id && req.query.client_id != 'undefined') {
        query['client_id'] = { $elemMatch: { $eq: req.query.client_id?.toString() } };
    }

    if (req.query.service_id && req.query.service_id != 'undefined') {
        query['service_id'] = { $elemMatch: { $eq: req.query.service_id?.toString() } };
    }

    if (req.query.patch_test_booking && req.query.patch_test_booking == 1) {
        query['patch_test_booking'] = 1;
    }

    try {

        var appointments = await AppointmentService.getBookings(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText);
        // Return the ConsultantForms list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: appointments, message: "Successfully Appointments Received" });
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.checkEmployeeAppointments = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = {};
    var service_query = {};
    var date = dateFormat(new Date(), "yyyy-mm-dd");

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.employee_id && req.query.employee_id != 'undefined') {
        query['booking_status'] = 'pending';
        query['service_data'] = { $elemMatch: { employee_id: req.query.employee_id } };
    }
    if (date) {
        query['date'] = { $gte: date };
    }
    try {

        var appointmentData = await AppointmentService.getAppointmentData(query);

        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: appointmentData.length, appointment: appointmentData, message: "Successfully Appointments Received" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


const timeTomeridiem = function (time) {

    var stimeToNum = timeToNum(time);
    var stime = (time);
    stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM';

    var showStartTimeSpilt = stime.split(':');
    var end_hour = (showStartTimeSpilt[0]);
    var hour = end_hour > 12 ? end_hour - 12 : end_hour;
    showStartTimeSpilt[0] = (hour + '').length == 1 ? '0' + hour : hour;
    stime = showStartTimeSpilt.join(':');
    var start_time_meridiem = stime + " " + stimeToNum;

    return start_time_meridiem;
} //ex: 13:00 = 01:00 PM



const getBookingAdvanceFee = async function (type = "", company, location, isReschedule = 0) {
    try {
        var companyId = company?._id?.toString()
        var locationId = location?._id?.toString();
        if (locationId) {
            /* No show custom parameter */
            if (type == 'no_show') {
                var noShowLimitVal = 0;
                var nowShowFeeTypeVal = "";
                var noShowFeeValueVal = 0;
                var noShowsMsgVal = "";
                var noShowLimit = await getCustomParameterData(companyId, locationId, 'no_shows');

                if (noShowLimit && noShowLimit?.formData && noShowLimit?.formData?.no_show_status) {
                    noShowLimitVal = parseInt(noShowLimit?.formData?.no_show_limit) || 0;
                    nowShowFeeTypeVal = noShowLimit?.formData?.no_show_fee_type || '';
                    noShowFeeValueVal = parseInt(noShowLimit?.formData?.no_show_fee_value) || 0;

                    noShowsMsgVal = noShowLimit?.formData?.no_shows_message || '';
                }
                /* /No show custom parameter */

                /* No show message custom parameter */
                if (noShowsMsgVal) {
                    noShowsMsgVal = noShowsMsgVal.replace('{organisation_name}', company?.name || "");
                    noShowsMsgVal = noShowsMsgVal.replace('{location_name}', location?.name);
                    noShowsMsgVal = noShowsMsgVal.replace('{branch_number}', location?.contact_number);
                }
                /* /No show message custom parameter */

                return {
                    noShowLimitVal: noShowLimitVal,
                    nowShowFeeTypeVal: nowShowFeeTypeVal,
                    noShowFeeValueVal: noShowFeeValueVal,
                    noShowsMsgVal: noShowsMsgVal,
                }
            } else if (type == 'cancel') {
                /* Cancel custom parameter */
                var cancelFeeType = "";
                var cancelFeeValue = 0;
                var cancelFeeTypeData = await getCustomParameterData(companyId, locationId, 'cancel_booking');

                if (cancelFeeTypeData && cancelFeeTypeData?.formData && cancelFeeTypeData?.formData?.cancel_fee_status) {

                    cancelFeeType = cancelFeeTypeData?.formData.cancel_fee_type;
                    cancelFeeValue = parseInt(cancelFeeTypeData?.formData.cancel_fee_value) || 0;
                }
                /* /Cancel custom parameter */
                return {
                    cancelFeeType: cancelFeeType,
                    cancelFeeValue: cancelFeeValue
                }
            } else if (type == 'booking') {
                /* Booking fee custom parameter */
                var bookingFeeType = "";
                var bookingFeeValue = 0;
                var bookingFeeData = await getCustomParameterData(companyId, locationId, 'booking');
                if (bookingFeeData && bookingFeeData?.formData && bookingFeeData?.formData?.booking_fee_status) {
                    bookingFeeType = bookingFeeData?.formData?.booking_fee_type || '';
                    bookingFeeValue = parseInt(bookingFeeData?.formData?.booking_fee_value) || 0;
                }
                /* /Booking fee custom parameter */

                return {
                    bookingFeeType: bookingFeeType,
                    bookingFeeValue: bookingFeeValue
                }
            } else if (type == 'reschedule') {
                var rscldBookingFeePercentVal = 0;
                var rscldBeforeLimitVal = 0;
                var rscldFeePercentVal = 0;
                if (isReschedule) {
                    /* Reschedule booking fee custom parameter */
                    var rscldFeeData = await getCustomParameterData(companyId, locationId, 'reschedule');
                    if (rscldFeeData && rscldFeeData?.formData && rscldFeeData?.formData?.reschedule_status) {
                        rscldBookingFeePercentVal = parseInt(rscldFeeData?.formData?.reschedule_fee_percentage) || 0;
                        rscldBeforeLimitVal = parseInt(rscldFeeData?.formData?.reschedule_before_limit) || 0;
                        rscldFeePercentVal = parseInt(rscldFeeData?.formData?.reschedule_booking_fee_percentage) || 0;
                        rscldLimit = parseInt(rscldFeeData?.formData?.reschedule_limit) || 0;
                    }
                    /* /Reschedule booking fee custom parameter */
                }

                return {
                    rscldBookingFeePercentVal: rscldBookingFeePercentVal,
                    rscldBeforeLimitVal: rscldBeforeLimitVal,
                    rscldFeePercentVal: rscldFeePercentVal,
                    rscldLimit: rscldLimit,
                }
            } else if (type == 'paid_slot') {
                var paidSlotFeeType = "";
                var paidSlotFeeValue = 0;
                var paidSlotData = await getCustomParameterData(companyId, locationId, 'booking');
                if (paidSlotData && paidSlotData?.formData && paidSlotData?.formData?.booking_paid_slot_status) {
                    paidSlotFeeType = paidSlotData?.formData?.booking_paid_slot_fee_type || '';
                    paidSlotFeeValue = parseInt(paidSlotData?.formData?.booking_paid_slot_fee_value) || 0;
                }
                /* /Booking fee type custom parameter */

                return {
                    paidSlotFeeType: paidSlotFeeType,
                    paidSlotFeeValue: paidSlotFeeValue
                }
            } else if (type == "gift_card") {
                var gftCardDepositPercent = 0;
                var giftCard = await getCustomParameterData(companyId, locationId, 'gift_card');
                if (giftCard?.formData && giftCard.formData?.gift_card_status) {
                    gftCardDepositPercent = parseInt(giftCard?.formData?.gift_card_deposit_percentage || 0);
                }

                return {
                    gftCardDepositPercent: gftCardDepositPercent
                }
            }
        }
    } catch (e) {
        return {}
    }
}

const getAdvanceDepositAmount = async function (service_ids) {
    var advance_deposit_amt = 0;

    if (service_ids?.length > 0) {
        for (let i = 0; i < service_ids.length; i++) {
            var deposit_amt = 0;
            if (service_ids[i].price > 0) {
                if (service_ids[i]?.deposite == 'minimum' && service_ids[i]?.deposite_type && service_ids[i]?.min_deposite > 0) {
                    if (service_ids[i].deposite_type == 'percentage') {
                        var per_val = parseFloat(service_ids[i].min_deposite)
                        var deposit_amt = (parseFloat(service_ids[i].price) / 100) * per_val;
                        advance_deposit_amt += deposit_amt

                    } else if (service_ids[i]?.deposite_type == 'amount') {
                        if (parseFloat(service_ids[i].min_deposite) > parseFloat(service_ids[i].price)) {
                            deposit_amt = parseFloat(service_ids[i].price);
                            advance_deposit_amt += parseFloat(service_ids[i].price);
                        } else {
                            deposit_amt = parseFloat(service_ids[i].min_deposite);;
                            advance_deposit_amt += parseFloat(service_ids[i].min_deposite);
                        }
                    }
                } else if (service_ids[i]?.deposite == 'full') {

                    deposit_amt = parseFloat(service_ids[i].price);
                    advance_deposit_amt += parseFloat(service_ids[i].price);
                }
            }
            if (!service_ids[i].variable_price) {
                service_ids[i].variable_price = service_ids[i].price;
            }

            service_ids[i].advance_deposit_amt = deposit_amt;
        }
    }
    advance_deposit_amt = getDecimalFormat(advance_deposit_amt)
    return { service_ids: service_ids, advance_deposit_amt: advance_deposit_amt };
}

const getAllServiceTotal = async function (service_ids) {
    var total = 0;
    if (service_ids?.length > 0) {
        for (let i = 0; i < service_ids.length; i++) {
            //if (!service_ids[i]?.deposite && !service_ids[i]?.deposite_type && !service_ids[i]?.min_deposite) {
            total += parseFloat(service_ids[i].price)
            //}
        }
    }
    return parseFloat(total);
}

const calBookingAdvanced = async function (company, location, client, finalAmount, is_full_advanced = 0, isPaidSlot = 0) {

    var advanceAmount = 0;
    var noShowAppointments = [];
    try {
        if (location && location?.paypal_client_id && !is_full_advanced) {

            var bookResult = await getBookingAdvanceFee('booking', company, location)

            var bookingFeeType = bookResult?.bookingFeeType ?? '';
            var bookingFeeValue = bookResult?.bookingFeeValue ?? 0;

            var calResult = await getBookingAdvanceFee('cancel', company, location)

            cancelFeeType = calResult?.cancelFeeType ?? '';
            cancelFeeValue = calResult?.cancelFeeValue ?? 0;

            var nSresult = await getBookingAdvanceFee('no_show', company, location)

            var noShowLimitVal = nSresult?.noShowLimitVal ?? 0;
            var nowShowFeeTypeVal = nSresult?.nowShowFeeTypeVal ?? '';
            var noShowFeeValueVal = nSresult?.noShowFeeValueVal ?? 0;
            var noShowsMsgVal = nSresult?.noShowsMsgVal ?? '';

            var cancelAppointments = await AppointmentService.getAppointmentsOne({
                client_id: { $in: [client?._id?.toString()] }
            }, 1, 1) || [];
            if (cancelAppointments && cancelAppointments?.length) {
                cancelAppointments = cancelAppointments.filter((x) => x.booking_status == "cancel");
            }

            if (!cancelAppointments?.length && noShowLimitVal > 0) {

                noShowAppointments = await AppointmentService.getAppointmentsOne({
                    client_id: { $in: [client?._id?.toString()] }
                }, 1, noShowLimitVal) || [];

                noShowAppointments = noShowAppointments.filter((x) => x.booking_status == "no_shows");
            }

            if (cancelAppointments?.length && cancelFeeType && cancelFeeValue) {
                if (cancelFeeType == "percentage") {
                    advanceAmount = await calPercentage(finalAmount, cancelFeeValue);
                } else {

                    if (cancelFeeValue > finalAmount) {
                        advanceAmount = finalAmount;
                    } else {
                        advanceAmount = cancelFeeValue;
                    }
                }
            }

            if (noShowLimitVal > 0 && noShowAppointments?.length == noShowLimitVal && nowShowFeeTypeVal && noShowFeeValueVal) {
                if (nowShowFeeTypeVal == "percentage") {
                    advanceAmount = await calPercentage(finalAmount, noShowFeeValueVal);
                } else {
                    if (noShowFeeValueVal > finalAmount) {
                        advanceAmount = finalAmount;
                    } else {
                        advanceAmount = noShowFeeValueVal;
                    }
                }
            }

            if (!cancelAppointments?.length && (noShowLimitVal > 0 && noShowAppointments?.length != noShowLimitVal) && bookingFeeType && bookingFeeValue) {
                if (bookingFeeType == "percentage") {
                    advanceAmount = await calPercentage(finalAmount, bookingFeeValue);
                } else {
                    if (bookingFeeValue > finalAmount) {
                        advanceAmount = finalAmount;
                    } else {
                        advanceAmount = bookingFeeValue;
                    }
                }
            }

            if (isPaidSlot) {

                var paidSlotResult = await getBookingAdvanceFee('paid_slot', company, location)
                var paidSlotFeeType = paidSlotResult?.paidSlotFeeType ?? '';
                var paidSlotFeeValue = paidSlotResult?.paidSlotFeeValue ?? 0;

                if (paidSlotFeeType && paidSlotFeeValue > 0) {

                    //if (!cancelAppointments?.length && ((!noShowAppointments?.length || !noShowLimitVal) && (noShowAppointments?.length != noShowLimitVal)) && paidSlotFeeType && paidSlotFeeValue) {
                    if (paidSlotFeeType == "percentage") {
                        advanceAmount = await calPercentage(finalAmount, paidSlotFeeValue);
                    } else {
                        if (paidSlotFeeValue > finalAmount) {
                            advanceAmount = finalAmount;
                        } else {
                            advanceAmount = paidSlotFeeValue;
                        }

                    }
                }
            }
        }
        return { advanceAmount: parseFloat(advanceAmount) };
    } catch (e) {
        return { advanceAmount: 0, }
    }
}

const calDiscountSlabDiscount = async function (discount_slab, total_amount) {

    var discounted_price = 0;
    if (discount_slab) {

        var final_price = 0;
        if (discount_slab.offer_type == 'percentage') {
            var percentage = parseFloat(discount_slab.offer_value);

            discounted_price = parseFloat(total_amount / 100) * percentage;

        } else if (discount_slab.offer_type == 'amount') {
            discounted_price = parseFloat(discount_slab.offer_value).toFixed(2);
        }

        return discounted_price;

    }

    return discounted_price;
}

//new calculation with special price, starts from, price range, advanced deposit
exports.bookingOrderCalculation = async function (req, res, next) {
    try {
        var companyId = "";
        var locationId = req.body?.location_id || "";
        var clientIds = req.body?.client_ids || [];
        var calculations = req.body?.calculations || [];
        var isPaidSlot = req.body?.is_paid_slot || false;
        var keyType = req.body?.key_type || "";
        var isReschedule = Number(req.body?.is_reschedule) || 0;
        var isAdmin = Number(req.body?.is_admin) || 0;
        //var paidAmount = req.body?.paidAmount || 0;
        var paidAmount = 0;
        var online_payment = Number(req.body?.online_payment) || 0;
        var offline_payment = Number(req.body?.offline_payment) || 0;

        var throwError = false;
        var message = "Something went wrong!";
        if (!locationId) {
            throwError = true;
            message = "Location Id must be present!";
        } else if (!clientIds?.length) {
            throwError = true;
            message = "Client Ids array must be present!";
        } else if (!isReschedule && !calculations?.length) {
            throwError = true;
            message = "Calculations array must be present!";
        } else if (!isReschedule && !isArrayContainingObject(calculations, "client_id")) {
            throwError = true;
            message = "Calculations array must be valid format!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: message
            });
        }

        var payWith = "";
        var grandTotalAmount = 0;
        var grandDiscountAmount = 0;
        var grandFinalAmount = 0;
        var grandAdvanceAmount = 0;
        var grandUsedGiftCardBal = 0;

        if (keyType == "secret") {
            var location = await LocationService.getLocationOneHidden(locationId) || null;
        } else {
            var location = await LocationService.getLocationOne({ _id: locationId }) || null;
        }
        companyId = location?.company_id?._id ? location?.company_id._id : location?.company_id || "";
        var company = await CompanyService.getCompany(companyId);

        var clients = await CustomerService.getCustomersDropdown({ _id: { $in: clientIds } });
        if (!isAdmin) {
        }

        /* Reschedule custom parameter */
        var result = await getBookingAdvanceFee('reschedule', company, location, isReschedule)
        var rscldBookingFeePercentVal = result?.rscldBookingFeePercentVal ?? 0;
        var rscldBeforeLimitVal = result?.rscldBeforeLimitVal ?? 0;
        var rscldFeePercentVal = result?.rscldFeePercentVal ?? 0;
        var rscldLimit = result?.rscldLimit ?? 0;
        /* /Reschedule custom parameter */

        /* Gift Card deposit custom parameter */
        var giftCard = await getBookingAdvanceFee('gift_card', company, location);
        var gftCardDepositPercent = giftCard?.gftCardDepositPercent || 0;
        /* /Gift Card deposit custom parameter */

        var calculationData = [];
        var is_full_advanced = 0;
        if (calculations && calculations.length) {
            for (let i = 0; i < calculations.length; i++) {
                var calItem = calculations[i];
                if (calItem?.client_id) {
                    var totalAmount = 0;
                    var finalAmount = 0;
                    var advanceAmount = 0;
                    var advancedDeposit = 0;
                    var totalWithoutNoDeposit = 0; // Need to calculate booking/noshow/cancel booking fee
                    var client = clients.find((x) => x._id == calItem.client_id);
                    if (client && client._id) {
                        var clientData = {
                            client: client,
                            total_amount: totalAmount,
                            final_amount: finalAmount,
                            advance_amount: advanceAmount,
                            discounted_price: 0,
                            remaining_amount: 0,
                            paid_amount: calItem?.paid_amount,
                            services: calItem?.services
                        }

                        if (clientData?.services && clientData.services?.length) {
                            if (!calItem?.discounted_price) {
                                totalWithoutNoDeposit = await getAllServiceTotal(clientData.services);
                            }

                            clientData.services.map((service) => {
                                totalAmount += service?.price || 0;
                                finalAmount += service?.price || 0;
                            });

                            if (!isAdmin && !offline_payment) {
                                var serDepo = await getAdvanceDepositAmount(clientData.services);

                                advancedDeposit = serDepo?.advance_deposit_amt;
                                clientData.services = serDepo?.service_ids;
                            }
                        }

                        if (!calItem?.discounted_price && calItem?.discount_slab_id && calItem?.discount_slab) {
                            calItem.discounted_price = await calDiscountSlabDiscount(calItem?.discount_slab, totalAmount);
                        }

                        if (calItem?.discount_id) { clientData.discount_id = calItem.discount_id }
                        if (calItem?.discount_code) { clientData.discount_code = calItem.discount_code }
                        if (calItem?.discount_type) { clientData.discount_type = calItem.discount_type }
                        if (calItem?.discount_code_type) { clientData.discount_code_type = calItem.discount_code_type }
                        if (calItem?.discount_slab_id) { clientData.discount_slab_id = calItem.discount_slab_id }
                        if (calItem?.offer_discount_code) { clientData.offer_discount_code = calItem.offer_discount_code }

                        var usedGiftCardBal = 0;
                        var giftCardBalance = 0;
                        if (calItem?.gift_card_balance) {
                            giftCardBalance = parseFloat(calItem.gift_card_balance);
                        }

                        if (giftCardBalance) {
                            if (giftCardBalance >= finalAmount) {
                                var remainGiftCardBal = giftCardBalance - finalAmount;
                                usedGiftCardBal = giftCardBalance - remainGiftCardBal;
                                finalAmount = 0;
                                is_full_advanced = 0;
                            } else if (!offline_payment) {
                                finalAmount = finalAmount - giftCardBalance;
                                usedGiftCardBal = giftCardBalance;
                                is_full_advanced = 1;
                            }
                        }

                        if (online_payment == 1 && !offline_payment) {
                            is_full_advanced = 1;
                        }

                        if (calItem?.discounted_price > 0) {
                            calItem.discounted_price = parseFloat(calItem.discounted_price);
                            if (calItem.discounted_price > totalAmount) {
                                finalAmount = 0;
                            } else if (calItem.discounted_price <= totalAmount && advancedDeposit > 0 && location?.paypal_client_id) {
                                finalAmount = totalAmount - calItem.discounted_price;
                            } else if (calItem.discounted_price <= totalAmount) {
                                finalAmount = totalAmount - calItem.discounted_price;
                            }

                            if (giftCardBalance) {
                                if (giftCardBalance >= finalAmount) {
                                    var remainGiftCardBal = giftCardBalance - finalAmount;
                                    usedGiftCardBal = giftCardBalance - remainGiftCardBal;
                                    finalAmount = 0;
                                } else {
                                    finalAmount = finalAmount - giftCardBalance;
                                    usedGiftCardBal = giftCardBalance;
                                }
                            }

                            clientData.discounted_price = getDecimalFormat(calItem.discounted_price);
                            grandDiscountAmount += parseFloat(clientData.discounted_price);

                            if (!offline_payment) {
                                var advanceAmountRes = await calBookingAdvanced(company, location, client, finalAmount, is_full_advanced, isPaidSlot)

                                advanceAmount = advanceAmountRes?.advanceAmount ?? 0;
                            }

                            if ((!isAdmin && advanceAmount == 0 && calItem?.discounted_price > 0 && advancedDeposit > 0) || online_payment == 1 && !offline_payment) {
                                advanceAmount = finalAmount;
                                is_full_advanced = 1;
                            } else if (advanceAmount == 0) {
                                advanceAmount = parseFloat(advancedDeposit);
                            }
                        } else if (location && location?.paypal_client_id && !is_full_advanced && !isAdmin && !offline_payment) {

                            var advanceAmountRes = await calBookingAdvanced(company, location, client, totalWithoutNoDeposit, is_full_advanced, isPaidSlot)

                            advanceAmount = advanceAmountRes?.advanceAmount ?? 0;
                            if (advanceAmount == 0) {
                                advanceAmount = parseFloat(advancedDeposit);
                            }
                        }

                        if (usedGiftCardBal) {
                            grandUsedGiftCardBal += parseFloat(usedGiftCardBal);
                        }

                        if (usedGiftCardBal) {
                            clientData.used_gift_card_bal = parseFloat(usedGiftCardBal);
                        }

                        if (totalAmount) {
                            clientData.total_amount = getDecimalFormat(totalAmount);
                            grandTotalAmount += parseFloat(totalAmount);
                        }

                        if (finalAmount) {
                            clientData.final_amount = getDecimalFormat(finalAmount);
                            grandFinalAmount += parseFloat(finalAmount);
                        }

                        if (!isAdmin) {
                            if (advanceAmount > 0 && !is_full_advanced) {
                                payWith = "online";

                                clientData.advance_amount = getDecimalFormat(advanceAmount);
                                grandAdvanceAmount += parseFloat(advanceAmount);

                                if (parseFloat(finalAmount) >= parseFloat(advanceAmount)) {
                                    clientData.remaining_amount = parseFloat(finalAmount) - parseFloat(advanceAmount);
                                    clientData.paid_amount = getDecimalFormat(advanceAmount);
                                    paidAmount += parseFloat(advanceAmount);
                                } else {
                                    clientData.remaining_amount = 0;
                                    clientData.paid_amount = getDecimalFormat(totalAmount);
                                    paidAmount += parseFloat(totalAmount);
                                }
                            } else {
                                clientData.paid_amount = 0;
                                if (finalAmount == 0 && usedGiftCardBal) {
                                    clientData.remaining_amount = 0;
                                } else if (finalAmount) {
                                    clientData.remaining_amount = (parseFloat(finalAmount) - parseFloat(clientData.paid_amount)).toFixed(2);
                                } else {
                                    clientData.remaining_amount = (parseFloat(totalAmount) - parseFloat(clientData.paid_amount)).toFixed(2);
                                }

                                //clientData.remaining_amount = parseFloat(totalAmount) - parseFloat(clientData.final_amount);
                            }

                            if (is_full_advanced) {
                                clientData.advance_amount = finalAmount ? parseFloat(finalAmount) : getDecimalFormat(totalAmount);
                                grandAdvanceAmount += finalAmount ? parseFloat(finalAmount) : getDecimalFormat(totalAmount);
                                clientData.paid_amount = finalAmount ? parseFloat(finalAmount) : getDecimalFormat(totalAmount);
                                paidAmount += finalAmount ? parseFloat(finalAmount) : getDecimalFormat(totalAmount);

                                clientData.remaining_amount = 0;
                            }

                            clientData.remaining_amount = getDecimalFormat(clientData.remaining_amount)
                        } else if (isAdmin) {
                            paidAmount += calItem?.paid_amount;

                            if (finalAmount == 0 && usedGiftCardBal) {
                                clientData.remaining_amount = 0;
                            } else if (finalAmount) {
                                clientData.remaining_amount = (parseFloat(finalAmount) - parseFloat(clientData.paid_amount)).toFixed(2)
                            } else {
                                clientData.remaining_amount = (parseFloat(totalAmount) - parseFloat(clientData.paid_amount)).toFixed(2)
                            }
                        }

                        calculationData.push(clientData);
                    }
                }
            }
        }

        if (grandTotalAmount) { grandTotalAmount = getDecimalFormat(grandTotalAmount); }

        if (grandDiscountAmount) { grandDiscountAmount = getDecimalFormat(grandDiscountAmount); }
        if (grandUsedGiftCardBal) { grandUsedGiftCardBal = getDecimalFormat(grandUsedGiftCardBal); }

        if (grandAdvanceAmount) {
            if (isReschedule) { grandFinalAmount += grandAdvanceAmount; }

            grandAdvanceAmount = getDecimalFormat(grandAdvanceAmount);
        }

        if (grandFinalAmount) { grandFinalAmount = getDecimalFormat(grandFinalAmount); }

        if ((is_full_advanced) && !isAdmin) {
            if (location && location?.paypal_client_id && grandFinalAmount > 0) {
                payWith = "online";
            }
        }

        var remainingAmount = 0;
        if (paidAmount <= grandFinalAmount) {
            remainingAmount = grandFinalAmount - paidAmount;
            remainingAmount = getDecimalFormat(remainingAmount);
        } else if (paidAmount == 0) {
            remainingAmount = getDecimalFormat(grandFinalAmount);
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            payWith: payWith,
            location: location,
            data: calculationData,
            grandTotalAmount: grandTotalAmount,
            grandFinalAmount: grandFinalAmount,
            grandDiscountAmount: grandDiscountAmount,
            grandUsedGiftCardBal: grandUsedGiftCardBal,
            grandPaidAmount: getDecimalFormat(paidAmount),
            grandAdvanceAmount: grandAdvanceAmount,
            rescheduleBookingFeePercentVal: rscldBookingFeePercentVal,
            rescheduleBeforeLimitVal: rscldBeforeLimitVal,
            rescheduleFeePercentVal: rscldFeePercentVal,
            rescheduleLimit: rscldLimit,
            gftCardDepositPercent: gftCardDepositPercent,
            grandRemainingAmount: remainingAmount,
            message: "Appointment calculation received successfully!"
        })
    } catch (e) {
        console.log("getAppointmentCalculation Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getAppointmentCalculation = async function (req, res, next) {
    try {
        var companyId = "";
        var locationId = req.body?.location_id || "";
        var clientIds = req.body?.client_ids || [];
        var calculations = req.body?.calculations || [];
        var isPaidSlot = req.body?.is_paid_slot || false;
        var keyType = req.body?.key_type || "";
        var isReschedule = Number(req.body?.is_reschedule) || 0;
        var isAdmin = Number(req.body?.is_admin) || 0;
        var paidAmount = req.body?.paidAmount || 0;

        var throwError = false;
        var message = "Something went wrong!";
        if (!locationId) {
            throwError = true;
            message = "Location Id must be present!";
        } else if (!clientIds?.length) {
            throwError = true;
            message = "Client Ids array must be present!";
        } else if (!isReschedule && !calculations?.length) {
            throwError = true;
            message = "Calculations array must be present!";
        } else if (!isReschedule && !isArrayContainingObject(calculations, "client_id")) {
            throwError = true;
            message = "Calculations array must be valid format!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: message
            })
        }

        var payWith = "";
        var grandTotalAmount = 0;
        var grandDiscountAmount = 0;
        var grandFinalAmount = 0;
        var grandAdvanceAmount = 0;

        if (keyType == "secret") {
            var location = await LocationService.getLocationOneHidden(locationId) || null;
        } else {
            var location = await LocationService.getLocationOne({ _id: locationId }) || null;
        }
        companyId = location?.company_id?._id ? location?.company_id._id : location?.company_id || "";
        var company = await CompanyService.getCompany(companyId);

        var clients = await CustomerService.getCustomersDropdown({ _id: { $in: clientIds } });

        if (!isAdmin) {
            /* No show limit custom parameter */
            var noShowLimitVal = 0;
            var nowShowFeeTypeVal = "";
            var noShowFeeValueVal = 0;
            var noShowsMsgVal = "";
            var noShowLimit = await getCustomParameterData(companyId, locationId, 'no_show');

            if (noShowLimit && noShowLimit?.formData && noShowLimit?.formData?.no_show_status) {
                noShowLimitVal = parseInt(noShowLimit?.formData?.no_show_limit) || 0;
                nowShowFeeTypeVal = noShowLimit?.formData?.no_show_fee_type || '';
                noShowFeeValueVal = parseInt(noShowLimit?.formData?.no_show_fee_value) || 0;

                noShowsMsgVal = noShowLimit?.formData?.no_shows_message || '';
            }

            if (noShowsMsgVal) {
                noShowsMsgVal = noShowsMsgVal;

                noShowsMsgVal = noShowsMsgVal.replace('{organisation_name}', company?.name || "");
                noShowsMsgVal = noShowsMsgVal.replace('{location_name}', location?.name);
                noShowsMsgVal = noShowsMsgVal.replace('{branch_number}', location?.contact_number);
            }
            /* /No show message custom parameter */

            /* Cancel fee type custom parameter */
            var cancelFeeType = "";
            var cancelFeeValue = 0;
            var cancelFeeTypeData = await getCustomParameterData(companyId, locationId, 'cancel_booking');
            if (cancelFeeTypeData && cancelFeeTypeData?.formData && cancelFeeTypeData?.formData?.cancel_fee_status) {
                cancelFeeType = cancelFeeTypeData?.formData?.cancel_fee_type;
                cancelFeeValue = parseInt(cancelFeeTypeData?.formData?.cancel_fee_value) || 0;
            }
            /* /Cancel fee custom parameter */

            /* Booking fee custom parameter */
            var bookingFeeType = "";
            var bookingFeeValue = 0;
            var bookingFeeData = await getCustomParameterData(companyId, locationId, 'booking');
            if (bookingFeeData && bookingFeeData?.formData && bookingFeeData?.formData?.booking_fee_status) {
                bookingFeeType = bookingFeeData?.formData?.booking_fee_type || '';
                bookingFeeValue = parseInt(bookingFeeData?.formData?.booking_fee_value) || 0;
            }
            /* /Booking fee custom parameter */
        }

        /* Reschedule custom parameter */
        var rscldBookingFeePercentVal = 0;
        var rscldBeforeLimitVal = 0;
        var rscldFeePercentVal = 0;
        var rscldLimit = 0
        if (isReschedule) {
            /* Reschedule booking fee percentage custom parameter */
            var rscldFeeData = await getCustomParameterData(companyId, locationId, 'reschedule');
            if (rscldFeeData && rscldFeeData?.formData && rscldFeeData?.formData?.reschedule_status) {
                rscldBookingFeePercentVal = parseInt(rscldFeeData?.formData?.reschedule_fee_percentage) || 0;
                rscldBeforeLimitVal = parseInt(rscldFeeData?.formData?.reschedule_before_limit) || 0;
                rscldFeePercentVal = parseInt(rscldFeeData?.formData?.reschedule_booking_fee_percentage) || 0;
                rscldLimit = parseInt(rscldFeeData?.formData?.reschedule_limit) || 0;
            }
            /* /Reschedule booking fee custom parameter */
        }
        /* /Reschedule custom parameter */

        var calculationData = [];
        if (calculations && calculations.length) {
            for (let i = 0; i < calculations.length; i++) {
                var calItem = calculations[i]
                if (calItem?.client_id) {
                    var totalAmount = 0;
                    var finalAmount = 0;
                    var advanceAmount = 0;
                    var client = clients.find((x) => x._id == calItem.client_id);
                    if (client && client._id) {
                        var clientData = {
                            client: client,
                            total_amount: totalAmount,
                            final_amount: finalAmount,
                            advance_amount: advanceAmount,
                            discounted_price: 0
                        }

                        if (calItem?.discount_id) { clientData.discount_id = calItem.discount_id }
                        if (calItem?.discount_code) { clientData.discount_code = calItem.discount_code }
                        if (calItem?.discount_type) { clientData.discount_type = calItem.discount_type }
                        if (calItem?.discount_code_type) { clientData.discount_code_type = calItem.discount_code_type }
                        if (calItem?.discount_slab_id) { clientData.discount_slab_id = calItem.discount_slab_id }
                        if (calItem?.offer_discount_code) { clientData.offer_discount_code = calItem.offer_discount_code }
                        if (calItem?.services?.length) { clientData.services = calItem.services }

                        if (clientData?.services && clientData.services?.length) {
                            clientData.services.map((service) => {
                                totalAmount += service?.price || 0;
                                finalAmount += service?.price || 0;
                            })
                        }

                        if (calItem?.discounted_price) {
                            calItem.discounted_price = parseFloat(calItem.discounted_price);
                            if (calItem.discounted_price > totalAmount) {
                                finalAmount = 0;
                            } else if (calItem.discounted_price <= totalAmount) {
                                finalAmount = totalAmount - calItem.discounted_price;
                            }

                            clientData.discounted_price = getDecimalFormat(calItem.discounted_price);
                            grandDiscountAmount += parseFloat(clientData.discounted_price);
                        }

                        if (totalAmount) {
                            clientData.total_amount = getDecimalFormat(totalAmount);
                            grandTotalAmount += parseFloat(totalAmount);
                        }

                        if (finalAmount) {
                            clientData.final_amount = getDecimalFormat(finalAmount);
                            grandFinalAmount += parseFloat(finalAmount);
                        }

                        var noShowAppointments = []
                        if (location && location?.paypal_client_id) {
                            var cancelAppointments = await AppointmentService.getAppointmentsOne({
                                client_id: { $in: [client?._id?.toString()] }
                            }, 1, 1) || [];
                            if (cancelAppointments && cancelAppointments?.length) {
                                cancelAppointments = cancelAppointments.filter((x) => x.booking_status == "cancel");
                            }

                            if (!cancelAppointments?.length) {
                                noShowAppointments = await AppointmentService.getAppointmentsOne({
                                    client_id: { $in: [client?._id?.toString()] }
                                }, 1, noShowLimitVal) || [];
                                noShowAppointments = noShowAppointments.filter((x) => x.booking_status == "no_shows");
                            }

                            if (cancelAppointments?.length && cancelFeeType && cancelFeeValue) {
                                if (cancelFeeType == "percentage") {
                                    advanceAmount = calPercentage(finalAmount, cancelFeeValue);
                                } else {
                                    advanceAmount = cancelFeeValue;
                                }
                            }

                            if (noShowAppointments?.length && nowShowFeeTypeVal && noShowFeeValueVal) {
                                if (nowShowFeeTypeVal == "percentage") {
                                    advanceAmount = calPercentage(finalAmount, noShowFeeValueVal);
                                } else {
                                    advanceAmount = noShowFeeValueVal;
                                }
                            }

                            if (!cancelAppointments?.length && !noShowAppointments?.length && bookingFeeType && bookingFeeValue) {
                                if (bookingFeeType == "percentage") {
                                    advanceAmount = calPercentage(finalAmount, bookingFeeValue);
                                } else {
                                    advanceAmount = bookingFeeValue;
                                }
                            }
                        }

                        if (isPaidSlot) { advanceAmount = 0 }

                        if (advanceAmount > 0) {
                            payWith = "online";

                            clientData.advance_amount = getDecimalFormat(advanceAmount);
                            grandAdvanceAmount += parseFloat(advanceAmount);
                        }

                        calculationData.push(clientData);
                    }
                }
            }
        }

        if (grandTotalAmount) { grandTotalAmount = getDecimalFormat(grandTotalAmount) }

        if (grandDiscountAmount) { grandDiscountAmount = getDecimalFormat(grandDiscountAmount) }

        if (grandAdvanceAmount) {
            if (isReschedule) { grandFinalAmount += grandAdvanceAmount; }

            grandAdvanceAmount = getDecimalFormat(grandAdvanceAmount);
        }

        if (grandFinalAmount) { grandFinalAmount = getDecimalFormat(grandFinalAmount) }

        if (isPaidSlot) {
            if (location && location?.paypal_client_id && grandFinalAmount > 0) {
                payWith = "online";
                grandAdvanceAmount = getDecimalFormat(grandFinalAmount);
            }
        }

        var remainingAmount = 0;
        if (paidAmount <= grandFinalAmount) {
            remainingAmount = grandFinalAmount - paidAmount;
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            payWith: payWith,
            location: location,
            data: calculationData,
            grandTotalAmount: grandTotalAmount,
            grandDiscountAmount: grandDiscountAmount,
            grandFinalAmount: grandFinalAmount,
            grandAdvanceAmount: grandAdvanceAmount,
            rescheduleBookingFeePercentVal: rscldBookingFeePercentVal,
            rescheduleBeforeLimitVal: rscldBeforeLimitVal,
            rescheduleFeePercentVal: rscldFeePercentVal,
            rescheduleLimit: rscldLimit,
            remainingAmount: remainingAmount,
            message: "Appointment calculation received successfully!"
        });
    } catch (e) {
        console.log("getAppointmentCalculation Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.increaseAppointmentRescheduleCount = async function (req, res, next) {
    try {
        var locationId = req.body?.location_id || ""
        var id = req.body?._id || ""
        if (!id) {
            return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
        }

        var appointment = await AppointmentService.updateAppointment(req.body) || null

        return res.status(200).json({
            status: 200,
            flag: true,
            data: appointment,
            message: "Appointment reschedule count increased successfully!"
        })
    } catch (e) {
        console.log("increaseRescheduleCount Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.appointmentStructuralScript = async function (req, res, next) {
    try {

        var appointment = await AppointmentService.getAppointmentData({}) || null;

        if (appointment?.length > 0) {
            for (var i = 0; i < appointment?.length; i++) {

                if (appointment[i].service_data?.length > 0) {

                    for (var s = 0; s < appointment[i].service_data?.length; s++) {

                        if (appointment[i].service_data[s].service_id[0] && (typeof appointment[i].service_data[s].service_id[0] === 'string')) {
                            var service = await ServiceService.getServiceWithPrices(appointment[i].service_data[s].service_id[0]);
                            service._id = service._id?.toString();
                            appointment[i].service_data[s].service_id[0] = service;

                        } else if (appointment[i].service_data[s]?.service_id[0]?._id) {
                            var service = await ServiceService.getServiceWithPrices(appointment[i].service_data[s].service_id[0]?._id);
                            service._id = service._id?.toString();
                            appointment[i].service_data[s].service_id[0] = service;
                        }
                    }
                    await AppointmentService.updateAppointment(appointment[i])
                }
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: appointment.length,
            message: "Appointment appointment structural script run successfully!"
        })
    } catch (e) {
        console.log("appointmentStructuralScript Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

const getWhatsAppDetails = async function (location_id) {
    try {
        if (location_id) {
            var location = await LocationService.getLocationOneHidden({ _id: location_id });

            if (location && location?.whatsapp_access_token && location?.whatsapp_instance_id) {
                var countryCode = location?.company_id?.country_code || 44
                var customParameter = {
                    countryCode: countryCode,
                    whatsapp_access_token: location?.whatsapp_access_token,
                    whatsapp_instance_id: location?.whatsapp_instance_id
                };
                return true;

            } else {
                return false;
            }
        }
        return false;
    } catch (e) {
        console.log(e)
        return customParameter
    }
}

exports.removeAppointmentGiftCardBalance = async function (req, res, next) {
    try {
        var appointmentId = req.query?.appointment_id || "";

        var validation = false;
        var message = "Something went wrong!";

        if (!appointmentId) {
            validation = true;
            message = "Appointment Id must be present!";
        }

        if (validation) {
            return res.status(200).json({ status: 200, flag: false, message: message });
        }

        var appointment = await AppointmentService.getAppointmentOne({ _id: appointmentId }) || null;
        if (appointment && appointment?._id) {
            var companyId = appointment?.company_id?._id || appointment?.company_id || "";
            var locationId = appointment?.location_id?._id || appointment?.location_id || "";
            var customerId = "";
            var remainingAmount = appointment?.remaining_amount || 0;
            var grandFinalPrice = appointment?.grand_final_price || 0;
            if (appointment?.client_id && appointment.client_id?.length) {
                customerId = appointment.client_id[0]?._id || appointment.client_id[0] || "";
            }

            if (appointment?.used_gift_card_bal && appointment?.gift_card_transaction_id && appointment.gift_card_transaction_id?.length) {
                var creditTransactionIds = appointment?.credit_gift_card_transaction_id || [];
                creditTransactionIds = creditTransactionIds.map((item) => {
                    return item?._id || item;
                });

                var giftTransactionIds = appointment.gift_card_transaction_id.map((item) => {
                    return item?._id || item;
                });
                var serviceIds = appointment.service_id.map((item) => {
                    return item?._id || item;
                });

                var giftParam = {
                    company_id: companyId,
                    location_id: locationId,
                    customer_id: customerId,
                    service_ids: serviceIds,
                    appointment_id: appointment?._id || null,
                    transaction_ids: giftTransactionIds,
                    transaction_description: `Appointment gift card removed`
                }

                var creditData = await creditCustomerGiftCardBalance(giftParam);
                if (creditData?.transaction_ids && creditData.transaction_ids?.length) {
                    creditTransactionIds = creditTransactionIds.concat(creditData.transaction_ids.filter((item2) =>
                        !creditTransactionIds.some((item1) => item1 == item2)
                    ));

                    var totalTransactionAmount = creditData?.total_transaction_amount || 0;
                    var usedGiftCardBal = appointment.used_gift_card_bal - totalTransactionAmount;
                    remainingAmount += totalTransactionAmount;
                    grandFinalPrice += totalTransactionAmount;
                    if (usedGiftCardBal < 0) { usedGiftCardBal = 0; }
                    await AppointmentService.updateAppointment({
                        _id: appointment._id,
                        gift_card_transaction_id: [],
                        used_gift_card_bal: usedGiftCardBal,
                        remaining_amount: remainingAmount,
                        grand_final_price: grandFinalPrice,
                        credit_gift_card_transaction_id: creditTransactionIds,
                        removed_gift_card_transaction_id: giftTransactionIds
                    });

                    appointment = await AppointmentService.getAppointmentOne({ _id: appointmentId }) || null;

                    var date = null;
                    if (appointment?.date) {
                        date = formatDate(appointment.date, "YYYY-MM-DD");
                        var params = { location_id: locationId, employee_id: '', date: date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: 'booking' };

                        var refData = await updateAppListTableData(params);
                        var refDashData = setDashboardRefData(params);
                    }

                    return res.status(200).json({
                        status: 200,
                        appointment,
                        data: creditData?.data || [],
                        balance: creditData?.balance || 0,
                        flag: true,
                        message: "Appointment gift card removed successfully."
                    });
                }
            }
        }

        return res.status(200).json({ status: 200, flag: false, message: "Appointment not found." })
    } catch (e) {
        console.log("removeCustomerGiftCardBalance Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.revertAppointmentGiftCardBalance = async function (req, res, next) {
    try {
        var appointmentId = req.query?.appointment_id || "";

        var validation = false;
        var message = "Something went wrong!";

        if (!appointmentId) {
            validation = true;
            message = "Appointment Id must be present!";
        }

        if (validation) {
            return res.status(200).json({ status: 200, flag: false, message: message });
        }

        var appointment = await AppointmentService.getAppointmentOne({ _id: appointmentId }) || null;
        if (appointment?.removed_gift_card_transaction_id && appointment.removed_gift_card_transaction_id?.length) {
            var appointmentId = appointment?._id || null;
            var companyId = appointment?.company_id?._id || appointment?.company_id || "";
            var locationId = appointment?.location_id?._id || appointment?.location_id || "";
            var customerId = appointment.client_id[0]?._id || appointment.client_id[0] || "";

            var giftCardTransactionId = [];
            var remainingAmount = appointment?.remaining_amount || 0;
            var grandFinalPrice = appointment?.grand_final_price || 0;
            var removedGftAmt = 0;

            var creditTransactionIds = appointment.credit_gift_card_transaction_id || [];
            creditTransactionIds = creditTransactionIds.map((item) => {
                return item?._id || item;
            });

            if (creditTransactionIds && creditTransactionIds?.length) {
                var removedGiftTransactionId = appointment.removed_gift_card_transaction_id;
                for (let i = 0; i < removedGiftTransactionId.length; i++) {
                    var item = removedGiftTransactionId[i];
                    if (item?._id && item?.credit_id && item?.amount) {
                        var creditId = item.credit_id?._id || item.credit_id;
                        var index = creditTransactionIds.findIndex((x) => x?.toString() == creditId?.toString());
                        if (index != -1) {
                            removedGftAmt += item.amount;
                            creditTransactionIds.splice(index, 1);
                        }
                    }
                }

                if (remainingAmount && removedGftAmt) {
                    remainingAmount -= removedGftAmt;
                    if (remainingAmount < 0) { remainingAmount = 0; }
                }

                if (grandFinalPrice && removedGftAmt) {
                    grandFinalPrice -= removedGftAmt;
                    if (grandFinalPrice < 0) { grandFinalPrice = 0; }
                }

                if (removedGftAmt) {
                    var serviceIds = appointment.service_id.map((item) => {
                        return item?._id || item;
                    });

                    var giftParam = {
                        company_id: companyId,
                        location_id: locationId,
                        customer_id: customerId,
                        service_ids: serviceIds || [],
                        amount: removedGftAmt,
                        appointment_id: appointmentId,
                        transaction_description: "Revert added to appointment booking"
                    }

                    var debitData = await debitCustomerGiftCardBalance(giftParam);
                    if (debitData?.transaction_ids && debitData.transaction_ids?.length) {
                        await AppointmentService.updateAppointment({
                            _id: appointmentId,
                            used_gift_card_bal: removedGftAmt,
                            remaining_amount: remainingAmount,
                            grand_final_price: grandFinalPrice,
                            gift_card_transaction_id: debitData.transaction_ids,
                            credit_gift_card_transaction_id: creditTransactionIds || [],
                            removed_gift_card_transaction_id: []
                        });
                    }
                }


                appointment = await AppointmentService.getAppointmentOne({ _id: appointmentId }) || null;

                var date = null;
                if (appointment?.date) {
                    date = formatDate(appointment.date, "YYYY-MM-DD");
                    var params = { location_id: locationId, employee_id: '', date: date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: 'booking' };

                    var refData = await updateAppListTableData(params);
                    var refDashData = setDashboardRefData(params);
                }

                return res.status(200).json({
                    status: 200,
                    flag: true,
                    data: appointment,
                    message: "Appointment gift card reverted successfully."
                });
            }
        }

        return res.status(200).json({ status: 200, flag: false, message: "Appointment not found." })
    } catch (e) {
        console.log("revertAppointmentGiftCardBalance Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}