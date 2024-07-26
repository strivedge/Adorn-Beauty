var dateFormat = require('dateformat');
const AppointmentProcessService = require('../services/appointmentProcess.service')
const CategoryService = require('../services/category.service')
const CompanyService = require('../services/company.service')
const DiscountService = require('../services/discount.service')
const EmailLogService = require('../services/emailLog.service')

const ServiceService = require('../services/service.service')


const {
    timeToNum,
    increaseDateDays,
    getEmailTemplateData,
} = require('../helper');

// Saving the context of this module inside the _the variable
_this = this


exports.createAppointmentProcess = async function (req, res, next) {
    try {
        var startTime = req.body?.start_time || ""
        var endTime = req.body?.end_time || ""

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

        var appointment = await AppointmentProcessService.createAppointmentProcess(req.body);

        //Reserve Slot and employee for specifix date


        return res.status(200).json({ status: 200, flag: true, data: appointment, message: "Appointment process created successfully!" })
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}


exports.updateAppointmentProcess = async function (req, res, next) {
    try {
        // Id is necessary for the update
        if (!req.body._id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
        }

        var appointmentProcess = await AppointmentProcessService.updateAppointmentProcess(req.body)

        return res.status(200).json({ status: 200, flag: true, data: appointmentProcess, message: "Appointment process update successfully!" })
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.checkClientIncompleteAppointment = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var client_id = req.body.client_id;
        var date = dateFormat(req.body.date, "yyyy-mm-dd");
        var query = { client_id: client_id }

        query['$and'] = [
            { "createdAt": { $gte: new Date(req.body.date) } },
            { "createdAt": { $lt: new Date(req.body.date) } }
        ]

        var Appointment = await AppointmentProcessService.getAppointmentDetails(query)

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Appointment, message: "Successfully Incomplete Appointment Received" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
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