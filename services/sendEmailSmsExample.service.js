// Gettign the Newly created Mongoose Model we just created 
var ContentMaster = require('../models/ContentMaster.model');
var CustomParameter = require('../models/CustomParameter.model');
var EmailTemplate = require('../models/EmailTemplate.model');
var MailService = require('./mail.service');
var LocationService = require('./location.service')
var CompanyService = require('../services/company.service');
const EmailLogService = require('../services/emailLog.service')
const WhatsappApiKey = require('../models/whatsappApiKey.model');


var AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-2' });
var { sleep } = require('sleep')
var axios = require('axios')
const querystring = require('querystring');
// Saving the context of this module inside the _the variable
_this = this
var url = require('url');


// for sending email
exports.sendMailAwait = async function (to, name, subject, temFile, html, datas, type, location_id = '', company_id = '') {
    console.log('to', to, type, 'location_id', location_id, 'company_id', company_id)
    to = "priyankastrivedge@gmail.com";
    if (datas?.bcc) {
        datas.bcc = "kuldeep.strivedge@gmail.com";
    }

    if (to) {
        var isMail = await MailService.sendEmailAwait(to, name, subject, temFile, html, datas, type, location_id, company_id).then(data => {
            return data;
        });
        return isMail;
    }
}

// for sending email
exports.sendMail = async function (to, name, subject, temFile, html, datas, type, location_id = '', company_id = '') {
    // console.log("mail to ",to)
    to = "priyankastrivedge@gmail.com";
    // if(to) {
    //     var isMail = await MailService.sendEmail(to, name, subject, temFile, html, datas, type, location_id, company_id).then(data => {
    //         return data;
    //     });
    // }

    // if (typeof(isMail) != 'undefined' && isMail != null && isMail != "")
    // {
    //     mail.to = isMail;
    // }
}

exports.sendEmailToMultipleRecipients = async function (to, name, subject, temFile, html, datas, type, location_id = '', company_id = '') {
    // console.log("mail to ",to)
    to = "priyankastrivedge@gmail.com";
    // if(to) {
    //     var isMail = await MailService.sendEmailToMultipleRecipients(to, name, subject, temFile, html, datas, type, location_id, company_id).then(data => {
    //         return data;
    //     });
    // }

    // if (typeof(isMail) != 'undefined' && isMail != null && isMail != "")
    // {
    //     mail.to = isMail;
    // }
}

exports.sendSmsLogMail = async function (to, name, subject, temFile, html, datas, file, file_name, type, location_id = '', company_id = '') {
    // console.log("mail to ",to)
    to = "priyankastrivedge@gmail.com";
    if (datas?.bcc) {
        datas.bcc = "kuldeep.strivedge@gmail.com";
    }

    // if(to) {
    //     var isMail = await MailService.sendEmailFile(to, name, subject, temFile, html, datas,file,file_name, type, location_id, company_id).then(data => {
    //         return data;
    //     });
    // }

    // if (typeof(isMail) != 'undefined' && isMail != null && isMail != "")
    // {
    //     mail.to = isMail;
    // }
}

exports.sendMultipleSmsLogMail = async function (to, name, subject, temFile, html, datas, file, file_name_arr, type, location_id = '', company_id = '') {
    to = "priyankastrivedge@gmail.com";
    // console.log("mail to ",to)
    // if(to) {
    //     var isMail = await MailService.sendEmailMultipleFiles(to, name, subject, temFile, html, datas,file,file_name_arr, type, location_id, company_id).then(data => {
    //         return data;
    //     });
    // }

    // if (typeof(isMail) != 'undefined' && isMail != null && isMail != "")
    // {
    //     mail.to = isMail;
    // }
}


// To verify whatsapp acc exist or not


// To send whatsapp message
exports.sendWhatsAppTextMessage = async function (params = null, locationId = "", customer_id = '', type = '', company_id = '') {
    try {
        var response = null
        var unsubsrcibe_link = '';
        if (process.env?.SITE_URL && customer_id) {
            customer_id = customer_id.toString();
            unsubsrcibe_link = process.env?.SITE_URL + '/unsubscribe/' + customer_id;
            var unique_id = (new Date()).getTime().toString(36)
            var short_link = await generateShortLinkByUrl(unsubsrcibe_link, unique_id);
            if (short_link && short_link != '') {
                unsubsrcibe_link = short_link
            }
        }
        if (params && (locationId || company_id)) {

            var waData = await getWhatsAppDetails(type, locationId, company_id);

            //var location = await LocationService.getLocationOneHidden(locationId) || null
            var countryCode = waData?.country_code || 44
            var waAccessToken = waData?.whatsapp_access_token || ""
            var waInstanceId = waData?.whatsapp_instance_id || ""


            if (unsubsrcibe_link) {
                params.Message += '\nTo stop alert: ' + unsubsrcibe_link;
            }

            if (waAccessToken && waInstanceId) {
                var payload = {
                    access_token: waAccessToken,
                    instance_id: waInstanceId,
                    type: "text",
                    message: ""
                }

                if (params?.PhoneNumber) {
                    var number = parseInt(params.PhoneNumber, 10)
                    payload.number = `${countryCode}${number}`
                    //payload.number = `919737591598`
                }
                console.log(' payload.number', payload.number)
                if (params?.Message) {
                    params.Message = params.Message.replace(/\\n/g, '\n');
                    payload.message = params.Message
                    //payload.message ='Test msg '+params.Message
                }

                var apiUrl = 'https://wamatas.com/api/send'

                var apiResponse = await axios.post(apiUrl, payload).then(function (response) {
                    //console.log("Response >>> ", response?.data);
                    return response
                }).catch(function (error) {
                    console.log("Error >>> ", error)
                    return error
                })

                if (apiResponse?.data && apiResponse.data?.status) {
                    response = apiResponse.data
                }
            }
        }

        return response
    } catch (e) {
        console.log("sendWhatsAppTextMessage >>>> ", e)
        return null
    }
}

// for sending SMS
exports.sendSMS = async function (params, locationId, customer_id = '', type = '', companyId = '') {
    try {
        var response = null;
        var unsubsrcibe_link = '';

        if (process.env?.SITE_URL && customer_id) {
            customer_id = customer_id.toString();
            unsubsrcibe_link = process.env?.SITE_URL + '/unsubscribe/' + customer_id;
            var unique_id = (new Date()).getTime().toString(36)
            var short_link = await generateShortLinkByUrl(unsubsrcibe_link, unique_id);
            if (short_link && short_link != '') {
                unsubsrcibe_link = short_link
            }
        }
        if (params && (locationId || companyId)) {
            if (unsubsrcibe_link) {
                params.Message += '\nTo stop alert: ' + unsubsrcibe_link;
            }
            params.Message = params.Message.replace(/\\n/g, '\n');

            var smsData = await getSMSDetails(type, locationId, companyId);

            //var location = await LocationService.getLocationOneHidden(locationId) || null
            if (smsData?.sms_setting == 'twillio') {
                var twilio_phone_number = smsData?.twilio_phone_number ?? 0

                const accountSid = smsData?.twilio_acc_sid ?? ""
                const authToken = smsData?.twilio_auth_token ?? ""
                const fromNumber = '+' + parseInt(twilio_phone_number)
                const client = require('twilio')(accountSid, authToken)

                if (accountSid && authToken && twilio_phone_number) {
                    var response = await client.messages.create({
                        body: params.Message,
                        //from: fromNumber,
                        from: 'AppointGem',
                        //to: '+447878584848',
                        //to: '+919737591598',
                        to: params.PhoneNumber,
                    }).then(function (message) {
                        console.log('message', message)
                        return message
                    })
                }

                return response || null
            } else if (smsData?.sms_setting == 'appointmentgem') {
                var apiKey = smsData?.appopintgem_api_key || ""
                var devices = smsData?.appointmentgem_number || ""
                //var devices = "992|1";

                //params.PhoneNumber = '+919737591598'

                if (apiKey && devices) {
                    const data = { type: "sms", prioritize: 0, key: apiKey, number: params.PhoneNumber, message: params.Message, devices: devices }
                    url = querystring.stringify(data)

                    const request = require('request-promise')
                    const options = {
                        method: 'GET',
                        url: 'https://sms.sendapp.live/services/send.php?' + url
                    }

                    var randomNumber = Math.floor(Math.random() * 6) + 5;
                    sleep(randomNumber)

                    var requestCall = new Promise(async (resolve, reject) => {
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

                    var apiResult = await requestCall.then((result) => {
                        //console.log('result',result,response)
                        return response
                    }).catch((error) => {
                        console.log(error)
                    })

                    if (apiResult?.data && apiResult?.data?.messages && apiResult?.data?.messages?.length) {
                        var msgItem = apiResult.data.messages[0]
                        if (msgItem && msgItem.ID) {
                            response = msgItem
                        }
                    }
                }
            }
        }

        return response
    } catch (e) {
        console.log(e)
        return null
    }
}

// Get sendapplive message by ID
exports.getSendAppLiveMessageById = async function (id = "", locationId = "") {
    try {
        var response = null
        const apiKey = process.env?.APIKEY || ""
        if (apiKey && id) {
            var data = { key: apiKey, id: id }
            var url = querystring.stringify(data)

            var options = {
                method: 'GET',
                url: 'https://sms.sendapp.live/services/read-messages.php?' + url
            }

            // var requestCall = new Promise(async (resolve, reject) => {
            //     request(options).then(function (res) {
            //         res = JSON.parse(res)
            //         if (res && res.success) {
            //             response = res
            //             resolve(true)
            //         } else {
            //             resolve(false)
            //         }
            //     }).catch(function (err) {
            //         console.log(err)
            //         resolve(false)
            //     })
            // })

            // var apiResult = await requestCall.then((result) => {
            //     //console.log('result',result,response)
            //     return response
            // }).catch((error) => {
            //     console.log(error)
            // })

            // if (apiResult?.data && apiResult?.data?.messages && apiResult?.data?.messages?.length) {
            //     var msgItem = apiResult.data.messages?.length ? apiResult.data.messages[0] : apiResult.data?.messages || null
            //     if (msgItem && msgItem.ID) {
            //         response = msgItem
            //     }
            // }

            return response
        }

        return null
    } catch (e) {
        console.log("getSendAppLiveMessageById Error >>> ", e)
        return null
    }
}

// Resend sendapplive SMS
exports.resendSendAppLiveSMS = async function (id = "", locationId = "") {
    try {
        var response = null
        const apiKey = process.env?.APIKEY || ""
        if (apiKey && id) {
            var data = { key: apiKey, id: id }
            var url = querystring.stringify(data)

            var options = {
                method: 'GET',
                url: 'https://sms.sendapp.live/services/resend.php?' + url
            }

            // var requestCall = new Promise(async (resolve, reject) => {
            //     request(options).then(function (res) {
            //         res = JSON.parse(res)
            //         if (res && res.success) {
            //             response = res
            //             resolve(true)
            //         } else {
            //             resolve(false)
            //         }
            //     }).catch(function (err) {
            //         console.log(err)
            //         resolve(false)
            //     })
            // })

            // var apiResult = await requestCall.then((result) => {
            //     //console.log('result',result,response)
            //     return response
            // }).catch((error) => {
            //     console.log(error)
            // })

            // if (apiResult?.data && apiResult?.data?.messages && apiResult?.data?.messages?.length) {
            //     var msgItem = apiResult.data.messages?.length ? apiResult.data.messages[0] : apiResult.data?.messages || null
            //     if (msgItem && msgItem.ID) {
            //         response = msgItem
            //     }
            // }

            return response
        }

        return null
    } catch (e) {
        console.log("resendSendAppLiveSMS Error >>> ", e)
        return null
    }
}

//short link get methor
exports.generateShortLink = async function (link, unique_id) {
    //console.log("link ",link,'unique_id',unique_id)
    var response = {};
    var fullSmsLink = link;
    try {
        var http = require("https");
        // if(link) {
        //     const request = require('request-promise');
        //     unique_id = (Math.random() + 1).toString(36).substring(7);

        //     const data = { "url": link,"custom": unique_id,"domain":"https://apgem.co"};
        //     const post_data = JSON.stringify(data);
        //     const options = {
        //         method: 'POST',
        //         url: 'https://openmy.link/api/url/add',
        //         body: post_data,
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': 'Bearer ejxHisncvXAywIUm'
        //         }
        //     }

        //     var request_call = new Promise( async (resolve, reject) => {
        //         request(options).then(function (response){
        //             response = JSON.parse(response);
        //             console.log(response)
        //             if(response && !response.error && response.shorturl){
        //                 link = response.shorturl;
        //                 resolve(true);           
        //             }else{
        //                 resolve(false);
        //             }
        //             //res.status(200).json(response);
        //         })
        //         .catch(function (err) {
        //             console.log(err);
        //             resolve(false);
        //         })
        //     });

        //     await request_call.then((response) => {
        //         if(response == true){
        //             fullSmsLink = link;
        //         }
        //     }).catch((error) => {
        //         console.log(error);
        //     });
        //   return fullSmsLink;

        // }
    } catch (e) {
        console.log(e)
        return link;
    }

}

async function generateShortLinkByUrl(link, unique_id) {
    var response = {};
    var fullSmsLink = link;
    try {
        var http = require("https");
        // if(link) {
        //     const request = require('request-promise');
        //     unique_id = (Math.random() + 1).toString(36).substring(7);

        //     const data = { "url": link,"custom": unique_id,"domain":"https://apgem.co"};
        //     const post_data = JSON.stringify(data);

        //     console.log('post_data',post_data)
        //     const options = {
        //         method: 'POST',
        //         url: 'https://openmy.link/api/url/add',
        //         body: post_data,
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': 'Bearer ejxHisncvXAywIUm'
        //         }
        //     }

        //     var request_call = new Promise( async (resolve, reject) => {
        //         request(options).then(function (response){
        //             response = JSON.parse(response);
        //             if(response && !response.error && response.shorturl){
        //                 link = response.shorturl;
        //                 resolve(true);           
        //             }else{
        //                 resolve(false);
        //             }
        //             //res.status(200).json(response);
        //         })
        //         .catch(function (err) {
        //             console.log(err);
        //             resolve(false);
        //         })
        //     });

        //     await request_call.then((response) => {
        //         if(response == true){
        //             fullSmsLink = link;
        //         }
        //     }).catch((error) => {
        //         console.log(error);
        //     });
        //   return fullSmsLink;

        // }
    } catch (e) {
        console.log(e)
        return link;
    }

}

const getWhatsAppDetails = async function (type, location_id, company_id) {

    try {
        if (location_id) {
            if (type == 'direct') {
                if (location_id) {
                    var location = await LocationService.getLocationOneHidden({ _id: location_id });

                    if (location && location?.whatsapp_access_token && location?.whatsapp_instance_id) {
                        var countryCode = location?.company_id?.country_code || 44
                        var customParameter = {
                            country_code: countryCode,
                            whatsapp_access_token: location?.whatsapp_access_token,
                            whatsapp_instance_id: location?.whatsapp_instance_id
                        };
                        return customParameter;
                    }
                }
                return null;
            } else if (type == 'cron') {

                var location = await LocationService.getLocationMultipleSmtpDetail({ _id: location_id });

                if (location && location.whatsapp_setting && location.whatsapp_setting.length > 0) {
                    var randomIndex = randomIntFromInterval(0, location.whatsapp_setting.length)
                    randomIndex = randomIndex > 0 ? randomIndex - 1 : randomIndex

                    if (location.whatsapp_setting[randomIndex]) {
                        var whatsapp_setting = location.whatsapp_setting[randomIndex];
                        var countryCode = location?.company_id?.country_code || 44
                        var customParameter = {
                            country_code: countryCode,
                            whatsapp_access_token: whatsapp_setting?.access_token,
                            whatsapp_instance_id: whatsapp_setting?.instance_id
                        };

                        return customParameter;
                    }
                }
            }
        } else if (company_id) {
            var company = await CompanyService.getComanyMultipleSmtpDetail({ _id: company_id });
            console.log('company', company)
            if (company && company?.whatsapp_setting && company?.whatsapp_setting?.length > 0) {
                var randomIndex = randomIntFromInterval(0, company.whatsapp_setting.length)
                randomIndex = randomIndex > 0 ? randomIndex - 1 : randomIndex
                console.log('randomIndex', randomIndex)
                if (company.whatsapp_setting[randomIndex]) {
                    var whatsapp_setting = company.whatsapp_setting[randomIndex];
                    var countryCode = company?.country_code || 44;
                    console.log('company?.country_code', company?.country_code, 'countryCode...', countryCode)
                    var customParameter = {
                        country_code: countryCode,
                        whatsapp_access_token: whatsapp_setting?.access_token,
                        whatsapp_instance_id: whatsapp_setting?.instance_id
                    };
                    console.log('customParameter', customParameter)
                    return customParameter;
                }
            }
        }

        return null;

    } catch (e) {
        console.log(e)
        return customParameter
    }
}

const getSMSDetails = async function (type, location_id, company_id = '') {
    try {
        if (type == 'direct') {
            if (location_id) {
                var location = await LocationService.getLocationOneHidden({ _id: location_id });

                if (location && location?.sms_setting == 'twillio') {

                    if (location && location?.twilio_acc_sid && location?.twilio_auth_token && location?.twilio_phone_number) {

                        var customParameter = {
                            sms_setting: location?.sms_setting,
                            twilio_phone_number: location?.twilio_phone_number,
                            twilio_acc_sid: location?.twilio_acc_sid,
                            twilio_auth_token: location?.twilio_auth_token
                        };

                        return customParameter;
                    }

                } else if (location && location?.sms_setting == 'appointmentgem') {
                    if (location && location?.appointmentgem_number && location?.appopintgem_api_key) {

                        var customParameter = {
                            sms_setting: location?.sms_setting,
                            appointmentgem_number: location?.appointmentgem_number,
                            appopintgem_api_key: location?.appopintgem_api_key
                        };
                        return customParameter;
                    }
                }
            }
            return null;
        } else if (type == 'cron') {

            if (location_id) {
                var location = await LocationService.getLocationMultipleSmtpDetail({ _id: location_id });

                if (location && location?.marketing_sms_setting == 'twillio') {

                    if (location && location.twilio_setting && location.twilio_setting.length > 0) {
                        var randomIndex = randomIntFromInterval(0, location.twilio_setting.length)
                        randomIndex = randomIndex > 0 ? randomIndex - 1 : randomIndex

                        if (location?.twilio_setting[randomIndex]) {
                            var twilio_setting = location?.twilio_setting[randomIndex];

                            var customParameter = {
                                sms_setting: location?.marketing_sms_setting,
                                twilio_phone_number: twilio_setting?.twilio_phone_number,
                                twilio_acc_sid: twilio_setting?.twilio_acc_sid,
                                twilio_auth_token: twilio_setting?.twilio_auth_token
                            };

                            return customParameter;
                        }
                    }

                } else if (location && location?.marketing_sms_setting == 'appointmentgem') {
                    if (location && location.sendapp_setting && location.sendapp_setting.length > 0) {
                        var randomIndex = randomIntFromInterval(0, location.sendapp_setting.length)
                        randomIndex = randomIndex > 0 ? randomIndex - 1 : randomIndex

                        if (location?.sendapp_setting[randomIndex]) {
                            var sendapp_setting = location?.sendapp_setting[randomIndex];

                            var customParameter = {
                                sms_setting: location?.marketing_sms_setting,
                                appointmentgem_number: sendapp_setting?.appointmentgem_number,
                                appopintgem_api_key: sendapp_setting?.appopintgem_api_key
                            };

                            return customParameter;
                        }
                    }
                }
            } else if (company_id) {
                var company = await CompanyService.getComanyMultipleSmtpDetail({ _id: company_id });

                if (company && company?.marketing_sms_setting == 'twillio') {

                    if (company && company.twilio_setting && company.twilio_setting.length > 0) {
                        var randomIndex = randomIntFromInterval(0, company.twilio_setting.length)
                        randomIndex = randomIndex > 0 ? randomIndex - 1 : randomIndex

                        if (company?.twilio_setting[randomIndex]) {
                            var twilio_setting = company?.twilio_setting[randomIndex];

                            var customParameter = {
                                sms_setting: company?.marketing_sms_setting,
                                twilio_phone_number: twilio_setting?.twilio_phone_number,
                                twilio_acc_sid: twilio_setting?.twilio_acc_sid,
                                twilio_auth_token: twilio_setting?.twilio_auth_token
                            };

                            return customParameter;
                        }
                    }

                } else if (company && company?.marketing_sms_setting == 'appointmentgem') {
                    if (company && company.sendapp_setting && company.sendapp_setting.length > 0) {
                        var randomIndex = randomIntFromInterval(0, company.sendapp_setting.length)
                        randomIndex = randomIndex > 0 ? randomIndex - 1 : randomIndex

                        if (company?.sendapp_setting[randomIndex]) {
                            var sendapp_setting = company?.sendapp_setting[randomIndex];

                            var customParameter = {
                                sms_setting: company?.marketing_sms_setting,
                                appointmentgem_number: sendapp_setting?.appointmentgem_number,
                                appopintgem_api_key: sendapp_setting?.appopintgem_api_key
                            };

                            return customParameter;
                        }
                    }
                }
            }
        }

        return null;

    } catch (e) {
        console.log(e)
        return customParameter
    }
}


function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const sendWhatsAppVerifyFailedEmail = async function (error, api_key, mobile, comment, number = 0) {

    try {
        var to = process.env?.WAERROEEMail;
        if (to) {
            var toMail = {}
            toMail['site_url'] = process.env.API_URL
            toMail['link_url'] = process.env.SITE_URL
            toMail['api_key'] = api_key
            toMail['mobile'] = mobile
            toMail['comment'] = comment
            toMail['number'] = number
            toMail['error'] = error?.code ? error?.code : "Bad Responce"
            to = to;

            var isMail = MailService.sendEmailAwait(to, 'Whatsapp Verify', 'WhatsApp Verify Error by WatVerifyAPI.live', 'whatsapp_error_mail.hjs', '', toMail, 'transaction').then(data => {
                return data;
            });

            var emailData = {
                subject: 'WhatsApp Verify Error by WatVerifyAPI.live',
                type: "single",
                file_type: "whatsapp_error_mail",
                temp_file: 'whatsapp_error_mail.hjs',
                data: toMail,
                date: Date(),
                to_email: to,
                status: "Sent",
                response_status: 'Sent',
                email_type: 'transaction'
            }

            var eLog = EmailLogService.createEmailLog(emailData);
        }

        return true
    } catch (e) {
        return null;
    }
}

// To verify whatsapp acc exist or not
exports.verifyWhatsAppNumber = async function (number, wa_key = '') {
    try {
        var result = null;
        var submitedApIKey;
        var submitedMobile;
        var comment;
        number = parseInt(number, 10);
        if (number && number.toString().length > 9) {
            // Query the database to fetch the API key
            let whatsappApiKeyDoc = await WhatsappApiKey.findOne({});
            let apiKeys = whatsappApiKeyDoc ? whatsappApiKeyDoc.whatsappAPIKEYData : [];

            // Shuffle the array of API keys
            apiKeys = shuffleArray(apiKeys);

            let successfulResponse = false;
            for (let i = 0; i < apiKeys.length; i++) {
                const apiKey = apiKeys[i].apiKey;
                const mobile = apiKeys[i].mobileNumber;
                submitedApIKey = apiKey;
                submitedMobile = mobile;
                comment = apiKeys[i].comment
                var apiUrl = 'https://phone.watverifyapi.live/is-whatsapp-no/get';

                const payload = {
                    params: {
                        api_key: apiKey,
                        phone: '44' + number
                    }
                };

                var apiResponse = await axios.get(apiUrl, payload).then(function (response) {
                    return response;
                }).catch(function (error) {
                    console.log('error');
                    return error;
                });

                if (apiResponse && apiResponse.data && (apiResponse.data.result === true || apiResponse.data.result === false)) {
                    result = apiResponse.data.result;
                    successfulResponse = true;
                    break;
                } else {
                    // Remove the failed API key from the document
                    apiKeys.splice(i, 1);
                    i--; // Adjust index as we removed an element
                    await sendWhatsAppVerifyFailedEmail(apiResponse, apiKey, mobile, comment);
                }
            }

            if (!successfulResponse) {
                console.log('All API keys failed');
                // Handle the case when all API keys failed
                result = null;
            }
        }
        return result;
    } catch (e) {
        console.log("verifyWhatsAppNumber >>>> ", e);
        var apiResponse = { code: "Time Out" };
        await sendWhatsAppVerifyFailedEmail(apiResponse, submitedApIKey, submitedMobile, comment);
        return null;
    }
}


exports.verifyWhatsAppNumberOld = async function (number, api_key = '') {
    try {
        var result = null;
        // var apiArr = [process.env?.WATVERIFYAPI, process.env?.WATVERIFYAPI2, process.env?.WATVERIFYAPI3, process.env?.WATVERIFYAPI4, process.env?.WATVERIFYAPI5, process.env?.WATVERIFYAPI6];

        number = parseInt(number, 10);
        if (number && number.toString().length > 9) {
            // Query the database to fetch the API key
            var apiUrl = 'https://phone.watverifyapi.live/is-whatsapp-no/get';
            const payload = {
                params: {
                    api_key: api_key,
                    phone: '44' + number
                }
            };

            var apiResponse = await axios.get(apiUrl, payload).then(function (response) {
                return response
            }).catch(function (error) {
                console.log('error', error)
                return error
            })

            if (apiResponse) {
                console.log('apiResponse', apiResponse)
                if (apiResponse?.data && apiResponse?.data?.result == true || apiResponse?.data?.result == false) {
                    result = apiResponse?.data?.result
                } else {
                    console.log('error apiResponse', apiResponse?.code)
                    // sendWhatsAppVerifyFailedEmail(apiResponse, api_key)
                    result = false;
                }
                return result;

            }

        }
        return result;
    } catch (e) {
        console.log("verifyWhatsAppNumber >>>> ", e)
        var apiResponse = { code: "Time Out" }
        // sendWhatsAppVerifyFailedEmail(apiResponse, api_key);
        return null
    }
}

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}





