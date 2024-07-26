var moment = require('moment');
var ObjectId = require('mongodb').ObjectId;
var ContentMasterService = require('../services/contentMaster.service');
var CronjobActionService = require('../services/cronjobAction.service');
var CronjobParameterService = require('../services/cronjobParameter.service');
var CustomParameterService = require('../services/customParameter.service');
var CustomParameterSettingService = require('../services/CustomParameterSetting.service')
var EmailTemplateService = require('../services/emailTemplate.service');

// ** Master
var MasterContentMasterService = require('../services/masterContentMaster.service');
var MasterCronjobActionService = require('../services/masterCronjobAction.service');
var MasterCronjobParameterService = require('../services/masterCronjobParameter.service');
var MasterCustomParameterService = require('../services/masterCustomParameter.service');
var MasterCustomParameterSettingService = require('../services/masterCustomParameterSetting.service');
var MasterEmailTemplateService = require('../services/masterEmailTemplate.service');

var CustomerGiftCardService = require('../services/customerGiftCard.service');
var GiftCardTransactionService = require('../services/giftCardTransaction.service');

const inRange = function (x, min, max) {
    return ((x - min) * (x - max) <= 0);
}

const timeToNum = function (time) {
    // console.log('timeToNum time >> ', time)
    var matches = time.match(/(\d\d):(\d\d)/);
    //console.log('matches',matches)
    return parseInt(60 * matches[1]) + parseInt(matches[2]);
} // ex: 10:05 = 60*10+05 = 605

const numToTime = function (num) {
    //console.log('num',num)
    m = num % 60;
    h = parseInt(num / 60);
    //console.log('m',m)
    //console.log('h',h)
    return (h > 9 ? h : "0" + h) + ":" + (m > 9 ? m : "0" + m);
} //ex: $num=605 605%60 == 5 ,605/60 == 10  return 10:05

const isObjEmpty = (obj) => Object.keys(obj).length === 0;

const formatDate = (date = "", format = "MM-DD-YYYY") => {
    if (!date) { date = new Date(); }

    return moment(new Date(date)).format(format);
}

const isValidJson = function (string = "") {
    let valid = false
    try {
        JSON.parse(string);
        valid = true;
    } catch (error) {
        valid = false;
        // console.log('>>>>: helper/index.js : isValidJson -> error', error);
    }

    return valid;
}

const getRandPswd = function () {
    return Math.random().toString(36).slice(-8);
}

const get4DigitCode = function () {
    return Math.floor(1000 + Math.random() * 9000);
}

const getDecimalFormat = (value = 0) => {
    if (value) { return parseFloat(value).toFixed(2); }

    return "0.00";
}

// Calculate Percentage
const calPercentage = function (num = 0, per = 0) {
    if (!num) { num = 0; }
    if (!per) { per = 0; }
    const result = (num / 100) * per;
    return parseFloat(result) || 0;
}

// for Generate datetime unique id
const generateUniqueId = function () {
    var uid = JSON.stringify(Date.now() + Math.random());
    uid = uid.replace(/\./g, '');
    return uid;
}

const increaseDateDays = function (date = null, days = 0, format = "") {
    if (!date) { date = new Date(); }

    var increasedDate = moment(date).add(days, 'day');
    if (format) { increasedDate = increasedDate.format(format); }

    return increasedDate || null;
}

const getDateAddMonths = function (date = null, months = 0, format = "") {
    if (!date) { date = new Date(); }

    var increasedDate = moment(date).add(months, 'month');
    if (format) { increasedDate = increasedDate.format(format); }

    return increasedDate || null;
}

const arrayContainsAll = function (matchArr = [], mainArr = []) {
    for (let i = 0; i < matchArr.length; i++) {
        if (mainArr.indexOf(matchArr[i].toString()) == -1) { return false; }
    }

    return true;
}

const isArrayContainingObject = function (arrayData = [], field = "_id") {
    var isArrObject = false;
    if (arrayData && arrayData.length) {
        isArrObject = arrayData.some(element => {
            if (element && element[field]) { return true; }

            return false;
        });
    }

    return isArrObject;
}

const checkTimeBetween = function (time) {
    let timing = time;
    if ((time >= 0) && time <= 14) {
        timing = '00';
    } else if (time >= 15 && time <= 29) {
        timing = 15;
    } else if (time >= 30 && time <= 44) {
        timing = 30;
    } else if (time >= 45 && time <= 59) {
        timing = 45;
    }

    return timing;
}

const between = function (x, min, max) {
    return x >= min && x <= max;
}

const checkInvTimeBetween = function (start_time, end_time) {
    var start_time_split = start_time.split(':');
    var end_time_split = end_time.split(':');
    var times = [];
    var quarterHours = ["00", "15", "30", "45"];

    var endtime = parseInt(end_time_split[0]) + 1;
    var enttimes = end_time_split[0] + ":" + end_time_split[1];

    for (var t = start_time_split[0]; t < endtime; t++) {
        for (var j = 0; j < 4; j++) {
            var time = parseInt(t) + ":" + quarterHours[j];
            if (parseInt(t) > 9) {
                time = time;
            } else {
                time = '0' + time;
            }
            var ctime = timeToNum(time);
            var cst = timeToNum(start_time);
            var cet = timeToNum(enttimes);
            var isInRange = inRange(ctime, cst, cet);
            if (isInRange) { times.push(time); }
        }
    }

    return times;
}

const getMaskedEmail = function (email = "") {
    if (email) {
        let skipFirstChars = 2;
        let firstThreeChar = email.slice(0, skipFirstChars);

        let domainIndexStart = email.lastIndexOf("@");
        let maskedEmail = email.slice(skipFirstChars, domainIndexStart - 1);

        maskedEmail = maskedEmail.replace(/./g, '*');
        let domainPlusPreviousChar = email.slice(domainIndexStart - 1, email.length);

        email = firstThreeChar.concat(maskedEmail).concat(domainPlusPreviousChar);
    }

    return email;
}

const getMaskedString = function (string = "") {
    if (string) {
        let skipFirstChars = 0;
        let firstThreeChar = string.slice(0, skipFirstChars);

        let lastIndex = string.length;
        let maskedString = string.slice(skipFirstChars, lastIndex - 2);

        maskedString = maskedString.replace(/./g, '*');
        let lastPlusPreviousChar = string.slice(lastIndex - 2, string.length);

        string = firstThreeChar.concat(maskedString).concat(lastPlusPreviousChar);
    }

    return string;
}

const getContentMasterData = async (companyId = "", locationId = "", name = "") => {
    try {
        var query = { location_id: locationId, name: name };
        var contentMaster = await ContentMasterService.getContentMasterOne(query) || null;
        if (!contentMaster && !contentMaster?._id) {
            query = { company_id: companyId, name: name };
            contentMaster = await ContentMasterService.getContentMasterOne(query) || null;
            if (!contentMaster && !contentMaster?._id) {
                query = { name: name };
                contentMaster = await MasterContentMasterService.getMasterContentMasterOne(query) || null;
            }
        }

        return contentMaster;
    } catch (e) {
        // throw Error(e.message);
        return null;
    }
}

const getCronJobActionData = async (companyId = "", locationId = "", keyUrl = "") => {
    try {
        var query = { location_id: locationId, key_url: keyUrl };
        var cronJobAction = await CronjobActionService.getCronjobActionOne(query) || null;
        if (!cronJobAction || !cronJobAction?._id) {
            query = { company_id: companyId, location_id: "", key_url: keyUrl };
            cronJobAction = await CronjobActionService.getCronjobActionOne(query) || null;
            if (!cronJobAction || !cronJobAction?._id) {
                query = { key_url: keyUrl };
                cronJobAction = await MasterCronjobActionService.getMasterCronjobActionOne(query) || null;
            }
        }

        return cronJobAction;
    } catch (e) {
        // throw Error(e.message);
        return null;
    }
}

const getCronJobParameterData = async (companyId = "", locationId = "", keyUrl = "") => {
    try {
        var query = { location_id: locationId, key_url: keyUrl };
        var cronJobParameter = await CronjobParameterService.getCronjobParameterOne(query) || null;
        if (!cronJobParameter || !cronJobParameter?._id) {
            query = { company_id: companyId, location_id: "", key_url: keyUrl };
            cronJobParameter = await CronjobParameterService.getCronjobParameterOne(query) || null;
            if (!cronJobParameter || !cronJobParameter?._id) {
                query = { key_url: keyUrl };
                cronJobParameter = await MasterCronjobParameterService.getMasterCronjobParameterOne(query) || null;
            }
        }

        return cronJobParameter;
    } catch (e) {
        // throw Error(e.message);
        return null;
    }
}

const getCustomParameterData = async (companyId = "", locationId = "", category = "") => {
    try {
        var customParameter = null;
        if (locationId) {
            var query = { location_id: locationId, category: category };
            customParameter = await CustomParameterSettingService.getCustomParameterSettingOne(query) || null;
        }

        if (!customParameter || !customParameter?._id) {
            query = { company_id: companyId, location_id: null, category: category };
            customParameter = await CustomParameterSettingService.getCustomParameterSettingOne(query) || null;
            if (!customParameter || !customParameter?._id) {
                query = { category: category };
                customParameter = await MasterCustomParameterSettingService.getMasterCustomParameterSettingOne(query) || null;
            }
        }
        //console.log('helper getCustomParameterData customParameter', customParameter)
        return customParameter;
    } catch (e) {
        console.log(e)
        // throw Error(e.message);
        return null;
    }
}

const getCustomParameterDataBK = async (companyId = "", locationId = "", keyUrl = "") => {
    try {
        var query = { location_id: locationId, key_url: keyUrl };
        var customParameter = await CustomParameterService.getCustomParameterOne(query) || null;
        if (!customParameter || !customParameter?._id) {
            query = { company_id: companyId, location_id: "", key_url: keyUrl };
            customParameter = await CustomParameterService.getCustomParameterOne(query) || null;
            if (!customParameter || !customParameter?._id) {
                query = { key_url: keyUrl };
                customParameter = await MasterCustomParameterService.getMasterCustomParameterOne(query) || null;
            }
        }

        return customParameter;
    } catch (e) {
        // throw Error(e.message);
        return null;
    }
}

const getEmailTemplateData = async (companyId = "", locationId = "", type = "", temFileName = "") => {
    try {
        var query = { location_id: locationId, name: temFileName, type: type };
        var emailTemplate = await EmailTemplateService.getEmailTemplateSpecific(query) || null;
        if (!emailTemplate || !emailTemplate?._id) {
            query = { company_id: companyId, location_id: "", name: temFileName, type: type };
            emailTemplate = await EmailTemplateService.getEmailTemplateSpecific(query) || null;
            if (!emailTemplate || !emailTemplate?._id) {
                query = { name: temFileName, type: type };
                emailTemplate = await MasterEmailTemplateService.getMasterEmailTemplateOne(query) || null;
            }
        }

        return emailTemplate;
    } catch (e) {
        // throw Error(e.message);
        return null;
    }
}

const getTimeDifferenceBetweenDates = (date1 = "", date2 = "") => {
    const result = { day: 0, hour: 0, minute: 0, second: 0, totalHour: 0 };
    if (date1 && date2) {
        date1 = formatDate(date1, "YYYY-MM-DD HH:mm:ss");
        date2 = formatDate(date2, "YYYY-MM-DD HH:mm:ss");

        const dateTime1 = new Date(date1).getTime();
        const dateTime2 = new Date(date2).getTime();
        const diff = dateTime1 - dateTime2;

        const days = Math.floor(diff / (60 * 60 * 24 * 1000));
        const hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
        const minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
        const seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));

        let totalHours = hours;
        if (days) { totalHours = (days * 24) + hours; }
        result.day = days;
        result.hour = hours;
        result.minute = minutes;
        result.second = seconds;
        result.totalHour = totalHours;
    }

    return result
}

const generateRanAlphaNumString = (strLength = 8) => {
    let code = '';
    const characters = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789';
    for (let i = 0; i < strLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }

    return code;
}

const getPrefixNumber = (value = "", len = 5, newPrefix) => {
    if (!value) { value = "00000"; }

    if (value) {
        var prefixId = value; // ADN000001
        var numlen = len; // number length
        var regexp = /[a-zA-Z]+|[0-9]+(?:\.[0-9]+|)/g;
        // split prefix and number in array
        var prefix = ""; // prefix value
        var lastPrxNum = ""; // Last prefix number
        var regexStr = prefixId.match(regexp);
        if (regexStr?.length == 1) { lastPrxNum = regexStr[0]; }

        if (regexStr?.length > 1) {
            prefix = regexStr[0];
            lastPrxNum = regexStr[1];
        }

        var increase = (parseInt(lastPrxNum) + 1).toString();
        var increase = increase.toString().padStart(numlen, "0");
        var nextId = prefix + increase;
        nextId = nextId.replace(prefix, newPrefix ? newPrefix : prefix);

        return nextId;
    }

    return value;
}

const getCapitalizeString = (string = "") => {
    if (string) { string = string.toUpperCase(); }

    return string;
}

const getFileNamePath = (path = "") => {
    if (path) { path = path.split("/").pop(); }

    return path;
}

// get string in lower case
const getToLowerCase = (value = "") => {
    if (value) { value = value.toLowerCase(); }

    return value;
}

const checkIsBeforeDate = (date1 = null, date2 = null) => {
    if (!date1) { date1 = new Date(); }
    if (!date2) { date2 = new Date(); }

    date1 = formatDate(new Date(date1), "YYYY-MM-DD");
    date2 = formatDate(new Date(date2), "YYYY-MM-DD");

    const dateIsBefore = moment(date2).isBefore(date1);

    return dateIsBefore || false;
}

const getGiftCardBalance = async (payload = null) => {
    try {
        var companyId = payload?.company_id || "";
        var locationId = payload?.location_id || "";
        var customerId = payload?.customer_id || "";
        var serviceIds = payload?.service_ids || null;

        var date = formatDate(null, 'YYYY-MM-DD');
        if (payload?.date) {
            date = formatDate(payload.date, 'YYYY-MM-DD');
        }

        var query = {
            status: 1,
            service_ids: null,
            is_redeemed: true,
            remaining: { $gt: 0 },
            customer_id: customerId,
            end_date: { $gte: date }
        };

        query['$or'] = [
            { $and: [{ company_id: companyId }, { location_id: locationId }] },
            { $and: [{ company_id: companyId }, { location_id: null }] }
        ];

        var srvcGiftCards = [];
        if (serviceIds && serviceIds?.length) {
            var srvcQuery = { ...query, service_ids: { $in: serviceIds } }
            srvcGiftCards = await CustomerGiftCardService.getCustomerGiftCardsOne(srvcQuery, "end_date", 1);
        }

        var balance = 0;
        var giftCards = await CustomerGiftCardService.getCustomerGiftCardsOne(query, "end_date", 1) || [];
        if (srvcGiftCards && srvcGiftCards?.length) {
            var mergedArray = srvcGiftCards.concat(giftCards.filter((item2) =>
                !srvcGiftCards.some((item1) => item1._id === item2._id)
            ));
            if (mergedArray && mergedArray?.length) { giftCards = mergedArray; }
        }

        if (giftCards && giftCards?.length) {
            giftCards.map((item) => {
                balance += item?.remaining || 0;
            });
        }

        return {
            flag: true,
            data: giftCards,
            balance: balance,
            message: "Customer Gift card balance received successfully!"
        }
    } catch (error) {
        console.log("getGiftCardBalance >>> ", error);
        return { flag: false, data: [], balance: 0, message: error.message }
    }
}

const debitCustomerGiftCardBalance = async (payload = null) => {
    try {
        var companyId = payload?.company_id || "";
        var locationId = payload?.location_id || "";
        var customerId = payload?.customer_id || "";
        var amount = Number(payload?.amount || 0);
        var transactionDescription = payload?.transaction_description || "";
        var appointmentId = payload?.appointment_id || null;

        var giftCards = [];
        var remaining = amount;
        var transactionIds = [];
        var custGiftData = await getGiftCardBalance(payload);
        if (custGiftData?.data && custGiftData.data?.length) { giftCards = custGiftData.data; }
        if (giftCards && giftCards?.length) {
            for (let i = 0; i < giftCards.length; i++) {
                let giftCard = giftCards[i];
                var remainBal = giftCard?.remaining || 0;
                var usedBal = 0;
                if (giftCard && giftCard?._id && giftCard?.remaining && remaining) {
                    if (remaining > giftCard.remaining) {
                        remaining = remaining - giftCard.remaining;
                        usedBal = giftCard.remaining;
                        remainBal = 0;
                    } else if (giftCard.remaining > remaining) {
                        usedBal = remaining;
                        remainBal = giftCard.remaining - remaining;
                        remaining = 0;
                    } else if (remaining == giftCard.remaining) {
                        usedBal = giftCard.remaining;
                        remaining = 0;
                        remainBal = 0;
                    }

                    var description = "Gift card used";
                    if (transactionDescription) { description = transactionDescription; }
                    description = `${description} - ${giftCard.gift_code}`;

                    var transaction = await GiftCardTransactionService.createGiftCardTransaction({
                        company_id: companyId,
                        location_id: locationId,
                        customer_gift_card_id: giftCard._id,
                        customer_id: customerId,
                        appointment_id: appointmentId,
                        date: new Date(),
                        action: "debit",
                        amount: usedBal || 0,
                        total_amount: remainBal || 0,
                        description: description
                    });
                    if (transaction && transaction?._id) {
                        transactionIds.push(transaction._id);
                    }
                }

                await CustomerGiftCardService.updateCustomerGiftCard({
                    _id: giftCard._id,
                    remaining: remainBal
                });
            }
        }

        var custGiftData = await getGiftCardBalance(payload);

        return {
            status: 200,
            flag: false,
            message: "Debit process initiated!",
            transaction_ids: transactionIds,
            ...custGiftData
        };
    } catch (error) {
        console.log("debitCustomerGiftCardBalance catch >>> ", error);
        // Return an Error Response Message with Code and the Error Message.
        return { status: 200, flag: false, message: error.message };
    }
}

const creditCustomerGiftCardBalance = async (payload = null) => {
    try {
        var companyId = payload?.company_id || "";
        var locationId = payload?.location_id || "";
        var customerId = payload?.customer_id || "";
        var transactionIds = payload?.transaction_ids || [];
        var transactionDescription = payload?.transaction_description || "";
        var appointmentId = payload?.appointment_id || null;

        var creditTransactionIds = [];
        var totalTransactionAmount = 0;
        if (transactionIds && transactionIds?.length) {
            var query = { revert: false, status: 1, action: "debit", _id: { $in: transactionIds } };

            var transactions = await GiftCardTransactionService.getGiftCardTransactionsOne(query);
            if (transactions && transactions?.length) {
                for (let i = 0; i < transactions.length; i++) {
                    let transaction = transactions[i];
                    if (transaction && transaction?._id) {
                        var transactionId = transaction._id;
                        var custGftCrdId = transaction?.customer_gift_card_id?._id || transaction.customer_gift_card_id || "";
                        var tranAmount = parseFloat(transaction?.amount || 0);
                        var giftRemainBal = parseFloat(transaction?.customer_gift_card_id?.remaining || 0);
                        var remaining = giftRemainBal + tranAmount;
                        totalTransactionAmount += tranAmount;
                        if (remaining > transaction?.customer_gift_card_id?.amount) {
                            remaining = transaction.customer_gift_card_id.amount;
                        }
                        if (custGftCrdId) {
                            var description = "Gift card balance return";
                            if (transactionDescription) { description = transactionDescription; }
                            if (transaction?.customer_gift_card_id?.gift_code) {
                                description = `${description} - ${transaction?.customer_gift_card_id?.gift_code}`;
                            }

                            var giftTransaction = await GiftCardTransactionService.createGiftCardTransaction({
                                company_id: companyId,
                                location_id: locationId,
                                customer_gift_card_id: custGftCrdId,
                                customer_id: customerId,
                                appointment_id: appointmentId,
                                debit_id: transactionId,
                                date: new Date(),
                                action: "credit",
                                amount: tranAmount || 0,
                                total_amount: remaining || 0,
                                description: description
                            });
                            if (giftTransaction && giftTransaction?._id) {
                                await CustomerGiftCardService.updateCustomerGiftCard({
                                    _id: custGftCrdId,
                                    remaining: remaining
                                });

                                await GiftCardTransactionService.updateGiftCardTransaction({
                                    _id: transactionId,
                                    credit_id: giftTransaction._id,
                                    revert: true
                                });

                                creditTransactionIds.push(giftTransaction._id);
                            }
                        }
                    }
                }
            }

            var custGiftData = await getGiftCardBalance(payload);

            return {
                status: 200,
                flag: true,
                transaction_ids: creditTransactionIds,
                total_transaction_amount: totalTransactionAmount,
                message: "Credit gift card balance initiated!",
                ...custGiftData
            };
        }

        return {
            status: 200,
            flag: false,
            message: "Transaction Id not found!"
        };
    } catch (error) {
        console.log("creditCustomerGiftCardBalance catch >>> ", error);
        // Return an Error Response Message with Code and the Error Message.
        return { status: 200, flag: false, message: error.message };
    }
}

module.exports = {
    inRange,
    timeToNum,
    numToTime,
    formatDate,
    isObjEmpty,
    isValidJson,
    getRandPswd,
    get4DigitCode,
    calPercentage,
    generateUniqueId,
    increaseDateDays,
    getDateAddMonths,
    arrayContainsAll,
    isArrayContainingObject,
    checkTimeBetween,
    between,
    checkInvTimeBetween,
    getDecimalFormat,
    getMaskedEmail,
    getMaskedString,
    getContentMasterData,
    getCronJobActionData,
    getCronJobParameterData,
    getCustomParameterData,
    getEmailTemplateData,
    getTimeDifferenceBetweenDates,
    generateRanAlphaNumString,
    getPrefixNumber,
    getCapitalizeString,
    getFileNamePath,
    getToLowerCase,
    checkIsBeforeDate,
    getGiftCardBalance,
    debitCustomerGiftCardBalance,
    creditCustomerGiftCardBalance
}
