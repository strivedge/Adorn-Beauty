
// This file for testing from postman

var MailService = require('./mail.service');

// Saving the context of this module inside the _the variable
_this = this

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
