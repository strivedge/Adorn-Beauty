const AppointmentService = require("../services/appointmentReport.service");


exports.appointmentReport = async function (req, res) {
    let page = req.query.page ? req.query.page : 0; //skip raw value
    let limit = req.query.limit ? req.query.limit : 1000;
    let order_name = req.query.orderBy ? req.query.orderBy : 'date';
    let order = req.query.order ? req.query.order : '-1';
    let query = {};
    let startDate = req.query.start_date ? req.query.start_date : new Date();

    if (req.query.location_id) {
        query.location_id = req.query.location_id;
    }

    if (req.query.start_date && req.query.end_date) {
        query.date = {$gte: req.query.start_date, $lte: req.query.end_date};
    }

    try {
        let appointmentReport = {};
        switch (req.query.type) {
            case 'newCustomer':
                query.isRepeated = 0;
                appointmentReport = await AppointmentService.filterAppointmentByCustomerType(query, startDate, parseInt(page), parseInt(limit), order_name, parseInt(order));
                break;
            case 'repeatedCustomer':
                query.isRepeated = 1;
                appointmentReport = await AppointmentService.filterAppointmentByCustomerType(query, startDate, parseInt(page), parseInt(limit), order_name, parseInt(order));
                break;
            case 'mostService':
                appointmentReport = await AppointmentService.filterAppointmentByMostUsedService(query, parseInt(page), parseInt(limit), order_name, parseInt(order));
                break;
        }
        // Return the AppliedDiscount list with Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: appointmentReport,
            message: "Successfully Appointment Received"
        });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

