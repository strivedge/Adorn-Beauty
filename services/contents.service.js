// Gettign the Newly created Mongoose Model we just created 
var ContentMaster = require('../models/ContentMaster.model');
var CustomParameter = require('../models/CustomParameter.model');
var EmailTemplate = require('../models/EmailTemplate.model');
var MailService = require('./mail.service');

// Saving the context of this module inside the _the variable
_this = this

// for getting email template contents
exports.getEmailTemplateSpecific = async function (client_query) {
    // console.log('query ',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var emailTemplate = await EmailTemplate.findOne(query);

        // Return the EmailTemplate list that was retured by the mongoose promise
        // console.log("Email ",emailTemplate.contents)
        return emailTemplate;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting EmailTemplate');
    }
}

// for sending email
exports.sendMail = async function (to, name, subject, temFile, html, datas) {
    console.log("mail to ", to)
    if (to) {
        var isMail = await MailService.sendEmail(to, name, subject, temFile, html, datas).then(data => {
            return data;
        });
    }

    if (typeof (isMail) != 'undefined' && isMail != null && isMail != "") {
        mail.to = isMail;
    }
}

// you can pass on query (company_id, key, key_url or value_type)
exports.getCustomParameter = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customParameters = await CustomParameter.find(query);

        // Return the CustomParameters list that was retured by the mongoose promise
        return customParameters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomParameter');
    }
}

// find one value with query
exports.getCustomParameterSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customParameters = await CustomParameter.findOne(query);

        // Return the CustomParameters list that was retured by the mongoose promise
        return customParameters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomParameter');
    }
}

// you can pass on query (company_id, name)
exports.getContentMaster = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var contentMasters = await ContentMaster.find(query);

        // Return the ContentMasters list that was retured by the mongoose promise
        return contentMasters;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding ContentMasters');
    }
}
