// Gettign the Newly created Mongoose Model we just created 
var User = require('../models/User.model')

var bcrypt = require('bcryptjs')
var ImageService = require('./image.service')

// Saving the context of this module inside the _the variable
_this = this

var superAdminRole = process.env?.SUPER_ADMIN_ROLE || "607d8aeb841e37283cdbec4b"
var orgAdminRole = process.env?.ORG_ADMIN_ROLE || "6088fe1f7dd5d402081167ee"
var branchAdminRole = process.env?.BRANCH_ADMIN_ROLE || "608185683cf3b528a090b5ad"
var employeeRole = process.env?.EMPLOYEE_ROLE || "608d1cd0558f442514a5a8ad"
var customerRole = process.env?.CUSTOMER_ROLE || "607d8af0841e37283cdbec4c"

// Async function to get the User List
exports.getUsers = async function (query, page, limit) {
    // Try Catch the awaited promise to handle the error 
    try {
        query['role_id'] = { $nin: [superAdminRole, orgAdminRole, branchAdminRole] }; // super admin, company admin, location admin

        //var users = await User.paginate(query, options)
        var users = await User.aggregate([
            { $match: query },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    locations: 1,
                    status: 1,
                    createdAt: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    is_international_number: 1,
                    role_id: 1,
                    photo: 1,
                    role_id: { $ne: ["$role_id", ''] },
                    role_id: {
                        $toObjectId: "$role_id"
                    }
                }
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role_id',
                    foreignField: '_id',
                    as: 'role_data'
                }
            },
            { $unwind: "$role_data" },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    locations: 1,
                    status: 1,
                    createdAt: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    is_international_number: 1,
                    role_id: 1,
                    photo: 1,
                    role_name: "$role_data.name",
                }
            },
            // { '$sort'     : { 'name' : -1 } },
            // { '$facet'    : {
            //     metadata: [ { $count: "total" } ],
            //     data: [ { $skip: page }, { $limit: limit } ] // add projection here wish you re-shape the docs
            // } }
        ])

        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getAllUsers = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        // console.log("getAllUsers ",query)
        //var users = await User.paginate(query, options)
        var sort = {}
        sort[order_name] = order

        var users = await User.aggregate([
            { $match: query },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    locations: 1,
                    status: 1,
                    createdAt: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    is_international_number: 1,
                    role_id: 1,
                    photo: 1,
                    role_id: { $ne: ["$role_id", ''] },
                    role_id: {
                        $toObjectId: "$role_id"
                    }
                }
            },
            {
                $lookup:
                {
                    from: 'roles',
                    localField: 'role_id',
                    foreignField: '_id',
                    as: 'role_data'
                }
            },
            { $unwind: "$role_data" },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    locations: 1,
                    status: 1,
                    createdAt: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    is_international_number: 1,
                    role_id: 1,
                    photo: 1,
                    role_name: "$role_data.name",
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
            },
            // { '$sort'     : { 'name' : -1 } },
            // { '$facet'    : {
            //     metadata: [ { $count: "total" } ],
            //     data: [ { $skip: page }, { $limit: limit } ] // add projection here wish you re-shape the docs
            // } } 
        ])

        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getUserAllData = async function (query, page = 0, limit = 0) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var clients = await User.paginate(query, options)
        var clients = await User.find(query);
        return clients;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users');
    }
}

exports.getClients = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var clients = await User.find(query)
            .select({ _id: 1, first_name: 1, last_name: 1, name: 1, mobile: 1, is_international_number: 1, email: 1, dob: 1, age: 1, anniversary_date: 1, gender: 1, customer_heart: 1, customer_icon: 1, customer_badge: 1, email_notification: 1, sms_notification: 1, marketing_notification: 1, locations: 1, location_id: 1, is_customer: 1, notification_permission: 1 })

        // Return the Userd list that was retured by the mongoose promise
        return clients
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getUserNotification = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var clients = await User.findOne(query)
            .select({ _id: 1, first_name: 1, last_name: 1, name: 1, mobile: 1, is_international_number: 1, email: 1, email_notification: 1, sms_notification: 1, marketing_notification: 1, is_customer: 1, notification_permission: 1, session_email_notification: 1, session_sms_notification: 1 })

        // Return the Userd list that was retured by the mongoose promise
        return clients
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getTestRedundantUsers = async function () {
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.aggregate([
            { "$group": { "_id": "$email", "count": { "$sum": 1 } } },
            { "$match": { "_id": { "$ne": null }, "count": { "$gt": 1 } } },
            { "$sort": { "count": -1 } },
            { "$project": { "email": "$_id", "_id": 0 } }
        ])

        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        console.log("getTestRedundantUsers Error >>> ", e)
        // return a Error message describing the reason
        throw Error('Error while Paginating Users')
    }
}

exports.getTestRedundantUsersMobile = async function () {
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.aggregate([
            { "$group": { "_id": "$mobile", "count": { "$sum": 1 } } },
            { "$match": { "_id": { "$ne": null }, "count": { "$gt": 1 } } },
            { "$sort": { "count": -1 } },
            { "$project": { "mobile": "$_id", "_id": 0 } }
        ])

        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        console.log("getTestRedundantUsers Error >>> ", e)
        // return a Error message describing the reason
        throw Error('Error while Paginating Users')
    }
}

exports.getClientShortDetails = async function (query = {}) {
    // Try Catch the awaited promise to handle the error 
    try {
        var clients = await User.find(query)
            .select("_id first_name last_name name email mobile gender dob age photo customer_heart customer_icon customer_badge")

        // Return the Userd list that was retured by the mongoose promise
        return clients
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getUserSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.find(query)
            .select({ '_id': 1, 'name': 1, 'location_id': 1, 'locations': 1 })

        // Return the Serviced list that was retured by the mongoose promise
        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getEmployees = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.find(query)
            .sort({ employee_priority: 1 })

        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getEmployeesOne = async function (query = {}, sort_field = "", sort_type = "-1") {
    // Try Catch the awaited promise to handle the error 
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var users = await User.find(query)
            .select("_id services first_name last_name name email gender photo user_order employee_priority")
            .sort(sorts)

        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getAvilEmployees = async function (query, sort_field = '') {
    // Try Catch the awaited promise to handle the error 
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = 1
        }

        var users = await User.find(query)
            .select("_id first_name last_name name email gender photo user_order services")
            .sort(sorts)

        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting emaployee')
    }
}

exports.getEmployeesListing = async function (query, page, limit, order_name, order) {
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

        var users = await User.aggregate(facetedPipeline)

        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getEmployeeSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.find(query)
            .select({ _id: 1, name: 1, first_name: 1, last_name: 1 })
        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getEmployeeOneSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.findOne(query)
            .select({ _id: 1, name: 1, first_name: 1, last_name: 1 })
        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getClientDobSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.aggregate([
            {
                "$project": {
                    "_id": 1,
                    "location_id": 1,
                    "locations": 1,
                    "email": 1,
                    "mobile": 1,
                    "is_international_number": 1,
                    "name": 1,
                    "dob": 1,
                    "age": 1,
                    "is_customer": 1,
                    "email_notification": 1,
                    "marketing_notification": 1,
                    "sms_notification": 1,
                    "m": { "$month": "$dob" },
                    "d": { "$dayOfMonth": "$dob" }
                }
            },
            //{ "$match":{ "m": 8, "d": 28 } },
            { $match: query }
        ])

        return users;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getCustomersSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.find(query).select({ _id: 1, location_id: 1, name: 1, first_name: 1, last_name: 1, mobile: 1, is_international_number: 1, email: 1, dob: 1, age: 1, email_notification: 1, sms_notification: 1, marketing_notification: 1, locations: 1, notification_permission: 1 });
        // Return the Userd list that was retured by the mongoose promise
        return users;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users');
    }
}

exports.getCustomers = async function (query, page, limit, order_name, order, serachText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
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
            },
        ];

        var users = await User.aggregate(facetedPipeline);
        // Return the Userd list that was retured by the mongoose promise
        return users;
    } catch (e) {
        console.log('e:', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users');
    }
}

exports.getCustomerDataForExport = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.find(query, { _id: 0 }).select('mobile').select('name').select('email');//.select({ name: 1, email: 1, mobile: 1});
        // Return the Userd list that was retured by the mongoose promise
        return users;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users');
    }
}

exports.getActiveCustomers = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.find(query)
            .select({
                _id: 1,
                name: 1,
                email: 1,
                mobile: 1,
                is_international_number: 1,
                is_customer: 1,
                email_notification: 1,
                sms_notification: 1,
                marketing_notification: 1,
                notification_permission: 1
            })

        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getActiveEmployees = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.find(query)
            .select('_id name is_employee')

        // Return the Userd list that was retured by the mongoose promise
        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users')
    }
}

exports.getEmployeesByService = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var users = await User.find(query).select('_id').select('name').select('is_employee');
        // Return the Userd list that was retured by the mongoose promise
        return users;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Users');
    }
}

exports.getUserById = async function (id) {
    try {
        // Find the User 
        var _details = await User.findOne({ _id: id })
            .select({ _id: 1, name: 1, email: 1, mobile: 1, is_international_number: 1, gender: 1, email_notification: 1, sms_notification: 1, marketing_notification: 1, notification_permission: 1, customer_badge: 1 })

        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        //throw Error("User not available");
        return 0;
    }
}

exports.getUser = async function (id) {
    try {
        // Find the User 
        var _details = await User.findOne({ _id: id })

        return _details
    } catch (e) {
        // return a Error message describing the reason     
        //throw Error("User not available")
        return 0
    }
}

exports.getUserOne = async function (query = {}) {
    try {
        // Find the User 
        var _details = await User.findOne(query)

        return _details || null
    } catch (e) {
        // return a Error message describing the reason
        return null
    }
}

exports.checkUserExist = async function (query) {
    try {
        // Find the User 
        var _details = await User.findOne(query)

        return _details
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("User not available")
    }
}

exports.getUserbyEmail = async function (email) {
    try {
        // Find the User 
        var _details = await User.findOne({ email: email, status: 1 });
        return _details;
    } catch (e) {
        console.log("e", e)
        // return a Error message describing the reason     
        throw Error("User not available");
    }
}

exports.getUserbyLocation = async function (query) {
    try {
        // Find the User 
        var _details = await User.findOne(query);
        return _details;
    } catch (e) {
        console.log("e", e)
        // return a Error message describing the reason     
        throw Error("User not available");
    }
}

exports.getCustomerData = async function (query, limit = 0) {
    try {
        // Find the User 
        var _details = await User.find(query).limit(limit)
        return _details
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("User not available")
    }
}

exports.getCustomerbyEmail = async function (query) {
    try {
        // Find the User 
        var _details = await User.find(query)
        return _details
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("User not available")
    }
}

// Update multiple users
exports.updateMultipleUsers = async function (query = {}, update) {
    try {
        return await User.updateMany(query, update)
    } catch (e) {
        // return an Error message describing the reason
        throw Error("Users not available")
    }
}

exports.createUser = async function (user) {
    if (user.photo) {
        var isImage = await ImageService.saveImage(user.photo, "/images/users/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            user.photo = isImage;
        }
    }

    if (user.first_name) {
        user.name = user.first_name;
    }

    if (user.first_name && user.last_name) {
        user.name = user.first_name + ' ' + user.last_name;
    }

    if (!user.email_notification || user.email_notification != 0) {
        user.email_notification = 1;
    }

    if (!user.sms_notification || user.sms_notification != 0) {
        user.sms_notification = 1;
    }

    if (!user.session_email_notification || user.session_email_notification != 0) {
        user.session_email_notification = 1;
    }

    if (!user.session_sms_notification || user.session_sms_notification != 0) {
        user.session_sms_notification = 1;
    }

    if (!user.marketing_notification || user.marketing_notification != 0) {
        user.marketing_notification = 1;
    }

    if (user.is_international_number) {
        user.sms_notification = 0;
        user.session_sms_notification = 0;
    }

    if (user.is_employee) {
        user.role_id = employeeRole;
    }

    if (user.is_customer) {
        if (user.location_id && (!user.locations || user.locations?.length == 0)) {
            var loc = []
            const locations = loc.push(user.location_id)
            user.locations = Array.from(new Set(loc)) //remove duplicate
            //user.location_id = ''
        }
    }

    var newUser = new User({
        company_id: user.company_id ? user.company_id : "",
        location_id: user.location_id ? user.location_id : "",
        locations: user.locations ? user.locations : [],
        first_name: user.first_name ? user.first_name : "",
        last_name: user.last_name ? user.last_name : "",
        name: user.name ? user.name : "",
        email: user.email ? user.email : "",
        personal_email: user.personal_email ? user.personal_email : "",
        mobile: user.mobile ? user.mobile : "",
        password: user.password ? bcrypt.hashSync(user.password, 8) : "",
        gender: user.gender ? user.gender : "",
        dob: user.dob ? user.dob : "",
        anniversary_date: user.anniversary_date ? user.anniversary_date : "",
        role_id: user.role_id ? user.role_id : employeeRole, //user role id
        photo: user.photo ? user.photo : "images/users/default-user.png",
        joining_date: user.joining_date ? user.joining_date : "",
        resignation_date: user.resignation_date ? user.resignation_date : "",
        relieving_date: user.relieving_date ? user.relieving_date : "",
        salary: user.salary ? user.salary : "",
        blood_group: user.blood_group ? user.blood_group : "",
        emergency_contact_person: user.emergency_contact_person ? user.emergency_contact_person : "",
        emergency_contact_number: user.emergency_contact_number ? user.emergency_contact_number : "",
        emergency_contact_person_relation: user.emergency_contact_person_relation ? user.emergency_contact_person_relation : "",
        services: user.salary ? user.salary : [],
        product_commission: user.product_commission ? user.product_commission : 0,
        service_commission: user.service_commission ? user.service_commission : 0,
        package_commission: user.package_commission ? user.package_commission : 0,
        status: user.status ? user.status : 1,
        is_employee: user.is_employee ? user.is_employee : 0,
        employee_priority: user.employee_priority ? user.employee_priority : 1,
        online_status: user.online_status ? user.online_status : 0,
        is_customer: user.is_customer ? user.is_customer : 0,
        customer_badge: user.customer_badge ? user.customer_badge : "",
        notification_permission: user.notification_permission ? user.notification_permission : 0,
        customer_heart: user.customer_heart ? user.customer_heart : 'normal',
        customer_icon: user.customer_icon ? user.customer_icon : '',
        email_notification: user.email_notification ? user.email_notification : 0,
        sms_notification: user.sms_notification ? user.sms_notification : 0,
        user_order: user.user_order ? user.user_order : 0,
        updated_by: user.updated_by ? user.updated_by : '',
        session_email_notification: user.session_email_notification ? user.session_email_notification : 0,
        session_sms_notification: user.session_sms_notification ? user.session_sms_notification : 0,
        marketing_notification: user.marketing_notification ? user.marketing_notification : 0,
        is_super_admin: user.is_super_admin ? user.is_super_admin : 0,
        forgot_password: user.forgot_password ? user.forgot_password : 0,
        is_international_number: user.is_international_number ? user.is_international_number : 0,
        is_blocked: user.is_blocked == 1 || user.is_blocked == 0 ? user.is_blocked : 0,
        reset_token: user.reset_token ? user.reset_token : "",
        code: user.code ? user.code : "",
        age: user.age ? user.age : 0
    })

    try {
        // Saving the User 
        var savedUser = await newUser.save();
        return savedUser;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating User")
    }
}

exports.updateUser = async function (user) {
    try {
        //Find the old User Object by the Id
        var id = user._id
        var oldUser = await User.findById(id)
    } catch (e) {
        //console.log(e)
        throw Error("Error occured while Finding the User")
    }
    // If no old User Object exists return false
    if (!oldUser) { return false }

    // Edit the User Object
    if (user.first_name) {
        oldUser.name = user.first_name
    }

    if (user.first_name && user.last_name) {
        oldUser.name = user.first_name + ' ' + user.last_name
    }

    if (user.company_id) {
        oldUser.company_id = user.company_id
    }

    if (user.location_id) {
        oldUser.location_id = user.location_id
    }

    if (user.locations) {
        oldUser.locations = user.locations
    }

    if (user.device_token) {
        oldUser.device_token = user.device_token
    }

    if (user.first_name) {
        oldUser.first_name = user.first_name
    }

    if (user.last_name) {
        oldUser.last_name = user.last_name
    }

    if (user.name) {
        oldUser.name = user.name
    }

    if (user.email) {
        oldUser.email = user.email ? user.email : ""
    }

    if (user.customer_heart) {
        oldUser.customer_heart = user.customer_heart ? user.customer_heart : "normal"
    }

    if (user.user_order || user.user_order == 0) {
        oldUser.user_order = user.user_order ? user.user_order : 0
    }

    if (user.mobile) {
        oldUser.mobile = user.mobile
    }

    if (user.password) {
        oldUser.password = bcrypt.hashSync(user.password, 8)
    }

    if (user.forgot_password == 1 || user.forgot_password == 0) {
        oldUser.forgot_password = user.forgot_password
    }

    if (user.personal_email) {
        oldUser.personal_email = user.personal_email
        oldUser.online_status = user.online_status ? user.online_status : 0
    }

    if (user.gender) {
        oldUser.gender = user.gender
    }

    if (user.dob) {
        oldUser.dob = user.dob
    }

    if (user.age) {
        oldUser.age = user.age
    }

    if (user.anniversary_date) {
        oldUser.anniversary_date = user.anniversary_date
    }

    if (user.joining_date) {
        oldUser.joining_date = user.joining_date
    }

    if (user.resignation_date) {
        oldUser.resignation_date = user.resignation_date
    }

    if (user.relieving_date) {
        oldUser.relieving_date = user.relieving_date
    }

    if (user.salary) {
        oldUser.salary = user.salary
    }

    if (user.blood_group) {
        oldUser.blood_group = user.blood_group
    }

    if (user.emergency_contact_person) {
        oldUser.emergency_contact_person = user.emergency_contact_person
    }

    if (user.emergency_contact_number) {
        oldUser.emergency_contact_number = user.emergency_contact_number
    }

    if (user.emergency_contact_person_relation) {
        oldUser.emergency_contact_person_relation = user.emergency_contact_person_relation
    }

    if (user.role_id) {
        oldUser.role_id = user.role_id
    }

    if (user.employee_priority) {
        oldUser.employee_priority = user.employee_priority ? user.employee_priority : 1
    }

    if (user.updated_by) {
        oldUser.updated_by = user.updated_by
    }

    if (user.is_employee) {
        oldUser.is_employee = user.is_employee
    }

    // if (user.is_customer && user.location_update  && user.locations) {
    //     var loc = oldUser.locations ? oldUser.locations : [];

    //     loc = loc.concat(user.locations);

    //     //loc = Array.prototype.concat(...loc);
    //     loc = loc.filter((item, pos) => loc.indexOf(item) === pos)
    //     oldUser.locations = loc;
    // }

    if (user.is_customer) {
        oldUser.is_customer = user.is_customer
        if (user.location_id) {
            var loc = oldUser.locations ? oldUser.locations : []
            const locations = loc.push(user.location_id)
            loc = Array.from(new Set(loc))
            if (loc && loc.length > 0) {
                oldUser.locations = loc //remove duplicate
                // oldUser.location_id = ''
            }
        }

        if (user.email || user.email == "") {
            oldUser.email = user?.email || ""
        }

        if (user.email_notification || Number(user.email_notification) == 0) {
            oldUser.email_notification = Number(user?.email_notification) || 0
        }

        if (user.sms_notification || Number(user.sms_notification) == 0) {
            oldUser.sms_notification = Number(user?.sms_notification) || 0
        }

        if (user.session_email_notification || Number(user.session_email_notification) == 0) {
            oldUser.session_email_notification = Number(user?.session_email_notification) || 0
        }

        if (user.session_sms_notification || Number(user.session_sms_notification) == 0) {
            oldUser.session_sms_notification = Number(user?.session_sms_notification) || 0
        }

        if (user.marketing_notification || Number(user.marketing_notification) == 0) {
            oldUser.marketing_notification = Number(user?.marketing_notification) || 0
        }
    }

    if (Number(user.is_international_number) == 1) {
        oldUser.sms_notification = 0
        oldUser.session_sms_notification = 0
    }



    if (user.is_international_number || Number(user.is_international_number) == 0) {
        oldUser.is_international_number = user.is_international_number
    }

    if (user.customer_icon || user.is_icon) {
        oldUser.customer_icon = user.customer_icon ? user.customer_icon : ""
    }

    if (user.update_permission) {
        oldUser.notification_permission = user.notification_permission ? user.notification_permission : 0
    }

    if (user.services) {
        oldUser.services = user.services;
    }

    if (user.product_commission) {
        oldUser.product_commission = user.product_commission
    }

    if (user.service_commission) {
        oldUser.service_commission = user.service_commission
    }

    if (user.package_commission) {
        oldUser.package_commission = user.package_commission
    }

    if (user.customer_badge) {
        oldUser.customer_badge = user.customer_badge
    }

    if (user.photo) {
        var isImage = await ImageService.saveImage(user.photo, "/images/users/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public')
            //Remove Previous User Image 
            try {
                var fs = require('fs')
                var filePath = root_path + "/" + oldUser.photo
                if (oldUser.photo && oldUser.photo != "images/users/default-user.png" && fs.existsSync(filePath)) {
                    console.log("\n file exists filePath  >>>>>>", filePath, "\n")
                    fs.unlinkSync(filePath)
                }
            } catch (e) {
                // console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n");
            }

            //Update User Image
            oldUser.photo = isImage
        }
    }

    if (user.is_blocked == 1 || Number(user.is_blocked) == 0) {
        oldUser.is_blocked = Number(user.is_blocked)
    }

    if (user.status == 1 || Number(user.status) == 0) {
        oldUser.status = user.status ? user.status : 0
    }

    if (user?.reset_token || user?.reset_token == "") {
        oldUser.reset_token = user.reset_token
    }

    if (user?.code || user?.code == "") {
        oldUser.code = user.code
    }

    try {
        var savedUser = await oldUser.save()
        return savedUser
    } catch (e) {
        throw Error("And Error occured while updating the User")
    }
}

exports.deleteUser = async function (id) {
    // Delete the User
    try {
        var deleted = await User.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("User Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the User")
    }
}

exports.checkUserPassword = async function (user) {
    // Creating a new Mongoose Object by using the new keyword
    try {
        // Find the User 
        var _details = await User.findOne({ _id: user._id })
            .select("+password")
        var passwordIsValid = bcrypt.compareSync(user?.old_password, _details?.password)
        if (!passwordIsValid) return null

        return _details
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Check User Password")
    }
}

exports.loginUser = async function (query, password) {
    // Creating a new Mongoose Object by using the new keyword
    try {
        // Find the User 
        var _details = await User.findOne(query)
            .select("+password")

        var passwordIsValid = bcrypt.compareSync(password, _details.password)
        if (!passwordIsValid) throw Error("Invalid username/password")
        return _details
    } catch (e) {
        console.log("loginUser catch >>> ", e)
        // return a Error message describing the reason     
        throw Error("Error while Login User")
    }
}

exports.activeUserStatus = async function (query) {
    try {
        // Find the Data and replace booking status
        var users = await User.updateMany(query, { $set: { status: 1 } })

        return users;

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Appointment not available");
    }
}

exports.updateManyStatus = async function (query) {
    try {
        // Find the Data and replace booking status
        var users = await User.updateMany(query, { $set: { status: 0 } })

        return users;

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Appointment not available");
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await User.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the User")
    }
}

// This is only for dropdown
exports.getUsersDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var users = await User.find(query)
            .select("_id first_name last_name name email mobile gender dob age photo customer_heart customer_icon customer_badge")
            .sort(sorts)

        return users
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown users')
    }
}
