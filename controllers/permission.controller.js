var PermissionService = require('../services/permission.service');

// Saving the context of this module inside the _the variable
_this = this;

var systemType = process.env?.SYSTEM_TYPE || ""

// Async Controller function to get the To do List
exports.getPermissions = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    try {
        var Permissions = await PermissionService.getPermissions({}, page, limit)
        // Return the Permissions list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Permissions, message: "Permissions received successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getPermission = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Permission = await PermissionService.getPermission(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Permission, message: "Permission received successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createPermission = async function (req, res, next) {
    try {
        data = JSON.parse(req.body.data);

        if (data && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                // console.log('data',data[i])
                var permission = {
                    role_id: data[i].role_id,
                    module_id: data[i].module_id,
                    can_read: data[i].can_read,
                    can_create: data[i].can_create,
                    can_update: data[i].can_update,
                    can_delete: data[i].can_delete
                }

                if (systemType == "general" && req.body?.company_id) {
                    permission.company_id = req.body.company_id;
                }

                //console.log('permission',permission)
                var createdPermission = await PermissionService.createPermission(permission)
            }

            return res.status(200).json({ status: 200, flag: true, data: createdPermission, message: "Permission created successfully!" })
        }

        return res.status(200).json({ status: 200, flag: false, message: "Permission Creation was Unsuccesfull" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }

}

exports.updatePermission = async function (req, res, next) {
    try {
        var data = JSON.parse(req.body.data);

        if (data && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                var permission = {
                    role_id: data[i].role_id,
                    module_id: data[i].module_id,
                    can_read: data[i].can_read,
                    can_create: data[i].can_create,
                    can_update: data[i].can_update,
                    can_delete: data[i].can_delete
                }

                if (systemType == "general" && req.body?.company_id) {
                    permission.company_id = req.body.company_id;
                }

                if (data[i]._id && data[i]._id != '') {
                    permission._id = data[i]._id;
                    var updatedPermission = await PermissionService.updatePermission(permission)
                } else {
                    var updatedPermission = await PermissionService.createPermission(permission);
                }
                // console.log('permission',permission)
            }

            return res.status(200).json({ status: 200, flag: true, data: updatedPermission, message: "Permission updated successfully!" })
        }

        return res.status(200).json({ status: 200, flag: false, message: "Permission updated was unsuccesfull!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removePermission = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await PermissionService.deletePermission(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
