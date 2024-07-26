var AdminService = require('../services/admin.service')
var SendEmailSmsService = require('../services/sendEmailSms.service')
var CompanyService = require('../services/company.service')
var LocationService = require('../services/location.service')
var LocationTimingService = require('../services/locationTiming.service')

var AppliedDiscountService = require('../services/appliedDiscount.service')
var AppointmentService = require('../services/appointment.service')
var BlockTimeService = require('../services/blockTime.service')
var CategoryService = require('../services/category.service')
var ConsultationFormService = require('../services/consultationForm.service')
var ConsultantFormService = require('../services/consultantForm.service')
var ContentMasterService = require('../services/contentMaster.service')
var CronjobParameterService = require('../services/cronjobParameter.service')
var CustomerPackageService = require('../services/customerpackage.service')
var CustomerRewardService = require('../services/customerReward.service')
var CustomerUsagePackageService = require('../services/customerUsagePackageService.service')
var CustomParameterService = require('../services/customParameter.service')
var DiscountService = require('../services/discount.service')
var DiscountSlabService = require('../services/discountSlab.service')
const EmailLogService = require('../services/emailLog.service')
var EmployeeTimingService = require('../services/employeeTiming.service')
var HolidayService = require('../services/holiday.service')
var LeaveService = require('../services/leave.service')
var PackageService = require('../services/package.service')
var QuestionService = require('../services/question.service')
var QuestionGroupService = require('../services/questionGroup.service')
var QuickSmsLogService = require('../services/quickSmslog.service')
var RoleService = require('../services/role.service')
var RotaService = require('../services/rota.service')
var ServiceService = require('../services/service.service')
var ServiceTypeGroupService = require('../services/serviceTypeGroup.service')
var SmslogService = require('../services/smslog.service')
var TestService = require('../services/test.service')
var UserService = require('../services/user.service')
var CustomerService = require('../services/customer.service')
var EmailTemplateService = require('../services/emailTemplate.service')

const {
    increaseDateDays
} = require('../helper')

var Customer = require('../models/Customer.model');
var Appointment = require('../models/Appointment.model')
var ObjectId = require('mongodb').ObjectId;

var jwt = require('jsonwebtoken')
var AWS = require('aws-sdk')
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const dotenv = require('dotenv')
dotenv.config()
var mongoose = require('mongoose')

let ejs = require("ejs")
let pdf = require("html-pdf")

var html_to_pdf = require('html-pdf-node');

var pdfCompress = require('compress-pdf');

const puppeteer = require('puppeteer');

let path = require("path").resolve('./')
let pdfpath = require("path")

var fs = require("fs")
var root_path = require('path').resolve('public')

var dateFormat = require('dateformat')
var TinyURL = require('tinyurl')
const request = require('request')
var url = require('url')

var querystring = require('querystring')

// Saving the context of this module inside the _the variable
_this = this

const { getCustomParameterData, getEmailTemplateData } = require('../helper');

exports.sendTestSMS = async function (req, res, next) {
    try {
        var status = req.query?.status || ""
        //var location_id = "60bf8170768da009dbe78586";
        // var location_id = "60ba7674e0f95f94d2c2e36a";
        var location_id = "60d39037fa86fab9240cb075";
        var location = await LocationService.getLocation(location_id);

        var params = {
            Message: "This is test sms from StrivEdge Team",
            PhoneNumber: "0123454848",
        };

        var smsData = null
        if (status == "send") {
            var smsLogs = await SmslogService.getSmsLogsOne({ status: "initial", sms_setting: "twillio" }, 1, 1);
            for (let index = 0; index < smsLogs.length; index++) {
                var smsItem = smsLogs[index];
                if (smsItem && smsItem._id) {
                    var number = parseInt(smsItem.mobile, 10)
                    number = `+44${number}`
                    var params = {
                        PhoneNumber: number,
                        Message: smsItem?.content
                    }

                    var sendSms = await SendEmailSmsService.sendSMS(params, location?._id || "")
                    if (sendSms) {
                        var numSegments = sendSms?.numSegments ? parseInt(sendSms.numSegments) : 1

                        await SmslogService.updateSmsLog({
                            _id: smsItem._id,
                            sms_count: numSegments,
                            sms_response: JSON.stringify(sendSms),
                            response_status: sendSms?.status || "",
                            status: "processed"
                        })
                    }

                    // payload.number = `91${number}`
                }
            }
        } else {
            smsData = {
                company_id: '',
                location_id: location_id,
                client_id: '',
                sms_type: "booking_sms",
                date: Date(),
                mobile: "01234564848",
                content: "This is test sms from appointmentGem api",
                sms_count: 1,
                sms_setting: location.sms_setting,
                sms_response: null,
            }

            var smsLog = await SmslogService.createSmsLog(smsData);
        }

        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: smsData, message: "Successfully send sms" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.emailTemplateChangeApiURL = async function (req, res, next) {
    try {

        var emailTemplates = await EmailTemplateService.getAllEmailTemplates({ "contents": { $regex: /href="{{text.site_url}}/ } });

        for (var i = 0; i < emailTemplates.length; i++) {
            emailTemplates[i].contents = emailTemplates[i].contents.replace('href="{{text.site_url}}', 'href="{{text.link_url}}');

            //await EmailTemplateService.updateEmailTemplate({"_id": emailTemplates[i]._id, "contents": emailTemplates[i].contents } );
        }


        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, emailTemplates: emailTemplates, data: [], message: "Successfully send sms" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


exports.shortLink = async function (req, res, next) {
    try {

        const request = require('request-promise');

        var unique_id = (new Date()).getTime().toString(36)
        var link = '';

        var link = await SendEmailSmsService.generateShortLink(link, unique_id);
        console.log('link', link)

        // const data = { "url": link,"custom": unique_id,"domain":"https://apgem.co"};
        // const post_data = JSON.stringify(data);

        // const options = {
        //     method: 'POST',
        //     url: 'https://openmy.link/api/url/add',
        //     body: post_data,
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': 'Bearer ejxHisncvXAywIUm'
        //     }
        // }

        // var request_call = new Promise( async (resolve, reject) => {
        //     request(options).then(function (response){
        //         response = JSON.parse(response);
        //         console.log(response)
        //         if(response && !response.error){
        //             link = response.shorturl;
        //             resolve(true);           
        //         }else{
        //             resolve(false);
        //         }
        //         //res.status(200).json(response);
        //     })
        //     .catch(function (err) {
        //         console.log(err);
        //         resolve(false);
        //     })
        //  });

        // await request_call.then((response) => {
        //     console.log('response',response)

        // }).catch((error) => {
        //     console.log(error);
        // });


        return res.status(200).json({ status: 200, flag: true, data: link, message: "Successfully link shorten " });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// Async Controller function to get the To do List
exports.getAdmins = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    try {

        var unique_id = (new Date()).getTime().toString(36)

        var link = '';


        // await TinyURL.shorten(link, function(res, err) {
        //     if (err){
        //         console.log(err)
        //     }else{
        //         //link = res;
        //         console.log(res);

        //     }
        // });

        // var link2 = await TinyURL.shorten(link).then(function(res) {
        //                 console.log(res)
        //                 link = res;
        //                 //return res;
        //             }, function(err) {
        //                 console.log(err)
        //             })
        // await TinyURL.shortenWithAlias(data).then(function(res) {
        //      console.log('res',res)
        //      link = res;
        //  }, function(err) {
        //      console.log('err',err)
        //  })

        var http = require("https");
        var headers = {
            "Authorization": "Token SBNXu9h3kQNqdT3Q9qHJ",
            "Content-Type": "application/json"
        };


        const data = { "url": link, "custom": unique_id };
        const post_data = JSON.stringify(data);

        // var link = await SendEmailSmsService.generateShortLink(link,unique_id);
        // console.log('link',link)
        var request_call = new Promise(async (resolve, reject) => {
            const options = {
                method: 'POST',
                uri: 'https://openmy.link/api/url/add',
                body: post_data,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ejxHisncvXAywIUm'
                }
            }
            var req = http.request(options, function (res) {
                console.log('STATUS: ' + res.statusCode);
                res.setEncoding('utf8');
                var body = '';
                res.on('data', function (data) {
                    body += data;
                });
                res.on('end', function () {
                    console.log('body', body)
                    var response = JSON.parse(body);
                    console.log("response Data", response);
                    if (response && response.short) {
                        link = response.short;
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            });
            req.on('error', function (e) {
                resolve(false);
                console.log('Problem with request: ', e);
            });
            //req.write(post_data); // write data to request body
            req.end();
        });

        await request_call.then((response) => {
            console.log('response', response)

        }).catch((error) => {
            console.log(error);
        });

        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: link, message: "Successfully Admins Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


exports.userLocationUpdate = async function (req, res, next) {
    try {

        var query = { is_customer: 1, locations: [] };
        var users = await CustomerService.getClients(query);

        for (var i = 0; i < users.length; i++) {
            if (users[i].location_ids.length == 0) {

                var app_query = { client_id: { $elemMatch: { $in: [users[i]._id.toString()] } } };
                var appointments = await AppointmentService.getAppointmentSpecific(app_query);

                var locations = appointments.map(s => s.location_id);

                locations = Array.from(new Set(locations));

                users[i].location_ids = locations;
                if (users[i].location_ids.length > 0) {
                    console.log('users[i]._id', users[i]._id)
                    console.log('users[i].location_ids', users[i].location_ids)

                    var updatedUser = await CustomerService.updateCustomer(users[i]);

                    console.log('updatedUser', updatedUser)
                }

            }
        }
        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: users, message: "Successfully Updated Users" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.consultationCategoryUpdate = async function (req, res, next) {
    try {

        var data = await ConsultantFormService.getConsultantFormsSpecific({});
        for (let i = 0; i < data.length; i++) {
            if (data[i].service_id.length > 0) {
                var serv_query = { _id: { $in: data[i].service_id } };
                var service = await ServiceService.getServiceSpecific(serv_query);
                var cat_arr = service.map(s => s.category_id);
                cat_arr = Array.from(new Set(cat_arr));
                data[i].category_id = cat_arr;

                //console.log('data[i].category_id',data[i].category_id);

                //var updatedConsultantForm = await ConsultantFormService.updateConsultantForm(data[i]);
            }
        }
        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: data, message: "Successfully Updated Category" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.appoitmentPackageChanges = async function (req, res, next) {
    try {
        var query = { "customer_package_id": { $ne: '' } };
        var appointments = await AppointmentService.getAppointmentSpecific(query);
        for (let i = 0; i < appointments.length; i++) {
            if (appointments[i].customer_package_id || appointments[i].package_id) {
                appointments[i].customer_package_id = [appointments[i].customer_package_id];
                appointments[i].package_id = [appointments[i].package_id];

                //await AppointmentService.updateAppointment(appointments[i]);
            }
        }

        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: appointments, message: "Successfully" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

//
exports.appoitmentModalChanges = async function (req, res, next) {
    try {

        var query = { "$expr": { $gte: [{ $size: "$group_data" }, 1] } };
        var appointments = await AppointmentService.getAppointmentSpecific(query);
        for (let i = 0; i < appointments.length; i++) {
            let group_booking_ids = [];
            for (let j = 0; j < appointments[i].group_data.length; j++) {
                let user = {};
                user.name = appointments[i].group_data[j].client_name;
                user.gender = appointments[i].group_data[j].gender;
                let newUser = await CustomerService.createCustomer(user);
                //let savedUser =await newUser.save();
                let client_id = savedUser._id.toHexString();
                let newObj = {};
                newObj.client_id = [];
                newObj.client_id.push(client_id);
                newObj.service_id = appointments[i].group_data[j].service_id ? appointments[i].group_data[j].service_id : [];
                newObj.group_data = [];
                newObj.location_id = appointments[i].location_id;
                newObj.date = appointments[i].date;
                newObj.start_time = appointments[i].start_time;
                newObj.end_time = appointments[i].end_time;
                newObj.comments = appointments[i].comments;
                newObj.employee_comments = appointments[i].employee_comments;
                newObj.payment_type = appointments[i].payment_type;
                newObj.payment_status = appointments[i].payment_status;
                newObj.is_readed = appointments[i].is_readed;
                newObj.status = appointments[i].status;
                newObj.booking_status = appointments[i].booking_status;
                newObj.transaction_id = appointments[i].transaction_id;
                newObj.transaction = appointments[i].transaction;
                newObj.front_booking = appointments[i].front_booking;
                newObj.start_time_meridiem = appointments[i].start_time_meridiem;
                newObj.end_time_meridiem = appointments[i].end_time_meridiem;
                newObj.patch_test_booking = appointments[i].patch_test_booking;
                newObj.stop_email_sms = appointments[i].stop_email_sms;
                newObj.discount_id = appointments[i].discount_id;
                newObj.discount_code = appointments[i].discount_code;
                newObj.offer_discount_code = appointments[i].offer_discount_code;

                newObj.grand_total = appointments[i].group_data[j].total_amount;
                newObj.grand_total_price = appointments[i].group_data[j].total_amount;
                newObj.grand_discounted_price = appointments[i].group_data[j].discounted_price;
                newObj.grand_final_price = appointments[i].group_data[j].remaining_amount;

                newObj.paid_amount = appointments[i].group_data[j].paid_amount;
                newObj.remaining_amount = appointments[i].group_data[j].remaining_amount;
                newObj.total_amount = appointments[i].group_data[j].total_amount;
                newObj.total_price = appointments[i].group_data[j].total_price;
                newObj.discounted_price = appointments[i].group_data[j].discounted_price;
                newObj.price = appointments[i].group_data[j].price;


                newObj.employee_id = appointments[i].group_data[j].employee_id;
                console.log("data to be inser", newObj, "data id  ", appointments[i]._id)
                let newAppointment = await AppointmentService.createAppointment(newObj);
                group_booking_ids.push(newAppointment._id.toHexString());

            }
            appointments[i].grand_total = appointments[i].total_amount;
            appointments[i].grand_total_price = appointments[i].total_amount;
            appointments[i].grand_discounted_price = appointments[i].discounted_price;
            appointments[i].grand_final_price = appointments[i].remaining_amount;

            appointments[i].package_service = appointments[i].package_service ? appointments[i].package_service : [];
            appointments[i].discount_services = appointments[i].discount_services ? appointments[i].discount_services : [];
            appointments[i].group_booking_ids = group_booking_ids;
            appointments[i].group_data = [];
            //await AppointmentService.updateAppointment(appointments[i]);

        }

        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: appointments, message: "Successfully" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

const getLocationPrice = async function (id) {
    var data = { location: null, location_timing: [], company: null, locations: null, types: [], backgroundimage: '/brochure-backgroundimage.png', port: process.env.PORT };
    try {
        var location = await LocationService.getLocation(id);

        var todayDt = new Date();
        var date = dateFormat(new Date(), "yyyy-mm-dd");

        if (location.group_special_hours && location.group_special_hours.length > 0) {
            location.special_hour = [];

            for (let ind = 0; ind < location.group_special_hours.length; ind++) {

                if (date <= dateFormat(location.group_special_hours[ind].special_hour_end_date, "yyyy-mm-dd")) {
                    if (ind != -1) {
                        var stime = location.group_special_hours[ind].special_hour_from_time;

                        var showStartTimeSpilt = stime.split(':');
                        var start_hour = showStartTimeSpilt[0];
                        var st_meridiem = start_hour >= 12 ? 'PM' : 'AM';
                        start_hour = start_hour > 12 ? start_hour - 12 : start_hour;
                        showStartTimeSpilt[0] = (start_hour + '').length == 1 ? '0' + start_hour : start_hour;
                        stime = showStartTimeSpilt.join(':');

                        var etime = location.group_special_hours[ind].special_hour_end_time;

                        var showStartTimeSpilt = etime.split(':');
                        var start_hour = showStartTimeSpilt[0];
                        var et_meridiem = start_hour >= 12 ? 'PM' : 'AM';
                        start_hour = start_hour > 12 ? start_hour - 12 : start_hour;
                        showStartTimeSpilt[0] = (start_hour + '').length == 1 ? '0' + start_hour : start_hour;
                        etime = showStartTimeSpilt.join(':');

                        location.group_special_hours[ind].special_hour_start_date = dateFormat(location.group_special_hours[ind].special_hour_start_date, "dd-mmm-yyyy");

                        location.group_special_hours[ind].special_hour_end_date = dateFormat(location.group_special_hours[ind].special_hour_end_date, "dd-mmm-yyyy");

                        location.group_special_hours[ind].special_hour_from_time = stime + " " + st_meridiem;
                        location.group_special_hours[ind].special_hour_end_time = etime + " " + et_meridiem;

                        location.special_hour.push(location.group_special_hours[ind]);

                        //console.log('location.special_hour',location.special_hour)

                    }
                }


            }

        }

        if (location && location._id) {
            var timing = await LocationTimingService.getLocationTimingsSpecific({ location_id: location._id.toString(), status: 1 });
            var tlen = timing.length;

            if (timing && timing.length) {
                if (timing[0].start_time) {
                    var stime = timing[0].start_time;
                    var stimeToNum = timeToNum(timing[0].start_time);

                    stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM';

                    var showStartTimeSpilt = stime.split(':');
                    var end_hour = showStartTimeSpilt[0];
                    end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                    showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                    stime = showStartTimeSpilt.join(':');

                    timing[0].start_time = stime + " " + stimeToNum;
                }

                if (timing[tlen - 1].start_time) {
                    var stime = timing[tlen - 1].start_time;
                    var stimeToNum = timeToNum(timing[tlen - 1].start_time);

                    stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM';

                    var showStartTimeSpilt = stime.split(':');
                    var end_hour = showStartTimeSpilt[0];
                    end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                    showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                    stime = showStartTimeSpilt.join(':');

                    timing[tlen - 1].start_time = stime + " " + stimeToNum;
                }

                if (timing[0].end_time) {
                    var etime = timing[0].end_time;
                    var etimeToNum = timeToNum(timing[0].end_time);

                    etimeToNum = etimeToNum >= 720 ? 'PM' : 'AM';

                    var showEndTimeSpilt = etime.split(':');
                    var end_hour = showEndTimeSpilt[0];
                    end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                    showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                    etime = showEndTimeSpilt.join(':');

                    timing[0].end_time = etime + " " + etimeToNum;
                }

                if (timing[tlen - 1].end_time) {
                    var etime = timing[tlen - 1].end_time;
                    var etimeToNum = timeToNum(timing[tlen - 1].end_time);

                    etimeToNum = etimeToNum >= 720 ? 'PM' : 'AM';

                    var showEndTimeSpilt = etime.split(':');
                    var end_hour = showEndTimeSpilt[0];
                    end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                    showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                    etime = showEndTimeSpilt.join(':');

                    timing[tlen - 1].end_time = etime + " " + etimeToNum;
                }

                time1 = { day: "Mon-Sat", start_time: timing[0].start_time, end_time: timing[0].end_time };
                time2 = { day: "Sun", start_time: timing[tlen - 1].start_time, end_time: timing[tlen - 1].end_time };
                data.location_timing.push(time1);
                data.location_timing.push(time2);
            }

            data.location = location;
            var company = await CompanyService.getCompany(location.company_id);

            var categories = await CategoryService.getCategoriesbyLocation({ location_id: location._id.toString(), status: 1, price_list_status: { $ne: 0 } });

            for (var i = 0; i < categories.length; i++) {
                var obj = { type: categories[i], groups: [] }

                if (company) {
                    if (!categories[i].brochure_background_image || categories[i].brochure_background_image == '') {
                        categories[i].brochure_background_image = company.brochure_background_image;
                    }
                    if (!categories[i].brochure_background_color || categories[i].brochure_background_color == '') {
                        categories[i].brochure_background_color = company.brochure_background_color;
                    }
                    if (!categories[i].brochure_heading_color || categories[i].brochure_heading_color == '') {
                        categories[i].brochure_heading_color = company.brochure_heading_color;
                    }
                    if (!categories[i].brochure_font_color || categories[i].brochure_font_color == '') {
                        categories[i].brochure_font_color = company.brochure_font_color;
                    }
                }

                var service_group = await ServiceTypeGroupService.getServiceTypeGroupsbyLocation({ location_id: location._id.toString(), category_id: categories[i]._id.toString(), status: 1 });
                if (service_group.length > 0) {
                    for (var g = 0; g < service_group.length; g++) {

                        var services = await ServiceService.getSortServicesbyLocation({ location_id: location._id.toString(), category_id: categories[i]._id.toString(), status: 1, price_list_status: { $ne: 0 }, service_type_group_id: service_group[g]._id.toString() });

                        if (services && services.length) {
                            var groups = { group: service_group[g], services: services }
                            var type_data = { group: service_group[g], services: services };
                            obj.groups.push(type_data);
                        }

                    }

                } else {
                    var services = await ServiceService.getSortServicesbyLocation({ location_id: location._id.toString(), category_id: categories[i]._id.toString(), status: 1, price_list_status: { $ne: 0 } });

                    if (services && services.length) {
                        var type_data = { group: [], services: services };
                        obj.groups.push(type_data);
                    }
                }
                data.types.push(obj);

            }

            // console.log("categories ",categories.length);

            if (company && company._id) {
                data.company = company;
                var locationsData = [];
                var locations = await LocationService.getLocationCompanySpecific({ _id: { $ne: id }, company_id: company._id.toString(), status: 1 });

                for (var j = 0; j < locations.length; j++) {
                    var timing_data = [];
                    var timings = await LocationTimingService.getLocationTimingsSpecific({ location_id: locations[j]._id.toString(), status: 1 });
                    var timeLen = timings.length;

                    if (timings && timings.length) {
                        if (timings[0].start_time) {
                            var stime = timings[0].start_time;
                            var stimeToNum = timeToNum(timings[0].start_time);

                            stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM';

                            var showStartTimeSpilt = stime.split(':');
                            var end_hour = showStartTimeSpilt[0];
                            end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                            showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                            stime = showStartTimeSpilt.join(':');

                            timings[0].start_time = stime + " " + stimeToNum;
                        }

                        if (timings[timeLen - 1].start_time) {
                            var stime = timings[timeLen - 1].start_time;
                            var stimeToNum = timeToNum(timings[timeLen - 1].start_time);

                            stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM';

                            var showStartTimeSpilt = stime.split(':');
                            var end_hour = showStartTimeSpilt[0];
                            end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                            showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                            stime = showStartTimeSpilt.join(':');

                            timings[timeLen - 1].start_time = stime + " " + stimeToNum;
                        }

                        if (timings[0].end_time) {
                            var etime = timings[0].end_time;
                            var etimeToNum = timeToNum(timings[0].end_time);

                            etimeToNum = etimeToNum >= 720 ? 'PM' : 'AM';

                            var showEndTimeSpilt = etime.split(':');
                            var end_hour = showEndTimeSpilt[0];
                            end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                            showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                            etime = showEndTimeSpilt.join(':');

                            timings[0].end_time = etime + " " + etimeToNum;
                        }

                        if (timings[timeLen - 1].end_time) {
                            var etime = timings[timeLen - 1].end_time;
                            var etimeToNum = timeToNum(timings[timeLen - 1].end_time);

                            etimeToNum = etimeToNum >= 720 ? 'PM' : 'AM';

                            var showEndTimeSpilt = etime.split(':');
                            var end_hour = showEndTimeSpilt[0];
                            end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                            showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                            etime = showEndTimeSpilt.join(':');

                            timings[timeLen - 1].end_time = etime + " " + etimeToNum;
                        }

                        time_data1 = { day: "Mon-Sat", start_time: timings[0].start_time, end_time: timings[0].end_time };
                        time_data2 = { day: "Sun", start_time: timings[timeLen - 1].start_time, end_time: timings[timeLen - 1].end_time };
                        timing_data.push(time_data1)
                        timing_data.push(time_data2)
                    }

                    if (locations[j].group_special_hours && locations[j].group_special_hours.length > 0) {
                        locations[j].special_hour = [];

                        for (let ind = 0; ind < locations[j].group_special_hours.length; ind++) {

                            if (date <= dateFormat(locations[j].group_special_hours[ind].special_hour_end_date, "yyyy-mm-dd")) {
                                if (ind != -1) {
                                    var stime = locations[j].group_special_hours[ind].special_hour_from_time;

                                    var showStartTimeSpilt = stime.split(':');
                                    var start_hour = showStartTimeSpilt[0];
                                    var st_meridiem = start_hour >= 12 ? 'PM' : 'AM';
                                    start_hour = start_hour > 12 ? start_hour - 12 : start_hour;
                                    showStartTimeSpilt[0] = (start_hour + '').length == 1 ? '0' + start_hour : start_hour;
                                    stime = showStartTimeSpilt.join(':');

                                    var etime = locations[j].group_special_hours[ind].special_hour_end_time;

                                    var showStartTimeSpilt = etime.split(':');
                                    var start_hour = showStartTimeSpilt[0];
                                    var et_meridiem = start_hour >= 12 ? 'PM' : 'AM';
                                    start_hour = start_hour > 12 ? start_hour - 12 : start_hour;
                                    showStartTimeSpilt[0] = (start_hour + '').length == 1 ? '0' + start_hour : start_hour;
                                    etime = showStartTimeSpilt.join(':');

                                    locations[j].group_special_hours[ind].special_hour_start_date = dateFormat(locations[j].group_special_hours[ind].special_hour_start_date, "dd-mmm-yyyy");

                                    locations[j].group_special_hours[ind].special_hour_end_date = dateFormat(locations[j].group_special_hours[ind].special_hour_end_date, "dd-mmm-yyyy");

                                    locations[j].group_special_hours[ind].special_hour_from_time = stime + " " + st_meridiem;
                                    locations[j].group_special_hours[ind].special_hour_end_time = etime + " " + et_meridiem;

                                    var obj = { start_time: stime + " " + st_meridiem, end_time: etime + " " + et_meridiem };

                                    locations[j].special_hour.push(locations[j].group_special_hours[ind])

                                }
                            }


                        }

                    }


                    var location_data = {
                        _id: locations[j]._id,
                        group_close_days: locations[j].group_close_days,
                        group_special_hours: locations[j].group_special_hours,
                        user_id: locations[j].user_id,
                        role_id: locations[j].role_id,
                        company_id: locations[j].company_id,
                        name: locations[j].name,
                        contact_name: locations[j].contact_name,
                        contact_number: locations[j].contact_number,
                        email: locations[j].email,
                        full_address: locations[j].full_address,
                        latitude: locations[j].latitude,
                        longitude: locations[j].longitude,
                        admin_status: locations[j].admin_status,
                        online_status: locations[j].online_status,
                        status: locations[j].status,
                        paypal_client_id: locations[j].paypal_client_id,
                        paypal_client_secret: locations[j].paypal_client_secret,
                        createdAt: locations[j].createdAt,
                        updatedAt: locations[j].updatedAt,
                        timing: timing_data,
                        special_hour: locations[j].special_hour
                    }

                    var loc_index = locationsData.findIndex(x => x._id == locations[j]._id);
                    if (loc_index == -1) {
                        locationsData.push(location_data);
                    }
                    // console.log("location_data j=",j," ",location_data)
                }

                if (locationsData && locationsData.length) {
                    data.locations = locationsData;
                }
            }
        }

        return data;
    } catch (e) {
        console.log(e)
        return data;
    }
}

const getScanReport = (params, template, folder, file_name) => new Promise(
    //announcePDFReady() is a function we call to resolve our promise
    announcePDFReady => {

        Promise.
            all([]).
            then(function ([results1, results2]) {
                //{data: data,total_count:total_count}

                try {

                    ejs.renderFile((path + '/views/' + template), params, async (err, data) => {
                        if (err) {
                            console.log('err', err)
                        } else {
                            let options = {
                                "header": {
                                    "height": "10mm"
                                },
                                "footer": {
                                    "height": "10mm",
                                },
                            };
                            pdf.create(data, options).toFile("public/images/" + folder + "/" + file_name, function (err, data) {
                                //console.log('data',data)
                                announcePDFReady(data);
                                if (err) {
                                    console.log('err', err)
                                }
                            });

                        }
                    });

                } catch (e) {
                    console.log(e)
                    //Return an Error Response Message with Code and the Error Message.
                    return res.status(200).json({ status: 200, flag: false, message: e.message });
                }



            })

    }

)

exports.generatePdf = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.query.id;
    try {
        var data = await getLocationPrice(id);
        var location = await LocationService.getLocation(id);
        var company = {};
        if (location?.company_id) {
            company = await CompanyService.getCompany(location?.company_id)
        }
        //console.log('data',data)
        var file_name = location.name.replace(/\s+/g, '_').toLowerCase() + '_brochure_' + new Date().getTime() + '.pdf';
        console.log('file_name', file_name)
        var pdf_name = 'images/pdf/' + file_name;
        var folder = 'pdf';
        var template = 'location_price_list.ejs';
        var params = { brochureData: data, currency: company.currency ? company.currency.symbol : "£" };

        const pdfIsReady = await getScanReport(params, template, folder, file_name);
        console.log('pdfIsReady', pdfIsReady)
        if (pdfIsReady == false) {
            //it failed. Do something? Ignore it?
        } else {

        }

        // await ejs.renderFile((path+'/views/location_price_list.ejs'), {brochureData: data}, (err, data) => {
        //     if (err) {
        //         console.log('err',err)
        //     } else {
        //         let options = {
        //             "header": {
        //                 "height": "7mm",
        //               },
        //               "footer": {
        //                  "height": "10.3mm",
        //             }
        //         };
        //         pdf.create(data, options).toFile("public/images/pdf/"+file_name, function (err, data) {
        //             console.log('data',data)
        //             if (err) {
        //                 console.log('err',err)
        //             }
        //         });
        //     }
        // });

        console.log('pdf_name', pdf_name)
        return res.status(200).json({ status: 200, flag: true, data: data, pdf_name: pdf_name, message: "Successfully Admin Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getAdmin = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {

        domain = 'test'
        if (domain) {

            var companies = await CompanyService.getActiveCompanies({ domain: domain });

            var query = { status: 1, company_id: companies[0]._id };
            var locations = await LocationService.getActiveLocations(query);


        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: {}, message: "Successfully Admin Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


exports.createAdmin = async function (req, res, next) {
    // console.log('req body',req.body)
    var email = req.body.email;
    var Admin = await AdminService.getAdminByEmail(email);
    if (Admin && Admin._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Email address already exist." })
    } else {
        try {
            // Calling the Service function with the new object from the Request Body
            var createdAdmin = await AdminService.createAdmin(req.body)
            return res.status(200).json({ status: 200, flag: true, data: createdAdmin, message: "Successfully Created Admin" })
        } catch (e) {
            //Return an Error Response Message with Code and the Error Message.
            return res.status(200).json({ status: 200, flag: false, message: "Admin Creation was Unsuccesfull" })
        }
    }

}

exports.updateAdmin = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedAdmin = await AdminService.updateAdmin(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedAdmin, message: "Successfully Updated Admin" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeAdmin = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await AdminService.deleteAdmin(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.loginAdmin = async function (req, res, next) {
    // Req.Body contains the form submit values.
    var Admin = {
        email: req.body.email,
        password: req.body.password
    }

    try {
        // Calling the Service function with the new object from the Request Body
        var loginAdmin = await AdminService.loginAdmin(Admin);
        console.log(loginAdmin)
        if (loginAdmin) {
            var token1 = jwt.sign({
                id: loginAdmin._id
            }, process.env.SECRET, {
                expiresIn: 86400 // expires in 24 hours
            });
            return res.status(200).json({ status: 200, flag: true, token: token1, data: loginAdmin, message: "Successfully login" })
        } else {
            return res.status(200).json({ status: 200, flag: false, message: "Invalid username or password" })
        }
    } catch (e) {
        console.log("Error>> \n", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Invalid username or password" })
    }
}

async function getAllQuestions(data) {
    var category_id = [];
    var beforeQuestions = [];
    var bsQuestionIndex = [];
    var afterQuestions = [];

    var query = { status: 1, form_type: 'service' }
    var service_id = data.service_id

    if (data.location_id) {
        query['location_id'] = data.location_id
    }

    var service_query = { _id: { $in: service_id } }
    var service = await ServiceService.getServiceSpecificWithCategory(service_query)
    var category_id = []
    if (service && service.length > 0) {
        category_id = service.map(s => s.category_id)
    }

    query['$or'] = [
        { category_id: { $elemMatch: { $in: category_id } } },
        { service_id: { $elemMatch: { $in: service_id } } }
    ]

    var consultationForms = await ConsultationFormService.getConsultationFormsSpecific(query)
    var queData = consultationForms.map(s => s.groupData)
    queData = [].concat.apply([], queData)

    const result = queData.map(({ group_id, index, ...rest }) => ({ ...rest })) // merge all groupdata

    const queAllData = result.map(({
        question_data: q_data,
        ...rest
    }) => ({ q_data, ...rest })) // rename question_data to q_data key

    let beforeQue = queAllData.map(({ ...el }) => {
        el.q_data.sort((a, b) => a.order_no - b.order_no)
        el.q_data = el.q_data.filter(function (o) { return o["before_after"] == 0 })
        return el
    }) // Filter before questions 

    var beforeQuestions = beforeQue.filter(function (obj) { return obj.q_data.length > 0 }) // Remove emplty question group

    let afterQue = queAllData.map(({ ...el }) => {
        el.q_data.sort((a, b) => a.order_no - b.order_no)
        el.q_data = el.q_data.filter(function (o) { return o["before_after"] == 1 })
        return el
    }) // Filter after questions 

    var afterQuestions = afterQue.filter(function (obj) { return obj.q_data.length > 0 }) // Remove emplty question group

    var bq = { client_id: { $elemMatch: { $eq: data.client_id.toString() } } }
    for (var b = 0; b < beforeQuestions.length; b++) {
        for (var q = 0; q < beforeQuestions[b].q_data.length; q++) {
            bq['before'] = { $elemMatch: { "q_id": { $eq: beforeQuestions[b].q_data[q]._id.toString() } } }
            if (beforeQuestions[b].q_data[q].options?.length > 0) {
                for (var oq = 0; oq < beforeQuestions[b].q_data[q].options.length; oq++) {
                    if (beforeQuestions[b].q_data[q].options[oq].question_ids && beforeQuestions[b].q_data[q].options[oq].question_ids.length > 0) {
                        var otp_q = { _id: { $in: beforeQuestions[b].q_data[q].options[oq].question_ids } }
                        var optQue = await QuestionService.getQuestionsSpecific(otp_q)
                        beforeQuestions[b].q_data[q].options[oq].question_ids = optQue
                    } else {
                        beforeQuestions[b].q_data[q].options[oq].question_ids = []
                    }
                }
            }

            var consultantForms = await ConsultantFormService.getConsultantFormsSpecific(bq)
            if (consultantForms && consultantForms.length > 0) {
                var setBeforeData = consultantForms[0].before.findIndex(x => x.q_id === beforeQuestions[b].q_data[q]._id.toString())
                beforeQuestions[b].q_data[q].value = []

                if (setBeforeData != -1) {
                    beforeQuestions[b].q_data[q].value.push(consultantForms[0].before[setBeforeData])
                }
            }
        }
    }

    var aq = { client_id: { $elemMatch: { $eq: data.client_id.toString() } } }
    for (var b = 0; b < afterQuestions.length; b++) {
        for (var q = 0; q < afterQuestions[b].q_data.length; q++) {
            aq['after'] = { $elemMatch: { "q_id": { $eq: afterQuestions[b].q_data[q]._id.toString() } } }
            if (afterQuestions[b].q_data[q].options?.length > 0) {
                for (var oq = 0; oq < afterQuestions[b].q_data[q].options.length; oq++) {
                    if (afterQuestions[b].q_data[q].options[oq].question_ids && afterQuestions[b].q_data[q].options[oq].question_ids.length > 0) {
                        var otp_q = { _id: { $in: afterQuestions[b].q_data[q].options[oq].question_ids } }
                        var optQue = await QuestionService.getQuestionsSpecific(otp_q)
                        afterQuestions[b].q_data[q].options[oq].question_ids = optQue
                    } else {
                        afterQuestions[b].q_data[q].options[oq].question_ids = []
                    }
                }
            }

            var consultantForms = await ConsultantFormService.getConsultantFormsSpecific(aq)
            if (consultantForms && consultantForms.length > 0) {
                var setAfterData = consultantForms[0].after.findIndex(x => x.q_id === afterQuestions[b].q_data[q]._id.toString())
                afterQuestions[b].q_data[q].value = []
                if (setAfterData != -1) {
                    afterQuestions[b].q_data[q].value.push(consultantForms[0].after[setAfterData])
                }
            }
        }
    }

    return { 'before': beforeQuestions, 'after': afterQuestions };
}

exports.exportDownloadPdf = async function (req, res, next) {
    var id = req.query.id;
    var location_id = req.query.location_id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" });
    }

    if (!location_id) {
        return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present" });
    }

    var query = {};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    // console.log("exportDownloadPdf ",query)
    try {
        // Calling the Service function with the new object from the Request Body
        var flag_minor = 0;
        var today_date = dateFormat(new Date(), "yyyy-mm-dd");
        var signature_label = "Signature";
        var file_name = 'consultation_form_' + new Date().getTime() + '.pdf';
        var pdf_name = 'images/consultation/pdf/';
        var before_question_text = "Before Questions";
        var after_question_text = "After Questions";
        var beforeQuestions = [];
        var afterQuestions = [];
        var dob = "";
        var before_image_flag = false;
        var after_image_flag = false;
        var customer_signature_flag = false;
        var therapist_signature_flag = false;

        var location = await LocationService.getLocation(req.query.location_id);

        var consultantForm = await ConsultantFormService.getConsultantForm(id);

        if (consultantForm && consultantForm._id) {

            var parameter2 = await getCustomParameterData({ 'location_id': consultantForm.location_id, key_url: 'consultation_form' });

            if (parameter2 && parameter2?.formData && parameter2?.formData?.status) {
                before_question_text = parameter2?.formData?.before_question_text || '';
                after_question_text = parameter2?.formData?.after_question_text || '';
            }

            var questions = await getAllQuestions({ 'location_id': consultantForm.location_id, 'service_id': consultantForm.service_id, client_id: consultantForm.client_id[0] });
            if (questions) {
                beforeQuestions = questions.before;
                afterQuestions = questions.after;

                if (consultantForm.before.length) {
                    for (var i = 0; i < consultantForm.before.length; i++) {
                        var category_id = consultantForm.before[i].category_id;
                        var id = consultantForm.before[i].q_id;
                        for (var j = 0; j < beforeQuestions.length; j++) {
                            for (var k = 0; k < beforeQuestions[j].q_data.length; k++) {
                                if (beforeQuestions[j]._id == category_id && beforeQuestions[j].q_data[k]._id == id) {
                                    if (consultantForm.before[i].type == "checkbox") {
                                        var cValue = consultantForm.before[i].value.split(",");
                                        if (cValue.length) {
                                            for (var l = 0; l < cValue.length; l++) {
                                                var cCheck = beforeQuestions[j].q_data[k].options.findIndex(y => y.lable == cValue[l]);
                                                if (cCheck != -1) {
                                                    beforeQuestions[j].q_data[k].options[cCheck]['isCheck'] = true;

                                                    if (beforeQuestions[j].q_data[k].options[cCheck].question_ids && consultantForm.before[i].q_options && consultantForm.before[i].q_options.length > 0) {

                                                        for (let oque = 0; oque < beforeQuestions[j].q_data[k].options[cCheck].question_ids.length; oque++) {

                                                            var qid = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]._id;
                                                            var opt_qi = consultantForm.before[i].q_options.findIndex(y => y.q_id == qid.toString());

                                                            if (opt_qi != -1) {
                                                                beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].value = consultantForm.before[i].q_options[opt_qi].value;

                                                                if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "checkbox" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "multi") {

                                                                    var ocValue = consultantForm.before[i].q_options[opt_qi].value.split(",");
                                                                    if (ocValue.length) {
                                                                        for (var ol = 0; ol < ocValue.length; ol++) {
                                                                            var ocCheck = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options.findIndex(y => y.lable == ocValue[ol]);
                                                                            if (ocCheck != -1) {
                                                                                beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                            }
                                                                        }
                                                                    }
                                                                }

                                                                if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "radio" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "single") {
                                                                    var ocValue = consultantForm.before[i].q_options[opt_qi].value;
                                                                    var ocCheck = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options.findIndex(z => z.lable == ocValue);
                                                                    if (ocCheck != -1) {
                                                                        beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                    }

                                                                }

                                                                if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "text" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "date" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "textarea") {
                                                                    var value = consultantForm.before[i].q_options[opt_qi].value;
                                                                    beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = '';
                                                                    if (value) {
                                                                        if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "date") {
                                                                            var datePipe = new DatePipe("en-US");

                                                                            beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = datePipe.transform(value, 'yyyy-MM-dd');
                                                                        } else {
                                                                            beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = value;
                                                                        }

                                                                    }
                                                                }

                                                                if (consultantForm.before[i].q_options[opt_qi].other_text) {

                                                                    beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['other_text_ans'] = consultantForm.before[i].q_options[opt_qi].other_text;
                                                                }

                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if (consultantForm.before[i].other_text) {
                                            beforeQuestions[j].q_data[k]['other_text_ans'] = consultantForm.before[i].other_text;
                                        }
                                    }

                                    if (consultantForm.before[i].type == "radio") {
                                        var rValue = consultantForm.before[i].value;
                                        if (rValue) {
                                            var cCheck = beforeQuestions[j].q_data[k].options.findIndex(z => z.lable == rValue);
                                            if (cCheck != -1) {
                                                beforeQuestions[j].q_data[k].options[cCheck]['isCheck'] = true;

                                                if (beforeQuestions[j].q_data[k].options[cCheck].question_ids && consultantForm.before[i].q_options && consultantForm.before[i].q_options.length > 0) {

                                                    for (let oque = 0; oque < beforeQuestions[j].q_data[k].options[cCheck].question_ids.length; oque++) {

                                                        var qid = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]._id;
                                                        var opt_qi = consultantForm.before[i].q_options.findIndex(y => y.q_id == qid.toString());

                                                        if (opt_qi != -1) {
                                                            beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].value = consultantForm.before[i].q_options[opt_qi].value;

                                                            if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "checkbox" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "multi") {

                                                                var ocValue = consultantForm.before[i].q_options[opt_qi].value.split(",");
                                                                if (ocValue.length) {
                                                                    for (var ol = 0; ol < ocValue.length; ol++) {
                                                                        var ocCheck = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options.findIndex(y => y.lable == ocValue[ol]);
                                                                        if (ocCheck != -1) {
                                                                            beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                        }
                                                                    }
                                                                }
                                                            }

                                                            if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "radio" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "single") {
                                                                var ocValue = consultantForm.before[i].q_options[opt_qi].value;
                                                                var ocCheck = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options.findIndex(z => z.lable == ocValue);
                                                                if (ocCheck != -1) {
                                                                    beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                }

                                                            }

                                                            if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "text" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "date" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "textarea") {
                                                                var value = consultantForm.before[i].q_options[opt_qi].value;
                                                                beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = '';
                                                                if (value) {
                                                                    if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "date") {
                                                                        var datePipe = new DatePipe("en-US");

                                                                        beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = datePipe.transform(value, 'yyyy-MM-dd');
                                                                    } else {
                                                                        beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = value;
                                                                    }

                                                                }
                                                            }

                                                            if (consultantForm.before[i].q_options[opt_qi].other_text) {

                                                                beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['other_text_ans'] = consultantForm.before[i].q_options[opt_qi].other_text;
                                                            }

                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if (consultantForm.before[i].other_text) {
                                            beforeQuestions[j].q_data[k]['other_text_ans'] = consultantForm.before[i].other_text;
                                        }
                                    }

                                    if (consultantForm.before[i].type == "single") {
                                        var sValue = consultantForm.before[i].value;
                                        if (sValue) {
                                            var cCheck = beforeQuestions[j].q_data[k].options.findIndex(z => z.lable == sValue);
                                            if (cCheck != -1) {
                                                beforeQuestions[j].q_data[k].options[cCheck]['isCheck'] = true;

                                                if (beforeQuestions[j].q_data[k].options[cCheck].question_ids && consultantForm.before[i].q_options && consultantForm.before[i].q_options.length > 0) {

                                                    for (let oque = 0; oque < beforeQuestions[j].q_data[k].options[cCheck].question_ids.length; oque++) {

                                                        var qid = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]._id;
                                                        var opt_qi = consultantForm.before[i].q_options.findIndex(y => y.q_id == qid.toString());

                                                        if (opt_qi != -1) {
                                                            beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].value = consultantForm.before[i].q_options[opt_qi].value;

                                                            if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "checkbox" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "multi") {

                                                                var ocValue = consultantForm.before[i].q_options[opt_qi].value.split(",");
                                                                if (ocValue.length) {
                                                                    for (var ol = 0; ol < ocValue.length; ol++) {
                                                                        var ocCheck = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options.findIndex(y => y.lable == ocValue[ol]);
                                                                        if (ocCheck != -1) {
                                                                            beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                        }
                                                                    }
                                                                }
                                                            }

                                                            if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "radio" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "single") {
                                                                var ocValue = consultantForm.before[i].q_options[opt_qi].value;
                                                                var ocCheck = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options.findIndex(z => z.lable == ocValue);
                                                                if (ocCheck != -1) {
                                                                    beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                }

                                                            }

                                                            if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "text" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "date" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "textarea") {
                                                                var value = consultantForm.before[i].q_options[opt_qi].value;
                                                                beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = '';
                                                                if (value) {
                                                                    if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "date") {
                                                                        var datePipe = new DatePipe("en-US");

                                                                        beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = datePipe.transform(value, 'yyyy-MM-dd');
                                                                    } else {
                                                                        beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = value;
                                                                    }

                                                                }
                                                            }

                                                            if (consultantForm.before[i].q_options[opt_qi].other_text) {

                                                                beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['other_text_ans'] = consultantForm.before[i].q_options[opt_qi].other_text;
                                                            }

                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if (consultantForm.before[i].other_text) {
                                            beforeQuestions[j].q_data[k]['other_text_ans'] = consultantForm.before[i].other_text;
                                        }
                                    }

                                    if (consultantForm.before[i].type == "multi") {
                                        var mValue = consultantForm.before[i].value.split(",");
                                        if (mValue.length) {
                                            for (var l = 0; l < mValue.length; l++) {
                                                var cCheck = beforeQuestions[j].q_data[k].options.findIndex(y => y.lable == mValue[l]);
                                                if (cCheck != -1) {
                                                    beforeQuestions[j].q_data[k].options[cCheck]['isCheck'] = true;

                                                    if (beforeQuestions[j].q_data[k].options[cCheck].question_ids && consultantForm.before[i].q_options && consultantForm.before[i].q_options.length > 0) {

                                                        for (let oque = 0; oque < beforeQuestions[j].q_data[k].options[cCheck].question_ids.length; oque++) {

                                                            var qid = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]._id;
                                                            var opt_qi = consultantForm.before[i].q_options.findIndex(y => y.q_id == qid.toString());

                                                            if (opt_qi != -1) {
                                                                beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].value = consultantForm.before[i].q_options[opt_qi].value;

                                                                if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "checkbox" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "multi") {

                                                                    var ocValue = consultantForm.before[i].q_options[opt_qi].value.split(",");
                                                                    if (ocValue.length) {
                                                                        for (var ol = 0; ol < ocValue.length; ol++) {
                                                                            var ocCheck = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options.findIndex(y => y.lable == ocValue[ol]);
                                                                            if (ocCheck != -1) {
                                                                                beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                            }
                                                                        }
                                                                    }
                                                                }

                                                                if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "radio" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "single") {
                                                                    var ocValue = consultantForm.before[i].q_options[opt_qi].value;
                                                                    var ocCheck = beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options.findIndex(z => z.lable == ocValue);
                                                                    if (ocCheck != -1) {
                                                                        beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                    }

                                                                }

                                                                if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "text" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "date" || beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "textarea") {
                                                                    var value = consultantForm.before[i].q_options[opt_qi].value;
                                                                    beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = '';
                                                                    if (value) {
                                                                        if (beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque].option_type == "date") {
                                                                            var datePipe = new DatePipe("en-US");

                                                                            beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = datePipe.transform(value, 'yyyy-MM-dd');
                                                                        } else {
                                                                            beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['question_ans'] = value;
                                                                        }

                                                                    }
                                                                }

                                                                if (consultantForm.before[i].q_options[opt_qi].other_text) {

                                                                    beforeQuestions[j].q_data[k].options[cCheck].question_ids[oque]['other_text_ans'] = consultantForm.before[i].q_options[opt_qi].other_text;
                                                                }

                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if (consultantForm.before[i].other_text) {
                                            beforeQuestions[j].q_data[k]['other_text_ans'] = consultantForm.before[i].other_text;
                                        }
                                    }

                                    if (consultantForm.before[i].type == "text") {
                                        var value = consultantForm.before[i].value;
                                        beforeQuestions[j].q_data[k]['question_ans'] = '';
                                        if (value) {
                                            beforeQuestions[j].q_data[k]['question_ans'] = value;
                                        }
                                        if (consultantForm.before[i].other_text) {
                                            beforeQuestions[j].q_data[k]['other_text_ans'] = consultantForm.before[i].other_text;
                                        }
                                    }

                                    if (consultantForm.before[i].type == "textarea") {
                                        var value = consultantForm.before[i].value;
                                        beforeQuestions[j].q_data[k]['question_ans'] = '';
                                        if (value) {
                                            beforeQuestions[j].q_data[k]['question_ans'] = value;
                                        }
                                        if (consultantForm.before[i].other_text) {
                                            beforeQuestions[j].q_data[k]['other_text_ans'] = consultantForm.before[i].other_text;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (consultantForm.after.length) {
                    for (var i = 0; i < consultantForm.after.length; i++) {
                        var id = consultantForm.after[i].q_id;
                        for (var j = 0; j < afterQuestions.length; j++) {
                            var aIndex = afterQuestions[j].q_data.findIndex(x => x._id.toString() == id);
                            if (aIndex != -1) {
                                if (consultantForm.after[i].type == "checkbox") {
                                    var cValue = consultantForm.after[i].value.split(",");
                                    if (cValue.length) {
                                        for (var k = 0; k < cValue.length; k++) {
                                            var cCheck = afterQuestions[j].q_data[aIndex].options.findIndex(y => y.lable == cValue[k]);
                                            if (cCheck != -1) {
                                                afterQuestions[j].q_data[aIndex].options[cCheck]['isCheck'] = true;
                                            }
                                        }
                                    }
                                    if (consultantForm.after[i].other_text) {
                                        afterQuestions[j].q_data[aIndex]['other_text_ans'] = consultantForm.after[i].other_text;
                                    }
                                }

                                if (consultantForm.after[i].type == "radio") {
                                    var rValue = consultantForm.after[i].value;
                                    if (rValue) {
                                        var cCheck = afterQuestions[j].q_data[aIndex].options.findIndex(z => z.lable == rValue);
                                        if (cCheck != -1) {
                                            afterQuestions[j].q_data[aIndex].options[cCheck]['isCheck'] = true;

                                            if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids && consultantForm.after[i].q_options && consultantForm.after[i].q_options.length > 0) {

                                                for (let oque = 0; oque < afterQuestions[j].q_data[aIndex].options[cCheck].question_ids.length; oque++) {

                                                    var qid = afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]._id;
                                                    var opt_qi = consultantForm.after[i].q_options.findIndex(y => y.q_id == qid.toString());

                                                    if (opt_qi != -1) {
                                                        afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].value = consultantForm.after[i].q_options[opt_qi].value;

                                                        if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "checkbox" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "multi") {

                                                            var ocValue = consultantForm.after[i].q_options[opt_qi].value.split(",");
                                                            if (ocValue.length) {
                                                                for (var ol = 0; ol < ocValue.length; ol++) {
                                                                    var ocCheck = afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options.findIndex(y => y.lable == ocValue[ol]);
                                                                    if (ocCheck != -1) {
                                                                        afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "radio" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "single") {
                                                            var ocValue = consultantForm.after[i].q_options[opt_qi].value;
                                                            var ocCheck = afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options.findIndex(z => z.lable == ocValue);
                                                            if (ocCheck != -1) {
                                                                afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                            }

                                                        }

                                                        if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "text" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "date" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "textarea") {
                                                            var value = consultantForm.after[i].q_options[opt_qi].value;
                                                            afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['question_ans'] = '';
                                                            if (value) {
                                                                if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "date") {
                                                                    var datePipe = new DatePipe("en-US");

                                                                    afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['question_ans'] = datePipe.transform(value, 'yyyy-MM-dd');
                                                                } else {
                                                                    afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['question_ans'] = value;
                                                                }

                                                            }
                                                        }

                                                        if (consultantForm.after[i].q_options[opt_qi].other_text) {

                                                            afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['other_text_ans'] = consultantForm.after[i].q_options[opt_qi].other_text;
                                                        }

                                                    }
                                                }
                                            }

                                        }
                                    }
                                    if (consultantForm.after[i].other_text) {
                                        afterQuestions[j].q_data[aIndex]['other_text_ans'] = consultantForm.after[i].other_text;
                                    }
                                }

                                if (consultantForm.after[i].type == "single") {
                                    var sValue = consultantForm.after[i].value;
                                    if (sValue) {
                                        var cCheck = afterQuestions[j].q_data[aIndex].options.findIndex(z => z.lable == sValue);
                                        if (cCheck != -1) {
                                            afterQuestions[j].q_data[aIndex].options[cCheck]['isCheck'] = true;

                                            if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids && consultantForm.after[i].q_options && consultantForm.after[i].q_options.length > 0) {

                                                for (let oque = 0; oque < afterQuestions[j].q_data[aIndex].options[cCheck].question_ids.length; oque++) {

                                                    var qid = afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]._id;
                                                    var opt_qi = consultantForm.after[i].q_options.findIndex(y => y.q_id == qid.toString());

                                                    if (opt_qi != -1) {
                                                        afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].value = consultantForm.after[i].q_options[opt_qi].value;

                                                        if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "checkbox" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "multi") {

                                                            var ocValue = consultantForm.after[i].q_options[opt_qi].value.split(",");
                                                            if (ocValue.length) {
                                                                for (var ol = 0; ol < ocValue.length; ol++) {
                                                                    var ocCheck = afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options.findIndex(y => y.lable == ocValue[ol]);
                                                                    if (ocCheck != -1) {
                                                                        afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "radio" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "single") {
                                                            var ocValue = consultantForm.after[i].q_options[opt_qi].value;
                                                            var ocCheck = afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options.findIndex(z => z.lable == ocValue);
                                                            if (ocCheck != -1) {
                                                                afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                            }

                                                        }

                                                        if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "text" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "date" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "textarea") {
                                                            var value = consultantForm.after[i].q_options[opt_qi].value;
                                                            afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['question_ans'] = '';
                                                            if (value) {
                                                                if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "date") {
                                                                    var datePipe = new DatePipe("en-US");

                                                                    afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['question_ans'] = datePipe.transform(value, 'yyyy-MM-dd');
                                                                } else {
                                                                    afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['question_ans'] = value;
                                                                }

                                                            }
                                                        }

                                                        if (consultantForm.after[i].q_options[opt_qi].other_text) {

                                                            afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['other_text_ans'] = consultantForm.after[i].q_options[opt_qi].other_text;
                                                        }

                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (consultantForm.after[i].other_text) {
                                        afterQuestions[j].q_data[aIndex]['other_text_ans'] = consultantForm.after[i].other_text;
                                    }
                                }

                                if (consultantForm.after[i].type == "multi") {
                                    var mValue = consultantForm.after[i].value.split(",");
                                    if (mValue.length) {
                                        for (var k = 0; k < mValue.length; k++) {
                                            var cCheck = afterQuestions[j].q_data[aIndex].options.findIndex(y => y.lable == mValue[k]);
                                            if (cCheck != -1) {
                                                afterQuestions[j].q_data[aIndex].options[cCheck]['isCheck'] = true;

                                                if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids && consultantForm.after[i].q_options && consultantForm.after[i].q_options.length > 0) {

                                                    for (let oque = 0; oque < afterQuestions[j].q_data[aIndex].options[cCheck].question_ids.length; oque++) {

                                                        var qid = afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]._id;
                                                        var opt_qi = consultantForm.after[i].q_options.findIndex(y => y.q_id == qid.toString());

                                                        if (opt_qi != -1) {
                                                            afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].value = consultantForm.after[i].q_options[opt_qi].value;

                                                            if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "checkbox" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "multi") {

                                                                var ocValue = consultantForm.after[i].q_options[opt_qi].value.split(",");
                                                                if (ocValue.length) {
                                                                    for (var ol = 0; ol < ocValue.length; ol++) {
                                                                        var ocCheck = afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options.findIndex(y => y.lable == ocValue[ol]);
                                                                        if (ocCheck != -1) {
                                                                            afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                        }
                                                                    }
                                                                }
                                                            }

                                                            if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "radio" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "single") {
                                                                var ocValue = consultantForm.after[i].q_options[opt_qi].value;
                                                                var ocCheck = afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options.findIndex(z => z.lable == ocValue);
                                                                if (ocCheck != -1) {
                                                                    afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].options[ocCheck]['isCheck'] = true;
                                                                }

                                                            }

                                                            if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "text" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "date" || afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "textarea") {
                                                                var value = consultantForm.after[i].q_options[opt_qi].value;
                                                                afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['question_ans'] = '';
                                                                if (value) {
                                                                    if (afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque].option_type == "date") {
                                                                        var datePipe = new DatePipe("en-US");

                                                                        afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['question_ans'] = datePipe.transform(value, 'yyyy-MM-dd');
                                                                    } else {
                                                                        afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['question_ans'] = value;
                                                                    }

                                                                }
                                                            }

                                                            if (consultantForm.after[i].q_options[opt_qi].other_text) {

                                                                afterQuestions[j].q_data[aIndex].options[cCheck].question_ids[oque]['other_text_ans'] = consultantForm.after[i].q_options[opt_qi].other_text;
                                                            }

                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (consultantForm.after[i].other_text) {
                                        afterQuestions[j].q_data[aIndex]['other_text_ans'] = consultantForm.after[i].other_text;
                                    }
                                }

                                if (consultantForm.after[i].type == "text") {
                                    var value = consultantForm.after[i].value;
                                    afterQuestions[j].q_data[aIndex]['question_ans'] = '';
                                    afterQuestions[j].q_data[aIndex]['other_text_ans'] = '';
                                    if (value) {
                                        afterQuestions[j].q_data[aIndex]['question_ans'] = value;
                                    }
                                    if (consultantForm.after[i].other_text) {
                                        afterQuestions[j].q_data[aIndex]['other_text_ans'] = consultantForm.after[i].other_text;
                                    }
                                }

                                if (consultantForm.after[i].type == "textarea") {
                                    var value = consultantForm.after[i].value;
                                    afterQuestions[j].q_data[aIndex]['question_ans'] = '';
                                    afterQuestions[j].q_data[aIndex]['other_text_ans'] = '';
                                    if (value) {
                                        afterQuestions[j].q_data[aIndex]['question_ans'] = value;
                                    }
                                    if (consultantForm.after[i].other_text) {
                                        afterQuestions[j].q_data[aIndex]['other_text_ans'] = consultantForm.after[i].other_text;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (consultantForm.name) {
                var name = consultantForm.name.replace(/\s+/g, "_").toLowerCase();
                file_name = name + '_' + file_name;
                pdf_name = pdf_name + file_name;
            } else {
                pdf_name = pdf_name + file_name;
            }

            if (consultantForm.dob) {
                dob = dateFormat(consultantForm.dob, "dd-mm-yyyy");
                var diff = await calcDate(new Date(), new Date(consultantForm.dob));
                if (diff < 18) {
                    flag_minor = 1;
                    signature_label = "Parent/Guardian Signature";
                } else {
                    flag_minor = 0;
                    signature_label = "Signature";
                }
            }
            // Before, After Image
            if (consultantForm.before_image) {
                var filePath1 = root_path + "/" + consultantForm.before_image;
                if (fs.existsSync(filePath1)) {
                    before_image_flag = true;
                }
                for (let im = 0; im < consultantForm.before_image.length; im++) {
                    consultantForm.before_image[im] = process.env.API_URL + "/" + consultantForm.before_image[im];
                }
            }
            if (consultantForm.after_image) {
                var filePath2 = root_path + "/" + consultantForm.after_image;
                if (fs.existsSync(filePath2)) {
                    after_image_flag = true;
                }
                for (let im = 0; im < consultantForm.after_image.length; im++) {
                    consultantForm.after_image[im] = process.env.API_URL + "/" + consultantForm.after_image[im];
                }
            }

            // Customet, Therapist Signature
            if (consultantForm.customer_signature) {
                var filePath3 = root_path + "/" + consultantForm.customer_signature;
                if (fs.existsSync(filePath3)) {
                    customer_signature_flag = true;
                    consultantForm.customer_signature = process.env.API_URL + "/" + consultantForm.customer_signature
                }
            }
            if (consultantForm.therapist_signature) {
                var filePath4 = root_path + "/" + consultantForm.therapist_signature;
                if (fs.existsSync(filePath4)) {
                    therapist_signature_flag = true;
                    consultantForm.therapist_signature = process.env.API_URL + "/" + consultantForm.therapist_signature
                }
            }
            consultantForm.date_of_birth = dob;
            consultantForm.signature_label = signature_label;
            consultantForm.before_question_text = before_question_text;
            consultantForm.after_question_text = after_question_text;
            consultantForm.after_question_text = after_question_text;
            consultantForm.check_flag_minor = flag_minor;
            consultantForm.before_image_flag = before_image_flag;
            consultantForm.after_image_flag = after_image_flag;
            consultantForm.customer_signature_flag = customer_signature_flag;
            consultantForm.therapist_signature_flag = therapist_signature_flag;
            consultantForm.beforeQuestions = beforeQuestions;
            consultantForm.afterQuestions = afterQuestions;
            consultantForm.site_url = process.env.SITE_URL;
            consultantForm.api_url = process.env.API_URL;
            consultantForm.port = process.env.PORT;
            consultantForm.root_path = root_path
            //consultantForm.root_path = "http://localhost:3000"

            var html = '';
            var isPdfGenerate;

            try {

                await ejs.renderFile((path + '/views/location_consultant_form.ejs'), { userHtml: consultantForm }, (err, data) => {
                    if (err) {
                        console.log('err', err)
                    } else {
                        html = data;
                    }
                });

                // var options = {
                //     format: "A3",
                //     orientation: "portrait",
                //     border: "10mm",
                //     localUrlAccess: true,
                //     margin: {
                //         top: "7mm",
                //         bottom: "10.3mm",
                //         right: "2mm",
                //         left: "2mm"
                //     },
                //     header: {
                //         height: "7mm",

                //     },
                //     footer: {
                //         height: "10.3mm",
                //     },
                //     path: "public/images/consultation/pdf/" + file_name
                // };

                // let file = [{ content: html, name: file_name }];

                try {

                    // var pdfGenerated = await html_to_pdf.generatePdfs(file, options).then(output => {
                    //     console.log("Success"); // PDF Buffer:- [{url: "https://example.com", name: "example.pdf", buffer: <PDF buffer>}]
                    //     return file_name
                    // });
                    var pdfGenerated = 1;
                    var outputPath = "public/images/consultation/pdf/" + file_name;

                    await fs.promises.mkdir("public/images/consultation/pdf/", { recursive: true }) //Create dir if not exist

                    var options = {
                        format: "A4",
                        orientation: "portrait",
                        border: "10mm",
                        localUrlAccess: true,
                        margin: {
                            top: "7mm",
                            bottom: "10.3mm",
                            right: "2mm",
                            left: "2mm"
                        },
                        header: {
                            height: "7mm",

                        },
                        footer: {
                            height: "10.3mm",
                        }
                    };

                    isPdfGenerate = await generatePdf(html, outputPath, options)
                    console.log('outputPath', outputPath)
                    console.log('pdfGenerated', pdfGenerated)

                    if (pdfGenerated) {

                        if (req.query.export_type == 'email') {

                            const inputPdfPath = "public/images/consultation/pdf/" + file_name;

                            await compressPdfFile(inputPdfPath, inputPdfPath)

                            await ConsultantFormService.updateConsultantFormPdf({ _id: consultantForm._id, pdf: pdf_name });

                            var toMail = {};
                            toMail['site_url'] = process.env.SITE_URL;
                            toMail['api_url'] = process.env.API_URL;
                            toMail['branch_name'] = location.name;
                            toMail['booking_id'] = consultantForm.booking_id;
                            var to = location.email;
                            var name = consultantForm.name;
                            var subject = 'Consultation attachment from ' + location.name + ' branch ';
                            var file_path = '/public/images/consultation/pdf/' + file_name;
                            var temFile = "consultation_pdf_attachment.hjs";
                            var email_html = '';

                            var gettingData = await getEmailTemplateData(location?.company_id, location._id, 'consultation_pdf_attachment', temFile)
                            if (gettingData != null) {
                                email_html = gettingData.contents;
                            } else {
                                email_html = "";
                            }

                            // for Location Admin
                            var createdMail = SendEmailSmsService.sendSmsLogMail(location.email, location.name, 'Consultation attachment of ' + consultantForm.name + ' from ' + location.name + ' branch', temFile, email_html, toMail, file_path, file_name, 'transaction', location?._id, location?.company_id);

                            console.log('createdMail', createdMail)
                            var days = process.env?.EMAIL_MAX_DATE_LIMIT || 2
                            var tillDate = increaseDateDays(new Date, days)
                            toMail['file_path'] = file_path;
                            var emailData = {
                                company_id: location?.company_id,
                                location_id: location?._id,
                                client_id: consultantForm.client_id[0],
                                subject: subject,
                                name: consultantForm.name,
                                type: "single",
                                file_type: "consultation_pdf_attachment",
                                temp_file: temFile,
                                html: '',
                                data: toMail,
                                date: Date(),
                                to_email: to,
                                status: "Sent",
                                response: null,
                                response_status: 'Sent',
                                email_type: 'transaction',
                                till_date: tillDate,
                            }
                            var eLog = await EmailLogService.createEmailLog(emailData)
                        }
                    }

                } catch (e) {
                    console.log("tError2 ", e)
                }
            }
            catch (e) {
                console.log("tError ", e)
                //Return an Error Response Message with Code and the Error Message.
                return res.status(200).json({ status: 200, flag: false, message: "Something went wrong!" })
            }
        } else {
            return res.status(200).json({ status: 200, flag: false, message: "Something went wrong!" });
        }
        // console.log("consultantForm ",consultantForm)
        return res.status(200).json({ status: 200, flag: true, html: html, is_pdf_generate: isPdfGenerate, questions: questions, data: consultantForm, pdf_name: pdf_name, file_name: file_name, questions: questions, message: "In Process!" })
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Something went wrong!" })
    }
}

async function generatePdf(html, outputPath, options = { format: 'A4' }) {

    try {
        //const browser = await puppeteer.launch();
        const browser = await puppeteer.launch({
            timeout: 0,
            headless: true, // true|false
            ignoreHTTPSErrors: true,
            waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
            defaultViewport: null, // Set to null for full screen,
            // executablePath: "",
            // cacheDirectory: path.join(__dirname, '.cache', 'puppeteer'),
            cacheDirectory: pdfpath.join(pdfpath.resolve('./'), '.cache', 'puppeteer'),
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                // "--single-process",
                "--disable-gpu",
            ]
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.pdf({ path: outputPath, ...options });
        await browser.close();
        console.log("Here's your PDF!.");
        return "PDF generated Successfully";
    } catch (e) {
        console.log("tError ", e)
        //Return an Error Response Message with Code and the Error Message.
        return e;
    }
}



async function compressPdfFile(inputPath, outputPath) {
    const buffer = await pdfCompress.compress(inputPath)
    await fs.promises.writeFile(outputPath, buffer)
}

async function compressPdf(inputPath, outputPath) {
    // Read the PDF file
    const pdfBytes = fs.readFileSync(inputPath);

    // Load the PDFDocument
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Optimize PDF by removing unused objects and recompressing streams
    const optimizedPdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        updateFieldAppearances: false,
    });

    // Compress the optimized PDF
    zlib.deflate(optimizedPdfBytes, (err, buffer) => {
        if (err) {
            console.error('Error during compression:', err);
            return;
        }

        // Write the compressed PDF to the output file
        fs.writeFileSync(outputPath, buffer);
        console.log('PDF compressed successfully');
    });
}

exports.getTestSendSMS = async function (req, res, next) {
    try {
        var type = req.query?.type || ""
        var locationId = "60bf8170768da009dbe78586"
        var apiKey = process.env?.APIKEY || ""
        var devices = "992|0"

        var location = await LocationService.getLocationOneHidden(locationId) || null
        var countryCode = location?.country_code || 44

        var messages = [
            {
                number: "0123454848",
                message: "This is test 1 message from StrivEdge Team"
            },
            {
                number: "0123456848",
                message: "This is new test 2 message from StrivEdge Team"
            },
            {
                number: "01234533244",
                message: "This is new test 3 message from StrivEdge Team"
            },
            {
                number: "01234571551",
                message: "This is new test 4 message from StrivEdge Team"
            },
            {
                number: "01234585845",
                message: "This is new test 5 message from StrivEdge Team"
            }
        ]

        if (type == "send") {
            var query = { status: "initial" }
            var smsLogs = await SmslogService.getSmsLogsOne(query, 1, 10, "_id", "1")

            if (smsLogs && smsLogs.length) {
                var request = require('request-promise')
                for (let index = 0; index < smsLogs.length; index++) {
                    var element = smsLogs[index]
                    var id = element?._id || ""
                    var number = parseInt(element.mobile, 10)


                    var message = [{
                        number: `+${countryCode}${number}`,
                        message: element.content
                    }]

                    var postData = {
                        key: apiKey,
                        devices: devices,
                        messages: JSON.stringify(message)
                    }


                    var url = querystring.stringify(postData)


                    var options = {
                        method: 'GET',
                        url: 'https://sms.sendapp.live/services/send.php?' + url
                    }

                    var response = null
                    var request_call = new Promise(async (resolve, reject) => {
                        request(options).then(function (res) {
                            res = JSON.parse(res)
                            if (res && res.success) {
                                response = res
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        }).catch(function (err) {
                            console.log(err)
                            resolve(false)
                        })
                    })

                    var apiResult = await request_call.then((result) => {
                        console.log('apiResult >>> ', result, response)
                        console.log("apiResult messages >>> ", response?.data?.messages)
                        return response
                    }).catch((error) => {
                        console.log(error)
                    })

                    if (response?.data && response?.data?.messages && response?.data?.messages?.length) {
                        var msgItem = response.data.messages[0]
                        if (msgItem && msgItem.ID) {
                            var smsItem = {
                                _id: id,
                                sms_response: JSON.stringify(msgItem),
                                response_status: msgItem?.status || ""
                            }
                            // console.log("smsItem >>> ", smsItem)
                            await SmslogService.updateSmsLog(smsItem)
                        }
                    }
                    // console.log("getTestSendSMS >>> ", postData, options, url)
                }
            }
        } else {
            for (let index = 0; index < messages.length; index++) {
                var element = messages[index]

                var smsData = {
                    company_id: '',
                    location_id: locationId,
                    client_id: '',
                    sms_type: "booking_sms",
                    date: Date(),
                    mobile: element.number,
                    content: element.message,
                    sms_count: 0,
                    sms_setting: "appointmentgem"
                }

                await SmslogService.createSmsLog(smsData)
            }
        }

        return res.status(200).json({ status: 200, flag: true, message: "Testing send sms in process!" })
    } catch (e) {
        console.log("getTestSendSMS Error >>> ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

async function calcDate(date1, date2) {
    var diff = Math.floor(date1.getTime() - date2.getTime());
    var day = 1000 * 60 * 60 * 24;

    var days = Math.floor(diff / day);
    var months = Math.floor(days / 31);
    var years = Math.floor(months / 12);

    // var message = date2.toDateString();
    // message += " was "
    // message += days + " days " 
    // message += months + " months "
    // message += years + " years ago \n"
    var message = years;

    return message
}

const timeToNum = function (time) {
    //console.log('timeToNum time',time)
    var matches = time.match(/(\d\d):(\d\d)/);
    //console.log('matches',matches)
    return parseInt(60 * matches[1]) + parseInt(matches[2]);
} //ex: 10:00 = 60*10+05 = 605

const numToTime = function (num) {
    //console.log('num',num)
    m = num % 60;
    h = parseInt(num / 60);
    // console.log('m',m)
    // console.log('h',h)
    return (h > 9 ? h : "0" + h) + ":" + (m > 9 ? m : "0" + m);
} //ex: $num=605 605%60 == 5 ,605/60 == 10  return 10:05

const timeTomeridiem = function (time) {
    var stimeToNum = time;
    var stime = numToTime(time)
    stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM';

    var showStartTimeSpilt = stime.split(':');
    var end_hour = (showStartTimeSpilt[0]);
    var hour = end_hour > 12 ? end_hour - 12 : end_hour;
    showStartTimeSpilt[0] = (hour + '').length == 1 ? '0' + hour : hour;
    stime = showStartTimeSpilt.join(':');

    var start_time_meridiem = stime + " " + stimeToNum;

    return start_time_meridiem;
} //ex: 13:00 = 01:00 PM


exports.getInactiveEmployee = async function (req, res, next) {
    try {

        var employees = await UserService.getEmployees({ is_employee: 1, status: 0 });

        var employee_ids = employees.map(s => s._id.toString());
        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: employee_ids, message: "Successfully send sms" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.updateAppointmentsCustomerIcon = async function (req, res, next) {
    try {
        // Fetch all appointments
        const appointments = await Appointment.find({}).select('_id client_id')//.limit(10);
        // Iterate through each appointment
        for (const appointment of appointments) {

            appointment.customer_icon = '';

            if (appointment && appointment.client_id?.length && appointment?.client_id[0]) {
                if (appointment?.client_id[0] && typeof appointment?.client_id[0] != 'string') {
                    appointment.client_id[0] = appointment?.client_id[0]?._id
                }
                const customer = await Customer.findOne({ _id: ObjectId(appointment.client_id[0]) }).select('customer_icons');
                if (customer && customer?.customer_icons?.length > 0) {
                    appointment.customer_icon = customer?.customer_icons[0]?.icon;
                    // Save the appointment with the new icon
                }
            }
            await appointment.save();
        }

        return res.status(200).json({ message: 'Icons added to appointments successfully' });
    } catch (e) {
        console.error('Error adding icons to appointments:', e);
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}