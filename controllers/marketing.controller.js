var fs = require('fs')
var Hogan = require('hogan.js')
var ObjectId = require('mongodb').ObjectId

var MarketingService = require('../services/marketing.service');
var UserService = require('../services/user.service');
var CustomerService = require('../services/customer.service')
var LocationService = require('../services/location.service');
var SendMailService = require('../services/sendMail.service');
var SmslogService = require('../services/smslog.service');
var SendEmailSmsService = require('../services/sendEmailSms.service');
var WhatsAppLogService = require('../services/whatsAppLog.service')
var EmailLogService = require('../services/emailLog.service')

const { increaseDateDays } = require('../helper')

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getMarketings = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var serachText = req.query.serachText ? req.query.serachText : '';

    var query = { status: 1 };
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    try {
        var marketings = await MarketingService.getMarketings(query, parseInt(page), parseInt(limit), order_name, Number(order), serachText);

        var marketing = marketings[0].data;
        for (var i = 0; i < marketing.length; i++) {
            var client_query = {};
            client_query['_id'] = { $in: marketing[i].customer_arr };
            var customers = await CustomerService.getClients(client_query);
            marketing[i].customer_arr = customers; //with name
        }
        marketings[0].data = marketing;

        // Return the Marketing list with the appropriate  Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: marketings, message: "Successfully Marketing Email Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getMarketing = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Marketing = await MarketingService.getMarketing(id)
        // Return the Marketing list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Marketing, message: "Successfully Offer Email Template Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getSpecificMarketing = async function (req, res, next) {
    var query = {};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.status && req.query.status == 1) {
        query['status'] = 1;
    }

    try {
        var Marketing = await MarketingService.getSpecificMarketing(query)
        // Return the Marketing list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Marketing, message: "Successfully Marketing Email Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createMarketing = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var marketing = await MarketingService.createMarketing(req.body);

        var customers = [];
        if (marketing.all_customer && marketing.all_customer == 1) {
            var cust_query = { location_ids: { $elemMatch: { $eq: marketing.location_id } } };
            customers = await CustomerService.getCustomersSpecific(cust_query);

        } else if (marketing && marketing.customer_arr.length > 0) {
            var cust_query = { _id: { $in: marketing.customer_arr } };
            customers = await CustomerService.getCustomersSpecific(cust_query);
        }

        if (customers && customers.length > 0) {

            var loc_query = { _id: ObjectId(req.body.location_id.toString()) };

            var location = await LocationService.getLocationComapany(loc_query);

            var booking_url = process.env.SITE_URL + "/booking";

            var toMail = {};
            toMail['client_name'] = "Client";
            toMail['site_url'] = process.env.API_URL;
            toMail['link_url'] = process.env.SITE_URL;
            toMail['location_name'] = location[0].name;
            toMail['company_website'] = "";
            toMail['company_name'] = location[0].comapny_name;
            toMail['booking_url'] = booking_url;
            toMail['company_website'] = location[0].contact_link;

            var email_template = {};
            var sub = marketing.email_subject;

            marketing.email_template = marketing.email_template.replace('{marketing_id}', marketing._id);

            html = marketing.email_template;

            var maillist = [];

            var temFile = "marketing_mail.hjs";
            var subject = sub ? sub : email_template.email_subject;

            if (customers.length > 0) {

                for (var c = 0; c < customers.length; c++) {
                    if (customers[c].marketing_notification != 0 && customers[c].email && customers[c].email != '' && customers[c].email_notification != 0) {
                        maillist.push(customers[c].email);
                        toMail['client_id'] = customers[c]._id;
                        toMail['client_name'] = customers[c].name;
                        var name = customers[c].name;
                        var to = customers[c].email;
                    }

                    if (customers[c].marketing_notification != 0 && customers[c].mobile && customers[c].mobile != '' && customers[c].sms_notification != 0 && marketing.sms_notification) {

                        var msg = "New offer is available at " + location[0].comapny_name + " " + location[0].name + ". To book an appointment, Please visit " + booking_url;

                        var number = customers[c].mobile;
                        number = parseInt(number, 10);
                        var country_code = location.legth ? location[0].country_code : 44;
                        var params = {
                            Message: msg,
                            PhoneNumber: '+' + country_code + number,
                        }

                        var numSegments = 1
                        var smsData = {
                            company_id: location[0].company_id,
                            location_id: location[0]._id,
                            client_id: customers[c]._id,
                            type: "cron",
                            sms_type: "marketing",
                            date: Date(),
                            mobile: customers[c].mobile,
                            content: msg,
                            sms_count: numSegments,
                            sms_setting: location[0].sms_setting,
                            status: "initial"
                        }

                        var days = process.env?.SMS_MAX_DATE_LIMIT || 2
                        var tillDate = increaseDateDays(new Date, days)
                        if (tillDate) {
                            smsData.till_date = tillDate
                        }

                        var smsLog = await SmslogService.createSmsLog(smsData)
                        // if (smsLog && smsLog._id) {
                        //     var sendSms = await SendEmailSmsService.sendSMS(params, location[0]?._id || "", '', 'cron')
                        //     if (sendSms) {
                        //         numSegments = sendSms?.numSegments ? parseInt(sendSms.numSegments) : 1

                        //         var smsData = {
                        //             _id: smsLog._id,
                        //             sms_count: numSegments,
                        //             sms_response: sendSms,
                        //             response_status: sendSms?.status || "",
                        //             status: "processed"
                        //         }
                        //         if (location?.length && location[0]?.sms_setting == "twillio") {
                        //             smsData.sms_response = null
                        //             smsData.twillio_response = JSON.stringify(sendSms)
                        //         }

                        //         await SmslogService.updateSmsLog(smsData)
                        //     }
                        // }
                    }
                }

                if (maillist && maillist.length > 0 && marketing.email_notification) {
                    var to = maillist.toString();
                    //html = html.toString().replace("[customer_id]",customer_id);
                    var createdMail = await SendEmailSmsService.sendEmailToMultipleRecipients(to, name, subject, temFile, html, toMail, '', location[0].company_id);
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: marketing, message: "Successfully Send Marketing Template" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Marketing Email Template Creation was Unsuccesfull" })
    }
}

const getShortLink = async function (link) {
    try {
        if (process.env.SITE_URL) {
            var unique_id = (new Date()).getTime().toString(36)
            const alias_data = { 'url': link, "domain": "apgem.co", 'alias': unique_id }
            const post_data = JSON.stringify(alias_data)
            var short_link = await SendEmailSmsService.generateShortLink(link, unique_id)
            if (short_link && short_link != '') {
                link = short_link
            }
        }

        return link
    } catch (e) {
        return null
    }
}

const checkWhatsAppExist = async function (link) {
    try {

        return true;
    } catch (e) {
        return null;
    }
}


exports.createMarketingTemplate = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var marketing = await MarketingService.createMarketing(req.body);

        var customers = []
        if (req.body.all_customer && req.body.all_customer != false) {
            var cust_query = { is_customer: 1, location_ids: { $elemMatch: { $eq: marketing.location_id } } }
            customers = await CustomerService.getCustomersSpecific(cust_query)
        } else if (marketing && marketing.customer_arr && marketing.customer_arr.length > 0) {
            var cust_query = { _id: { $in: marketing.customer_arr }, is_customer: 1 }
            customers = await CustomerService.getCustomersSpecific(cust_query)
        }

        if (customers && customers?.length > 0 && (req.body.sms_notification || req.body.email_notification)) {
            var loc_query = { _id: ObjectId(req.body.location_id.toString()) }
            var location = await LocationService.getLocationComapany(loc_query)

            var toMail = {}
            toMail['site_url'] = process.env.API_URL
            toMail['link_url'] = process.env.SITE_URL
            toMail['location_name'] = location[0].name
            toMail['location_contact'] = location[0].contact_number
            toMail['location_domain'] = location[0].domain
            toMail['company_name'] = location[0].comapny_name
            toMail['front_url'] = process.env.FRONT_URL
            toMail['company_website'] = location[0].contact_link

            var email_template = {}

            var maillist = []
            var temFile = "offer_mail.hjs"
            var subject = req.body.email_subject
            var html = req.body.email_template
            if (html && html != '') {
                var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
                var tillDate = increaseDateDays(new Date, days)
                for (var c = 0; c < customers?.length; c++) {
                    if (customers[c].email && customers[c].email != '' && customers[c].marketing_email_notification != 0 && marketing.email_notification) {
                        toMail['client_id'] = customers[c]._id
                        toMail['client_name'] = customers[c].name
                        toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + customers[c]._id
                        var name = customers[c].name;
                        var to = customers[c].email;
                        html = html.replace(/{unsubscribe_url}/g, toMail['unsubscribe_url']);

                        var emailData = {
                            company_id: location[0].company_id,
                            location_id: location[0]._id,
                            client_id: customers[c]._id,
                            subject: subject,
                            name: customers[c].name,
                            type: "offer",
                            file_type: "offer_mail",
                            temp_file: temFile,
                            html: html,
                            data: toMail,
                            date: Date(),
                            to_email: to,
                            status: "initial",
                            response: null,
                            response_status: '',
                            email_type: 'marketing',
                            till_date: tillDate ?? null
                        }

                        var eLog = EmailLogService.createEmailLog(emailData)
                    }
                    if (customers[c].mobile && customers[c].mobile != '' && customers[c].marketing_sms_notification != 0 && marketing.sms_notification) {

                        var template_link = process.env.SITE_URL + "/marketing-template/" + marketing._id;
                        template_link = await getShortLink(template_link);

                        var is_wa_exist = customers[c].wa_verified ?? 0;
                        var is_WA_set = await getWhatsAppDetails(location?._id)

                        if (is_wa_exist && is_WA_set && req.body.wa_text && req.body.wa_text != '') {

                            var wa_msg = req.body.wa_text + "Please visit " + template_link + " to know more."

                            var waMsgData = {
                                company_id: location[0].company_id,
                                location_id: location[0]._id,
                                client_id: customers[c]._id,
                                type: "cron",
                                msg_type: "marketing",
                                date: Date(),
                                mobile: customers[c].mobile,
                                content: wa_msg,
                                status: "initial",
                                till_date: tillDate ?? null
                            }
                            var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData)
                        }

                        if ((!is_wa_exist || !is_WA_set) && req.body.sms_text) {

                            var msg = req.body.sms_text + "Please visit " + template_link + " to know more."
                            var number = customers[c].mobile
                            number = parseInt(number, 10)
                            var country_code = location.legth ? location[0].country_code : 44
                            var params = {
                                Message: msg,
                                PhoneNumber: '+' + country_code + number
                            }
                            var numSegments = 1
                            var smsData = {
                                company_id: location[0].company_id,
                                location_id: location[0]._id,
                                client_id: customers[c]._id,
                                type: "cron",
                                sms_type: "marketing",
                                date: Date(),
                                mobile: customers[c].mobile,
                                content: msg,
                                sms_count: numSegments,
                                sms_setting: location[0].sms_setting,
                                status: "initial",
                                till_date: tillDate ?? null
                            }

                            var smsLog = await SmslogService.createSmsLog(smsData)
                            // if (smsLog && smsLog._id) {
                            //     var sendSms = await SendEmailSmsService.sendSMS(params,location[0]?._id || "", customers[c]._id, 'cron')
                            //     if (sendSms) {
                            //         numSegments = sendSms?.numSegments ? parseInt(sendSms.numSegments) : 1

                            //         var smsData = {
                            //             _id: smsLog._id,
                            //             sms_count: numSegments,
                            //             sms_response: sendSms,
                            //             response_status: sendSms?.status || "",
                            //             status: "processed"
                            //         }

                            //         if (location?.length && location[0]?.sms_setting == "twillio") {
                            //             smsData.sms_response = null
                            //             smsData.twillio_response = JSON.stringify(sendSms)
                            //         }
                            //         await SmslogService.updateSmsLog(smsData)
                            //     }
                            // }
                        }

                    }
                }

            }
        }


        return res.status(200).json({ status: 200, flag: true, data: marketing, customers: customers, message: "Successfully Send Marketing Template" })
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Marketing Email Template Creation was Unsuccesfull" })
    }
}

exports.updateMarketing = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var marketing = await MarketingService.updateMarketing(req.body)
        // var customers = [];
        // if(marketing.all_customer && marketing.all_customer == 1){
        //     var cust_query = {is_customer:1,location_ids:{$elemMatch: {$eq:marketing.location_id}}};
        //     customers = await CustomerService.getCustomersSpecific(cust_query);

        // }else if(marketing && marketing.customer_arr.length > 0 ){
        //     var cust_query =  {_id: { $in: marketing.customer_arr },is_customer:1};
        //     customers = await CustomerService.getCustomersSpecific(cust_query);
        // }        
        // console.log('customers', customers.length)

        // if(customers && customers.length > 0){

        //     var loc_query =  {_id:ObjectId(req.body.location_id.toString())};

        //     var location = await LocationService.getLocationComapany(loc_query);

        //     var booking_url = process.env.SITE_URL+"/booking";

        //     var toMail = {};
        //     toMail['client_name'] = "Client";
        //     toMail['site_url'] = process.env.SITE_URL;
        //     toMail['location_name'] = location[0].name;
        //     toMail['company_website'] = "";
        //     toMail['company_name'] = location[0].comapny_name;
        //     toMail['booking_url'] = booking_url;
        //     toMail['company_website'] = location[0].contact_link;


        //     var email_template = {};
        //     var sub = marketing.email_subject;
        //     html = marketing.email_template;


        //     var maillist = [];

        //     var temFile = "marketing_mail.hjs";
        //     var subject = sub ? sub :email_template.email_subject;

        //     if(customers.length > 0){

        //         for(var c = 0; c < customers.length; c++){
        //             if(customers[c].email && customers[c].email != '' && customers[c].email_notification != 0){

        //                 maillist.push(customers[c].email);
        //                 toMail['client_id'] = customers[c]._id;
        //                 toMail['client_name'] = customers[c].name;
        //                 var name = customers[c].name;
        //                 var to = customers[c].email;
        //             }

        //             if(customers[c].mobile && customers[c].mobile != '' && customers[c].sms_notification != 0){

        //                 var msg = "New offer is available at "+location[0].comapny_name+" "+location[0].name+". To book an appointment, Please visit "+booking_url;

        //                 var number = customers[c].mobile; 
        //                 number = parseInt(number, 10);

        //                 var country_code = location.legth ? location[0].country_code: 44;

        //                 var params = {
        //                     Message: msg,
        //                     PhoneNumber: '+'+ country_code + number,
        //                 };

        //                 var sendSms = await SendEmailSmsService.sendSMS(params,location[0]?._id||"");

        //                 if(sendSms){
        //                     var smsData = {
        //                         company_id : location[0].company_id,
        //                         location_id: location[0]._id,
        //                         client_id: customers[c]._id,
        //                         sms_type: "marketing",
        //                         date: Date(),
        //                         mobile: customers[c].mobile,
        //                         content: msg,
        //                         sms_count: sendSms.numSegments ? parseInt(sendSms.numSegments):1,
        //                     }
        //                     var smsLog = await SmslogService.createSmsLog(smsData);
        //                 }
        //             }
        //         }
        //         console.log('maillist.length',maillist.length)
        //         if(maillist && maillist.length > 0){
        //             var to = maillist.toString();
        //             var createdMail = await SendEmailSmsService.sendEmailToMultipleRecipients(to, name, subject, temFile, html, toMail);
        //         }
        //     }
        // }

        return res.status(200).json({ status: 200, flag: true, data: marketing, message: "Successfully Updated Offer Email Template" })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMarketing = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await MarketingService.deleteMarketing(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
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