var moment = require('moment');
var dateFormat = require('dateformat');
var ObjectId = require('mongodb').ObjectId;
const cron = require('node-cron');
const WhatsappApiKey = require('../models/whatsappApiKey.model');
var fs = require("fs");
let ejs = require("ejs");
let pdf = require("html-pdf");
var path = require('path').resolve('./'); //get main dir path
var { sleep } = require('sleep');

var AppointmentService = require('../services/appointment.service');
var AppliedDiscount = require('../services/appliedDiscount.service');
var CompanyService = require('../services/company.service');
var CronjobActionService = require('../services/cronjobAction.service');
var CronjobParameterService = require('../services/cronjobParameter.service');
var CustomerPackageService = require('../services/customerpackage.service');
var CustomerRewardService = require('../services/customerReward.service');
var CustomerUsagePackageService = require('../services/customerUsagePackageService.service');
var CustomParameterSettingService = require('../services/CustomParameterSetting.service')

var DiscountService = require('../services/discount.service');
var LocationService = require('../services/location.service');
var SendEmailSmsService = require('../services/sendEmailSms.service');
var ServiceService = require('../services/service.service');
var SmslogService = require('../services/smslog.service');
var UserService = require('../services/user.service');
var CustomerService = require('../services/customer.service');
var WhatsAppLogService = require('../services/whatsAppLog.service');
var EmailLogService = require('../services/emailLog.service');
const FirebaseService = require('../services/firebase.service');

const { updateAppListTableData } = require('../common');

const { increaseDateDays, getCustomParameterData, getEmailTemplateData } = require('../helper');

var systemType = process.env?.SYSTEM_TYPE || "";

// Saving the context of this module inside the _the variable
_this = this

const getScanReport2 = (locations, sms_query) => new Promise(
    announcePDFReady => {
        Promise.all([]).then(async function ([results1, results2]) {
            var data = await generatePdf(locations, sms_query)

            announcePDFReady(data);
        })
    }
)

const getScanReport = (data, total_count, file_name) => new Promise(
    //announcePDFReady() is a function we call to resolve our promise
    announcePDFReady => {
        Promise.all([]).then(function ([results1, results2]) {
            ejs.renderFile((path + '/views/sms_log.ejs'), { data: data, total_count: total_count }, async (err, data) => {
                if (err) {
                    console.log('err', err)
                } else {
                    let options = {
                        "header": {
                            "height": "20mm"
                        },
                        "footer": {
                            "height": "20mm",
                        },
                    }

                    pdf.create(data, options).toFile("public/images/smslog/" + file_name, function (err, data) {
                        announcePDFReady(data);
                        if (err) {
                            console.log('err', err)
                        }
                    })
                }
            })
        })
    }
)

exports.sendMonthlySmsReport = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        //for perivous Month First date
        var first_day = new Date();
        first_day.setDate(0);
        first_day.setDate(1);

        //for previous month last date 
        var last_day = new Date();
        last_day.setDate(0);

        first_day = dateFormat(first_day, "yyyy-mm-dd");
        last_day = dateFormat(last_day, "yyyy-mm-dd");

        date_first_day = dateFormat(first_day, "dd mmm yyyy");
        date_last_day = dateFormat(last_day, "dd mmm yyyy");

        var companies = await CompanyService.getActiveCompanies({ status: 1 });

        var loc_query = { status: 1 };
        var sms_query = { date: { $gte: first_day, $lte: last_day } };

        var cronJobInActiveLocation = await CronjobActionService.getCronjobActionSpecificLocation('location_id', { key_url: "send_monthly_sms_report", status: 0 });

        cronJobInActiveLocation = cronJobInActiveLocation.map(s => ObjectId(s));

        var pdf_arr = [];
        for (var c = 0; c < companies.length; c++) {
            var file_name_arr = [];
            loc_query['company_id'] = companies[c]._id;

            if (cronJobInActiveLocation.length > 0) {
                cronJobInActiveLocation = cronJobInActiveLocation.map(x => ObjectId(x));
                loc_query['_id'] = { $nin: cronJobInActiveLocation };
            }
            var locations = await LocationService.getActiveLocations(loc_query);
            var sms_log = [];

            const pdfIsReady = await generatePdf(locations, sms_query);
            //'await' here means our code will stop until the promise resolves.

            if (pdfIsReady === false) {
                //it failed. Do something? Ignore it?
            } else {
                file_name_arr = pdfIsReady;
                if (file_name_arr.length > 0) {
                    pdf_arr.push(file_name_arr);
                    var toMail = {};
                    toMail['site_url'] = process.env.API_URL;
                    toMail['link_url'] = process.env.SITE_URL;
                    toMail['company_name'] = companies[c].name;
                    toMail['from_date'] = date_first_day;
                    toMail['to_date'] = date_last_day;
                    toMail['front_url'] = process.env.FRONT_URL

                    var to = companies[c].email;
                    //var to = 'priyankastrivedge@gmail.com';
                    var name = companies[c].name;
                    var subject = companies[c].name + ' SMS Log Report from ' + date_first_day + ' to ' + date_last_day;

                    var html = '';
                    var temFile = "sms_monthly_report_mail.hjs";
                    var gettingData = await getEmailTemplateData(companies[c]._id.toString(), "", 'sms_report', temFile);
                    if (gettingData != null) {
                        html = gettingData.contents;
                    } else {
                        html = "";
                    }

                    var createdMail = await SendEmailSmsService.sendMultipleSmsLogMail(to, name, subject, temFile, html, toMail, file_name_arr, 'transaction', '', companies[c]._id);

                    var emailData = {
                        company_id: companies[c]._id,
                        client_id: companies[c].user_id,
                        subject: subject,
                        name: name,
                        type: "cron",
                        file_type: "sms_report",
                        temp_file: temFile,
                        html: '',
                        data: file_name_arr,
                        date: Date(),
                        to_email: to,
                        status: "Sent",
                        email_type: 'transaction'
                    }

                    var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                    var tillDate = increaseDateDays(new Date, days);
                    if (tillDate) { emailData.till_date = tillDate; }
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: null, message: "Successfully send sms monthly report mail" })
    } catch (e) {
        console.log("sendMonthlySmsReport Error", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

async function generatePdf(locations, sms_query) {
    var file_name_arr = [];
    for (var l = 0; l < locations.length; l++) {
        sms_query['location_id'] = locations[l]._id.toString();
        var sms_log = await SmslogService.getSmsLogsSpecific(sms_query)
        if (sms_log && sms_log.length > 0) {
            var customParameter = await getCustomParameterData(locations[l].company_id, locations[l]._id.toString(), 'sms')
            if (customParameter && customParameter?.formData && customParameter?.formData?.sms_status) {
                var sms_price = customParameter?.formData?.sms_price ?? 0;
                for (var sl = 0; sl < sms_log.length; sl++) {
                    var date = dateFormat(sms_log[sl].date, 'yyyy-mm-dd');
                    sms_log[sl].date = date;
                    sms_log[sl].sms_type = sms_log[sl].sms_type.replace(/_/g, '-');
                    sms_log[sl].sms_count = sms_log[sl].sms_count ? parseInt(sms_log[sl].sms_count) : 1;
                    sms_log[sl].price = sms_price ?? 0;
                    sms_log[sl].total_price = (parseInt(sms_log[sl].sms_count) * Number(sms_log[sl].price)).toFixed(2);
                }

                var total_sms_count = sms_log.reduce((subtotal, item) => subtotal + item.sms_count, 0);
                var total_price = sms_log.reduce((subtotal, item) => subtotal + parseFloat(item.total_price), 0);
                var total_count = { total_sms_count: total_sms_count, total_price: Number(total_price).toFixed(2) };

                var file_name = 'smsLog_' + locations[l]._id + '.pdf';
                const pdfIsReady = await getScanReport(sms_log, total_count, file_name);
                if (pdfIsReady === false) {
                    //it failed. Do something? Ignore it?
                } else {
                    var obj = {
                        filename: file_name,
                        path: path + '/public/images/smslog/' + file_name,
                        cid: 'uniq-' + file_name
                    };
                    file_name_arr.push(obj);
                }

                // await ejs.renderFile((path+'/views/sms_log.ejs'), {data: sms_log,total_count:total_count}, (err, data) => {
                //     if (err) {
                //         console.log('err',err)
                //     } else {
                //         let options = {
                //                 "header": {
                //                     "height": "20mm"
                //                 },
                //                 "footer": {
                //                     "height": "20mm",
                //                 },
                //             };
                //         pdf.create(data, options).toFile("public/images/smslog/"+file_name, function (err, data) {

                //             if (err) {
                //                 console.log('err',err)
                //             }
                //         });
                //     }
                //     var obj = {
                //         filename: file_name,
                //         path: path+'/public/images/smslog/'+file_name,
                //         cid: 'uniq-'+file_name
                //     };
                //     file_name_arr.push(obj);
                // });
            }
        }
    }

    return file_name_arr
}

exports.assignCustomerIcon = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var today_date = new Date();
        var from_date = today_date.setFullYear(today_date.getFullYear() - 1);
        from_date = dateFormat(from_date, "yyyy-mm-dd");
        var to_date = new Date();
        to_date = dateFormat(to_date, "yyyy-mm-dd");

        var cust_query = { status: 1 };

        var cronJobAction = await CronjobActionService.getCronjobActionSpecificLocation('location_id', { key_url: "assign_customer_icon", status: 0 });

        cronJobAction = cronJobAction.map(s => ObjectId(s));

        var companies = await CompanyService.getActiveCompanies({ status: 1 });
        for (var com = 0; com < companies.length; com++) {
            var locations = await LocationService.getActiveLocations({ status: 1, company_id: companies[com]._id, _id: { $nin: cronJobAction } });
            var loc_arr = locations.map(s => s._id.toString());
            if (loc_arr && loc_arr.length > 0) {
                cust_query['location_ids'] = { $elemMatch: { $in: loc_arr } };
            }
            var customers = await CustomerService.getCustomersSpecificBySort(cust_query);
            for (var c = 0; c < customers.length; c++) {
                var query = { date: { $gte: from_date }, client_id: { $elemMatch: { $eq: customers[c]._id.toString() } }, booking_status: { $nin: ['cancel', 'no_shows'] } };

                if (loc_arr && loc_arr.length > 0) {
                    query['location_id'] = { $in: loc_arr };
                }

                var appointments = await AppointmentService.getAppointmentSpecific(query);
                var booking = appointments.filter((x, i) => x.booking_status == 'complete' || x.booking_status == 'pending');
                if (booking.length > 0 && customers[c].location_ids && customers[c].location_ids.length > 0) {
                    var booking_total = booking.reduce((subtotal, item) => subtotal + item.grand_total, 0);

                    var booking_avg = 0;
                    if (booking_total) {
                        booking_avg = booking_total / booking.length;
                    }

                    var company_id = companies[com]._id.toString();

                    var customParameter = await getCustomParameterData(company_id, customers[c].location_ids[0], 'customer_icon')

                    if (customParameter && customParameter?.formData && customParameter?.formData?.icon_status) {

                        custom_para = customParameter?.formData;
                        var bouquet_max_count = custom_para?.bouquet_max_count ?? 2;
                        var golden_crown_min_count = custom_para?.golden_crown_min_count;
                        var golden_crown_max_count = custom_para?.golden_crown_max_count;
                        var golden_crown_amount = parseFloat(custom_para?.golden_crown_amount);
                        var red_diamond_amount = parseFloat(custom_para?.red_diamond_amount);
                        var red_diamond_min_count = custom_para?.red_diamond_min_count;
                        var red_diamond_max_count = custom_para?.red_diamond_max_count;
                        var red_crown_amount = parseFloat(custom_para?.red_crown_amount);
                        var red_crown_min_count = custom_para?.red_crown_min_count;
                        var red_crown_max_count = custom_para?.red_crown_max_count;

                        var cust_icon = '';
                        if (appointments.length == 1) {
                            cust_icon = 'rose';
                        } else if (appointments.length > 1 && appointments.length <= bouquet_max_count) {
                            cust_icon = 'bouquet';
                        } else if (booking.length >= golden_crown_min_count && booking.length < golden_crown_max_count && booking_avg >= golden_crown_amount) {
                            cust_icon = 'golden_crown';
                        } else if (booking.length > red_diamond_min_count && booking.length < red_diamond_max_count && booking_avg >= red_diamond_amount) {
                            cust_icon = 'red_diamond';
                        } else if (booking.length > red_crown_min_count && booking.length < red_crown_max_count && booking_avg >= red_crown_amount) {
                            cust_icon = 'red_crown';
                        }
                        if (systemType == 'self' && customers[c]?.customer_heart && customers[c].customer_heart == 'black_heart') {
                            if (cust_icon == 'golden_crown') {
                                cust_icon = 'black_crown';
                            } else if (cust_icon == 'red_diamond') {
                                cust_icon = 'black_diamond';
                            }
                        }
                        if (cust_icon) {
                            var i_ind = -1;
                            var cust_params = { _id: customers[c]._id, customer_icons: customers[c].customer_icons ?? [] };
                            if (company_id && customers[c].customer_icons) {
                                i_ind = cust_params.customer_icons.findIndex(x => x.company_id == company_id)
                                if (i_ind > -1) {
                                    if (appointments.length > 1 && cust_params.customer_icons[i_ind].icon == 'rose') {
                                        cust_icon = 'bouquet';
                                    }
                                    cust_params.customer_icons[i_ind].icon = cust_icon
                                } else {
                                    cust_params.customer_icons.push({ icon: cust_icon, company_id: company_id })
                                }
                                var updatedUser = await CustomerService.updateCustomer(cust_params);
                            }
                        }
                    }
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, message: "Successfully Appointment received" })
    } catch (e) {
        console.log("assignCustomerIcon Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.appointmentsAutoComplete = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var cronJobAction = await CronjobActionService.getCronjobActionSpecificLocation('location_id', { key_url: "appointments_auto_complete", status: 0 });

        cronJobAction = cronJobAction.map(s => ObjectId(s));

        var today_date = new Date();
        var date = today_date.setDate(today_date.getDate() - 1);
        date = dateFormat(date, "yyyy-mm-dd");
        var query = { booking_status: 'pending', date: date };

        var loc_query = { status: 1 };
        if (cronJobAction.length > 0) {
            loc_query['_id'] = { $nin: cronJobAction };
        }

        var companies = await CompanyService.getActiveCompanies({ status: 1 });
        for (var c = 0; c < companies.length; c++) {
            var company_id = companies[c]._id.toString();
            var locations = await LocationService.getActiveLocations({ status: 1, company_id: companies[c]._id, _id: { $nin: cronJobAction } });
            var loc_arr = locations.map(s => s._id.toString());
            query['location_id'] = { $in: loc_arr };

            var appointments = await AppointmentService.getAppointmentSpecific(query)
            for (var i = 0; i < appointments.length; i++) {
                var app_reward = [];
                var check_qry = { customer_id: appointments[i].client_id[0], appoitment_id: appointments[i]._id.toString(), action: 'gain' };
                app_reward = await CustomerRewardService.getSpecificCustomerRewards(check_qry);
                if (app_reward?.length == 0) {

                    var customParameter = await getCustomParameterData(company_id, appointments[i].location_id, 'customer_reward')

                    if (customParameter && customParameter?.formData && customParameter?.formData?.reward_status && customParameter?.formData?.customer_reward_points > 0 && customParameter?.formData?.customer_reward_amount > 0) {

                        var reward_points = customParameter?.formData?.customer_reward_points;
                        var reward_amt = customParameter?.formData?.customer_reward_amount;

                        var booking_amt = appointments[i].price ? appointments[i].price : appointments[i].grand_total;

                        var earn_points = parseFloat(booking_amt) * parseInt(reward_points) / parseFloat(reward_amt);

                        var last_reward_query = { customer_id: appointments[i].client_id[0], company_id: company_id };

                        var last_reward = await CustomerRewardService.getCustomerLastRewards(last_reward_query);
                        var last_total_points = 0;
                        if (last_reward.length > 0) {
                            last_total_points = last_reward[0].total_points;
                        }

                        var total_points = parseFloat(last_total_points) + parseFloat(earn_points);

                        var reward_data = {
                            company_id: company_id,
                            location_id: appointments[i].location_id,
                            customer_id: appointments[i].client_id[0],
                            appoitment_id: appointments[i]._id,
                            amount: booking_amt,
                            gain_points: earn_points.toFixed(2),
                            total_points: total_points.toFixed(2),
                            date: Date(),
                            action: 'gain',
                            added_by: 'booking'
                        }
                        var cust_reward = await CustomerRewardService.createCustomerReward(reward_data);
                        var today_date = new Date();
                        var month_date = new Date();
                        var DaysToAdd = 30;
                        month_date.setDate(month_date.getDate() - DaysToAdd);

                        var end_date = dateFormat(today_date, "yyyy-mm-dd");
                        var start_date = dateFormat(month_date, "yyyy-mm-dd");

                        var qry = {
                            company_id: company_id,
                            customer_id: appointments[i].client_id[0],
                            action: "gain",
                            date: { $gte: start_date, $lte: end_date },
                        };

                        var monthly_reward = await CustomerRewardService.getCustomerRewardsByDate(qry);
                        if (monthly_reward.length > 0 && monthly_reward[0].SumTotalPoints > 0) {
                            var monthly_points = parseFloat(monthly_reward[0].SumTotalPoints.toFixed(2));
                            var badge = '';
                            if (monthly_points >= 150) {
                                badge = 'prestige';
                            } else if (monthly_points >= 100 && monthly_points <= 149) {
                                badge = 'vip';
                            } else if (monthly_points >= 80 && monthly_points <= 99) {
                                badge = 'gold';
                            } else if (monthly_points >= 50 && monthly_points <= 70) {
                                badge = 'bronze';
                            } else if (monthly_points >= 30 && monthly_points <= 49) {
                                badge = 'silver';
                            } else if (monthly_points < 30) {
                                badge = 'lite_user';
                            }

                            var c_data = { _id: appointments[i].client_id[0], customer_badge: badge }
                            var customer = await CustomerService.getCustomer(appointments[i].client_id[0]);
                            if (badge && customer) {
                                var i_ind = -1;
                                var cust_params = { _id: appointments[i].client_id[0], customer_badges: customer.customer_badges ?? [] };
                                if (company_id && customer.customer_badges) {
                                    i_ind = cust_params.customer_badges.findIndex(x => x.company_id == company_id)

                                    if (i_ind > -1) {
                                        cust_params.customer_badges[i_ind].icon = badge
                                    } else {
                                        cust_params.customer_badges.push({ icon: badge, company_id: company_id })
                                    }
                                    var updatedUser = await CustomerService.updateCustomer(cust_params);
                                }
                            }
                        }
                    }
                }
            }
        }

        var allAppointments = await AppointmentService.updateManyAppointmentStatus(query)
        var locations = await LocationService.getActiveLocations({ status: 1 })
        for (var l = 0; l < locations.length; l++) {
            var params = { location_id: locations[l]._id.toString(), employee_id: '', date: date, filter_employees: [], order_by: 'user_order', is_employee: 1, is_available: 1, type: 'booking' };
            var refData = await updateAppListTableData(params);
        }

        return res.status(200).json({ status: 200, flag: true, data: null, message: "Successfully Appointment received" })
    } catch (e) {
        console.log("appointmentsAutoComplete Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.notifyClientAfterThreeMonth = async function (req, res, next) { // send email and sms if booking not in last three months
    try {
        var query = {}
        var cronJobAction = await CronjobActionService.getCronjobActionSpecificLocation('location_id', { key_url: "notify_client_after_three_month", status: 0 });

        cronJobAction = cronJobAction.map(s => ObjectId(s));

        var cust_arr = [];
        var today_date = new Date();

        var companies = await CompanyService.getActiveCompanies({ status: 1 });
        for (var com = 0; com < companies.length; com++) {
            var company_id = companies[com]._id.toString();
            var locations = await LocationService.getActiveLocations({ status: 1, company_id: companies[com]._id, _id: { $nin: cronJobAction } });
            var customParaVal = null;

            var customParaAllVal = await await CustomParameterSettingService.getAllCustomParameterSettings({ company_id: ObjectId(company_id), location_id: { $ne: null }, category: 'reconnect' })
            if (!customParaAllVal || customParaAllVal?.length == 0) {
                customParaVal = await getCustomParameterData(company_id, null, 'reconnect')
                var reconnect_days = 0

                if (customParaVal && customParaVal?.formData && customParaVal?.formData?.reconnect_status && customParaVal?.formData?.reconnect_days > 0) {
                    reconnect_days = parseInt(customParaVal?.formData?.reconnect_days) ?? 0;
                    //var past_date = new Date(today_date.setMonth(today_date.getMonth() - 3));
                    var past_date = new Date();
                    past_date.setDate(past_date.getDate() - reconnect_days);

                    past_date = dateFormat(past_date, "yyyy-mm-dd");

                    query = { date: { $eq: past_date } };

                    var loc_arr = locations.map(s => s._id.toString());
                    query['location_id'] = { $in: loc_arr };

                    var appointments = await AppointmentService.getSelectedAppointmentSpecific(query);
                    cust_arr = appointments.map(a => a.client_id);

                    var resultArray = Array.prototype.concat.apply([], cust_arr); //merge arrays
                    var unique_ids = Array.from(new Set(resultArray)); //get all unique data 
                    unique_ids = unique_ids.filter(function (e) { return e });
                    var cust_query = { _id: { $in: unique_ids }, status: 1 };
                    if (cronJobAction.length > 0) {
                        cust_query['location_ids'] = { $elemMatch: { $in: loc_arr } };
                    }

                    var customers = await CustomerService.getCustomersSpecific(cust_query);
                    var toMail = {};
                    toMail['site_url'] = process.env.API_URL;
                    toMail['link_url'] = process.env.SITE_URL;

                    for (var c = 0; c < customers.length; c++) {
                        var custAppQuery = { date: { $gt: past_date }, client_id: customers[c]._id.toString() };
                        var cust_apps = await AppointmentService.getSelectedAppointmentSpecific(custAppQuery);

                        if (cust_apps?.length == 0 && customers[c]?.location_ids && customers[c].location_ids?.length > 0) {
                            var last_app = await AppointmentService.getLastAppointment({ client_id: customers[c]._id.toString() })
                            var location_id = last_app ? last_app?.location_id : null;
                            if (!location_id) {
                                location_id = customers[c]?.location_ids[0];
                            }
                            var loc_query = { _id: ObjectId(location_id) };
                            var location = await LocationService.getLocationComapany(loc_query);

                            if (location && location?.length > 0 && customParaVal && customParaVal?.formData) {
                                var discount_value = customParaVal?.formData?.client_reconnect_discount_value;
                                var validate_days = customParaVal?.formData?.reconnect_next_validate_days;

                                if (validate_days > 0 && discount_value > 0) {

                                    var validity_date = new Date();
                                    var DaysToAdd = parseInt(validate_days);
                                    validity_date.setDate(validity_date.getDate() + DaysToAdd);

                                    var start_date = dateFormat(new Date(), "yyyy-mm-dd");
                                    var end_date = dateFormat(validity_date, "yyyy-mm-dd");
                                    var validity_date = dateFormat(validity_date, "dd mmm-yyyy");

                                    var dis_code = stringGen(6);
                                    var params = {
                                        name: "Client Reconnect",
                                        discount_type: "percentage",
                                        discount_value: parseFloat(discount_value),
                                        start_date: start_date,
                                        end_date: end_date,
                                        min_discount: "",
                                        max_discount: "",
                                        min_order_val: "",
                                        max_order_val: "",
                                        per_user_occurances: "1",
                                        max_occurances: "1",
                                        category_id: '',
                                        service_id: null,
                                        discount_code: dis_code,
                                        status: 1,
                                        weekend: customParaVal?.formData?.weekend,
                                        holiday: customParaVal?.formData?.holiday,
                                        description: customParaVal?.formData?.desc,
                                        location_id: customParaVal?.formData?.location_id ?? null,
                                        company_id: company_id,
                                        customer_id: customers[c]._id,
                                        discount_code_type: "client_reconnect",
                                        all_online_services: customParaVal?.formData?.all_online_services ?? 0,
                                        apply_on_all_services: customParaVal?.formData?.apply_on_all_services ?? 0,

                                    }
                                    var createdDiscount = await DiscountService.createDiscount(params)
                                    if (customers[c]?.marketing_email_notification != 0 && customers[c]?.email && dis_code) {
                                        toMail['location_name'] = location[0]?.name;
                                        toMail['client_id'] = customers[c]._id;
                                        toMail['client_name'] = customers[c].name;
                                        toMail['company_website'] = "";
                                        toMail['discount_code'] = dis_code;
                                        toMail['validity_date'] = validity_date;
                                        toMail['company_name'] = companies[com].name;
                                        toMail['company_website'] = companies[com].contact_link;
                                        toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + customers[c]._id
                                        toMail['location_contact'] = location[0]?.contact_number
                                        toMail['location_domain'] = location[0]?.domain
                                        toMail['front_url'] = process.env.FRONT_URL
                                        toMail['validate_days'] = DaysToAdd
                                        toMail['discount_value'] = parseInt(discount_value)

                                        var to = customers[c].email;
                                        //var to = "priyankastrivedge@gmail.com";
                                        var name = customers[c].name;
                                        var subject = "Client Reconnect";
                                        var temFile = "client_reconnect_mail.hjs";

                                        var emailData = {
                                            company_id: companies[com]._id,
                                            location_id: location[0]?._id,
                                            client_id: customers[c]._id,
                                            subject: subject,
                                            name: customers[c].name,
                                            type: "cron",
                                            file_type: "client_reconnect",
                                            temp_file: temFile,
                                            html: '',
                                            data: toMail,
                                            date: Date(),
                                            to_email: to,
                                            status: "initial",
                                            email_type: 'marketing'
                                        }

                                        var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                                        var tillDate = increaseDateDays(new Date, days);
                                        if (tillDate) { emailData.till_date = tillDate; }

                                        var waLog = await EmailLogService.createEmailLog(emailData);
                                    }

                                    if (customers[c]?.marketing_sms_notification != 0 && customers[c]?.mobile && dis_code) {
                                        var msg_val = customParaVal?.formData?.reconnect_message;

                                        if (msg_val) {

                                            msg_val = msg_val.replace(/{client_name}/g, customers[c].name);
                                            msg_val = msg_val.replace(/{contact_link}/g, companies[com].contact_link);
                                            msg_val = msg_val.replace(/{validate_days}/g, DaysToAdd);
                                            msg_val = msg_val.replace(/{discount_value}/g, parseInt(discount_value));
                                            msg_val = msg_val.replace(/{validity_date}/g, validity_date);
                                            msg_val = msg_val.replace(/{dis_code}/g, dis_code);

                                            msg_val = msg_val.replace(/{organisation_name}/g, companies[com].name);
                                            msg_val = msg_val.replace(/{location_name}/g, location[0]?.name);
                                            msg_val = msg_val.replace(/{branch_number}/g, companies[com].contact_number);

                                            var msg = msg_val;
                                        } else {
                                            var msg = '';
                                        }
                                        if (msg) {
                                            var number = customers[c].mobile;
                                            number = parseInt(number, 10);
                                            var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                            var tillDate = increaseDateDays(new Date, days);
                                            var is_wa_exist = customers[c].wa_verified ?? 0;
                                            var is_WA_set = await getWhatsAppDetails(location[0]?._id, companies[com]._id)

                                            if (is_wa_exist && is_WA_set) {
                                                var waMsgData = {
                                                    company_id: companies[com]._id,
                                                    location_id: location[0]?._id,
                                                    client_id: customers[c]._id,
                                                    type: "cron",
                                                    msg_type: "client_reconnect",
                                                    date: Date(),
                                                    mobile: customers[c].mobile,
                                                    content: msg,
                                                    msg_count: 1,
                                                    status: "initial",
                                                    till_date: tillDate ?? null
                                                }

                                                var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                            }

                                            if (!is_wa_exist || !is_WA_set) {
                                                var smsData = {
                                                    company_id: companies[com]._id,
                                                    location_id: location[0]?._id,
                                                    client_id: customers[c]._id,
                                                    type: "cron",
                                                    sms_type: "client_reconnect",
                                                    date: Date(),
                                                    mobile: customers[c].mobile,
                                                    content: msg,
                                                    sms_count: 1,
                                                    sms_setting: companies[com].marketing_sms_setting,
                                                    status: "initial",
                                                    till_date: tillDate ?? null
                                                }

                                                var smsLog = await SmslogService.createSmsLog(smsData);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (customParaAllVal?.length > 0 && locations?.length > 0) {

                for (var l = 0; l < locations.length; l++) {

                    customParaVal = await getCustomParameterData(company_id, locations[l]?._id, 'reconnect')
                    var reconnect_days = 0;

                    if (customParaVal && customParaVal?.formData && customParaVal?.formData?.reconnect_status && customParaVal?.formData?.reconnect_days > 0) {
                        reconnect_days = parseInt(customParaVal?.formData?.reconnect_days) ?? 0;
                        //var past_date = new Date(today_date.setMonth(today_date.getMonth() - 3));
                        var past_date = new Date();
                        past_date.setDate(past_date.getDate() - reconnect_days);

                        past_date = dateFormat(past_date, "yyyy-mm-dd");

                        query = { date: { $eq: past_date } };

                        //var loc_arr = locations.map(s => s._id.toString());
                        query['location_id'] = locations[l]?._id.toString();

                        var appointments = await AppointmentService.getSelectedAppointmentSpecific(query);
                        cust_arr = appointments.map(a => a.client_id);

                        var resultArray = Array.prototype.concat.apply([], cust_arr); //merge arrays
                        var unique_ids = Array.from(new Set(resultArray)); //get all unique data 
                        unique_ids = unique_ids.filter(function (e) { return e });
                        var cust_query = { _id: { $in: unique_ids }, status: 1 };
                        if (cronJobAction.length > 0) {
                            cust_query['location_ids'] = { $elemMatch: { $in: [locations[l]?._id] } };
                        }

                        var customers = await CustomerService.getCustomersSpecific(cust_query);
                        var toMail = {};
                        toMail['site_url'] = process.env.API_URL;
                        toMail['link_url'] = process.env.SITE_URL;

                        for (var c = 0; c < customers.length; c++) {
                            var custAppQuery = { date: { $gt: past_date }, client_id: customers[c]._id.toString() };
                            var cust_apps = await AppointmentService.getSelectedAppointmentSpecific(custAppQuery);
                            if (cust_apps?.length == 0 && customers[c]?.location_ids && customers[c].location_ids?.length > 0) {

                                if (customParaVal && customParaVal?.formData) {
                                    var discount_value = customParaVal?.formData?.client_reconnect_discount_value;
                                    var validate_days = customParaVal?.formData?.reconnect_next_validate_days;

                                    if (validate_days > 0 && discount_value > 0) {

                                        var validity_date = new Date();
                                        var DaysToAdd = parseInt(validate_days);
                                        validity_date.setDate(validity_date.getDate() + DaysToAdd);

                                        var start_date = dateFormat(new Date(), "yyyy-mm-dd");
                                        var end_date = dateFormat(validity_date, "yyyy-mm-dd");
                                        var validity_date = dateFormat(validity_date, "dd mmm-yyyy");

                                        var dis_code = stringGen(6);
                                        var params = {
                                            name: "Client Reconnect",
                                            discount_type: "percentage",
                                            discount_value: parseFloat(discount_value),
                                            start_date: start_date,
                                            end_date: end_date,
                                            min_discount: "",
                                            max_discount: "",
                                            min_order_val: "",
                                            max_order_val: "",
                                            per_user_occurances: "1",
                                            max_occurances: "1",
                                            category_id: '',
                                            service_id: null,
                                            discount_code: dis_code,
                                            status: 1,
                                            weekend: customParaVal?.formData?.weekend,
                                            holiday: customParaVal?.formData?.holiday,
                                            description: customParaVal?.formData?.desc,
                                            location_id: locations[l]?._id ?? null,
                                            company_id: company_id,
                                            customer_id: customers[c]._id,
                                            discount_code_type: "client_reconnect",
                                            all_online_services: customParaVal?.formData?.all_online_services ?? 0,
                                            apply_on_all_services: customParaVal?.formData?.apply_on_all_services ?? 0,

                                        }
                                        var createdDiscount = await DiscountService.createDiscount(params)
                                        if (customers[c]?.marketing_email_notification != 0 && customers[c]?.email && dis_code) {
                                            toMail['location_name'] = locations[l]?.name;
                                            toMail['client_id'] = customers[c]._id;
                                            toMail['client_name'] = customers[c].name;
                                            toMail['company_website'] = "";
                                            toMail['discount_code'] = dis_code;
                                            toMail['validity_date'] = validity_date;
                                            toMail['company_name'] = companies[com].name;
                                            toMail['company_website'] = companies[com].contact_link;
                                            toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + customers[c]._id
                                            toMail['location_contact'] = locations[l]?.contact_number
                                            toMail['location_domain'] = locations[l]?.domain
                                            toMail['front_url'] = process.env.FRONT_URL
                                            toMail['validate_days'] = DaysToAdd
                                            toMail['discount_value'] = parseInt(discount_value)

                                            var to = customers[c].email;
                                            //var to = "priyankastrivedge@gmail.com";
                                            var name = customers[c].name;
                                            var subject = "Client Reconnect";
                                            var temFile = "client_reconnect_mail.hjs";

                                            var emailData = {
                                                company_id: companies[com]._id,
                                                location_id: locations[l]?._id,
                                                client_id: customers[c]._id,
                                                subject: subject,
                                                name: customers[c].name,
                                                type: "cron",
                                                file_type: "client_reconnect",
                                                temp_file: temFile,
                                                html: '',
                                                data: toMail,
                                                date: Date(),
                                                to_email: to,
                                                status: "initial",
                                                email_type: 'marketing'
                                            }

                                            var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                                            var tillDate = increaseDateDays(new Date, days);
                                            if (tillDate) { emailData.till_date = tillDate; }

                                            var waLog = await EmailLogService.createEmailLog(emailData);
                                        }

                                        if (customers[c]?.marketing_sms_notification != 0 && customers[c]?.mobile && dis_code) {
                                            var msg_val = customParaVal?.formData?.reconnect_message;

                                            if (msg_val) {

                                                msg_val = msg_val.replace(/{client_name}/g, customers[c].name);
                                                msg_val = msg_val.replace(/{contact_link}/g, companies[com].contact_link);
                                                msg_val = msg_val.replace(/{validate_days}/g, DaysToAdd);
                                                msg_val = msg_val.replace(/{discount_value}/g, parseInt(discount_value));
                                                msg_val = msg_val.replace(/{validity_date}/g, validity_date);
                                                msg_val = msg_val.replace(/{dis_code}/g, dis_code);

                                                msg_val = msg_val.replace(/{organisation_name}/g, companies[com].name);
                                                msg_val = msg_val.replace(/{location_name}/g, locations[l]?.name);
                                                msg_val = msg_val.replace(/{branch_number}/g, companies[com].contact_number);

                                                var msg = msg_val;
                                            } else {
                                                var msg = '';
                                            }
                                            if (msg) {
                                                var number = customers[c].mobile;
                                                number = parseInt(number, 10);
                                                var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                                var tillDate = increaseDateDays(new Date, days);
                                                var is_wa_exist = customers[c].wa_verified ?? 0;
                                                var is_WA_set = await getWhatsAppDetails(locations[l]?._id, companies[com]._id)

                                                if (is_wa_exist && is_WA_set) {
                                                    var waMsgData = {
                                                        company_id: companies[com]._id,
                                                        location_id: locations[l]?._id,
                                                        client_id: customers[c]._id,
                                                        type: "cron",
                                                        msg_type: "client_reconnect",
                                                        date: Date(),
                                                        mobile: customers[c].mobile,
                                                        content: msg,
                                                        msg_count: 1,
                                                        status: "initial",
                                                        till_date: tillDate ?? null
                                                    }

                                                    var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                                }

                                                if (!is_wa_exist || !is_WA_set) {
                                                    var smsData = {
                                                        company_id: companies[com]._id,
                                                        location_id: locations[l]?._id,
                                                        client_id: customers[c]._id,
                                                        type: "cron",
                                                        sms_type: "client_reconnect",
                                                        date: Date(),
                                                        mobile: customers[c].mobile,
                                                        content: msg,
                                                        sms_count: 1,
                                                        sms_setting: companies[com].marketing_sms_setting,
                                                        status: "initial",
                                                        till_date: tillDate ?? null
                                                    }

                                                    var smsLog = await SmslogService.createSmsLog(smsData);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Return the AppVersions list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: appointments.length, message: "Succesfully" })
    } catch (e) {
        console.log("notifyClientAfterThreeMonth Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.notifyClientOnBirthdayInAdvanced = async function (req, res, next) {
    try {
        var cronJobAction = await CronjobActionService.getCronjobActionSpecificLocation('location_id', { key_url: "notify_client_on_birthday_in_advanced", status: 0 })

        cronJobAction = cronJobAction.map(s => ObjectId(s));

        // var day = today_date.getDate()
        // var month = parseInt(today_date.getMonth()) + 1 // returns the month (from 0 to 11) for the specified date

        var toMail = {}
        toMail['site_url'] = process.env?.API_URL || "";
        toMail['link_url'] = process.env?.SITE_URL || "";
        var customers = [];
        var companies = await CompanyService.getActiveCompanies({ status: 1 });
        for (var com = 0; com < companies.length; com++) {
            var company_id = companies[com]._id.toString();

            var locations = await LocationService.getActiveLocations({ status: 1, company_id: companies[com]._id, _id: { $nin: cronJobAction } });
            var loc_arr = locations.map(s => ObjectId(s._id));
            var customParaVal = null;

            var customParaAllVal = await await CustomParameterSettingService.getAllCustomParameterSettings({ company_id: ObjectId(company_id), location_id: { $ne: null }, category: 'birthday' })
            if (!customParaAllVal || customParaAllVal?.length == 0) {
                customParaVal = await getCustomParameterData(company_id, null, 'birthday')

                if (customParaVal && customParaVal?.formData && customParaVal?.formData?.advanced_birthday_status && customParaVal?.formData?.advanced_birthday_reminder_days > 0 && customParaVal?.formData?.client_birthday_discount_value > 0 && customParaVal?.formData?.next_validate_days > 0) {

                    var min_value = customParaVal?.formData?.client_birthday_min_order_discount_value ?? 0;
                    var discount_value = customParaVal?.formData?.client_birthday_discount_value ?? 0;
                    var validate_days = customParaVal?.formData?.next_validate_days ?? 0;
                    var today_date = new Date();

                    var DaysToAdd = customParaVal?.formData?.advanced_birthday_reminder_days;
                    today_date.setDate(today_date.getDate() + DaysToAdd);

                    var month = parseInt(today_date.getMonth()) + 1 // returns the month (from 0 to 11) for the specified date
                    var day = today_date.getDate()

                    cust_query = {
                        status: 1,
                        location_ids: { $in: loc_arr },
                        "m": month, "d": day
                    }

                    customers = await CustomerService.getClientDobSpecific(cust_query) || [];
                    for (var c = 0; c < customers?.length; c++) {
                        if (customers[c]?.location_ids && customers[c].location_ids?.length > 0) {

                            var last_app = await AppointmentService.getLastAppointment({ client_id: customers[c]._id.toString() })
                            var location_id = last_app ? last_app?.location_id : null
                            if (!location_id) {
                                location_id = customers[c]?.location_ids[0];
                            }

                            var loc_query = { _id: ObjectId(location_id) };
                            var location = await LocationService.getLocationComapany(loc_query);

                            var validity_date = new Date();
                            var DaysToAdd = parseInt(validate_days);
                            validity_date.setDate(validity_date.getDate() + DaysToAdd);

                            var start_date = dateFormat(new Date(), "yyyy-mm-dd");
                            var end_date = dateFormat(validity_date, "yyyy-mm-dd");
                            var validity_date = dateFormat(validity_date, "dd mmm-yyyy");

                            var dis_code = stringGen(6);
                            var params = {
                                name: "Client Birthday",
                                discount_type: "percentage",
                                discount_value: parseFloat(discount_value),
                                start_date: start_date,
                                end_date: end_date,
                                min_discount: "",
                                max_discount: "",
                                min_order_val: min_value,
                                max_order_val: "",
                                per_user_occurances: "1",
                                max_occurances: "1",
                                category_id: '',
                                service_id: null,
                                discount_code: dis_code,
                                status: 1,
                                weekend: customParaVal?.formData?.weekend,
                                holiday: customParaVal?.formData?.holiday,
                                description: customParaVal?.formData?.desc,
                                location_id: null,
                                company_id: company_id,
                                customer_id: customers[c]._id,
                                discount_code_type: "birthday",
                                all_online_services: customParaVal?.formData?.all_online_services ?? 0,
                                apply_on_all_services: customParaVal?.formData?.apply_on_all_services ?? 0,

                            }
                            var createdDiscount = await DiscountService.createDiscount(params);

                            if (customers[c].birthday_email_notification != 0 && customers[c].email && customers[c].email != '' && dis_code) {
                                toMail['location_name'] = location[0]?.name;
                                toMail['client_id'] = customers[c]._id;
                                toMail['client_name'] = customers[c].name;
                                toMail['company_website'] = "";
                                toMail['discount_code'] = dis_code;
                                toMail['validity_date'] = validity_date;
                                toMail['company_name'] = companies[com].name;
                                toMail['company_website'] = companies[com].contact_link;
                                toMail['currency'] = companies[com].currency ? companies[com].currency.symbol : "£";
                                toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + customers[c]._id
                                toMail['location_contact'] = companies[com].contact_number
                                toMail['location_domain'] = location[0]?.domain
                                toMail['front_url'] = process.env.FRONT_URL
                                toMail['validate_days'] = DaysToAdd
                                toMail['discount_value'] = parseInt(discount_value)
                                toMail['min_order_value'] = parseInt(min_value)

                                var to = customers[c].email;
                                //var to = "priyankastrivedge@gmail.com";
                                var name = customers[c].name;
                                var subject = "Client Advanced Birthday";
                                var temFile = "client_advanced_birthday.hjs";

                                var emailData = {
                                    company_id: company_id,
                                    location_id: location[0]?._id,
                                    client_id: customers[c]._id,
                                    subject: subject,
                                    name: name,
                                    type: "cron",
                                    file_type: "client_advanced_birthday",
                                    temp_file: temFile,
                                    html: '',
                                    data: toMail,
                                    date: Date(),
                                    to_email: to,
                                    status: "initial",
                                    email_type: 'marketing'
                                }

                                var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                                var tillDate = increaseDateDays(new Date, days);
                                if (tillDate) { emailData.till_date = tillDate; }

                                var waLog = await EmailLogService.createEmailLog(emailData)
                            }

                            if (customers[c].birthday_sms_notification != 0 && customers[c].mobile && customers[c].mobile != '' && dis_code) {

                                var msg_val = customParaVal?.formData?.advanced_birthday_message;

                                if (msg_val) {
                                    msg_val = msg_val.replace(/{client_name}/g, customers[c].name);
                                    msg_val = msg_val.replace(/{contact_link}/g, companies[com].contact_link);
                                    msg_val = msg_val.replace(/{validate_days}/g, DaysToAdd);
                                    msg_val = msg_val.replace(/{discount_value}/g, parseInt(discount_value));
                                    msg_val = msg_val.replace(/{validity_date}/g, validity_date);
                                    msg_val = msg_val.replace(/{dis_code}/g, dis_code);

                                    msg_val = msg_val.replace(/{organisation_name}/g, companies[com].name);
                                    msg_val = msg_val.replace(/{location_name}/g, location[0]?.name);
                                    msg_val = msg_val.replace(/{branch_number}/g, location[0]?.contact_number);

                                    var msg = msg_val;
                                } else {
                                    var msg = '';
                                }
                                if (msg) {
                                    var number = customers[c].mobile;
                                    number = parseInt(number, 10);

                                    var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                    var tillDate = increaseDateDays(new Date, days);
                                    var is_wa_exist = customers[c].wa_verified ?? 0;
                                    var is_WA_set = await getWhatsAppDetails(location[0]?._id, company_id)

                                    if (is_wa_exist && is_WA_set) {
                                        var waMsgData = {
                                            company_id: company_id,
                                            location_id: location[0]?._id,
                                            client_id: customers[c]._id,
                                            type: "cron",
                                            msg_type: "client_advanced_birthday",
                                            date: Date(),
                                            mobile: customers[c].mobile,
                                            content: msg,
                                            msg_count: 1,
                                            status: "initial",
                                            till_date: tillDate ?? null
                                        }

                                        var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                    }

                                    if (!is_wa_exist || !is_WA_set) {
                                        var smsData = {
                                            company_id: company_id,
                                            location_id: location[0]?._id,
                                            client_id: customers[c]._id,
                                            type: "cron",
                                            sms_type: "client_advanced_birthday",
                                            date: Date(),
                                            mobile: customers[c].mobile,
                                            content: msg,
                                            sms_count: 1,
                                            sms_setting: companies[com].marketing_sms_setting,
                                            status: "initial",
                                            till_date: tillDate ?? null
                                        }

                                        var smsLog = await SmslogService.createSmsLog(smsData);
                                    }
                                }
                            }

                        }
                    }
                }
            } else if (customParaAllVal?.length > 0 && locations?.length > 0) {

                for (var l = 0; l < locations.length; l++) {

                    customParaVal = await getCustomParameterData(company_id, locations[l]?._id, 'birthday')

                    if (customParaVal && customParaVal?.formData && customParaVal?.formData?.advanced_birthday_status && customParaVal?.formData?.advanced_birthday_reminder_days > 0 && customParaVal?.formData?.client_birthday_discount_value > 0 && customParaVal?.formData?.next_validate_days > 0) {

                        var min_value = customParaVal?.formData?.client_birthday_min_order_discount_value ?? 0;
                        var discount_value = customParaVal?.formData?.client_birthday_discount_value ?? 0;
                        var validate_days = customParaVal?.formData?.next_validate_days ?? 0;

                        var DaysToAdd = customParaVal?.formData?.advanced_birthday_reminder_days;
                        var today_date = new Date()
                        today_date.setDate(today_date.getDate() + DaysToAdd);

                        var month = parseInt(today_date.getMonth()) + 1 // returns the month (from 0 to 11) for the specified date
                        var day = today_date.getDate()

                        cust_query = {
                            status: 1,
                            location_ids: { $in: [ObjectId(locations[l]?._id)] },
                            "m": month, "d": day
                        }

                        customers = await CustomerService.getClientDobSpecific(cust_query) || [];
                        for (var c = 0; c < customers?.length; c++) {
                            console.log(customers[c]._id, 'customers[c].location_ids', customers[c].location_ids)
                            if (customers[c]?.location_ids && customers[c].location_ids?.length > 0) {

                                var validity_date = new Date();
                                var DaysToAdd = parseInt(validate_days);
                                validity_date.setDate(validity_date.getDate() + DaysToAdd);

                                var start_date = dateFormat(new Date(), "yyyy-mm-dd");
                                var end_date = dateFormat(validity_date, "yyyy-mm-dd");
                                var validity_date = dateFormat(validity_date, "dd mmm-yyyy");

                                var dis_code = stringGen(6);
                                var params = {
                                    name: "Client Birthday",
                                    discount_type: "percentage",
                                    discount_value: parseFloat(discount_value),
                                    start_date: start_date,
                                    end_date: end_date,
                                    min_discount: "",
                                    max_discount: "",
                                    min_order_val: min_value,
                                    max_order_val: "",
                                    per_user_occurances: "1",
                                    max_occurances: "1",
                                    category_id: '',
                                    service_id: null,
                                    discount_code: dis_code,
                                    status: 1,
                                    weekend: customParaVal?.formData?.weekend,
                                    holiday: customParaVal?.formData?.holiday,
                                    description: customParaVal?.formData?.desc,
                                    location_id: locations[l]?._id,
                                    company_id: company_id,
                                    customer_id: customers[c]._id,
                                    discount_code_type: "birthday",
                                    all_online_services: customParaVal?.formData?.all_online_services ?? 0,
                                    apply_on_all_services: customParaVal?.formData?.apply_on_all_services ?? 0,

                                }
                                var createdDiscount = await DiscountService.createDiscount(params);

                                if (customers[c].birthday_email_notification != 0 && customers[c].email && customers[c].email != '' && dis_code) {
                                    toMail['location_name'] = locations[l]?.name;
                                    toMail['client_id'] = customers[c]._id;
                                    toMail['client_name'] = customers[c].name;
                                    toMail['company_website'] = "";
                                    toMail['discount_code'] = dis_code;
                                    toMail['validity_date'] = validity_date;
                                    toMail['company_name'] = companies[com].name;
                                    toMail['company_website'] = companies[com].contact_link;
                                    toMail['currency'] = companies[com].currency ? companies[com].currency.symbol : "£";
                                    toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + customers[c]._id
                                    toMail['location_contact'] = companies[com].contact_number
                                    toMail['location_domain'] = locations[l]?.domain
                                    toMail['front_url'] = process.env.FRONT_URL
                                    toMail['validate_days'] = DaysToAdd
                                    toMail['discount_value'] = parseInt(discount_value)
                                    toMail['min_order_value'] = parseInt(min_value)

                                    var to = customers[c].email;
                                    //var to = "priyankastrivedge@gmail.com";
                                    var name = customers[c].name;
                                    var subject = "Client Advanced Birthday";
                                    var temFile = "client_advanced_birthday.hjs";

                                    var emailData = {
                                        company_id: company_id,
                                        location_id: locations[l]?._id,
                                        client_id: customers[c]._id,
                                        subject: subject,
                                        name: name,
                                        type: "cron",
                                        file_type: "client_advanced_birthday",
                                        temp_file: temFile,
                                        html: '',
                                        data: toMail,
                                        date: Date(),
                                        to_email: to,
                                        status: "initial",
                                        email_type: 'marketing'
                                    }

                                    var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                                    var tillDate = increaseDateDays(new Date, days);
                                    if (tillDate) { emailData.till_date = tillDate; }

                                    var waLog = await EmailLogService.createEmailLog(emailData)
                                }

                                if (customers[c].birthday_sms_notification != 0 && customers[c].mobile && customers[c].mobile != '' && dis_code) {

                                    var msg_val = customParaVal?.formData?.advanced_birthday_message;

                                    if (msg_val) {
                                        msg_val = msg_val.replace(/{client_name}/g, customers[c].name);
                                        msg_val = msg_val.replace(/{contact_link}/g, companies[com].contact_link);
                                        msg_val = msg_val.replace(/{validate_days}/g, DaysToAdd);
                                        msg_val = msg_val.replace(/{discount_value}/g, parseInt(discount_value));
                                        msg_val = msg_val.replace(/{validity_date}/g, validity_date);
                                        msg_val = msg_val.replace(/{dis_code}/g, dis_code);

                                        msg_val = msg_val.replace(/{organisation_name}/g, companies[com].name);
                                        msg_val = msg_val.replace(/{location_name}/g, locations[l]?.name);
                                        msg_val = msg_val.replace(/{branch_number}/g, companies[com].contact_number);

                                        var msg = msg_val;
                                    } else {
                                        var msg = '';
                                    }
                                    if (msg) {
                                        var number = customers[c].mobile;
                                        number = parseInt(number, 10);

                                        var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                        var tillDate = increaseDateDays(new Date, days);
                                        var is_wa_exist = customers[c].wa_verified ?? 0;
                                        var is_WA_set = await getWhatsAppDetails(locations[l]?._id, company_id)

                                        if (is_wa_exist && is_WA_set) {
                                            var waMsgData = {
                                                company_id: company_id,
                                                location_id: locations[l]?._id,
                                                client_id: customers[c]._id,
                                                type: "cron",
                                                msg_type: "client_advanced_birthday",
                                                date: Date(),
                                                mobile: customers[c].mobile,
                                                content: msg,
                                                msg_count: 1,
                                                status: "initial",
                                                till_date: tillDate ?? null
                                            }

                                            var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                        }

                                        if (!is_wa_exist || !is_WA_set) {
                                            var smsData = {
                                                company_id: company_id,
                                                location_id: locations[l]?._id,
                                                client_id: customers[c]._id,
                                                type: "cron",
                                                sms_type: "client_advanced_birthday",
                                                date: Date(),
                                                mobile: customers[c].mobile,
                                                content: msg,
                                                sms_count: 1,
                                                sms_setting: companies[com].marketing_sms_setting,
                                                status: "initial",
                                                till_date: tillDate ?? null
                                            }

                                            var smsLog = await SmslogService.createSmsLog(smsData);
                                        }
                                    }
                                }

                            }
                        }
                    }
                }
            }
        }

        return res.status(200).send({ status: 200, flag: true, data: customers, message: "Successfully" })
    } catch (e) {
        console.log("notifyClientOnBirthday Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.notifyClientOnBirthday = async function (req, res, next) {
    try {
        var cronJobAction = await CronjobActionService.getCronjobActionSpecificLocation('location_id', { key_url: "notify_client_on_birthday", status: 0 })

        cronJobAction = cronJobAction.map(s => ObjectId(s));

        var today_date = new Date()
        var day = today_date.getDate()
        var month = parseInt(today_date.getMonth()) + 1 // returns the month (from 0 to 11) for the specified date

        var date = dateFormat(today_date, "yyyy-mm-dd")

        var cust_query = {
            status: 1,
            "m": month, "d": day
        }

        var toMail = {}
        toMail['site_url'] = process.env?.API_URL || "";
        toMail['link_url'] = process.env?.SITE_URL || "";

        var customers = [];

        var companies = await CompanyService.getActiveCompanies({ status: 1 });
        for (var com = 0; com < companies.length; com++) {
            var company_id = companies[com]._id.toString();

            var locations = await LocationService.getActiveLocations({ status: 1, company_id: companies[com]._id, _id: { $nin: cronJobAction } });
            var loc_arr = locations.map(s => s._id.toString());
            var customParaVal = null;

            var customParaAllVal = await await CustomParameterSettingService.getAllCustomParameterSettings({ company_id: ObjectId(company_id), location_id: { $ne: null }, category: 'birthday' })
            if (!customParaAllVal || customParaAllVal?.length == 0) {
                customParaVal = await getCustomParameterData(company_id, null, 'birthday')

                if (customParaVal && customParaVal?.formData && customParaVal?.formData?.birthday_status && customParaVal?.formData?.client_birthday_discount_value > 0 && customParaVal?.formData?.next_validate_days > 0) {

                    var min_value = customParaVal?.formData?.client_birthday_min_order_discount_value ?? 0;
                    var discount_value = customParaVal?.formData?.client_birthday_discount_value ?? 0;
                    var validate_days = customParaVal?.formData?.next_validate_days ?? 0;

                    customers = await CustomerService.getClientDobSpecific(cust_query) || [];
                    for (var c = 0; c < customers?.length; c++) {
                        if (customers[c]?.location_ids && customers[c].location_ids?.length > 0) {

                            var last_app = await AppointmentService.getLastAppointment({ client_id: customers[c]._id.toString() })
                            var location_id = last_app ? last_app?.location_id : null;
                            if (!location_id) {
                                location_id = customers[c]?.location_ids[0];
                            }
                            var loc_query = { _id: ObjectId(location_id) };
                            var location = await LocationService.getLocationComapany(loc_query);

                            var dis_query = { company_id: company_id.toString(), discount_code_type: "birthday", customer_id: customers[c]._id.toString() };

                            dis_query['$and'] = [
                                { start_date: { $lte: date } }, { end_date: { $gte: date } }
                            ];

                            var checkDisCode = await DiscountService.getSingleDiscount(dis_query);
                            var is_redeem = false;

                            if (checkDisCode && checkDisCode?.discount_code) {
                                var appliedQuery = { user_id: customers[c]._id, discount_id: checkDisCode?._id };
                                var applied = await AppliedDiscount.getAppliedDiscountSpecific(appliedQuery)
                                if (applied && applied?.length > 0) {
                                    is_redeem = true;
                                }
                            }
                            var validity_date = '';
                            var DaysToAdd = 0;
                            var disParams = {};

                            if (!is_redeem && checkDisCode?.discount_code) {

                                DaysToAdd = parseInt(validate_days);

                                if (checkDisCode && checkDisCode?.discount_code && validate_days > 0) {

                                    disParams = checkDisCode;

                                    validity_date = dateFormat(checkDisCode?.end_date, "dd mmm-yyyy");

                                } else {
                                    var validity_date = new Date();
                                    validity_date.setDate(validity_date.getDate() + DaysToAdd);

                                    var start_date = dateFormat(new Date(), "yyyy-mm-dd");
                                    var end_date = dateFormat(validity_date, "yyyy-mm-dd");
                                    var validity_date = dateFormat(validity_date, "dd mmm-yyyy");

                                    var dis_code = stringGen(6);
                                    disParams = {
                                        name: "Client Birthday",
                                        discount_type: "percentage",
                                        discount_value: parseFloat(discount_value),
                                        start_date: start_date,
                                        end_date: end_date,
                                        min_discount: "",
                                        max_discount: "",
                                        min_order_val: min_value,
                                        max_order_val: "",
                                        per_user_occurances: "1",
                                        max_occurances: "1",
                                        category_id: '',
                                        service_id: null,
                                        discount_code: dis_code,
                                        status: 1,
                                        weekend: customParaVal?.formData?.weekend,
                                        holiday: customParaVal?.formData?.holiday,
                                        description: customParaVal?.formData?.desc,
                                        location_id: null,
                                        company_id: company_id,
                                        customer_id: customers[c]._id,
                                        discount_code_type: "birthday",
                                        all_online_services: customParaVal?.formData?.all_online_services ?? 0,
                                        apply_on_all_services: customParaVal?.formData?.apply_on_all_services ?? 0,

                                    }
                                    var createdDiscount = await DiscountService.createDiscount(disParams);
                                }

                                if (customers[c].birthday_email_notification != 0 && customers[c].email && customers[c].email != '' && disParams?.discount_code) {
                                    toMail['location_name'] = location[0]?.name;
                                    toMail['client_id'] = customers[c]._id;
                                    toMail['client_name'] = customers[c].name;
                                    toMail['company_website'] = "";
                                    toMail['discount_code'] = disParams?.discount_code;
                                    toMail['validity_date'] = validity_date;
                                    toMail['company_name'] = companies[com].name;
                                    toMail['company_website'] = companies[com].contact_link;
                                    toMail['currency'] = companies[com].currency ? companies[com].currency.symbol : "£";
                                    toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + customers[c]._id
                                    toMail['location_contact'] = companies[com].contact_number
                                    toMail['location_domain'] = location[0]?.domain
                                    toMail['front_url'] = process.env.FRONT_URL
                                    toMail['validate_days'] = DaysToAdd
                                    toMail['discount_value'] = parseInt(discount_value)
                                    toMail['min_order_value'] = parseInt(min_value)

                                    var to = customers[c].email;
                                    //var to = "priyankastrivedge@gmail.com";
                                    var name = customers[c].name;
                                    var subject = "Client Birthday";
                                    var temFile = "client_birthday_mail.hjs";

                                    var emailData = {
                                        company_id: company_id,
                                        location_id: location[0]?._id,
                                        client_id: customers[c]._id,
                                        subject: subject,
                                        name: name,
                                        type: "cron",
                                        file_type: "client_birthday",
                                        temp_file: temFile,
                                        html: '',
                                        data: toMail,
                                        date: Date(),
                                        to_email: to,
                                        status: "initial",
                                        email_type: 'marketing'
                                    }

                                    var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                                    var tillDate = increaseDateDays(new Date, days);
                                    if (tillDate) { emailData.till_date = tillDate; }

                                    var waLog = await EmailLogService.createEmailLog(emailData)
                                }

                                if (customers[c].birthday_sms_notification != 0 && customers[c].mobile && customers[c].mobile != '' && disParams?.discount_code) {

                                    var msg_val = customParaVal?.formData?.birthday_message;
                                    console.log('msg_val', msg_val)

                                    if (msg_val) {
                                        msg_val = msg_val.replace(/{client_name}/g, customers[c].name);
                                        msg_val = msg_val.replace(/{contact_link}/g, location[0]?.contact_link);
                                        msg_val = msg_val.replace(/{validate_days}/g, DaysToAdd);
                                        msg_val = msg_val.replace(/{discount_value}/g, parseInt(discount_value));
                                        msg_val = msg_val.replace(/{validity_date}/g, validity_date);
                                        msg_val = msg_val.replace(/{dis_code}/g, disParams?.discount_code);

                                        msg_val = msg_val.replace(/{organisation_name}/g, companies[com].name);
                                        msg_val = msg_val.replace(/{location_name}/g, location[0]?.name);
                                        msg_val = msg_val.replace(/{branch_number}/g, location[0]?.contact_number);

                                        var msg = msg_val;
                                    } else {
                                        var msg = '';
                                    }
                                    console.log('else redeem msg', msg)
                                    if (msg) {
                                        var number = customers[c].mobile;
                                        number = parseInt(number, 10);

                                        var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                        var tillDate = increaseDateDays(new Date, days);
                                        var is_wa_exist = customers[c].wa_verified ?? 0;
                                        var is_WA_set = await getWhatsAppDetails(location[0]?._id, company_id)

                                        if (is_wa_exist && is_WA_set) {
                                            var waMsgData = {
                                                company_id: company_id,
                                                location_id: location[0]?._id,
                                                client_id: customers[c]._id,
                                                type: "cron",
                                                msg_type: "client_birthday",
                                                date: Date(),
                                                mobile: customers[c].mobile,
                                                content: msg,
                                                msg_count: 1,
                                                status: "initial",
                                                till_date: tillDate ?? null
                                            }

                                            var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                        }

                                        if (!is_wa_exist || !is_WA_set) {
                                            var smsData = {
                                                company_id: company_id,
                                                location_id: location[0]?._id,
                                                client_id: customers[c]._id,
                                                type: "cron",
                                                sms_type: "client_birthday",
                                                date: Date(),
                                                mobile: customers[c].mobile,
                                                content: msg,
                                                sms_count: 1,
                                                sms_setting: companies[com].marketing_sms_setting,
                                                status: "initial",
                                                till_date: tillDate ?? null
                                            }

                                            var smsLog = await SmslogService.createSmsLog(smsData);
                                        }
                                    }
                                }
                            } else if (is_redeem) {

                                if (customers[c].birthday_sms_notification != 0 && customers[c].mobile && customers[c].mobile != '' && disParams?.discount_code) {

                                    var msg_val = customParaVal?.formData?.redeem_code_birthday_message;

                                    if (msg_val) {
                                        msg_val = msg_val.replace(/{client_name}/g, customers[c].name);
                                        msg_val = msg_val.replace(/{contact_link}/g, location[0]?.contact_link);
                                        msg_val = msg_val.replace(/{validate_days}/g, DaysToAdd);
                                        msg_val = msg_val.replace(/{discount_value}/g, parseInt(discount_value));
                                        msg_val = msg_val.replace(/{validity_date}/g, validity_date);
                                        msg_val = msg_val.replace(/{dis_code}/g, disParams?.discount_code);

                                        msg_val = msg_val.replace(/{organisation_name}/g, companies[com].name);
                                        msg_val = msg_val.replace(/{location_name}/g, location[0]?.name);
                                        msg_val = msg_val.replace(/{branch_number}/g, location[0]?.contact_number);

                                        var msg = msg_val;
                                    } else {
                                        var msg = '';
                                    }
                                    if (msg) {
                                        var number = customers[c].mobile;
                                        number = parseInt(number, 10);

                                        var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                        var tillDate = increaseDateDays(new Date, days);
                                        var is_wa_exist = customers[c].wa_verified ?? 0;
                                        var is_WA_set = await getWhatsAppDetails(location[0]?._id, company_id)

                                        if (is_wa_exist && is_WA_set) {
                                            var waMsgData = {
                                                company_id: company_id,
                                                location_id: location[0]?._id,
                                                client_id: customers[c]._id,
                                                type: "cron",
                                                msg_type: "client_birthday",
                                                date: Date(),
                                                mobile: customers[c].mobile,
                                                content: msg,
                                                msg_count: 1,
                                                status: "initial",
                                                till_date: tillDate ?? null
                                            }

                                            var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                        }

                                        if (!is_wa_exist || !is_WA_set) {
                                            var smsData = {
                                                company_id: company_id,
                                                location_id: location[0]?._id,
                                                client_id: customers[c]._id,
                                                type: "cron",
                                                sms_type: "client_birthday",
                                                date: Date(),
                                                mobile: customers[c].mobile,
                                                content: msg,
                                                sms_count: 1,
                                                sms_setting: companies[com].marketing_sms_setting,
                                                status: "initial",
                                                till_date: tillDate ?? null
                                            }

                                            var smsLog = await SmslogService.createSmsLog(smsData);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (customParaAllVal?.length > 0 && locations?.length > 0) {

                for (var l = 0; l < locations.length; l++) {

                    customParaVal = await getCustomParameterData(company_id, locations[l]?._id, 'birthday')

                    //console.log('customParaAllVal?.length', customParaVal?.formData)

                    if (customParaVal && customParaVal?.formData && customParaVal?.formData?.birthday_status && customParaVal?.formData?.next_validate_days > 0 && customParaVal?.formData?.client_birthday_discount_value > 0 && customParaVal?.formData?.next_validate_days > 0) {

                        var min_value = customParaVal?.formData?.client_birthday_min_order_discount_value ?? 0;
                        var discount_value = customParaVal?.formData?.client_birthday_discount_value ?? 0;
                        var validate_days = customParaVal?.formData?.next_validate_days ?? 0;

                        var DaysToAdd = customParaVal?.formData?.next_validate_days;

                        //var month = parseInt(today_date.getMonth()) + 1 // returns the month (from 0 to 11) for the specified date

                        cust_query = {
                            status: 1,
                            location_ids: { $in: [ObjectId(locations[l]?._id)] },
                            "m": month, "d": day
                        }

                        customers = await CustomerService.getClientDobSpecific(cust_query) || [];
                        //console.log('customers?.length', customers?.length)
                        for (var c = 0; c < customers?.length; c++) {
                            if (customers[c]?.location_ids && customers[c].location_ids?.length > 0) {

                                var dis_query = { company_id: companies[com]._id.toString(), location_id: locations[l]?._id.toString(), discount_code_type: "birthday", customer_id: customers[c]._id.toString() };

                                dis_query['$and'] = [
                                    { start_date: { $lte: date } }, { end_date: { $gte: date } }
                                ];

                                var checkDisCode = await DiscountService.getSingleDiscount(dis_query);
                                var is_redeem = false;

                                if (checkDisCode && checkDisCode?.discount_code) {
                                    var appliedQuery = { user_id: customers[c]._id, discount_id: checkDisCode?._id };
                                    var applied = await AppliedDiscount.getAppliedDiscountSpecific(appliedQuery)
                                    if (applied && applied?.length > 0) {
                                        is_redeem = true;
                                    }
                                }

                                var validity_date = '';
                                var DaysToAdd = 0;
                                var disParams = {};

                                if (!is_redeem && checkDisCode?.discount_code) {

                                    DaysToAdd = parseInt(validate_days);

                                    if (checkDisCode && checkDisCode?.discount_code && validate_days > 0) {
                                        disParams = checkDisCode;
                                        validity_date = dateFormat(checkDisCode?.end_date, "dd mmm-yyyy");
                                    } else {
                                        validity_date = new Date();
                                        DaysToAdd = parseInt(validate_days);
                                        validity_date.setDate(validity_date.getDate() + DaysToAdd);

                                        var start_date = dateFormat(new Date(), "yyyy-mm-dd");
                                        var end_date = dateFormat(validity_date, "yyyy-mm-dd");
                                        var validity_date = dateFormat(validity_date, "dd mmm-yyyy");

                                        var dis_code = stringGen(6);
                                        var disParams = {
                                            name: "Client Birthday",
                                            discount_type: "percentage",
                                            discount_value: parseFloat(discount_value),
                                            start_date: start_date,
                                            end_date: end_date,
                                            min_discount: "",
                                            max_discount: "",
                                            min_order_val: min_value,
                                            max_order_val: "",
                                            per_user_occurances: "1",
                                            max_occurances: "1",
                                            category_id: '',
                                            service_id: null,
                                            discount_code: dis_code,
                                            status: 1,
                                            weekend: customParaVal?.formData?.weekend,
                                            holiday: customParaVal?.formData?.holiday,
                                            description: customParaVal?.formData?.desc,
                                            location_id: locations[l]?._id,
                                            company_id: company_id,
                                            customer_id: customers[c]._id,
                                            discount_code_type: "birthday",
                                            all_online_services: customParaVal?.formData?.all_online_services ?? 0,
                                            apply_on_all_services: customParaVal?.formData?.apply_on_all_services ?? 0,

                                        }
                                        var createdDiscount = await DiscountService.createDiscount(disParams);
                                    }

                                    if (customers[c].birthday_email_notification != 0 && customers[c].email && customers[c].email != '' && disParams?.discount_code) {
                                        toMail['location_name'] = locations[l]?.name;
                                        toMail['client_id'] = customers[c]._id;
                                        toMail['client_name'] = customers[c].name;
                                        toMail['company_website'] = "";
                                        toMail['discount_code'] = disParams?.discount_code;
                                        toMail['validity_date'] = validity_date;
                                        toMail['company_name'] = companies[com].name;
                                        toMail['company_website'] = companies[com].contact_link;
                                        toMail['currency'] = companies[com].currency ? companies[com].currency.symbol : "£";
                                        toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + customers[c]._id
                                        toMail['location_contact'] = companies[com].contact_number
                                        toMail['location_domain'] = locations[l]?.domain
                                        toMail['front_url'] = process.env.FRONT_URL
                                        toMail['validate_days'] = DaysToAdd
                                        toMail['discount_value'] = parseInt(discount_value)
                                        toMail['min_order_value'] = parseInt(min_value)

                                        var to = customers[c].email;
                                        //var to = "priyankastrivedge@gmail.com";
                                        var name = customers[c].name;
                                        var subject = "Client Birthday";
                                        var temFile = "client_birthday_mail.hjs";

                                        var emailData = {
                                            company_id: company_id,
                                            location_id: locations[l]?._id,
                                            client_id: customers[c]._id,
                                            subject: subject,
                                            name: name,
                                            type: "cron",
                                            file_type: "client_birthday",
                                            temp_file: temFile,
                                            html: '',
                                            data: toMail,
                                            date: Date(),
                                            to_email: to,
                                            status: "initial",
                                            email_type: 'marketing'
                                        }

                                        var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                                        var tillDate = increaseDateDays(new Date, days);
                                        if (tillDate) { emailData.till_date = tillDate; }

                                        var waLog = await EmailLogService.createEmailLog(emailData)
                                    }

                                    if (customers[c].birthday_sms_notification != 0 && customers[c].mobile && customers[c].mobile != '' && disParams?.discount_code) {

                                        var msg_val = customParaVal?.formData?.birthday_message;
                                        if (msg_val) {
                                            msg_val = msg_val.replace(/{client_name}/g, customers[c].name);
                                            msg_val = msg_val.replace(/{contact_link}/g, locations[l].contact_link);
                                            msg_val = msg_val.replace(/{validate_days}/g, DaysToAdd);
                                            msg_val = msg_val.replace(/{discount_value}/g, parseInt(discount_value));
                                            msg_val = msg_val.replace(/{validity_date}/g, validity_date);
                                            msg_val = msg_val.replace(/{dis_code}/g, disParams?.discount_code);

                                            msg_val = msg_val.replace(/{organisation_name}/g, companies[com].name);
                                            msg_val = msg_val.replace(/{location_name}/g, locations[l]?.name);
                                            msg_val = msg_val.replace(/{branch_number}/g, locations[l].contact_number);

                                            var msg = msg_val;
                                        } else {
                                            var msg = '';
                                        }
                                        if (msg) {
                                            var number = customers[c].mobile;
                                            number = parseInt(number, 10);

                                            var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                            var tillDate = increaseDateDays(new Date, days);
                                            var is_wa_exist = customers[c].wa_verified ?? 0;
                                            var is_WA_set = await getWhatsAppDetails(locations[l]?._id, company_id)

                                            if (is_wa_exist && is_WA_set) {
                                                var waMsgData = {
                                                    company_id: company_id,
                                                    location_id: locations[l]?._id,
                                                    client_id: customers[c]._id,
                                                    type: "cron",
                                                    msg_type: "client_birthday",
                                                    date: Date(),
                                                    mobile: customers[c].mobile,
                                                    content: msg,
                                                    msg_count: 1,
                                                    status: "initial",
                                                    till_date: tillDate ?? null
                                                }

                                                var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                            }

                                            if (!is_wa_exist || !is_WA_set) {
                                                var smsData = {
                                                    company_id: company_id,
                                                    location_id: locations[l]?._id,
                                                    client_id: customers[c]._id,
                                                    type: "cron",
                                                    sms_type: "client_birthday",
                                                    date: Date(),
                                                    mobile: customers[c].mobile,
                                                    content: msg,
                                                    sms_count: 1,
                                                    sms_setting: companies[com].marketing_sms_setting,
                                                    status: "initial",
                                                    till_date: tillDate ?? null
                                                }

                                                var smsLog = await SmslogService.createSmsLog(smsData);
                                            }
                                        }
                                    }
                                } else if (is_redeem) {
                                    disParams = checkDisCode;

                                    if (customers[c].birthday_sms_notification != 0 && customers[c].mobile && customers[c].mobile != '' && disParams?.discount_code) {

                                        var msg_val = customParaVal?.formData?.redeem_code_birthday_message;

                                        if (msg_val) {
                                            msg_val = msg_val.replace(/{client_name}/g, customers[c].name);
                                            msg_val = msg_val.replace(/{contact_link}/g, locations[l].contact_link);
                                            msg_val = msg_val.replace(/{validate_days}/g, DaysToAdd);
                                            msg_val = msg_val.replace(/{discount_value}/g, parseInt(discount_value));
                                            msg_val = msg_val.replace(/{validity_date}/g, validity_date);
                                            msg_val = msg_val.replace(/{dis_code}/g, disParams?.discount_code);

                                            msg_val = msg_val.replace(/{organisation_name}/g, companies[com].name);
                                            msg_val = msg_val.replace(/{location_name}/g, locations[l]?.name);
                                            msg_val = msg_val.replace(/{branch_number}/g, locations[l].contact_number);

                                            var msg = msg_val;
                                        } else {
                                            var msg = '';
                                        }
                                        if (msg) {
                                            var number = customers[c].mobile;
                                            number = parseInt(number, 10);

                                            var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                            var tillDate = increaseDateDays(new Date, days);
                                            var is_wa_exist = customers[c].wa_verified ?? 0;
                                            var is_WA_set = await getWhatsAppDetails(locations[l]?._id, company_id)

                                            if (is_wa_exist && is_WA_set) {
                                                var waMsgData = {
                                                    company_id: company_id,
                                                    location_id: locations[l]?._id,
                                                    client_id: customers[c]._id,
                                                    type: "cron",
                                                    msg_type: "client_birthday",
                                                    date: Date(),
                                                    mobile: customers[c].mobile,
                                                    content: msg,
                                                    msg_count: 1,
                                                    status: "initial",
                                                    till_date: tillDate ?? null
                                                }

                                                var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                            }

                                            if (!is_wa_exist || !is_WA_set) {
                                                var smsData = {
                                                    company_id: company_id,
                                                    location_id: locations[l]?._id,
                                                    client_id: customers[c]._id,
                                                    type: "cron",
                                                    sms_type: "client_birthday",
                                                    date: Date(),
                                                    mobile: customers[c].mobile,
                                                    content: msg,
                                                    sms_count: 1,
                                                    sms_setting: companies[com].marketing_sms_setting,
                                                    status: "initial",
                                                    till_date: tillDate ?? null
                                                }

                                                var smsLog = await SmslogService.createSmsLog(smsData);
                                            }
                                        }
                                    }
                                }

                            }
                        }
                    }
                }
            }
        }

        return res.status(200).send({ status: 200, flag: true, data: customers, message: "Successfully" })
    } catch (e) {
        console.log("notifyClientOnBirthday Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.notifyClientOnPostBirthday = async function (req, res, next) {
    try {
        var cronJobAction = await CronjobActionService.getCronjobActionSpecificLocation('location_id', { key_url: "notify_client_on_post_birthday", status: 0 })

        cronJobAction = cronJobAction.map(s => ObjectId(s));

        var today_date = new Date()
        var date = dateFormat(today_date, "yyyy-mm-dd")

        var toMail = {}
        toMail['site_url'] = process.env?.API_URL || "";
        toMail['link_url'] = process.env?.SITE_URL || "";

        var disData = [];

        var companies = await CompanyService.getActiveCompanies({ status: 1 });
        for (var com = 0; com < companies.length; com++) {
            var company_id = companies[com]._id.toString();

            var locations = await LocationService.getActiveLocations({ status: 1, company_id: companies[com]._id, _id: { $nin: cronJobAction } });
            var loc_arr = locations.map(s => s._id.toString());

            var customParaAllVal = await await CustomParameterSettingService.getAllCustomParameterSettings({ company_id: ObjectId(company_id), location_id: { $ne: null }, category: 'birthday' })

            if (customParaAllVal && customParaAllVal?.length > 0) {
                if (locations?.length > 0) {
                    for (var l = 0; l < locations.length; l++) {

                        var customParaVal = await getCustomParameterData(company_id, locations[l]?._id, 'birthday')

                        if (customParaVal && customParaVal?.formData && customParaVal?.formData?.post_birthday_status && customParaVal?.formData?.next_validate_days > 0 && customParaVal?.formData?.client_birthday_discount_value > 0) {

                            var min_value = customParaVal?.formData?.client_birthday_min_order_discount_value ?? 0;
                            var discount_value = customParaVal?.formData?.client_birthday_discount_value ?? 0;
                            var DaysToAdd = customParaVal?.formData?.next_validate_days ?? 0;
                            var postBDay = customParaVal?.formData?.post_birthday_reminder_days || 0;
                            var today_date = new Date()
                            today_date.setDate(today_date.getDate() + postBDay);
                            today_date = dateFormat(today_date, "yyyy-mm-dd")
                            //console.log('postBDay', postBDay, 'today_date', today_date)

                            var dis_query = { company_id: companies[com]._id.toString(), location_id: locations[l]._id.toString(), end_date: today_date, discount_code_type: 'birthday' }

                            disData = await DiscountService.getDiscountsWithCustomer(dis_query);

                            if (disData?.length > 0) {
                                for (var d = 0; d < disData.length; d++) {

                                    var disParams = {};
                                    var validity_date = '';
                                    is_redeem = false;
                                    var appliedQuery = { user_id: disData[d]?.customer_id?._id, discount_id: disData[d]?._id };
                                    var applied = await AppliedDiscount.getAppliedDiscountSpecific(appliedQuery)
                                    if (applied && applied?.length > 0) {
                                        is_redeem = true;
                                    }
                                    if (!is_redeem && disData[d]?.discount_code) {

                                        disParams = disData[d];
                                        validity_date = dateFormat(disData[d]?.end_date, "dd mmm-yyyy");

                                        if (disData[d]?.customer_id?.birthday_email_notification != 0 && disData[d]?.customer_id?.email && disData[d]?.customer_id?.email != '' && disData[d]?.discount_code) {
                                            toMail['location_name'] = locations[l]?.name;
                                            toMail['client_id'] = disData[d]?.customer_id?._id;
                                            toMail['client_name'] = disData[d]?.customer_id?.name;
                                            toMail['company_website'] = "";
                                            toMail['discount_code'] = disData[d]?.discount_code;
                                            toMail['validity_date'] = validity_date;
                                            toMail['company_name'] = companies[com].name;
                                            toMail['company_website'] = companies[com].contact_link;
                                            toMail['currency'] = companies[com].currency ? companies[com].currency.symbol : "£";
                                            toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + disData[d]?.customer_id?._id
                                            toMail['location_contact'] = companies[com].contact_number
                                            toMail['location_domain'] = locations[l]?.domain
                                            toMail['front_url'] = process.env.FRONT_URL
                                            toMail['validate_days'] = DaysToAdd
                                            toMail['discount_value'] = parseInt(discount_value)
                                            toMail['min_order_value'] = parseInt(min_value)

                                            var to = disData[d]?.customer_id?.email;
                                            //var to = "priyankastrivedge@gmail.com";
                                            var name = disData[d]?.customer_id?.name;
                                            var subject = "Client Birthday";
                                            var temFile = "client_post_birthday.hjs";

                                            var emailData = {
                                                company_id: company_id,
                                                location_id: locations[l]?._id,
                                                client_id: disData[d]?.customer_id?._id,
                                                subject: subject,
                                                name: name,
                                                type: "cron",
                                                file_type: "client_post_birthday",
                                                temp_file: temFile,
                                                html: '',
                                                data: toMail,
                                                date: Date(),
                                                to_email: to,
                                                status: "initial",
                                                email_type: 'marketing'
                                            }

                                            var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                                            var tillDate = increaseDateDays(new Date, days);
                                            if (tillDate) { emailData.till_date = tillDate; }

                                            await EmailLogService.createEmailLog(emailData)
                                        }

                                        if (disData[d]?.customer_id?.birthday_sms_notification != 0 && disData[d]?.customer_id?.mobile && disData[d]?.customer_id?.mobile != '' && disData[d]?.discount_code) {

                                            var msg_val = customParaVal?.formData?.post_birthday_message;

                                            if (msg_val) {
                                                msg_val = msg_val.replace(/{client_name}/g, disData[d]?.customer_id?.name);
                                                msg_val = msg_val.replace(/{contact_link}/g, locations[l].contact_link);
                                                msg_val = msg_val.replace(/{validate_days}/g, DaysToAdd);
                                                msg_val = msg_val.replace(/{discount_value}/g, parseInt(discount_value));
                                                msg_val = msg_val.replace(/{validity_date}/g, validity_date);
                                                msg_val = msg_val.replace(/{dis_code}/g, disData[d]?.discount_code);

                                                msg_val = msg_val.replace(/{organisation_name}/g, companies[com].name);
                                                msg_val = msg_val.replace(/{location_name}/g, locations[l]?.name);
                                                msg_val = msg_val.replace(/{branch_number}/g, locations[l].contact_number);

                                                var msg = msg_val;
                                            } else {
                                                var msg = '';
                                            }
                                            if (msg) {
                                                var number = disData[d]?.customer_id?.mobile;
                                                number = parseInt(number, 10);

                                                var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                                var tillDate = increaseDateDays(new Date, days);
                                                var is_wa_exist = disData[d]?.customer_id?.wa_verified ?? 0;
                                                var is_WA_set = await getWhatsAppDetails(locations[l]?._id, company_id)

                                                if (is_wa_exist && is_WA_set) {
                                                    var waMsgData = {
                                                        company_id: company_id,
                                                        location_id: locations[l]?._id,
                                                        client_id: disData[d]?.customer_id?._id,
                                                        type: "cron",
                                                        msg_type: "client_birthday",
                                                        date: Date(),
                                                        mobile: disData[d]?.customer_id?.mobile,
                                                        content: msg,
                                                        msg_count: 1,
                                                        status: "initial",
                                                        till_date: tillDate ?? null
                                                    }

                                                    await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                                }

                                                if (!is_wa_exist || !is_WA_set) {
                                                    var smsData = {
                                                        company_id: company_id,
                                                        location_id: locations[l]?._id,
                                                        client_id: disData[d]?.customer_id?._id,
                                                        type: "cron",
                                                        sms_type: "client_birthday",
                                                        date: Date(),
                                                        mobile: disData[d]?.customer_id?.mobile,
                                                        content: msg,
                                                        sms_count: 1,
                                                        sms_setting: companies[com].marketing_sms_setting,
                                                        status: "initial",
                                                        till_date: tillDate ?? null
                                                    }

                                                    await SmslogService.createSmsLog(smsData);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {

                var customParaVal = await getCustomParameterData(company_id, null, 'birthday')

                if (customParaVal && customParaVal?.formData && customParaVal?.formData?.post_birthday_status && customParaVal?.formData?.next_validate_days > 0 && customParaVal?.formData?.client_birthday_discount_value > 0) {

                    var min_value = customParaVal?.formData?.client_birthday_min_order_discount_value ?? 0;
                    var discount_value = customParaVal?.formData?.client_birthday_discount_value ?? 0;
                    var DaysToAdd = customParaVal?.formData?.next_validate_days ?? 0;

                    var postBDay = customParaVal?.formData?.post_birthday_reminder_days || 0;
                    var today_date = new Date()
                    today_date.setDate(today_date.getDate() + postBDay);
                    today_date = dateFormat(today_date, "yyyy-mm-dd")
                    //console.log('postBDay', postBDay, 'today_date', today_date)

                    var dis_query = { company_id: companies[com]._id, location_id: null, end_date: today_date, discount_code_type: 'birthday' }

                    //console.log('else dis_query', dis_query)

                    disData = await DiscountService.getDiscountsWithCustomer(dis_query)

                    if (disData?.length > 0) {
                        for (var d = 0; d < disData.length; d++) {

                            var last_app = await AppointmentService.getLastAppointment({ client_id: disData[d]?.customer_id?._id })

                            var location_id = last_app ? last_app?.location_id : null;
                            if (!location_id) {
                                location_id = customers[c]?.location_ids[0];
                            }
                            var loc_query = { _id: ObjectId(location_id) };
                            var location = await LocationService.getLocationComapany(loc_query);

                            var disParams = {};
                            var validity_date = '';
                            is_redeem = false;
                            var appliedQuery = { user_id: disData[d]?.customer_id?._id, discount_id: disData[d]?._id };
                            var applied = await AppliedDiscount.getAppliedDiscountSpecific(appliedQuery)
                            if (applied && applied?.length > 0) {
                                is_redeem = true;
                            }
                            if (!is_redeem && disData[d]?.discount_code) {

                                disParams = disData[d];
                                validity_date = dateFormat(disData[d]?.end_date, "dd mmm-yyyy");

                                if (disData[d]?.customer_id?.birthday_email_notification != 0 && disData[d]?.customer_id?.email && disData[d]?.customer_id?.email != '' && disData[d]?.discount_code) {
                                    toMail['location_name'] = location[0]?.name;
                                    toMail['client_id'] = disData[d]?.customer_id?._id;
                                    toMail['client_name'] = disData[d]?.customer_id?.name;
                                    toMail['company_website'] = "";
                                    toMail['discount_code'] = disData[d]?.discount_code;
                                    toMail['validity_date'] = validity_date;
                                    toMail['company_name'] = companies[com].name;
                                    toMail['company_website'] = companies[com].contact_link;
                                    toMail['currency'] = companies[com].currency ? companies[com].currency.symbol : "£";
                                    toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + disData[d]?.customer_id?._id
                                    toMail['location_contact'] = location[0]?.contact_number
                                    toMail['front_url'] = process.env.FRONT_URL
                                    toMail['validate_days'] = DaysToAdd
                                    toMail['discount_value'] = parseInt(discount_value)
                                    toMail['min_order_value'] = parseInt(min_value)

                                    var to = disData[d]?.customer_id?.email;
                                    //var to = "priyankastrivedge@gmail.com";
                                    var name = disData[d]?.customer_id?.name;
                                    var subject = "Client Birthday";
                                    var temFile = "client_post_birthday.hjs";

                                    var emailData = {
                                        company_id: company_id,
                                        location_id: location[0]?._id,
                                        client_id: disData[d]?.customer_id?._id,
                                        subject: subject,
                                        name: name,
                                        type: "cron",
                                        file_type: "client_post_birthday",
                                        temp_file: temFile,
                                        html: '',
                                        data: toMail,
                                        date: Date(),
                                        to_email: to,
                                        status: "initial",
                                        email_type: 'marketing'
                                    }

                                    var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                                    var tillDate = increaseDateDays(new Date, days);
                                    if (tillDate) { emailData.till_date = tillDate; }

                                    var waLog = await EmailLogService.createEmailLog(emailData)
                                }

                                if (disData[d]?.customer_id?.birthday_sms_notification != 0 && disData[d]?.customer_id?.mobile && disData[d]?.customer_id?.mobile != '' && disData[d]?.discount_code) {

                                    var msg_val = customParaVal?.formData?.post_birthday_message;

                                    if (msg_val) {
                                        msg_val = msg_val.replace(/{client_name}/g, disData[d]?.customer_id?.name);
                                        msg_val = msg_val.replace(/{contact_link}/g, location[0]?.contact_link);
                                        msg_val = msg_val.replace(/{validate_days}/g, DaysToAdd);
                                        msg_val = msg_val.replace(/{discount_value}/g, parseInt(discount_value));
                                        msg_val = msg_val.replace(/{validity_date}/g, validity_date);
                                        msg_val = msg_val.replace(/{dis_code}/g, disData[d]?.discount_code);

                                        msg_val = msg_val.replace(/{organisation_name}/g, companies[com].name);
                                        msg_val = msg_val.replace(/{location_name}/g, location[0]?.name);
                                        msg_val = msg_val.replace(/{branch_number}/g, location[0]?.contact_number);

                                        var msg = msg_val;
                                    } else {
                                        var msg = '';
                                    }
                                    if (msg) {
                                        var number = disData[d]?.customer_id?.mobile;
                                        number = parseInt(number, 10);

                                        var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                        var tillDate = increaseDateDays(new Date, days);
                                        var is_wa_exist = disData[d]?.customer_id?.wa_verified ?? 0;
                                        var is_WA_set = await getWhatsAppDetails(location[0]?._id, company_id)

                                        if (is_wa_exist && is_WA_set) {
                                            var waMsgData = {
                                                company_id: company_id,
                                                location_id: location[0]?._id,
                                                client_id: disData[d]?.customer_id?._id,
                                                type: "cron",
                                                msg_type: "client_birthday",
                                                date: Date(),
                                                mobile: disData[d]?.customer_id?.mobile,
                                                content: msg,
                                                msg_count: 1,
                                                status: "initial",
                                                till_date: tillDate ?? null
                                            }

                                            var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                        }

                                        if (!is_wa_exist || !is_WA_set) {
                                            var smsData = {
                                                company_id: company_id,
                                                location_id: location[0]?._id,
                                                client_id: disData[d]?.customer_id?._id,
                                                type: "cron",
                                                sms_type: "client_birthday",
                                                date: Date(),
                                                mobile: disData[d]?.customer_id?.mobile,
                                                content: msg,
                                                sms_count: 1,
                                                sms_setting: companies[com].marketing_sms_setting,
                                                status: "initial",
                                                till_date: tillDate ?? null
                                            }

                                            var smsLog = await SmslogService.createSmsLog(smsData);
                                        }
                                    }
                                }

                            } else if (is_redeem) {

                                if (disData[d]?.customer_id?.birthday_sms_notification != 0 && disData[d]?.customer_id?.mobile && disData[d]?.customer_id?.mobile != '' && disData[d]?.discount_code) {

                                    var msg_val = customParaVal?.formData?.redeem_code_birthday_message;

                                    if (msg_val) {
                                        msg_val = msg_val.replace(/{client_name}/g, disData[d]?.customer_id?.name);
                                        msg_val = msg_val.replace(/{contact_link}/g, locations[l].contact_link);
                                        msg_val = msg_val.replace(/{validate_days}/g, DaysToAdd);
                                        msg_val = msg_val.replace(/{discount_value}/g, parseInt(discount_value));
                                        msg_val = msg_val.replace(/{validity_date}/g, validity_date);
                                        msg_val = msg_val.replace(/{dis_code}/g, disData[d]?.discount_code);

                                        msg_val = msg_val.replace(/{organisation_name}/g, companies[com].name);
                                        msg_val = msg_val.replace(/{location_name}/g, locations[l]?.name);
                                        msg_val = msg_val.replace(/{branch_number}/g, locations[l].contact_number);

                                        var msg = msg_val;
                                    } else {
                                        var msg = '';
                                    }
                                    if (msg) {
                                        var number = disData[d]?.customer_id?.mobile;
                                        number = parseInt(number, 10);

                                        var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                        var tillDate = increaseDateDays(new Date, days);
                                        var is_wa_exist = disData[d]?.customer_id?.wa_verified ?? 0;
                                        var is_WA_set = await getWhatsAppDetails(locations[l]?._id, company_id)

                                        if (is_wa_exist && is_WA_set) {
                                            var waMsgData = {
                                                company_id: company_id,
                                                location_id: locations[l]?._id,
                                                client_id: disData[d]?.customer_id?._id,
                                                type: "cron",
                                                msg_type: "client_birthday",
                                                date: Date(),
                                                mobile: disData[d]?.customer_id?.mobile,
                                                content: msg,
                                                msg_count: 1,
                                                status: "initial",
                                                till_date: tillDate ?? null
                                            }

                                            await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                        }

                                        if (!is_wa_exist || !is_WA_set) {
                                            var smsData = {
                                                company_id: company_id,
                                                location_id: locations[l]?._id,
                                                client_id: disData[d]?.customer_id?._id,
                                                type: "cron",
                                                sms_type: "client_birthday",
                                                date: Date(),
                                                mobile: disData[d]?.customer_id?.mobile,
                                                content: msg,
                                                sms_count: 1,
                                                sms_setting: companies[com].marketing_sms_setting,
                                                status: "initial",
                                                till_date: tillDate ?? null
                                            }

                                            await SmslogService.createSmsLog(smsData);
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }
        }

        return res.status(200).send({ status: 200, flag: true, data: disData, message: "Successfully" })
    } catch (e) {
        console.log("notifyClientOnBirthday Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

function stringGen(yourNumber) {
    var text = ""
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789"

    for (var i = 0; i < yourNumber; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length))

    return text
}

// send reminder to customer before 48 Hours
exports.cronJobFirst = async function (req, res, next) {
    try {
        var today_date_time = moment();
        var today_date = new Date();
        var final_today_date = dateFormat(today_date, "yyyy-mm-dd");
        // $gte: new Date(today_date.setHours(0, 0, 0, 0))
        var query = {
            date: { $gte: final_today_date },
            booking_status: { $nin: ['cancel', 'no_shows', 'complete'] }
        };

        var cronJobAction = await CronjobActionService.getCronjobActionSpecificLocation('location_id', { key_url: "cron_job_48_hour", status: 0 });
        cronJobAction = cronJobAction.map(s => ObjectId(s));

        if (cronJobAction && cronJobAction?.length > 0) {
            query['location_id'] = { $nin: cronJobAction };
        }

        var appointments = await AppointmentService.getAppointmentDataGroup(query);

        for (var i = 0; i < appointments.length; i++) {
            var location = await LocationService.getLocation(appointments[i].location_id);
            var company = await CompanyService.getCompany(location.company_id);
            var client_query = { _id: { $in: appointments[i].client_id } };
            var client = await CustomerService.getClients(client_query, 0, 10);
            appointments[i].client_id = client;
            var service_query = { _id: { $in: appointments[i].service_id } };
            var service = await ServiceService.getServiceSpecificWithCategory(service_query);
            appointments[i].service_id = service;

            var customFlag = await getCustomParameterData(company?._id, appointments[i].location_id, 'booking_reminder');

            if (customFlag && customFlag?.formData && customFlag?.formData?.booking_reminder_1 > 0 && appointments[i]?.client_id && appointments[i].client_id?.length) {
                var appointment_date = dateFormat(appointments[i].date, "yyyy-mm-dd");
                var apmt_time = appointments[i].start_time;
                var appointment_time = appointments[i].start_time;
                var date = appointment_date + "T" + appointment_time;
                var dateTime = moment(date);
                var dayOfMonth = dateTime.format('DD');
                var month = dateTime.format('MMMM');
                var minutes = dateTime.format('mm');
                var diffTime = dateTime.diff(today_date_time, 'hours');
                if (minutes && (minutes >= 30 && minutes <= 59)) { diffTime = diffTime - 1; }

                var service_name = "";
                for (var s = 0; s < appointments[i].service_id.length; s++) {
                    service_name = service_name + appointments[i].service_id[s].name + ", ";
                }

                var reminder_hour = customFlag?.formData?.booking_reminder_1 || 0;

                var flag1RemHour = parseInt(reminder_hour);
                var maxTime = parseInt(flag1RemHour) + 24;

                // if (parseInt(customFlag.value) > 0 && (parseInt(diffTime) >= parseInt(customFlag.value) && parseInt(diffTime) <= maxTime)) {
                if (flag1RemHour && flag1RemHour == diffTime) {
                    var company_logo = "";
                    var company_website = "";
                    if (company?.image) { company_logo = company.image; }
                    if (company?.contact_link) { company_website = company.contact_link; }

                    if (appointments[i]?.client_id[0]?.email && appointments[i]?.client_id[0]?.email_notification != 0) {
                        var temFile = "appointment_booked_cron_job1.hjs";
                        var toMail = {};
                        toMail['site_url'] = process.env.API_URL;
                        toMail['link_url'] = process.env.SITE_URL;
                        toMail['consultant_url'] = process.env.SITE_URL + "/client/consultation-form/" + appointments[i]._id;
                        var to = appointments[i].client_id[0].email;
                        var name = appointments[i].client_id[0].name;
                        // var subject = 'Appointment Reminder';
                        var subject = "Your Appointment is due in " + reminder_hour + " Hours for " + service_name;
                        toMail['name'] = name;
                        toMail['client_id'] = appointments[i].client_id[0]._id;
                        toMail['email'] = to;
                        toMail['company_name'] = company.name;
                        toMail['location_name'] = location.name;
                        toMail['appointment_date'] = appointment_date;
                        toMail['service_name'] = service_name;
                        toMail['apmt_time'] = apmt_time;
                        toMail['contact_number'] = location.contact_number;
                        toMail['company_website'] = company_website;
                        toMail['company_logo'] = company_logo;
                        toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + appointments[i].client_id[0]._id
                        toMail['location_contact'] = location.contact_number
                        toMail['location_domain'] = location.domain
                        toMail['front_url'] = process.env.FRONT_URL

                        var emailData = {
                            company_id: location.company_id,
                            location_id: location._id,
                            client_id: appointments[i].client_id[0]._id,
                            subject: subject,
                            name: name,
                            type: "cron",
                            file_type: "appointment_booked_cron_job1",
                            temp_file: temFile,
                            html: '',
                            data: toMail,
                            date: Date(),
                            to_email: to,
                            status: "initial",
                            email_type: 'transaction'
                        }

                        var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                        var tillDate = increaseDateDays(new Date, days);
                        if (tillDate) { emailData.till_date = tillDate; }

                        var waLog = await EmailLogService.createEmailLog(emailData);
                    }

                    if (appointments[i]?.client_id[0]?.mobile && appointments[i]?.client_id[0]?.sms_notification != 0) {
                        var cMsg = customFlag?.formData?.booking_reminder_1_message || '';
                        if (cMsg) {

                            cMsg = cMsg.replace("{client_name}", appointments[i].client_id[0].name);
                            cMsg = cMsg.replace("{organisation_name}", company.name);
                            cMsg = cMsg.replace("{branch_name}", location.name);
                            cMsg = cMsg.replace("{appointment_date}", appointment_date);
                            cMsg = cMsg.replace("{appointment_time}", apmt_time);
                            cMsg = cMsg.replace("{branch_number}", location.contact_number);

                            var booking_link = process.env.SITE_URL + "/booking-info/" + appointments[i]._id;

                            var link = booking_link
                            var unique_id = (new Date()).getTime().toString(36)
                            var short_link = await SendEmailSmsService.generateShortLink(link, unique_id)
                            if (short_link && short_link != '') {
                                booking_link = short_link
                            }

                            if (booking_link) {
                                cMsg += " " + booking_link + " "
                            }

                            var number = parseInt(appointments[i].client_id[0].mobile, 10);
                            var msg = cMsg;
                            var days = process.env?.SMS_MAX_DATE_LIMIT || 2
                            var tillDate = increaseDateDays(new Date, days)
                            var is_wa_exist = client[0]?.wa_verified ?? 0;
                            var is_WA_set = await getWhatsAppDetails(location._id, location.company_id)

                            if (is_wa_exist && is_WA_set) {
                                var waMsgData = {
                                    company_id: location.company_id,
                                    location_id: location._id,
                                    client_id: appointments[i].client_id[0]._id,
                                    type: "cron",
                                    msg_type: "cron_job_reminder_flag1",
                                    date: Date(),
                                    mobile: appointments[i].client_id[0].mobile,
                                    content: msg,
                                    msg_count: 1,
                                    status: "initial",
                                    till_date: tillDate ?? null
                                }

                                var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                            }

                            if (!is_wa_exist || !is_WA_set) {
                                var smsData = {
                                    company_id: location.company_id,
                                    location_id: location._id,
                                    client_id: appointments[i].client_id[0]._id,
                                    type: "cron",
                                    sms_type: "cron_job_reminder_flag1",
                                    date: Date(),
                                    mobile: appointments[i].client_id[0].mobile,
                                    content: msg,
                                    sms_count: 1,
                                    sms_setting: location.sms_setting,
                                    status: "initial",
                                    till_date: tillDate ?? null
                                }

                                var smsLog = await SmslogService.createSmsLog(smsData);
                            }
                        }
                    }
                }
            }
        }

        return res.status(200).send({
            status: 200,
            flag: true,
            message: "First Cron Job Done..!"
        })
    } catch (e) {
        console.log("cronJobFirst Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// send reminder before 12 Hour
exports.cronJobSecond = async function (req, res, next) {
    try {
        var today_date_time = moment();
        var today_date = new Date();
        var final_today_date = dateFormat(today_date, "yyyy-mm-dd");
        // if admin can change before hour in customer parameter more than or less then 12
        var query = {
            date: { $gte: final_today_date },
            booking_status: { $nin: ['cancel', 'no_shows', 'complete'] }
        };

        var cronJobAction = await CronjobActionService.getCronjobActionSpecificLocation('location_id', { key_url: "cron_job_12_hour", status: 0 });
        cronJobAction = cronJobAction.map(s => ObjectId(s));

        if (cronJobAction && cronJobAction.length > 0) {
            query['location_id'] = { $nin: cronJobAction };
        }

        var sms_log_data = [];
        var appointments = await AppointmentService.getAppointmentDataGroup(query);
        for (var i = 0; i < appointments.length; i++) {
            var location = await LocationService.getLocation(appointments[i].location_id);
            var company = await CompanyService.getCompany(location.company_id);
            var client_query = { _id: { $in: appointments[i].client_id } };
            var client = await CustomerService.getClients(client_query);
            appointments[i].client_id = client;
            var service_query = { _id: { $in: appointments[i].service_id } };
            var service = await ServiceService.getServiceSpecificWithCategory(service_query);
            appointments[i].service_id = service;

            var customFlag = await getCustomParameterData(company?._id, appointments[i].location_id, 'booking_reminder');

            if (customFlag && customFlag?.formData && customFlag?.formData?.booking_reminder_2 > 0 && appointments[i]?.client_id && appointments[i].client_id?.length) {
                var appointment_date = dateFormat(appointments[i].date, "yyyy-mm-dd");
                var apmt_time = appointments[i].start_time;
                var appointment_time = appointments[i].start_time;
                var date = appointment_date + "T" + appointment_time;
                var dateTime = moment(date);
                var dayOfMonth = dateTime.format('DD');
                var month = dateTime.format('MMMM');
                var minutes = dateTime.format('mm');
                var diffTime = dateTime.diff(today_date_time, 'hours');
                if (minutes && (minutes >= 30 && minutes <= 59)) { diffTime = diffTime - 1; }

                var service_name = "";
                for (var s = 0; s < appointments[i].service_id.length; s++) {
                    service_name = service_name + appointments[i].service_id[s].name + ", ";
                }

                var reminder_hour = customFlag?.formData?.booking_reminder_2 || 0;

                var flag2RemHour = parseInt(reminder_hour);
                var maxTime = parseInt(reminder_hour) + 24;
                // if (parseInt(customFlag.value) > 0 && (parseInt(diffTime) >= parseInt(customFlag.value) && parseInt(diffTime) <= maxTime)) {

                if (flag2RemHour && flag2RemHour == diffTime) {
                    var company_logo = "";
                    var company_website = "";
                    if (company?.image) { company_logo = company.image; }
                    if (company?.contact_link) { company_website = company.contact_link; }

                    if (appointments[i]?.client_id[0]?.email && appointments[i]?.client_id[0]?.email_notification != 0) {
                        var temFile = "appointment_booked_cron_job2.hjs";

                        var toMail = {};
                        toMail['site_url'] = process.env.API_URL;
                        toMail['link_url'] = process.env.SITE_URL;
                        toMail['consultant_url'] = process.env.SITE_URL + "/client/consultation-form/" + appointments[i]._id;
                        var to = appointments[i].client_id[0].email;
                        var name = appointments[i].client_id[0].name;
                        var subject = "Your Appointment is due in " + reminder_hour + " Hours for " + service_name;
                        toMail['name'] = name;
                        toMail['client_id'] = appointments[i].client_id[0]._id;
                        toMail['email'] = to;
                        toMail['company_name'] = company.name;
                        toMail['location_name'] = location.name;
                        toMail['appointment_date'] = appointment_date;
                        toMail['service_name'] = service_name;
                        toMail['apmt_time'] = apmt_time;
                        toMail['contact_number'] = location.contact_number;
                        toMail['company_website'] = company_website;
                        toMail['company_logo'] = company_logo;
                        toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + appointments[i].client_id[0]._id
                        toMail['location_contact'] = location.contact_number
                        toMail['location_domain'] = location.domain
                        toMail['front_url'] = process.env.FRONT_URL

                        var emailData = {
                            company_id: location.company_id,
                            location_id: location._id,
                            client_id: appointments[i].client_id[0]._id,
                            subject: subject,
                            name: name,
                            type: "cron",
                            file_type: "appointment_booked_cron_job2",
                            temp_file: temFile,
                            html: '',
                            data: toMail,
                            date: Date(),
                            to_email: to,
                            status: "initial",
                            email_type: 'transaction'
                        }

                        var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                        var tillDate = increaseDateDays(new Date, days);
                        if (tillDate) { emailData.till_date = tillDate; }

                        var waLog = await EmailLogService.createEmailLog(emailData);
                    }

                    if (appointments[i]?.client_id[0]?.mobile && appointments[i]?.client_id[0]?.sms_notification != 0) {

                        var cMsg = customFlag?.formData?.booking_reminder_1_message || '';

                        if (cMsg) {
                            cMsg = cMsg.replace("{client_name}", appointments[i].client_id[0].name);
                            cMsg = cMsg.replace("{organisation_name}", company.name);
                            cMsg = cMsg.replace("{branch_name}", location.name);
                            cMsg = cMsg.replace("{appointment_date}", appointment_date);
                            cMsg = cMsg.replace("{appointment_time}", apmt_time);
                            cMsg = cMsg.replace("{branch_number}", location.contact_number);

                            var number = parseInt(appointments[i].client_id[0].mobile, 10);

                            var booking_link = process.env.SITE_URL + "/booking-info/" + appointments[i]._id;

                            var link = booking_link
                            var unique_id = (new Date()).getTime().toString(36)
                            var short_link = await SendEmailSmsService.generateShortLink(link, unique_id)
                            if (short_link && short_link != '') {
                                booking_link = short_link;
                            }

                            if (booking_link) {
                                cMsg += " " + booking_link + " ";
                            }
                            var msg = cMsg;

                            var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                            var tillDate = increaseDateDays(new Date, days);
                            var is_wa_exist = appointments[i].client_id[0].wa_verified ?? 0;
                            var is_WA_set = await getWhatsAppDetails(location._id, location.company_id);
                            if (is_wa_exist && is_WA_set) {
                                var waMsgData = {
                                    company_id: location.company_id,
                                    location_id: location._id,
                                    client_id: appointments[i].client_id[0]._id,
                                    type: "cron",
                                    msg_type: "cron_job_reminder_flag2",
                                    date: Date(),
                                    mobile: appointments[i].client_id[0].mobile,
                                    content: msg,
                                    msg_count: 1,
                                    status: "initial",
                                    till_date: tillDate ?? null
                                }

                                var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                            }

                            if (!is_wa_exist || !is_WA_set) {
                                var smsData = {
                                    company_id: location.company_id,
                                    location_id: location._id,
                                    client_id: appointments[i].client_id[0]._id,
                                    type: "cron",
                                    sms_type: "cron_job_reminder_flag2",
                                    date: Date(),
                                    mobile: appointments[i].client_id[0].mobile,
                                    content: msg,
                                    sms_count: 1,
                                    sms_setting: location.sms_setting,
                                    status: "initial",
                                    till_date: tillDate ?? null
                                }

                                var smsLog = await SmslogService.createSmsLog(smsData);
                            }
                        }
                    }
                }
            }
        }

        return res.status(200).send({
            status: 200,
            flag: true,
            data: null,
            message: "Second Cron Job Done..!"
        })
    } catch (e) {
        console.log("cronJobSecond Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// send reminder for next interval of booked services (Service reminder)
exports.appointmentBookedServiceCronJob = async function (req, res, next) {
    try {
        var row_date = new Date();
        // minus 30 day from current date
        row_date = row_date.setDate(row_date.getDate() - 30);
        var month_date = dateFormat(row_date, "yyyy-mm-dd");
        var final_today_date = dateFormat(new Date(), "yyyy-mm-dd");
        var query = {
            date: { $gte: month_date },
            booking_status: { $nin: ['cancel', 'no_shows'] }
        };

        var cronJobAction = await CronjobActionService.getCronjobActionSpecificLocation('location_id', { key_url: "cron_job_app_booked_service", status: 0 });

        cronJobAction = cronJobAction.map(s => ObjectId(s));

        if (cronJobAction && cronJobAction?.length > 0) {
            query['location_id'] = { $nin: cronJobAction };
        }

        var loc_ids = cronJobAction.map(x => ObjectId(x))
        var loc_query = { status: 1, _id: { $nin: loc_ids } };
        var locations = await LocationService.getActiveLocations(loc_query);

        for (var l = 0; l < locations.length; l++) {
            query['location_id'] = locations[l]._id;
            var location = locations[l];
            var company = await CompanyService.getCompany(location.company_id);
            var customFlag = await getCustomParameterData(company?._id, locations[l]._id, 'treatment_reminder');

            var appointments = await AppointmentService.getAppointmentDataGroup(query);
            for (var i = 0; i < appointments.length; i++) {
                if (appointments[i]?.client_id && appointments[i].client_id?.length) {
                    var client_query = { _id: { $in: appointments[i].client_id } };
                    var client = await CustomerService.getClients(client_query);
                    appointments[i].client_id = client;

                    var service_query = { status: 1, _id: { $in: appointments[i].service_id } };
                    var service = await ServiceService.getServiceforCronJob(service_query);

                    if (service && service?.length && appointments[i]?.client_id && appointments[i].client_id?.length > 0) {
                        appointments[i].service_id = service;

                        for (var j = 0; j < service.length; j++) {
                            var app_date = dateFormat(appointments[i].date, "yyyy-mm-dd");
                            var app_query = { client_id: appointments[i].client_id[0]._id.toString(), date: { $gt: app_date }, booking_status: { $nin: ['cancel', 'no_shows'] }, service_id: service[j]._id.toString() };

                            var appointment = await AppointmentService.getAppointmentsCount(app_query);
                            if (service[j]?.reminder > 0 && appointment == 0) {
                                var date_oject = appointments[i].date;
                                var service_date = date_oject.setDate(date_oject.getDate() + service[j].reminder);
                                var next_service_date = dateFormat(service_date, "yyyy-mm-dd");
                                if (final_today_date == next_service_date) {
                                    var company_logo = "";
                                    var company_website = "";
                                    if (company.image) { company_logo = company.image; }
                                    if (company.contact_link) { company_website = company.contact_link; }

                                    if (appointments[i]?.client_id[0]?.email && appointments[i]?.client_id[0]?.session_email_notification != 0) {
                                        var temFile = "appointment_booked_service_reminder.hjs";

                                        var toMail = {};
                                        toMail['site_url'] = process.env.API_URL;
                                        toMail['link_url'] = process.env.SITE_URL;
                                        var to = appointments[i].client_id[0].email;
                                        var name = appointments[i].client_id[0].name;
                                        var subject = "Your Treatment " + service[j].name + " is now due";
                                        toMail['name'] = name;
                                        toMail['client_id'] = appointments[i].client_id[0]._id;
                                        toMail['service_name'] = service[j].name;
                                        toMail['service_interval_days'] = service[j].reminder;
                                        toMail['company_name'] = company.name;
                                        toMail['location_name'] = location.name;
                                        toMail['contact_number'] = location.contact_number;
                                        toMail['company_website'] = company_website;
                                        toMail['company_logo'] = company_logo;
                                        toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + appointments[i].client_id[0]._id
                                        toMail['location_contact'] = location.contact_number
                                        toMail['location_domain'] = location.domain
                                        toMail['front_url'] = process.env.FRONT_URL

                                        var emailData = {
                                            company_id: location.company_id,
                                            location_id: location._id,
                                            client_id: appointments[i].client_id[0]._id,
                                            subject: subject,
                                            name: name,
                                            type: "cron",
                                            file_type: "appointment_booked_service_reminder",
                                            temp_file: temFile,
                                            html: '',
                                            data: toMail,
                                            date: Date(),
                                            to_email: to,
                                            status: "initial",
                                            email_type: 'marketing'
                                        }

                                        var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
                                        var tillDate = increaseDateDays(new Date, days)
                                        if (tillDate) {
                                            emailData.till_date = tillDate
                                        }

                                        var waLog = await EmailLogService.createEmailLog(emailData)
                                    }

                                    if (appointments[i]?.client_id[0]?.mobile && appointments[i]?.client_id[0]?.session_sms_notification != 0) {

                                        var cMsg = customFlag?.formData?.reminder_of_treatment_interval_message;

                                        if (cMsg) {
                                            cMsg = cMsg.replace("{client_name}", appointments[i].client_id[0].name);
                                            cMsg = cMsg.replace("{treatment_name}", service[j].name);
                                            cMsg = cMsg.replace("{organisation_name}", company.name);
                                            cMsg = cMsg.replace("{branch_name}", location.name);
                                            cMsg = cMsg.replace("{branch_number}", location.contact_number);
                                            cMsg = cMsg.replace("{organisation_website}", company_website);

                                            var number = parseInt(appointments[i].client_id[0].mobile, 10);

                                            var msg = cMsg;

                                            var days = process.env?.SMS_MAX_DATE_LIMIT || 2
                                            var tillDate = increaseDateDays(new Date, days)
                                            var is_wa_exist = appointments[i].client_id[0].wa_verified ?? 0;
                                            var is_WA_set = await getWhatsAppDetails(location._id, location.company_id)
                                            if (is_wa_exist && is_WA_set) {
                                                var waMsgData = {
                                                    company_id: location.company_id,
                                                    location_id: location._id,
                                                    client_id: appointments[i].client_id[0]._id,
                                                    type: "cron",
                                                    msg_type: "cron_job_service_interval_reminder",
                                                    date: Date(),
                                                    mobile: appointments[i].client_id[0].mobile,
                                                    content: msg,
                                                    msg_count: 1,
                                                    status: "initial",
                                                    till_date: tillDate ?? null
                                                }

                                                var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData)
                                            }

                                            if (!is_wa_exist || !is_WA_set) {
                                                var smsData = {
                                                    company_id: location.company_id,
                                                    location_id: location._id,
                                                    client_id: appointments[i].client_id[0]._id,
                                                    type: "cron",
                                                    sms_type: "cron_job_service_interval_reminder",
                                                    date: Date(),
                                                    mobile: appointments[i].client_id[0].mobile,
                                                    content: msg,
                                                    sms_count: 1,
                                                    sms_setting: location.sms_setting,
                                                    status: "initial",
                                                    till_date: tillDate ?? null
                                                }

                                                var smsLog = await SmslogService.createSmsLog(smsData)
                                            }
                                        }
                                    }
                                }

                                if (customFlag && customFlag?.formData && customFlag?.formData?.service_interval_extend_days_reminder > 0) {
                                    var extend_days = customFlag?.formData?.service_interval_extend_days_reminder;
                                    var extend_date_obj = new Date(next_service_date);
                                    var extend_date = extend_date_obj.setDate(extend_date_obj.getDate() + parseInt(extend_days))
                                    var next_extend_date = dateFormat(extend_date, "yyyy-mm-dd");
                                    if (final_today_date == next_extend_date) {
                                        var n_query = { client_id: { $elemMatch: { $eq: appointments[i].client_id[0]._id.toString() } }, $and: [{ date: { $gt: next_service_date } }, { date: { $lte: next_extend_date } }] };
                                        var new_appointment = await AppointmentService.getAppointmentDataGroup(n_query);
                                        if (!new_appointment?.length) {
                                            var company_website = "";
                                            var company_logo = "";
                                            if (company?.contact_link) {
                                                company_website = company.contact_link;
                                            }

                                            if (company?.image) {
                                                company_logo = company.image;
                                            }

                                            if (appointments[i].client_id[0].email && appointments[i].client_id[0].email != '' && appointments[i].client_id[0].session_email_notification != 0) {
                                                var temFile2 = "appointment_booked_service_extend_reminder.hjs";

                                                var toMail = {};
                                                toMail['site_url'] = process.env.API_URL;
                                                toMail['link_url'] = process.env.SITE_URL;
                                                var to = appointments[i].client_id[0].email;
                                                var name = appointments[i].client_id[0].name;
                                                var subject = "Your Treatment " + service[j].name + " is now due";
                                                toMail['name'] = name;
                                                toMail['client_id'] = appointments[i].client_id[0]._id;
                                                toMail['service_name'] = service[j].name;
                                                toMail['service_interval_days'] = service[j].reminder;
                                                toMail['company_name'] = company.name;
                                                toMail['location_name'] = location.name;
                                                toMail['contact_number'] = location.contact_number;
                                                toMail['company_website'] = company_website;
                                                toMail['company_logo'] = company_logo;
                                                toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + appointments[i].client_id[0]._id
                                                toMail['location_contact'] = location.contact_number
                                                toMail['location_domain'] = location.domain
                                                toMail['front_url'] = process.env.FRONT_URL

                                                var emailData = {
                                                    company_id: location.company_id,
                                                    location_id: location._id,
                                                    client_id: appointments[i].client_id[0]._id,
                                                    subject: subject,
                                                    name: name,
                                                    type: "cron",
                                                    file_type: "appointment_booked_service_extend_reminder",
                                                    temp_file: temFile2,
                                                    html: '',
                                                    data: toMail,
                                                    date: Date(),
                                                    to_email: to,
                                                    status: "initial",
                                                    email_type: 'marketing'
                                                }

                                                var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
                                                var tillDate = increaseDateDays(new Date, days)
                                                if (tillDate) {
                                                    emailData.till_date = tillDate
                                                }

                                                var waLog = await EmailLogService.createEmailLog(emailData)
                                            }

                                            if (appointments[i].client_id[0].mobile && appointments[i].client_id[0].mobile != '' && appointments[i].client_id[0].session_sms_notification != 0) {

                                                var cMsg = customFlag?.formData?.reminder_of_treatment_interval_extend_message || '';

                                                if (cMsg) {
                                                    cMsg = cMsg.replace("{client_name}", appointments[i].client_id[0].name);
                                                    cMsg = cMsg.replace("{treatment_name}", service[j].name);
                                                    cMsg = cMsg.replace("{organisation_name}", company.name);
                                                    cMsg = cMsg.replace("{branch_name}", location.name);
                                                    cMsg = cMsg.replace("{branch_number}", location.contact_number);
                                                    cMsg = cMsg.replace("{organisation_website}", company_website);

                                                    var number = parseInt(appointments[i].client_id[0].mobile, 10);

                                                    var msg = cMsg;

                                                    var days = process.env?.SMS_MAX_DATE_LIMIT || 2
                                                    var tillDate = increaseDateDays(new Date, days)
                                                    var is_wa_exist = appointments[i].client_id[0].wa_verified ?? 0;
                                                    var is_WA_set = await getWhatsAppDetails(location._id, location.company_id)
                                                    if (is_wa_exist && is_WA_set) {
                                                        var waMsgData = {
                                                            company_id: location.company_id,
                                                            location_id: location._id,
                                                            client_id: appointments[i].client_id[0]._id,
                                                            type: "cron",
                                                            msg_type: "cron_job_service_interval_extend_days_reminder",
                                                            date: Date(),
                                                            mobile: appointments[i].client_id[0].mobile,
                                                            content: msg,
                                                            msg_count: 1,
                                                            status: "initial",
                                                            till_date: tillDate ?? null
                                                        }

                                                        var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData)
                                                    }

                                                    if (!is_wa_exist || !is_WA_set) {
                                                        var smsData = {
                                                            company_id: location.company_id,
                                                            location_id: location._id,
                                                            client_id: appointments[i].client_id[0]._id,
                                                            type: "cron",
                                                            sms_type: "cron_job_service_interval_extend_days_reminder",
                                                            date: Date(),
                                                            mobile: appointments[i].client_id[0].mobile,
                                                            content: msg,
                                                            sms_count: 1,
                                                            sms_setting: location.sms_setting,
                                                            status: "initial",
                                                            till_date: tillDate ?? null
                                                        }

                                                        var smsLog = await SmslogService.createSmsLog(smsData)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        res.status(200).send({ status: 200, flag: true, data: null, message: "Appointment Booked Service Cron Job Done..!" })
    } catch (e) {
        console.log("appointmentBookedServiceCronJob Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.packageSessionCronJob = async function (req, res, next) {
    try {
        var row_date = new Date();
        // minus 30 day from current date
        row_date = row_date.setDate(row_date.getDate() - 30);
        var month_date = dateFormat(row_date, "yyyy-mm-dd");
        var final_today_date = dateFormat(new Date(), "yyyy-mm-dd");
        var query = {
            date: { $gte: month_date }
        };

        var cronJobAction = await CronjobActionService.getCronjobActionSpecificLocation('location_id', { key_url: "cron_job_package_session_service", status: 0 });
        cronJobAction = cronJobAction.map(s => ObjectId(s));

        if (cronJobAction && cronJobAction.length > 0) {
            query['location_id'] = { $nin: cronJobAction };
        }

        var pkgServices = await CustomerUsagePackageService.getCustomerUsagePackageServiceSpecific(query);
        for (var i = 0; i < pkgServices.length; i++) {
            var app_query = { client_id: pkgServices[i].customer_id, date: { $gte: final_today_date }, booking_status: { $nin: ['cancel', 'no_shows'] }, service_id: pkgServices[i].service_id };

            var appointment = await AppointmentService.getAppointmentsCount(app_query);
            if (appointment == 0) {
                var location = await LocationService.getLocation(pkgServices[i].location_id);
                var company = await CompanyService.getCompany(location.company_id);
                var pkg_query = { customer_id: pkgServices[i].customer_id, package_id: pkgServices[i].package_id, status: 1 };
                var package = await CustomerPackageService.getCustomerPackageBased(pkg_query);
                var customer = await CustomerService.getCustomer(pkgServices[i].customer_id);

                var service_query = { status: 1, _id: { $in: pkgServices[i].service_id } };
                var service = await ServiceService.getServiceforCronJob(service_query);
                if (service && service?.length > 0) {
                    for (var j = 0; j < service.length; j++) {
                        var pkg_validity_date = "";
                        if (package?.extended_date) {
                            pkg_validity_date = dateFormat(package.extended_date, "yyyy-mm-dd");
                        } else {
                            pkg_validity_date = dateFormat(package.end_date, "yyyy-mm-dd");
                        }

                        var date_oject = pkgServices[i].date;
                        var service_date = date_oject.setDate(date_oject.getDate() + service[j].reminder);
                        var next_service_date = dateFormat(service_date, "yyyy-mm-dd");

                        var customFlag = await getCustomParameterData(company?._id, pkgServices[i].location_id, 'package');

                        if (final_today_date == next_service_date) {
                            var company_website = "";
                            var company_logo = "";
                            if (company?.contact_link) {
                                company_website = company.contact_link;
                            }

                            if (company?.image) {
                                company_logo = company.image;
                            }

                            var next_session_count = (pkgServices[i].total_session - pkgServices[i].available_session) + 1

                            if (customer?.email && customer?.session_email_notification != 0) {
                                var temFile = "package_session_reminder.hjs";

                                var toMail = {};
                                toMail['site_url'] = process.env.API_URL;
                                toMail['link_url'] = process.env.SITE_URL;
                                var to = customer.email;
                                var name = customer.name;
                                var subject = "Reminder to book your Package Session for " + service[j].name + " " + next_session_count;
                                toMail['name'] = name;
                                toMail['client_id'] = customer._id;
                                toMail['service_name'] = service[j].name;
                                toMail['available_session'] = next_session_count;
                                toMail['pkg_validity_date'] = pkg_validity_date;
                                toMail['company_name'] = company.name;
                                toMail['location_name'] = location.name;
                                toMail['contact_number'] = location.contact_number;
                                toMail['company_website'] = company_website;
                                toMail['company_logo'] = company_logo;
                                toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + customer._id
                                toMail['location_contact'] = location.contact_number
                                toMail['location_domain'] = location.domain
                                toMail['front_url'] = process.env.FRONT_URL

                                var emailData = {
                                    company_id: location.company_id,
                                    location_id: location._id,
                                    client_id: pkgServices[i].customer_id,
                                    subject: subject,
                                    name: name,
                                    type: "cron",
                                    file_type: "package_session_reminder",
                                    temp_file: temFile,
                                    html: '',
                                    data: toMail,
                                    date: Date(),
                                    to_email: to,
                                    status: "initial",
                                    email_type: 'transaction'
                                }

                                var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                                var tillDate = increaseDateDays(new Date, days);
                                if (tillDate) { emailData.till_date = tillDate; }

                                var waLog = await EmailLogService.createEmailLog(emailData);
                            }

                            if (customFlag && customFlag?.formData && customFlag?.formData?.package_session_reminder_message && customer?.mobile && customer?.session_sms_notification != 0) {

                                var cMsg = customFlag?.formData?.package_session_reminder_message || '';

                                if (cMsg) {
                                    cMsg = cMsg.replace("{client_name}", customer.name);
                                    cMsg = cMsg.replace("{treatment_name}", service[j].name);
                                    cMsg = cMsg.replace("{session_number}", next_session_count);
                                    cMsg = cMsg.replace("{organisation_name}", company.name);
                                    cMsg = cMsg.replace("{branch_name}", location.name);
                                    cMsg = cMsg.replace("{branch_number}", location.contact_number);
                                    cMsg = cMsg.replace("{package_validity_date}", pkg_validity_date);

                                    var number = parseInt(customer.mobile, 10);

                                    var msg = cMsg;
                                    var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                    var tillDate = increaseDateDays(new Date, days);
                                    var is_wa_exist = customer.wa_verified ?? 0;
                                    var is_WA_set = await getWhatsAppDetails(location._id, location.company_id);
                                    if (is_wa_exist && is_WA_set) {
                                        var waMsgData = {
                                            company_id: location.company_id,
                                            location_id: location._id,
                                            client_id: pkgServices[i].customer_id,
                                            type: "cron",
                                            msg_type: "package_session_reminder",
                                            date: Date(),
                                            mobile: customer.mobile,
                                            content: msg,
                                            msg_count: 1,
                                            status: "initial",
                                            till_date: tillDate ?? null
                                        }

                                        var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                    }

                                    if (!is_wa_exist || !is_WA_set) {
                                        var smsData = {
                                            company_id: location.company_id,
                                            location_id: location._id,
                                            client_id: pkgServices[i].customer_id,
                                            type: "cron",
                                            sms_type: "package_session_reminder",
                                            date: Date(),
                                            mobile: customer.mobile,
                                            content: msg,
                                            sms_count: 1,
                                            sms_setting: location.sms_setting,
                                            status: "initial",
                                            email_type: "transaction",
                                            till_date: tillDate ?? null
                                        }

                                        var smsLog = await SmslogService.createSmsLog(smsData);
                                    }
                                }
                            }
                        }

                        if (customFlag && customFlag?.formData && customFlag?.formData?.package_session_extend_days_reminder > 0) {
                            var extend_days = customFlag?.formData?.package_session_extend_days_reminder;
                            var extend_date_obj = new Date(next_service_date);
                            var extend_date = extend_date_obj.setDate(extend_date_obj.getDate() + parseInt(extend_days))

                            var next_extend_date = dateFormat(extend_date, "yyyy-mm-dd");
                            if (final_today_date == next_extend_date) {
                                var n_query = { location_id: pkgServices[i].location_id, customer_id: pkgServices[i].customer_id, package_id: pkgServices[i].package_id, service_id: pkgServices[i].service_id, $and: [{ date: { $gte: next_service_date } }, { date: { $lte: next_extend_date } }] };

                                var new_pkgService = await CustomerUsagePackageService.getCustomerUsagePackageServiceSpecific(n_query);
                                if (!new_pkgService?.length) {
                                    var company_logo = "";
                                    var company_website = "";
                                    if (company.image) { company_logo = company.image; }
                                    if (company.contact_link) { company_website = company.contact_link; }

                                    if (customer?.email && customer.email != '' && customer?.session_email_notification != 0) {
                                        var temFile = "package_session_extend_days_reminder.hjs";

                                        var toMail = {};
                                        toMail['site_url'] = process.env.API_URL;
                                        toMail['link_url'] = process.env.SITE_URL;
                                        var to = customer.email;
                                        var name = customer.name;
                                        var subject = "Reminder to book your Package Session for " + service[j].name + " " + next_session_count;
                                        toMail['name'] = name;
                                        toMail['client_id'] = customer._id;
                                        toMail['service_name'] = service[j].name;
                                        toMail['available_session'] = next_session_count;
                                        toMail['pkg_validity_date'] = pkg_validity_date;
                                        toMail['company_name'] = company.name;
                                        toMail['location_name'] = location.name;
                                        toMail['contact_number'] = location.contact_number;
                                        toMail['company_website'] = company_website;
                                        toMail['company_logo'] = company_logo;
                                        toMail['unsubscribe_url'] = process.env.SITE_URL + "/unsubscribe/" + customer._id
                                        toMail['location_contact'] = location.contact_number
                                        toMail['location_domain'] = location.domain
                                        toMail['front_url'] = process.env.FRONT_URL

                                        var emailData = {
                                            company_id: location.company_id,
                                            location_id: location._id,
                                            client_id: pkgServices[i].customer_id,
                                            subject: subject,
                                            name: name,
                                            type: "cron",
                                            file_type: "package_session_extend_days_reminder",
                                            temp_file: temFile,
                                            html: '',
                                            data: toMail,
                                            date: Date(),
                                            to_email: to,
                                            status: "initial",
                                            email_type: 'marketing'
                                        }

                                        var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2;
                                        var tillDate = increaseDateDays(new Date, days);
                                        if (tillDate) { emailData.till_date = tillDate; }

                                        var waLog = await EmailLogService.createEmailLog(emailData);
                                    }

                                    if (customFlag && customFlag?.formData && customFlag?.formData?.reminder_of_package_session_extend_message && customer?.mobile && customer.mobile != '' && customer?.session_sms_notification != 0) {

                                        var cMsg = customFlag?.formData?.reminder_of_package_session_extend_message || '';

                                        if (cMsg) {
                                            cMsg = cMsg.replace("{client_name}", customer.name);
                                            cMsg = cMsg.replace("{treatment_name}", service[j].name);
                                            cMsg = cMsg.replace("{session_number}", next_session_count);
                                            cMsg = cMsg.replace("{organisation_name}", company.name);
                                            cMsg = cMsg.replace("{branch_name}", location.name);
                                            cMsg = cMsg.replace("{branch_number}", location.contact_number);
                                            cMsg = cMsg.replace("{package_validity_date}", pkg_validity_date);

                                            var number = parseInt(customer.mobile, 10);

                                            var msg = cMsg;
                                            var days = process.env?.SMS_MAX_DATE_LIMIT || 2;
                                            var tillDate = increaseDateDays(new Date, days);
                                            var is_wa_exist = customer.wa_verified ?? 0;
                                            var is_WA_set = await getWhatsAppDetails(location._id, location.company_id);
                                            if (is_wa_exist && is_WA_set) {
                                                var waMsgData = {
                                                    company_id: location.company_id,
                                                    location_id: location._id,
                                                    client_id: pkgServices[i].customer_id,
                                                    type: "cron",
                                                    msg_type: "package_session_extend_days_reminder",
                                                    date: Date(),
                                                    mobile: customer.mobile,
                                                    content: msg,
                                                    msg_count: 1,
                                                    status: "initial",
                                                    till_date: tillDate ?? null
                                                }

                                                var waLog = await WhatsAppLogService.createWhatsAppLog(waMsgData);
                                            }

                                            if (!is_wa_exist || !is_WA_set) {
                                                var smsData = {
                                                    company_id: location.company_id,
                                                    location_id: location._id,
                                                    client_id: pkgServices[i].customer_id,
                                                    sms_type: "package_session_extend_days_reminder",
                                                    date: Date(),
                                                    mobile: customer.mobile,
                                                    content: msg,
                                                    sms_count: 1,
                                                    sms_setting: location.sms_setting,
                                                    status: "initial",
                                                    till_date: tillDate ?? null
                                                }

                                                var smsLog = await SmslogService.createSmsLog(smsData);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return res.status(200).send({ status: 200, flag: true, message: "Package Session Service Cron Job Done..!" })
    } catch (e) {
        console.log("packageSessionCronJob Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.rewardsToAppointments = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var dupli_data = [];
        var locations = await LocationService.getActiveLocations({ status: 1 })
        for (var l = 0; l < locations.length; l++) {
            var point_data = { location_id: locations[l]._id.toString(), key_url: 'customer_reward' };

            var customParameter = await getCustomParameterData(locations[l].company_id, locations[l]._id, 'customer_reward');

            var reward_points = 0;
            var reward_amt = 0;

            if (customParameter && customParameter?.formData && customParameter?.formData?.reward_status) {
                reward_points = customParameter?.formData?.customer_reward_points;
                reward_amt = customParameter?.formData?.customer_reward_amount;
            }

            var query = { booking_status: 'complete', location_id: locations[l]._id.toString() }
            var appointments = await AppointmentService.getAppointmentSpecific(query) || [];
            for (var i = 0; i < appointments.length; i++) {
                app_reward = [];
                if (appointments[i].client_id?.length > 0) {
                    var today_date = new Date();
                    date = dateFormat(today_date, "yyyy-mm-dd");

                    var check_qry = { customer_id: appointments[i].client_id[0], appoitment_id: appointments[i]._id.toString(), action: 'gain' }
                    app_reward = await CustomerRewardService.getSpecificCustomerRewards(check_qry);
                    if (app_reward?.length > 1) {
                        var today_date = new Date();
                        date = dateFormat(today_date, "yyyy-mm-dd");
                        var check_qry = { customer_id: appointments[i].client_id[0], appoitment_id: appointments[i]._id.toString(), action: 'gain', date: date };
                        var dupli_app_reward = await CustomerRewardService.getSpecificCustomerRewards(check_qry);
                        if (dupli_app_reward?.length > 1) {
                            dupli_data.push(appointments[i]._id);
                        }
                    }

                    if (app_reward?.length == 0) {
                        // if(reward_points && reward_points.value && reward_points.value > 0 && reward_amt.value && reward_amt.value > 0 && reward_points.status != 0 && reward_amt.status != 0){
                        //     var booking_amt = appointments[i].price ? appointments[i].price :appointments[i].grand_total;
                        //     var earn_points = parseFloat(booking_amt)*parseInt(reward_points.value)/parseFloat(reward_amt.value);

                        //     var last_reward_query = {customer_id:appointments[i].client_id[0]};
                        //     var last_reward = await CustomerRewardService.getCustomerLastRewards(last_reward_query);
                        //     var last_total_points = 0;
                        //     if(last_reward?.length > 0){
                        //         last_total_points = last_reward[0].total_points;
                        //     }

                        //     var total_points = parseFloat(last_total_points)+parseFloat(earn_points);
                        //     var reward_data = {
                        //         location_id: appointments[i].location_id,
                        //         customer_id: appointments[i].client_id[0],
                        //         appoitment_id: appointments[i]._id,
                        //         amount: booking_amt,
                        //         gain_points: earn_points.toFixed(2),
                        //         total_points: total_points.toFixed(2),
                        //         date: Date(),
                        //         action: 'gain',
                        //         added_by: 'booking'
                        //     }
                        //     var cust_reward = await CustomerRewardService.createCustomerReward(reward_data);
                        //     var today_date = new Date();
                        //     var month_date = new Date();
                        //     var DaysToAdd = 30; 
                        //     month_date.setDate(month_date.getDate() - DaysToAdd); 

                        //     var end_date = dateFormat(today_date, "yyyy-mm-dd");
                        //     var start_date = dateFormat(month_date, "yyyy-mm-dd");

                        //     var qry = {
                        //         customer_id: appointments[i].client_id[0], 
                        //         action:"gain",
                        //         date:{ $gte:start_date, $lte:end_date }
                        //     };

                        //     var monthly_reward = await CustomerRewardService.getCustomerRewardsByDate(qry);
                        //     if(monthly_reward?.length > 0 && monthly_reward[0]?.SumTotalPoints > 0){
                        //         var monthly_points = parseFloat(monthly_reward[0].SumTotalPoints.toFixed(2));
                        //         var badge = '';
                        //         if (monthly_points >= 150) {
                        //             badge = 'prestige';
                        //         }else if(monthly_points >= 100 && monthly_points <= 149){
                        //             badge = 'vip';
                        //         }else if(monthly_points >= 80 && monthly_points <= 99){
                        //              badge = 'gold';
                        //         }else if(monthly_points >= 50 && monthly_points <= 70){
                        //              badge = 'bronze';
                        //         }else if(monthly_points >= 30 && monthly_points <= 49){
                        //              badge = 'silver';
                        //         }else if(monthly_points < 30 ){
                        //             badge = 'lite_user';
                        //         }
                        //         var c_data = {_id:appointments[i].client_id[0],customer_badge:badge}
                        //         var updatedUser = await UserService.updateUser(c_data)
                        //     }
                        // }
                    }
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: null, dupli_data: dupli_data, message: "Successfully Appointment Received" })
    } catch (e) {
        console.log("rewardsToAppointments Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.duplicateRewards = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var appointments = []
        var dupli_arr = []
        for (var i = 0; i < appointments.length; i++) {
            var check_qry = { appoitment_id: appointments[i], action: 'gain' }
            var app_reward = await CustomerRewardService.getSpecificCustomerRewards(check_qry)
            if (app_reward && app_reward.length > 1) {
                var dupli_data = await CustomerRewardService.getLastNRewards(check_qry, app_reward.length - 1)
                var ids = dupli_data.map(s => ObjectId(s._id))
                var del = await CustomerRewardService.deleteMultiple({ _id: { $in: ids } })
                dupli_arr.push(dupli_data)
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: null, message: "Appointment received successfully!" })
    } catch (e) {
        console.log("duplicateRewards Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

const sendAppLiveFailedSMS = async function (query = {}, smsIds = [], limit = 10, batch = 0) {
    try {
        var smsLogs = await SmslogService.getSmsLogsOne(query, 1, limit, "_id", "-1");
        if (smsLogs && smsLogs.length) {
            smsLogs.map((x) => { smsIds.push(x._id) });
            query['_id'] = { $nin: smsIds };
            for (let i = 0; i < smsLogs.length; i++) {
                var element = smsLogs[i];
                var smsResponse = element?.sms_response || null;
                if (smsResponse && smsResponse.ID) {
                    var message = await SendEmailSmsService.getSendAppLiveMessageById(smsResponse.ID)
                    if (message && message?.ID) {
                        var sentCount = element?.sent_count || 0;
                        var smsResponse = message;
                        var responseStatus = message?.status || "";
                        var status = "processed";
                        if (responseStatus == "Failed") {
                            var resend = await SendEmailSmsService.getSendAppLiveMessageById(message.ID);
                            if (resend && resend.ID) {
                                smsResponse = resend;
                                sentCount = sentCount + 1;
                                responseStatus = resend?.status || "";
                            }
                        }

                        if (responseStatus == "Queued") { status = "pending"; }
                        if (responseStatus == "Sent") { status = "sent"; }
                        if (responseStatus == "Delivered") { status = "delivered"; }

                        await SmslogService.updateSmsLog({
                            _id: element._id,
                            sms_response: JSON.stringify(smsResponse),
                            sent_count: sentCount,
                            response_status: responseStatus,
                            status: status
                        })
                    }
                }

                if (i === smsLogs.length - 1) {
                    sleep(3);
                    var resultData = await sendAppLiveFailedSMS(query, smsIds, limit, batch + 1);
                    return resultData;
                }
            }
        }

        return { batch: batch }
    } catch (e) {
        console.log("sendAppLiveFailedSMS Error >>> ", e)
        return { batch: 0 }
    }
}

exports.getSendAppLiveFailedSMS = async function (req, res, next) {
    try {
        var limit = 10;
        var batch = 0;
        var locationBatch = [];
        var flag = false;
        var message = "Locations not found!";
        var query = {
            sms_response: { $ne: null },
            sms_setting: "appointmentgem",
            status: { $in: ["initial", "processed", "pending"] }
        };

        var targetDate = new Date();
        targetDate = new Date(targetDate.setHours(0, 0, 0, 0)); // Start of the day
        query['till_date'] = { $gte: targetDate };
        com_query['till_date'] = { $gte: targetDate };

        var countryCode = 0;

        var companies = await CompanyService.getActiveCompanies({ status: 1 });
        if (companies && companies.length) {
            for (let com = 0; com < companies.length; com++) {

                countryCode = companies[com]?.country_code ? companies[com]?.country_code : 44;

                if (countryCode) {
                    com_query['company_id'] = ObjectId(companies[com]?._id);
                    com_query['location_id'] = null;
                    await sendAppLiveFailedSMS(com_query, [], limit, batch);
                }

                var locations = await LocationService.getLocationsOne({ company_id: companies[com]?._id.toString(), status: 1 });

                if (locations && locations.length) {
                    for (let index = 0; index < locations.length; index++) {
                        const element = locations[index];
                        query['location_id'] = element?._id || "";
                        var resultData = await sendAppLiveFailedSMS(query, [], limit, batch);
                        locationBatch.push({ name: element.name, count: resultData?.batch || 0 });
                    }

                    flag = true;
                    message = "Sendapplive faild message resend successfully!";
                }
            }
        }



        return res.status(200).json({ status: 200, flag: flag, data: null, message: message })
    } catch (e) {
        console.log("getSendAppLiveFailedSMS Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

const sendWhatsAppMessage = async function (query = {}, waLogIds = [], limit = 10, batch = 0) {
    try {
        var waLogs = await WhatsAppLogService.getWhatsAppLogsOne(query, 1, limit, "_id", "-1");
        if (waLogs && waLogs.length) {
            // waLogs.map((x) => { waLogIds.push(x._id) })
            // query['_id'] = { $nin: waLogIds }
            for (let i = 0; i < waLogs.length; i++) {
                var element = waLogs[i];
                if (element?.mobile && element?.content) {
                    var waSend = await SendEmailSmsService.sendWhatsAppTextMessage({
                        PhoneNumber: element.mobile,
                        Message: element.content
                    }, query?.location_id || "", element?.client_id?._id, element?.type, query?.company_id || "");

                    if (waSend && waSend?.status) {
                        await WhatsAppLogService.updateWhatsAppLog({
                            _id: element._id,
                            response: waSend,
                            response_status: waSend.status,
                            status: waSend.status
                        });
                    }
                }
            }
        }

        return { batch: batch }
    } catch (e) {
        console.log("sendWhatsAppMessage Error >>> ", e)
        return { batch: 0 }
    }
}

exports.sendInitialWhatsppMessage = async function (req, res, next) {
    try {
        var limit = 10;
        var batch = 0;
        var flag = false;
        var message = "Locations not found!";

        var query = { status: "initial" };
        var com_query = { status: "initial" };

        var targetDate = new Date();
        targetDate = new Date(targetDate.setHours(0, 0, 0, 0)); // Start of the day
        query['till_date'] = { $gte: targetDate };
        com_query['till_date'] = { $gte: targetDate };

        var companies = await CompanyService.getActiveCompanies({ status: 1 });
        if (companies && companies.length) {
            for (let com = 0; com < companies.length; com++) {

                com_query['company_id'] = ObjectId(companies[com]?._id);
                com_query['location_id'] = null;
                await sendWhatsAppMessage(com_query, [], limit, batch);

                var locations = await LocationService.getLocationsOne({ company_id: companies[com]?._id.toString(), status: 1 });

                if (locations && locations.length) {
                    for (let index = 0; index < locations.length; index++) {
                        const element = locations[index];

                        query['location_id'] = element?._id || "";
                        var resultData = await sendWhatsAppMessage(query, [], limit, batch);
                    }
                    flag = true;
                    message = "WhatsApp messages send successfully!";
                }
            }
        }

        return res.status(200).json({ status: 200, flag: flag, data: null, message: message })
    } catch (e) {
        console.log("sendInitialWhatsppMessage Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

const sendSendAppLiveMessage = async function (query = {}, smsIds = [], limit = 10, batch = 0, country_code = 0) {
    try {
        var smsLogs = await SmslogService.getSmsLogsOne(query, 1, limit, "_id", "-1");
        if (smsLogs && smsLogs.length && country_code) {
            for (let i = 0; i < smsLogs.length; i++) {
                var element = smsLogs[i];
                if (element?.mobile && element?.content) {

                    var number = element.mobile;
                    number = parseInt(number, 10);
                    var params = {
                        Message: element.content,
                        PhoneNumber: '+' + country_code + number
                    }

                    var sendSms = await SendEmailSmsService.sendSMS(params, element?.location_id || "", element?.client_id, element?.type, element?.company_id);
                    if (sendSms) {
                        numSegments = sendSms?.numSegments ? parseInt(sendSms.numSegments) : 1;
                        await SmslogService.updateSmsLog({
                            _id: element._id,
                            sms_count: numSegments,
                            sms_response: JSON.stringify(sendSms),
                            response_status: sendSms?.status || "",
                            status: "processed"
                        });
                    }
                }
            }
        }

        return { batch: batch }
    } catch (e) {
        console.log("sendWhatsAppMessage Error >>> ", e)
        return { batch: 0 }
    }
}

exports.getSendAppLiveInitialSMS = async function (req, res, next) {
    try {
        var limit = 10;
        var batch = 0;
        var flag = false;
        var message = "Locations not found!";

        var query = { status: "initial", sms_setting: "appointmentgem" };
        var com_query = { status: "initial", sms_setting: "appointmentgem" };

        var targetDate = new Date();
        targetDate = new Date(targetDate.setHours(0, 0, 0, 0)); // Start of the day
        query['till_date'] = { $gte: targetDate };
        com_query['till_date'] = { $gte: targetDate };

        var countryCode = 0;

        var companies = await CompanyService.getActiveCompanies({ status: 1 });
        if (companies && companies.length) {
            for (let com = 0; com < companies.length; com++) {

                countryCode = companies[com]?.country_code ? companies[com]?.country_code : 44;

                if (countryCode) {
                    com_query['company_id'] = ObjectId(companies[com]?._id);
                    com_query['location_id'] = null;
                    await sendSendAppLiveMessage(com_query, [], limit, batch, countryCode);
                }

                var locations = await LocationService.getLocationsOne({ company_id: companies[com]?._id.toString(), status: 1 });

                if (locations && locations.length > 0) {

                    for (let index = 0; index < locations.length; index++) {
                        const element = locations[index];
                        query['location_id'] = element?._id || "";
                        var resultData = await sendSendAppLiveMessage(query, [], limit, batch, countryCode);
                    }
                    flag = true;
                    message = "Sendapplive messages send successfully!";
                }
            }
        }

        return res.status(200).json({ status: 200, flag: flag, data: null, message: message })
    } catch (e) {
        console.log("getSendAppLiveInitialSMS Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getTwilioInitialSMS = async function (req, res, next) {
    try {
        var limit = 10;
        var batch = 0;
        var flag = false;
        var message = "Locations not found!";

        var query = { status: "initial", sms_setting: "twillio" };
        var com_query = { status: "initial", sms_setting: "twillio" };
        var targetDate = new Date()
        targetDate = new Date(targetDate.setHours(0, 0, 0, 0)); // Start of the day
        query['till_date'] = { $gte: targetDate };
        com_query['till_date'] = { $gte: targetDate };

        var countryCode = 0;

        var companies = await CompanyService.getActiveCompanies({ status: 1 });
        if (companies && companies.length) {
            for (let com = 0; com < companies.length; com++) {

                countryCode = companies[com]?.country_code ? companies[com]?.country_code : 44;

                if (countryCode) {
                    com_query['company_id'] = ObjectId(companies[com]?._id);
                    com_query['location_id'] = null;
                    await sendSendAppLiveMessage(com_query, [], limit, batch, countryCode);
                }

                var locations = await LocationService.getLocationsOne({ company_id: companies[com]?._id.toString(), status: 1 });

                if (locations && locations.length > 0) {

                    for (let index = 0; index < locations.length; index++) {
                        const element = locations[index];
                        query['location_id'] = element?._id || "";
                        var resultData = await sendSendAppLiveMessage(query, [], limit, batch, countryCode);
                    }
                    flag = true;
                    message = "Sendapplive messages send successfully!";
                }
            }
        }

        return res.status(200).json({ status: 200, flag: flag, data: null, message: message })
    } catch (e) {
        console.log("getSendAppLiveInitialSMS Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

const sendEmailToCustomer = async function (query = {}, limit = 10, batch = 0) {
    try {
        var emailLogs = await EmailLogService.getEmailLogsOne(query, 1, limit, "_id", "-1")
        if (emailLogs && emailLogs.length) {
            for (let i = 0; i < emailLogs.length; i++) {
                var element = emailLogs[i]
                if (element?.to_email && element?.subject && element?.temp_file && (element?.file_type || element?.html) && element?.data) {

                    var temFile = element?.temp_file;

                    let html = "";
                    var loc_id = element?.location_id;
                    var com_id = element?.company_id;
                    if (element?.location_id) {
                        loc_id = element?.location_id._id.toString()
                    }
                    if (element?.company_id) {
                        com_id = element?.company_id._id.toString()
                    }

                    if (element?.html) {
                        html = element?.html
                    } else {
                        var gettingData = await getEmailTemplateData(element?.company_id.toString(), loc_id, element?.file_type, temFile);
                        if (gettingData != null) {
                            html = gettingData.contents;
                        }
                    }
                    var sendEmail = await SendEmailSmsService.sendMailAwait(element?.to_email, element?.name, element?.subject, element?.temp_file, html, element?.data, element?.email_type, loc_id, com_id)

                    if (sendEmail && sendEmail?.status) {
                        await EmailLogService.updateEmailLog({
                            _id: element._id,
                            response: sendEmail.response,
                            response_status: sendEmail.status,
                            status: sendEmail.status
                        })
                    }
                }
            }
        }

        return { batch: batch }
    } catch (e) {
        console.log("sendEmailToCustomer Error >>> ", e)
        return { batch: 0 }
    }
}

exports.sendEmailLogInitialStatus = async function (req, res, next) {
    try {
        var limit = 10;
        var batch = 0;
        var flag = false;
        var message = "Locations not found!";

        var query = { status: "initial", type: "cron" };
        var targetDate = new Date()
        targetDate = new Date(targetDate.setHours(0, 0, 0, 0)); // Start of the day
        query['till_date'] = { $gte: targetDate };
        var cQuery = { status: "initial", type: "cron", till_date: { $gte: targetDate } };

        var companies = await CompanyService.getActiveCompanies({ status: 1 });
        if (companies && companies.length) {
            for (let index = 0; index < companies.length; index++) {
                const element = companies[index];
                cQuery['company_id'] = ObjectId(element?._id);
                cQuery['location_id'] = null;

                var resultData = await sendEmailToCustomer(cQuery, limit, batch);
            }

            flag = true;
            message = "Email send successfully!";
        }

        var locations = await LocationService.getLocationsOne({ status: 1 });
        if (locations && locations.length) {
            for (let index = 0; index < locations.length; index++) {
                const element = locations[index];
                query['location_id'] = ObjectId(element?._id) || "";
                var resultData = await sendEmailToCustomer(query, limit, batch);
            }

            flag = true;
            message = "Email send successfully!";
        }

        return res.status(200).json({ status: 200, flag: flag, data: null, message: message })
    } catch (e) {
        console.log("getEmailLogInitialStatus Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.sendOfferEmailLogInitialStatus = async function (req, res, next) {
    try {
        var limit = 10;
        var batch = 0;
        var flag = false;
        var message = "Locations not found!";

        var query = { status: "initial", type: "offer" };
        var targetDate = new Date();
        targetDate = new Date(targetDate.setHours(0, 0, 0, 0)); // Start of the day
        query['till_date'] = { $gte: targetDate };

        var locations = await LocationService.getLocationsOne({ status: 1 });
        if (locations && locations.length) {
            for (let index = 0; index < locations.length; index++) {
                const element = locations[index];
                query['location_id'] = element?._id || "";
                var resultData = await sendEmailToCustomer(query, limit, batch);
            }

            flag = true;
            message = "Email send successfully!";
        }

        return res.status(200).json({ status: 200, flag: flag, data: null, message: message })
    } catch (e) {
        console.log("getEmailLogInitialStatus Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.sendFirebasePushNotificationToDevice = async function (req, res, next) {
    try {
        let token = 'fNa5bw3tvU5BhL0Koz15Nn:APA91bG7x9oVJlicLx27NEOlG5YgwHKYOGKcOVFSPCs3bjquFwg0L3fAO7sCW64zBvKcYj_JGNplQEFqnuu5zlZ7jMctoIIkjm9_Fa51IjbVnX4t3O5SpWg6o3mdYfyBZbcx47B4c8gn';

        let notificationPayload = {
            token: token,
            notification: {
                title: "Test notification title",
                body: "Test notification content",

            }, data: {
                type: "appointment",
                id: '1234566777',
            }
        };

        let notificationResponse1 = await FirebaseService.sendPushNotification(notificationPayload);

        let notificationResponse2 = await FirebaseService.sendAdminPushNotification(notificationPayload);


        return res.status(200).json({ status: 200, flag: true, data2: notificationResponse2, data1: notificationResponse1, message: 'Success' })
    } catch (e) {
        console.log("sendFirebasePushNotificationToDevice Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.sendMultiplePushNotification = async function (req, res, next) {
    try {
        console.log("sendFirebasePushNotification");
        let tokens = [
            'epZTsZgbQzC8JpIT0O66fw:APA91bFN1faMPFbBBo66n1re3G1icxykeOR41tGqVtEkq2KKaLnYrANPJDhE3z1x2MsZlZ6DTD3qtfe3uGQKCz0P6Af5xya6thYJNljocwZq5l8itX6W-ZXp5lj2Eb1EAyGwomu3lYWV',
            'fQs-dua0T3e0-6VnlbwiPT:APA91bFImZEWxEEMO1oqEL4JRcoC1_LoUygisWt_g3KBWEru_Lg5V2cnJmwkDERVl8yOK4g3o5u_2ACMtc0YaFx02ZTKF-S-O8EWCu-EBbhdBIMbECzwMdpihZA1Ti99BwBVWvXetksw'];

        let todayDate = moment().format('YYYY-MM-DD');
        let notificationPayload = {
            notification: {
                title: "Test notification title to multiple device",
                body: "Test notification content",

            }, data: {
                type: "appointment",
                id: '1234566777',
            }
        };

        let notificationResponse = await FirebaseService.sendPushNotificationToMultipleDevice(tokens, notificationPayload);
        console.log(notificationResponse);


        return res.status(200).json({ status: 200, flag: true, data: notificationResponse, message: 'Success' })
    } catch (e) {
        console.log("sendFirebasePushNotificationToDevice Error >>> ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

const getWhatsAppDetails = async function (location_id = null, company_id = null) {
    try {
        if (location_id) {
            var location = await LocationService.getLocationOneHidden({ _id: location_id });

            if (location && location?.whatsapp_access_token && location?.whatsapp_instance_id) {
                var countryCode = location?.company_id?.country_code || 44
                var customParameter = {
                    country_code: countryCode,
                    whatsapp_access_token: location?.whatsapp_access_token,
                    whatsapp_instance_id: location?.whatsapp_instance_id
                };
                return true;

            } else {
                return false;
            }
        } else if (company_id) {
            var company = await CompanyService.getCompany(company_id);

            if (company && company?.whatsapp_access_token && company?.whatsapp_instance_id) {
                var countryCode = company?.country_code || 44
                var customParameter = {
                    country_code: countryCode,
                    whatsapp_access_token: company?.whatsapp_access_token,
                    whatsapp_instance_id: company?.whatsapp_instance_id
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

// Schedule the cron job to run every 24 hours
cron.schedule(process.env.WHATSAPP_API_CRON, async () => {
    // This will run at 00:00 every day
    try {
        // Fetch customers data from the database where isUpdateToday is true and waVerified is false
        // Calculate the date 24 hours ago
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1); // Subtract 1 day
        const customersData = await CustomerService.getCustomerAllData({
            $or: [
                {
                    createdAt: { $gte: twentyFourHoursAgo } // createdAt within the last 24 hours
                },
                {
                    isUpdateToday: true // or isUpdateToday is true
                }
            ]
        });
        // Iterate over customers data and verify WhatsApp numbers
        for (const customer of customersData) {
            let customerUpdateDetails = {};
            customerUpdateDetails._id = customer._id;
            var isVerified = await SendEmailSmsService.verifyWhatsAppNumber(customer.mobile, process.env?.WATVERIFYAPI2)
            // Update customer's WhatsApp verification status
            if (isVerified !== undefined && isVerified !== null) { // Check if isVerified is not undefined
                customerUpdateDetails.wa_verified = isVerified ? 1 : 0; // update to verified
                customerUpdateDetails.isUpdateToday = 0;
            } else {
                console.error('WhatsApp number verification failed for customer:', customer._id);
                customerUpdateDetails.isUpdateToday = 1;
                // Handle the case when WhatsApp verification fails
            }
            let updateDetails = await CustomerService.updateCustomer(customerUpdateDetails)
            sleep(10);
        }

        // Update all API key statuses to 1 after the verification process is complete
        await WhatsappApiKey.updateMany(
            {}, // Apply to all documents
            {
                $set: { 'whatsappAPIKEYData.$[].status': 1 },
                useFindAndModify: false
            } // Update status to 1 for all API keys
        );

        // console.log('WhatsApp numbers verification process completed successfully.');
    } catch (error) {
        console.error('Error verifying WhatsApp numbers:', error);
        throw error; // Rethrow the error
    }
});
