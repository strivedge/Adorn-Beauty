var EmailTemplateService = require('../services/emailTemplate.service');
var MasterEmailTemplateService = require('../services/masterEmailTemplate.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getMasterEmailTemplates = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000;
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        var order = req.query.order ? req.query.order : '-1';
        var searchText = req.query.searchText ? req.query.searchText : "";

        var query = {};
        if (searchText) {
            query['$or'] = [
                { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { type: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { title: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ];
        }

        var masterEmailTemplates = await MasterEmailTemplateService.getMasterEmailTemplates(query, parseInt(page), parseInt(limit), order_name, Number(order));

        // Return the MasterEmailTemplates list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: masterEmailTemplates,
            message: "Master email templates received successfully!"
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getMasterEmailTemplate = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var masterEmailTemplate = await MasterEmailTemplateService.getMasterEmailTemplate(id);

        // Return the MasterEmailTemplate list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: masterEmailTemplate,
            message: "Master email template received successfully!"
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.checkTypeMasterEmailTemplateItem = async function (req, res, next) {
    var type = req.query?.type || "";
    var id = req.query?.id || "";
    if (!type) {
        return res.status(200).json({ status: 200, flag: false, message: "Type must be present!" });
    }

    try {
        var query = { type };
        if (id) { query['_id'] = { $ne: id }; }

        var masterEmailTemplate = await MasterEmailTemplateService.getMasterEmailTemplateOne(query);

        return res.status(200).json({
            status: 200,
            flag: true,
            data: masterEmailTemplate,
            message: "Master email template received successfully!"
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createMasterEmailTemplate = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var type = req.body?.type || "";
        if (type) {
            var masterEmailTemplate = await MasterEmailTemplateService.getMasterEmailTemplateOne({ type });
            if (masterEmailTemplate && masterEmailTemplate?._id) {
                return res.status(200).json({ status: 200, flag: false, message: "Master email template type already exists!" });
            }
        }

        var createdMasterEmailTemplate = await MasterEmailTemplateService.createMasterEmailTemplate(req.body);

        return res.status(200).json({
            status: 200,
            flag: true,
            data: createdMasterEmailTemplate,
            message: "Master email template created successfully!"
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.updateMasterEmailTemplate = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body?._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" });
    }

    try {
        var updatedMasterEmailTemplate = await MasterEmailTemplateService.updateMasterEmailTemplate(req.body);

        return res.status(200).json({
            status: 200,
            flag: true,
            data: updatedMasterEmailTemplate,
            message: "Master email template updated successfully!"
        });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.removeMasterEmailTemplate = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await MasterEmailTemplateService.deleteMasterEmailTemplate(id);
        return res.status(200).send({
            status: 200,
            flag: true,
            message: "Successfully Deleted... "
        });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createDefaultMasterEmailTemplates = async function (req, res, next) {
    try {
        var locationId = req.body?.location_id || "";
        if (!locationId) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: "Location Id must be present!"
            })
        }

        var query = { location_id: locationId };
        var emailTemplates = await EmailTemplateService.getEmailTemplatesSimple(query);
        if (emailTemplates && emailTemplates?.length) {
            var masterEmailTemplates = await MasterEmailTemplateService.getMasterEmailTemplatesOne
                ({});
            if (masterEmailTemplates && masterEmailTemplates?.length) {
                var masterEmailTemplateIds = masterEmailTemplates.map((item) => {
                    return item?._id || ""
                })
                masterEmailTemplateIds = masterEmailTemplateIds.filter((x) => x != "");
                await MasterEmailTemplateService.deleteMultiple({ _id: { $in: masterEmailTemplateIds } });
            }

            for (let i = 0; i < emailTemplates.length; i++) {
                const element = emailTemplates[i];
                var createdMasterEmailTemplate = await MasterEmailTemplateService.createMasterEmailTemplate(element);
            }
        }

        var masterEmailTemplates = await MasterEmailTemplateService.getMasterEmailTemplatesSimple({});

        return res.status(200).json({
            status: 200,
            flag: true,
            data: masterEmailTemplates,
            message: "Default custom parameters created successfully!"
        });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}
