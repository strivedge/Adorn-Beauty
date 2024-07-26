// Gettign the Newly created Mongoose Model we just created 
var Role = require('../models/Role.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Role List
exports.getRoles = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        const facetedPipeline = [
            { $match: query },
            { $sort: sort },
            {
                "$facet": {
                    "data": [
                        { "$skip": page },
                        { "$limit": limit }
                    ],
                    "pagination": [
                        { "$count": "total" }
                    ]
                }
            }
        ];

        var roles = await Role.aggregate(facetedPipeline);

        // Return the Roled list that was retured by the mongoose promise
        return roles;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Roles');
    }
}

exports.getRole = async function (id) {
    try {
        // Find the Data 
        var _details = await Role.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            throw Error("Role not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Role not available");
    }
}

exports.getRoleSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        // var roles = await Role.paginate(query, options);
        var roles = await Role.find(query)
            .select({
                _id: 1,
                location_id: 1,
                name: 1
            });

        // Return the Roled list that was retured by the mongoose promise
        return roles;
    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Roles');
    }
}

exports.createRole = async function (role) {
    var newRole = new Role({
        company_id: role.company_id ? role.company_id : "",
        location_id: role.location_id ? role.location_id : "",
        name: role.name,
        role_type: role.role_type ? role.role_type : 0,
        check_all: role.check_all ? role.check_all : 0,
        role_level: role.role_level ? role.role_level : 5,
        is_default: role.is_default ? role.is_default : 0,
        is_super_admin: role.is_super_admin ? role.is_super_admin : 0,
        status: role.status ? role.status : 1,
    })

    try {
        // Saving the Role 
        var savedRole = await newRole.save();
        return savedRole;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Role")
    }
}

exports.updateRole = async function (role) {
    var id = role._id
    try {
        // Find the old Role Object by the Id
        var oldRole = await Role.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Role")
    }

    // If no old Role Object exists return false
    if (!oldRole) { return false; }

    // Edit the Role Object
    if (role.company_id) {
        oldRole.company_id = role.company_id;
    }

    if (!oldRole.is_default && role.location_id) {
        oldRole.location_id = role.location_id;
    }

    if (role.name) {
        oldRole.name = role.name;
    }

    if (role.role_type) {
        oldRole.role_type = role.role_type;
    }

    if (role.check_all || role.check_all == 0) {
        oldRole.check_all = role.check_all ? 1 : 0;
    }

    if (role.role_level) {
        oldRole.role_level = role.role_level ? role.role_level : 5;
    }

    // oldRole.is_default = role.is_default ? role.is_default : 0;
    // oldRole.is_super_admin = role.is_super_admin ? role.is_super_admin : 0;

    if (role.status || role.status == 0) {
        oldRole.status = role.status ? 1 : 0;
    }

    try {
        var savedRole = await oldRole.save()
        return savedRole;
    } catch (e) {
        // console.log(e)
        throw Error("And Error occured while updating the Role");
    }
}

exports.deleteRole = async function (id) {
    // Delete the Role
    try {
        var deleted = await Role.remove({ _id: id })

        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("Role Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Role")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await Role.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Role")
    }
}
