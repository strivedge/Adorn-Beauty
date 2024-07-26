// Gettign the Newly created Mongoose Model we just created 
var bcrypt = require('bcryptjs');

var Customer = require('../models/Customer.model');
var Location = require('../models/Location.model');
var User = require('../models/User.model');

var ImageService = require('./image.service');
var SendEmailSmsService = require('./sendEmailSms.service');

// Saving the context of this module inside the _the variable
_this = this;

exports.getAllCustomers = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var Customers = await Customer.paginate(query, options)
        var sort = {};
        sort[order_name] = order;

        var Customers = await Customer.aggregate([
            { $match: query },
            {
                $project: {
                    _id: 1,
                    company_ids: 1,
                    location_ids: 1,
                    status: 1,
                    createdAt: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    is_international_number: 1,
                    role_id: 1,
                    photo: 1,
                    role_id: 1,
                    customer_badges: 1,
                    customer_icons: 1,
                }
            },
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
        ])

        await Location.populate(Customers, { path: "locations", select: { _id: 1, name: 1 } });

        // Return the Customerd list that was retured by the mongoose promise
        return Customers;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getCustomerAllData = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var clients = await Customer.paginate(query, options)
        var clients = await Customer.find(query);

        return clients;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getClients = async function (query, limit = 0) {
    // Try Catch the awaited promise to handle the error 
    try {
        var clients = await Customer.find(query)
            .select({ _id: 1, first_name: 1, last_name: 1, name: 1, mobile: 1, is_international_number: 1, email: 1, dob: 1, age: 1, anniversary_date: 1, gender: 1, customer_heart: 1, customer_icon: 1, customer_badge: 1, email_notification: 1, sms_notification: 1, location_ids: 1, location_id: 1, is_customer: 1, session_email_notification: 1, session_sms_notification: 1, notification_permission: 1, birthday_email_notification: 1, birthday_sms_notification: 1, marketing_email_notification: 1, marketing_sms_notification: 1, wa_verified: 1, customer_badges: 1, customer_icons: 1 })
            .limit(limit)

        // Return the Customerd list that was retured by the mongoose promise
        return clients;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getCustomerNotification = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var clients = await Customer.findOne(query)
            .select({ _id: 1, first_name: 1, last_name: 1, name: 1, mobile: 1, is_international_number: 1, email: 1, email_notification: 1, sms_notification: 1, is_customer: 1, notification_permission: 1, session_email_notification: 1, session_sms_notification: 1, birthday_email_notification: 1, birthday_sms_notification: 1, marketing_email_notification: 1, marketing_sms_notification: 1, customer_badges: 1, customer_icons: 1 })
            .populate({
                path: 'company_ids',
                select: {
                    _id: 1,
                    name: 1,
                    contact_number: 1
                }
            })

        // Return the Customerd list that was retured by the mongoose promise
        return clients;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getTestRedundantCustomers = async function () {
    // Try Catch the awaited promise to handle the error 
    try {
        var Customers = await Customer.aggregate([
            { "$group": { "_id": "$email", "count": { "$sum": 1 } } },
            { "$match": { "_id": { "$ne": null }, "count": { "$gt": 1 } } },
            { "$sort": { "count": -1 } },
            { "$project": { "email": "$_id", "_id": 0 } }
        ])

        // Return the Customerd list that was retured by the mongoose promise
        return Customers;
    } catch (e) {
        console.log("getTestRedundantCustomers Error >>> ", e)
        // return a Error message describing the reason
        throw Error('Error while Paginating Customers');
    }
}

exports.getTestRedundantCustomersMobile = async function () {
    // Try Catch the awaited promise to handle the error 
    try {
        var Customers = await Customer.aggregate([
            { "$group": { "_id": "$mobile", "count": { "$sum": 1 } } },
            { "$match": { "_id": { "$ne": null }, "count": { "$gt": 1 } } },
            { "$sort": { "count": -1 } },
            { "$project": { "mobile": "$_id", "_id": 0 } }
        ])

        // Return the Customerd list that was retured by the mongoose promise
        return Customers;
    } catch (e) {
        console.log("getTestRedundantCustomers Error >>> ", e)
        // return a Error message describing the reason
        throw Error('Error while Paginating Customers');
    }
}

exports.getClientShortDetails = async function (query = {}) {
    // Try Catch the awaited promise to handle the error 
    try {
        var clients = await Customer.find(query)
            .select("_id first_name last_name name email mobile gender dob age photo customer_heart customer_icon customer_badge customer_badges, customer_icons")

        // Return the Customerd list that was retured by the mongoose promise
        return clients;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getCustomerSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Customers = await Customer.find(query)
            .select({ '_id': 1, 'name': 1, 'location_id': 1, 'location_ids': 1 })

        // Return the Serviced list that was retured by the mongoose promise
        return Customers;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getCustomerListing = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        const facetedPipeline = [
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

        var Customers = await Customer.aggregate(facetedPipeline);

        // Return the Customerd list that was retured by the mongoose promise
        return Customers;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getCustomerOneSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Customers = await Customer.findOne(query)
            .select({ _id: 1, name: 1, first_name: 1, last_name: 1 })

        // Return the Customerd list that was retured by the mongoose promise
        return Customers;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getClientDobSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customers = await Customer.aggregate([
            {
                "$project": {
                    "_id": 1,
                    "is_customer": 1,
                    "status": 1,
                    "location_id": 1,
                    "location_ids": 1,
                    "email": 1,
                    "mobile": 1,
                    "is_international_number": 1,
                    "name": 1,
                    "dob": 1,
                    "age": 1,
                    "is_customer": 1,
                    "email_notification": 1,
                    "sms_notification": 1,
                    "session_email_notification": 1,
                    "session_sms_notification": 1,
                    "notification_permission": 1,
                    "birthday_email_notification": 1,
                    "birthday_sms_notification": 1,
                    "marketing_email_notification": 1,
                    "marketing_sms_notification": 1,
                    "wa_verified": 1,
                    "m": { "$month": "$dob" },
                    "d": { "$dayOfMonth": "$dob" }
                }
            },
            //{ "$match":{ "m": 8, "d": 28 } },
            { $match: query }
        ])

        return customers;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getCustomersSpecificBySort = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Customers = await Customer.find(query).select({ _id: 1, location_id: 1, name: 1, first_name: 1, last_name: 1, mobile: 1, is_international_number: 1, email: 1, dob: 1, age: 1, email_notification: 1, sms_notification: 1, location_ids: 1, notification_permission: 1, session_email_notification: 1, session_sms_notification: 1, notification_permission: 1, birthday_email_notification: 1, birthday_sms_notification: 1, marketing_email_notification: 1, marketing_sms_notification: 1, wa_verified: 1, customer_badges: 1, customer_icons: 1, createdAt: 1, updatedAt: 1 }).sort({ updatedAt: -1 });

        // Return the Customerd list that was retured by the mongoose promise
        return Customers;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getCustomersSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Customers = await Customer.find(query).select({ _id: 1, location_id: 1, name: 1, first_name: 1, last_name: 1, mobile: 1, is_international_number: 1, email: 1, dob: 1, age: 1, email_notification: 1, sms_notification: 1, location_ids: 1, notification_permission: 1, session_email_notification: 1, session_sms_notification: 1, notification_permission: 1, birthday_email_notification: 1, birthday_sms_notification: 1, marketing_email_notification: 1, marketing_sms_notification: 1, wa_verified: 1, customer_badges: 1, customer_icons: 1 });

        // Return the Customerd list that was retured by the mongoose promise
        return Customers;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getCustomers = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        const facetedPipeline = [
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
        ];

        var customers = await Customer.aggregate(facetedPipeline);
        // ** Updated user
        if (customers && customers?.length > 0) {
            customers[0].data = await Customer.populate(customers[0].data, {
                path: "updated_by",
                model: User,
                select: {
                    _id: 1,
                    name: 1,
                }
            })
        }

        // Return the Customerd list that was retured by the mongoose promise
        return customers;
    } catch (e) {
        console.log('e:', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getCustomerDataForExport = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Customers = await Customer.find(query, { _id: 0 }).select('mobile').select('name').select('email');//.select({ name: 1, email: 1, mobile: 1});

        // Return the Customerd list that was retured by the mongoose promise
        return Customers;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getActiveCustomers = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Customers = await Customer.find(query)
            .select({
                _id: 1,
                name: 1,
                email: 1,
                mobile: 1,
                is_international_number: 1,
                is_customer: 1,
                email_notification: 1,
                sms_notification: 1,
                notification_permission: 1,
                session_email_notification: 1, session_sms_notification: 1, notification_permission: 1, birthday_email_notification: 1, birthday_sms_notification: 1, marketing_email_notification: 1, marketing_sms_notification: 1, wa_verified: 1, customer_badges: 1, customer_icons: 1, customer_badges: 1, customer_icons: 1
            })

        // Return the Customerd list that was retured by the mongoose promise
        return Customers;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Customers');
    }
}

exports.getCustomerById = async function (id) {
    try {
        // Find the Customer 
        var _details = await Customer.findOne({ _id: id })
            .select({ _id: 1, name: 1, email: 1, mobile: 1, is_international_number: 1, gender: 1, email_notification: 1, sms_notification: 1, notification_permission: 1, customer_badge: 1, session_email_notification: 1, session_sms_notification: 1, notification_permission: 1, birthday_email_notification: 1, birthday_sms_notification: 1, marketing_email_notification: 1, marketing_sms_notification: 1, wa_verified: 1, customer_badges: 1, customer_icons: 1 })

        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        //throw Error("Customer not available");
        return 0;
    }
}

exports.getCustomer = async function (id) {
    try {
        // Find the Customer 
        var _details = await Customer.findOne({ _id: id });

        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        //throw Error("Customer not available")
        return 0;
    }
}

exports.getCustomerOne = async function (query = {}) {
    try {
        // Find the Customer 
        var _details = await Customer.findOne(query);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason
        return null;
    }
}

exports.checkCustomerExist = async function (query) {
    try {
        // Find the Customer 
        var _details = await Customer.findOne(query);

        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Customer not available");
    }
}

exports.getCustomerbyEmail = async function (email) {
    try {
        // Find the Customer 
        var _details = await Customer.findOne({ email: email, status: 1 });
        return _details;
    } catch (e) {
        console.log("e", e)
        // return a Error message describing the reason     
        throw Error("Customer not available");
    }
}

exports.getCustomerbyLocation = async function (query) {
    try {
        // Find the Customer 
        var _details = await Customer.findOne(query);
        return _details;
    } catch (e) {
        console.log("e", e)
        // return a Error message describing the reason     
        throw Error("Customer not available");
    }
}

exports.getCustomerByQuery = async function (query) {
    try {
        // Find the Customer 
        var _details = await Customer.find(query);
        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Customer not available");
    }
}

// update multiple Customers
exports.getCustomerBalance = async function (customer_id) {
    try {
        return await Customer.findOne({ _id: customer_id }).select('balance');
    } catch (e) {
        // return an Error message describing the reason
        throw Error("Customer not available");
    }
}

// update multiple Customers
exports.updateCustomerBalance = async function (customer_id, updateData) {
    try {
        return await Customer.update({ _id: customer_id }, updateData);
    } catch (e) {
        // return an Error message describing the reason
        throw Error("Customer not available");
    }
}

// Update multiple Customers
exports.updateMultipleCustomers = async function (query, update) {
    try {
        return await Customer.updateMany(query, update);
    } catch (e) {
        // return an Error message describing the reason
        throw Error("Customers not available");
    }
}

exports.verifyWhatsAppAccount = async function (mobile, customer_id) {
    try {
        if (mobile) {
            var verified = await SendEmailSmsService.verifyWhatsAppNumber(mobile, process.env?.WATVERIFYAPI2)
            var wa_verified = verified ? 1 : 0;
        }
        return await Customer.updateMany({ _id: customer_id }, { wa_verified: wa_verified });
    } catch (e) {
        // return an Error message describing the reason
        throw Error("Customers not available");
    }
}

const verifyWhatsAppNumber = async function (mobile, customer_id) {
    try {
        if (mobile) {
            var verified = await SendEmailSmsService.verifyWhatsAppNumber(mobile, process.env?.WATVERIFYAPI2)
            var wa_verified = verified ? 1 : 0;
        }
        await Customer.updateMany({ _id: customer_id }, { wa_verified: wa_verified });
        return true;
    } catch (e) {
        return null;
    }
}

exports.createCustomer = async function (customer) {
    if (customer?.photo) {
        var isImage = await ImageService.saveImage(customer.photo, "/images/Customers/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            customer.photo = isImage;
        }
    }

    if (customer.first_name) { customer.name = customer.first_name; }

    if (customer.first_name && customer.last_name) {
        customer.name = customer.first_name + ' ' + customer.last_name;
    }

    if (!customer.email_notification || customer.email_notification != 0) {
        customer.email_notification = 1;
    }

    if (!customer.sms_notification || customer.sms_notification != 0) {
        customer.sms_notification = 1;
    }

    if (!customer.session_email_notification || customer.session_email_notification != 0) {
        customer.session_email_notification = 1;
    }

    if (!customer.session_sms_notification || customer.session_sms_notification != 0) {
        customer.session_sms_notification = 1;
    }

    if (!customer.birthday_email_notification || customer.birthday_email_notification != 0) {
        customer.birthday_email_notification = 1;
    }

    if (!customer.birthday_sms_notification || customer.birthday_sms_notification != 0) {
        customer.birthday_sms_notification = 1;
    }

    if (!customer.marketing_email_notification || customer.marketing_email_notification != 0) {
        customer.marketing_email_notification = 1;
    }

    if (!customer.marketing_sms_notification || customer.marketing_sms_notification != 0) {
        customer.marketing_sms_notification = 1;
    }

    if (customer.is_international_number) {
        customer.sms_notification = 0;
        customer.session_sms_notification = 0;
    }

    if (customer.location_id && (!customer.location_ids || customer.location_ids?.length == 0)) {
        customer.location_ids = [customer.location_id];
    }

    if (customer.company_id && (!customer.company_ids || customer.company_ids?.length == 0)) {
        customer.company_ids = [customer.company_id];

        if (customer.customer_icon) {
            customer.customer_icons = [{
                company_id: customer.company_id,
                icon: customer.customer_icon ?? ""
            }];
        }

        if (customer.customer_badge) {
            customer.customer_badges = [{
                company_id: customer.company_id,
                badge: customer.customer_badge ?? ""
            }];
        }
    }

    var newCustomer = new Customer({
        company_ids: customer.company_ids?.length ? customer.company_ids : null,
        location_ids: customer.location_ids?.length ? customer.location_ids : null,
        first_name: customer.first_name ? customer.first_name : '',
        last_name: customer.last_name ? customer.last_name : '',
        name: customer.name ? customer.name : '',
        email: customer.email ? customer.email : '',
        mobile: customer.mobile ? customer.mobile : '',
        password: customer.password ? bcrypt.hashSync(customer.password, 8) : null,
        gender: customer.gender ? customer.gender : '',
        dob: customer.dob ? customer.dob : null,
        anniversary_date: customer.anniversary_date ? customer.anniversary_date : null,
        role_id: customer.role_id ? customer.role_id : process.env?.CUSTOMER_ROLE || "607d8af0841e37283cdbec4c", // Customer role id
        photo: customer.photo ? customer.photo : "images/customers/default-customer.png",
        status: customer.status ? customer.status : 1,
        is_customer: customer.is_customer ? customer.is_customer : 1,
        customer_badge: customer.customer_badge ? customer.customer_badge : '',
        notification_permission: customer.notification_permission ? customer.notification_permission : 0,
        customer_heart: customer.customer_heart ? customer.customer_heart : 'normal',
        customer_icon: customer.customer_icon ? customer.customer_icon : '',
        email_notification: customer.email_notification ? customer.email_notification : 0,
        sms_notification: customer.sms_notification ? customer.sms_notification : 0,
        session_email_notification: customer.session_email_notification ? customer.session_email_notification : 0,
        session_sms_notification: customer.session_sms_notification ? customer.session_sms_notification : 0,
        birthday_email_notification: customer.birthday_email_notification ? customer.birthday_email_notification : 0,
        birthday_sms_notification: customer.birthday_sms_notification ? customer.birthday_sms_notification : 0,
        marketing_email_notification: customer.marketing_email_notification ? customer.marketing_email_notification : 0,
        marketing_sms_notification: customer.marketing_sms_notification ? customer.marketing_sms_notification : 0,
        forgot_password: customer.forgot_password ? customer.forgot_password : 0,
        is_international_number: customer.is_international_number ? customer.is_international_number : 0,
        is_blocked: customer.is_blocked == 1 || customer.is_blocked == 0 ? customer.is_blocked : 0,
        reset_token: customer.reset_token ? customer.reset_token : "",
        code: customer.code ? customer.code : "",
        age: customer.age ? customer.age : 0,
        updated_by: customer.updated_by ? customer.updated_by : null,
        balance: customer.balance ? customer.balance : 0,
        wa_verified: customer.wa_verified ? customer.wa_verified : 0,
        customer_badges: customer.customer_badges ? customer.customer_badges : null,
        customer_icons: customer.customer_icons ? customer.customer_icons : null,
        unsubscribe_submitted: customer.unsubscribe_submitted ? customer.unsubscribe_submitted : 0
    })

    try {
        // Saving the Customer 
        var savedCustomer = await newCustomer.save();
        return savedCustomer;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating Customer");
    }
}

exports.updateCustomer = async function (customer) {
    try {
        // Find the old Customer Object by the Id
        var id = customer._id;
        var oldCustomer = await Customer.findById(id);
    } catch (e) {
        // console.log(e)
        throw Error("Error occured while Finding the Customer");
    }

    // If no old Customer Object exists return false
    if (!oldCustomer) { return false }

    if (customer.mobile && customer.mobile != oldCustomer.mobile) {
        oldCustomer.isUpdateToday = 1;
        // verifyWhatsAppNumber(customer.mobile, customer._id);
        // var verified = await SendEmailSmsService.verifyWhatsAppNumber(customer.mobile, process.env?.WATVERIFYAPI)
        // oldCustomer.wa_verified = verified ? 1 : 0;
    }

    // Edit the Customer Object
    if (customer.first_name) {
        oldCustomer.name = customer.first_name;
    }

    if (customer.first_name && customer.last_name) {
        oldCustomer.name = customer.first_name + ' ' + customer.last_name;
    }

    if (customer.company_ids) {
        oldCustomer.company_ids = customer.company_ids?.length ? customer.company_ids : null;
    }

    if (customer.location_ids) {
        oldCustomer.location_ids = customer.location_ids?.length ? customer.location_ids : null;
    }

    if (customer.device_token) {
        oldCustomer.device_token = customer.device_token;
    }

    if (customer.first_name) {
        oldCustomer.first_name = customer.first_name;
    }

    if (customer.last_name) {
        oldCustomer.last_name = customer.last_name;
    }

    if (customer.name) {
        oldCustomer.name = customer.name;
    }

    if (customer.email) {
        oldCustomer.email = customer.email;
    }

    if (customer.customer_heart) {
        oldCustomer.customer_heart = customer.customer_heart ? customer.customer_heart : "normal";
    }

    if (customer.mobile) {
        oldCustomer.mobile = customer.mobile;
    }

    if (customer.password) {
        oldCustomer.password = bcrypt.hashSync(customer.password, 8);
    }

    if (customer.unsubscribe_submitted == 1 || customer.unsubscribe_submitted == 0) {
        oldCustomer.unsubscribe_submitted = customer.unsubscribe_submitted;
    }

    if (customer.forgot_password == 1 || customer.forgot_password == 0) {
        oldCustomer.forgot_password = customer.forgot_password;
    }

    if (customer.gender) {
        oldCustomer.gender = customer.gender;
    }

    if (customer.dob) {
        oldCustomer.dob = customer.dob;
    }

    if (customer.anniversary_date) {
        oldCustomer.anniversary_date = customer.anniversary_date;
    }

    if (customer.age) {
        oldCustomer.age = customer.age;
    }

    if (customer.updated_by) {
        oldCustomer.updated_by = customer.updated_by;
    }

    if (customer?.location_id && customer.status != 0) {
        var loc = oldCustomer.location_ids ? oldCustomer.location_ids : [];
        loc.push(customer.location_id);
        loc = loc.map(x => x.toString());
        loc = Array.from(new Set(loc));  //remove duplicate
        if (loc && loc.length > 0) {
            oldCustomer.location_ids = loc;
        }
    }

    if (customer?.company_id) {
        var com = oldCustomer.company_ids ? oldCustomer.company_ids : [];
        com.push(customer.company_id);
        com = com.map(x => x.toString());
        com = Array.from(new Set(com));  //remove duplicate
        if (com && com?.length > 0) {
            oldCustomer.company_ids = com;
        }
    }

    if (customer.email_notification || Number(customer.email_notification) == 0) {
        oldCustomer.email_notification = Number(customer?.email_notification) || 0;
    }

    if (customer.sms_notification || Number(customer.sms_notification) == 0) {
        oldCustomer.sms_notification = Number(customer?.sms_notification) || 0;
    }

    if (customer.session_email_notification || Number(customer.session_email_notification) == 0) {
        oldCustomer.session_email_notification = Number(customer?.session_email_notification) || 0;
    }

    if (customer.session_sms_notification || Number(customer.session_sms_notification) == 0) {
        oldCustomer.session_sms_notification = Number(customer?.session_sms_notification) || 0;
    }

    if (customer.birthday_email_notification || Number(customer.birthday_email_notification) == 0) {
        oldCustomer.birthday_email_notification = Number(customer?.birthday_email_notification) || 0;
    }

    if (customer.birthday_sms_notification || Number(customer.birthday_sms_notification) == 0) {
        oldCustomer.birthday_sms_notification = Number(customer?.birthday_sms_notification) || 0;
    }

    if (customer.marketing_email_notification || Number(customer.marketing_email_notification) == 0) {
        oldCustomer.marketing_email_notification = Number(customer?.marketing_email_notification) || 0;
    }

    if (customer.marketing_sms_notification || Number(customer.marketing_sms_notification) == 0) {
        oldCustomer.marketing_sms_notification = Number(customer?.marketing_sms_notification) || 0;
    }

    if (Number(customer.is_international_number) == 1) {
        oldCustomer.sms_notification = 0;
        oldCustomer.session_sms_notification = 0;
        oldCustomer.birthday_sms_notification = 0;
        oldCustomer.marketing_sms_notification = 0;
    }

    if (customer.is_international_number || Number(customer.is_international_number) == 0) {
        oldCustomer.is_international_number = customer.is_international_number;
    }

    if (customer.customer_icon) {
        oldCustomer.customer_icon = customer.customer_icon ? customer.customer_icon : '';
    }

    if (customer.customer_badge) {
        oldCustomer.customer_badge = customer.customer_badge ?? '';
    }

    if (customer.customer_icons && customer.customer_icons.length > 0) {
        oldCustomer.customer_icons = customer.customer_icons ? customer.customer_icons : null;
    }

    if (customer.customer_badges && customer.customer_badges.length > 0) {
        oldCustomer.customer_badges = customer.customer_badges ?? null;
    }

    if (customer.update_permission) {
        oldCustomer.notification_permission = customer.notification_permission ? customer.notification_permission : 0;
    }

    if (customer?.photo) {
        var isImage = await ImageService.saveImage(customer.photo, "/images/customers/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            //Remove Previous Customer Image 
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldCustomer.photo;
                if (oldCustomer.photo && oldCustomer.photo != "images/customers/default-customer.png" && fs.existsSync(filePath)) {
                    // console.log("\n file exists filePath  >>>>>>", filePath, "\n")
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                // console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n");
            }

            // Update Customer Image
            oldCustomer.photo = isImage;
        }
    }

    if (customer.is_blocked == 1 || Number(customer.is_blocked) == 0) {
        oldCustomer.is_blocked = Number(customer.is_blocked);
    }

    if (customer.status == 1 || Number(customer.status) == 0) {
        oldCustomer.status = customer.status ? 1 : 1;
    }

    if (customer?.reset_token || customer?.reset_token == "") {
        oldCustomer.reset_token = customer.reset_token;
    }

    if (customer?.code || customer?.code == "") {
        oldCustomer.code = customer.code;
    }

    if (customer.balance == 1 || customer.balance == 0) {
        oldCustomer.balance = customer.balance ? customer.balance : 0;
    }

    if (customer.wa_verified == 1 || Number(customer.wa_verified) == 0) {
        // console.log('customer.wa_verified ...1',customer.wa_verified)
        oldCustomer.wa_verified = customer.wa_verified ? customer.wa_verified : 0;
    }
    if (customer.isUpdateToday === 1 || customer.isUpdateToday === 0) {
        oldCustomer.isUpdateToday = customer.isUpdateToday
    }
    try {
        var savedCustomer = await oldCustomer.save();
        return savedCustomer;
    } catch (e) {
        throw Error("And Error occured while updating the Customer");
    }
}

exports.deleteCustomer = async function (id) {
    // Delete the Customer
    try {
        var deleted = await Customer.remove({ _id: id });
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Customer Could not be deleted");
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Customer");
    }
}

exports.checkCustomerPassword = async function (customer) {
    // Creating a new Mongoose Object by using the new keyword
    try {
        // Find the Customer 
        var _details = await Customer.findOne({ _id: customer._id })
            .select("+password")
        var passwordIsValid = bcrypt.compareSync(customer.old_password, _details.password)
        if (!passwordIsValid) return null

        return _details;
    } catch (e) {
        console.log("checkCustomerPassword >>> ", e)
        // return a Error message describing the reason     
        throw Error("Error while Check Customer Password");
    }
}

exports.loginCustomer = async function (query, password) {
    // Creating a new Mongoose Object by using the new keyword
    try {
        // Find the Customer 
        var _details = await Customer.findOne(query).select("+password");

        var passwordIsValid = bcrypt.compareSync(password, _details.password);
        if (!passwordIsValid) throw Error("Invalid Customername/password")
        return _details
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Login Customer");
    }
}

exports.updateManyStatus = async function (query) {
    try {
        // Find the Data and replace booking status
        var Customers = await Customer.updateMany(query, { $set: { status: 0 } });

        return Customers;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Appointment not available");
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Customer.remove(query);

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Customer");
    }
}

// This is only for dropdown
exports.getCustomersDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var Customers = await Customer.find(query)
            .select("_id first_name last_name name email mobile gender dob age photo customer_heart customer_icon customer_badge")
            .sort(sorts);

        return Customers;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown Customers');
    }
}
