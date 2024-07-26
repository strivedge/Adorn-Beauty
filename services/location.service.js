// Gettign the Newly created Mongoose Model we just created
var Company = require('../models/Company.model')
var Location = require('../models/Location.model')
var LocationTiming = require('../models/LocationTiming.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Location List
exports.getLocations = async function (query, page, limit, order_name, order) {
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

        var locations = await Location.aggregate(facetedPipeline);

        // Return the Locationd list that was retured by the mongoose promise
        return locations;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Locations');
    }
}

exports.getLocationsOne = async function (query = {}, sort_field = "", sort_type = "-1") {
    // Try Catch the awaited promise to handle the error 
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var locations = await Location.find(query)
            .populate({
                path: 'company_id',
                model: Company,
                select: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    image: 1,
                    currency: 1
                }
            })
            .sort(sorts);

        // Return the Locationd list that was retured by the mongoose promise
        return locations;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Locations');
    }
}

exports.getLocationsOneHidden = async function (query = {}, sort_field = "", sort_type = "-1") {
    // Try Catch the awaited promise to handle the error 
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var locations = await Location.find(query)
            .populate({
                path: 'company_id',
                model: Company,
                select: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    image: 1,
                    currency: 1,
                    country_code: 1,
                    appopintgem_api_key: 1,
                    whatsapp_access_token: 1
                }
            })
            .select("+paypal_client_secret +twilio_acc_sid +twilio_auth_token +twilio_phone_number +whatsapp_instance_id")
            .sort(sorts);

        // Return the Locationd list that was retured by the mongoose promise
        return locations;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Locations');
    }
}

exports.getActiveLocations = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var locations = await Location.find(query);

        var locations = await Location.aggregate([
            {
                $project: {
                    _id: 1,
                    // _id : {
                    //     $toObjectId : "$_id"
                    // },
                    status: 1,
                    contact_number: 1,
                    pixel_code: 1,
                    user_id: 1,
                    role_id: 1,
                    company_id: 1,
                    name: 1,
                    contact_name: 1,
                    contact_1: 1,
                    email: 1,
                    full_address: 1,
                    latitude: 1,
                    longitude: 1,
                    admin_status: 1,
                    online_status: 1,
                    group_close_days: 1,
                    group_special_hours: 1,
                    paypal_client_id: 1,
                    company_name: 1,
                    special_hour: 1,
                    domain: 1,
                    currency: 1,
                    country_code: 1,
                    sms_setting: 1,
                    company_id: {
                        $toObjectId: "$company_id"
                    }
                }
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company_data'
                }
            },
            //{ $unwind : "$company_data"},
            { $match: query },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    name: 1,
                    contact_number: 1,
                    user_id: 1,
                    role_id: 1,
                    contact_name: 1,
                    contact_1: 1,
                    email: 1,
                    full_address: 1,
                    latitude: 1,
                    longitude: 1,
                    status: 1,
                    admin_status: 1,
                    online_status: 1,
                    group_close_days: 1,
                    group_special_hours: 1,
                    paypal_client_id: 1,
                    paypal_client_secret: 1,
                    company_name: 1,
                    special_hour: 1,
                    domain: 1,
                    twilio_acc_sid: 1,
                    twilio_auth_token: 1,
                    twilio_phone_number: 1,
                    whatsapp_instance_id: 1,
                    sms_setting: 1,
                    comapny_name: "$company_data.name",
                    comapny_contact_number: "$company_data.contact_number",
                    comapny_domain: "$company_data.domain",
                    comapny_logo: "$company_data.image",
                    pixel_code: "$company_data.pixel_code",
                    currency: "$company_data.currency",
                    country_code: "$company_data.country_code",
                }
            }
        ]);

        // Return the Serviced list that was retured by the mongoose promise
        return locations;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Location');
    }
}

exports.getAllActiveLocations = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var locations = await Location.find(query);

        // Return the Categoryd list that was retured by the mongoose promise
        return locations;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Finding Locations');
    }
}

exports.createMultipleLocations = async function (data) {
    try {
        // Find the Data 
        var _details = await Location.insertMany(data);
        return _details;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating Location");
    }
}

// only for Notification Location Name
exports.getLocationSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var locations = await Location.find(query)
            .select({ '_id': 1, 'name': 1 })

        // Return the Serviced list that was retured by the mongoose promise
        return locations
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting Location')
    }
}

// only for Smtp Location detail
exports.getLocationCompanySmtpDetail = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var locations = await Location.findOne(query)
            .populate({
                path: 'company_id',
                model: Company,
                select: "_id name +smtp_from +smtp_host +smtp_port +smtp_username +smtp_password"
            }).select("id name +smtp_from +smtp_host +smtp_port +smtp_username +smtp_password")

        // Return the Serviced list that was retured by the mongoose promise
        return locations
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting Location')
    }
}

exports.getLocationMultipleSmtpDetail = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var location = await Location.findOne(query)
            .populate({
                path: 'company_id',
                model: Company,
                select: {
                    _id: 1,
                    currency: 1,
                    country_code: 1
                }
            })
            .select("id name smtp_setting marketing_sms_setting whatsapp_setting sendapp_setting twilio_setting")

        // Return the Serviced list that was retured by the mongoose promise
        return location
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting Location')
    }
}

// only for Notification Location Name
exports.getLocationName = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var locations = await Location.findOne(query)
            .select({ '_id': 1, 'name': 1, 'company_id': 1 })

        // Return the Serviced list that was retured by the mongoose promise
        return locations
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Location')
    }
}

exports.getLocationComapany = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var locations = await Location.aggregate([
            {
                $project: {
                    _id: 1,
                    // _id : {
                    //     $toObjectId : "$_id"
                    // },
                    company_id: 1,
                    name: 1,
                    domain: 1,
                    status: 1,
                    contact_number: 1,
                    sms_setting: 1,
                    pixel_code: 1,
                    setup_steps: 1,
                    company_id: {
                        $toObjectId: "$company_id"
                    }
                }
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company_data'
                }
            },
            { $unwind: "$company_data" },
            { $match: query },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    name: 1,
                    domain: 1,
                    status: 1,
                    contact_number: 1,
                    sms_setting: 1,
                    setup_steps: 1,
                    comapny_name: "$company_data.name",
                    comapny_contact_number: "$company_data.contact_number",
                    comapny_domain: "$company_data.domain",
                    contact_link: "$company_data.contact_link",
                    comapny_logo: "$company_data.image",
                    pixel_code: "$company_data.pixel_code",
                    currency: "$company_data.currency",
                    country_code: "$company_data.country_code",
                }
            }
        ]);

        return locations;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Location');
    }
}

// only for company copy
exports.getLocationCompanySpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var locations = await Location.find(query)

        // Return the Serviced list that was retured by the mongoose promise
        return locations
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Location')
    }
}

exports.getLocation = async function (id) {
    try {
        // Find the Data 
        var _details = await Location.findOne({ _id: id })
            .select("+paypal_client_secret +twilio_acc_sid +twilio_auth_token +twilio_phone_number +whatsapp_access_token +whatsapp_instance_id +appopintgem_api_key +smtp_from +smtp_host +smtp_port +smtp_username +smtp_password +smtp_setting.from +smtp_setting.host +smtp_setting.port  +smtp_setting.password +smtp_setting.username +whatsapp_setting.access_token +whatsapp_setting.instance_id +twilio_setting.twilio_acc_sid +twilio_setting.twilio_auth_token +twilio_setting.twilio_phone_number +sendapp_setting.appopintgem_api_key +sendapp_setting.appointmentgem_number")

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason
        return null;
        // throw Error("Location not available");
    }
}

exports.getLocationOne = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await Location.findOne(query)
            .populate({
                path: 'company_id',
                model: Company,
                select: {
                    _id: 1,
                    name: 1,
                    contact_number: 1,
                    domain: 1,
                    contact_link: 1,
                    pixel_code: 1,
                    currency: 1,
                    country_code: 1
                }
            });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason
        return null;
        // throw Error("Location not available")
    }
}

exports.getLocationOneHidden = async function (id) {
    try {
        // Find the Data 
        var _details = await Location.findOne({ _id: id })
            .populate({
                path: 'company_id',
                model: Company,
                select: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    country_code: 1,
                    appopintgem_api_key: 1,
                    whatsapp_access_token: 1
                }
            })
            .select("+paypal_client_secret +twilio_acc_sid +twilio_auth_token +twilio_phone_number sms_setting marketing_sms_setting +whatsapp_instance_id +whatsapp_access_token appointmentgem_number +appopintgem_api_key");

        return _details;
    } catch (e) {
        // return a Error message describing the reason
        return null;
        // throw Error("Location not available")
    }
}

exports.getLocationSettings = async function (id) {
    try {
        // Find the Data 
        var _details = await Location.findOne({ _id: id })
            .select("+paypal_client_secret +twilio_acc_sid +twilio_auth_token +twilio_phone_number +whatsapp_instance_id +whatsapp_access_token appointmentgem_number +appopintgem_api_key");

        return _details;
    } catch (e) {
        // return a Error message describing the reason
        return null;
        // throw Error("Location not available")
    }
}

exports.createLocation = async function (location) {
    if (location.name) {
        var sub_domain_name = location.name.toLowerCase();
        sub_domain_name = sub_domain_name.split(' ').join('');
        location.domain = sub_domain_name.replace(/[- )(]/g, '');
    }

    var newLocation = new Location({
        user_id: location.user_id ? location.user_id : "",
        role_id: location.role_id ? location.role_id : "",
        company_id: location.company_id ? location.company_id : "",
        name: location.name ? location.name : "",
        contact_name: location.contact_name ? location.contact_name : "",
        contact_number: location.contact_number ? location.contact_number : "",
        email: location.email ? location.email : "",
        full_address: location.full_address ? location.full_address : "",
        latitude: location.latitude ? location.latitude : "",
        longitude: location.longitude ? location.longitude : "",
        admin_status: location.admin_status ? location.admin_status : 0,
        online_status: location.online_status ? location.online_status : 0,
        group_close_days: location.group_close_days ? location.group_close_days : [],
        group_special_hours: location.group_special_hours ? location.group_special_hours : [],
        status: location.status ? location.status : 1,
        paypal_client_id: location.paypal_client_id ? location.paypal_client_id : "",
        paypal_client_secret: location.paypal_client_secret ? location.paypal_client_secret : "",
        domain: location.domain ? location.domain : "",
        twilio_acc_sid: location.twilio_acc_sid ? location.twilio_acc_sid : "",
        twilio_auth_token: location.twilio_auth_token ? location.twilio_auth_token : "",
        twilio_phone_number: location.twilio_phone_number ? location.twilio_phone_number : "",
        appopintgem_api_key: location.appopintgem_api_key ? location.appopintgem_api_key : "",
        appointmentgem_number: location.appointmentgem_number ? location.appointmentgem_number : "",
        sms_setting: location.sms_setting ? location.sms_setting : "",
        whatsapp_instance_id: location.whatsapp_instance_id ? location.whatsapp_instance_id : "",
        smtp_from: location.smtp_from ? location.smtp_from : "",
        smtp_host: location.smtp_host ? location.smtp_host : "",
        smtp_port: location.smtp_port ? location.smtp_port : 0,
        smtp_username: location.smtp_username ? location.smtp_username : "",
        smtp_password: location.smtp_password ? location.smtp_password : "",
        smtp_setting: location.smtp_setting ? location.smtp_setting : [],
        marketing_sms_setting: location.marketing_sms_setting ? location.marketing_sms_setting : "",
        whatsapp_setting: location.whatsapp_setting ? location.whatsapp_setting : [],
        twilio_setting: location.twilio_setting ? location.twilio_setting : [],
        sendapp_setting: location.sendapp_setting ? location.sendapp_setting : [],
        soft_delete: 0,
        is_default_data: location.is_default_data ? location.is_default_data : 0,
        setup_steps: location.setup_steps ?? 1,
        prefix: location.prefix ? location.prefix : "",
        gift_card_delivery_charge: location.gift_card_delivery_charge ? location.gift_card_delivery_charge : "",
        gift_card_terms_condition: location.gift_card_terms_condition ? location.gift_card_terms_condition : ""
    });

    try {
        // Saving the Location 
        var savedLocation = await newLocation.save();
        return savedLocation;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Location");
    }
}

exports.updateLocation = async function (location) {
    var id = location._id
    // console.log("location ",location)
    try {
        //Find the old Location Object by the Id
        var oldLocation = await Location.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Location")
    }
    // If no old Location Object exists return false
    if (!oldLocation) {
        return false;
    }

    //Edit the Location Object
    // oldLocation.name = location.name

    if (location.company_id) {
        oldLocation.company_id = location.company_id;
    }

    if (location.user_id) {
        oldLocation.user_id = location.user_id;
    }

    if (location.is_default_data) {
        oldLocation.is_default_data = location.is_default_data;
    }

    if (location.setup_steps) {
        oldLocation.setup_steps = location.setup_steps;
    }

    if (location.name) {
        oldLocation.name = location.name;
        // oldLocation.admin_status = location.admin_status ? location.admin_status : 0
        // oldLocation.online_status = location.online_status ? location.online_status : 0;
        // oldLocation.status = location.status ? location.status : 0;

        var sub_domain_name = location.name.toLowerCase();
        sub_domain_name = sub_domain_name.split(' ').join('');
        oldLocation.domain = sub_domain_name.replace(/[- )(]/g, '');
    }

    if (location.admin_status == 1 || location.admin_status == 0) {
        oldLocation.admin_status = location.admin_status;
    }

    if (location.online_status == 1 || location.online_status == 0) {
        oldLocation.online_status = location.online_status;
    }

    if (location.status == 1 || location.status == 0) {
        oldLocation.status = location.status;
    }

    if (location.contact_name) {
        oldLocation.contact_name = location.contact_name;
    }

    if (location.contact_number) {
        oldLocation.contact_number = location.contact_number;
    }

    if (location.email) {
        oldLocation.email = location.email;
    }

    if (location.full_address) {
        oldLocation.full_address = location.full_address;
    }

    if (location.latitude) {
        oldLocation.latitude = location.latitude;
    }

    if (location.longitude) {
        oldLocation.longitude = location.longitude;
    }

    if (location.role_id) {
        oldLocation.role_id = location.role_id;
    }

    if (location.status) {
        oldLocation.status = location.status;
    }

    if (location.group_close_days) {
        oldLocation.group_close_days = location.group_close_days;
    }

    if (location.group_special_hours) {
        oldLocation.group_special_hours = location.group_special_hours;
    }

    if (location?.paypal_client_id || location.paypal_client_id == "") {
        oldLocation.paypal_client_id = location.paypal_client_id
    }

    if (location?.paypal_client_secret || location.paypal_client_secret == "") {
        oldLocation.paypal_client_secret = location.paypal_client_secret
    }

    if (location?.twilio_acc_sid || location.twilio_acc_sid == "") {
        oldLocation.twilio_acc_sid = location.twilio_acc_sid
    }
    if (location?.twilio_auth_token || location.twilio_auth_token == "") {
        oldLocation.twilio_auth_token = location.twilio_auth_token
    }
    if (location?.twilio_phone_number || location.twilio_phone_number == "") {
        oldLocation.twilio_phone_number = location.twilio_phone_number
    }
    if (location?.appointmentgem_number || location.appointmentgem_number == "") {
        oldLocation.appointmentgem_number = location.appointmentgem_number
    }
    if (location?.sms_setting || location.sms_setting == "") {
        oldLocation.sms_setting = location.sms_setting
    }

    if (location?.smtp_from || location.smtp_from == "") {
        oldLocation.smtp_from = location.smtp_from ? location.smtp_from : "";
    }
    if (location?.smtp_host || location.smtp_host == "") {
        oldLocation.smtp_host = location.smtp_host ? location.smtp_host : "";
    }
    if (location?.smtp_port || location.smtp_port == "") {
        oldLocation.smtp_port = location.smtp_port ? location.smtp_port : 0;
    }
    if (location?.smtp_username || location.smtp_username == "") {
        oldLocation.smtp_username = location.smtp_username ? location.smtp_username : "";
    }
    if (location?.smtp_password || location.smtp_password == "") {
        oldLocation.smtp_password = location.smtp_password ? location.smtp_password : "";
    }

    if (location?.marketing_sms_setting || location.marketing_sms_setting == "") {
        oldLocation.marketing_sms_setting = location.marketing_sms_setting
    }

    if (location?.appopintgem_api_key || location.appopintgem_api_key == "") {
        oldLocation.appopintgem_api_key = location.appopintgem_api_key
    }

    if (location?.whatsapp_access_token || location.whatsapp_access_token == "") {
        oldLocation.whatsapp_access_token = location.whatsapp_access_token
    }

    if (location?.whatsapp_instance_id || location.whatsapp_instance_id == "") {
        oldLocation.whatsapp_instance_id = location.whatsapp_instance_id
    }

    if (location.smtp_setting) {
        oldLocation.smtp_setting = location.smtp_setting;
    }
    if (location.whatsapp_setting) {
        oldLocation.whatsapp_setting = location.whatsapp_setting;
    }
    if (location.twilio_setting) {
        oldLocation.twilio_setting = location.twilio_setting;
    }
    if (location.sendapp_setting) {
        oldLocation.sendapp_setting = location.sendapp_setting;
    }

    if (location?.prefix || location.prefix == "") {
        oldLocation.prefix = location?.prefix || "";
    }

    if (location?.gift_card_delivery_charge || location.gift_card_delivery_charge == "") {
        oldLocation.gift_card_delivery_charge = location?.gift_card_delivery_charge || "";
    }

    if (location?.gift_card_terms_condition || location.gift_card_terms_condition == "") {
        oldLocation.gift_card_terms_condition = location?.gift_card_terms_condition || "";
    }

    try {
        var savedLocation = await oldLocation.save()
        return savedLocation;
    } catch (e) {
        throw Error("And Error occured while updating the Location");
    }
}

exports.updateLocationfields = async function (query, params) {
    // Delete the Location
    try {
        var update = await Location.update(query, params)
        return update;
    } catch (e) {
        throw Error("Error Occured while Deleting the Location")
    }
}

exports.softDeleteLocation = async function (query) {
    // Delete the Location
    try {
        var update = await Location.update(query, { soft_delete: true, status: 0 })
        return update;
    } catch (e) {
        throw Error("Error Occured while Deleting the Location")
    }
}

exports.deleteLocation = async function (id) {
    // Delete the Location
    try {
        var deleted = await Location.remove({ _id: id });
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Location Could not be deleted")
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Location")
    }
}

exports.getLocationByName = async function (query) {
    try {
        // Find the Data 
        var _details = await Location.findOne(query);

        return _details;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Location not available");
    }
}

// Update multiple Locations
exports.updateMultipleLocations = async function (query = {}, update) {
    try {
        return await Location.updateMany(query, update)
    } catch (e) {
        // return an Error message describing the reason
        throw Error("Locations not available")
    }
}
