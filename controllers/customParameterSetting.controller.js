var ContentService = require('../services/contents.service')
var CompanyService = require('../services/company.service');
var CustomParameterSettingService = require('../services/CustomParameterSetting.service')
var LocationService = require('../services/location.service')
var MasterCustomParameterSettingService = require('../services/masterCustomParameterSetting.service');

// Saving the context of this module inside the _the variable
_this = this;
var ObjectId = require('mongodb').ObjectId;

const { getCustomParameterData } = require('../helper');

// Async Controller function to get the To do List
exports.getCustomParameters = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';
    var query = {};
    console.log('req.query.company_id', req.query.company_id)
    if (req.query.company_id) {
        query['company_id'] = ObjectId(req.query.company_id);
    }

    if (req.query.location_id) {
        query['location_id'] = req.query.location_id;
    } else {
        query['location_id'] = null;
    }

    if (req.query.category) {
        query['category'] = req.query.category;
    }

    if (searchText) {
        query['$or'] = [
            { category: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { title: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { desc: { $regex: '.*' + searchText + '.*', $options: 'i' } },
        ];
    }

    try {
        var customParameters = await CustomParameterSettingService.getCustomParameterSettings(query, parseInt(page), parseInt(limit), order_name, Number(order));
        // Return the CustomParameters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameters, message: "Custom parameters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// Async Controller function to get the To do List
exports.getCustomParametersbyCategory = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value

    var cquery = {};
    var lquery = {};
    if (req.query?.company_id) {
        cquery['company_id'] = req.query.company_id;
        lquery['company_id'] = req.query.company_id;
    }

    if (req.query?.location_id) {
        lquery['location_id'] = req.query.location_id;
    }

    if (req.query?.category) {
        cquery['category'] = req.query.category;
        lquery['category'] = req.query.category;
    }

    try {
        var comData = await CustomParameterSettingService.getSpecificCustomParameterSetting(cquery);

        var locData = await CustomParameterSettingService.getSpecificCustomParameterSetting(lquery);

        return res.status(200).json({ status: 200, flag: true, comCPData: comData, locCPData: locData, message: "Custom parameters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// This is for all distinct category name
exports.getAllDistinctCategory = async function (req, res, next) {
    try {
        var customParameters = await CustomParameterSettingService.getDistinctCategory();
        return res.status(200).json({ status: 200, flag: true, data: customParameters, message: "Distint Custom parameters recieved!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// Async Controller function to get the To do List
exports.getAllCustomParametersbyOrg = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    // console.log("getAllCustomParametersbyOrg ",query)
    try {
        var customParameters = await CustomParameterSettingService.getAllCustomParameterSettings(query)
        // Return the CustomParameters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameters, message: "Custom parameters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getSpecificCustomParameter = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {

        var query = {};
        if (req.body.company_id && req.body.company_id != 'undefined') {
            query['company_id'] = req.body.company_id;
        }
        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id;
        }
        if (!req.body.company_id) {
            var location = await LocationService.getLocation(req.body.location_id);
            req.body.company_id = location.company_id
        }
        if (req.body.key_url) {
            req.body.category = req.body.key_url;
        }
        console.log('req.body.company_id,', req.body)
        var customParameter = await getCustomParameterData(req.body.company_id, req.body.location_id, req.body.category);


        // Return the CustomParameters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameter, message: "Custom parameter recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomParameterLocation = async function (req, res, next) {
    if (!req.query.location_id) {
        return res.status(200).json({ status: 200, flag: false, message: "Location Id must be present!" })
    }
    var query = { location_id: req.query.location_id };

    try {
        var customParameter = await CustomParameterSettingService.getAllCustomParameterSettings(query);
        // Return the CustomParameter list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameter, message: "Custom parameters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.gettingCustomParameter = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value    
    try {
        var customParameters = await CustomParameterSettingService.getCustomParameterSetting(req.body)
        // Return the CustomParameters list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameters, message: "Custom parameters recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomParameter = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var customParameter = await CustomParameterSettingService.getCustomParameterSetting(id)
        // Return the CustomParameter list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customParameter, message: "Custom parameter recieved succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createCompanyCustomParameter = async function (req, res, next) {
    try {

        var companies = await CompanyService.getActiveCompanies({ status: 1 })

        if (companies && companies?.length > 0) {
            for (var c = 0; c < companies.length; c++) {

                var masterCustomParameters = await MasterCustomParameterSettingService.getMasterCustomParameterSettingSimple({});
                if (masterCustomParameters && masterCustomParameters?.length) {
                    for (let i = 0; i < masterCustomParameters.length; i++) {
                        let item = masterCustomParameters[i];
                        item.company_id = companies[c]._id || "";
                        item.master_custom_parameter_id = item?._id || null;

                        var query = { category: item?.category, company_id: item.company_id, location_id: null }

                        var data = {
                            company_id: item?.company_id,
                            location_id: null,
                            master_custom_parameter_id: item?.master_custom_parameter_id,
                            title: item?.title,
                            category: item?.category,
                            desc: item?.desc,
                            formData: item?.formData
                        }

                        var checkData = await CustomParameterSettingService.getCustomParameterSettingsSimple(query) || [];

                        if (!checkData || checkData?.length == 0) {
                            await CustomParameterSettingService.createCustomParameterSettingIfNotExist(query, data)
                        }
                    }
                }
            }
        }


        return res.status(200).json({ status: 200, flag: true, message: "Custom parameter created succesfully!" })
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createCustomParameter = async function (req, res, next) {
    try {
        if (!req.body.company_id && location_id) {
            var locData = await LocationService.getLocationName({ _id: ObjectId(req.body.location_id) });
            req.body.company_id = locData?.company_id ?? null;
        }
        var updateCustomParameter = null;
        var locAppliedData = req.body.locations ?? [];
        if (!locAppliedData || locAppliedData?.length == 0) {
            locAppliedData = [req.body.location_id];
        }
        var comData = await CustomParameterSettingService.getSpecificCustomParameterSetting({ category: req.body.category, company_id: req.body.company_id })

        locAppliedData = locAppliedData.map(l => ObjectId(l));

        var locations = await LocationService.getActiveLocations({ company_id: ObjectId(req.body.company_id), _id: { $in: locAppliedData }, status: 1 });

        var exceptLocations = await LocationService.getActiveLocations({ company_id: ObjectId(req.body.company_id), _id: { $nin: locAppliedData }, status: 1 });

        if (req.body.location_id && req.body.applied_on == 'location') {

            if (locations && locations?.length > 0) {

                for (var l = 0; l < locations.length; l++) {

                    var l_query = { category: req.body.category, location_id: locations[l]._id }

                    var locData = await CustomParameterSettingService.getSpecificCustomParameterSetting(l_query);
                    comData.formData.applied_on = 'location'
                    var reqData = {
                        master_custom_parameter_id: comData?.master_custom_parameter_id || null,
                        category: req.body.category,
                        company_id: req.body.company_id,
                        location_id: locations[l]._id,
                        desc: req.body?.desc,
                        formData: req.body?.formData,
                        title: req.body?.title,
                    }
                    await CustomParameterSettingService.createOrUpdateCustomParameterSetting(l_query, reqData)
                }
            }

            if (exceptLocations && exceptLocations?.length > 0) {

                for (var l = 0; l < exceptLocations.length; l++) {

                    var l_query = { category: req.body.category, location_id: exceptLocations[l]._id }

                    var locData = await CustomParameterSettingService.getSpecificCustomParameterSetting(l_query);
                    if (!locData && comData) {
                        comData.formData.applied_on = 'location'
                        var reqData = {
                            master_custom_parameter_id: comData?.master_custom_parameter_id || null,
                            category: req.body.category,
                            company_id: req.body.company_id,
                            location_id: exceptLocations[l]._id,
                            desc: comData?.desc,
                            formData: comData?.formData,
                            title: comData?.title,
                        }
                        await CustomParameterSettingService.createOrUpdateCustomParameterSetting(l_query, reqData)
                    }
                }
            }
        }

        if (req.body.applied_on == 'company' || !comData) {

            var locations = await LocationService.getActiveLocations({ company_id: ObjectId(req.body.company_id), status: 1 });

            var locArr = locations.map(l => l._id);

            if (req.body.applied_on == 'company') {
                await CustomParameterSettingService.deleteMultiple({ category: req.body.category, location_id: { $in: locArr } });
            }

            var query = { category: req.body.category, company_id: req.body.company_id, location_id: null }
            req.body.location_id = null;
            updateCustomParameter = await CustomParameterSettingService.createOrUpdateCustomParameterSetting(query, req.body)
        }

        return res.status(200).json({ status: 200, flag: true, data: updateCustomParameter, message: "Custom parameter updated succesfully!" })
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateCustomParameter = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedCustomParameter = await CustomParameterSettingService.updateCustomParameterSetting(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedCustomParameter, message: "Custom parameter updated succesfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCustomParameter = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await CustomParameterSettingService.deleteCustomParameterSetting(id);
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}