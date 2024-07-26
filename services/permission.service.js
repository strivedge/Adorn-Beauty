// Gettign the Newly created Mongoose Model we just created 
var Permission = require('../models/Permission.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Permission List
exports.getPermissions = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }

    // Try Catch the awaited promise to handle the error 
    try {
        var Permissions = await Permission.paginate(query, options)

        // Return the Permissiond list that was retured by the mongoose promise
        return Permissions;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Permissions');
    }
}

exports.getPermissionss = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var Permissions = await Permission.find(query)

        // Return the Permissiond list that was retured by the mongoose promise
        return Permissions;
    } catch (e) {
        console.log("getPermissionss catch >>> ", e);
        // return a Error message describing the reason 
        throw Error('Error while finding Permissions');
    }
}

exports.getPermission = async function (id) {
    try {
        // Find the Data 
        var _details = await Permission.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            throw Error("Permission not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Permission not available");
    }
}

exports.createPermission = async function (permission) {
    var newPermission = new Permission({
        company_id: permission.company_id ? permission.company_id : null,
        role_id: permission.role_id ? permission.role_id : "",
        module_id: permission.module_id ? permission.module_id : "",
        module_name: permission.module_name ? permission.module_name : "",
        can_read: permission.can_read ? 1 : 0,
        can_create: permission.can_create ? 1 : 0,
        can_update: permission.can_update ? 1 : 0,
        can_delete: permission.can_delete ? 1 : 0,
        status: permission.status ? permission.status : 1
    })

    try {
        // Saving the Permission 
        var savedPermission = await newPermission.save();
        return savedPermission;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Permission")
    }
}

exports.updatePermission = async function (permission) {
    var id = permission._id
    try {
        //Find the old Permission Object by the Id
        var oldPermission = await Permission.findById(id);
        //console.log('OldPermission ',oldPermission)
    } catch (e) {
        throw Error("Error occured while Finding the Permission")
    }

    // If no old Permission Object exists return false
    if (!oldPermission) { return false; }

    // Edit the Permission Object
    if (permission.role_id) {
        oldPermission.role_id = permission.role_id;
    }

    if (permission.module_id) {
        oldPermission.module_id = permission.module_id;
    }

    if (permission.module_name || permission.module_name == "") {
        oldPermission.module_name = permission.module_name ? permission.module_name : "";
    }

    if (permission.can_read || permission.can_read == 0) {
        oldPermission.can_read = permission.can_read ? 1 : 0;
    }

    if (permission.can_create || permission.can_create == 0) {
        oldPermission.can_create = permission.can_create ? 1 : 0;
    }

    if (permission.can_update || permission.can_update == 0) {
        oldPermission.can_update = permission.can_update ? 1 : 0;
    }

    if (permission.can_delete || permission.can_delete == 0) {
        oldPermission.can_delete = permission.can_delete ? 1 : 0;
    }

    if (permission.status || permission.status == 0) {
        oldPermission.status = permission.status ? permission.status : 1;
    }

    try {
        var savedPermission = await oldPermission.save()
        return savedPermission;
    } catch (e) {
        throw Error("And Error occured while updating the Permission");
    }
}

exports.deletePermission = async function (id) {
    // Delete the Permission
    try {
        var deleted = await Permission.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Permission Could not be deleted")
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Permission")
    }
}

exports.deletePermissionByRole = async function (role_id) {
    // Delete the Permission
    try {
        var deleted = await Permission.remove({ role_id: role_id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Permission Could not be deleted")
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Permission")
    }
}
