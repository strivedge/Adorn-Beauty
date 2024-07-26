// Gettign the Newly created Mongoose Model we just created 
var Appointment = require('../models/Appointment.model')
var CustomerPackage = require('../models/CustomerPackage.model')
var Discount = require('../models/Discount.model')
var DiscountSlab = require('../models/DiscountSlab.model')
var Package = require('../models/Package.model')
var Service = require('../models/Service.model')
var User = require('../models/User.model')
var Customer = require('../models/Customer.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Appointment List
exports.getAppointments = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var Appointments = await Appointment.paginate(query, options)

        // Return the Appointmentd list that was retured by the mongoose promise
        return Appointments
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.getAppointmentsOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var appointments = await Appointment.find(query)
            .populate({
                path: 'client_id',
                model: Customer,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })
            .populate({
                path: 'service_id',
                model: Service,
                select: {
                    _id: 1,
                    category_id: 1,
                    name: 1,
                    duration: 1,
                    gender: 1,
                    reminder: 1,
                    online_status: 1,
                    price: 1,
                    special_price: 1,
                    commission: 1,
                    tax: 1,
                    service_limit: 1,
                    status: 1
                }
            })
            .populate({
                path: 'employee_id',
                model: User,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    gender: 1,
                    photo: 1,
                    user_order: 1
                }
            })
            .populate({
                path: 'discount_id',
                model: Discount
            })
            .populate({
                path: 'discount_slab_id',
                model: DiscountSlab
            })
            .populate({
                path: 'customer_package_id',
                model: CustomerPackage,
                populate: {
                    path: 'package_id',
                    model: Package
                }
            })
            .populate({
                path: 'package_id',
                model: Package
            })
            .populate({
                path: 'package_service',
                model: Service,
                select: {
                    _id: 1,
                    category_id: 1,
                    name: 1,
                    duration: 1,
                    gender: 1,
                    reminder: 1,
                    online_status: 1,
                    price: 1,
                    special_price: 1,
                    commission: 1,
                    tax: 1,
                    service_limit: 1,
                    status: 1
                }
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return appointments || []
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting appointments')
    }
}

exports.getAggregateAppointments = async function (query = {}) {
    try {
        // var appointments = await Appointment.find(query)
        var appointments = await Appointment.aggregate([
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    },
                    createdAt: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    createdDate: '$createdAt'
                }
            },
            { $match: query }
        ]) || []

        // ** Client
        appointments = await Appointment.populate(appointments, {
            path: "client_id",
            model: Customer,
            select: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                name: 1,
                email: 1,
                mobile: 1,
                gender: 1,
                photo: 1,
                customer_heart: 1,
                customer_icon: 1,
                customer_badge: 1
            }
        })

        // ** Service
        appointments = await Appointment.populate(appointments, {
            path: 'service_id',
            model: Service,
            select: {
                _id: 1,
                category_id: 1,
                name: 1,
                duration: 1,
                gender: 1,
                reminder: 1,
                online_status: 1,
                price: 1,
                special_price: 1,
                commission: 1,
                tax: 1,
                service_limit: 1,
                status: 1
            }
        })

        // ** Employee
        appointments = await Appointment.populate(appointments, {
            path: 'employee_id',
            model: User,
            select: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                name: 1,
                email: 1,
                gender: 1,
                photo: 1,
                user_order: 1
            }
        })

        // ** Discount
        appointments = await Appointment.populate(appointments, {
            path: 'discount_id',
            model: Discount
        })

        // ** DiscountSlab
        appointments = await Appointment.populate(appointments, {
            path: 'discount_slab_id',
            model: DiscountSlab
        })

        // ** CustomerPackage
        appointments = await Appointment.populate(appointments, {
            path: 'customer_package_id',
            model: CustomerPackage,
            populate: {
                path: 'package_id',
                model: Package
            }
        })

        // ** Package
        appointments = await Appointment.populate(appointments, {
            path: 'package_id',
            model: Package
        })

        // ** Package Service
        appointments = await Appointment.populate(appointments, {
            path: 'package_service',
            model: Service,
            select: {
                _id: 1,
                category_id: 1,
                name: 1,
                duration: 1,
                gender: 1,
                reminder: 1,
                online_status: 1,
                price: 1,
                special_price: 1,
                commission: 1,
                tax: 1,
                service_limit: 1,
                status: 1
            }
        })

        return appointments || []
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting appointments')
    }
}

exports.getAppointmentsCount = async function (query) {
    try {
        var appointments = await Appointment.find(query).count()

        return appointments
    } catch (e) {
        throw Error('Error while Counting Appointments')
    }
}

exports.getAppointmentOne = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await Appointment.findOne(query)
            .populate({
                path: 'client_id',
                model: Customer,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    dob: 1,
                    age: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })
            .populate({
                path: 'service_id',
                model: Service,
                select: {
                    _id: 1,
                    category_id: 1,
                    name: 1,
                    duration: 1,
                    gender: 1,
                    reminder: 1,
                    online_status: 1,
                    price: 1,
                    special_price: 1,
                    commission: 1,
                    tax: 1,
                    service_limit: 1,
                    status: 1
                }
            })
            // .populate({
            //     path: 'employee_id',
            //     model: User,
            //     select: {
            //         _id: 1,
            //         first_name: 1,
            //         last_name: 1,
            //         name: 1,
            //         email: 1,
            //         gender: 1,
            //         photo: 1,
            //         user_order: 1
            //     }
            // })
            .populate({
                path: 'discount_id',
                model: Discount
            })
            // .populate({
            //     path: 'discount_slab_id',
            //     model: DiscountSlab
            // })
            .populate({
                path: 'customer_package_id',
                model: CustomerPackage,
                // populate: {
                //     path: 'package_id',
                //     model: Package
                // }
            })
            // .populate({
            //     path: 'package_id',
            //     model: Package
            // })
            .populate({
                path: 'package_service',
                model: Service,
                select: {
                    _id: 1,
                    category_id: 1,
                    name: 1,
                    duration: 1,
                    gender: 1,
                    reminder: 1,
                    online_status: 1,
                    price: 1,
                    special_price: 1,
                    commission: 1,
                    tax: 1,
                    service_limit: 1,
                    status: 1
                }
            })
            .populate({
                path: "gift_card_transaction_id",
                populate: {
                    path: "customer_gift_card_id"
                }
            })
            .populate({ path: "removed_gift_card_transaction_id" })

        return _details || null;
    } catch (error) {
        console.log("getAppointmentOne catch >>> ", error);
        // return a Error message describing the reason
        return null;
    }
}

exports.getAppointmentOneDetail = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await Appointment.findOne(query)
            .populate({
                path: 'client_id',
                model: Customer,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    dob: 1,
                    age: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })
            .populate({
                path: 'service_id',
                model: Service,
                select: {
                    _id: 1,
                    category_id: 1,
                    name: 1,
                    duration: 1,
                    gender: 1,
                    reminder: 1,
                    online_status: 1,
                    price: 1,
                    special_price: 1,
                    commission: 1,
                    tax: 1,
                    service_limit: 1,
                    status: 1
                }
            })
            .populate({
                path: 'discount_id',
                model: Discount
            })
            .populate({
                path: 'discount_slab_id',
                model: DiscountSlab
            })
            .populate({
                path: 'customer_package_id',
                model: CustomerPackage,
                populate: {
                    path: 'package_id',
                    model: Package
                }
            })
            .populate({
                path: 'package_service',
                model: Service,
                select: {
                    _id: 1,
                    category_id: 1,
                    name: 1,
                    duration: 1,
                    gender: 1,
                    reminder: 1,
                    online_status: 1,
                    price: 1,
                    special_price: 1,
                    commission: 1,
                    tax: 1,
                    service_limit: 1,
                    status: 1
                }
            })
            .populate({
                path: "gift_card_transaction_id",
                populate: {
                    path: "customer_gift_card_id"
                }
            })
            .populate({ path: "removed_gift_card_transaction_id" })

        return _details || null;
    } catch (error) {
        console.log("getAppointmentOneDetail catch >>> ", error);
        // return a Error message describing the reason
        return null;
    }
}

// this is only for consultant form filling
// Async function to get the ConsultantForm List
exports.getBookings = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {}
        sort[order_name] = order

        const facetedPipeline = [
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
            { $match: query },
            { $sort: sort },
            {
                "$facet": {
                    "data": [
                        { "$skip": page },
                        { "$limit": limit }
                    ],
                    "pagination": [
                        { "$count": "total" }
                    ]
                }
            }
        ]

        var appointments = await Appointment.aggregate(facetedPipeline)

        // Return the ConsultantFormd list that was retured by the mongoose promise
        return appointments
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.getAggregateBookings = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {}
        sort[order_name] = order

        const facetedPipeline = [
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
            { $match: query },
            { $sort: sort },
            {
                "$facet": {
                    "data": [
                        { "$skip": page },
                        { "$limit": limit }
                    ],
                    "pagination": [
                        { "$count": "total" }
                    ]
                }
            }
        ]

        var appointments = await Appointment.aggregate(facetedPipeline) || []

        if (appointments?.length && appointments[0]?.data?.length) {
            var appointmentsData = appointments[0].data

            // ** Client
            appointmentsData = await Appointment.populate(appointmentsData, {
                path: "client_id",
                model: Customer,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    dob: 1,
                    age: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })

            // ** Service
            appointmentsData = await Appointment.populate(appointmentsData, {
                path: 'service_id',
                model: Service,
                select: {
                    _id: 1,
                    category_id: 1,
                    name: 1,
                    duration: 1,
                    gender: 1,
                    reminder: 1,
                    online_status: 1,
                    price: 1,
                    special_price: 1,
                    commission: 1,
                    tax: 1,
                    service_limit: 1,
                    status: 1
                }
            })

            appointments[0].data = appointmentsData
        }

        // Return the ConsultantFormd list that was retured by the mongoose promise
        return appointments
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.getAllAppointment = async function (query, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {}
        sort[order_name] = order

        var Appointments = await Appointment.aggregate([
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
            { $match: query },
            { "$sort": sort }
        ])

        // Return the Serviced list that was retured by the mongoose promise
        return Appointments
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.getAppointmentDateSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var users = await User.find(query).select({_id:1,name:1,first_name:1,last_name:1});
        var appointments = await Appointment.aggregate([
            {
                $addFields: {
                    onlyDate: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
            {
                "$project": {
                    "onlyDate": 1,
                    "_id": 1,
                    "employee_id": 1,
                    "client_id": 1,
                    "category_id": 1,
                    "service_id": 1,
                    "service_data": 1,
                    "location_id": 1,
                    "date": 1,
                    "start_time": 1,
                    "end_time": 1,
                    "comments": 1,
                    "employee_comments": 1,
                    "payment_type": 1,
                    "payment_status": 1,
                    "status": 1,
                    "booking_status": 1,
                    "extended_time": 1,
                    "group_data": [],
                    "is_readed": 1,
                    "discount_id": 1,
                    "discount_code": 1,
                    "offer_discount_code": 1,
                    "total_price": 1,
                    "discounted_price": 1,
                    "price": 1,
                    "paid_amount": 1,
                    "remaining_amount": 1,
                    "total_amount": 1,
                    "grand_total": 1,
                    "transaction_id": 1,
                    "transaction": 1,
                    "app_datetime": 1,
                    "grand_total_price": 1,
                    "grand_discounted_price": 1,
                    "grand_final_price": 1,
                    "consultation": 1,
                    "front_booking": 1,
                    "employee_name": 1,
                    "discount_slab_id": 1,
                    "customer_package_id": 1,
                    "package_id": 1,
                    "package_service": 1,
                    "start_time_meridiem": 1,
                    "end_time_meridiem": 1,
                    "patch_test_booking": 1,
                    "stop_email_sms": 1,
                    "discount_code_type": 1,
                    "loyalty_card_data": 1,
                    "consultant_status": 1,
                    "consultantform_id": 1,
                    "group_booking_ids": 1,
                    "reschedule_count": 1,
                    "is_reschedule_readed": 1,
                    "day": { "$dayOfWeek": "$date" },
                    //"date":{"$date":"$date"},
                    "customer_icon": 1
                }
            },
            //{ "$match":{ "m": 8, "d": 28 } },
            { $match: query }
        ])

        return appointments
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.getAppointmentSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        // var Appointments = await Appointment.find(query);
        var appointments = await Appointment.aggregate([
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    },
                    createdAt: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    createdAt: '$createdAt'
                }
            },
            { $match: query },
            { "$sort": { "date": 1, "start_time": 1 } }
        ])

        // Return the Serviced list that was retured by the mongoose promise
        return appointments
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.getSelectedAppointmentSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var Appointments = await Appointment.find(query);
        var Appointments = await Appointment.aggregate([{
            $addFields: {
                date: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$date'
                    }
                }
            }
        },
        { $match: query },
        {
            "$project": {
                "_id": 1,
                "client_id": 1,
                "date": 1,
                "service_id": 1,
            }
        },
        { "$sort": { "date": 1 } } // 1 or -1 to specify an ascending or descending 
        ])

        // Return the Serviced list that was retured by the mongoose promise
        return Appointments
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.getLastAppointment = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var Appointments = await Appointment.find(query);
        var Appointments = await Appointment.findOne(query).select('location_id').sort({ date: -1 });
        // Return the Serviced list that was retured by the mongoose promise
        return Appointments
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.getAppointmentDatedSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var Appointments = await Appointment.find(query);
        var Appointments = await Appointment.find(query).select('date');
        // Return the Serviced list that was retured by the mongoose promise
        return Appointments
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.getAppointmentWithServices = async function (query, page = 0, limit = 10) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var Appointments = await Appointment.find(query);
        var Appointments = await Appointment.aggregate([
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
            { $match: query },
            { $sort: { date: -1 } },
            { $limit: limit }
        ]);

        // ** Service
        Appointments = await Appointment.populate(Appointments, {
            path: 'service_id',
            model: Service,
            select: {
                _id: 1,
                category_id: 1,
                name: 1,
                duration: 1,
                gender: 1,
                reminder: 1,
                online_status: 1,
                price: 1,
                special_price: 1,
                commission: 1,
                tax: 1,
                service_limit: 1,
                status: 1
            }
        })

        // Return the Serviced list that was retured by the mongoose promise
        return Appointments;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.getNotShowAppointment = async function (query, page = 0, limit = 10) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var Appointments = await Appointment.find(query);
        var Appointments = await Appointment.aggregate([
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
            { $match: query },
            { $sort: { date: -1 } },
            { $limit: limit }
        ]);
        // Return the Serviced list that was retured by the mongoose promise
        return Appointments;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.updateManyAppointmentStatus = async function (query) {
    try {
        // Find the Data and replace booking status
        var Appointments = await Appointment.updateMany(query, { $set: { booking_status: "complete" } })

        return Appointments;

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Appointment not available");
    }
}

exports.updateManyBookingStatus = async function (query, booking_status) {
    try {
        // Find the Data and replace booking status
        var Appointments = await Appointment.updateMany(query, { $set: { booking_status: booking_status } })

        return Appointments;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Appointment not available");
    }
}

exports.updateManyAppointmentClient = async function (query, client_id) {
    try {
        // Find the Data and replace booking status
        var Appointments = await Appointment.updateMany(query, { $set: { client_id: client_id } })

        return Appointments;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Appointment not available");
    }
}

exports.getAppointment = async function (id) {
    try {
        // Find the Data 
        var _details = await Appointment.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        //throw Error("Appointment not available")
        return false
    }
}

exports.getAppointmentWithClientDetail = async function (query) {
    try {
        var appointment = await Appointment.find(query).populate({
            path: 'client_id',
            model: Customer,
            select: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                name: 1,
                email: 1,
                mobile: 1,
                gender: 1,
                dob: 1,
                age: 1,
                photo: 1,
                customer_heart: 1,
                customer_icon: 1,
                customer_badge: 1
            }
        })

        // Return the Appointment list that was retured by the mongoose promise
        return appointment
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while finding Appointment');
    }
}

exports.getAppointmentData = async function (query, page = 0, limit = 10) {
    // Try Catch the awaited promise to handle the error 
    try {
        var appointment = await Appointment.find(query).sort({ "_id": -1 }).map(function (item) { return item._id; })

        // Return the Appointment list that was retured by the mongoose promise
        return appointment
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while finding Appointment');
    }
}

exports.getAppointmentNotificationsUnreaded = async function (query = {}) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Appointments = await Appointment.find(query).sort({ "_id": -1 })

        // Return the Appointmentd list that was retured by the mongoose promise
        return Appointments
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.getAppointmentNotificationsReaded = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Appointments = await Appointment.find(query).sort({ "_id": -1 })

        // Return the Appointmentd list that was retured by the mongoose promise
        return Appointments
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Appointments')
    }
}

exports.createAppointment = async function (appointment) {
    var newAppointment = new Appointment({
        user_id: appointment?.user_id ? appointment?.user_id : null,
        employee_id: appointment?.employee_id ? appointment?.employee_id : null,
        client_id: appointment?.client_id?.length ? appointment?.client_id : null,
        //category_id: appointment?.category_id ? appointment?.category_id : null,
        service_id: appointment?.service_id?.length ? appointment?.service_id : null,
        company_id: appointment?.company_id ? appointment?.company_id : null,
        location_id: appointment?.location_id ? appointment?.location_id : null,
        date: appointment?.date ? appointment?.date : null,
        start_time: appointment?.start_time ? appointment?.start_time : "",
        end_time: appointment?.end_time ? appointment?.end_time : "",
        no_of_person: appointment?.no_of_person ? appointment?.no_of_person : "",
        is_group: appointment?.is_group ? appointment?.is_group : 0,
        group_data: appointment?.group_data ? appointment?.group_data : 0,
        comments: appointment?.comments ? appointment?.comments : "",
        employee_comments: appointment?.employee_comments ? appointment?.employee_comments : "",
        payment_type: appointment?.payment_type ? appointment?.payment_type : "",
        payment_status: appointment?.payment_status ? appointment?.payment_status : "pending",
        group_data: appointment?.group_data ? appointment?.group_data : [], //friend's booking
        discount_id: appointment?.discount_id ? appointment?.discount_id : null,
        discount_code: appointment?.discount_code ? appointment?.discount_code : '',
        offer_discount_code: appointment?.offer_discount_code ? appointment?.offer_discount_code : '',
        total_price: appointment?.total_price ? appointment?.total_price : 0,
        discounted_price: appointment?.discounted_price ? appointment?.discounted_price : 0,
        price: appointment?.price ? appointment?.price : 0,
        is_readed: appointment?.is_readed ? appointment?.is_readed : 0,
        status: appointment?.status ? appointment?.status : 1,
        booking_status: appointment?.booking_status ? appointment?.booking_status : "pending",
        extended_time: "",
        transaction_id: appointment?.transaction_id ? appointment?.transaction_id : '',
        transaction: appointment?.transaction ? appointment?.transaction : null,
        app_datetime: appointment?.app_datetime ? appointment?.app_datetime : "",
        paid_amount: appointment?.paid_amount ? appointment?.paid_amount : 0,
        remaining_amount: appointment?.remaining_amount ? appointment?.remaining_amount : 0,
        total_amount: appointment?.total_amount ? appointment?.total_amount : 0,
        grand_total: appointment?.grand_total ? appointment?.grand_total : 0,
        grand_total_price: appointment?.grand_total_price ? appointment?.grand_total_price : 0,
        grand_discounted_price: appointment?.grand_discounted_price ? appointment?.grand_discounted_price : 0,
        grand_final_price: appointment?.grand_final_price ? appointment?.grand_final_price : 0,
        front_booking: appointment?.front_booking ? appointment?.front_booking : false,
        employee_name: appointment?.employee_name ? appointment?.employee_name : "",
        consultation_user: appointment?.consultation_user ? appointment?.consultation_user : null,
        discount_slab_id: appointment?.discount_slab_id ? appointment?.discount_slab_id : null,
        customer_package_id: appointment?.customer_package_id?.length ? appointment?.customer_package_id : null,
        package_id: appointment?.package_id?.length ? appointment?.package_id : null,
        package_service: appointment?.package_service?.length ? appointment?.package_service : null,
        start_time_meridiem: appointment?.start_time_meridiem ? appointment?.start_time_meridiem : '',
        end_time_meridiem: appointment?.end_time_meridiem ? appointment?.end_time_meridiem : '',
        patch_test_booking: appointment?.patch_test_booking ? appointment?.patch_test_booking : 0,
        stop_email_sms: appointment?.stop_email_sms ? appointment?.stop_email_sms : 0,
        discount_services: appointment?.discount_services?.length ? appointment?.discount_services : null,
        discount_code_type: appointment?.discount_code_type ? appointment?.discount_code_type : '',
        loyalty_card_data: appointment?.loyalty_card_data?.length ? appointment?.loyalty_card_data : null,
        categories: appointment?.categories?.length ? appointment?.categories : null,
        consultant_service_type: appointment?.consultant_service_type?.length ? appointment?.consultant_service_type : null,
        consultant_status: appointment?.consultant_status ? appointment?.consultant_status : 0,
        consultantform_id: appointment?.consultantform_id ? appointment?.consultantform_id : "",
        group_booking_ids: appointment?.group_booking_ids?.length ? appointment?.group_booking_ids : null,
        service_data: appointment?.service_data?.length ? appointment?.service_data : null,
        group_booking_ids: appointment?.group_booking_ids?.length ? appointment?.group_booking_ids : null,
        reschedule_count: appointment?.reschedule_count ? appointment?.reschedule_count : 0,
        is_reschedule_readed: appointment?.is_reschedule_readed ? appointment?.is_reschedule_readed : 0,
        discount_type: appointment?.discount_type ? appointment?.discount_type : '',
        reschedule_transaction: null,
        reschedule_date: null,
        reschedule_out_of_paid_percentage: 0,
        reschedule_out_of_paid_amount: 0,
        source_url: appointment?.source_url ? appointment?.source_url : '',
        customer_icon: appointment?.customer_icon ? appointment?.customer_icon : '',
        used_gift_card_bal: appointment?.used_gift_card_bal ? appointment?.used_gift_card_bal : 0,
        deposit_gift_card_bal: appointment?.deposit_gift_card_bal ? appointment?.deposit_gift_card_bal : 0,
        gift_card_transaction_id: appointment?.gift_card_transaction_id ? appointment?.gift_card_transaction_id : null,
        credit_gift_card_transaction_id: appointment?.credit_gift_card_transaction_id ? appointment?.credit_gift_card_transaction_id : null,
        deposit_gift_card_transaction_id: appointment?.deposit_gift_card_transaction_id ? appointment?.deposit_gift_card_transaction_id : null,
        expire_gift_card_transaction_id: appointment?.expire_gift_card_transaction_id ? appointment?.expire_gift_card_transaction_id : null,
        removed_gift_card_transaction_id: appointment?.removed_gift_card_transaction_id ? appointment?.removed_gift_card_transaction_id : null,
        cancel_date: null,
        paypal_error: appointment?.paypal_error ? appointment?.paypal_error : '',
    })

    try {
        // Saving the Appointment 
        var savedAppointment = await newAppointment.save();
        return savedAppointment;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating Appointment")
    }
}

exports.updateAppointment = async function (appointment) {
    var id = appointment._id
    try {
        //Find the old Appointment Object by the Id
        var oldAppointment = await Appointment.findById(id);
        // console.log('OldAppointment ',oldAppointment)
    } catch (e) {
        throw Error("Error occured while Finding the Appointment")
    }

    // If no old Appointment Object exists return false
    if (!oldAppointment) { return false; }

    // Edit the Appointment Object
    if (appointment?.employee_id || appointment.employee_id == "") {
        oldAppointment.employee_id = appointment?.employee_id ? appointment.employee_id : null;
    }

    if (appointment.client_id) {
        oldAppointment.client_id = appointment.client_id;
    }

    if (appointment.service_id && appointment?.service_id?.length > 0) {
        oldAppointment.service_id = appointment.service_id;
    }

    if (appointment.service_data && appointment?.service_data?.length > 0) {
        oldAppointment.service_data = appointment.service_data;
    }

    if (appointment.company_id) {
        oldAppointment.company_id = appointment.company_id;
    }

    if (appointment.location_id) {
        oldAppointment.location_id = appointment.location_id;
    }

    if (appointment.date) {
        oldAppointment.date = appointment.date;
    }

    if (appointment.start_time) {
        oldAppointment.start_time = appointment.start_time;
    }

    if (appointment.end_time) {
        oldAppointment.end_time = appointment.end_time;
    }

    if (appointment.no_of_person) {
        oldAppointment.no_of_person = appointment.no_of_person;
    }

    if (appointment?.is_group || appointment.is_group == 0) {
        oldAppointment.is_group = appointment.is_group ? appointment.is_group : 0;
    }

    if (appointment?.comments || appointment.comments == "") {
        oldAppointment.comments = appointment.comments ? appointment.comments : "";
    }

    if (appointment?.employee_comments || appointment.employee_comments == "") {
        oldAppointment.employee_comments = appointment.employee_comments ? appointment.employee_comments : "";
    }

    if (appointment.payment_type) {
        oldAppointment.payment_type = appointment.payment_type;
    }

    if (appointment.payment_status) {
        oldAppointment.payment_status = appointment.payment_status;
    }

    if (appointment?.group_data?.length || appointment.group_data?.length == 0) {
        oldAppointment.group_data = appointment?.group_data?.length ? appointment.group_data : null
    }

    if (appointment.is_readed) {
        oldAppointment.is_readed = appointment.is_readed;
    }

    if (appointment.status) {
        oldAppointment.status = appointment.status;
    }

    if (appointment.booking_status) {
        if (appointment.booking_status == 'cancel' && appointment.booking_status != oldAppointment.booking_status) {
            oldAppointment.cancel_date = Date();
        }

        oldAppointment.booking_status = appointment.booking_status;
    }

    if (appointment.extended_time) {
        oldAppointment.extended_time = appointment.extended_time;
    }

    if (appointment.transaction_id) {
        oldAppointment.transaction_id = appointment.transaction_id;
    }

    if (appointment?.transaction && appointment.transaction?.length) {
        oldAppointment.transaction = appointment.transaction;
    }

    if (appointment.discount_type || appointment.discount_type == "") {
        oldAppointment.discount_type = appointment.discount_type;
    }

    if (appointment?.discount_id || appointment.discount_id == "") {
        oldAppointment.discount_id = appointment.discount_id ? appointment.discount_id : null
    }

    if (appointment?.discount_code || appointment.discount_code == "") {
        oldAppointment.discount_code = appointment.discount_code ? appointment.discount_code : "";
    }

    if (appointment?.offer_discount_code || appointment.offer_discount_code == "") {
        oldAppointment.offer_discount_code = appointment.offer_discount_code ? appointment.offer_discount_code : "";
    }

    if (appointment.total_price || appointment.total_price == 0) {
        oldAppointment.total_price = appointment.total_price;
    }

    if (appointment.discounted_price || appointment.discounted_price == 0) {
        oldAppointment.discounted_price = appointment.discounted_price;
    }

    if (appointment.price || appointment.price == 0) {
        oldAppointment.price = appointment.price;
    }

    if (appointment.paid_amount || appointment.paid_amount == 0) {
        oldAppointment.paid_amount = appointment.paid_amount;
    }

    if (appointment.remaining_amount || appointment.remaining_amount == 0) {
        oldAppointment.remaining_amount = appointment.remaining_amount;
    }
    if (appointment.total_amount || appointment.total_amount == 0) {
        oldAppointment.total_amount = appointment.total_amount;
    }

    if (appointment.grand_total || appointment.grand_total == 0) {
        oldAppointment.grand_total = appointment.grand_total;
    }

    if (appointment.grand_total_price || appointment.grand_total_price == 0) {
        oldAppointment.grand_total_price = appointment.grand_total_price;
    }

    if (appointment.grand_discounted_price || appointment.grand_discounted_price == 0) {
        oldAppointment.grand_discounted_price = appointment.grand_discounted_price;
    }

    if (appointment.grand_final_price || appointment.grand_final_price == 0) {
        oldAppointment.grand_final_price = appointment.grand_final_price;
    }

    if (appointment.employee_name) {
        oldAppointment.employee_name = appointment.employee_name;
    }

    if (appointment.consultation_user) {
        oldAppointment.consultation_user = appointment?.consultation_user || null
    }

    if (appointment.consultant_status) {
        oldAppointment.consultant_status = appointment.consultant_status;
    }

    if (appointment.categories) {
        oldAppointment.categories = appointment.categories;
    }

    if (appointment.consultant_service_type) {
        oldAppointment.consultant_service_type = appointment.consultant_service_type;
    }

    if (appointment?.customer_package_id?.length || appointment?.customer_package_id?.length == 0) {
        oldAppointment.customer_package_id = appointment?.customer_package_id?.length ? appointment.customer_package_id : null
    }

    if (appointment?.package_id?.length || appointment.package_id?.length == 0) {
        oldAppointment.package_id = appointment?.package_id?.length ? appointment.package_id : null
    }

    if (appointment.package_service && (appointment.package_service?.length > 0 || appointment.package_service?.length == 0)) {
        oldAppointment.package_service = appointment?.package_service?.length ? appointment.package_service : null
    }

    if (appointment.start_time_meridiem) {
        oldAppointment.start_time_meridiem = appointment.start_time_meridiem;
    }

    if (appointment.end_time_meridiem) {
        oldAppointment.end_time_meridiem = appointment.end_time_meridiem;
    }

    if (appointment?.patch_test_booking || appointment.patch_test_booking == 0) {
        oldAppointment.patch_test_booking = appointment.patch_test_booking ? appointment.patch_test_booking : 0;
    }

    if (appointment?.stop_email_sms || appointment.stop_email_sms == 0) {
        oldAppointment.stop_email_sms = appointment.stop_email_sms ? appointment.stop_email_sms : 0;
    }

    if (appointment.discount_slab_id || appointment.discount_slab_id == "") {
        oldAppointment.discount_slab_id = appointment.discount_slab_id || null
    }

    if (appointment.discount_services && (appointment.discount_services.length > 0 || appointment.discount_services.length == 0)) {
        oldAppointment.discount_services = appointment?.discount_services?.length ? appointment.discount_services : null
    }

    if (appointment.discount_code_type || appointment.discount_code_type == "") {
        oldAppointment.discount_code_type = appointment.discount_code_type;
    }

    if (appointment?.loyalty_card_data) {
        oldAppointment.loyalty_card_data = appointment?.loyalty_card_data?.length ? appointment.loyalty_card_data : null
    }

    if (appointment.consultantform_id) {
        oldAppointment.consultantform_id = appointment.consultantform_id;
    }

    if (appointment.group_booking_ids) {
        oldAppointment.group_booking_ids = appointment?.group_booking_ids?.length ? appointment.group_booking_ids : null;
    }

    if (appointment.reschedule_count) {
        oldAppointment.reschedule_count = appointment.reschedule_count;
    }

    if (appointment.is_reschedule_readed) {
        oldAppointment.is_reschedule_readed = appointment.is_reschedule_readed;
    }

    if (appointment.reschedule_transaction) {
        oldAppointment.reschedule_transaction = appointment?.reschedule_transaction?.length ? appointment.reschedule_transaction : null
    }

    if (appointment.reschedule) {
        oldAppointment.reschedule_date = Date();
    }

    if (appointment.reschedule_out_of_paid_percentage) {
        oldAppointment.reschedule_out_of_paid_percentage = appointment.reschedule_out_of_paid_percentage ? appointment.reschedule_out_of_paid_percentage : 0;
    }

    if (appointment.reschedule_out_of_paid_amount) {
        oldAppointment.reschedule_out_of_paid_amount = appointment.reschedule_out_of_paid_amount ? appointment.reschedule_out_of_paid_amount : 0;
    }

    if (appointment.customer_icon) {
        oldAppointment.customer_icon = appointment.customer_icon;
    }

    if (appointment?.used_gift_card_bal || appointment.used_gift_card_bal == 0) {
        if (appointment?.used_gift_card_bal) {
            appointment.used_gift_card_bal = parseFloat(appointment.used_gift_card_bal).toFixed(2);
        }

        oldAppointment.used_gift_card_bal = appointment.used_gift_card_bal;
    }

    if (appointment?.deposit_gift_card_bal || appointment.deposit_gift_card_bal == 0) {
        if (appointment?.deposit_gift_card_bal) {
            appointment.deposit_gift_card_bal = parseFloat(appointment.deposit_gift_card_bal).toFixed(2);
        }

        oldAppointment.deposit_gift_card_bal = appointment.deposit_gift_card_bal;
    }

    if (appointment?.gift_card_transaction_id?.length || appointment?.gift_card_transaction_id?.length == 0) {
        oldAppointment.gift_card_transaction_id = appointment?.gift_card_transaction_id?.length ? appointment.gift_card_transaction_id : null;
    }

    if (appointment?.credit_gift_card_transaction_id?.length || appointment?.credit_gift_card_transaction_id?.length == 0) {
        oldAppointment.credit_gift_card_transaction_id = appointment?.credit_gift_card_transaction_id?.length ? appointment.credit_gift_card_transaction_id : null;
    }

    if (appointment?.deposit_gift_card_transaction_id?.length || appointment?.deposit_gift_card_transaction_id?.length == 0) {
        oldAppointment.deposit_gift_card_transaction_id = appointment?.deposit_gift_card_transaction_id?.length ? appointment.deposit_gift_card_transaction_id : null;
    }

    if (appointment?.expire_gift_card_transaction_id?.length || appointment?.expire_gift_card_transaction_id?.length == 0) {
        oldAppointment.expire_gift_card_transaction_id = appointment?.expire_gift_card_transaction_id?.length ? appointment.expire_gift_card_transaction_id : null;
    }

    if (appointment?.removed_gift_card_transaction_id?.length || appointment?.removed_gift_card_transaction_id?.length == 0) {
        oldAppointment.removed_gift_card_transaction_id = appointment?.removed_gift_card_transaction_id?.length ? appointment.removed_gift_card_transaction_id : null;
    }

    if (appointment?.paypal_error) {
        oldAppointment.paypal_error = appointment.paypal_error;
    }

    try {
        var savedAppointment = await oldAppointment.save();
        return savedAppointment;
    } catch (e) {
        throw Error("And Error occured while updating the Appointment");
    }
}

exports.updateConsultation = async function (appointment) {
    var id = appointment._id;
    try {
        var oldAppointment = await Appointment.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Appointment")
    }

    if (!oldAppointment) { return false; }

    // Edit the Appointment Object
    if (appointment.consultantform_id) { //staff
        oldAppointment.consultantform_id = appointment.consultantform_id;
    }

    try {
        var savedAppointment = await oldAppointment.save()
        return savedAppointment;
    } catch (e) {
        throw Error("And Error occured while updating the Appointment");
    }
}

exports.updateBookingNotification = async function (appointment) {
    var id = appointment._id;
    try {
        //Find the old Appointment Object by the Id
        var oldAppointment = await Appointment.findById(id);
        // console.log('OldAppointment ',oldAppointment)
    } catch (e) {
        throw Error("Error occured while Finding the Appointment")
    }

    if (!oldAppointment) { return false; }

    // Edit the Appointment Object
    if (appointment.is_readed) { //staff
        oldAppointment.is_readed = appointment.is_readed;
    }

    try {
        var savedAppointment = await oldAppointment.save()
        return savedAppointment;
    } catch (e) {
        throw Error("And Error occured while updating the Appointment");
    }
}

exports.removeBookingPackage = async function (appointment) {
    var id = appointment._id;
    try {
        //Find the old Appointment Object by the Id
        var oldAppointment = await Appointment.findById(id);
        // console.log('OldAppointment ',oldAppointment)
    } catch (e) {
        throw Error("Error occured while Finding the Appointment")
    }

    if (!oldAppointment) { return false; }

    oldAppointment.customer_package_id = null
    oldAppointment.package_id = null

    try {
        var savedAppointment = await oldAppointment.save()
        return savedAppointment;
    } catch (e) {
        throw Error("And Error occured while updating the Appointment");
    }
}

exports.updateBookingConsultation = async function (appointment) {
    var id = appointment._id;
    try {
        //Find the old Appointment Object by the Id
        var oldAppointment = await Appointment.findById(id);
        // console.log('OldAppointment ',oldAppointment)
    } catch (e) {
        throw Error("Error occured while Finding the Appointment")
    }

    if (!oldAppointment) { return false; }

    // Edit the Appointment Object
    if (appointment.consultant_service_type) { //staff
        oldAppointment.consultant_service_type = appointment.consultant_service_type;
    }

    try {
        var savedAppointment = await oldAppointment.save()
        return savedAppointment;
    } catch (e) {
        throw Error("And Error occured while updating the Appointment");
    }
}

exports.deleteAppointment = async function (id) {
    // Delete the Appointment
    try {
        var deleted = await Appointment.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Appointment Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Appointment")
    }
}

exports.getAppointmentDataGroup = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var appointment = await Appointment.find(query)
            .sort({ location_id: -1 })

        // Return the Appointment list that was retured by the mongoose promise
        return appointment
    } catch (e) {
        console.log("Error ", e)
        // return a Error message describing the reason 
        throw Error('Error while finding Appointment')
    }
}

exports.getAppointmentDisctict = async function (field, query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var appointment = await Appointment.distinct(field, query)

        // Return the Appointment list that was retured by the mongoose promise
        return appointment
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding Appointment')
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Appointment.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Appointment")
    }
}