const axios = require('axios');
const request = require('request-promise');
const querystring = require('querystring');
exports.sendWhatsAppTextTestMessage = async function (params = null, locationId = "", customer_id = '', type = '') {
    try {
        var response = null;
        var unsubscribe_link = '';
        console.log(params, "params");
        if (process.env?.SITE_URL && customer_id) {
            customer_id = customer_id.toString();
            unsubscribe_link = process.env.SITE_URL + '/unsubscribe/' + customer_id;
            var unique_id = (new Date()).getTime().toString(36);
            var short_link = await generateShortLinkByUrl(unsubscribe_link, unique_id);

            if (short_link && short_link !== '') {
                unsubscribe_link = short_link;
            }
        }

        if (params && locationId) {
            var waData = await getWhatsAppDetails(type, locationId);

            var countryCode = waData?.country_code || 91;
            var waAccessToken = waData?.whatsapp_access_token || "";
            var waInstanceId = waData?.whatsapp_instance_id || "";

            if (unsubscribe_link) {
                params.Message += ' To stop alert: ' + unsubscribe_link;
            }

            if (waAccessToken && waInstanceId) {
                var payload = {
                    access_token: waAccessToken,
                    instance_id: waInstanceId,
                    type: "text",
                    message: ""
                };

                if (params?.PhoneNumber) {
                    var number = parseInt(params.PhoneNumber, 10);
                    payload.number = `${countryCode}${number}`;
                }

                if (params?.Message) {
                    payload.message = params.Message;
                }

                var apiUrl = 'https://wamatas.com/api/send';

                var apiResponse = await axios.post(apiUrl, payload)
                    .then(function (response) {
                        console.log(response, "responce");
                        return response;
                    })
                    .catch(function (error) {
                        console.log("Error >>> ", error);
                        return error;
                    });

                if (apiResponse?.data && apiResponse.data?.status) {
                    response = apiResponse.data;
                }
            }
        }

        return response;
    } catch (e) {
        console.log("sendWhatsAppTextMessage >>>> ", e);
        return null;
    }
};

async function generateShortLinkByUrl(link, unique_id) {
    console.log(link, "link");
    var fullSmsLink = link;
    try {
        if (link) {
            unique_id = (Math.random() + 1).toString(36).substring(7);
            const data = { "url": link, "custom": unique_id, "domain": "https://apgem.co" };
            const post_data = JSON.stringify(data);

            const options = {
                method: 'POST',
                url: 'https://openmy.link/api/url/add',
                body: post_data,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ejxHisncvXAywIUm'
                }
            };

            var request_call = new Promise(async (resolve, reject) => {
                request(options).then(function (response) {
                    response = JSON.parse(response);
                    if (response && !response.error && response.shorturl) {
                        link = response.shorturl;
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }).catch(function (err) {
                    console.log(err);
                    resolve(false);
                });
            });

            await request_call.then((response) => {
                if (response === true) {
                    fullSmsLink = link;
                }
            }).catch((error) => {
                console.log(error);
            });

            return fullSmsLink;
        }
    } catch (e) {
        console.log(e);
        return link;
    }
}

const getWhatsAppDetails = async function (type, location_id) {
    console.log(type, location_id, "typt-=-=-=-=-");
    // Mock function for testing
    return {
        country_code: 91,
        whatsapp_access: "",
        whatsapp_instance_id: ""
    };
};

const getSMSDetails = async (type, location_id) => {
    try {

        return null
    } catch (e) {
        console.log(e);
        return null;
    }
};

const sendSMSTestMessage = async (params, locationId, customer_id = '', type = '') => {
    try {
        var response = null;
        var unsubscribe_link = '';

        if (process.env?.SITE_URL && customer_id) {
            customer_id = customer_id.toString();
            unsubscribe_link = process.env.SITE_URL + '/unsubscribe/' + customer_id;
            var unique_id = (new Date()).getTime().toString(36);
            var short_link = await generateShortLinkByUrl(unsubscribe_link, unique_id);

            if (short_link && short_link !== '') {
                unsubscribe_link = short_link;
            }
        }

        if (params && locationId) {
            if (unsubscribe_link) {
                params.Message += ' To stop alert: ' + unsubscribe_link;
            }

            var smsData = await getSMSDetails(type, locationId);
            console.log(smsData, "smsData");
            if (smsData?.sms_setting === 'twillio') {
                var twilio_phone_number = smsData?.twilio_phone_number ?? 0;

                const accountSid = smsData?.twilio_acc_sid ?? "";
                const authToken = smsData?.twilio_auth_token ?? "";
                const fromNumber = '+' + parseInt(twilio_phone_number);
                const client = require('twilio')(accountSid, authToken);
                console.log(accountSid, "accountSid", authToken, "authToken", client, "client", fromNumber);
                if (accountSid && authToken && twilio_phone_number) {
                    response = await client.messages.create({
                        body: params.Message,
                        from: fromNumber,
                        to: params.PhoneNumber,
                    }).then(function (message) {
                        console.log('message', message);
                        return message;
                    }).catch(function (error) {
                        console.log('Error >>> ', error);
                        return error;
                    });
                }

                return response || null;
            } else if (smsData?.sms_setting === 'appointmentgem') {
                var apiKey = smsData?.appopintgem_api_key || "";
                var devices = smsData?.appointmentgem_number || "";
                console.log(apiKey, "Api", devices, "ddh");
                if (apiKey && devices) {
                    const data = { type: "sms", prioritize: 0, key: apiKey, number: params.PhoneNumber, message: params.Message, devices: devices };
                    const url = querystring.stringify(data);

                    const options = {
                        method: 'GET',
                        url: 'https://sms.sendapp.live/services/send.php?' + url
                    };

                    const response = await request(options).then(function (res) {
                        res = JSON.parse(res);
                        if (res && res.success) {
                            return res;
                        } else {
                            console.log(res, "res");
                            return null;
                        }
                    }).catch(function (err) {
                        console.log(err);
                        return null;
                    });
                    console.log(response, "respone");

                    return response;
                }
            }
        }

        return response;
    } catch (e) {
        console.log(e);
        return null;
    }
};

module.exports = {
    sendSMSTestMessage
};