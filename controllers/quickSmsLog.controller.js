var QuickSmsLogService = require('../services/quickSmslog.service');
var CompanyService = require('../services/company.service');
var LocationService = require('../services/location.service');
var SendEmailSmsService = require('../services/sendEmailSms.service');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var superAdminRole = process.env?.SUPER_ADMIN_ROLE || "607d8aeb841e37283cdbec4b"
var orgAdminRole = process.env?.ORG_ADMIN_ROLE || "6088fe1f7dd5d402081167ee"
var branchAdminRole = process.env?.BRANCH_ADMIN_ROLE || "608185683cf3b528a090b5ad"

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getQuickSmsLogs = async function (req, res, next) {
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
     if ([orgAdminRole, branchAdminRole].includes(req.roleId)) {
        query['location_id'] = { $in: [req.query.location_id, '', null] };
        // Ensure company_id condition includes the null or empty string
        query['company_id'] = { $in: [req.query.company_id] };
    }

    // Check the role id and update the query accordingly
    if ([superAdminRole].includes(req.roleId)) {
        query['location_id'] = { $in: [req.query.location_id, '', null] };
        // Ensure company_id condition includes the null or empty string
        query['company_id'] = { $in: [req.query.company_id, '', null] };
    }

    if (req.query.from_date && req.query.from_date != 'undefined' && req.query.to_date && req.query.to_date != 'undefined') {

        query['date'] = { $gte: (req.query.from_date), $lte: (req.query.to_date) }
    }

    if (req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [{ mobile: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { sms_type: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { content: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }];
    }
    try {
        // console.log('query', query)
        var QuickSmsLogs = await QuickSmsLogService.getQuickSmsLogs(query, parseInt(page), parseInt(limit), order_name, Number(order), serachText)

        // var SmsAlllogs = await QuickSmsLogService.getAllQuickSmsLogs(query,order_name,Number(order),serachText)
        // Return the Tests list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: QuickSmsLogs, dataAll: [], message: "Successfully SMS Logs Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getQuickSmsLog = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var QuickSmsLog = await QuickSmsLogService.getQuickSmsLog(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: QuickSmsLog, message: "Successfully SMS Log Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// getting all tests for company copy
exports.getQuickSmsLogSpecific = async function (req, res, next) {
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
        var QuickSmsLog = await QuickSmsLogService.getQuickSmsLogsSpecific(query)
        // console.log("SMS Logs len ",tests.length)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: QuickSmsLog, message: "Successfully SMS Log Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.sendQuickSmsLogEmail = async function (req, res, next) {

    try {
        var location_id = req.body.location_id;
        const data = req.body.data;

        var file_name = 'QuickSmsLog_' + new Date().getTime() + '.csv';
        console.log('file_name', file_name)

        const csvWriter = createCsvWriter({
            path: 'public/QuickSmsLog/' + file_name,
            header: [
                { id: 'mobile', title: 'Mobile' },
                { id: 'date', title: 'Date' },
                { id: 'booking_date', title: 'Booking Date' },
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

        var toMail = {};
        toMail['site_url'] = process.env.API_URL;
        toMail['link_url'] = process.env.SITE_URL;
        toMail['branch_name'] = location.name;

        var to = location.email;
        var name = location.name;
        var subject = 'SMS Log Report';
        var file_path = '/public/QuickSmsLog/' + file_name;

        var html = '';
        var temFile = "sms_report_mail.hjs";
        var gettingData = await getEmailTemplateData(company?._id, location?._id, 'sms_report', temFile);
        if (gettingData != null) {
            html = gettingData.contents;
        } else {
            html = "";
        }

        //console.log('html',html)

        var createdMail = await SendEmailSmsService.sendSmsLogMail(to, name, subject, temFile, html, toMail, file_path, file_name);

        return res.status(200).json({ status: 200, flag: true, data: createdTest, message: "Successfully sent SMS Log report to branch admin" })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: "SMS Log sent mail was Unsuccesfull" })
    }
}

exports.createQuickSmsLog = async function (req, res, next) {

    try {
        // Calling the Service function with the new object from the Request Body
        var createdTest = await QuickSmsLogService.createQuickSmsLog(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdTest, message: "Successfully Created Test" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "SMS Log Creation was Unsuccesfull" })
    }
}

exports.removeQuickSmsLog = async function (req, res, next) {

    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var deleted = await QuickSmsLogService.deleteQuickSmsLog(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}





