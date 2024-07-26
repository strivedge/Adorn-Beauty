var jwt = require('jsonwebtoken')
var dateFormat = require('dateformat')
var ObjectId = require('mongodb').ObjectId
var config = require('../config');
const EmailLogService = require('../services/emailLog.service')
const SendEmailSmsService = require('../services/sendEmailSms.service')
const {
    getEmailTemplateData
} = require('../helper')
var AppointmentService = require('../services/appointment.service')
var BuySubscriptionService = require('../services/buySubscription.service');
var CategoryService = require('../services/category.service');
var CompanyService = require('../services/company.service');
var ContentMasterService = require('../services/contentMaster.service');
var ConsultationFormService = require('../services/consultationForm.service');
var CronjobActionService = require('../services/cronjobAction.service');
var CronjobParameterService = require('../services/cronjobParameter.service');
var CustomParameterService = require('../services/customParameter.service');
var CustomParameterSettingService = require('../services/CustomParameterSetting.service')
var EmailTemplateService = require('../services/emailTemplate.service');
var LocationService = require('../services/location.service');
var ModuleService = require('../services/module.service');
var PermissionService = require('../services/permission.service');
var QuestionService = require('../services/question.service');
var QuestionGroupService = require('../services/questionGroup.service');
var ServiceService = require('../services/service.service');
var SubscriptionService = require('../services/subscription.service');
var TestService = require('../services/test.service');
var UserService = require('../services/user.service');
var LocationTimingService = require('../services/locationTiming.service');

// ** Master Services file
var MasterCategoryService = require('../services/masterCategory.service');
var MasterContentMasterService = require('../services/masterContentMaster.service');
var MasterConsultationFormService = require('../services/masterConsultationForm.service')
var MasterCronjobActionService = require('../services/masterCronjobAction.service');
var MasterCronjobParameterService = require('../services/masterCronjobParameter.service');
var MasterCustomParameterService = require('../services/masterCustomParameter.service');
var MasterEmailTemplateService = require('../services/masterEmailTemplate.service');
var MasterQuestionService = require('../services/masterQuestion.service')
var MasterQuestionGroupService = require('../services/masterQuestionGroup.service')
var MasterService = require('../services/masterService.service');
var MasterTestService = require('../services/masterTest.service');
var MasterCustomParameterSettingService = require('../services/masterCustomParameterSetting.service');

var cron = require('node-cron');

const { formatDate, isObjEmpty, getToLowerCase, getDecimalFormat } = require('../helper');

var systemType = process.env?.SYSTEM_TYPE || ""

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getSubscriptions = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (searchText) {
        query['$or'] = [
            { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { validity: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { max_location: { $eq: parseInt(searchText) } },
            { price: { $eq: parseInt(searchText) } }
        ];
    }

    // console.log('getSubscriptions',query)
    try {
        var subscriptions = await SubscriptionService.getSubscriptions(query, parseInt(page), parseInt(limit), order_name, Number(order))
        // Return the Subscriptions list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: subscriptions, message: "Subscriptions recieved successfully!" });
    } catch (e) {
        // console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getSubscription = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var subscription = await SubscriptionService.getSubscription(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: subscription, message: "Subscription recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getSubscriptionsPlan = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var subscriptions = await SubscriptionService.getSubscriptionsPlan(req.body)
        return res.status(200).json({ status: 200, flag: true, data: subscriptions, message: "Subscription plan recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createSubscription = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdSubscription = await SubscriptionService.createSubscription(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdSubscription, message: "Subscription created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateSubscription = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedSubscription = await SubscriptionService.updateSubscription(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedSubscription, message: "Subscription updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeSubscription = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }
    try {
        var deleted = await SubscriptionService.deleteSubscription(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

async function addDefualtDataToLocation(new_location) {
    try {
        // Current Location Category
        var current_category = await CategoryService.getActiveCategories({ company_id: "", location_id: "" });

        // New Location Category before copy
        var new_category = await CategoryService.getActiveCategories({ location_id: new_location });

        // for creating new location Question Group
        if (current_category.length > 0) {
            for (var a = 0; a < current_category.length; a++) {
                current_category[a].location_id = new_location;
                var new_category_id = '';
                if (new_category.length > 0) {
                    var new_cat_ind = new_category.findIndex(x => x.name.trim() == current_category[a].name.trim());
                    if (new_cat_ind == -1) {
                        var createCat = await CategoryService.createCategory(current_category[a]);
                        new_category_id = createCat._id.toString();
                    } else {
                        new_category_id = new_category[new_cat_ind]._id.toString();
                    }
                } else {
                    var createCat = await CategoryService.createCategory(current_category[a]);
                    new_category_id = createCat._id.toString();
                }

                var current_services = await ServiceService.getServicesbyLocation({ location_id: '', category_id: current_category[a]._id.toString() });

                var new_services = await ServiceService.getServicesbyLocation({ location_id: new_location, category_id: new_category_id });

                for (var cq = 0; cq < current_services.length; cq++) {
                    current_services[cq].location_id = new_location;
                    current_services[cq].category_id = new_category_id;
                    current_services[cq].service_type_group_id = "";

                    var new_ser_ind = new_services.findIndex(x => x.name.trim() == current_services[cq].name.trim());
                    if (new_ser_ind == -1) {
                        if (current_services[cq].test_id != '') {
                            var test = await TestService.getTest(current_services[cq].test_id);
                            if (test && test.name != '') {
                                var test_name = test.name;
                                var test_query = { name: test_name, location_id: new_location };
                                var new_test = await TestService.getSingleTestByName(test_query);
                                if (new_test && new_test.name != '') {
                                    current_services[cq].test_id = new_test._id;
                                } else {
                                    test.location_id = new_location
                                    var new_test = await TestService.createTest(test);
                                    current_services[cq].test_id = new_test._id;
                                }
                            }
                        }

                        var createServices = await ServiceService.createService(current_services[cq]);
                    }
                }
            }
        }

        return true;
    } catch (e) {
        console.log(e)
        return link;
    }
}

/* Default role permission company level */
const createDefaultRoleCompanyLevelPermission = async (companyItem = null) => {
    try {
        var flag = false;
        var data = [];
        var message = "Something went wrong!";
        if (companyItem && companyItem?._id) {
            var query = { company_id: null };
            var permissions = await PermissionService.getPermissionss(query);
            if (permissions && permissions?.length) {
                for (let i = 0; i < permissions.length; i++) {
                    let item = permissions[i];
                    if (item && item?._id) {
                        item.company_id = companyItem._id;

                        await PermissionService.createPermission(item);
                    }
                }
            }

            flag = true;
            message = "Company level default role permission created!";
        }

        return {
            flag: flag,
            data: data,
            message: message
        }
    } catch (error) {
        console.log("createDefaultRoleCompanyLevelPermission Error >>> ", error);
        return { flag: false, message: error.message }
    }
}
/* /Default role permission company level */

/* Content master default data */
const createDefaultContentMasterData = async (companyItem = null, locationItem = null) => {
    try {
        var contentMasters = [];
        var masterContentMasters = await MasterContentMasterService.getMasterContentMastersSimple({});
        if (masterContentMasters && masterContentMasters?.length) {
            for (let i = 0; i < masterContentMasters.length; i++) {
                let item = masterContentMasters[i];
                item.company_id = companyItem?._id || "";
                item.master_content_master_id = item?._id || null;

                var createdComData = await ContentMasterService.createContentMaster(item);
                if (createdComData && createdComData?._id) {
                    contentMasters.push(createdComData)
                }

                item.location_id = locationItem?._id || "";
                var createdLocData = await ContentMasterService.createContentMaster(item);
                if (createdLocData && createdLocData?._id) {
                    contentMasters.push(createdLocData)
                }
            }
        }

        return {
            flag: true,
            data: contentMasters,
            message: "Content master default data created successfully!"
        }
    } catch (error) {
        console.log("createDefaultContentMasterData Error >>> ", error);
        return { flag: false, message: error.message }
    }
}
/* /Content master default data */

/* Cron Job Action default data */
const createDefaultCronJobActionData = async (companyItem = null, locationItem = null) => {
    try {
        var cronJobActions = [];
        var masterCronJobActions = await MasterCronjobActionService.getMasterCronjobActionsSimple({});
        if (masterCronJobActions && masterCronJobActions?.length) {
            for (let i = 0; i < masterCronJobActions.length; i++) {
                let item = masterCronJobActions[i];
                item.company_id = companyItem?._id || "";
                item.master_cronjob_action_id = item?._id || null;

                var createdComData = await CronjobActionService.createCronjobAction(item);
                if (createdComData && createdComData?._id) {
                    cronJobActions.push(createdComData)
                }

                item.location_id = locationItem?._id || "";
                var createdLocData = await CronjobActionService.createCronjobAction(item);
                if (createdLocData && createdLocData?._id) {
                    cronJobActions.push(createdLocData)
                }
            }
        }

        return {
            flag: true,
            data: cronJobActions,
            message: "Cron job action default data created successfully!"
        }
    } catch (error) {
        console.log("createDefaultCronJobActionData Error >>> ", error);
        return { flag: false, message: error.message }
    }
}
/* /Cron Job Action default data */

/* Cron Job Parameter default data */
const createDefaultCronJobParameterData = async (companyItem = null, locationItem = null) => {
    try {
        var cronJobParameters = [];
        var masterCronjobParameters = await MasterCronjobParameterService.getMasterCronjobParametersSimple({});
        if (masterCronjobParameters && masterCronjobParameters?.length) {
            for (let i = 0; i < masterCronjobParameters.length; i++) {
                let item = masterCronjobParameters[i];
                item.company_id = companyItem?._id || "";
                item.master_cronjob_parameter_id = item?._id || null;
                if (item?.all_online_services) {
                    item.all_online_services = item.all_online_services;
                }

                var createdComData = await CronjobParameterService.createCronjobParameter(item);
                if (createdComData && createdComData?._id) {
                    cronJobParameters.push(createdComData)
                }

                item.location_id = locationItem?._id || "";
                var createdLocData = await CronjobParameterService.createCronjobParameter(item);
                if (createdLocData && createdLocData?._id) {
                    cronJobParameters.push(createdLocData)
                }
            }
        }

        return {
            flag: true,
            data: cronJobParameters,
            message: "Cron job parameter default data created successfully!"
        }
    } catch (error) {
        console.log("createDefaultCronJobParameterData Error >>> ", error);
        return { flag: false, message: error.message }
    }
}
/* /Cron Job Parameter default data */

exports.setCustomParametersetting = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var companyItem = { _id: "60ba73c1e0f95f94d2c2e368" };
    try {
        //var customParameter = await createDefaultCustomParameterSettingData(companyItem, null)
        return res.status(200).json({ status: 200, flag: true, data: customParameter, message: "Custom parameter recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


/* Custom Parameter Setting default data */
const createDefaultCustomParameterSettingData = async (companyItem = null, locationItem = null) => {
    try {
        var customParameters = [];
        var masterCustomParameters = await MasterCustomParameterSettingService.getMasterCustomParameterSettingSimple({});
        if (masterCustomParameters && masterCustomParameters?.length) {
            for (let i = 0; i < masterCustomParameters.length; i++) {
                let item = masterCustomParameters[i];
                item.company_id = companyItem?._id || "";
                item.master_custom_parameter_id = item?._id || null;

                var query = { category: item?.category, company_id: item.company_id, location_id: null }

                item.location_id = null;

                var data = {
                    company_id: item?.company_id,
                    location_id: null,
                    master_custom_parameter_id: item?.master_custom_parameter_id,
                    title: item?.title,
                    category: item?.category,
                    desc: item?.desc,
                    formData: item?.formData
                }

                updateCustomParameter = await CustomParameterSettingService.createOrUpdateCustomParameterSetting(query, data)

                if (locationItem?._id) {
                    var query = { category: item?.category, company_id: item.company_id, location_id: locationItem?._id }

                    data.location_id = locationItem?._id || "";

                    var createdLocData = await CustomParameterSettingService.createOrUpdateCustomParameterSetting(query, data);
                }
            }
        }

        return {
            flag: true,
            data: customParameters,
            message: "Custom parameter setting default data created successfully!"
        }
    } catch (error) {
        console.log("createDefaultCustomParameterSettingData Error >>> ", error);
        return { flag: false, message: error.message }
    }
}

/* Custom Parameter default data */
const createDefaultCustomParameterData = async (companyItem = null, locationItem = null) => {
    try {
        var customParameters = [];
        var masterCustomParameters = await MasterCustomParameterService.getMasterCustomParametersSimple({});
        if (masterCustomParameters && masterCustomParameters?.length) {
            for (let i = 0; i < masterCustomParameters.length; i++) {
                let item = masterCustomParameters[i];
                item.company_id = companyItem?._id || "";
                item.master_custom_parameter_id = item?._id || null;

                var createdComData = await CustomParameterService.createCustomParameter(item);
                if (createdComData && createdComData?._id) {
                    customParameters.push(createdComData);
                }

                item.location_id = locationItem?._id || "";
                var createdLocData = await CustomParameterService.createCustomParameter(item);
                if (createdLocData && createdLocData?._id) {
                    customParameters.push(createdLocData);
                }
            }
        }

        return {
            flag: true,
            data: customParameters,
            message: "Custom parameter default data created successfully!"
        }
    } catch (error) {
        console.log("createDefaultCustomParameterData Error >>> ", error);
        return { flag: false, message: error.message }
    }
}
/* /Custom Parameter default data */

/* Email template default data */
const createDefaultEmailTemplateData = async (companyItem = null, locationItem = null) => {
    try {
        var emailTemplates = [];
        var masterEmailTemplates = await MasterEmailTemplateService.getMasterEmailTemplatesSimple({});
        if (masterEmailTemplates && masterEmailTemplates?.length) {
            for (let i = 0; i < masterEmailTemplates.length; i++) {
                let item = masterEmailTemplates[i];
                item.company_id = companyItem?._id || "";
                item.master_email_template_id = item?._id || null;

                var createdComData = await EmailTemplateService.createEmailTemplate(item)
                if (createdComData && createdComData?._id) {
                    emailTemplates.push(createdComData)
                }

                item.location_id = locationItem?._id || "";
                var createdLocData = await EmailTemplateService.createEmailTemplate(item)
                if (createdLocData && createdLocData?._id) {
                    emailTemplates.push(createdLocData)
                }
            }
        }

        return {
            flag: true,
            data: emailTemplates,
            message: "Email template default data created successfully!"
        }
    } catch (error) {
        console.log("createDefaultEmailTemplateData Error >>> ", error);
        return { flag: false, message: error.message }
    }
}
/* /Email template default data */

/* Catalog default data */
const createDefaultCatalogData = async (companyItem = null, locationItem = null) => {
    try {
        var categories = [];
        var tests = [];
        var services = [];

        var masterCategories = await MasterCategoryService.getMasterCategoriesSimple({ status: 1 });
        if (masterCategories && masterCategories?.length) {
            for (let i = 0; i < masterCategories.length; i++) {
                let item = masterCategories[i];
                item.company_id = companyItem?._id || "";
                item.location_id = locationItem?._id || "";
                item.master_category_id = item?._id || null;

                var createdCategory = await CategoryService.createCategory(item);
                if (createdCategory && createdCategory?._id) {
                    categories.push(createdCategory);
                }
            }
        }

        var masterTests = await MasterTestService.getMasterTestsSimple({ status: 1 });
        if (masterTests && masterTests?.length) {
            for (let i = 0; i < masterTests.length; i++) {
                let item = masterTests[i];
                item.company_id = companyItem?._id || "";
                item.location_id = locationItem?._id || "";
                item.master_test_id = item?._id || null;

                var createdTest = await TestService.createTest(item);
                if (createdTest && createdTest?._id) {
                    tests.push(createdTest)
                }
            }
        }

        var masterServices = await MasterService.getMasterServicesSimple({ status: 1 });
        if (masterServices && masterServices?.length) {
            for (let i = 0; i < masterServices.length; i++) {
                let item = masterServices[i];
                item.company_id = companyItem?._id || "";
                item.location_id = locationItem?._id || "";
                item.master_category_id = item?.master_category_id || null;
                item.master_test_id = item?.master_test_id || null;
                item.master_service_id = item?._id || null;

                if (item?.master_category_id) {
                    var index = categories.findIndex((x) => x.master_category_id?.toString() == item.master_category_id?.toString())
                    if (index != -1) {
                        item.category_id = categories[index]?._id || ""
                    }
                }

                if (item?.master_test_id) {
                    var index = tests.findIndex((x) => x.master_test_id?.toString() == item.master_test_id?.toString())
                    if (index != -1) {
                        item.test_id = tests[index]?._id || ""
                    }
                }

                var createdService = await ServiceService.createService(item);
                if (createdService && createdService?._id) {
                    services.push(createdService)
                }
            }
        }

        return {
            flag: true,
            categories: categories,
            tests: tests,
            services: services,
            message: "Catalog default data created successfully!"
        }
    } catch (error) {
        console.log("createDefaultCatalogData Error >>> ", error)
        return { flag: false, message: error.message }
    }
}
/* /Catalog default data */

/* Consultation default data */
const createDefaultConsultationData = async (companyItem = null, locationItem = null) => {
    try {
        var questionGroups = [];
        var questions = [];
        var consultationForms = [];

        var categories = [];
        var services = [];
        if (locationItem && locationItem?._id) {
            categories = await CategoryService.getCategoriesSimple({ location_id: locationItem._id });
            services = await ServiceService.getServicesSimple({ location_id: locationItem._id });
        }

        var masterQuestionGroups = await MasterQuestionGroupService.getMasterQuestionGroupsSimple({ status: 1 });
        if (masterQuestionGroups && masterQuestionGroups?.length) {
            for (let i = 0; i < masterQuestionGroups.length; i++) {
                let item = masterQuestionGroups[i];
                item.company_id = companyItem?._id || "";
                item.location_id = locationItem?._id || "";
                item.master_question_group_id = item?._id || null;

                var createdQuestionGroup = await QuestionGroupService.createQuestionGroup(item);
                if (createdQuestionGroup && createdQuestionGroup?._id) {
                    questionGroups.push(createdQuestionGroup);
                }
            }
        }

        var masterQuestions = await MasterQuestionService.getMasterQuestionsSimple({ status: 1 });
        if (masterQuestions && masterQuestions?.length) {
            for (let i = 0; i < masterQuestions.length; i++) {
                let item = masterQuestions[i];
                item.company_id = companyItem?._id || "";
                item.location_id = locationItem?._id || "";
                item.master_question_id = item?._id || null;
                item.master_que_group_id = item?.master_que_group_id || null;

                var createdQuestion = await QuestionService.createQuestion(item)
                if (createdQuestion && createdQuestion?._id) {
                    questions.push(createdQuestion)
                }
            }
        }

        var masterConsultationForms = await MasterConsultationFormService.getMasterConsultationFormsSimple({ status: 1 });
        if (masterConsultationForms && masterConsultationForms?.length) {
            for (let i = 0; i < masterConsultationForms.length; i++) {
                let item = masterConsultationForms[i];
                item.company_id = companyItem?._id || "";
                item.location_id = locationItem?._id || "";
                item.master_consultation_form_id = item?._id || null;
                if (item?.master_category_ids && item.master_category_ids?.length) {
                    var masterCategoryIds = []
                    var categoryIds = null
                    masterCategoryIds = item.master_category_ids.map((category) => {
                        return category?.toString() || ""
                    })

                    masterCategoryIds = masterCategoryIds.filter((x) => x != "")
                    if (masterCategoryIds && masterCategoryIds?.length) {
                        var categoryData = categories.filter((x) => masterCategoryIds.includes(x?.master_category_id?.toString()))
                        if (categoryData && categoryData?.length) {
                            categoryIds = categoryData.map((cat) => {
                                return cat?._id || cat
                            })
                        }
                    }

                    item.category_id = categoryIds || null;
                    item.master_category_ids = item.master_category_ids || null;
                }

                if (item?.master_service_ids && item.master_service_ids?.length) {
                    var masterServiceIds = []
                    var serviceIds = null
                    masterServiceIds = item.master_service_ids.map((service) => {
                        return service?.toString() || ""
                    })

                    masterServiceIds = masterServiceIds.filter((x) => x != "")
                    if (masterServiceIds && masterServiceIds?.length) {
                        var serviceData = services.filter((x) => masterServiceIds.includes(x?.master_service_id?.toString()))
                        if (serviceData && serviceData?.length) {
                            serviceIds = serviceData.map((ser) => {
                                return ser?._id || ser
                            })
                        }
                    }

                    item.service_id = serviceIds || null;
                    item.master_service_ids = item?.master_service_ids || null;
                }

                if (item?.masterGroupData && item.masterGroupData?.length) {
                    var groupData = []
                    for (let i = 0; i < item.masterGroupData.length; i++) {
                        let group = item.masterGroupData[i];
                        if (group && group?.group_id) {
                            var questionGroup = questionGroups.find((x) => x.master_question_group_id?.toString() == group.group_id?.toString())
                            if (questionGroup && questionGroup?._id) {
                                var question = questions.filter((x) => x.master_que_group_id?.toString() == group.group_id?.toString())

                                groupData.push({
                                    group_id: questionGroup._id,
                                    group_data: {
                                        _id: questionGroup._id,
                                        name: questionGroup?.name || "",
                                        description: questionGroup?.description || ""
                                    },
                                    question_data: question
                                })
                            }
                        }
                    }

                    item.groupData = groupData || null;
                }

                var createdData = await ConsultationFormService.createConsultationForm(item);
                if (createdData && createdData?._id) {
                    consultationForms.push(createdData)
                }
            }
        }

        return {
            flag: true,
            questionGroups: questionGroups,
            questions: questions,
            consultationForms: consultationForms,
            message: "Consultation default data created successfully!"
        }
    } catch (error) {
        console.log("createDefaultConsultationData Error >>> ", error)
        return { flag: false, message: error.message }
    }
}
/* /Consultation default data */

const createLocationTimings = async (location_id = '') => {
    try {
        var days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        if (location_id) {

            if (location_id) {
                for (var i = 0; i < days.length; i++) {
                    var timingData = {
                        location_id: location_id,
                        day: days[i],
                        start_time: '09:00',
                        end_time: '17:45',
                    }

                    var checkTiming = await LocationTimingService.getSpecificLocationTimings(location_id, days[i]);
                    if (checkTiming && checkTiming._id) {
                        timingData._id = checkTiming._id;
                        var updateLocationTiming = await LocationTimingService.updateLocationTiming(timingData)
                    } else {
                        var createdLocationTiming = await LocationTimingService.createLocationTiming(timingData)
                    }
                }
            }
        }

        return { flag: true, message: 'Location timings created successfully!' }
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return { flag: false, message: e.message }
    }
}

const getUserDetails = async (user_id = '') => {
    try {
        if (user_id) {
            var loginUser = await UserService.getUser(user_id)

            if (loginUser.role_id && loginUser.role_id != '') {
                var query = { role_id: loginUser.role_id }
                if (systemType == "general" && loginUser?.company_id) {
                    query.company_id = loginUser.company_id;
                }

                var permission = await PermissionService.getPermissionss(query);
                if (permission && permission?.length) {
                    loginUser.permission = permission
                }

                if (loginUser.company_id && loginUser.company_id != '') {
                    var company = await CompanyService.getCompany(loginUser.company_id)
                    if (company.domain && company.domain != '') {
                        loginUser.domain = company.domain
                    }
                }

                var subscription = { subscription_id: { module: [] } }
                var company_id = loginUser.company_id
                var location_id = loginUser.location_id
                if (loginUser.locations?.length > 0) {
                    location_id = loginUser.locations[0]
                }

                if (location_id) {
                    var location = await LocationService.getLocation(location_id)
                    company_id = location?.company_id
                }

                if (company_id) {
                    var TodayDate = dateFormat(new Date(), "yyyy-mm-dd")
                    var subsQuery = {
                        company_id: ObjectId(company_id.toString()),
                        status: 1,
                    }

                    subsQuery['$or'] = [
                        { $and: [{ start_date: { $lte: TodayDate } }, { end_date: { $gte: TodayDate } }] },
                        { $and: [{ start_date: { $lte: TodayDate } }, { end_date: { $in: ["", null] } }] },
                        { $and: [{ start_date: { $in: ["", null] } }, { end_date: { $in: ["", null] } }] }
                    ]

                    var subscription_data = await BuySubscriptionService.getSubscriptionPackCompany(subsQuery);
                    if (subscription_data) {
                        subscription = subscription_data
                    }
                }
                loginUser.subscription = subscription
            }

            return loginUser;
        }

        return null;

    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return false;
    }

}

exports.userAutoLogin = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        console.log('req body', req.body)
        var token1 = null;
        var loginUser = {};

        var userId = "";
        var companyId = "";
        var roleId = "";


        userId = req?.userId || "";
        companyId = req?.company_id || "";
        roleId = req?.role_id || "";
        console.log('userId', userId)

        loginUser = await getUserDetails(userId)

        token1 = jwt.sign({
            id: userId,
            company_id: companyId,
            role_id: roleId || ""
        }, process.env.SECRET, {
            expiresIn: 604800 // expires in 7 days
        })

        return res.status(200).json({ status: 200, flag: true, data: loginUser, token: token1, message: "Succesfully Login" })
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Invalid Token" })
    }

}

// for Quick Contact after appointment booked
const sendWelcomeMail = async function (data) {
    // Id is necessary for the update
    try {

        var toMail = {}
        toMail['site_url'] = process.env?.API_URL || ""
        toMail['link_url'] = process.env?.SITE_URL || ""

        var to = data?.email || ""
        var name = data?.name || ""
        var password = data?.password || ''
        var message = data?.message ||
            `Thank you for purchasing a subscription to Appoingem! We're thrilled to have you as part of our community.
          Your subscription unlocks exclusive content and features designed to enhance your experience.
            Enjoy your journey with us, and welcome aboard!`
        var html = ""
        var company_website = ""
        var company_logo = ""
        var company_id = data.company_id;
        var location = ''
        toMail['name'] = name
        toMail['message'] = message
        toMail['email'] = data.email
        toMail['password'] = password
        toMail['locationOrCompany'] = data.name
        toMail['company_website'] = company_website
        toMail['company_logo'] = company_logo

        var subject = " Welcome to " + name + "Subscription!";
        var temFile = "welcome_mail.hjs";
        var fileType = "welcome";


        var sendEmail = SendEmailSmsService.sendMailAwait(to, name, subject, temFile, html, toMail, 'transaction', location?._id, location?.company_id)

        var emailData = {
            subject: subject,
            company_id: company_id,
            location_id: data?.location_id,
            company_name: name,
            type: "single",
            file_type: fileType,
            temp_file: temFile,
            html: '',
            data: toMail,
            date: Date(),
            to_email: to,
            status: "Sent",
            response: null,
            response_status: 'Sent',
            email_type: 'welcome'
        }

        if (sendEmail && sendEmail?.status) {
            emailData.response = sendEmail.response;
            emailData.response_status = sendEmail.status;
            emailData.status = sendEmail.status;
        }


        var eLog = EmailLogService.createEmailLog(emailData)

        return null
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return false;
    }
}

/* Company subscriptions */
exports.createNewSubscription = async function (req, res, next) {
    try {
        // console.log(req.body)
        var companyData = req.body?.company_data || null;
        var locationData = req.body?.location_data || null;
        var subscriptionData = req.body?.subscription_data || null;
        var isDefaultData = req.body?.is_default_data || false;
        // console.log("createNewSubscription >>> ", req.body)

        var throwError = false;
        var companyItem = null;
        var locationItem = null;
        var companyUserAdmin = null;
        var locationUserAdmin = null;
        var subscriptionItem = null;
        var flag = false;
        var message = "Something went wrong!";
        if (!companyData) {
            throwError = true;
            message = "Company data must be present!";
        } else if (companyData && isObjEmpty(companyData)) {
            throwError = true;
            message = "Company data must be present!";
        } else if (!locationData) {
            throwError = true;
            message = "Location data must be present!";
        } else if (locationData && isObjEmpty(locationData)) {
            throwError = true;
            message = "Location data must be present!";
        } else if (!subscriptionData) {
            throwError = true;
            message = "Subscription data must be present!";
        } else if (subscriptionData && isObjEmpty(subscriptionData)) {
            throwError = true;
            message = "Subscription data must be present!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: message
            });
        }

        var token1 = '';
        var loginUser = {};

        if (companyData && companyData?.email) {
            var companyUserData = {
                name: companyData?.person_name,
                email: companyData?.email,
                mobile: companyData?.contact_number,
                password: companyData?.password,
                role_id: process.env?.ORG_ADMIN_ROLE || '6088fe1f7dd5d402081167ee', // Company admin role
            }
            // Create Company Admin           
            var createdCompanyAdmin = await UserService.createUser(companyUserData) || null;
            if (createdCompanyAdmin && createdCompanyAdmin._id) {
                companyData.user_id = createdCompanyAdmin._id;
            }
            companyData.show_to_customer = 1;
            var createdCompany = await CompanyService.createCompany(companyData);
            if (createdCompany && createdCompany._id) {
                companyData.company_id = createdCompany._id;
                sendWelcomeMail(companyData);
                var userData = {
                    _id: createdCompanyAdmin._id,
                    company_id: createdCompany._id,
                }

                createdCompanyAdmin = await UserService.updateUser(userData);
            }

            companyItem = createdCompany;
            companyUserAdmin = createdCompanyAdmin;

            token1 = jwt.sign({
                id: createdCompanyAdmin?._id,
                company_id: createdCompany?._id || "",
                role_id: createdCompanyAdmin?.role_id || ""
            }, process.env.SECRET, {
                expiresIn: 604800 // expires in 7 days
            })

            if (locationData && locationData?.email) {
                var locationUserData = {
                    name: locationData?.contact_name,
                    email: locationData?.email,
                    mobile: locationData?.contact_number,
                    password: locationData?.password,
                    company_id: createdCompany?._id || null,
                    role_id: process.env?.BRANCH_ADMIN_ROLE || '608185683cf3b528a090b5ad', // Location Admin role
                }

                // Create Location Admin           
                var createdLocationAdmin = await UserService.createUser(locationUserData);
                if (createdLocationAdmin && createdLocationAdmin._id) {
                    locationData.user_id = createdLocationAdmin._id;
                }

                locationData.admin_status = 1;
                locationData.company_id = createdCompany?._id || null;

                var createdLocation = await LocationService.createLocation(locationData);
                if (createdLocation && createdLocation._id) {
                    locationUserData.location_id = createdLocation._id;
                    locationUserData.name = createdLocation.contact_name;
                    sendWelcomeMail(locationUserData);
                    var userData = {
                        _id: createdLocationAdmin._id,
                        location_id: createdLocation._id,
                        locations: [createdLocation._id]
                    }

                    createdLocationAdmin = await UserService.updateUser(userData)
                    await createLocationTimings(createdLocation._id)
                }

                locationItem = createdLocation;
                locationUserAdmin = createdLocationAdmin;

                var subsData = {
                    company_id: companyItem?._id || null,
                    max_location: subscriptionData?.max_location || 0,
                    amount: subscriptionData?.price || 0,
                    response: subscriptionData || null,
                    status: 1
                }

                if (subscriptionData?.is_check_all_modules) {
                    var modules = await ModuleService.getModules({});
                    if (modules && modules?.length) {
                        subsData.module_ids = modules.map((item) => item._id);
                    }
                } else if (subscriptionData?.module_ids && subscriptionData.module_ids?.length) {
                    subsData.module_ids = subscriptionData.module_ids;
                }

                if (subscriptionData?.plan_type) {
                    subsData.type = getToLowerCase(subscriptionData.plan_type);
                }

                if (subscriptionData?.duration_type) {
                    subsData.validity = getToLowerCase(subscriptionData.duration_type);
                }

                if (subscriptionData?.start_date) {
                    subsData.start_date = formatDate(subscriptionData.start_date, "YYYY-MM-DD");
                }

                if (subscriptionData?.end_date) {
                    subsData.end_date = formatDate(subscriptionData.end_date, "YYYY-MM-DD");
                }

                subscriptionItem = await BuySubscriptionService.createBuySubscription(subsData);
                if (subscriptionItem && subscriptionItem?._id) {
                    subscriptionItem = await BuySubscriptionService.getBuySubscriptionOne({ _id: subscriptionItem._id });
                }

                await createDefaultRoleCompanyLevelPermission(companyItem);
                await createDefaultContentMasterData(companyItem, locationItem);
                await createDefaultCronJobActionData(companyItem, locationItem);
                //await createDefaultCronJobParameterData(companyItem, locationItem);
                //await createDefaultCustomParameterData(companyItem, locationItem);
                await createDefaultCustomParameterSettingData(companyItem, locationItem);
                await createDefaultEmailTemplateData(companyItem, locationItem);

                if (isDefaultData) {
                    await createDefaultCatalogData(companyItem, locationItem);
                    await createDefaultConsultationData(companyItem, locationItem);
                }

                flag = true
                message = "Subscription created successfully!"
            }
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            token: token1,
            companyItem: companyItem,
            locationItem: locationItem,
            companyAdmin: companyUserAdmin,
            locationAdmin: locationUserAdmin,
            subscriptionItem: subscriptionItem,
            message: message
        })
    } catch (e) {
        console.log("createNewSubscription Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.upgradeCompanySubscription = async function (req, res, next) {
    try {
        var companyId = req.body?.company_id || ""
        var subscriptionData = req.body?.subscription_data || null;

        var subscriptionItem = null;

        var throwError = false;
        var flag = false;
        var message = "Something went wrong!";

        if (!companyId) {
            throwError = true;
            message = "Company Id must be present!";
        } else if (!subscriptionData) {
            throwError = true;
            message = "Subscription data must be present!";
        } else if (subscriptionData && isObjEmpty(subscriptionData)) {
            throwError = true;
            message = "Subscription data must be present!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: message
            });
        }

        var subsData = {
            company_id: companyId,
            max_location: subscriptionData?.max_location || 0,
            amount: subscriptionData?.price || 0,
            response: subscriptionData || null,
            status: 0
        }

        if (subscriptionData?.is_check_all_modules) {
            var modules = await ModuleService.getModules({});
            if (modules && modules?.length) {
                subsData.module_ids = modules.map((item) => item._id);
            }
        } else if (subscriptionData?.module_ids && subscriptionData.module_ids?.length) {
            subsData.module_ids = subscriptionData.module_ids;
        }

        if (subscriptionData?.plan_type) {
            subsData.type = getToLowerCase(subscriptionData.plan_type);
        }

        if (subscriptionData?.duration_type) {
            subsData.validity = getToLowerCase(subscriptionData.duration_type);
        }

        if (subscriptionData?.start_date) {
            subsData.start_date = formatDate(subscriptionData.start_date, "YYYY-MM-DD");
        }

        if (subscriptionData?.end_date) {
            subsData.end_date = formatDate(subscriptionData.end_date, "YYYY-MM-DD");
        }

        subscriptionItem = await BuySubscriptionService.createBuySubscription(subsData);
        if (subscriptionItem && subscriptionItem?._id) {
            // await BuySubscriptionService.updateMultipleBuySubscriptions({ company_id: { $in: [companyId] }, _id: { $ne: subscriptionItem._id }, status: 1 }, { status: 0 });

            subscriptionItem = await BuySubscriptionService.getBuySubscription({ _id: subscriptionItem._id });

            flag = true;
            message = "Company subscription upgraded successfully!";
        }

        return res.status(200).json({
            status: 200,
            flag: flag,
            subscriptionItem: subscriptionItem,
            message: message
        })
    } catch (e) {
        console.log("upgradeCompanySubscription Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
/* /Company subscriptions */

/* Handle company subscription Active/InActive */
exports.manageCompanySubscriptionUser = async function (req, res, next) {
    try {
        var companyIds = req.body?.company_ids || [];
        var status = req.body?.status || 0;

        var throwError = false;
        var message = "Something went wrong!";
        if (!companyIds || companyIds?.length == 0) {
            throwError = true;
            message = "Company Ids must be present!";
        } else if (!(companyIds instanceof Array)) {
            throwError = true;
            message = "Company Ids must be an array!";
        } else if (!req.body.hasOwnProperty('status')) {
            throwError = true;
            message = "Status must be present!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: message
            });
        }

        var companyQuery = { _id: { $in: companyIds } }
        var locationQuery = { company_id: { $in: companyIds } }
        var userQuery = { company_id: { $in: companyIds } }
        var companies = await CompanyService.updateMultipleCompanies(companyQuery, { status });
        var locations = await LocationService.updateMultipleLocations(locationQuery, { status });
        var users = await UserService.updateMultipleUsers(userQuery, { status });

        return res.status(200).json({
            status: 200,
            flag: true,
            message: "Companies subscription managed successfully!"
        })
    } catch (e) {
        console.log("manageCompanySubscriptionUser Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
/* /Handle company subscription Active/InActive */

/* Company commission charge */
exports.getCompanyBookingCommissionCharge = async function (req, res, next) {
    try {
        var companyIds = req.body?.company_ids || [];
        var startDate = req.body?.start_date || "";
        var endDate = req.body?.end_date || "";

        var throwError = false;
        var message = "Something went wrong!"
        if (!companyIds || companyIds?.length == 0) {
            throwError = true;
            message = "Company ids must be present!";
        } else if (!(companyIds instanceof Array)) {
            throwError = true;
            message = "Company ids must be an array!";
        } else if (!startDate) {
            throwError = true;
            message = "Start date must be present!";
        } else if (!endDate) {
            throwError = true;
            message = "End date must be present!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: message
            })
        }

        if (startDate) {
            startDate = new Date(startDate);
            startDate = new Date(startDate.setHours(0, 0, 0, 0));
        }

        if (endDate) {
            endDate = new Date(endDate);
            endDate = new Date(endDate.setHours(23, 59, 59, 999));
        }

        var data = null;
        var query = { _id: { $in: companyIds } };
        var companies = await CompanyService.getCompaniesOne(query);
        if (companies && companies?.length) {
            data = { detail: [] };
            var totalAmt = 0;

            for (let i = 0; i < companies.length; i++) {
                var comApmtTotalAmt = 0;
                let companyItem = companies[i];
                if (companyItem && companyItem._id) {
                    var itemData = {
                        company_id: companyItem._id,
                        company: {
                            _id: companyItem._id,
                            name: companyItem?.name,
                            email: companyItem?.email,
                            contact_number: companyItem?.contact_number,
                            domain: companyItem?.domain
                        }
                    };

                    var locations = await LocationService.getLocationsOne({ company_id: companyItem._id });
                    if (locations && locations?.length) {
                        itemData.locations = [];

                        for (let j = 0; j < locations.length; j++) {
                            var locApmtTotalAmt = 0;
                            let locationItem = locations[j];
                            if (locationItem && locationItem?._id) {
                                var apmtQuery = { location_id: locationItem._id, booking_status: "complete" };
                                apmtQuery['date'] = { $gte: startDate, $lt: endDate };
                                var appointments = await AppointmentService.getAppointmentsOne(apmtQuery);
                                if (appointments && appointments?.length) {
                                    appointments.map((apmt) => {
                                        totalAmt += apmt?.total_price || 0;
                                        comApmtTotalAmt += apmt?.total_price || 0;
                                        locApmtTotalAmt += apmt?.total_price || 0;
                                    })
                                }

                                itemData.locations.push({
                                    location: {
                                        _id: locationItem._id,
                                        name: locationItem.name,
                                        email: locationItem.email,
                                        contact_name: locationItem.contact_name,
                                        contact_number: locationItem.contact_number,
                                    },
                                    appointments,
                                    total_amount: getDecimalFormat(locApmtTotalAmt)
                                })
                            }
                        }
                    }

                    itemData.total_amount = getDecimalFormat(comApmtTotalAmt);
                    data.detail.push(itemData);
                }
            }

            data.total_amount = getDecimalFormat(totalAmt);
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: data,
            message: "Companies booking commission received successfully!"
        })
    } catch (e) {
        console.log("getCompanyBookingCommissionCharge Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
/* /Company commission charge */

/* Handle Suspend/Enable Company and Subscription */
exports.manageSuspendEnableCompanySubscription = async function (req, res, next) {
    try {
        var companyId = req.body?.company_id || "";
        var status = req.body?.status || 0;
        var newPlan = Number(req.body?.new_plan || 0);
        var subscriptionData = req.body?.subscription_data || null;

        var throwError = false;
        var message = "Something went wrong!";
        if (!companyId) {
            throwError = true;
            message = "Company Id must be present!";
        } else if (!req.body.hasOwnProperty('status')) {
            throwError = true;
            message = "Status must be present!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: message
            });
        }

        var company = await CompanyService.updateCompany({ _id: companyId, status });
        if (company && company?._id) {
            var locationQuery = { company_id: { $in: companyId } }
            var userQuery = { company_id: { $in: companyId } }
            var locations = await LocationService.updateMultipleLocations(locationQuery, { status });
            var users = await UserService.updateMultipleUsers(userQuery, { status });

            var newSubscription = null;
            var subscriptionStatus = status;
            var currentSubscription = await BuySubscriptionService.getBuySubscriptionOne({ company_id: companyId }, 'createdAt', '-1');

            if (newPlan) {
                subscriptionStatus = 0;

                var subsData = {
                    company_id: companyId,
                    max_location: subscriptionData?.max_location || 0,
                    amount: subscriptionData?.price || 0,
                    response: subscriptionData || null,
                    status: 1
                }

                if (subscriptionData?.is_check_all_modules) {
                    var modules = await ModuleService.getModules({});
                    if (modules && modules?.length) {
                        subsData.module_ids = modules.map((item) => item._id);
                    }
                } else if (subscriptionData?.module_ids && subscriptionData.module_ids?.length) {
                    subsData.module_ids = subscriptionData.module_ids;
                }

                if (subscriptionData?.plan_type) {
                    subsData.type = getToLowerCase(subscriptionData.plan_type);
                }

                if (subscriptionData?.duration_type) {
                    subsData.validity = getToLowerCase(subscriptionData.duration_type);
                }

                if (subscriptionData?.start_date) {
                    subsData.start_date = formatDate(subscriptionData.start_date, "YYYY-MM-DD");
                }

                if (subscriptionData?.end_date) {
                    subsData.end_date = formatDate(subscriptionData.end_date, "YYYY-MM-DD");
                }

                newSubscription = await BuySubscriptionService.createBuySubscription(subsData);
                if (newSubscription && newSubscription?._id) {
                    newSubscription = await BuySubscriptionService.getBuySubscriptionOne({ _id: newSubscription._id });
                }
            }

            if (currentSubscription && currentSubscription?._id) {
                await BuySubscriptionService.updateBuySubscription({ _id: currentSubscription?._id, status: subscriptionStatus });
            }

            return res.status(200).json({
                status: 200,
                flag: true,
                company: company,
                new_subscription: newSubscription,
                message: "Company subscription managed successfully!"
            });
        }

        return res.status(200).json({
            status: 200,
            flag: false,
            message: "Company subscription not found!"
        })
    } catch (e) {
        console.log("manageSuspendEnableCompanySubscription Error >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
/* /Handle Suspend/Enable Company and Subscription */

/* Handle company upcoming subscription InActive previous */
const manageUpcomingComSubsPreviousPlan = async () => {
    try {
        var todayDate = formatDate(null, "YYYY-MM-DD");
        // todayDate = "2024-03-28";
        var query = { start_date: todayDate, status: 0 }

        var subscriptions = await BuySubscriptionService.getBuySubscriptionsOne(query);
        if (subscriptions && subscriptions?.length) {
            for (let i = 0; i < subscriptions.length; i++) {
                let item = subscriptions[i];
                if (item && item?._id) {
                    var companyId = item?.company_id?._id ? item.company_id._id : item?.company_id || ""
                    await BuySubscriptionService.updateMultipleBuySubscriptions({ company_id: companyId, start_date: { $lt: todayDate }, _id: { $ne: item._id }, status: 1 }, { status: 0 });

                    await BuySubscriptionService.updateBuySubscription({ _id: item._id, status: 1 })
                }
            }
        }

        return { flag: true, message: "Upcoming subscription managed successfully!" }
    } catch (e) {
        console.log("manageUpcomingComSubsPreviousPlan Error >>> ", e)
        return { flag: false, message: e.message }
    }
}
/* /Handle company upcoming subscription InActive previous */

// ** Run every day 12:05 am
cron.schedule('05 0 * * *', async () => {
    await manageUpcomingComSubsPreviousPlan()
});
// 
