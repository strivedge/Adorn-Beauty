var ObjectId = require('mongodb').ObjectID;
var CategoryService = require('../services/category.service');
var CompanyService = require('../services/company.service');
var ContentMasterService = require('../services/contentMaster.service');
var CronjobActionService = require('../services/cronjobAction.service');
var CronjobParameterService = require('../services/cronjobParameter.service');
var CustomParameterService = require('../services/customParameter.service');
var EmailTemplateService = require('../services/emailTemplate.service');
var LocationService = require('../services/location.service');
var ServiceService = require('../services/service.service');
var TestService = require('../services/test.service');
var UserService = require('../services/user.service');

// ** Master
var MasterContentMasterService = require('../services/masterContentMaster.service');
var MasterCronjobActionService = require('../services/masterCronjobAction.service');
var MasterCronjobParameterService = require('../services/masterCronjobParameter.service');
var MasterCustomParameterService = require('../services/masterCustomParameter.service');
var MasterEmailTemplateService = require('../services/masterEmailTemplate.service');
var MasterCustomParameterSettingService = require('../services/masterCustomParameterSetting.service');
var CustomParameterSettingService = require('../services/CustomParameterSetting.service')

_this = this;

// Async Controller function to get the To do List
exports.getCompanies = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000;
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        var order = req.query.order ? req.query.order : '-1';
        var searchText = req.query.searchText ? req.query.searchText : '';
        var id = req.query.id ? req.query.id : '';

        var query = {};
        if (searchText) {
            query['$or'] = [
                { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { email: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { contact_number: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ];
        }

        if (id) {
            query['_id'] = ObjectId(id);
        }

        // console.log('query', query)
        var companies = await CompanyService.getCompanies(query, parseInt(page), parseInt(limit), order_name, Number(order))

        // Return the Companies list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: companies, message: "Companies recieved successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getActiveCompanies = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var show_to_customer = req.query.show_to_customer ? req.query.show_to_customer : '';
        var query = { status: 1 };
        if(show_to_customer == 1 ){
            query['show_to_customer'] = show_to_customer;
        }
        var companies = await CompanyService.getActiveCompanies(query)
        // Return the Companies list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: companies, message: "Companies recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

function makeid(length) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

async function copyLocationData(current_location, new_location) {
    try {
        // Current Location Category
        var current_category = await CategoryService.getActiveCategories({ location_id: current_location });

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

        return true;
    } catch (e) {
        console.log(e)
        return link;
    }
}

exports.copyCompanyData = async function (req, res, next) {
    try {
        var new_company_id = req.body.new_company_id;
        var company_id = req.body.company_id;

        var locations = await LocationService.getAllActiveLocations({ status: 1, company_id: company_id });
        locations = locations.map(function (x) {
            x.company_id = new_company_id;
            return x
        })

        if (locations && locations.length > 0) {
            for (var i = 0; i < locations.length; i++) {
                var unique_id = makeid(10);
                var ldomain = locations[i].email.split('@');
                locations[i].email = unique_id + "@" + ldomain[1];

                var userData = {
                    name: locations[i].name,
                    email: locations[i].email,
                    mobile: locations[i].email,
                    company_id: locations[i].company_id,
                    role_id: process.env?.BRANCH_ADMIN_ROLE || '608185683cf3b528a090b5ad', //Location Admin role
                }

                // Create User           
                var createdUser = await UserService.createUser(userData);
                if (createdUser) {
                    locations[i].user_id = createdUser._id;
                }

                var createdLocation = await LocationService.createLocation(locations[i]);
                if (createdLocation) {
                    var userData = {
                        _id: createdUser._id,
                        location_id: createdLocation._id,
                    }
                    var updateUser = await UserService.updateUser(userData);

                    var new_location_id = createdLocation._id;

                    await copyLocationData(locations[i]._id, new_location_id)

                    // var query = { status: 1, location_id: locations[i]._id }
                    // var categories = await CategoryService.getAllActiveCategories(query);
                    // categories = categories.map(function (x) {
                    //     x.location_id = new_location_id;
                    //     return x
                    // });

                    // var services = await ServiceService.getAllActiveServices(query);
                    // services = services.map(function (x) {
                    //     x.location_id = new_location_id;
                    //     return x
                    // });

                    // var tests = await TestService.getAllActiveTests(query);
                    // tests = tests.map(function (x) {
                    //     x.location_id = new_location_id;
                    //     return x
                    // });

                    // await CategoryService.createMultipleCategory(categories);
                    // await ServiceService.createMultipleServices(services);
                    // await TestService.createMultipleTests(tests);
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: locations, message: "Successfully Companies Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCompany = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id;

        var company = await CompanyService.getCompany(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: company, message: "Company recieved successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCompanyByDomain = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var domain = req.params.domain;

        var company_id = req.query.company_id;

        if(company_id){
            var company = await CompanyService.getCompanyOne({_id: company_id})
        }else{
             var company = await CompanyService.getCompanyByDomain(domain)
        }

       
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: company, message: "Company recieved successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCompanyLocationByDomain = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var locations = [];
        var domain = req.params.domain;
        var company = await CompanyService.getCompanyByDomain(domain);
        if (company && company._id) {
            var query = { status: 1, online_status: 1 };
            query['company_id'] = ObjectId(company._id.toString());
            locations = await LocationService.getActiveLocations(query);
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: company, locations: locations, message: "Company recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.checkIsDomainUnique = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var domain = req.body.domain;
    //console.log('domain',domain)
    try {
        var query = { domain: domain }
        var Company = await CompanyService.getComanyByDomain(query);
        if (Company && Company._id) {
            flag = false;
            message = 'Domain already exists';
        } else {
            flag = true;
            message = 'Domain does not exists';
        }
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: flag, data: Company, message: message });
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createCompany = async function (req, res, next) {
    //console.log('req body',req.body)
    try {
        var userData = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.contact_number,
            password: req.body.password,
            role_id: process.env?.ORG_ADMIN_ROLE || '6088fe1f7dd5d402081167ee', //Company admin role
        }
        // Create User           
        var createdUser = await UserService.createUser(userData);
        if (createdUser && createdUser._id) {
            req.body.user_id = createdUser._id;
        }

        var createdCompany = await CompanyService.createCompany(req.body);
        if (createdCompany && createdCompany._id) {
            var userData = {
                _id: createdUser._id,
                company_id: createdCompany._id,
            }

            var updateUser = await UserService.updateUser(userData)
        }

        return res.status(200).json({ status: 200, flag: true, data: createdCompany, message: "Company created successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateCompany = async function (req, res, next) {
    // Id is necessary for the update
    try {
        if (!req.body._id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
        }
        
        if (req.body.user_id && (req.body.password || req.body.email)) {
            var userData = {
                name: req.body.name,
                mobile: req.body.contact_number,
                email: req.body.email,
                password: req.body.password,
                company_id: req.body._id,
                role_id: process.env?.ORG_ADMIN_ROLE || '6088fe1f7dd5d402081167ee', //Location Admin role
            }
            var user = await UserService.getUser(req.body.user_id);
            // console.log('user', user)
            if (user && user._id) {
                userData._id = req.body.user_id;
                var updatedUser = await UserService.updateUser(userData)
                // console.log('updatedUser', updatedUser)
            } else {
                var User = await UserService.getUserbyEmail(req.body.email);
                if (User && User._id) {
                    return res.status(200).json({ status: 200, flag: false, data: User, message: "Email already exists" });
                }

                var createdUser = await UserService.createUser(userData);
                if (createdUser) {
                    req.body.user_id = createdUser._id;
                }
                //console.log('createdUser._id',createdUser._id)
            }
        }
        
        var updatedCompany = await CompanyService.updateCompany(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedCompany, message: "Company updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCompany = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var company = await CompanyService.getCompany(id);
        if (company && company.user_id) {
            var deleted = await UserService.deleteUser(company.user_id);
        }

        var deleted = await CompanyService.deleteCompany(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.syncCompanyData = async function (req, res, next) {
    try {
        if (!req.query.company_id) {
            return res.status(200).json({ status: 200, flag: false, message: "Company Id must be present!" })
        }

        var companyId = req.query?.company_id || "";

        // ** Masters
        var masterContentMasters = await MasterContentMasterService.getMasterContentMastersSimple({});
        var masterCronJobActions = await MasterCronjobActionService.getMasterCronjobActionsSimple({});
        //var masterCronjobParameters = await MasterCronjobParameterService.getMasterCronjobParametersSimple({});
        //var masterCustomParameters = await MasterCustomParameterService.getMasterCustomParametersSimple({});

        var masterCustomParameters = await MasterCustomParameterSettingService.getMasterCustomParameterSettingSimple({});

        var masterEmailTemplates = await MasterEmailTemplateService.getMasterEmailTemplatesSimple({})

        var companyQuery = { company_id: companyId, location_id: "" };

        /* Content Masters */
        var contentMasters = await ContentMasterService.getContentMastersSimple(companyQuery);
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
                    item.master_content_master_id = item._id;

                    await ContentMasterService.createContentMaster(item);
                }
            }
        }
        /* /Content Masters */

        /* CronJob Actions */
        var cronJobActions = await CronjobActionService.getCronjobActionsSimple(companyQuery);
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
                    item.master_cronjob_action_id = item._id;

                    await CronjobActionService.createCronjobAction(item)
                }
            }
        }
        /* /CronJob Actions */

        /* CronJob Parameters */
        // var cronjobParameters = await CronjobParameterService.getCronjobParametersSimple(companyQuery);
        // if (masterCronjobParameters && masterCronjobParameters?.length) {
        //     for (let i = 0; i < masterCronjobParameters.length; i++) {
        //         let item = masterCronjobParameters[i];
        //         var cronjobParameter = cronjobParameters.find(x => x.key_url == item?.key_url);
        //         if (cronjobParameter && cronjobParameter?._id) {
        //             if (!cronjobParameter?.master_cronjob_parameter_id) {
        //                 cronjobParameter.master_cronjob_parameter_id = item._id;
        //                 await CronjobParameterService.updateCronjobParameter(cronjobParameter);
        //             }
        //         } else {
        //             item.company_id = companyId;
        //             item.master_cronjob_parameter_id = item._id;

        //             await CronjobParameterService.createCronjobParameter(item);
        //         }
        //     }
        // }
        /* /CronJob Parameters */

        /* Custom Parameters */
        var customParameters = await CustomParameterSettingService.getCustomParameterSettingsSimple({ company_id: companyId, location_id: null });
        if (masterCustomParameters && masterCustomParameters?.length) {
            for (let i = 0; i < masterCustomParameters.length; i++) {
                let item = masterCustomParameters[i];
                var custParameter = customParameters.find(x => x.category == item?.category);
                if (custParameter && custParameter?._id) {
                    if (!custParameter?.master_custom_parameter_id) {
                        custParameter.master_custom_parameter_id = item._id;
                        await CustomParameterSettingService.updateCustomParameterSetting(custParameter);
                    }
                } else {
                    item.company_id = companyId;
                    item.master_custom_parameter_id = item._id;

                    await CustomParameterSettingService.createCustomParameterSetting(item);
                }
            }
        }
        /* /Custom Parameters */

        /* Email Templates */
        var emailTemplates = await EmailTemplateService.getEmailTemplatesSimple(companyQuery);
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
                    item.master_email_template_id = item._id;

                    await EmailTemplateService.createEmailTemplate(item);
                }
            }
        }
        /* /Email Templates */

        return res.status(200).json({
            status: 200,
            flag: true,
            message: "Company synced successfully!"
        })
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}