var dateFormat = require('dateformat')
var ObjectId = require('mongodb').ObjectId
var Test = require('../models/Test.model');
var MasterTest = require('../models/MasterTest.model');
var MasterTestService = require('../services/masterTest.service')
var Category = require('../models/Category.model');
var MasterCategory = require('../models/MasterCategory.model');
var MasterCategoryService = require('../services/masterCategory.service')
var MasterService = require('../services/masterService.service');
var Service = require('../models/Service.model')
var masterServiceModel = require('../models/MasterService.model')
var CustomerWhatsAppVerify = require('../models/CustomerWhatsAppVerify.model');
var Appointment = require('../models/Appointment.model')
var CustomerLoyaltyCardLog = require('../models/CustomerLoyaltyCardLog.model')
var CustomerLoyaltyCard = require('../models/CustomerLoyaltyCard.model');
var Question = require('../models/Question.model')
var QuestionGroup = require('../models/QuestionGroup.model');
var CustomParameter = require('../models/CustomParameter.model');
var CronjobParameter = require('../models/CronjobParameter.model');
var Discount = require('../models/Discount.model');


var AdminService = require('../services/admin.service')
var SendEmailSmsService = require('../services/sendEmailSms.service')
var CompanyService = require('../services/company.service')
var LocationService = require('../services/location.service')
var LocationTimingService = require('../services/locationTiming.service')

var AppliedDiscountService = require('../services/appliedDiscount.service')
var AppointmentService = require('../services/appointment.service')
var BlockTimeService = require('../services/blockTime.service')
var CategoryService = require('../services/category.service')
var ConsultantFormService = require('../services/consultantForm.service')
var ContentMasterService = require('../services/contentMaster.service')
var CronjobParameterService = require('../services/cronjobParameter.service')
var CustomerPackageService = require('../services/customerpackage.service')
var CustomerPackageLog = require('../services/customerPackageLog.service');
var CustomerRewardService = require('../services/customerReward.service')
var CustomerUsagePackageService = require('../services/customerUsagePackageService.service')
var CustomParameterService = require('../services/customParameter.service')
var DiscountService = require('../services/discount.service')
var DiscountSlabService = require('../services/discountSlab.service')
var EmployeeTimingService = require('../services/employeeTiming.service')
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
var UserDeviceTokenService = require('../services/userDeviceToken.service');
var CustomerLoyaltyCardService = require('../services/customerLoyaltyCard.service')
var CustomerLoyaltyCardLogService = require('../services/customerLoyaltyCardLog.service')
var DiscountService = require('../services/discount.service')
var ConsultantFormService = require('../services/consultantForm.service')
var ConsultantServiceTypeQuestionService = require('../services/consultantServiceTypeQuestion.service')
var CustomerService = require('../services/customer.service')
var WhatsAppLogService = require('../services/whatsAppLog.service')
var EmailLogService = require('../services/emailLog.service')

var jwt = require('jsonwebtoken')
var AWS = require('aws-sdk')
var { sleep } = require('sleep')
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const dotenv = require('dotenv')
dotenv.config()
var mongoose = require('mongoose')

let ejs = require("ejs")
let pdf = require("html-pdf")
let path = require("path").resolve('./')

var fs = require("fs")
var root_path = require('path').resolve('public')

var dateFormat = require('dateformat')
var TinyURL = require('tinyurl')
const request = require('request')
var url = require('url')

var querystring = require('querystring');

// Saving the context of this module inside the _the variable
_this = this


exports.createMasterCatelog = async function (req, res, next) {
    try {

        var query = {}

        //var data = await TestService.getDistinctTests(query)

        //var data = await CategoryService.getDistinctCategories(query)

        var data = await ServiceService.getDistinctServices(query)

        //var data = await QuestionService.getDistinctTests(query)

        //var data = await QuestionGroupService.getDistinctQuestionGroups(query)


        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, count: data.length, data: data, message: "Successfully Created" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getSmtpDetail = async function (req, res, next) {
    try {
        var location_id = req.query.location_id;
        var location = await LocationService.getLocationCompanySmtpDetail({ _id: location_id });
        console.log('getSmtpDetails location', location);


        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: location, message: "Successfully" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


exports.getOnlineServices = async function (req, res, next) {
    try {
        var location = await LocationService.getAllActiveLocations({ status: 1 });
        if (location && location.length > 0) {
            for (var i = 0; i < location.length; i++) {
                var location_id = location[i]._id.toString();

                var query = { status: 1, online_status: 1, location_id: location_id }
                var services = await ServiceService.getServiceSpecific(query)

                services = services.map(x => x._id.toString());

                await CronjobParameterService.updateManyCronjobParameter({ location_id: location_id }, { service_id: services })
            }
        }
        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, location: location.length, data: services, message: "Successfully" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.AddVerifyNumberToCustomer = async function (req, res, next) {
    try {
        var numbers = await CustomerWhatsAppVerify.find({
            wa_verified: 1
        });

        if (numbers && numbers.length > 0) {

            for (var i = 0; i < numbers.length; i++) {

                CustomerService.updateMultipleCustomers({ _id: numbers[i].customer_id }, { wa_verified: numbers[i].wa_verified });
            }
        }
        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: numbers, message: "Successfully" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.verifyCustomerWhatsAppNumber = async function (req, res, next) {
    try {


        // var unverify = await CustomerWhatsAppVerify.find({
        //     wa_verified: 0
        // });
        // var customer_arr = unverify.map(x => x.customer_id)
        await CustomerWhatsAppVerify.collection.drop();
        const query = {
            wa_verified: 0,
            createdAt: { $gt: new Date('2024-02-06T09:00:00.000Z') }
        };


        var customer = await CustomerService.getClients(query)

        customer = customer.filter(function (el) {
            return (parseInt(el.mobile)).toString().length > 9;
        });

        if (customer && customer.length > 0) {
            const api_key0 = process.env?.WATVERIFYAPI;
            const api_key1 = process.env?.WATVERIFYAPI2;
            const api_key2 = process.env?.WATVERIFYAPI3;
            const api_key3 = process.env?.WATVERIFYAPI4;
            const api_key4 = process.env?.WATVERIFYAPI5;
            const api_key5 = process.env?.WATVERIFYAPI6;

            for (var i = 0; i < customer.length; i += 6) {
                for (var c = 0; c < 6; c++) {
                    if (customer[i + c]) {
                        const api_key = eval(`api_key${c}`)
                        if (customer[i + c].mobile) {

                            var verified = await SendEmailSmsService.verifyWhatsAppNumberOld(customer[i + c].mobile, api_key)

                            verified = verified ? 1 : 0;

                            //CustomerService.updateMultipleCustomers({_id:customer[i+c]._id},{wa_verified: parseInt(verified)??0}); 

                            var newWA = new CustomerWhatsAppVerify({
                                customer_id: customer[i + c]._id,
                                mobile: customer[i + c].mobile,
                                wa_verified: parseInt(verified) ?? 0
                            })
                            await newWA.save();
                        }
                    }

                }
                sleep(5);
            }
        }

        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, customer_len: customer.length, length: customer.length, data: customer, message: "Successfully" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createCustomerTableFromUser = async function (req, res, next) {
    try {

        var query = { role_id: "607d8af0841e37283cdbec4c" }

        var users = await UserService.getCustomerData(query);

        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, count: users.length, data: users, message: "Successfully Created" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}




exports.updateTestsCollection = async function (req, res, next) {

    try {
        // Retrieve all tests from the tests collection
        const tests = await Test.find();

        // Iterate through each test
        for (const test of tests) {
            // Check if the test has a master_test_id
            if (!test.master_test_id) {
                // If the test does not have a master_test_id, find or create a master test
                let masterTest = await MasterTest.findOne({ name: test.name });
                // If a master test with the same name exists, update the test with its _id
                if (masterTest) {
                    test.master_test_id = masterTest._id;
                } else {
                    // If a master test with the same name does not exist, create a new one
                    masterTest = await MasterTestService.createMasterTest(test)
                    // Return the _id of the newly created test
                    test.master_test_id = masterTest._id;
                }
                // Save the updated test with the master_test_id
                await test.save();
            }
        }

        // Return all tests with updated master_test_ids
        return res.status(200).json({ tests });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master tests:", error);
        return res.status(500).json({ error: "Internal server error" });
    }

}


exports.updateCategoriesCollection = async function (req, res, next) {

    try {
        // Retrieve all tests from the tests collection
        const categories = await Category.find();

        // Iterate through each test
        for (const category of categories) {
            // Check if the category has a master_category_id
            if (!category.master_category_id) {
                // If the category does not have a master_category_id, find or create a master category
                let masterCategory = await MasterCategory.findOne({ name: category.name });
                // If a master category with the same name exists, update the category with its _id
                if (masterCategory) {
                    category.master_category_id = masterCategory._id;
                } else {
                    // If a master category with the same name does not exist, create a new one
                    masterCategory = await MasterCategoryService.createMasterCategory(category)
                    // Return the _id of the newly created category
                    category.master_category_id = masterCategory._id;
                }
                // Save the updated category with the master_category_id
                await category.save();
            }
        }

        // Return all categories with updated master_category_ids
        return res.status(200).json({ categories });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master tests:", error);
        return res.status(500).json({ error: "Internal server error" });
    }

}

exports.updateServicesCollection = async function (req, res, next) {

    try {
        // Retrieve all tests from the tests collection
        const services = await Service.find();

        // Iterate through each test
        for (const service of services) {
            // Check if the service has a master_service_id
            if (!service.master_service_id) {
                // If the service does not have a master_service_id, find or create a master service
                let masterService = await masterServiceModel.findOne({ name: service.name });
                // If a master service with the same name exists, update the service with its _id

                var Category = await CategoryService.getCategory(service.category_id)
                service.master_category_id = Category.master_category_id

                var Test = await TestService.getTest(service.test_id)
                service.master_test_id = Test.master_test_id

                if (masterService) {
                    service.master_service_id = masterService._id;
                } else {
                    // If a master service with the same name does not exist, create a new one
                    masterService = await MasterService.createMasterService(service)
                    // Return the _id of the newly created service
                    service.master_service_id = masterService._id;
                }
                // Save the updated service with the master_service_id
                await service.save();
            }
        }

        // Return all services with updated master_service_ids
        return res.status(200).json({ services });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master tests:", error);
        return res.status(500).json({ error: "Internal server error" });
    }

}
exports.updateAppointments = async function (req, res, next) {
    try {
        const customerLoyaltyCardLogs = await CustomerLoyaltyCardLog.find({});
        let pushData = [];
        for (const log of customerLoyaltyCardLogs) {
            const appointment = await Appointment.findOne({ _id: log.appointment_id });
            if (appointment) {
                const loyaltyCardData = appointment.loyalty_card_data || [];
                const exists = loyaltyCardData.some(item => item.customer_loyalty_card_id == log.customer_loyalty_card_id);
                if (!exists) {
                    const loyaltyCard = await CustomerLoyaltyCard.findOne({ _id: log.customer_loyalty_card_id });
                    if (loyaltyCard) {
                        loyaltyCardData.push({
                            customer_loyalty_card_id: String(log.customer_loyalty_card_id), // Convert to string
                            loyalty_card_id: String(log.loyalty_card_id), // Convert to string
                            is_free_service: false,
                            service_id: String(loyaltyCard.service_id) // Convert to string
                        });
                        pushData.push(loyaltyCardData);
                        await Appointment.updateOne({ _id: appointment._id }, { $set: { loyalty_card_data: loyaltyCardData } });
                    }
                }
            }
        }
        res.status(200).json({ status: 200, flag: false, message: 'Update completed successfully.', updateData: pushData });
        return 'Update completed successfully';
    } catch (err) {
        console.error('Error updating appointments:', err);
        throw err;
    }
}


exports.updateCustomerLoyaltyCardLogs = async function (req, res, next) {
    try {
        // Fetch all appointments
        const appointments = await Appointment.find({});
        // Iterate through each appointment
        for (const appointment of appointments) {
            if (appointment.booking_status != 'no_shows' && appointment.booking_status != 'cancel') {
                // Check if loyalty_card_data is an array
                if (Array.isArray(appointment.loyalty_card_data)) {
                    // Iterate through loyalty_card_data array
                    for (const loyaltyCardData of appointment.loyalty_card_data) {
                        // Check if entry exists in customerLoyaltyCardLogs
                        const existingEntry = await CustomerLoyaltyCardLog.findOne({
                            appointment_id: appointment._id,
                            customer_loyalty_card_id: loyaltyCardData.customer_loyalty_card_id
                        });
                        // If entry doesn't exist, create a new entry
                        if (!existingEntry) {
                            // Check if appointment date is within the start and end dates of customer loyalty card
                            const loyaltyCard = await CustomerLoyaltyCard.findOne({ _id: loyaltyCardData.customer_loyalty_card_id });
                            if (loyaltyCard && appointment.date >= loyaltyCard.start_date && appointment.date <= loyaltyCard.end_date) {
                                const newEntry = new CustomerLoyaltyCardLog({
                                    company_id: appointment.company_id,
                                    location_id: appointment.location_id,
                                    loyalty_card_id: loyaltyCardData.loyalty_card_id,
                                    customer_loyalty_card_id: loyaltyCardData.customer_loyalty_card_id,
                                    customer_id: appointment.client_id[0],
                                    appointment_id: appointment._id,
                                    date: appointment.date,
                                    consume: 1,
                                    createdAt: appointment.createdAt,
                                    updatedAt: appointment.updatedAt,
                                });

                                await newEntry.save();
                            }
                        }
                        else if (existingEntry && existingEntry.createdAt !== appointment.createdAt) {
                            existingEntry.customer_id = appointment.client_id[0];
                            existingEntry.createdAt = appointment.createdAt;
                            await existingEntry.save();
                        }
                    }
                }
            }
        }

        res.status(200).json({ message: 'Reverse entries created successfully' });
    } catch (err) {
        console.error('Error creating reverse entries:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

}


exports.updateQuestionGroups = async function (req, res, next) {
    try {
        // Fetch all questions
        const questionGroups = await QuestionGroup.find({});

        // Iterate through each test
        for (const questionGroup of questionGroups) {
            // Check if the questionGroup has a master_question_id
            if (!questionGroup.master_question_group_id) {
                var getMasterQuestionId = await QuestionGroupService.getMasterGroupId(questionGroup)
                questionGroup.master_question_group_id = getMasterQuestionId;
                // Save the updated question with the master_question_id
                await questionGroup.save();
            }
        }
        // Return all categories with updated master_category_ids
        return res.status(200).json({ questionGroups });

    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master question:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

exports.updateQuestions = async function (req, res, next) {
    try {
        // Fetch all questions
        const questions = await Question.find({});

        // Iterate through each test
        for (const question of questions) {

            // Check if the question has a master_question_id
            if (!question.master_question_id && question.que_group_id) {
                // If the question does not have a master_question_id, find or create a master question
                var masterQuestion = await QuestionGroupService.getQuestionGroup(question.que_group_id)

                question.master_que_group_id = masterQuestion.master_question_group_id
                question.que_group_name = masterQuestion.name


                var getMasterQuestionId = await QuestionService.getMasterQuestionId(question)

                question.master_question_id = getMasterQuestionId;

                // Save the updated question with the master_question_id
                await question.save();
            }
        }

        // Return all categories with updated master_category_ids
        return res.status(200).json({ questions });

    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master question:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


exports.updateCustomParameters = async function (req, res, next) {
    try {
        // Fetch all questions
        const customParameters = await CustomParameter.find({});
        // Iterate through each test
        for (const customParameter of customParameters) {
            // Check if the customParameter has a master_question_id
            if (!customParameter.master_custom_parameter_id) {
                var getMasterCustomParameterId = await CustomParameterService.getMasterCustomParameterId(customParameter)
                customParameter.master_custom_parameter_id = getMasterCustomParameterId;
                // Save the updated question with the master_question_id
                await customParameter.save();
            }
        }
        // Return all categories with updated master_category_ids
        return res.status(200).json({ customParameters });

    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master question:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

exports.updateCronJobParameters = async function (req, res, next) {
    try {
        // Fetch all questions
        const cronJobParameters = await CronjobParameter.find({});
        // Iterate through each test
        for (const cronJobParameter of cronJobParameters) {
            // Check if the cronJobParameter has a master_question_id
            if (!cronJobParameter.master_cronjob_parameter_id) {
                var getMasterCronjobId = await CronjobParameterService.getMasterCronJobParameterId(cronJobParameter)
                cronJobParameter.master_cronjob_parameter_id = getMasterCronjobId;
                // Save the updated question with the master_question_id
                await cronJobParameter.save();
            }
        }
        // Return all categories with updated master_category_ids
        return res.status(200).json({ cronJobParameters });

    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error checking or creating master question:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

exports.updateDiscount = async function (req, res, next) {
    try {
        // Fetch all discounts
        const discounts = await Discount.find({});

        // Iterate through each discount
        for (const discount of discounts) {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0); // Set time to midnight

            const startDate = new Date(discount.start_date);
            startDate.setHours(0, 0, 0, 0); // Set time to midnight

            const endDate = new Date(discount.end_date);
            endDate.setHours(0, 0, 0, 0); // Set time to midnight

            // Check if current date is between start date and end date
            if (currentDate >= startDate && currentDate <= endDate) {
                discount.is_expired = 0; // Not expired
            } else {
                discount.is_expired = 1; // Expired
            }

            // Save the updated discount
            await discount.save();
        }

        // Return all discounts with updated is_expired status
        return res.status(200).json({ discounts });

    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error updating discount status:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

exports.undefinedDiscountWAlog = async function (req, res, next) {
    try {

        var query = { msg_type: "client_birthday", content: { $regex: /undefined/ } }

        var wlogData = await WhatsAppLogService.getWhatsAppLogsSpecific(query);

        var today_date = new Date()
        var date = dateFormat(today_date, "yyyy-mm-dd")

        //wlogData.length = 2;

        for (var i = 0; i < wlogData.length; i++) {
            //var query = { discount_code_type: 'birthday', customer_id: wlogData[i]?.client_id.toString(), discount_code: "", $and: [{ start_date: { $lte: date } }, { end_date: { $gte: date } }], start_date: wlogData[i]?.date } //withour expired

            var wdate = dateFormat(wlogData[i]?.date, "yyyy-mm-dd")

            var query = { discount_code_type: 'birthday', customer_id: wlogData[i]?.client_id.toString(), discount_code: "", start_date: wdate }

            console.log('query', query)

            var discount = await DiscountService.getDiscountOne(query, 'createdAt');
            if (discount) {
                var discount_code = stringGen(6);

                discount.discount_code = discount_code;
                var discount = await DiscountService.updateDiscount(discount)

                var msg_val = wlogData[i].content;

                //console.log('msg_val', msg_val)

                msg_val = msg_val.replace(/undefined/g, discount_code);

                wlogData[i].content = msg_val;
                //console.log('wlogData[i].content', wlogData[i].content)
                await WhatsAppLogService.updateWhatsAppLog(wlogData[i])
            }

        }

        // Return the Admins list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, count: wlogData.length, data: wlogData, message: "Successfully" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

function stringGen(yourNumber) {
    var text = ""
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789"

    for (var i = 0; i < yourNumber; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length))

    return text
}