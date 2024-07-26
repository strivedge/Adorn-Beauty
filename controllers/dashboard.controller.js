var dateFormat = require('dateformat')
var ObjectId = require('mongodb').ObjectId
var UserService = require('../services/user.service')
var ServiceService = require('../services/service.service')
var CustomerService = require('../services/customer.service')
var LocationService = require('../services/location.service')
var AppointmentService = require('../services/appointment.service')
var CustomerPackageService = require('../services/customerpackage.service')
var DashboardRefService = require('../services/dashboardRef.service')

const { timeToNum, formatDate } = require('../helper')

exports.getDashBoardData = async function (req, res, next) {
    try {
        var start_date = req.query.start_date;
        var end_date = req.query.end_date;
        var today_date = dateFormat(new Date(), "yyyy-mm-dd")

        var rb_query = {};
        var query = {};
        var cQuery = {};
        var eQuery = {};
        var rec_query = {};
        var paid_query = {};
        var unpaid_query = {};
        var book_query = {};
        var client_query = {};
        var service_query = {};

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
            cQuery['location_id'] = req.query.location_id;
            eQuery['location_id'] = req.query.location_id;
            rb_query['location_id'] = req.query.location_id;
            rec_query['location_id'] = req.query.location_id;
            paid_query['location_id'] = req.query.location_id;
            unpaid_query['location_id'] = req.query.location_id;
            book_query['location_id'] = req.query.location_id;
        }

        if (req.query.filter_emp_id && req.query.filter_emp_id != 'undefined') {
            query['service_data'] = { $elemMatch: { employee_id: req.query.filter_emp_id } };
            cQuery['service_data'] = { $elemMatch: { employee_id: req.query.filter_emp_id } };
        }

        if (req.query.start_date && req.query.start_date != 'undefined' && req.query.end_date && req.query.end_date != 'undefined') {
            query['date'] = { $gte: req.query.start_date, $lte: req.query.end_date };
            cQuery['date'] = { $gte: req.query.start_date, $lte: req.query.end_date }
            eQuery['date'] = { $gte: req.query.start_date, $lte: req.query.end_date };
            paid_query['date'] = { $gte: req.query.start_date, $lte: req.query.end_date };
            unpaid_query['date'] = { $gte: req.query.start_date, $lte: req.query.end_date };

            book_query['date'] = { $gte: req.query.start_date, $lte: req.query.end_date };

            var row_date = new Date(start_date);
            // minus 30 day from start_date 
            row_date = row_date.setDate(row_date.getDate() - 30);
            var month_date = dateFormat(row_date, "yyyy-mm-dd");
            rb_query['date'] = { $gte: month_date, $lte: req.query.end_date };
        }

        query['booking_status'] = { $nin: ["cancel", "no_shows"] };
        var total_appointment = await AppointmentService.getAppointmentDataGroup(query);
        total_appointment = total_appointment.length;

        book_query['booking_status'] = { $nin: ["cancel", "no_shows"] };
        book_query['front_booking'] = "true";
        var total_online_appointment = await AppointmentService.getAppointmentSpecific(book_query);

        //book_query['date'] = today_date;
        book_query['createdAt'] = { $lt: req.query.end_date };
        book_query['front_booking'] = { $ne: "true" };
        var phone_booking = await AppointmentService.getAppointmentSpecific(book_query);

        //book_query['date'] = today_date;
        book_query['createdAt'] = req.query.end_date;
        book_query['front_booking'] = { $ne: "true" };
        var today_walkin_appointment = await AppointmentService.getAppointmentSpecific(book_query);

        if (phone_booking && phone_booking.length > 0) {
            for (var i = 0; i < phone_booking.length; i++) {
                client_query['_id'] = { $in: phone_booking[i].client_id };
                var client = await CustomerService.getClients(client_query);
                phone_booking[i].client_id = client;

                service_query['_id'] = { $in: phone_booking[i].service_id };
                phone_booking[i].service_id = await ServiceService.getServiceSpecific(service_query);
                //phone_booking[i].service_id = phone_booking[i].service_id .map(s => s.name);
            }
        }

        if (today_walkin_appointment && today_walkin_appointment.length > 0) {
            for (var i = 0; i < today_walkin_appointment.length; i++) {
                client_query['_id'] = { $in: today_walkin_appointment[i].client_id };
                var client = await CustomerService.getClients(client_query);
                today_walkin_appointment[i].client_id = client;

                service_query['_id'] = { $in: today_walkin_appointment[i].service_id };
                today_walkin_appointment[i].service_id = await ServiceService.getServiceSpecific(service_query);
            }
        }

        if (total_online_appointment && total_online_appointment.length > 0) {
            for (var i = 0; i < total_online_appointment.length; i++) {
                client_query['_id'] = { $in: total_online_appointment[i].client_id };
                var client = await CustomerService.getClients(client_query);
                total_online_appointment[i].client_id = client;

                service_query['_id'] = { $in: total_online_appointment[i].service_id };
                total_online_appointment[i].service_id = await ServiceService.getServiceSpecific(service_query);
            }
        }

        cQuery['booking_status'] = "cancel";
        var total_appointment_cancel = await AppointmentService.getAppointmentDataGroup(cQuery);

        var total_cancel_booking_amt = total_appointment_cancel.map(b => b.remaining_amount);
        total_cancel_booking_amt = total_cancel_booking_amt.reduce((partialSum, a) => partialSum + a, 0);

        total_appointment_cancel = total_appointment_cancel.length;

        cQuery['booking_status'] = "no_shows";
        var total_booking_noshow = await AppointmentService.getAppointmentDataGroup(cQuery);

        var total_noshow_booking_amt = total_booking_noshow.map(b => b.remaining_amount);
        total_noshow_booking_amt = total_noshow_booking_amt.reduce((partialSum, a) => partialSum + a, 0);

        total_booking_noshow = total_booking_noshow.length;

        unpaid_query['booking_status'] = { $nin: ["cancel", "no_shows"] };

        unpaid_query['paid_amount'] = { $eq: 0 };
        var total_unpaid_booking = await AppointmentService.getAppointmentDataGroup(unpaid_query);
        var total_unpaid_booking_amt = total_unpaid_booking.map(b => b.remaining_amount);
        total_unpaid_booking_amt = total_unpaid_booking_amt.reduce((partialSum, a) => partialSum + a, 0);

        if (total_unpaid_booking && total_unpaid_booking.length > 0) {
            for (var i = 0; i < total_unpaid_booking.length; i++) {
                client_query['_id'] = { $in: total_unpaid_booking[i].client_id };
                var client = await CustomerService.getClients(client_query);
                total_unpaid_booking[i].client_id = client;
            }
        }

        paid_query['booking_status'] = { $nin: ["cancel", "no_shows"] };
        paid_query['paid_amount'] = { $gt: 0 };

        var total_paid_booking = await AppointmentService.getAppointmentDataGroup(paid_query);
        var total_paid_booking_amt = total_paid_booking.map(b => b.paid_amount);

        total_paid_booking_amt = total_paid_booking_amt.reduce((partialSum, a) => partialSum + a, 0);

        if (total_paid_booking && total_paid_booking.length > 0) {
            for (var i = 0; i < total_paid_booking.length; i++) {
                client_query['_id'] = { $in: total_paid_booking[i].client_id };
                var client = await CustomerService.getClients(client_query);
                total_paid_booking[i].client_id = client;
            }
        }

        var employee_data = [];
        var emp_query = { location_id: req.query.location_id, is_employee: 1 }
        var emp_list = await UserService.getEmployeeSpecific(emp_query)

        var total_appointment_employee = await AppointmentService.getAppointmentDisctict('service_data.employee_id', query);

        for (var i = 0; i < total_appointment_employee.length; i++) {
            var eq = { _id: total_appointment_employee[i] };
            var employee = await UserService.getEmployeeSpecific(eq);
            if (employee.length > 0) {
                eQuery['booking_status'] = { $nin: ["cancel", "no_shows"] };
                eQuery['service_data'] = { $elemMatch: { employee_id: employee[0]._id.toString() } };
                var total_appointment_emp = await AppointmentService.getAppointmentDataGroup(eQuery);
                total_appointment_emp = total_appointment_emp.length
            } else {
                total_appointment_emp = 0;
            }

            if (employee.length) {
                var emp_data = { employee_id: employee[0]._id, employee_name: employee[0].name, employee_booking: total_appointment_emp };
                employee_data.push(emp_data);
            }
        }

        // Return the Dashboards list with Code and Message.
        return res.status(200).json({
            status: 200, flag: true,
            total_booking: total_appointment,
            total_booking_cancel: total_appointment_cancel,
            total_booking_noshow: total_booking_noshow,
            total_noshow_booking_amt: total_noshow_booking_amt,
            total_cancel_booking_amt: total_cancel_booking_amt,
            employee_booking: employee_data,
            emp_list: emp_list,
            total_paid_booking: total_paid_booking,
            total_paid_booking_amt: total_paid_booking_amt,
            total_unpaid_booking: total_unpaid_booking,
            total_unpaid_booking_amt: total_unpaid_booking_amt,
            total_online_appointment: total_online_appointment,
            today_walkin_appointment: today_walkin_appointment,
            phone_booking: phone_booking,
            message: "Succesfully Dashboard Data Recieved"
        });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getDashBoardRebookingData = async function (req, res, next) {
    try {
        var start_date = req.query.start_date;
        var end_date = req.query.end_date;
        var rb_query = {};
        var rec_query = {};

        if (req.query.location_id && req.query.location_id != 'undefined') {
            rb_query['location_id'] = req.query.location_id;
            rec_query['location_id'] = req.query.location_id;
        }

        if (req.query.start_date && req.query.start_date != 'undefined' && req.query.end_date && req.query.end_date != 'undefined') {
            var row_date = new Date(start_date);
            // minus 30 day from start_date 
            row_date = row_date.setDate(row_date.getDate() - 30);
            var month_date = dateFormat(row_date, "yyyy-mm-dd");
            rb_query['date'] = { $gte: month_date, $lte: req.query.end_date };
        }

        var re_booking = [];
        var service_query = {};
        var client_query = {};

        rb_query['booking_status'] = { $nin: ['cancel', 'no_shows'] };

        if (req.query.total_booking != 1) {
            var appointment = await AppointmentService.getAppointmentSpecific(rb_query);
            for (var i = 0; i < appointment.length; i++) {
                var categories = [];
                var consult_serv_type = [];
                service_query['_id'] = { $in: appointment[i].service_id };
                var service = await ServiceService.getServiceSpecific(service_query);
                //console.log('service',service)
                appointment[i].service_id = service; //services with name and price

                client_query['_id'] = { $in: appointment[i].client_id };
                var client = await CustomerService.getClients(client_query);
                appointment[i].client_id = client; //with name

                if (appointment[i].service_data.length > 0) {
                    for (var j = 0; j < appointment[i].service_data.length; j++) {

                        if ((typeof appointment[i].service_data[j].service_id === 'string' || appointment[i].service_data[j].service_id instanceof String)) {

                            appointment[i].service_data[j].service_id = [appointment[i].service_data[j].service_id]
                        }

                        var group_service = await ServiceService.getService(appointment[i].service_data[j].service_id);
                        appointment[i].service_data[j].service_id = group_service;
                    }
                }

                var rebooking_flag = false;
                for (var j = 0; j < service.length; j++) {
                    if (parseInt(service[j].reminder) && parseInt(service[j].reminder) > 0) {
                        var date_object = new Date(appointment[i].date);
                        var service_date = date_object.setDate(date_object.getDate() + parseInt(service[j].reminder));
                        // var service_date = date_object.setDate(date_object.getDate()+8);

                        var next_service_date = dateFormat(service_date, "yyyy-mm-dd");

                        if (service[j].reminder && next_service_date <= end_date && next_service_date >= start_date && client.length > 0) {

                            appointment[i].next_service_date = next_service_date;

                            rec_query['date'] = { $gte: start_date };
                            rec_query['client_id'] = { $in: [appointment[i].client_id[0]._id.toString()] };
                            rec_query['booking_status'] = { $nin: ['cancel', 'no_shows'] };
                            //console.log('rec_query',rec_query);

                            var recent_booking = await AppointmentService.getAppointmentSpecific(rec_query);
                            //console.log('recent_booking',recent_booking.length)
                            if (recent_booking.length == 0) {
                                rebooking_flag = true;
                            }

                        }
                    }
                }

                if (rebooking_flag) {
                    re_booking.push(appointment[i]);
                }
            }
        }

        // Return the Dashboards list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, re_booking: re_booking, message: "Succesfully Re-Booking Data Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getDashboardAppointments = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var query = {};
        var book_query = {};
        var service_query = {};

        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id;
            book_query['location_id'] = req.body.location_id;
        }
        if (req.body.employee_id && req.body.employee_id != 'undefined') {
            query['service_data'] = { $elemMatch: { employee_id: req.body.employee_id } };
            book_query['service_data'] = { $elemMatch: { employee_id: req.body.employee_id } };
        }

        if (req.body.start_date && req.body.start_date != 'undefined' && req.body.end_date && req.body.end_date != 'undefined') {
            query['date'] = { $gte: req.body.start_date, $lte: req.body.end_date };
            book_query['date'] = { $gte: req.body.start_date, $lte: req.body.end_date };
        }

        //query['booking_status'] = {$nin:["cancel","no_shows"]};
        if (req.body.booking_status && req.body.booking_status != 'undefined') {
            query['booking_status'] = req.body.booking_status;
        }

        if (req.body.paid_booking && req.body.paid_booking != 'undefined') {
            query['payment_type'] = 'paypal';
            query['transaction_id'] = { $ne: '' };
        }

        var client_query = {};
        var app = [];

        appointment = await AppointmentService.getAppointmentSpecific(query);
        for (var i = 0; i < appointment.length; i++) {
            service_query['_id'] = { $in: appointment[i].service_id };
            var service = await ServiceService.getServiceSpecific(service_query);

            appointment[i].service_id = service; //services with name and price

            if (appointment[i].customer_package_id && appointment[i].customer_package_id.length > 0) {
                var package_ids = appointment[i].customer_package_id.map(x => ObjectId(x));

                appointment[i].customer_package_id = await CustomerPackageService.getCustomerPackagesWithPackageData({ _id: { $in: package_ids } });
            }

            if (appointment[i].package_service && appointment[i].package_service.length > 0) {
                service_query['_id'] = { $in: appointment[i].package_service };
                var service = await ServiceService.getServiceSpecific(service_query);
                appointment[i].package_service = service; //services with name and price
            }

            if (appointment[i].discount_services && appointment[i].discount_services.length > 0) {
                service_query['_id'] = { $in: appointment[i].discount_services };
                var service = await ServiceService.getServiceSpecific(service_query);
                appointment[i].discount_services = service; //services with name and price
            }

            if (appointment[i].group_data && appointment[i].group_data.length > 0) {
                for (var j = 0; j < appointment[i].group_data.length; j++) {
                    service_query['_id'] = { $in: appointment[i].group_data[j].service_id };
                    var group_service = await ServiceService.getServiceSpecific(service_query);
                    appointment[i].group_data[j].service_id = group_service;
                }
            }

            if (appointment[i].start_time) {
                var stime = appointment[i].start_time;
                var stimeToNum = timeToNum(appointment[i].start_time);

                stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM';

                var showStartTimeSpilt = stime.split(':');
                var end_hour = showStartTimeSpilt[0];
                end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                stime = showStartTimeSpilt.join(':');

                appointment[i].start_time = stime + " " + stimeToNum;
            }

            if (appointment[i].end_time) {
                var etime = appointment[i].end_time;
                var etimeToNum = timeToNum(appointment[i].end_time);

                etimeToNum = etimeToNum >= 720 ? 'PM' : 'AM';

                var showEndTimeSpilt = etime.split(':');
                var end_hour = showEndTimeSpilt[0];
                end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                etime = showEndTimeSpilt.join(':');

                appointment[i].end_time = etime + " " + etimeToNum;
            }

            client_query['_id'] = { $in: appointment[i].client_id };
            var client = await CustomerService.getClients(client_query);
            appointment[i].client_id = client; //with name
        }

        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: appointment, message: "Successfully Appointments Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

/* New dashboard stats api's */
exports.getDashBoardStats = async function (req, res, next) {
    try {
        var startDate = req.query?.start_date || ""
        var endDate = req.query?.end_date || ""
        var startTargetDate = new Date(startDate)
        var endTargetDate = new Date(endDate)
        var startDate = req.query?.start_date || ""
        var todayDate = dateFormat(new Date(), "yyyy-mm-dd")
        var locationId = req.query?.location_id || ""
        var filterEmpId = req.query?.filter_emp_id || ""
        var type = req.query?.type || ""

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

        if (type == "range") {
            var rangeData = []
            var rangeSumData = null
            var dateRanges = await AppointmentService.getAppointmentDisctict('date', query)
            if (dateRanges && dateRanges.length) {
                for (let i = 0; i < dateRanges.length; i++) {
                    var bookQuery = {};
                    if (locationId) {
                        bookQuery['location_id'] = locationId;
                    }
                    if (startDate && endDate) {
                        bookQuery['date'] = { $gte: startDate, $lte: endDate };
                    }
                    let date = dateRanges[i] || null
                    if (date) {
                        date = dateFormat(new Date(date), "yyyy-mm-dd")
                        var targetDate = new Date(date)

                        bookQuery['date'] = date;
                        bookQuery['booking_status'] = { $nin: ["cancel", "no_shows"] }
                        bookQuery['front_booking'] = "true";
                        var totalOnlineAppointment = await AppointmentService.getAppointmentsOne(bookQuery)
                        totalOnlineAppointment = totalOnlineAppointment?.length || 0
                        bookQuery['createdAt'] = { $lt: date }
                        // bookQuery['createdAt'] = {
                        //     $lt: new Date(targetDate.setHours(23, 59, 59, 999)), // End of the day
                        // }


                        bookQuery['front_booking'] = { $ne: "true" }

                        var phoneBooking = await AppointmentService.getAppointmentsOne(bookQuery)
                        phoneBooking = phoneBooking?.length || 0;

                        // bookQuery['createdAt'] = date
                        bookQuery['createdAt'] = {
                            $gte: new Date(targetDate.setHours(0, 0, 0, 0)), // Start of the day
                            $lt: new Date(targetDate.setHours(23, 59, 59, 999)), // End of the day
                        }
                        bookQuery['front_booking'] = { $ne: "true" }
                        var todayWalkinAppointment = await AppointmentService.getAppointmentsOne(bookQuery)
                        todayWalkinAppointment = todayWalkinAppointment?.length || 0

                        cQuery['date'] = date
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

                        query['booking_status'] = { $nin: ["cancel", "no_shows"] }
                        query['date'] = date
                        var totalAppointment = await AppointmentService.getAppointmentDataGroup(query)
                        totalAppointment = totalAppointment?.length || 0

                        unpaidQuery['date'] = date
                        unpaidQuery['booking_status'] = { $nin: ["cancel", "no_shows"] }
                        unpaidQuery['paid_amount'] = { $eq: 0 }
                        var totalUnpaidBooking = await AppointmentService.getAppointmentsOne(unpaidQuery)
                        var totalUnpaidBookingAmt = totalUnpaidBooking?.map(b => b.remaining_amount) || 0
                        totalUnpaidBookingAmt = totalUnpaidBookingAmt?.reduce((partialSum, a) => partialSum + a, 0) || 0

                        paidQuery['date'] = date
                        paidQuery['booking_status'] = { $nin: ["cancel", "no_shows"] }
                        paidQuery['paid_amount'] = { $gt: 0 }
                        var totalPaidBooking = await AppointmentService.getAppointmentDataGroup(paidQuery)
                        var totalPaidBookingAmt = totalPaidBooking?.map(b => b.paid_amount) || 0
                        totalPaidBookingAmt = totalPaidBookingAmt?.reduce((partialSum, a) => partialSum + a, 0) || 0

                        var totalAmt = (totalUnpaidBookingAmt + totalPaidBookingAmt + totalCancelBookingAmt + totalNoShowBookingAmt)
                        var netAmt = (totalUnpaidBookingAmt + totalPaidBookingAmt)

                        var rangeStats = {
                            date: date,
                            /* Appointment */
                            walkin: todayWalkinAppointment,
                            phone: phoneBooking,
                            online: totalOnlineAppointment,
                            cancel: totalAppointmentCancel,
                            no_show: totalBookingNoShow,
                            total: totalAppointment,
                            /* /Appointment */

                            /* Sales */
                            total_amt: totalAmt,
                            net_amt: netAmt,
                            cancel_amt: totalCancelBookingAmt,
                            no_show_amt: totalNoShowBookingAmt,
                            paid_amt: totalPaidBookingAmt,
                            unpaid_amt: totalUnpaidBookingAmt
                            /* /Sales */
                        }
                        rangeData.push(rangeStats)
                    }
                }

                if (rangeData && rangeData?.length) {
                    var totalWalkinSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.walkin || 0;
                    }, 0)

                    var totalPhoneSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.phone || 0;
                    }, 0)

                    var totalOnlineSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.online || 0;
                    }, 0)

                    var totalCancelSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.cancel || 0;
                    }, 0)

                    var totalNoShowSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.no_show || 0;
                    }, 0)

                    var totalAppointmentSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.total || 0;
                    }, 0)

                    var totalAmtSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.total_amt || 0;
                    }, 0)

                    var totalNetAmtSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.net_amt || 0;
                    }, 0)

                    var totalCancelAmtSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.cancel_amt || 0;
                    }, 0)

                    var totalNoShowAmtSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.no_show_amt || 0;
                    }, 0)

                    var totalPaidAmtSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.paid_amt || 0;
                    }, 0)

                    var totalUnpaidAmtSum = rangeData.reduce((accumulator, item) => {
                        return accumulator + item?.unpaid_amt || 0;
                    }, 0)

                    rangeSumData = {
                        walkin: totalWalkinSum,
                        phone: totalPhoneSum,
                        online: totalOnlineSum,
                        cancel: totalCancelSum,
                        no_show: totalNoShowSum,
                        total: totalAppointmentSum,
                        total_amt: totalAmtSum,
                        net_amt: totalNetAmtSum,
                        cancel_amt: totalCancelAmtSum,
                        no_show_amt: totalNoShowAmtSum,
                        paid_amt: totalPaidAmtSum,
                        unpaid_amt: totalUnpaidAmtSum
                    }
                }
            }

            return res.status(200).json({
                status: 200,
                flag: true,
                data: rangeData,
                rangeSum: rangeSumData,
                message: "Dashboard stats recieved succesfully!"
            })
        } else {
            query['booking_status'] = { $nin: ["cancel", "no_shows"] }
            var totalAppointment = await AppointmentService.getAppointmentsOne(query)
            totalAppointment = totalAppointment?.length || 0

            bookQuery['booking_status'] = { $nin: ["cancel", "no_shows"] }
            bookQuery['front_booking'] = "true"
            var totalOnlineAppointment = await AppointmentService.getAppointmentsOne(bookQuery)
            totalOnlineAppointment = totalOnlineAppointment?.length || 0

            // bookQuery['date'] = todayDate
            bookQuery['createdAt'] = { $lt: endDate }
            // bookQuery['createdAt'] = {
            //     $lt: new Date(endTargetDate.setHours(23, 59, 59, 999)), // End of the day
            // }
            bookQuery['front_booking'] = { $ne: "true" }
            var phoneBooking = await AppointmentService.getAppointmentsOne(bookQuery)
            phoneBooking = phoneBooking?.length || 0

            //book_query['date'] = today_date
            // bookQuery['createdAt'] = endDate
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
            return res.status(200).json({
                status: 200,
                flag: true,
                data: {
                    /* Appointment */
                    total_booking: totalAppointment,
                    total_booking_noshow: totalBookingNoShow,
                    total_booking_cancel: totalAppointmentCancel,
                    total_online_appointment: totalOnlineAppointment,
                    today_walkin_appointment: todayWalkinAppointment,
                    phone_booking: phoneBooking,
                    // total_paid_booking: totalPaidBooking,
                    // total_unpaid_booking: totalUnpaidBooking,
                    /* /Appointment */

                    /* Sales */
                    total_amt: totalAmt,
                    net_amt: netAmt,
                    total_noshow_booking_amt: totalNoShowBookingAmt,
                    total_cancel_booking_amt: totalCancelBookingAmt,
                    total_paid_booking_amt: totalPaidBookingAmt,
                    total_unpaid_booking_amt: totalUnpaidBookingAmt,
                    /* Sales */
                },
                message: "Dashboard stats recieved succesfully!"
            })
        }
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getDashBoardStatsRebooking = async function (req, res, next) {
    try {
        var startDate = req.query?.start_date || ""
        var endDate = req.query?.end_date || ""
        var locationId = req.query?.location_id || ""
        var type = req.query?.type || "count"

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

        var reBookingData = []
        if (type == "list") {
            reBookingData = reBooking || []
        }

        // Return the Dashboards list with Code and Message.
        return res.status(200).json({
            status: 200, flag: true,
            re_booking_count: reBooking?.length || 0,
            re_booking: reBookingData,
            message: "Dashboard stats rebooking recieved succesfully!"
        })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getDashBoardStatsListDetail = async function (req, res, next) {
    try {
        var startDate = req.query?.start_date || ""
        var endDate = req.query?.end_date || ""
        var locationId = req.query?.location_id || ""
        var employeeId = req.query?.employee_id || ""
        var paidBooking = req.query?.paid_booking || ""
        var bookingStatus = req.query?.booking_status || ""
        var statusType = req.query?.status_type || ""

        var query = {}

        if (locationId) {
            query['location_id'] = locationId
        }

        if (employeeId) {
            query['service_data'] = { $elemMatch: { employee_id: employeeId } }
        }

        if (startDate && endDate) {
            query['date'] = { $gte: startDate, $lte: endDate }
        }

        if (paidBooking) {
            query['payment_type'] = 'paypal'
            query['transaction_id'] = { $ne: '' }
        }

        if (bookingStatus) {
            query['booking_status'] = bookingStatus
        }

        if (statusType == "online") {
            query['booking_status'] = { $nin: ["cancel", "no_shows"] }
            query['front_booking'] = "true"
        }

        if (statusType == "phone") {
            query['booking_status'] = { $nin: ["cancel", "no_shows"] }
            query['createdAt'] = { $lt: endDate }
            query['front_booking'] = { $ne: "true" }
        }

        if (statusType == "walkin") {
            var targetDate = new Date(endDate)
            query['booking_status'] = { $nin: ["cancel", "no_shows"] }
            query['createdAt'] = {
                $gte: new Date(targetDate.setHours(0, 0, 0, 0)), // Start of the day
                $lt: new Date(targetDate.setHours(23, 59, 59, 999)), // End of the day
            }
            query['front_booking'] = { $ne: "true" }
        }

        if (statusType == "unpaid") {
            query['booking_status'] = { $nin: ["cancel", "no_shows"] }
            query['paid_amount'] = { $eq: 0 }
        }

        if (statusType == "paid") {
            query['booking_status'] = { $nin: ["cancel", "no_shows"] }
            query['paid_amount'] = { $gt: 0 }
        }

        var appointments = await AppointmentService.getAppointmentsOne(query)
        if (appointments && appointments.length) {
            for (var i = 0; i < appointments.length; i++) {
                var clientId = ""
                if (appointments[i]?.client_id && appointments[i]?.client_id?.length) {
                    clientId = appointments[i]?.client_id[0]?._id ? appointments[i]?.client_id[0]?._id : appointments[i]?.client_id[0] || ""
                }

                if (appointments[i].customer_package_id && appointments[i].customer_package_id.length > 0) {
                    for (var j = 0; j < appointments[i].customer_package_id.length; j++) {
                        appointments[i].customer_package_id[j].package_group_services = appointments[i].customer_package_id[j].package_id.group_services
                        appointments[i].customer_package_id[j].package_data = appointments[i].customer_package_id[j].package_id
                        appointments[i].customer_package_id[j].package_id = ''
                        appointments[i].customer_package_id[j].package_id = appointments[i].customer_package_id[j].package_data._id
                    }
                }

                if (appointments[i].discount_services && appointments[i].discount_services.length > 0) {
                    var serviceQuery = { _id: { $in: appointments[i].discount_services } }
                    var services = await ServiceService.getServiceSpecific(serviceQuery) || []
                    appointments[i].discount_services = services //services with name and price
                }

                if (appointments[i]?.group_data && appointments[i].group_data?.length > 0) {
                    for (var j = 0; j < appointments[i].group_data.length; j++) {
                        var serviceQuery = { _id: { $in: appointments[i].group_data[j].service_id } }
                        var group_service = await ServiceService.getServiceSpecific(serviceQuery)
                        appointments[i].group_data[j].service_id = group_service
                    }
                }

                if (appointments[i]?.start_time) {
                    var stime = appointments[i].start_time
                    var stimeToNum = timeToNum(appointments[i].start_time)
                    stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM'
                    var showStartTimeSpilt = stime.split(':')
                    var end_hour = showStartTimeSpilt[0]
                    end_hour = end_hour > 12 ? end_hour - 12 : end_hour
                    showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
                    stime = showStartTimeSpilt.join(':')
                    appointments[i].start_time = stime + " " + stimeToNum
                }

                if (appointments[i]?.end_time) {
                    var etime = appointments[i].end_time
                    var etimeToNum = timeToNum(appointments[i].end_time)
                    etimeToNum = etimeToNum >= 720 ? 'PM' : 'AM'
                    var showEndTimeSpilt = etime.split(':')
                    var end_hour = showEndTimeSpilt[0]
                    end_hour = end_hour > 12 ? end_hour - 12 : end_hour
                    showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
                    etime = showEndTimeSpilt.join(':')
                    appointments[i].end_time = etime + " " + etimeToNum
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: appointments, message: "Dashboard stats list detail received successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getEmployeeAppointmentsCount = async function (req, res, next) {
    try {
        var startDate = req.query?.start_date || ""
        var endDate = req.query?.end_date || ""
        var locationId = req.query?.location_id || ""

        var query = { booking_status: { $nin: ["cancel", "no_shows"] } }
        var eQuery = {}

        if (locationId) {
            query['location_id'] = locationId
            eQuery['location_id'] = locationId
        }

        if (startDate && endDate) {
            query['date'] = { $gte: startDate, $lte: endDate }
            eQuery['date'] = { $gte: startDate, $lte: endDate }
        }

        var employeeData = []
        var totalAppointmentEmployeeIds = await AppointmentService.getAppointmentDisctict('service_data.employee_id', query)
        if (totalAppointmentEmployeeIds && totalAppointmentEmployeeIds.length) {
            for (var i = 0; i < totalAppointmentEmployeeIds.length; i++) {
                var eq = { _id: totalAppointmentEmployeeIds[i] }
                var employee = await UserService.getEmployeeOneSpecific(eq) || null
                var totalAppointmentEmp = 0
                if (employee && employee._id) {
                    query['service_data'] = { $elemMatch: { employee_id: employee._id?.toString() } }
                    totalAppointmentEmp = await AppointmentService.getAppointmentDataGroup(query)
                    totalAppointmentEmp = totalAppointmentEmp?.length || 0

                    var empData = { employee_id: employee._id, employee_name: employee.name, employee_booking: totalAppointmentEmp }
                    employeeData.push(empData)
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: employeeData, message: "Employee appointments count received successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
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

        var appointments = await AppointmentService.getAppointmentsOne(rbQuery) || [];
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
        var query = { location_id: params.location_id, date: params.start_date };
        var dashData = await DashboardRefService.getDashboardRefs(query);

        return dashData
    } catch (e) {
        return null
    }
}

exports.getDashboardRefData = async function (req, res, next) {
    try {

        var params = { location_id: req.query.location_id, date: req.query.start_date };
        var refData;
        if (req.query.type == 'single') {
            refData = await checkDashRefData(req.query);

            if (!refData || !refData.data || req.query.is_update) {
                var statData = await getDashRefStatData(req.query);

                var reqData = { location_id: params.location_id, date: params.date, data: statData, re_bookings: [] };
                if (params.location_id && params.date) {
                    await DashboardRefService.deleteMultiple(params);
                    refData = await DashboardRefService.createDashboardRef(reqData);
                }
            }
        } else {
            var query = { location_id: req.query.location_id, date: { $gte: req.query.start_date, $lte: req.query.end_date } };
            refData = await DashboardRefService.getDashboardRefSpecific(query);
        }


        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: refData, message: "Successfully Appointments Recieved" });
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getDashboardRefRebookingData = async function (req, res, next) {
    try {

        var params = {
            location_id: req.query.location_id, date: req.query.date,
            start_date: req.query.date, end_date: req.query.date
        };
        var reBookings = await getDashRefReBookings(params);


        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: reBookings, message: "Successfully Appointments Recieved" });
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getDashboardRebookingRefData = async function (req, res, next) {
    try {

        var params = { location_id: req.query.location_id, date: req.query.date };

        var refData = await checkDashRefData(req.query);
        var apps = [];

        if (!refData || !refData.data) {
            var statData = await getDashRefStatData(req.query);
            //var reBookings = await getDashRefReBookings(req.query);

            var reBookingsIds = [];

            // if(reBookings && reBookings.length > 0){
            //     reBookingsIds = reBookings.map(a => a._id.toString())
            // }

            var reqData = { location_id: params.location_id, date: params.date, data: statData, re_bookings: reBookingsIds };
            if (params.location_id && params.date) {
                await DashboardRefService.deleteMultiple(params);
                refData = await DashboardRefService.createDashboardRef(reqData);
            }
        }
        if (refData.re_bookings && refData.re_bookings.length > 0) {
            var query = { _id: { $in: refData.re_bookings }, location_id: params.location_id }
            apps = await AppointmentService.getAppointmentsOne(query)
        }


        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, re_booking: apps, message: "Successfully Appointments Recieved" });
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.setDashboardFutureRefData = async function (req, res, next) {
    try {
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
            }
            var appointment = await AppointmentService.getAppointmentDatedSpecific(app_query);
            dateArr = appointment.map(a => a.date);
            dateArr = dateArr.map(x => dateFormat(x, "yyyy-mm-dd"));
            dateArr = dateArr.filter((item, pos) => dateArr.indexOf(item) === pos);

            if (dateArr && dateArr.length > 0) {
                for (var d = 0; d < dateArr.length; d++) {

                    var params = { location_id: location_id.toString(), date: dateArr[d] };

                    var reqParams = { location_id: location_id.toString(), date: dateArr[d], start_date: dateArr[d], end_date: dateArr[d] };

                    if (params.location_id && params.date) {

                        var statData = await getDashRefStatData(reqParams);
                        // var reBookings = await getDashRefReBookings(reqParams);
                        var reBookingsIds = [];

                        // if(reBookings && reBookings.length > 0){
                        //     reBookingsIds = reBookings.map(a => a._id.toString())
                        // }

                        var reqData = { location_id: params.location_id, date: params.date, data: statData, re_bookings: reBookingsIds };

                        await DashboardRefService.deleteMultiple(params);
                        await DashboardRefService.createDashboardRef(reqData);
                    }
                }
            }

        } else {
            var query = { status: 1 }
            var locations = await LocationService.getActiveLocations(query);
            for (var i = 0; i < locations.length; i++) {

                app_query['location_id'] = locations[i]._id;
                app_query['date'] = { $gte: st_date };

                var appointment = await AppointmentService.getAppointmentDatedSpecific(app_query);

                dateArr = appointment.map(a => a.date);
                dateArr = dateArr.map(x => dateFormat(x, "yyyy-mm-dd"));
                dateArr = dateArr.filter((item, pos) => dateArr.indexOf(item) === pos);
                //dateArr = ['2023-11-02']
                if (dateArr && dateArr.length > 0) {
                    for (var d = 0; d < dateArr.length; d++) {

                        var params = { location_id: locations[i]._id.toString(), date: dateArr[d] };

                        var reqParams = { location_id: locations[i]._id.toString(), date: dateArr[d], start_date: dateArr[d], end_date: dateArr[d] };

                        if (params.location_id && params.date) {

                            var statData = await getDashRefStatData(reqParams);
                            //var reBookings = await getDashRefReBookings(reqParams);

                            var reBookingsIds = [];

                            // if(reBookings && reBookings.length > 0){
                            //     reBookingsIds = reBookings.map(a => a._id.toString())
                            // }

                            var reqData = { location_id: params.location_id, date: params.date, data: statData, re_bookings: reBookingsIds };

                            await DashboardRefService.deleteMultiple(params);
                            await DashboardRefService.createDashboardRef(reqData);
                        }
                    }
                }
            }
        }


        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, start_date: st_date, data: dateArr, message: "Successfully Appointments Recieved" });
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

/* /New dashboard stats api's */

/* Customer */
exports.getCustomerDashboardData = async function (req, res, next) {
    try {
        var locationId = req.query?.location_id || "";
        var customerId = req.query?.customer_id || "";

        var message = "";
        var validation = false;
        if (!locationId) {
            flag = false
            validation = true
            message = "Location id must be present!"
        } else if (!customerId) {
            flag = false
            validation = true
            message = "Customer id must be present!"
        }

        if (validation) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: message
            })
        }

        var query = { booking_status: "pending" }
        if (locationId) {
            query['location_id'] = locationId
        }

        if (customerId) {
            query['client_id'] = { $in: [customerId] }
        }

        var todayDate = formatDate(null, "YYYY-MM-DD");
        query['date'] = { $gt: todayDate }

        var appointments = await AppointmentService.getAppointmentsOne(query, 1, 0, "_id", 1);

        return res.status(200).json({ status: 200, flag: true, upcomingAppointments: appointments, message: "Customer dashboard data received successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
/* /Customer */