var UserService = require('../services/user.service')
var CustomerService = require('../services/customer.service')
var ServiceService = require('../services/service.service')
var LocationService = require('../services/location.service')
var AppointmentService = require('../services/appointment.service')
var SendEmailSmsService = require('../services/sendEmailSms.service')
var ConsultantFormService = require('../services/consultantForm.service')
var ConsultantServiceTypeQuestionService = require('../services/consultantServiceTypeQuestion.service')
const { getEmployees } = require("../services/user.service")

const { getTodayTiming, getAvailableEmployee, checkAppListRefData, setAppListTableData, updateAppListTableData, generateTableTimeSlotNew } = require('../common')

var path = require('path').resolve('./') //get main dir path
var dateFormat = require("dateformat")
var ObjectId = require('mongodb').ObjectID

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getConsultantForms = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0 //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt'
    var order = req.query.order ? req.query.order : '-1'
    var searchText = req.query.searchText ? req.query.searchText : ''

    var query = {}
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id
    }

    if (req.query.client_id && req.query.client_id != 'undefined') {
        query['client_id'] = { $in: req.query.client_id }
    }

    if (req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [{ name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { email: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { mobile: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }]
    }

    try {
        var ConsultantForms = await ConsultantFormService.getConsultantForms(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText)
        // Return the ConsultantForms list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: ConsultantForms, message: "Successfully ConsultantForms Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// Async Controller function to get the To do List
exports.getBookingsConsultant = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 0 //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt'
        var order = req.query.order ? req.query.order : '-1'
        var searchText = req.query.searchText ? req.query.searchText : ''

        var query = { booking_status: { $ne: "cancel" } }
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        if (req.query.date && req.query.date != 'undefined') {
            query['date'] = req.query.date
        }

        if (req.query.service_id && req.query.service_id != 'undefined') {
            query['service_id'] = { $elemMatch: { $eq: req.query.service_id.toString() } }
        }

        if (req.query.client_id && req.query.client_id != 'undefined') {
            query['client_id'] = { $elemMatch: { $eq: req.query.client_id.toString() } }
        }

        var bookingConsultant = await AppointmentService.getBookings(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText)
        var bookingsData = bookingConsultant[0].data
        var pagination = bookingConsultant[0].pagination
        for (var i = 0; i < bookingsData.length; i++) {
            var category_id = []
            var service_type_data = []
            var consultant = await ConsultantFormService.getConsultantFormsSpecific({ booking_id: bookingsData[i]._id })
            if (consultant && consultant.length) {
                var con_serv_query = { _id: { $in: consultant[0].service_id }, status: 1 }
                var con_service = await ServiceService.getServiceSpecific(con_serv_query);
                consultant[0].service_id = con_service

                var client_query = { _id: { $in: consultant[0].client_id } }
                var client = await CustomerService.getClients(client_query)
                consultant[0].client_id = client
                consultant[0].employee_name = ''

                if (consultant[0].employee_id) {
                    var con_emp_query = { _id: consultant[0].employee_id }
                    var con_employee = await UserService.getClients(con_emp_query)
                    consultant[0].employee_name = con_employee[0].name
                }

                bookingsData[i].consultation = consultant
            } else {
                bookingsData[i].consultation = []
            }

            var serv_query = { _id: { $in: bookingsData[i].service_id }, status: 1 }
            var service = await ServiceService.getServiceSpecific(serv_query)
            for (var s = 0; s < service.length; s++) {
                var cindex = category_id.indexOf(service[s].category_id)
                if (cindex == -1) {
                    category_id.push(service[s].category_id)

                    var serv_type_query = { location_id: bookingsData[i].location_id, customer_id: bookingsData[i].client_id[0], category_id: service[s].category_id }
                    var serv_type_data = await ConsultantServiceTypeQuestionService.getConsultantServiceTypeQuestionUnique(serv_type_query)
                    if (serv_type_data && serv_type_data._id) {
                        var ctypeindex = service_type_data.indexOf(serv_type_data._id)
                        if (ctypeindex == -1) {
                            service_type_data.push(serv_type_data._id.toString())
                        }
                    }
                }
            }

            let service_data = []
            for (let ia = 0; ia < bookingsData[i].service_data.length; ia++) {
                let newServiceData = {}
                newServiceData = bookingsData[i].service_data[ia]

                let emp_id = bookingsData[i].service_data[ia].employee_id
                let emp_data = await getEmployees({ "_id": emp_id })
                let emp_name = emp_data[0]._doc.name
                newServiceData.employee_name = emp_name
                service_data.push(newServiceData)
            }

            bookingsData[i].service_data = service_data
            let empName = bookingsData[i].service_data.map(x => x.employee_name)
            let uniqueNames = [...new Set(empName)]
            bookingsData[i].employeeNames = uniqueNames
            bookingsData[i].service_id = service
            bookingsData[i].categories = category_id

            if (!bookingsData[i].consultant_service_type || !bookingsData[i].consultant_service_type.length) {
                bookingsData[i].consultant_service_type = service_type_data
            }

            var client_query = { _id: { $in: bookingsData[i].client_id } }
            var client = await CustomerService.getClients(client_query)
            var clientOldForm = await ConsultantFormService.getClientConsultantForm(bookingsData[i].client_id[0])
            if (clientOldForm && clientOldForm != null) {
                if (client && client.length) {
                    client[0].name = clientOldForm.name
                    client[0].first_name = clientOldForm.first_name
                    client[0].last_name = clientOldForm.last_name
                    var uname = clientOldForm.name
                    var user_fname = clientOldForm.first_name
                    var user_lname = clientOldForm.last_name
                    var user_dob = clientOldForm.dob;
                    var user_age = clientOldForm.age;
                    if (!client[0].dob || client[0].dob == null) {
                        client[0].dob = clientOldForm.dob
                    }

                    client[0]['residential_address'] = clientOldForm.residential_address
                    client[0]['surgery_name'] = clientOldForm.surgery_name
                    client[0]['doctor_name'] = clientOldForm.doctor_name

                    bookingsData[i].consultation_user = {
                        name: uname,
                        first_name: user_fname,
                        last_name: user_lname,
                        dob: user_dob,
                        age: user_age,
                        residential_address: clientOldForm.residential_address,
                        surgery_name: clientOldForm.surgery_name,
                        doctor_name: clientOldForm.doctor_name,
                        customer_signature: ''
                    }
                }
            }

            bookingsData[i].client_id = client //with name
            bookingsData[i].employee_name = ""

            if (bookingsData[i].start_time) {
                var stime = bookingsData[i].start_time
                var stimeToNum = timeToNum(bookingsData[i].start_time)
                stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM'

                var showStartTimeSpilt = stime.split(':')
                var end_hour = showStartTimeSpilt[0]
                end_hour = end_hour > 12 ? end_hour - 12 : end_hour
                showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
                stime = showStartTimeSpilt.join(':')

                bookingsData[i].start_time = stime + " " + stimeToNum
            }
        }

        bookingConsultant[0].data = bookingsData
        bookingConsultant[0].pagination = pagination
        // Return the ConsultantForms list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: bookingConsultant, message: "Successfully Bookings Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getBookingConsultants = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 0 //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt'
        var order = req.query.order ? req.query.order : '-1'
        var searchText = req.query.searchText ? req.query.searchText : ''

        var query = { booking_status: { $ne: "cancel" } }
        var empQuery = { is_employee: 1 }

        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
            empQuery['location_id'] = req.query.location_id
        }

        if (req.query.client_id && req.query.client_id != 'undefined') {
            query['client_id'] = { $elemMatch: { $eq: req.query.client_id.toString() } }
        }

        if (req.query.date && req.query.date != 'undefined') {
            query['date'] = req.query.date
        }

        if (req.query.service_id && req.query.service_id != 'undefined') {
            query['service_id'] = { $elemMatch: { $eq: req.query.service_id.toString() } }
        }

        var employees = await UserService.getUsersDropdown(empQuery) || []

        var bookingConsultant = await AppointmentService.getAggregateBookings(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText)
        var bookingsData = bookingConsultant[0].data
        var pagination = bookingConsultant[0].pagination
        for (var i = 0; i < bookingsData.length; i++) {
            var clientId = ""
            if (bookingsData[i]?.client_id && bookingsData[i].client_id?.length) {
                clientId = bookingsData[i].client_id[0]?._id ? bookingsData[i].client_id[0]?._id : bookingsData[i].client_id[0] || ""
            }

            var categoryIds = []
            var serviceTypeData = []
            var consultant = await ConsultantFormService.getConsultantFormsOne({ booking_id: bookingsData[i]._id }) || []
            bookingsData[i].consultation = consultant

            var services = bookingsData[i]?.service_id || []
            if (services && services?.length) {
                for (let s = 0; s < services.length; s++) {
                    const element = services[s]
                    let categoryId = ""
                    if (element && element._id) {
                        categoryId = element?.category_id?.toString() || ""
                    } else {
                        var service = await ServiceService.getServiceOne({ _id: element })
                        categoryId = service?.category_id?.toString() || ""
                    }

                    var catIndex = categoryIds.indexOf(categoryId)
                    if (catIndex == -1) {
                        categoryIds.push(categoryId)

                        var servTypeQuery = { location_id: bookingsData[i].location_id, customer_id: clientId, category_id: categoryId }
                        var servTypeData = await ConsultantServiceTypeQuestionService.getConsultantServiceTypeQuestionUnique(servTypeQuery)
                        if (servTypeData && servTypeData._id) {
                            var cTypeIndex = serviceTypeData.indexOf(servTypeData._id)
                            if (cTypeIndex == -1) {
                                serviceTypeData.push(servTypeData._id.toString())
                            }
                        }
                    }
                }
            }

            var serviceData = []
            if (bookingsData[i]?.service_data && bookingsData[i].service_data?.length) {
                for (let ia = 0; ia < bookingsData[i].service_data.length; ia++) {
                    let newServiceData = bookingsData[i].service_data[ia]

                    var empId = bookingsData[i].service_data[ia]?.employee_id?.toString() || ""
                    var employee = employees.find((x) => x._id?.toString() == empId)
                    newServiceData.employee_name = employee?.name || ""
                    serviceData.push(newServiceData)
                }
            }

            bookingsData[i].service_data = serviceData
            let empName = bookingsData[i]?.service_data?.map(x => x.employee_name) || []
            let uniqueNames = [...new Set(empName)]
            bookingsData[i].employeeNames = uniqueNames
            bookingsData[i].categories = categoryIds

            if (!bookingsData[i].consultant_service_type || !bookingsData[i].consultant_service_type.length) {
                bookingsData[i].consultant_service_type = serviceTypeData
            }

            var clientOldForm = await ConsultantFormService.getClientConsultantForm(clientId)
            if (clientOldForm && clientOldForm != null) {
                var client = bookingsData[i]?.client_id
                var user_name = clientOldForm?.name || ""
                var user_fname = clientOldForm?.first_name || ""
                var user_lname = clientOldForm?.last_name || ""
                var user_dob = clientOldForm?.dob || ""
                if (!user_dob) {
                    user_dob = client?.dob || ""
                }

                bookingsData[i].consultation_user = {
                    name: user_name,
                    first_name: user_fname,
                    last_name: user_lname,
                    dob: user_dob,
                    residential_address: clientOldForm.residential_address,
                    surgery_name: clientOldForm.surgery_name,
                    doctor_name: clientOldForm.doctor_name
                }
            }

            // bookingsData[i].client_id = client //with name
            bookingsData[i].employee_name = ""

            if (bookingsData[i]?.start_time) {
                var stime = bookingsData[i].start_time
                var stimeToNum = timeToNum(bookingsData[i].start_time)
                stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM'

                var showStartTimeSpilt = stime.split(':')
                var end_hour = showStartTimeSpilt[0]
                end_hour = end_hour > 12 ? end_hour - 12 : end_hour
                showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
                stime = showStartTimeSpilt.join(':')

                bookingsData[i].start_time = stime + " " + stimeToNum
            }
        }

        bookingConsultant[0].data = bookingsData
        bookingConsultant[0].pagination = pagination
        // Return the ConsultantForms list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: bookingConsultant, message: "Booking consultations recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getPreviousConsultantForms = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var booking_id = req.query?.booking_id || ""
        if (!booking_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Booking Id must be present!" })
        }

        var query = {}
        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        query['booking_id'] = { $ne: booking_id }
        var booking = await AppointmentService.getAppointment(booking_id)
        if (booking && booking?.service_id && booking.service_id?.length > 0) {
            var serv_query = { _id: { $in: booking.service_id }, status: 1 }
            var service = await ServiceService.getServiceSpecific(serv_query)

            var cat_arr = service.map(s => s.category_id)
            query['$or'] = [
                { category_id: { $elemMatch: { $in: cat_arr } } },
                { service_id: { $elemMatch: { $in: booking.service_id } } }
            ]

            if (booking.client_id && booking.client_id.length > 0) {
                query['client_id'] = { $elemMatch: { $eq: booking.client_id[0].toString() } };
            }
        }

        //console.log("query ",query)
        var consultant_data = await ConsultantFormService.getActiveConsultantForms(query)
        if (consultant_data.length > 0) {
            for (var i = 0; i < consultant_data.length; i++) {
                if (consultant_data[i].service_id.length > 0) {
                    var con_serv_query = { _id: { $in: consultant_data[i].service_id }, status: 1 }
                    var con_service = await ServiceService.getServiceSpecific(con_serv_query)
                    consultant_data[i].service_id = con_service
                }

                var client_query = { _id: { $in: consultant_data[i].client_id } }
                var client = await CustomerService.getClients(client_query)
                consultant_data[i].client_id = client
                consultant_data[i].employee_name = ''

                if (consultant_data[i].employee_id) {
                    var con_emp_query = { _id: consultant_data[i].employee_id }
                    var con_employee = await UserService.getClients(con_emp_query)
                    consultant_data[i].employee_name = con_employee[0].name
                }

                consultant_data[i].bookingsData = []

                if (consultant_data[i].booking_id) {
                    var category_id = []
                    var service_type_data = []
                    var bookingsData = await AppointmentService.getAppointment(consultant_data[i].booking_id)

                    var serv_query = { _id: { $in: bookingsData.service_id } }
                    var service = await ServiceService.getServiceSpecific(serv_query)
                    for (var s = 0; s < service.length; s++) {
                        var cindex = category_id.indexOf(service[s].category_id)
                        if (cindex == -1) {
                            category_id.push(service[s].category_id)

                            var serv_type_query = { location_id: bookingsData.location_id, customer_id: bookingsData.client_id[0], category_id: service[s].category_id }
                            var serv_type_data = await ConsultantServiceTypeQuestionService.getConsultantServiceTypeQuestionUnique(serv_type_query)
                            if (serv_type_data && serv_type_data._id) {
                                var ctypeindex = service_type_data.indexOf(serv_type_data._id)
                                if (ctypeindex == -1) {
                                    service_type_data.push(serv_type_data._id.toString())
                                }
                            }
                        }
                    }

                    bookingsData.service_id = service
                    bookingsData.categories = category_id

                    if (!bookingsData.consultant_service_type || !bookingsData.consultant_service_type.length) {
                        bookingsData.consultant_service_type = service_type_data
                    }

                    var client_query = { _id: { $in: bookingsData.client_id } }
                    var client = await CustomerService.getClients(client_query)
                    var clientOldForm = await ConsultantFormService.getClientConsultantForm(bookingsData.client_id[0])
                    if (clientOldForm && clientOldForm != null) {
                        if (client && client.length) {
                            client[0].name = clientOldForm.name;
                            client[0].first_name = clientOldForm.first_name;
                            client[0].last_name = clientOldForm.last_name;
                            var uname = clientOldForm.name;
                            var user_fname = clientOldForm.first_name;
                            var user_lname = clientOldForm.last_name;
                            var user_dob = clientOldForm.dob;
                            if (!client[0].dob || client[0].dob == null) {
                                client[0].dob = clientOldForm.dob;
                            }

                            client[0]['residential_address'] = clientOldForm.residential_address;
                            client[0]['surgery_name'] = clientOldForm.surgery_name;
                            client[0]['doctor_name'] = clientOldForm.doctor_name;
                            bookingsData.consultation_user = {
                                name: uname,
                                first_name: user_fname,
                                last_name: user_lname,
                                dob: user_dob,
                                residential_address: clientOldForm.residential_address,
                                surgery_name: clientOldForm.surgery_name,
                                doctor_name: clientOldForm.doctor_name
                            }
                        }
                    }

                    bookingsData.client_id = client //with name
                    bookingsData.employee_name = ''
                    // var emp_query = {_id: bookingsData.employee_id};
                    // var employee = await UserService.getClients(emp_query,0,100);
                    // if(employee.length > 0){
                    //     bookingsData.employee_name = employee[0].name;
                    // }


                    if (bookingsData.start_time) {
                        var stime = bookingsData.start_time
                        var stimeToNum = timeToNum(bookingsData.start_time)
                        stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM'

                        var showStartTimeSpilt = stime.split(':')
                        var end_hour = showStartTimeSpilt[0]
                        end_hour = end_hour > 12 ? end_hour - 12 : end_hour
                        showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour
                        stime = showStartTimeSpilt.join(':')

                        bookingsData.start_time = stime + " " + stimeToNum
                    }

                    consultant_data[i].booking_data = bookingsData;
                }
            }
        }
        // Return the ConsultantForms list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: consultant_data, booking: booking, message: "Successfully ConsultantForms Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getActiveConsultantForms = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var query = {}
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        if (req.query.status == 1) {
            query['status'] = 1
        }

        var ConsultantForms = await ConsultantFormService.getActiveConsultantForms(query)
        // Return the ConsultantForms list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: ConsultantForms, message: "Successfully ConsultantForms Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getConsultantForm = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id
        var ConsultantForm = await ConsultantFormService.getConsultantForm(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: ConsultantForm, message: "Successfully ConsultantForm Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getClientConsultationForm = async function (req, res, next) {
    // console.log("getConsultationForm")
    var client_id = req.query.client_id;
    var category_id = req.query.category_id;
    if (!client_id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var service_type_data = [];
        var booking = {};

        booking.categories = category_id;
        booking.category_id = category_id;
        // console.log("booking ",booking);
        var consultant = await ConsultantFormService.getConsultantFormsSpecific({ client_id: { $elemMatch: { $eq: client_id } }, category_id: category_id });

        var client_query = { _id: client_id };
        var client = await CustomerService.getClients(client_query);
        booking.client_id = client;
        booking.consultation = [];
        if (consultant.length) {
            consultant[0].client_id = client;
            if (client.length) {
                client[0].first_name = consultant.first_name;
                client[0].last_name = consultant.last_name;
                var user_fname = consultant.first_name;
                var user_lname = consultant.last_name;
                var user_dob = consultant.dob;
                if (!client[0].dob || client[0].dob == null) {
                    client[0].dob = consultant.dob;
                }
                client[0]['residential_address'] = consultant.residential_address;
                client[0]['surgery_name'] = consultant.surgery_name;
                client[0]['doctor_name'] = consultant.doctor_name;
                booking.consultation_user = { first_name: user_fname, last_name: user_lname, residential_address: consultant.residential_address, surgery_name: consultant.surgery_name, doctor_name: consultant.doctor_name };
            }

            booking.consultation = consultant;
        }


        // booking.client_id = client; //with name
        return res.status(200).json({ status: 200, flag: true, consultant: consultant, data: booking, message: "Successfully ConsultantForm Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getConsultationForm = async function (req, res, next) {
    try {
        var booking_id = req.query?.booking_id || ""
        if (!booking_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Booking Id must be present!" })
        }

        var category_id = []
        var service_type_data = []
        var booking = await AppointmentService.getAppointment(booking_id)
        if (booking && booking._id) {
            var consultant = await ConsultantFormService.getConsultantFormsSpecific({ booking_id: booking._id })
            if (consultant && consultant.length) {
                var con_serv_query = { _id: { $in: consultant[0].service_id }, status: 1 }
                var con_service = await ServiceService.getServiceSpecific(con_serv_query)
                consultant[0].service_id = con_service

                var client_query = { _id: { $in: consultant[0].client_id } }
                var client = await CustomerService.getClients(client_query)
                consultant[0].client_id = client
                consultant[0].employee_name = ''
                if (consultant[0].employee_id) {
                    var con_emp_query = { _id: consultant[0].employee_id }
                    var con_employee = await UserService.getClients(con_emp_query)
                    consultant[0].employee_name = con_employee[0].name
                }

                booking.consultation = consultant
            }

            var serv_query = { _id: { $in: booking.service_id } }
            var service = await ServiceService.getServiceSpecific(serv_query)
            for (var s = 0; s < service.length; s++) {
                var cindex = category_id.indexOf(service[s].category_id)
                if (cindex == -1) {
                    category_id.push(service[s].category_id)

                    var serv_type_query = { location_id: booking.location_id, customer_id: booking.client_id[0], category_id: service[s].category_id }
                    var serv_type_data = await ConsultantServiceTypeQuestionService.getConsultantServiceTypeQuestionUnique(serv_type_query)
                    if (serv_type_data && serv_type_data._id) {
                        var ctypeindex = service_type_data.indexOf(serv_type_data._id)
                        if (ctypeindex == -1) {
                            service_type_data.push(serv_type_data._id.toString())
                        }
                    }
                }
            }

            booking.categories = category_id
            booking.service_id = service
            if (!booking.consultant_service_type || !booking.consultant_service_type.length) {
                booking.consultant_service_type = service_type_data
            }

            var client_query = { _id: { $in: booking.client_id } }
            var client = await CustomerService.getClients(client_query)
            var clientOldForm = await ConsultantFormService.getClientConsultantForm(booking.client_id[0])
            if (clientOldForm && clientOldForm != null) {
                if (client && client.length) {
                    client[0].first_name = clientOldForm.first_name
                    client[0].last_name = clientOldForm.last_name
                    var user_fname = clientOldForm.first_name
                    var user_lname = clientOldForm.last_name
                    var user_dob = clientOldForm.dob
                    if (!client[0].dob || client[0].dob == null) {
                        client[0].dob = clientOldForm.dob
                    }

                    client[0]['residential_address'] = clientOldForm.residential_address
                    client[0]['surgery_name'] = clientOldForm.surgery_name
                    client[0]['doctor_name'] = clientOldForm.doctor_name
                    booking.consultation_user = { first_name: user_fname, last_name: user_lname, residential_address: clientOldForm.residential_address, surgery_name: clientOldForm.surgery_name, doctor_name: clientOldForm.doctor_name }
                }
            }

            booking.client_id = client //with name
            booking.employee_name = ""

            // var emp_query = {_id: booking.employee_id};
            // var employee = await UserService.getClients(emp_query,0,100);
            // booking.employee_name = employee[0].name;
        }

        return res.status(200).json({ status: 200, flag: true, data: booking, message: "Successfully ConsultantForm Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getBookedConsultantForm = async function (req, res, next) {
    try {
        var booking_id = req.query?.booking_id || ""
        if (!booking_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Booking Id must be present!" })
        }

        var booking = await AppointmentService.getAppointmentOne({ _id: booking_id }) || null
        if (booking && booking._id) {
            var clientId = ""
            if (booking?.client_id && booking?.client_id?.length) {
                clientId = booking?.client_id[0]?._id ? booking?.client_id[0]?._id : booking?.client_id[0] || ""
            }

            var consultants = await ConsultantFormService.getConsultantFormsOne({ booking_id: booking._id }, "createdAt") || []

            booking.consultation = consultants?.length ? consultants : null

            var clientOldForm = await ConsultantFormService.getClientConsultantForm(clientId)
            if (clientOldForm && clientOldForm != null) {
                var client = await CustomerService.getClients({ _id: { $in: clientId } })
                if (client && client.length) {
                    var user_name = clientOldForm?.name || ""
                    var user_fname = clientOldForm?.first_name || ""
                    var user_lname = clientOldForm?.last_name || ""
                    var user_dob = clientOldForm?.dob || ""
                    var user_age = clientOldForm?.age || 0
                    var user_mobile = clientOldForm?.mobile || ""
                    if (!user_dob) { user_dob = client[0]?.dob || "" }
                    if (!user_age) { user_age = client[0]?.age || 0 }
                    if (!user_mobile) { user_mobile = client[0]?.mobile || 0 }

                    booking.consultation_user = { name: user_name, first_name: user_fname, last_name: user_lname, mobile: user_mobile, dob: user_dob, age: user_age, residential_address: clientOldForm.residential_address, surgery_name: clientOldForm.surgery_name, doctor_name: clientOldForm.doctor_name }
                }
            }
        }

        booking.employee_name = ""

        return res.status(200).json({ status: 200, flag: true, data: booking, message: "ConsultantForm recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// get client last consultant form
exports.getClientConsultantForm = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var client_id = req.params.client_id;
    try {
        var ConsultantForm = await ConsultantFormService.getClientConsultantForm(client_id);
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: ConsultantForm, message: "Successfully ConsultantForm Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.checkClientBookingConsultationForm = async function (req, res, next) {
    // console.log("getConsultationForm")
    var booking_id = req.query.booking_id;
    if (!booking_id) {
        return res.status(200).json({ status: 200, flag: false, message: "Booking Id must be present!" })
    }

    try {
        var category_id = [];
        var service_type_data = [];
        var booking = await AppointmentService.getAppointment(booking_id);

        var serv_query = { _id: { $in: booking.service_id } };
        var service = await ServiceService.getServiceSpecific(serv_query);

        var cat_arr = service.map(s => s.category_id);
        cat_arr = Array.from(new Set(cat_arr))

        var consultant = await ConsultantFormService.getConsultantFormsSpecific({ booking_id: booking_id });
        if (consultant.length == 0) {

            var con_query = { client_id: booking.client_id[0], status: { $ne: 0 } };
            con_query['$or'] = [
                { $and: [{ service_id: { $all: booking.service_id } }] },
                { $and: [{ category_id: { $all: cat_arr } }] }
            ];

            consultant = await ConsultantFormService.getConsultantFormsSpecific(con_query);
            if (consultant.length == 0) {

                con_query['$or'] = [{ category_id: { $elemMatch: { $in: cat_arr } } },
                { service_id: { $elemMatch: { $in: booking.service_id } } }
                ];

                consultant = await ConsultantFormService.getConsultantFormsSpecific(con_query);
            }
        }

        if (consultant.length) {

            var con_serv_query = { _id: { $in: consultant[0].service_id } };
            var con_service = await ServiceService.getServiceSpecific(con_serv_query);
            consultant[0].service_id = con_service;

            var client_query = { _id: { $in: consultant[0].client_id } };
            var client = await CustomerService.getClients(client_query);
            consultant[0].client_id = client;
            consultant[0].service_id = booking.service_id;
            consultant[0].category_id = cat_arr;
            consultant[0].employee_name = '';
            if (consultant[0].employee_id) {
                var con_emp_query = { _id: consultant[0].employee_id };
                var con_employee = await UserService.getClients(con_emp_query, 0, 100);
                consultant[0].employee_name = con_employee[0].name;
            }

            booking.consultation = consultant;
        }

        for (var s = 0; s < service.length; s++) {
            var cindex = category_id.indexOf(service[s].category_id);
            if (cindex == -1) {
                category_id.push(service[s].category_id);

                var serv_type_query = { location_id: booking.location_id, customer_id: booking.client_id[0], category_id: service[s].category_id };
                // console.log("serv_type_query s ",s," ",serv_type_query);
                var serv_type_data = await ConsultantServiceTypeQuestionService.getConsultantServiceTypeQuestionUnique(serv_type_query);
                if (serv_type_data && serv_type_data._id) {
                    var ctypeindex = service_type_data.indexOf(serv_type_data._id);

                    if (ctypeindex == -1) {
                        service_type_data.push(serv_type_data._id.toString());
                    }
                }
            }
        }

        booking.categories = category_id;
        booking.service_id = service;

        if (!booking.consultant_service_type || !booking.consultant_service_type.length) {
            booking.consultant_service_type = service_type_data;
        }

        var client_query = { _id: { $in: booking.client_id } };
        var client = await CustomerService.getClients(client_query);
        var clientOldForm = await ConsultantFormService.getClientConsultantForm(booking.client_id[0]);
        if (clientOldForm && clientOldForm != null) {
            if (client.length) {
                client[0].first_name = clientOldForm.first_name;
                client[0].last_name = clientOldForm.last_name;
                var user_fname = clientOldForm.first_name;
                var user_lname = clientOldForm.last_name;
                var user_dob = clientOldForm.dob;
                if (!client[0].dob || client[0].dob == null) {
                    client[0].dob = clientOldForm.dob;
                }
                client[0]['residential_address'] = clientOldForm.residential_address;
                client[0]['surgery_name'] = clientOldForm.surgery_name;
                client[0]['doctor_name'] = clientOldForm.doctor_name;
                booking.consultation_user = { first_name: user_fname, last_name: user_lname, residential_address: clientOldForm.residential_address, surgery_name: clientOldForm.surgery_name, doctor_name: clientOldForm.doctor_name, customer_signature: clientOldForm?.customer_signature };
            }
        }
        booking.client_id = client; //with name
        booking.employee_name = '';

        // var emp_query = {_id: booking.employee_id};
        // var employee = await UserService.getClients(emp_query,0,100);
        // booking.employee_name = employee[0].name;
        return res.status(200).json({ status: 200, flag: true, consultant: consultant, data: booking, message: "Successfully ConsultantForm Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getSpecificConsultantForms = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    // console.log("req Categories ",req.query)
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = {};

    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.client_id && req.query.client_id != 'undefined') {
        query['client_id'] = { $elemMatch: { $eq: req.query.client_id.toString() } };
    }
    if (req.query.status && req.query.status != 'undefined') {
        query['status'] = parseInt(req.query.status);
    }

    // console.log('getConsultantFormsbyLocation ',query)
    try {
        var ConsultantForms = await ConsultantFormService.getConsultantFormsSpecific(query, page, limit)
        // console.log("ConsultantForms ",ConsultantForms)
        // Return the Categories list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: ConsultantForms, message: "Successfully Categories Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// get client according to question id
exports.getConsultantClientQuestion = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};

    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.client_id && req.query.client_id != 'undefined') {
        query['client_id'] = { $elemMatch: { $eq: req.query.client_id.toString() } };
    }
    if (req.query.qdefault && req.query.qdefault != 'undefined') {
        query['default'] = { $elemMatch: { q_id: { $eq: req.query.qdefault.toString() } } };
    }
    if (req.query.qbefore && req.query.qbefore != 'undefined') {
        if (req.query.qbefore && (req.query.bstype && req.query.bstype != 'undefined')) {
            query['before'] = { $elemMatch: { q_id: { $eq: req.query.qbefore.toString() }, category_id: { $eq: req.query.bstype.toString() } } };
        } else {
            query['before'] = { $elemMatch: { q_id: { $eq: req.query.qbefore.toString() } } };
        }
    }
    if (req.query.qafter && req.query.qafter != 'undefined') {
        query['after'] = { $elemMatch: { q_id: { $eq: req.query.qafter.toString() } } };
    }
    if (req.query.status && req.query.status != 'undefined') {
        query['status'] = parseInt(req.query.status);
    }

    //console.log('getConsultantClientQuestion ',query)
    try {
        var flag = false;
        var consultantForms = await ConsultantFormService.getConsultantFormQuestion(query);

        if (consultantForms && consultantForms._id) {
            // console.log("getConsultantClientQuestion ",consultantForms._id)
            flag = true;
        } else {
            flag = false;
        }
        return res.status(200).json({ status: 200, flag: flag, data: consultantForms, message: "Successfully ConsultantForm Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createConsultantForm = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        if (req.body.booking_id) {
            var booking = await AppointmentService.getAppointment(req.body.booking_id)
            if (booking.client_id) {
                req.body.client_id = booking.client_id
            }

            if (booking.service_id) {
                req.body.service_id = booking.service_id
            }
        }

        if (req.body.service_id && req.body.service_id.length > 0) {
            var serv_query = { _id: { $in: req.body.service_id } }
            var service = await ServiceService.getServiceSpecific(serv_query)
            var cat_arr = service.map(s => s.category_id);
            if (cat_arr && cat_arr.length > 0) {
                req.body.category_id = cat_arr
            }
        }
        var booking_consultant = await ConsultantFormService.getConsultantFormsSpecific({ booking_id: req.body.booking_id })
        if (booking_consultant && booking_consultant._id) {
            req.body._id = booking_consultant._id;
            var createdConsultantForm = await ConsultantFormService.updateConsultantForm(req.body)
        } else {
            var createdConsultantForm = await ConsultantFormService.createConsultantForm(req.body)
        }

        if (req.body.booking_id) {
            var app_data = await AppointmentService.getAppointment(req.body.booking_id);
            var date = dateFormat(app_data.date, "yyyy-mm-dd");
            var params = { location_id: req.body.location_id, employee_id: '', date: date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: 'consultation' };
            var refData = updateAppListTableData(params);
        }

        if (req.body.client_id && req.body.client_id.length > 0) {
            var data = {
                _id: req.body.client_id[0],
                name: req.body.name,
                mobile: req.body.mobile,
                email: req.body.email,
                dob: req.body.dob,
                age: req.body.age,
                is_international_number: req.body.is_international_number
            }
            await CustomerService.updateCustomer(data)
        }

        var consultant_service_type = []
        if (req.body.category_id && req.body.category_id.length && req.body.type != "customer") {
            for (var i = 0; i < req.body.category_id.length; i++) {
                var serv_type = await ConsultantServiceTypeQuestionService.createConsultantServiceTypeQuestion({ location_id: req.body.location_id, customer_id: req.body.client_id[0], category_id: req.body.category_id[i] });
                if (serv_type && serv_type._id) {
                    consultant_service_type.push(serv_type._id.toString());
                }
            }

            await AppointmentService.updateBookingConsultation({ _id: req.body.booking_id, consultant_service_type: consultant_service_type })
        }

        return res.status(200).json({ status: 200, flag: true, data: createdConsultantForm, message: "Successfully Created ConsultantForm" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateConsultantForm = async function (req, res, next) {
    // console.log("updateConsultantForm ",req.body);
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var email_flag = false
        var drive_flag = false

        if (req.body.booking_id) {
            var booking = await AppointmentService.getAppointment(req.body.booking_id)
            if (booking.client_id) {
                req.body.client_id = booking.client_id
            }

            if (booking.service_id) {
                req.body.service_id = booking.service_id
            }
        }

        var updatedConsultantForm = await ConsultantFormService.updateConsultantForm(req.body)

        if (req.body.client_id) {
            var data = {
                _id: req.body.client_id[0],
                name: req.body.name,
                mobile: req.body.mobile,
                email: req.body.email,
                dob: req.body.dob,
                age: req.body.age,
                is_international_number: req.body.is_international_number
            }

            var updatedUser = await CustomerService.updateCustomer(data)
        }

        if (updatedConsultantForm.booking_id) {
            var app_data = await AppointmentService.getAppointment(updatedConsultantForm.booking_id);
            var date = dateFormat(app_data.date, "yyyy-mm-dd");
            var params = { location_id: req.body.location_id, employee_id: '', date: date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: 'consultation' };
            var refData = updateAppListTableData(params);
        }

        var location = await LocationService.getLocation(updatedConsultantForm.location_id)

        if (req.body && req.body?.new_image) {
            email_flag = true
            // drive_flag = true;
        }

        if (email_flag) {
            var html = ""
            var temFile = "consultant_before_after_image.hjs"
            var to = location.email
            var name = ""
            var subject = "Consultation image"
            var toMail = {}
            toMail['site_url'] = process.env?.API_URL || ""
            toMail['link_url'] = process.env?.SITE_URL || ""
            var file_name_arr = []
            toMail['branch_name'] = location.name
            toMail['booking_id'] = updatedConsultantForm?.booking_id || ""

            if (req.body?.before_image && updatedConsultantForm?.before_image?.length > 0) {
                for (var i = 0; i < updatedConsultantForm.before_image.length; i++) {
                    var file = updatedConsultantForm.before_image[i].split('.')
                    var filelen = file.length
                    if (filelen) {
                        var file_name = "BeforeImage." + file[filelen - 1]
                        var obj = {
                            filename: file_name,
                            path: path + '/public/' + updatedConsultantForm.before_image[i],
                            cid: 'uniq-' + file_name
                        }

                        file_name_arr.push(obj)
                    }
                }
            }

            if (req.body?.after_image && req.body?.after_image?.length > 0) {
                for (var i = 0; i < updatedConsultantForm.after_image.length; i++) {
                    var file = updatedConsultantForm.after_image[i].split('.')
                    var filelen = file.length
                    if (filelen) {
                        var file_name = "AfterImage." + file[filelen - 1]
                        var obj = {
                            filename: file_name,
                            path: path + '/public/' + updatedConsultantForm.after_image[i],
                            cid: 'uniq-' + file_name
                        }

                        file_name_arr.push(obj)
                    }
                }
            }

            var createdMail = await SendEmailSmsService.sendMultipleSmsLogMail(to, name, subject, temFile, html, toMail, file_name_arr, location._id, location.company_id)
        }

        if (drive_flag) {
            var driveData = { booking_id: updatedConsultantForm.booking_id, images: [] }
            if (updatedConsultantForm.before_image && updatedConsultantForm.after_image) {
                var file1 = updatedConsultantForm.before_image.split('.')
                var file2 = updatedConsultantForm.after_image.split('.')
                var filelen1 = file1?.length || 0
                var filelen2 = file2?.length || 0
                if (filelen1) {
                    var file_name1 = "BeforeImage-" + updatedConsultantForm.booking_id + "-1." + file1[filelen1 - 1]
                    var image1 = path + '/public/' + updatedConsultantForm.before_image
                    var temp1 = { image_name: file_name1, image: image1 }
                    driveData.images.push(temp1)
                }

                if (filelen2) {
                    var file_name2 = "AfterImage-" + updatedConsultantForm.booking_id + "-2." + file2[filelen2 - 1]
                    var image2 = path + '/public/' + updatedConsultantForm.after_image
                    var temp2 = { image_name: file_name2, image: image2 }
                    driveData.images.push(temp2)
                }

                // var createDrive = await SendEmailSmsService.uploadImageToDrive(driveData);
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: updatedConsultantForm, message: "Successfully Updated ConsultantForm" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeConsultantForm = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var conData = await ConsultantFormService.getConsultantForm(id)

        var deleted = await ConsultantFormService.deleteConsultantForm(id);

        if (conData && conData.booking_id) {
            var app_data = await AppointmentService.getAppointment(conData.booking_id);
            var date = dateFormat(app_data.date, "yyyy-mm-dd");
            var params = { location_id: conData.location_id, employee_id: '', date: date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: 'consultation' };
            var refData = await updateAppListTableData(params);
        }

        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.sendConsultantFormPdf = async function (req, res, next) {
    // console.log("sendConsultantFormPdf ",req.body.pdf_data);
    try {
        var pdf_name = "";
        // if(req.body.pdf_data) {        
        //     var isImage = await ImageService.savePDF(req.body.pdf_data,"/images/consultation/pdf/").then( data => {
        //         return data;
        //     });

        //     if (typeof(isImage) != 'undefined' && isImage != null && isImage != "")
        //     {
        //         pdf_name = isImage;
        //     }
        // }

        // let PDF = new jsPDF('p', 'mm', 'a4');
        // PDF.addImage(FILEURI, 'PNG', 0, req.body.position, req.body.file_width, req.body.file_height)
        // // console.log("PDF ",PDF)
        // var file_name = path+"/public/images/consultation/"+'consultation_form_'+ new  Date().getTime() + '.pdf';
        // PDF.save(file_name);
        //console.log("pdf_name ",pdf_name)
        res.status(200).send({ status: 200, flag: true, data: req.body, message: "Successfully pdf sent to email... " });
    } catch (e) {
        console.log("Error ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

const timeToNum = function (time) {
    //console.log('timeToNum time',time)
    var matches = time.match(/(\d\d):(\d\d)/);
    //console.log('matches',matches)
    return parseInt(60 * matches[1]) + parseInt(matches[2]);
} //ex: 10:00 = 60*10+05 = 605
