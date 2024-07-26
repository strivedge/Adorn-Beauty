// This file for testing from postman
var jwt = require('jsonwebtoken')
var ContentService = require('../services/contents.service')
var EmailTemplateService = require('../services/emailTemplate.service')

exports.sendMail = async function (req, res, next) {
    try {
        //console.log(req.body);
        var to = 'priyankastrivedge@gmail.com';
        var name = 'Priya';
        var subject = 'appointment_admin_mail';
        // var html = req.body.text;
        var datas = { name: 'Kuldeep', desc: 'This is for testing' };
        var temFile = "appointment_admin_mail.hjs";
        var query = { name: temFile, type: 'client_appointment_booking' };
        var getTemplateData = await EmailTemplateService.getEmailTemplateSpecific(query);
        //console.log('getTemplateData',getTemplateData)
        var html = getTemplateData.contents
        var createdMail = await ContentService.sendMail(to, name, subject, temFile, html, datas);

        token1 = jwt.sign({
        }, process.env.SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });

        return res.status(200).json({ token: token1, flag: true, data: null, message: "Successfully Created Mail" })
    } catch (e) {
        console.log("e ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Mail Creation was Unsuccesfull" })
    }
}