var RoleService = require('../services/role.service');
var PermissionService = require('../services/permission.service');
var ModuleService = require("../services/module.service");
var ObjectId = require('mongodb').ObjectId

// Saving the context of this module inside the _the variable
_this = this;

var systemType = process.env?.SYSTEM_TYPE || ""
var superAdminRole = process.env?.SUPER_ADMIN_ROLE || "607d8aeb841e37283cdbec4b"
var orgAdminRole = process.env?.ORG_ADMIN_ROLE || "6088fe1f7dd5d402081167ee"
var branchAdminRole = process.env?.BRANCH_ADMIN_ROLE || "608185683cf3b528a090b5ad"
var employeeRole = process.env?.EMPLOYEE_ROLE || "608d1cd0558f442514a5a8ad"
var customerRole = process.env?.CUSTOMER_ROLE || "607d8af0841e37283cdbec4c"

// Async Controller function to get the To do List
exports.getRoles = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000;
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        var order = req.query.order ? req.query.order : '-1';
        var searchText = req.query.searchText ? req.query.searchText : '';
        var roleId = req?.roleId || "";

        var query = { status: 1 };
        // if (req.query.company_id && req.query.company_id != 'undefined') {
        //     query['company_id'] = req.query.company_id;
        // }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            //query['location_id'] = req.query.location_id;
            query['$or'] = [
                { location_id: req.query.location_id },
                { is_default: { $eq: 1 } }, { is_super_admin: 1 }
            ];
        }

        if (req.query.searchText && req.query.searchText != 'undefined') {
            query['$or'] = [
                { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
            ];
        }

        if (req.query.role_id && req.query.role_id != 'undefined') {
            var role_data = await RoleService.getRole(req.query.role_id);
            if (role_data && role_data.role_level > 0 && !role_data.is_super_admin) {
                query['role_level'] = { $gte: role_data.role_level };
            }
        }

        if (systemType == "general") {
            if ((roleId && (roleId != superAdminRole)) || !roleId) {
                var roleIds = [
                    // ObjectId(superAdminRole),
                    // ObjectId(orgAdminRole),
                    // ObjectId(branchAdminRole),
                    ObjectId(roleId),
                    ObjectId(customerRole)
                ];

                query['_id'] = { $nin: roleIds };
            }
        }

        // console.log('Roles query', query)
        // console.log('companyId >>> ', req.companyId)
        var roles = await RoleService.getRoles(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText)
        var role = roles[0].data;
        var pagination = roles[0].pagination;
        for (var i = 0; i < role.length; i++) {
            var q = { role_id: role[i]._id };
            if (systemType == "general" && req.query?.company_id) {
                q.company_id = req.query.company_id;
            }

            var permission = await PermissionService.getPermissionss(q);
            let newPermission = [];
            for (let index = 0; index < permission.length; index++) {
                //console.log('permission[index]',permission[index])
                //let module = await JSON.parse(JSON.stringify(permission[index]));
                if (permission[index].module_id) {
                    //console.log("moduleId test==== :",permission[index].module_id);
                    let moduleData = await ModuleService.getModule(permission[index].module_id);
                    if (moduleData) {
                        let moduleTitle = moduleData.title;
                        //console.log('moduleTitle',moduleTitle)
                        permission[index].module_title = moduleTitle;
                        newPermission.push(permission[index]);
                    }
                }
            }

            // console.log('permission ',permission.length);
            if (newPermission) {
                role[i].permission = newPermission;
            }
        }

        roles[0].data = role;
        roles[0].pagination = pagination;

        // Return the Roles list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: roles,
            message: "Roles recieved successfully!"
        });
    } catch (e) {
        console.log("Error ", e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getRoleSpecific = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var roleId = req?.roleId || "";
        var query = { status: 1 };

        if (req.query.company_id && req.query.company_id != 'undefined') {
            //query = {company_id: req.query.company_id,status: 1};
            query['company_id'] = req.query.company_id;
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            //query = {location_id: req.query.location_id,status: 1};
            //query['location_id'] = req.query.location_id;
            query['$or'] = [{ location_id: req.query.location_id },
            { is_default: { $eq: 1 } }];
        }

        if (req.query.role_id && req.query.role_id != 'undefined') {
            var role_data = await RoleService.getRole(req.query.role_id);
            if (role_data && role_data.role_level > 0) {
                query['role_level'] = { $gte: role_data.role_level };
            }
        }

        query['is_super_admin'] = { $ne: 1 };
        query['_id'] = { $ne: ObjectId(customerRole) };
        if (systemType == "general") {
            var roleIds = [
                ObjectId(superAdminRole),
                ObjectId(orgAdminRole),
                ObjectId(branchAdminRole),
                ObjectId(customerRole)
            ];

            if (roleId) { roleIds.push(ObjectId(roleId)); }

            query['_id'] = { $nin: roleIds };
        }

        // var query = { 
        //             $or: [
        //                 { location_id:req.query.location_id},
        //                 { is_default:{$eq:1} }
        //             ],  
        //             is_super_admin:{$ne:1} 
        //            };

        //console.log('query',query)
        var roles = await RoleService.getRoleSpecific(query)

        // Return the Roles list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: roles, message: "Roles recieved successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getRole = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var role = await RoleService.getRole(id);
        var q = { role_id: role._id };
        var permission = await PermissionService.getPermissionss(q);
        let newPermission = [];
        for (let index = 0; index < permission.length; index++) {
            //console.log('permission[index]',permission[index])
            //let module = await JSON.parse(JSON.stringify(permission[index]));
            if (permission[index].module_id) {
                //console.log("moduleId test==== :",permission[index].module_id);
                let moduleData = await ModuleService.getModule(permission[index].module_id);
                if (moduleData) {
                    let moduleTitle = moduleData.title;
                    //console.log('moduleTitle',moduleTitle)
                    permission[index].module_title = moduleTitle;
                    newPermission.push(permission[index]);
                }
            }
        }

        if (newPermission) {
            role.permission = newPermission;
        }

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: role,
            message: "Role recieved successfully!"
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createRole = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        data = req.body.data;
        var createdRole = await RoleService.createRole(req.body);
        if (data && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                var permission = {
                    role_id: createdRole._id,
                    module_id: data[i].module_id,
                    module_name: data[i].module_name,
                    can_read: data[i].can_read,
                    can_create: data[i].can_create,
                    can_update: data[i].can_update,
                    can_delete: data[i].can_delete,
                }

                if (systemType == "general" && req.body?.company_id) {
                    permission.company_id = req.body.company_id;
                }

                var createdPermission = await PermissionService.createPermission(permission)
            }

            return res.status(200).json({ status: 200, flag: true, data: createdPermission, message: "Permission created successfully!" })
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: createdRole,
            message: "Role created successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateRole = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var roleId = req?.roleId || "";

        var data = req.body.data;
        if (req.body._id == superAdminRole) { // Super admin
            req.body.role_level = 1;
        } else if (req.body._id == orgAdminRole) { // Org admin
            req.body.role_level = 2;
        } else if (req.body._id == branchAdminRole) { // Branch admin
            req.body.role_level = 3;
        } else if (req.body._id == employeeRole) { // Therapist
            req.body.role_level = 4;
        } else {
            req.body.role_level = 5;
        }

        var updatedRole = await RoleService.updateRole(req.body);
        if (data && data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                var permission = {
                    role_id: req.body._id,
                    module_id: data[i].module_id,
                    module_name: data[i].module_name,
                    can_read: data[i].can_read,
                    can_create: data[i].can_create,
                    can_update: data[i].can_update,
                    can_delete: data[i].can_delete
                }

                // if (roleId == superAdminRole) {
                //     req.body.company_id = "";
                // }

                if (systemType == "general" && req.body?.company_id) {
                    permission.company_id = req.body.company_id;
                }

                if (data[i] && data[i]?._id) {
                    permission._id = data[i]._id;
                    var updatedPermission = await PermissionService.updatePermission(permission);
                } else {
                    var updatedPermission = await PermissionService.createPermission(permission);
                    // console.log('updated', updatedPermission)
                }
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: updatedRole,
            message: "Role updated successfully!"
        })
    } catch (e) {
        console.log("updateRole catch >>> ", e);
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeRole = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deletedPermission = await PermissionService.deletePermissionByRole(id);

        var deleted = await RoleService.deleteRole(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getMenuByRole = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var role_id = req.query.role_id;
    try {
        var q = { role_id: role_id };
        var permission = await PermissionService.getPermissionss(q);
        var MENUALL = [
            {
                id: 1,
                label: 'MENUITEMS.DASHBOARDS.TEXT',
                name: 'dashboard',
                icon: 'ri-dashboard-line',
                link: '/'
            },
            {
                id: 2,
                label: 'MENUITEMS.APPOINTMENTS.TEXT',
                name: 'appointments',
                icon: 'ri-book-2-line',
                link: '/appointments'
            },
            {
                id: 3,
                label: 'MENUITEMS.APPOINTMENT-LIST.TEXT',
                name: 'appointment_list',
                icon: 'ri-file-list-3-line',
                link: '/appointment-list'
            },
            {
                id: 4,
                label: 'MENUITEMS.DISCOUNT.TEXT',
                name: 'discount',
                icon: 'ri-exchange-dollar-line',
                link: '/discounts'
            },
            {
                id: 5,
                label: 'MENUITEMS.PACKAGE.TEXT',
                name: 'packages',
                icon: 'ri-red-packet-line',
                subItems: [
                    {
                        id: 6,
                        label: 'MENUITEMS.PACKAGE.TEXT',
                        name: 'packages',
                        link: '/packages'
                    },
                    {
                        id: 7,
                        label: 'MENUITEMS.CUSTOMERPACKAGE.TEXT',
                        name: 'customerpackages',
                        link: '/customerpackages'
                    },
                ]
            },
            {
                id: 8,
                label: 'MENUITEMS.MASTER.TEXT',
                name: 'master',
                icon: 'ri-file-user-line',
                subItems: [
                    {
                        id: 9,
                        label: 'MENUITEMS.MASTER.LIST.ROLES',
                        name: 'role',
                        link: '/roles'
                    },
                    {
                        id: 10,
                        label: 'MENUITEMS.MASTER.LIST.USERS',
                        name: 'user',
                        link: '/users'
                    },
                    {
                        id: 11,
                        label: 'MENUITEMS.MASTER.LIST.ORGANIZATION',
                        name: 'company',
                        link: '/organizations'
                    },
                    {
                        id: 12,
                        label: 'MENUITEMS.MASTER.LIST.BRANCH',
                        name: 'location',
                        link: '/branches'
                    },
                    {
                        id: 13,
                        label: 'MENUITEMS.MASTER.LIST.TEST',
                        name: 'service_test',
                        link: '/tests'
                    },
                    {
                        id: 14,
                        label: 'MENUITEMS.MASTER.LIST.CATEGORY',
                        name: 'service_type',
                        link: '/categories'
                    },
                    {
                        id: 15,
                        label: 'MENUITEMS.MASTER.LIST.SERVICE',
                        name: 'service',
                        link: '/services'
                    },
                    {
                        id: 16,
                        label: 'MENUITEMS.MASTER.LIST.CUSTOMPARAMETER',
                        name: 'custom_parameter',
                        link: '/custom-parameters'
                    },
                    {
                        id: 17,
                        label: 'MENUITEMS.MASTER.LIST.CONTENTMASTER',
                        name: 'content_master',
                        link: '/content-masters'
                    },
                    {
                        id: 18,
                        label: 'MENUITEMS.MASTER.LIST.HOLIDAY',
                        name: 'holiday',
                        link: '/holidays'
                    }
                ]
            },
            {
                id: 19,
                label: 'MENUITEMS.STAFF.TEXT',
                name: 'staff',
                icon: 'ri-store-2-line',
                subItems: [
                    {
                        id: 20,
                        label: 'MENUITEMS.STAFF.LIST.EMPLOYEES',
                        name: 'employee',
                        link: '/employees'
                    },
                    {
                        id: 21,
                        label: 'MENUITEMS.STAFF.LIST.ROTA',
                        name: 'rota',
                        link: '/rotas'
                    },
                    {
                        id: 22,
                        label: 'MENUITEMS.STAFF.LIST.LEAVE',
                        name: 'leave',
                        link: '/leaves'
                    },

                ]
            },
            {
                id: 23,
                label: 'MENUITEMS.CUSTOMER.TEXT',
                name: 'customer',
                icon: 'ri-account-circle-line',
                link: '/customers'
            },
            {
                id: 24,
                label: 'MENUITEMS.BLOCKTIME.TEXT',
                name: 'blocktimes',
                icon: 'ri-time-line',
                link: '/blocktimes'
            },
            {
                id: 25,
                label: 'MENUITEMS.SETTING.TEXT',
                name: 'setting',
                icon: 'ri-settings-2-line',
                subItems: [
                    {
                        id: 26,
                        label: 'MENUITEMS.SETTING.LIST.APPVERSION',
                        name: 'app_versions',
                        link: '/appversions'
                    },
                    {
                        id: 27,
                        label: 'MENUITEMS.SETTING.LIST.EMAILTEMPLATE',
                        name: 'email_templates',
                        link: '/emailtemplates'
                    },
                ]
            },
        ];
        var custom_menu = [];

        for (let i = 0; i < MENUALL.length; i++) {
            const element = MENUALL[i];
            //console.log('element',element)
            if (element.name == 'dashboard') {
                custom_menu.push(element);
            } //main module
            var nameCheck = valueExists(element.name, permission)
            if (nameCheck) {
                custom_menu.push(element);
            }
            var custom_submenu = [];
            if (element.subItems && element.subItems.length > 0) {
                var subItems = element.subItems;
                for (let j = 0; j < subItems.length; j++) {
                    const sub_element = subItems[j];
                    var nameCheck = valueExists(sub_element.name, permission)
                    if (nameCheck) {
                        custom_submenu.push(sub_element);
                    }
                }
                element.subItems = custom_submenu;
            }

        }
        // console.log("role ",role)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: custom_menu, message: "Successfully Role Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

function valueExists(name, permission) {
    return permission.some(function (el, i) {
        //console.log('el',el)
        //console.log('i',i)
        return el.module_name === name && el.can_read === 1;
    });
}
