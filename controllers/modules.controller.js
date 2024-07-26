var ModuleService = require('../services/module.service');


// Saving the context of this module inside the _the variable
_this = this;
var superAdminRole = process.env?.SUPER_ADMIN_ROLE || "607d8aeb841e37283cdbec4b"

// Async Controller function to get the To do List
exports.getModules = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    try {
        var roleId = req.roleId;
        var except = [];
        var query = {}
        if (roleId != superAdminRole) {
            except = ['email_templates', 'custom_parameter', 'cronjob_parameter', 'cronjob_action'];
            query = { name: { $nin: except } };
        }
        var Modules = await ModuleService.getModules(query, page, limit)
        // Return the Modules list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Modules, message: "Successfully Modules Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomModules = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var except = req.query.except;
    var roleId = req.roleId;
    var query = { name: { $nin: except } };
    if (roleId != superAdminRole) {
        except = ['email_templates', 'custom_parameter', 'cronjob_parameter', 'cronjob_action'];
        query = { name: { $nin: except } };
    }
    try {
        var Modules = await ModuleService.getModules(query, page, limit)
        // Return the Modules list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Modules, message: "Successfully Modules Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getModule = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Module = await ModuleService.getModule(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Module, message: "Successfully Module Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createModule = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdModule = await ModuleService.createModule(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdModule, message: "Successfully Created Module" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Module Creation was Unsuccesfull" })
    }

}

exports.updateModule = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedModule = await ModuleService.updateModule(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedModule, message: "Successfully Updated Module" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeModule = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var deleted = await ModuleService.deleteModule(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}