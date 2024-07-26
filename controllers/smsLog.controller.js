var SmslogService = require('../services/smslog.service');
var CompanyService = require('../services/company.service');
var LocationService = require('../services/location.service');
var SendEmailSmsService = require('../services/sendEmailSms.service');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path").resolve('./');
var fs = require("fs");

// Saving the context of this module inside the _the variable
_this = this;
var superAdminRole = process.env?.SUPER_ADMIN_ROLE || "607d8aeb841e37283cdbec4b"
var orgAdminRole = process.env?.ORG_ADMIN_ROLE || "6088fe1f7dd5d402081167ee"
var branchAdminRole = process.env?.BRANCH_ADMIN_ROLE || "608185683cf3b528a090b5ad"

// Async Controller function to get the To do List
exports.getSmsLogs = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var serachText = req.query.serachText ? req.query.serachText : '';

    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
 // Check the role id and update the query accordingly
 if ([ orgAdminRole, branchAdminRole].includes(req.roleId)) {
    query['location_id'] = { $in: [req.query.location_id, '', null] };
    // Ensure company_id condition includes the null or empty string
    query['company_id'] = { $in: [req.query.company_id] };
}
    // Check the role name and update the query accordingly
    if ([superAdminRole].includes(req.roleId)) {
            query['location_id'] = { $in: [req.query.location_id, '', null] };
        // Ensure company_id condition includes the null or empty string
        query['company_id'] = { $in: [req.query.company_id, '', null] };
    }
    if (req.query.from_date && req.query.from_date != 'undefined' && req.query.to_date && req.query.to_date != 'undefined') {

        query['date'] = { $gte: (req.query.from_date), $lte: (req.query.to_date) }
    }

    if (req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [{ mobile: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { sms_type: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { sms_setting: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { content: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } } ];
    }
    try {
        //console.log('query',query)
        var Smslogs = await SmslogService.getSmsLogs(query, parseInt(page), parseInt(limit), order_name, Number(order), serachText)

        var SmsAlllogs = await SmslogService.getAllSmsLogs(query, order_name, Number(order), serachText)
        // Return the Tests list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Smslogs, dataAll: SmsAlllogs, message: "Successfully SMS Logs Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getSmsLog = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var SmsLog = await SmslogService.getSmsLog(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: SmsLog, message: "Successfully SMS Log Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// getting all tests for company copy
exports.getSmsLogSpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};

    try {
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }
        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
        }

        if (req.query.from_date && req.query.from_date != 'undefined' && req.query.to_date && req.query.to_date != 'undefined') {

            query['createdAt'] = { $gte: (req.query.from_date), $lte: (req.query.to_date) }
        }
        //console.log('query',query)
        var SmsLog = await SmslogService.getSmsLogsSpecific(query)
        // console.log("SMS Logs len ",tests.length)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: SmsLog, message: "Successfully SMS Log Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

const getScanReport = (params, template, folder, file_name) => new Promise(

    //announcePDFReady() is a function we call to resolve our promise

    announcePDFReady => {

        Promise.
            all([]).
            then(function ([results1, results2]) {
                //{data: data,total_count:total_count}

                ejs.renderFile((path + '/views/' + template), params, async (err, data) => {
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

            })

    }

);

exports.sendSmsLogEmailPdf = async function (req, res, next) {
    try {
        var location_id = req.body.location_id;
        var data = req.body.data ? req.body.data : [];
        var total_count = req.body.total_count;

        var file_name = 'smsLog_' + new Date().getTime() + '.pdf';
        console.log('file_name', file_name)

        var pdf_name = 'images/smslog/' + file_name;
        var template = 'sms_log.ejs';
        var folder = 'smslog';

        console.log('total_count', total_count)
        var params = { data: data, total_count: total_count };
        const pdfIsReady = await getScanReport(params, template, folder, file_name);
        //console.log('pdfIsReady',pdfIsReady)
        if (pdfIsReady === false) {
            //it failed. Do something? Ignore it?
        } else {
            if (req.body.send_mail == 1) {
                var location = await LocationService.getLocation(location_id);
                var company = { name: '' };
                if (location.company_id) {
                    company = await CompanyService.getCompany(location.company_id);
                }

                var toMail = {};
                toMail['site_url'] = process.env.API_URL;
                toMail['link_url'] = process.env.SITE_URL;
                toMail['branch_name'] = location.name;

                var to = location.email;
                var name = location.name;
                var subject = 'SMS Log Report';
                var file_path = '/public/images/smslog/' + file_name;

                var html = '';
                var temFile = "sms_report_mail.hjs";
                var gettingData = await getEmailTemplateData(company?._id, location?._id, 'sms_report', temFile);
                if (gettingData != null) {
                    html = gettingData.contents;
                } else {
                    html = "";
                }

                var createdMail = await SendEmailSmsService.sendSmsLogMail(to, name, subject, temFile, html, toMail, file_path, file_name, location_id, location.company_id);
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: data, pdf_name: pdf_name, message: "Successfully sent SMS log report to branch admin" })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: "SMS Log sent mail was Unsuccesfull" })
    }
}

exports.sendBookingHistoryLogEmailPdf = async function (req, res, next) {

    try {
        var location_id = req.body.location_id;
        var data = req.body.data ? req.body.data : [];
        var client_data = req.body.client_data ? req.body.client_data : {};

        var file_name = 'booking_history_' + new Date().getTime() + '.pdf';
        console.log('file_name', file_name)

        var pdf_name = 'images/booking/' + file_name;
        var template = 'booking.ejs';
        var folder = 'booking';

        var params = { data: data, client: client_data };

        const pdfIsReady = await getScanReport(params, template, folder, file_name);

        //console.log('pdfIsReady',pdfIsReady)
        if (pdfIsReady === false) {
            //it failed. Do something? Ignore it?
        } else {

            if (req.body.send_mail == 1) {

                var location = await LocationService.getLocation(location_id);
                var company = { name: '' };
                if (location.company_id) {
                    company = await CompanyService.getCompany(location.company_id);
                }

                var toMail = {};
                toMail['site_url'] = process.env.API_URL;
                toMail['link_url'] = process.env.SITE_URL;
                toMail['branch_name'] = location.name;
                toMail['client_data'] = client_data;

                var to = location.email;
                //var to = 'priyankastrivedge@gmail.com';
                var name = location.name;
                var subject = 'Booking History Report';
                var file_path = '/public/images/booking/' + file_name;

                var html = '';
                var temFile = "booking_report_mail.hjs";
                var gettingData = await getEmailTemplateData(company?._id, location?._id, 'booking_report', temFile);
                if (gettingData != null) {
                    html = gettingData.contents;
                } else {
                    html = "";
                }

                var createdMail = await SendEmailSmsService.sendSmsLogMail(to, name, subject, temFile, html, toMail, file_path, file_name, location_id, location.company_id);
            }

        }

        return res.status(200).json({ status: 200, flag: true, data: data, pdf_name: pdf_name, message: "Successfully sent booking log report to branch admin" })

    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: "SMS Log sent mail was Unsuccesfull" })
    }
}

exports.sendSmsLogEmail = async function (req, res, next) { //csv

    try {
        var location_id = req.body.location_id;
        const data = req.body.data;

        var file_name = 'smsLog_' + new Date().getTime() + '.csv';
        console.log('file_name', file_name)

        const csvWriter = createCsvWriter({
            path: 'public/smslog/' + file_name,
            header: [
                { id: 'mobile', title: 'Mobile' },
                { id: 'date', title: 'Date' },
                { id: 'sms_type', title: 'SMS Type' },
                { id: 'sms_count', title: 'SMS Count' },
                { id: 'price', title: 'Price' },
                { id: 'total_price', title: 'Total Price' },
            ]
        });

        csvWriter
            .writeRecords(data)
            .then(() => console.log('The CSV file was written successfully'));

        var location = await LocationService.getLocation(location_id);
        var company = { name: '' };
        if (location.company_id) {
            company = await CompanyService.getCompany(location.company_id);
        }

        // await ejs.renderFile((path+'/views/sms_log.ejs'), {data: data,total_count:total_count}, async(err, data) => {
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
        //         await pdf.create(data, options).toFile("public/images/smslog/"+file_name, function(err, data) {
        //             console.log('data',data)
        //             if (err) {
        //                 console.log('err',err)
        //             }
        //         });

        //     }
        // });

        var toMail = {};
        toMail['site_url'] = process.env.API_URL;
        toMail['link_url'] = process.env.SITE_URL;
        toMail['branch_name'] = location.name;

        var to = location.email;
        //var to = 'priyankastrivedge@gmail.com';
        var name = location.name;
        var subject = 'SMS Log Report';
        var file_path = '/public/smslog/' + file_name;

        var html = '';
        var temFile = "sms_report_mail.hjs";
        var gettingData = await getEmailTemplateData(company?._id, location?._id, 'sms_report', temFile);
        if (gettingData != null) {
            html = gettingData.contents;
        } else {
            html = "";
        }
        //console.log('html',html)

        var createdMail = await SendEmailSmsService.sendSmsLogMail(to, name, subject, temFile, html, toMail, file_path, file_name, location_id, location.company_id);

        return res.status(200).json({ status: 200, flag: true, data: data, message: "Successfully sent SMS log report to branch admin" })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: "SMS Log sent mail was Unsuccesfull" })
    }
}

exports.createSmsLog = async function (req, res, next) {

    try {
        // Calling the Service function with the new object from the Request Body
        var createdTest = await SmslogService.createSmsLog(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdTest, message: "Successfully Created Test" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "SMS Log Creation was Unsuccesfull" })
    }
}

exports.removeSmsLog = async function (req, res, next) {

    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var deleted = await SmslogService.deleteSmsLog(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}





