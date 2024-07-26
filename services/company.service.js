// Gettign the Newly created Mongoose Model we just created 
var Company = require('../models/Company.model');
var ImageService = require('./image.service');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Company List
exports.getCompanies = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var companies = await Company.paginate(query, options)

        //await Company.createIndex( { name: "text",email: "text",contact_number: "text" } );
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

        const companies = await Company.aggregate(facetedPipeline);

        //var companies = await Company.find({ $text: { $search: "app.com" } } ).sort({ order_name: order}).skip(page).limit(limit); //-1 for descending and 1 for ascending 
        //let countTotal = await Company.find(query).count() // returns 10-- will not take `skip` or `limit` into consideration
        //let countWithConstraints = await query.count(true) // returns 5 -- will take into consideration `skip` and `limit`
        //var companies =  { companies, countTotal } 

        // Return the Companyd list that was retured by the mongoose promise
        return companies;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Companies');
    }
}

exports.getCompaniesOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1);
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var companies = await Company.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit);

        return companies;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Companies');
    }
}

exports.getCompanySmtpDetail = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var company = await Company.findOne(query)
            .select("id name +smtp_from +smtp_host +smtp_port +smtp_username +smtp_password");

        // Return the Serviced list that was retured by the mongoose promise
        return company;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting Company');
    }
}

exports.getActiveCompanies = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var companies = await Company.find(query);

        // Return the Companyd list that was retured by the mongoose promise
        return companies;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Companies');
    }
}

exports.getCompany = async function (id) {
    try {
        // Find the User 
        var _details = await Company.findOne({ _id: id });

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        return null;
        // throw Error("Company not available")
    }
}

exports.getCompanyOne = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        // Find the User 
        var _details = await Company.findOne(query)
            .sort(sorts);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        return null;
    }
}

exports.getCompanyByDomain = async function (domain) {
    try {
        var _details = await Company.findOne({ domain: domain });

        return _details || false;
    } catch (e) {
        // return a Error message describing the reason     
        //throw Error("Company not available")
        return false;
    }
}

exports.getComanyByDomain = async function (query) {
    try {
        var _details = await Company.findOne(query);

        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Organization not available");
    }
}

exports.getComanyMultipleSmtpDetail = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var _details = await Company.findOne(query)
            .select("id name country_code smtp_setting marketing_sms_setting whatsapp_setting sendapp_setting +smtp_from +smtp_host +smtp_port +smtp_username +smtp_password")

        // Return the Serviced list that was retured by the mongoose promise
        return _details
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting Location')
    }
}

exports.createCompany = async function (company) {
    if (company.image) {
        var isImage = await ImageService.saveImage(company.image, "/images/company/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            company.image = isImage;
        }
    }

    if (company.brochure_background_image) {
        var isImage = await ImageService.saveImage(company.brochure_background_image, "/images/company/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            company.brochure_background_image = isImage;
        }
    }

    if (company.brochure_image) {
        var isImage = await ImageService.saveImage(company.brochure_image, "/images/company/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            company.brochure_image = isImage;
        }
    }

    var newCompany = new Company({
        user_id: company.user_id ? company.user_id : "",
        name: company.name,
        email: company.email,
        contact_number: company.contact_number ? company.contact_number : "",
        domain: company.domain ? company.domain : "",
        image: company.image ? company.image : "",
        contact_link: company.contact_link ? company.contact_link : "",
        brochure_footer: company.brochure_footer ? company.brochure_footer : "",
        status: company.status ? company.status : 1,
        brochure_image: company.brochure_image ? company.brochure_image : "",
        brochure_background_image: company.brochure_background_image ? company.brochure_background_image : "",
        brochure_background_color: company.brochure_background_color ? company.brochure_background_color : "",
        brochure_heading_color: company.brochure_heading_color ? company.brochure_heading_color : "",
        brochure_font_color: company.brochure_font_color ? company.brochure_font_color : "",
        pixel_code: company.pixel_code ? company.pixel_code : "",
        currency: company.currency ? company.currency : {},
        country_code: company.country_code ? company.country_code : 0,
        booking_text: company.booking_text ? company.booking_text : "",
        appopintgem_api_key: company.appopintgem_api_key ? company.appopintgem_api_key : "",
        whatsapp_access_token: company.whatsapp_access_token ? company.whatsapp_access_token : "",
        smtp_from: company.smtp_from ? company.smtp_from : "",
        smtp_host: company.smtp_host ? company.smtp_host : "",
        smtp_port: company.smtp_port ? company.smtp_port : 0,
        smtp_username: company.smtp_username ? company.smtp_username : "",
        smtp_password: company.smtp_password ? company.smtp_password : "",
        prefix: company.prefix ? company.prefix : "",
        paypal_client_id: company.paypal_client_id ? company.paypal_client_id : "",
        paypal_client_secret: company.paypal_client_secret ? company.paypal_client_secret : "",
        gift_card_setting_level: company.gift_card_setting_level ? company.gift_card_setting_level : "",
        gift_card_delivery_charge: company.gift_card_delivery_charge ? company.gift_card_delivery_charge : 0,
        gift_card_terms_condition: company.gift_card_terms_condition ? company.gift_card_terms_condition : "",
        smtp_setting: company.smtp_setting ? company.smtp_setting : [],
        marketing_sms_setting: company.marketing_sms_setting ? company.marketing_sms_setting : "",
        whatsapp_setting: company.whatsapp_setting ? company.whatsapp_setting : [],
        twilio_setting: company.twilio_setting ? company.twilio_setting : [],
        sendapp_setting: company.sendapp_setting ? company.sendapp_setting : [],
        show_to_customer: company.show_to_customer ? company.show_to_customer : 0,
    })

    try {
        // Saving the Company 
        var savedCompany = await newCompany.save();
        return savedCompany;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Company");
    }
}

exports.updateCompany = async function (company) {
    try {
        var id = company._id;
        //Find the old Company Object by the Id
        var oldCompany = await Company.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Company");
    }

    // If no old Company Object exists return false
    if (!oldCompany) { return false; }

    //Edit the Company Object
    if (company.user_id) {
        oldCompany.user_id = company.user_id;
    }

    if (company.name) {
        oldCompany.name = company.name;
    }

    if (company.email) {
        oldCompany.email = company.email;
    }

    if (company.contact_number) {
        oldCompany.contact_number = company.contact_number;
    }

    if (company.domain) {
        oldCompany.domain = company.domain;
    }

    if (company.currency) {
        oldCompany.currency = company.currency;
    }

    if (company.country_code) {
        oldCompany.country_code = company.country_code;
    }

    if (company?.brochure_footer || company.brochure_footer == "") {
        oldCompany.brochure_footer = company.brochure_footer ? company.brochure_footer : "";
    }

    if (company?.contact_link || company.contact_link == "") {
        oldCompany.contact_link = company.contact_link ? company.contact_link : "";
    }

    if (company?.brochure_background_color || company.brochure_background_color == "") {
        oldCompany.brochure_background_color = company.brochure_background_color ? company.brochure_background_color : "";
    }

    if (company?.brochure_heading_color || company.brochure_heading_color == "") {
        oldCompany.brochure_heading_color = company.brochure_heading_color ? company.brochure_heading_color : "";
    }

    if (company?.brochure_font_color || company.brochure_font_color == "") {
        oldCompany.brochure_font_color = company.brochure_font_color ? company.brochure_font_color : "";
    }

    if (company?.pixel_code || company.pixel_code == "") {
        oldCompany.pixel_code = company.pixel_code ? company.pixel_code : "";
    }

    if (company?.booking_text || company.booking_text == "") {
        oldCompany.booking_text = company.booking_text ? company.booking_text : "";
    }

    if (company?.status || company.status == 0) {
        oldCompany.status = company.status ? company.status : 0;
    }

    if (company?.show_to_customer || company.show_to_customer == 0) {
        oldCompany.show_to_customer = company.show_to_customer ? company.show_to_customer : 0;
    }

    if (company.image) {
        var isImage = await ImageService.saveImage(company.image, "/images/company/").then(data => { return data })
        if (typeof (isImage) != undefined && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldCompany.image;
                if (oldCompany.image && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                //console.log(e)
            }

            oldCompany.image = isImage;
        }
    }

    if (company.brochure_image) {
        var isImage = await ImageService.saveImage(company.brochure_image, "/images/company/").then(data => { return data })
        if (typeof (isImage) != undefined && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldCompany.brochure_image;
                if (oldCompany.brochure_image && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                //console.log(e)
            }

            oldCompany.brochure_image = isImage;
        }
    }

    if (company.brochure_background_image) {
        var isImage = await ImageService.saveImage(company.brochure_background_image, "/images/company/").then(data => { return data })
        if (typeof (isImage) != undefined && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldCompany.brochure_background_image;
                if (oldCompany.brochure_background_image && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                //console.log(e)
            }

            oldCompany.brochure_background_image = isImage;
        }
    }

    if (company?.appopintgem_api_key || company.appopintgem_api_key == "") {
        oldCompany.appopintgem_api_key = company.appopintgem_api_key;
    }

    if (company?.whatsapp_access_token || company.whatsapp_access_token == "") {
        oldCompany.whatsapp_access_token = company.whatsapp_access_token;
    }

    if (company?.smtp_from || company.smtp_from == "") {
        oldCompany.smtp_from = company.smtp_from;
    }

    if (company?.smtp_host || company.smtp_host == "") {
        oldCompany.smtp_host = company.smtp_host;
    }

    if (company?.smtp_port || company.smtp_port == "") {
        oldCompany.smtp_port = company.smtp_port;
    }

    if (company?.smtp_username || company.smtp_username == "") {
        oldCompany.smtp_username = company.smtp_username;
    }

    if (company?.smtp_password || company.smtp_password == "") {
        oldCompany.smtp_password = company.smtp_password;
    }

    if (company?.prefix || company.prefix == "") {
        oldCompany.prefix = company.prefix;
    }

    if (company?.paypal_client_id || company.paypal_client_id == "") {
        oldCompany.paypal_client_id = company.paypal_client_id;
    }

    if (company?.paypal_client_secret || company.paypal_client_secret == "") {
        oldCompany.paypal_client_secret = company.paypal_client_secret;
    }

    if (company?.gift_card_setting_level) {
        oldCompany.gift_card_setting_level = company.gift_card_setting_level;
    }

    if (company?.gift_card_delivery_charge || company.gift_card_delivery_charge == 0) {
        oldCompany.gift_card_delivery_charge = company.gift_card_delivery_charge;
    }

    if (company?.gift_card_terms_condition || company.gift_card_terms_condition == "") {
        oldCompany.gift_card_terms_condition = company.gift_card_terms_condition;
    }

    if (company?.marketing_sms_setting || company.marketing_sms_setting == "") {
        oldCompany.marketing_sms_setting = company.marketing_sms_setting
    }

    if (company.smtp_setting) {
        oldCompany.smtp_setting = company.smtp_setting;
    }
    if (company.whatsapp_setting) {
        oldCompany.whatsapp_setting = company.whatsapp_setting;
    }
    if (company.twilio_setting) {
        oldCompany.twilio_setting = company.twilio_setting;
    }
    if (company.sendapp_setting) {
        oldCompany.sendapp_setting = company.sendapp_setting;
    }

    try {
        var savedCompany = await oldCompany.save();
        return savedCompany;
    } catch (e) {
        throw Error("And Error occured while updating the Company");
    }
}

exports.deleteCompany = async function (id) {
    // Delete the Company
    try {
        var deleted = await Company.remove({ _id: id });
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Company Could not be deleted")
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Company");
    }
}

// Update multiple Companies
exports.updateMultipleCompanies = async function (query = {}, update) {
    try {
        return await Company.updateMany(query, update);
    } catch (e) {
        // return an Error message describing the reason
        throw Error("Companies not available");
    }
}
