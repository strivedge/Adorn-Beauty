var dateFormat = require('dateformat')
var ObjectId = require('mongodb').ObjectId

var LocationService = require('../services/location.service');
var LocationTimingService = require('../services/locationTiming.service');
var LocationCloseDayService = require('../services/locationCloseDay.service');
var CompanyService = require('../services/company.service');
var ContentMasterService = require('../services/contentMaster.service');
var CronjobActionService = require('../services/cronjobAction.service');
var CronjobParameterService = require('../services/cronjobParameter.service');
var CustomParameterService = require('../services/customParameter.service');
var EmailTemplateService = require('../services/emailTemplate.service');
var ConsultationFormService = require('../services/consultationForm.service');
var UserService = require('../services/user.service');
var QuestionService = require('../services/question.service');
var CategoryService = require('../services/category.service');
var ServiceService = require('../services/service.service');
var QuestionGroupService = require('../services/questionGroup.service');
var ServiceTypeGroupService = require('../services/serviceTypeGroup.service');
var TestService = require('../services/test.service');


// ** Master
var MasterContentMasterService = require('../services/masterContentMaster.service');
var MasterCronjobActionService = require('../services/masterCronjobAction.service');
var MasterCronjobParameterService = require('../services/masterCronjobParameter.service');
var MasterCustomParameterService = require('../services/masterCustomParameter.service');
var MasterEmailTemplateService = require('../services/masterEmailTemplate.service');
var MasterCategoryService = require('../services/masterCategory.service');
var MasterConsultationFormService = require('../services/masterConsultationForm.service')
var MasterQuestionService = require('../services/masterQuestion.service')
var MasterQuestionGroupService = require('../services/masterQuestionGroup.service')
var MasterService = require('../services/masterService.service');
var MasterTestService = require('../services/masterTest.service');

const { isValidJson, getCustomParameterData } = require('../helper')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getLocations = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        var order = req.query.order ? req.query.order : '-1';
        var searchText = req.query.searchText ? req.query.searchText : '';
        var location_ids = req.query.location_ids ? req.query.location_ids : '';

        var query = { soft_delete: { $ne: true } };
        // if (req.query.status == 1) {
        //     query['status'] = 1;
        // }

        if (req.query.online_status == 1) {
            query['online_status'] = 1;
        }

        if (req.query.admin_status == 1) {
            query['admin_status'] = 1;
        }

        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id;
        }

        if (req.query.searchText && req.query.searchText != 'undefined') {
            query['$or'] = [{ name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { email: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { contact_number: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }];
        }
        if (location_ids && location_ids.length > 0) {
            location_ids = location_ids.map(x => ObjectId(x));
            query['_id'] = { $in: location_ids };
        }

        var locations = await LocationService.getLocations(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText)

        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: locations, message: "Locations received successfully!" })
    } catch (e) {
        // console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getLocationListing = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.body.page ? req.body.page : 0; //skip raw value
        var limit = parseInt(req.body.limit) ? parseInt(req.body.limit) : 10;
        var order_name = req.body.order_name ? req.body.order_name : 'createdAt';
        var order = req.body.order ? req.body.order : '-1';
        var searchText = req.body.searchText ? req.body.searchText : '';
        var location_ids = req.body.location_ids ? req.body.location_ids : '';

        var query = { soft_delete: { $ne: true } };
        // if (req.query.status == 1) {
        //     query['status'] = 1;
        // }

        if (req.body.online_status == 1) {
            query['online_status'] = 1;
        }

        if (req.body.admin_status == 1) {
            query['admin_status'] = 1;
        }

        if (req.body.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.body.company_id;
        }

        if (searchText) {
            query['$or'] = [
                { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { email: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { contact_number: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ];
        }

        if (location_ids && location_ids.length > 0) {
            location_ids = location_ids.map(x => ObjectId(x));
            query['_id'] = { $in: location_ids };
        }

        var locations = await LocationService.getLocations(query, parseInt(page), parseInt(limit), order_name, Number(order))

        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: locations, message: "Locations received successfully!" })
    } catch (e) {
        // console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getLocationsOne = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var orderName = req.query.order_name ? req.query.order_name : "createdAt"
        var order = req.query.order ? req.query.order : "-1"
        var keyType = req.query?.key_type || ""

        var query = {}
        if (req.query.status == 1) {
            query['status'] = 1
        }

        if (req.query.online_status == 1) {
            query['online_status'] = 1
        }

        if (req.query.admin_status == 1) {
            query['admin_status'] = 1
        }

        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id
        }

        if (req.query?.in_ids && isValidJson(req.query.in_ids)) {
            var ids = JSON.parse(req.query.in_ids)
            query['_id'] = { $in: ids }
        }

        if (req.query.searchText && req.query.searchText != 'undefined') {
            query['$or'] = [
                { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                { email: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                { contact_number: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
            ]
        }

        if (keyType == "secret") {
            var locations = await LocationService.getLocationsOneHidden(query, orderName, order)
        } else {
            var locations = await LocationService.getLocationsOne(query, orderName, order)
        }

        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: locations, message: "Locations received successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getActiveLocations = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var query = { status: 1 }
        if (req.query.online_status == 1) {
            query['online_status'] = 1;
        }

        if (req.query.admin_status == 1) {
            query['admin_status'] = 1;
        }

        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = ObjectId(req.query.company_id.toString());
        }

        var Locations = await LocationService.getActiveLocations(query);
        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Locations, message: "Locations received successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getBookingActiveLocations = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var systemType = process.env?.SYSTEM_TYPE || ""
        var query = { status: 1 }
        if (req.query.online_status == 1) {
            query['online_status'] = 1;
        }

        if (req.query.admin_status == 1) {
            query['admin_status'] = 1;
        }

        if (systemType != 'general') {
            if (req.query.company_id && req.query.company_id != 'undefined') {
                query['company_id'] = ObjectId(req.query.company_id.toString());
            }
        }

        var Locations = await LocationService.getActiveLocations(query);
        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Locations, message: "Locations received successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getLocationComapany = async function (req, res, next) {
    try {
        var location_id = req.query?.location_id || ""
        var location = []
        if (location_id) {
            var loc_query = { _id: ObjectId(location_id) }
            location = await LocationService.getLocationComapany(loc_query)

            var employees = await UserService.getEmployees({ is_employee: 1, status: 1, location_id: location_id });
            if (location && location.length > 0 && (!employees || employees?.length == 0) && location[0].setup_steps > 4) {
                location[0].setup_steps = 4;
            }

        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: location, message: "Location received successfully!" })
    } catch (e) {
        // console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getLocationSpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var query = {}
        if (req.body.status == 1) {
            query['status'] = 1;
        }

        if (req.body.online_status == 1) {
            query['online_status'] = 1;
        }

        if (req.body.admin_status == 1) {
            query['admin_status'] = 1;
        }

        if (req.body.nin_arr && req.body.nin_arr != 'undefined') {
            query['_id'] = { $nin: req.body.nin_arr };
        }

        if (req.body.locations && req.body.locations != 'undefined') {
            query['_id'] = { $in: req.body.locations };
        }

        if (req.body.company_id && req.body.company_id != 'undefined') {
            query['company_id'] = req.body.company_id;
        } else {
            if (req.body.location_id && req.body.location_id != 'undefined') {
                var location = await LocationService.getLocation(req.body.location_id)
                query['company_id'] = location.company_id;
            }
        }

        var locations = await LocationService.getLocationSpecific(query)
        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: locations, message: "Locations received successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getLocation = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id;
        var employees = [];
        var Location = await LocationService.getLocation(id);

        if (req.query.is_employee_details) {
            employees = await UserService.getEmployees({ is_employee: 1, status: 1, location_id: id })
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Location, employees: employees, message: "Location recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getLocationTiming = async function (req, res, next) {
    try {
        var locationId = req.query?.location_id || ""
        var date = req.query.date
        var dateObj = new Date(date)
        var weekday = dateObj.toLocaleString("default", { weekday: "long" }) //get day name
        weekday = weekday.toLowerCase()

        var today_timing = null
        if (weekday && locationId) {
            var location = await LocationService.getLocation(locationId) || null
            today_timing = await LocationTimingService.getSpecificLocationTimings(locationId, weekday) //get location time by day name

            if (location?.group_special_hours && location.group_special_hours?.length > 0) {
                var ind = location.group_special_hours.findIndex(x => date >= dateFormat(x.special_hour_start_date, "yyyy-mm-dd") && date <= dateFormat(x.special_hour_end_date, "yyyy-mm-dd"))
                if (ind != -1) {
                    today_timing.start_time = location.group_special_hours[ind].special_hour_from_time

                    today_timing.end_time = location.group_special_hours[ind].special_hour_end_time
                }
            }
        }

        // Return the Appointments list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, today_timing: today_timing, message: "Location timing received successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.syncLocationsData = async function (req, res, next) {
    try {
        if (!req.query.company_id && !req.query.location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Company and Location Id must be present!" })
        }

        var companyId = req.query?.company_id || "";
        var locationId = req.query?.location_id || "";

        // ** Masters
        var masterContentMasters = await MasterContentMasterService.getMasterContentMastersSimple({});
        var masterCronJobActions = await MasterCronjobActionService.getMasterCronjobActionsSimple({});
        var masterCronjobParameters = await MasterCronjobParameterService.getMasterCronjobParametersSimple({});
        var masterCustomParameters = await MasterCustomParameterService.getMasterCustomParametersSimple({});
        var masterEmailTemplates = await MasterEmailTemplateService.getMasterEmailTemplatesSimple({})

        var locationQuery = { location_id: locationId };

        /* Content Masters */
        var contentMasters = await ContentMasterService.getContentMastersSimple(locationQuery);
        if (masterContentMasters && masterContentMasters?.length) {
            for (let i = 0; i < masterContentMasters.length; i++) {
                let item = masterContentMasters[i];
                var contentMaster = contentMasters.find(x => x.name == item?.name);
                if (contentMaster && contentMaster?._id) {
                    if (!contentMaster?.master_content_master_id) {
                        contentMaster.master_content_master_id = item._id;
                        await ContentMasterService.updateContentMaster(contentMaster);
                    }
                } else {
                    item.company_id = companyId;
                    item.location_id = locationId;
                    item.master_content_master_id = item._id;

                    await ContentMasterService.createContentMaster(item);
                }
            }
        }
        /* /Content Masters */

        /* CronJob Actions */
        var cronJobActions = await CronjobActionService.getCronjobActionsSimple(locationQuery);
        if (masterCronJobActions && masterCronJobActions?.length) {
            for (let i = 0; i < masterCronJobActions.length; i++) {
                let item = masterCronJobActions[i];
                var cronJobAction = cronJobActions.find(x => x.key_url == item?.key_url);
                if (cronJobAction && cronJobAction?._id) {
                    if (!cronJobAction?.master_cronjob_action_id) {
                        cronJobAction.master_cronjob_action_id = item._id;
                        await CronjobActionService.updateCronjobAction(cronJobAction)
                    }
                } else {
                    item.company_id = companyId;
                    item.location_id = locationId;
                    item.master_cronjob_action_id = item._id;

                    await CronjobActionService.createCronjobAction(item)
                }
            }
        }
        /* /CronJob Actions */

        /* CronJob Parameters */
        var cronjobParameters = await CronjobParameterService.getCronjobParametersSimple(locationQuery);
        if (masterCronjobParameters && masterCronjobParameters?.length) {
            for (let i = 0; i < masterCronjobParameters.length; i++) {
                let item = masterCronjobParameters[i];
                var cronjobParameter = cronjobParameters.find(x => x.key_url == item?.key_url);
                if (cronjobParameter && cronjobParameter?._id) {
                    if (!cronjobParameter?.master_cronjob_parameter_id) {
                        cronjobParameter.master_cronjob_parameter_id = item._id;
                        await CronjobParameterService.updateCronjobParameter(cronjobParameter);
                    }
                } else {
                    item.company_id = companyId;
                    item.location_id = locationId;
                    item.master_cronjob_parameter_id = item._id;

                    await CronjobParameterService.createCronjobParameter(item);
                }
            }
        }
        /* /CronJob Parameters */

        /* Custom Parameters */
        var customParameters = await CustomParameterService.getCustomParametersSimple(locationQuery);
        if (masterCustomParameters && masterCustomParameters?.length) {
            for (let i = 0; i < masterCustomParameters.length; i++) {
                let item = masterCustomParameters[i];
                var cronjobParameter = customParameters.find(x => x.key_url == item?.key_url);
                if (cronjobParameter && cronjobParameter?._id) {
                    if (!cronjobParameter?.master_custom_parameter_id) {
                        cronjobParameter.master_custom_parameter_id = item._id;
                        await CustomParameterService.updateCustomParameter(cronjobParameter);
                    }
                } else {
                    item.company_id = companyId;
                    item.location_id = locationId;
                    item.master_custom_parameter_id = item._id;

                    await CustomParameterService.createCustomParameter(item);
                }
            }
        }
        /* /Custom Parameters */

        /* Email Templates */
        var emailTemplates = await EmailTemplateService.getEmailTemplatesSimple(locationQuery);
        if (masterEmailTemplates && masterEmailTemplates?.length) {
            for (let i = 0; i < masterEmailTemplates.length; i++) {
                let item = masterEmailTemplates[i];
                var emailTemplate = emailTemplates.find(x => x.type == item?.type);
                if (emailTemplate && emailTemplate?._id) {
                    if (!emailTemplate?.master_email_template_id) {
                        emailTemplate.master_email_template_id = item._id;
                        await EmailTemplateService.updateEmailTemplate(emailTemplate);
                    }
                } else {
                    item.company_id = companyId;
                    item.location_id = locationId;
                    item.master_email_template_id = item._id;

                    await EmailTemplateService.createEmailTemplate(item);
                }
            }
        }
        /* /Email Templates */

        return res.status(200).json({
            status: 200,
            flag: true,
            message: "Location synced successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.oldsyncLocationsData = async function (req, res, next) {
    try {
        if (!req.query.company_id && !req.query.location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Company and Location Id must be present!" })
        }

        var company_id = req.query.company_id;
        var location_id = req.query.location_id;

        // Admin Custom Parameters
        var adminQuery = { company_id: "", location_id: "" };
        var adminParameters = await CustomParameterService.getAllCustomParameters(adminQuery);

        // Admin Content Masters
        var adminContents = await ContentMasterService.getAllContentMasters(adminQuery);

        // Organization Custom Parameters
        var companyQuery = { company_id: company_id, location_id: "" };
        var companyParameters = await CustomParameterService.getAllCustomParameters(companyQuery);

        // Organization Content Masters
        var companyContents = await ContentMasterService.getAllContentMasters(companyQuery);

        // Branch Custom Parameters
        var createData = [];
        var locationQuery = { company_id: company_id, location_id: location_id };
        var locationParameter = await CustomParameterService.getAllCustomParameters(locationQuery);
        if (companyParameters.length > 0) {
            createData = companyParameters;
        } else {
            createData = adminParameters;
        }

        if (locationParameter.length != createData.length) {
            for (var i = 0; i < createData.length; i++) {
                if (locationParameter.length > 0) {
                    var locParameter = locationParameter.find(x => x.key_url == createData[i].key_url);
                    if (!locParameter && location_id != createData[i].location_id) {
                        var data = { company_id: company_id, location_id: location_id, category: createData[i].category, key: createData[i].key, key_url: createData[i].key_url, value_type: createData[i].value_type, value: createData[i].value, custom_type: createData[i].custom_type, custom_options: createData[i].custom_options, description: createData[i].description, edit_flag: createData[i].edit_flag, status: createData[i].status };
                        var createParameter = await CustomParameterService.createCustomParameter(data);
                    }
                } else {
                    var data = { company_id: company_id, location_id: location_id, category: createData[i].category, key: createData[i].key, key_url: createData[i].key_url, value_type: createData[i].value_type, value: createData[i].value, custom_type: createData[i].custom_type, custom_options: createData[i].custom_options, description: createData[i].description, edit_flag: createData[i].edit_flag, status: createData[i].status };
                    var createParameter = await CustomParameterService.createCustomParameter(data);
                }
            }
        }

        var emailTemplates = await EmailTemplateService.getAllEmailTemplates({ company_id: company_id, location_id: "" });
        if (emailTemplates && emailTemplates.length > 0) {
            for (var i = 0; i < emailTemplates.length; i++) {
                var query = { name: emailTemplates[i].name, location_id: location_id };
                var locEmailTemplates = await EmailTemplateService.getAllEmailTemplates(query);
                if (locEmailTemplates.length == 0) {
                    emailTemplates[i].location_id = location_id;
                    var createdEmailTemplate = await EmailTemplateService.createEmailTemplate(emailTemplates[i])
                }
            }
        }

        // Branch Content Masters
        var createData = [];
        var locationContents = await ContentMasterService.getAllContentMasters(locationQuery);
        if (companyContents.length > 0) {
            createData = companyContents;
        } else {
            createData = adminContents;
        }

        if (locationContents.length != createData.length) {
            for (var i = 0; i < createData.length; i++) {
                if (locationContents.length > 0) {
                    var locContentMaster = locationContents.find(x => x.name == createData[i].name);
                    if (!locContentMaster && location_id != createData[i].location_id) {
                        var data = { company_id: company_id, location_id: location_id, name: createData[i].name, last_publish_date: createData[i].last_publish_date, content: createData[i].content }
                        var createContent = await ContentMasterService.createContentMaster(data);
                    }
                } else {
                    var data = { company_id: company_id, location_id: location_id, name: createData[i].name, last_publish_date: createData[i].last_publish_date, content: createData[i].content }
                    var createContent = await ContentMasterService.createContentMaster(data);
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, message: "Location synced successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getLocationParameter = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var location_id = req.query.location_id

        var booking_fee_type = '';
        var booking_fee_value = 0;
        var group_booking_limit = 0;
        var future_booking = 0;
        var location = await LocationService.getLocation(location_id);
        if (location_id && location_id != '') {

            var bookingFeeData = await getCustomParameterData(location.company_id, location_id, 'booking');
            if (bookingFeeData && bookingFeeData?.formData && bookingFeeData?.formData?.booking_fee_status) {
                booking_fee_type = bookingFeeData?.formData?.booking_fee_type || '';
                booking_fee_value = parseInt(bookingFeeData?.formData?.booking_fee_value) || 0;
            }

            if (bookingFeeData && bookingFeeData?.formData && bookingFeeData?.formData?.booking_status) {
                group_booking_limit = parseInt(bookingFeeData?.formData?.group_booking) || 0;
                future_booking = parseInt(bookingFeeData?.formData?.future_booking) || 0;
            }
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            booking_fee_type_data: bookingFeeData?.formData,
            booking_fee_value_data: bookingFeeData?.formData,
            data: location,
            booking_fee_type: booking_fee_type,
            booking_fee_value: booking_fee_value,
            group_booking_limit: group_booking_limit,
            future_booking: future_booking,
            message: "Location received successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getLocationParameters = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var locationId = req.query?.location_id || ""
        if (!locationId) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present!" })
        }

        var bookingFeeType = '';
        var bookingFeeValue = 0;
        var groupBookingLimit = 0;
        var futureBooking = 0;
        var location = await LocationService.getLocationOne({ _id: locationId })
        companyId = location?.company_id?._id ? location.company_id._id : location?.company_id || ""
        if (location && location._id) {

            var bookingFeeData = await getCustomParameterData(companyId, locationId, 'booking');
            if (bookingFeeData && bookingFeeData?.formData && bookingFeeData?.formData?.booking_fee_status) {
                bookingFeeType = bookingFeeData?.formData?.booking_fee_type || '';
                bookingFeeValue = parseInt(bookingFeeData?.formData?.booking_fee_value) || 0;
            }

            if (bookingFeeData && bookingFeeData?.formData && bookingFeeData?.formData?.booking_status) {
                groupBookingLimit = parseInt(bookingFeeData?.formData?.group_booking) || 0;
                futureBooking = parseInt(bookingFeeData?.formData?.future_booking) || 0;
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            booking_fee_type_data: bookingFeeTypeData,
            booking_fee_value_data: bookingFeeValueData,
            data: location,
            booking_fee_type: bookingFeeType,
            booking_fee_value: bookingFeeValue,
            group_booking_limit: groupBookingLimit,
            future_booking: futureBooking,
            message: "Location parameters received successfully!"
        })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getLocationGroupBookingLimit = async function (req, res, next) {
    try {
        var location_id = req.query.location_id;
        var group_booking_limit = 0;
        var location = await LocationService.getLocation(location_id);

        var bookingFeeData = await getCustomParameterData(location?.company_id, location_id, 'booking');
        if (bookingFeeData && bookingFeeData?.formData && bookingFeeData?.formData?.booking_status) {
            group_booking_limit = parseInt(bookingFeeData?.formData?.group_booking) || 0;
            future_booking = parseInt(bookingFeeData?.formData?.future_booking) || 0;
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, group_booking_limit: group_booking_limit, future_booking: future_booking, message: "Location received successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getLocationCompanySpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var query = { company_id: req.query.company_id }
        // console.log("getLocationCompanySpecific ",req.query.company_id)
        var locations = await LocationService.getLocationCompanySpecific(query)
        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: locations, message: "Services recieved successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getLocationTimings = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 1
        var limit = req.query.limit ? req.query.limit : 1000;
        var query = { location_id: req.params.location_id, status: 1 }
        var keyType = req.query?.key_type || "";

        var LocationTimings = await LocationTimingService.getLocationTimings(query, page, limit)

        if (keyType == "secret") {
            var location = await LocationService.getLocationOneHidden(req.params.location_id) || null
        } else {
            var location = await LocationService.getLocation(req.params.location_id) || null
        }

        return res.status(200).json({ status: 200, flag: true, data: LocationTimings, location: location, message: "Locations timing recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getLocationCloseDays = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 1
        var limit = req.query.limit ? req.query.limit : 1000;
        var query = { location_id: req.params.location_id, status: 1 }
        var LocationTimings = await LocationCloseDayService.getLocationCloseDays(query, page, limit)
        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: LocationTimings, message: "Locations close days received successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.softDeleteLocation = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var location = await LocationService.getLocation(req.params.location_id)
        if (location && location.user_id) {
            await UserService.updateManyStatus({ _id: location.user_id })
        }
        var query = { _id: req.params.location_id };
        var locations = await LocationService.softDeleteLocation(query)
        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: locations, message: "Location deleted successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createLocation = async function (req, res, next) {
    // console.log('req body',req.body);
    try {
        var userData = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.contact_number,
            password: req.body.password,
            company_id: req.body.company_id,
            role_id: process.env?.BRANCH_ADMIN_ROLE || '608185683cf3b528a090b5ad', //Location Admin role
        }

        // Create User           
        var createdUser = await UserService.createUser(userData);
        if (createdUser) {
            req.body.user_id = createdUser._id;
        }

        var createdLocation = await LocationService.createLocation(req.body);
        if (createdLocation && createdLocation._id) {
            var userData = {
                _id: createdUser._id,
                location_id: createdLocation._id,
                locations: [createdLocation._id]
            }

            var updateUser = await UserService.updateUser(userData);
        }

        return res.status(200).json({ status: 200, flag: true, data: createdLocation, message: "Location created successfully!" })
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

/* Catalog default data */
const createDefaultCatalogData = async (companyId = null, locationId = null) => {
    try {
        var categories = [];
        var tests = [];
        var services = [];
        var query = { location_id: locationId }

        var masterCategories = await MasterCategoryService.getMasterCategoriesSimple({ status: 1 });
        if (masterCategories && masterCategories?.length) {
            for (let i = 0; i < masterCategories.length; i++) {
                let item = masterCategories[i];
                item.company_id = companyId || "";
                item.location_id = locationId || "";
                item.master_category_id = item?._id || null;
                query['name'] = item.name;
                var categoryData = await CategoryService.checkCategoryExist(query) || null;
                if (!categoryData) {
                    var createdCategory = await CategoryService.createCategory(item);
                    if (createdCategory && createdCategory?._id) {
                        categories.push(createdCategory);
                    }
                } else {
                    categories.push(categoryData);
                }
            }
        }

        var masterTests = await MasterTestService.getMasterTestsSimple({ status: 1 });
        if (masterTests && masterTests?.length) {


            for (let i = 0; i < masterTests.length; i++) {
                let item = masterTests[i];
                item.company_id = companyId || "";
                item.location_id = locationId || "";
                item.master_test_id = item?._id || null;

                query['name'] = item.name;
                var testData = await TestService.getSingleTestByName(query) || null;
                if (!testData) {
                    var createdTest = await TestService.createTest(item);
                    if (createdTest && createdTest?._id) {
                        tests.push(createdTest)
                    }
                } else {
                    tests.push(testData)
                }
            }
        }

        var masterServices = await MasterService.getMasterServicesSimple({ status: 1 });
        if (masterServices && masterServices?.length) {
            for (let i = 0; i < masterServices.length; i++) {
                let item = masterServices[i];
                item.company_id = companyId || "";
                item.location_id = locationId || "";
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

                query['name'] = item.name;
                var serData = await ServiceService.checkServiceExist(query) || null;
                if (!serData) {
                    var createdService = await ServiceService.createService(item);
                    if (createdService && createdService?._id) {
                        services.push(createdService)
                    }
                } else {
                    services.push(serData)
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
const createDefaultConsultationData = async (companyId = null, locationId = null) => {
    try {
        var questionGroups = [];
        var questions = [];
        var consultationForms = [];

        var categories = [];
        var services = [];
        if (locationId) {
            categories = await CategoryService.getCategoriesSimple({ location_id: locationId });
            services = await ServiceService.getServicesSimple({ location_id: locationId });
        }

        var masterQuestionGroups = await MasterQuestionGroupService.getMasterQuestionGroupsSimple({ status: 1 });
        if (masterQuestionGroups && masterQuestionGroups?.length) {

            var query = { location_id: ObjectId(locationId) };

            for (let i = 0; i < masterQuestionGroups.length; i++) {
                let item = masterQuestionGroups[i];
                item.company_id = companyId || "";
                item.location_id = locationId || "";
                item.master_question_group_id = item?._id || null;

                query['name'] = item.name;
                var grpData = await QuestionGroupService.checkGroupExist(query) || null;
                if (!grpData) {
                    var createdQuestionGroup = await QuestionGroupService.createQuestionGroup(item);
                    if (createdQuestionGroup && createdQuestionGroup?._id) {
                        questionGroups.push(createdQuestionGroup);
                    }
                } else {
                    questions.push(grpData)
                }
            }
        }

        var masterQuestions = await MasterQuestionService.getMasterQuestionsSimple({ status: 1 });
        if (masterQuestions && masterQuestions?.length) {

            var query = { location_id: locationId };

            for (let i = 0; i < masterQuestions.length; i++) {
                let item = masterQuestions[i];
                item.company_id = companyId || "";
                item.location_id = locationId || "";
                item.master_question_id = item?._id || null;
                item.master_que_group_id = item?.master_que_group_id || null;

                query['question'] = item.question;
                var queData = await QuestionService.checkQuestionExist(query) || null;
                if (!queData) {
                    var createdQuestion = await QuestionService.createQuestion(item)
                    if (createdQuestion && createdQuestion?._id) {
                        questions.push(createdQuestion)
                    }
                } else {
                    questions.push(queData)
                }
            }
        }

        var masterConsultationForms = await MasterConsultationFormService.getMasterConsultationFormsSimple({ status: 1 });
        if (masterConsultationForms && masterConsultationForms?.length) {

            var query = { location_id: locationId };

            for (let i = 0; i < masterConsultationForms.length; i++) {
                let item = masterConsultationForms[i];
                item.company_id = companyId || "";
                item.location_id = locationId || "";
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

                query['name'] = item.name;
                var conData = await ConsultationFormService.checkConsultationFormExist(query) || null;
                if (!queData) {
                    var createdData = await ConsultationFormService.createConsultationForm(item);
                    if (createdData && createdData?._id) {
                        consultationForms.push(createdData)
                    }
                } else {
                    consultationForms.push(conData)
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

exports.updateLocation = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        if (req.body?.user_id && req.body?.status == 0) {
            var user = await UserService.updateManyStatus({ _id: req.body?.user_id });
        }

        if (req.body?.user_id && req.body?.status == 1) {
            var user = await UserService.activeUserStatus({ _id: req.body?.user_id });
        }

        if (req.body.user_id && (req.body.password || req.body.email)) {
            var userData = {
                name: req.body.name,
                mobile: req.body.contact_number,
                email: req.body.email,
                password: req.body.password,
                company_id: req.body.company_id,
                location_id: req.body._id,
                locations: [req.body._id],
                role_id: process.env?.BRANCH_ADMIN_ROLE || '608185683cf3b528a090b5ad' //Location Admin role
            }

            var user = await UserService.getUser(req.body.user_id);
            if (user && user._id) {
                userData._id = req.body.user_id;
                var updatedUser = await UserService.updateUser(userData);
            } else {
                var User = await UserService.getUserbyEmail(req.body.email);
                if (User && User._id) {
                    return res.status(200).json({ status: 200, flag: false, data: User, message: "Email already exists!" })
                }

                var createdUser = await UserService.createUser(userData);
                if (createdUser && createdUser._id) {
                    req.body.user_id = createdUser._id;
                }
            }
        }
        var location = await LocationService.getLocation(req.body._id);
        if (!location.is_default_data && req.body.is_default_data == 1) {
            await createDefaultCatalogData(location.company_id, req.body._id);
            await createDefaultConsultationData(location.company_id, req.body._id);
        }

        var updatedLocation = await LocationService.updateLocation(req.body);

        return res.status(200).json({ status: 200, flag: true, createdUser: createdUser, data: updatedLocation, message: "Location updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createLocationTimings = async function (req, res, next) {
    try {
        var timing = (req.body.timing);
        var location_id = req.body.location_id;

        if (!location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Location must be present!" })
        }

        // Calling the Service function with the new object from the Request Body
        if (location_id && timing?.length > 0) {
            for (var i = 0; i < timing.length; i++) {
                var timingData = {
                    location_id: location_id,
                    day: timing[i].day,
                    start_time: timing[i].start_time,
                    end_time: timing[i].end_time,
                }

                var checkTiming = await LocationTimingService.getSpecificLocationTimings(location_id, timing[i].day);
                if (checkTiming && checkTiming._id) {
                    timingData._id = checkTiming._id;
                    var updateLocationTiming = await LocationTimingService.updateLocationTiming(timingData);
                } else {
                    var createdLocationTiming = await LocationTimingService.createLocationTiming(timingData);
                }
            }
            var location = await LocationService.getLocation(location_id);

            if (location.setup_steps <= 1) {
                await LocationService.updateMultipleLocations({ _id: ObjectId(req.body.location_id) }, { setup_steps: 2 });
            }

        }

        return res.status(200).json({ status: 200, flag: true, data: timing, message: "Location timings created successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createLocationCloseDay = async function (req, res, next) {
    // console.log('close req body',req.body);
    try {
        var group_close_days = req.body.group_close_days;
        var location_id = req.body.location_id;
        if (!location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Location must be present!" })
        }

        // Calling the Service function with the new object from the Request Body
        if (location_id && group_close_days?.length > 0) {
            for (var i = 0; i < group_close_days.length; i++) {
                var closeDayData = {
                    location_id: location_id,
                    name: group_close_days[i].name,
                    start_date: group_close_days[i].start_date,
                    end_date: group_close_days[i].end_date,
                }
                checkClose = await LocationCloseDayService.getSpecificLocationCloseDay(location_id);
                if (checkClose && checkClose._id) {
                    checkClose._id = checkClose._id;
                    var LocationCloseDay = await LocationCloseDayService.updateLocationCloseDay(closeDayData);

                } else {
                    var LocationCloseDay = await LocationCloseDayService.createLocationCloseDay(closeDayData);
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: LocationCloseDay, message: "Location close days created successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateLocationTimings = async function (req, res, next) {
    // Id is necessary for the update
    try {
        if (!req.body.location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Location_id must be present!" })
        }

        var timing = JSON.parse(req.body.timing);
        var location_id = req.body.location_id;
        if (location_id && timing?.length > 0) {
            for (var i = 0; i < timing.length; i++) {
                var timingData = {
                    _id: timing[i].id,
                    location_id: location_id,
                    day: timing[i].day,
                    start_time: timing[i].start_time,
                    end_time: timing[i].end_time,
                }

                var updateLocationTiming = await LocationTimingService.updateLocationTiming(timingData);
            }

            var location = await LocationService.getLocation(location_id);

            if (location.setup_steps <= 1) {
                await LocationService.updateMultipleLocations({ _id: ObjectId(req.body.location_id) }, { setup_steps: 2 });
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: timing, message: "Location timings updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateLocationSpecialHours = async function (req, res, next) {
    // Id is necessary for the update
    try {
        if (!req.body.location_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Location_id must be present" })
        }
        var s_hours = JSON.parse(req.body.s_hours);
        var location_id = req.body.location_id;

        if (location_id && s_hours?.length > 0) {
            for (var i = 0; i < s_hours.length; i++) {
                var specialHoursData = {
                    id: s_hours[i].id,
                    location_id: location_id,
                    day: s_hours[i].name,
                    day: s_hours[i].start_date,
                    day: s_hours[i].end_date,
                    start_time: s_hours[i].from_time,
                    end_time: s_hours[i].end_time,
                }

                var updateLocationSpecialHour = await LocationSpecialHourService.updateLocationSpecialHour(specialHoursData);
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: s_hours, message: "Location special hour updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeLocation = async function (req, res, next) {
    try {
        var id = req.params.id;
        if (!id) {
            return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
        }

        var location = await LocationService.getLocation(id);
        if (location && location.user_id) {
            var deleted = await UserService.deleteUser(location.user_id);
        }

        var deleted = await LocationService.deleteLocation(id);
        var deletedTiming = await LocationTimingService.deleteTimingByLocation(id);
        var deletedCloseDays = await LocationCloseDayService.deleteCloseDayByLocation(id);

        return res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.copyLocationData = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var current_location = req.body.location_id
        var new_location = req.body.new_location_id;

        if (!current_location && !new_location) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present!" });
        }

        if (current_location == new_location) {
            return res.status(200).json({ status: 200, flag: false, message: "Current Location and Copy Location must be different!" });
        }

        if (current_location && new_location) {
            var curTiming = await LocationTimingService.getLocationTimingsSpecific({ location_id: current_location });
            if (curTiming && curTiming.length > 0) {
                for (var i = 0; i < curTiming.length; i++) {
                    var timingData = {
                        location_id: new_location,
                        day: curTiming[i].day,
                        start_time: curTiming[i].start_time,
                        end_time: curTiming[i].end_time,
                    }

                    var checkTiming = await LocationTimingService.getSpecificLocationTimings(new_location, curTiming[i].day);
                    if (checkTiming && checkTiming._id) {
                        timingData._id = checkTiming._id;
                        var updateLocationTiming = await LocationTimingService.updateLocationTiming(timingData);
                    } else {
                        var createdLocationTiming = await LocationTimingService.createLocationTiming(timingData);
                    }
                }
            }
        }

        var query = { status: 1 }

        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id
        }

        // var categories = await CategoryService.getAllActiveCategories(query)
        // categories = categories.map(function (x) {
        //     x.location_id = req.body.new_location_id
        //     return x
        // })

        // var services = await ServiceService.getAllActiveServices(query)
        // services = services.map(function (x) {
        //     x.location_id = req.body.new_location_id
        //     return x
        // })

        // var tests = await TestService.getAllActiveTests(query)
        // tests = tests.map(function (x) {
        //     x.location_id = req.body.new_location_id;
        //     return x
        // })

        // var result = await CategoryService.createMultipleCategory(categories)
        // var result2 = await ServiceService.createMultipleServices(services)
        // var result3 = await TestService.createMultipleTests(tests)


        // Current Location Category
        var current_category = await CategoryService.getActiveCategories({ location_id: current_location });

        // New Location Category before copy
        var new_category = await CategoryService.getActiveCategories({ location_id: new_location });

        // for creating new location Question Group
        if (current_category && current_category.length > 0) {
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

                var current_services = await ServiceService.getServicesbyLocation({ location_id: current_location, category_id: current_category[a]._id.toString() });

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

        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: null, message: "Locations data copied successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.replaceServiceData = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var current_location = req.query.location_id
        var new_location = req.query.new_location_id;

        if (!current_location && !new_location) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present!" });
        }

        if (current_location == new_location) {
            return res.status(200).json({ status: 200, flag: false, message: "Current Location and Copy Location must be different!" });
        }

        var query = { status: 1 }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        var current_services = await ServiceService.getServicesbyLocation({ location_id: new_location });
        for (var cq = 0; cq < current_services.length; cq++) {
            current_services[cq].service_type_group_id = "";
            if (current_services[cq].test_id != '') {
                var test = await TestService.getTest(current_services[cq].test_id);
                if (test && test._id != '' && test.location_id != new_location) {
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

            if (current_services[cq].category_id != '') {
                var category = await CategoryService.getCategory(current_services[cq].category_id);
                if (category && category._id != '' && category.location_id != new_location) {
                    var name = category.name;
                    var cat_query = { name: name, location_id: new_location };
                    var new_cat = await CategoryService.checkCategoryExist(cat_query);
                    if (new_cat && new_cat.name != '') {
                        current_services[cq].category_id = new_cat._id;
                    } else {
                        category.location_id = new_location
                        var new_cat = await CategoryService.createCategory(category);
                        current_services[cq].category_id = new_cat._id;
                    }
                }
            }

            var createServices = await ServiceService.updateService(current_services[cq]);
        }

        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: current_services, message: "Locations data update successfully!" })
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.copySeriveByLocation = async function (req, res, next) {
    try {
        var current_location = req.body.current_location;
        var new_location = req.body.new_location;
        if (!current_location && !new_location) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present!" });
        }

        if (current_location == new_location) {
            return res.status(200).json({ status: 200, flag: false, message: "Current Location and Copy Location must be different!" });
        }

        // Current Location Category
        var current_category = await CategoryService.getActiveCategories({ location_id: current_location });

        // New Location Category before copy
        var new_category = await CategoryService.getActiveCategories({ location_id: new_location });

        // for creating new location Question Group
        if (current_category && current_category.length > 0) {
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

                var current_services = await ServiceService.getServicesbyLocation({ location_id: current_location, category_id: current_category[a]._id.toString() });

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

        return res.status(200).send({ status: 200, flag: true, new_category: new_category, message: "Services copied successfully!" })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.copyQuestionsLocation = async function (req, res, next) {
    try {
        var current_location = req.body.current_location;
        var new_location = req.body.new_location;
        if (!current_location && !new_location) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present!" })
        }

        if (current_location == new_location) {
            return res.status(200).json({ status: 200, flag: false, message: "Current Location and Copy Location must be different!" })
        }

        // Current Location Question Group
        var current_group = await QuestionGroupService.getQuestionGroupSpecific({ location_id: current_location });

        // New Location Question Group before copy of Question
        var new_group = await QuestionGroupService.getQuestionGroupSpecific({ location_id: new_location });

        // for creating new location Question Group
        if (current_group && current_group.length > 0) {
            for (var a = 0; a < current_group.length; a++) {
                current_group[a].location_id = new_location;
                var new_group_id = '';
                if (new_group.length > 0) {
                    var new_grp_ind = new_group.findIndex(x => x.name.trim() == current_group[a].name.trim());
                    if (new_grp_ind == -1) {
                        var createGroup = await QuestionGroupService.createQuestionGroup(current_group[a]);
                        new_group_id = createGroup._id.toString();
                    } else {
                        new_group_id = new_group[new_grp_ind]._id.toString();
                    }
                } else {
                    var createGroup = await QuestionGroupService.createQuestionGroup(current_group[a]);
                    new_group_id = createGroup._id.toString();
                }

                var current_questions = await QuestionService.getQuestionsSpecific({ location_id: current_location, que_group_id: current_group[a]._id.toString() });

                var new_questions = await QuestionService.getQuestionsSpecific({ location_id: new_location, que_group_id: new_group_id });

                for (var cq = 0; cq < current_questions.length; cq++) {
                    current_questions[cq].location_id = new_location;
                    current_questions[cq].que_group_id = new_group_id;

                    var new_que_ind = new_questions.findIndex(x => x.question.trim() == current_questions[cq].question.trim());
                    // console.log('new_que_ind', new_que_ind)
                    // console.log('current_questions[cq].question', current_questions[cq].question)
                    var new_ser_arr = [];
                    var new_cat_arr = [];
                    if (new_que_ind == -1) {
                        if (current_questions[cq].service_id.length > 0) {
                            var service_query = { _id: { $in: current_questions[cq].service_id }, location_id: current_location };
                            var services = await ServiceService.getServiceSpecific(service_query);
                            if (services && services.length > 0) {
                                var ser_arr = services.map(s => s.name);
                                var ser_query = { name: { $in: ser_arr }, location_id: new_location };
                                var new_services = await ServiceService.getServiceSpecific(ser_query);
                                new_ser_arr = new_services.map(s => s._id.toString());
                            }
                        }

                        if (current_questions[cq].category_id.length > 0) {
                            var category_query = { _id: { $in: current_questions[cq].category_id }, location_id: current_location };
                            var categories = await CategoryService.getCategoriesSpecific(category_query);
                            if (categories && categories.length > 0) {
                                var cat_arr = categories.map(s => s.name);
                                var cat_query = { name: { $in: cat_arr }, location_id: new_location };
                                var new_categories = await CategoryService.getCategoriesSpecific(cat_query);
                                new_cat_arr = new_categories.map(s => s._id.toString());
                            }
                        }

                        current_questions[cq].service_id = new_ser_arr;
                        current_questions[cq].category_id = new_cat_arr;
                        var createQuestion = await QuestionService.createQuestion(current_questions[cq]);
                    }
                }
            }
        }

        return res.status(200).send({ status: 200, flag: true, new_group: new_group, message: "Questions copied successfully!" })
    } catch (e) {
        console.log(e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.oldcopyQuestionsLocation = async function (req, res, next) {
    // console.log("copyQuestionsLocation ",req.body)
    try {
        var current_location = req.body.current_location;
        var new_location = req.body.new_location;
        if (!current_location && !new_location) {
            return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present!" });
        }

        if (current_location == new_location) {
            return res.status(200).json({ status: 200, flag: false, message: "Current Location and Copy Location must be different!" });
        }

        // Current Location Question Group
        var current_group = await QuestionGroupService.getQuestionGroupSpecific({ location_id: current_location });
        // console.log("current_group len ", current_group);

        // New Location Question Group before copy of Question
        var new_group = await QuestionGroupService.getQuestionGroupSpecific({ location_id: new_location });
        // for creating new location Question Group
        if ((current_group?.length != new_group?.length) && (current_group?.length > new_group?.length)) {
            for (var a = 0; a < current_group.length; a++) {
                current_group[a].location_id = new_location;
                if (new_group.length) {
                    var new_grp_ind = new_group.findIndex(x => x.name === current_group[a].name);
                    if (new_grp_ind == -1) {
                        var createGroup = await QuestionGroupService.createQuestionGroup(current_group[a]);
                    }
                } else {
                    var createGroup = await QuestionGroupService.createQuestionGroup(current_group[a]);
                }
            }
        }

        // Getting Current Location Questions
        var current_questions = await QuestionService.getQuestionsSpecific({ location_id: current_location });

        // Getting New Location Questions
        var new_questions = await QuestionService.getQuestionsSpecific({ location_id: new_location });

        if ((current_questions?.length != new_questions?.length) && (current_questions?.length > new_questions?.length)) {
            for (var c = 0; c < current_questions.length; c++) {
                current_questions[c].location_id = new_location;
                if (new_questions.length) {
                    var new_que_ind = new_questions.findIndex(x => x.question === current_questions[c].question);
                    if (new_que_ind == -1) {
                        if (current_questions[c].que_group_id) {
                            var cur_grp_data = await QuestionGroupService.getQuestionGroupId(current_questions[c].que_group_id);
                            if (cur_grp_data && cur_grp_data.name) {
                                var new_grp_name_data = await QuestionGroupService.getQuestionGroupName(new_location, cur_grp_data.name);
                                if (new_grp_name_data && new_grp_name_data._id) {
                                    current_questions[c].que_group_id = new_grp_name_data._id;
                                } else {
                                    current_questions[c].que_group_id = "";
                                }
                            } else {
                                current_questions[c].que_group_id = "";
                            }
                        }

                        if (current_questions[c].service_id.length) {
                            for (var e = 0; e < current_questions[c].service_id.length; e++) {
                                var cur_ser_data = await ServiceService.getServiceId(current_questions[c].service_id[e]);
                                if (cur_ser_data && cur_ser_data.name) {
                                    var new_ser_name_data = await ServiceService.getServiceName(new_location, cur_ser_data.name);
                                    if (new_ser_name_data && new_ser_name_data._id) {
                                        current_questions[c].service_id[e] = new_ser_name_data._id.toString();
                                    } else {
                                        current_questions[c].service_id.splice(e, 1);
                                    }
                                } else {
                                    current_questions[c].service_id.splice(e, 1);
                                }
                            }
                        }

                        var createQuestion = await QuestionService.createQuestion(current_questions[c]);
                    }
                } else {
                    if (current_questions[c].que_group_id) {
                        var cur_grp_data = await QuestionGroupService.getQuestionGroupId(current_questions[c].que_group_id);
                        if (cur_grp_data && cur_grp_data.name) {
                            var new_grp_name_data = await QuestionGroupService.getQuestionGroupName(new_location, cur_grp_data.name);
                            if (new_grp_name_data && new_grp_name_data._id) {
                                current_questions[c].que_group_id = new_grp_name_data._id;
                            } else {
                                current_questions[c].que_group_id = "";
                            }
                        } else {
                            current_questions[c].que_group_id = "";
                        }
                    }

                    if (current_questions[c].service_id.length) {
                        for (var e = 0; e < current_questions[c].service_id.length; e++) {
                            var cur_ser_data = await ServiceService.getServiceId(current_questions[c].service_id[e]);
                            if (cur_ser_data && cur_ser_data.name) {
                                var new_ser_name_data = await ServiceService.getServiceName(new_location, cur_ser_data.name);
                                if (new_ser_name_data && new_ser_name_data._id) {
                                    current_questions[c].service_id[e] = new_ser_name_data._id.toString();
                                } else {
                                    current_questions[c].service_id.splice(e, 1);
                                }
                            } else {
                                current_questions[c].service_id.splice(e, 1);
                            }
                        }
                    }

                    var createQuestion = await QuestionService.createQuestion(current_questions[c]);
                }
            }
        }

        return res.status(200).send({ status: 200, flag: true, message: "Successfully copied questions!" });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is for front end prices for brochure data
exports.getLocationData = async function (req, res, next) {
    try {
        var id = req.query.id;
        if (!id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
        }

        var data = { location: null, location_timing: [], company: null, locations: null, types: [] };
        var location = await LocationService.getLocation(id);
        if (location && location._id) {
            var timing = await LocationTimingService.getLocationTimingsSpecific({ location_id: location._id.toString(), status: 1 });
            var tlen = timing.length;
            if (timing && timing.length) {
                if (timing[0].start_time) {
                    var stime = timing[0].start_time;
                    var stimeToNum = timeToNum(timing[0].start_time);

                    stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM';

                    var showStartTimeSpilt = stime.split(':');
                    var end_hour = showStartTimeSpilt[0];
                    end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                    showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                    stime = showStartTimeSpilt.join(':');

                    timing[0].start_time = stime + " " + stimeToNum;
                }

                if (timing[tlen - 1].start_time) {
                    var stime = timing[tlen - 1].start_time;
                    var stimeToNum = timeToNum(timing[tlen - 1].start_time);
                    stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM';

                    var showStartTimeSpilt = stime.split(':');
                    var end_hour = showStartTimeSpilt[0];
                    end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                    showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                    stime = showStartTimeSpilt.join(':');

                    timing[tlen - 1].start_time = stime + " " + stimeToNum;
                }

                if (timing[0].end_time) {
                    var etime = timing[0].end_time;
                    var etimeToNum = timeToNum(timing[0].end_time);
                    etimeToNum = etimeToNum >= 720 ? 'PM' : 'AM';

                    var showEndTimeSpilt = etime.split(':');
                    var end_hour = showEndTimeSpilt[0];
                    end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                    showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                    etime = showEndTimeSpilt.join(':');

                    timing[0].end_time = etime + " " + etimeToNum;
                }

                if (timing[tlen - 1].end_time) {
                    var etime = timing[tlen - 1].end_time;
                    var etimeToNum = timeToNum(timing[tlen - 1].end_time);
                    etimeToNum = etimeToNum >= 720 ? 'PM' : 'AM';

                    var showEndTimeSpilt = etime.split(':');
                    var end_hour = showEndTimeSpilt[0];
                    end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                    showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                    etime = showEndTimeSpilt.join(':');

                    timing[tlen - 1].end_time = etime + " " + etimeToNum;
                }

                time1 = { day: "Mon-Sat", start_time: timing[0].start_time, end_time: timing[0].end_time };
                time2 = { day: "Sun", start_time: timing[tlen - 1].start_time, end_time: timing[tlen - 1].end_time };
                data.location_timing.push(time1);
                data.location_timing.push(time2);
            }

            data.location = location;
            var company = await CompanyService.getCompany(location.company_id);

            var categories = await CategoryService.getCategoriesbyLocation({ location_id: location._id.toString(), status: 1, price_list_status: { $ne: 0 } });
            for (var i = 0; i < categories.length; i++) {
                var obj = { type: categories[i], groups: [] }
                if (company) {
                    if (!categories[i].brochure_background_image || categories[i].brochure_background_image == '') {
                        categories[i].brochure_background_image = company.brochure_background_image;
                    }
                    if (!categories[i].brochure_background_color || categories[i].brochure_background_color == '') {
                        categories[i].brochure_background_color = company.brochure_background_color;
                    }
                    if (!categories[i].brochure_heading_color || categories[i].brochure_heading_color == '') {
                        categories[i].brochure_heading_color = company.brochure_heading_color;
                    }
                    if (!categories[i].brochure_font_color || categories[i].brochure_font_color == '') {
                        categories[i].brochure_font_color = company.brochure_font_color;
                    }
                }

                var service_group = await ServiceTypeGroupService.getServiceTypeGroupsbyLocation({ location_id: location._id.toString(), category_id: categories[i]._id.toString(), status: 1 });
                if (service_group.length > 0) {
                    for (var g = 0; g < service_group.length; g++) {
                        var services = await ServiceService.getSortServicesbyLocation({ location_id: location._id.toString(), category_id: categories[i]._id.toString(), status: 1, price_list_status: { $ne: 0 }, service_type_group_id: service_group[g]._id.toString() });
                        if (services && services.length) {
                            var groups = { group: service_group[g], services: services }
                            var type_data = { group: service_group[g], services: services };
                            obj.groups.push(type_data);
                        }
                    }

                } else {
                    var services = await ServiceService.getSortServicesbyLocation({ location_id: location._id.toString(), category_id: categories[i]._id.toString(), status: 1, price_list_status: { $ne: 0 } });
                    if (services && services.length) {
                        var type_data = { group: [], services: services };
                        obj.groups.push(type_data);
                    }
                }

                if (obj.groups && obj.groups.length > 0) {
                    data.types.push(obj);
                }
            }

            if (company && company._id) {
                data.company = company;
                var locationsData = [];
                var locations = await LocationService.getLocationCompanySpecific({ _id: { $ne: id }, company_id: company._id.toString(), status: 1 });

                for (var j = 0; j < locations.length; j++) {
                    var timing_data = [];
                    var timings = await LocationTimingService.getLocationTimingsSpecific({ location_id: locations[j]._id.toString(), status: 1 });
                    var timeLen = timings.length;
                    if (timings && timings.length) {
                        if (timings[0].start_time) {
                            var stime = timings[0].start_time;
                            var stimeToNum = timeToNum(timings[0].start_time);

                            stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM';

                            var showStartTimeSpilt = stime.split(':');
                            var end_hour = showStartTimeSpilt[0];
                            end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                            showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                            stime = showStartTimeSpilt.join(':');

                            timings[0].start_time = stime + " " + stimeToNum;
                        }

                        if (timings[timeLen - 1].start_time) {
                            var stime = timings[timeLen - 1].start_time;
                            var stimeToNum = timeToNum(timings[timeLen - 1].start_time);

                            stimeToNum = stimeToNum >= 720 ? 'PM' : 'AM';

                            var showStartTimeSpilt = stime.split(':');
                            var end_hour = showStartTimeSpilt[0];
                            end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                            showStartTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                            stime = showStartTimeSpilt.join(':');

                            timings[timeLen - 1].start_time = stime + " " + stimeToNum;
                        }

                        if (timings[0].end_time) {
                            var etime = timings[0].end_time;
                            var etimeToNum = timeToNum(timings[0].end_time);

                            etimeToNum = etimeToNum >= 720 ? 'PM' : 'AM';

                            var showEndTimeSpilt = etime.split(':');
                            var end_hour = showEndTimeSpilt[0];
                            end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                            showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                            etime = showEndTimeSpilt.join(':');

                            timings[0].end_time = etime + " " + etimeToNum;
                        }

                        if (timings[timeLen - 1].end_time) {
                            var etime = timings[timeLen - 1].end_time;
                            var etimeToNum = timeToNum(timings[timeLen - 1].end_time);

                            etimeToNum = etimeToNum >= 720 ? 'PM' : 'AM';

                            var showEndTimeSpilt = etime.split(':');
                            var end_hour = showEndTimeSpilt[0];
                            end_hour = end_hour > 12 ? end_hour - 12 : end_hour;
                            showEndTimeSpilt[0] = (end_hour + '').length == 1 ? '0' + end_hour : end_hour;
                            etime = showEndTimeSpilt.join(':');

                            timings[timeLen - 1].end_time = etime + " " + etimeToNum;
                        }

                        time_data1 = { day: "Mon-Sat", start_time: timings[0].start_time, end_time: timings[0].end_time };
                        time_data2 = { day: "Sun", start_time: timings[timeLen - 1].start_time, end_time: timings[timeLen - 1].end_time };
                        timing_data.push(time_data1)
                        timing_data.push(time_data2)
                    }

                    var location_data = {
                        _id: locations[j]._id,
                        group_close_days: locations[j].group_close_days,
                        group_special_hours: locations[j].group_special_hours,
                        user_id: locations[j].user_id,
                        role_id: locations[j].role_id,
                        company_id: locations[j].company_id,
                        name: locations[j].name,
                        contact_name: locations[j].contact_name,
                        contact_number: locations[j].contact_number,
                        email: locations[j].email,
                        full_address: locations[j].full_address,
                        latitude: locations[j].latitude,
                        longitude: locations[j].longitude,
                        admin_status: locations[j].admin_status,
                        online_status: locations[j].online_status,
                        status: locations[j].status,
                        paypal_client_id: locations[j].paypal_client_id,
                        paypal_client_secret: locations[j].paypal_client_secret,
                        createdAt: locations[j].createdAt,
                        updatedAt: locations[j].updatedAt,
                        timing: timing_data
                    }

                    var loc_index = locationsData.findIndex(x => x._id === locations[j]._id);
                    if (loc_index == -1) {
                        locationsData.push(location_data);
                    }
                }

                if (locationsData && locationsData.length) {
                    data.locations = locationsData;
                }
            }
        }

        return res.status(200).send({ status: 200, flag: true, data: data, message: "Location data received successfully!" })
    } catch (e) {
        // console.log("Error ",e);
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

const timeToNum = function (time) {
    var matches = time.match(/(\d\d):(\d\d)/);
    return parseInt(60 * matches[1]) + parseInt(matches[2]);
} //ex: 10:00 = 60*10+05 = 605