var AppointmentService = require('../services/appointment.service');
var CustomerService = require('../services/customer.service')
var ServiceService = require('../services/service.service');
var LocationService = require('../services/location.service');
var CompanyService = require('../services/company.service');
var SendEmailSmsService = require('../services/sendEmailSms.service');

var dateFormat = require('dateformat');
var path = require('path').resolve('./'); //get main dir path
var moment = require('moment');
var Hogan = require('hogan.js');
var fs = require('fs');
var ObjectId = require('mongodb').ObjectId;

var AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-2' });

const { htmlToText } = require('html-to-text');

// Saving the context of this module inside the _the variable
_this = this;

const { getCustomParameterData } = require('../helper');

exports.getRescheduleAppointmentDetail = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var appointment = await AppointmentService.getAppointment(id);

        var is_limit_exceed = 0;
        var is_paid = 0;

        if (appointment.transaction_id != '') {
            is_paid = 1;
        }

        var booking_fee = 0;
        var limit = 0;
        var extra_charge = 0;
        var reschedule_limit = 0;

        var rscldFeeData = await getCustomParameterData(appointment?.company_id, appointment?.location_id, 'reschedule');
        if (rscldFeeData && rscldFeeData?.formData && rscldFeeData?.formData?.reschedule_status) {
            booking_fee = parseInt(rscldFeeData?.formData?.reschedule_fee_percentage) || 0;
            limit = parseInt(rscldFeeData?.formData?.reschedule_before_limit) || 0;
            extra_charge = parseInt(rscldFeeData?.formData?.reschedule_booking_fee_percentage) || 0;
            reschedule_limit = parseInt(rscldFeeData?.formData?.reschedule_limit) || 0;
        }

        var gftCardDepositPercent = 0;
        var giftCard = await getCustomParameterData(appointment?.company_id, appointment?.location_id, 'gift_card');
        if (giftCard?.formData && giftCard.formData?.gift_card_status) {
            gftCardDepositPercent = parseInt(giftCard?.formData?.gift_card_deposit_percentage || 0);
        }

        var reschedule_fee = { limit: limit, extra_charge: extra_charge, booking_fee: booking_fee, reschedule_limit: reschedule_limit, gift_card_deposit: gftCardDepositPercent }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: appointment, reschedule_fee: reschedule_fee, is_paid: is_paid, message: "Successfully Appointment Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.sendPaymentAgreementEmail = async function (req, res, next) {
    if (!req.body.booking_id) {
        return res.status(200).json({ status: 200, flag: false, message: "Booking Id must be present" })
    }
    try {
        var client_query = {};
        var appointment = await AppointmentService.getAppointment(req.body.booking_id);
        var location = await LocationService.getLocation(appointment.location_id);
        var company = await CompanyService.getCompany(location.company_id);

        var service_query = { _id: { $in: appointment.service_id } };
        var service = await ServiceService.getServiceSpecificWithCategory(service_query);
        appointment.service_id = service;

        client_query['_id'] = { $in: appointment.client_id };
        var client = await CustomerService.getClients(client_query);
        appointment.client_id = client; //with name

        var service_name = "";

        for (var i = 0; i < appointment.service_id.length; i++) {
            service_name = service_name + appointment.service_id[i].name + ", ";
        }

        var company_website = company.contact_link ? company.contact_link : "";
        var company_logo = company.image ? company.image : "";
        var company_name = company.name;

        var html = "";
        var temFile = "reschedule_payment_agreement.hjs";
        var gettingData = await getEmailTemplateData(location.company_id, location?._id, 'reschedule_payment_agreement', temFile);
        if (gettingData != null) {
            html = gettingData.contents;
        } else {
            html = "";
        }

        var apt_date = dateFormat(appointment.date, "yyyy-mm-dd")
        var toMail = {};
        toMail['site_url'] = process.env.API_URL;
        toMail['link_url'] = process.env.SITE_URL;
        var to = appointment.client_id[0].email;
        var name = appointment.client_id[0].name;
        var subject = "Reschedule Payment Agreement of Booking at" + company.name + " " + location.name + " for " + service_name;
        toMail['name'] = name;
        toMail['date'] = apt_date;
        toMail['data'] = appointment;
        toMail['time'] = appointment.start_time;
        toMail['client_id'] = appointment.client_id[0]._id;
        toMail['client_name'] = appointment.client_id[0].name;
        toMail['client_email'] = appointment.client_id[0].email;
        toMail['client_mobile'] = appointment.client_id[0].mobile;
        toMail['company_name'] = company.name;
        toMail['location_name'] = location.name;
        toMail['currency'] = company.currency ? company.currency.symbol : "£";
        toMail['contact_number'] = location.contact_number;
        toMail['company_website'] = company_website;
        toMail['company_logo'] = company_logo;
        toMail['grand_total'] = appointment.total_amount.toFixed(2);
        toMail['total_paid_amount'] = appointment.paid_amount.toFixed(2);
        toMail['total_remaining_amount'] = appointment.remaining_amount.toFixed(2);
        toMail['total_booking_amt'] = req.body.total_booking_amt.toFixed(2);
        toMail['booking_fee'] = req.body.booking_fee;
        toMail['reschedule_fee_percentage'] = req.body.reschedule_fee;
        toMail['reschedule_extra_fee_percentage'] = req.body.reschedule_extra_fee;
        toMail['reschedule_fee'] = req.body.reschedule_fee_amt;
        toMail['reschedule_extra_fee'] = req.body.reschedule_extra_fee_amt.toFixed(2);;
        toMail['reschedule_booking_amt'] = req.body.reschedule_booking_amt.toFixed(2);;
        toMail['reschedule_remaining_amt'] = req.body.reschedule_remaining_amt.toFixed(2);
        to = 'priyankastrivedge@gmail.com';
        var createdMail = await SendEmailSmsService.sendMail(to, name, subject, temFile, html, toMail,);
        //admin mail
        var to = location.email;
        var name = location.name;
        var subject = "Appointment Reschedule Payment Agreement by " + appointment.client_id[0].name + " at " + company_name + " " + location.name + " branch";
        var createdMail = await SendEmailSmsService.sendMail(to, name, subject, temFile, html, toMail, location._id, location.company_id);

        res.status(200).send({ status: 200, flag: true, message: "Email sent to customer" });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}
