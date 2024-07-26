var CustomerPackageService = require('../services/customerpackage.service')
var CustomerUsagePackageService = require('../services/customerUsagePackageService.service')
var ServiceService = require('../services/service.service')

const { isValidJson } = require('../helper')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getCustomerUsagePackageServices = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var data = req.body;
        if (!data.service_id || !data.service_id.length) {
            return res.status(200).json({ status: 200, flag: false, message: "services must be present" })
        }

        var query = {};
        // console.log("getCustomerUsagePackageServices ",data)
        if (data.company_id && data.company_id != 'undefined') {
            query['company_id'] = data.company_id;
        }

        if (data.location_id && data.location_id != 'undefined') {
            query['location_id'] = data.location_id;
        }

        if (data.customer_package_id && data.customer_package_id != 'undefined') {
            query['customer_package_id'] = data.customer_package_id;
        }

        if (data.customer_id && data.customer_id != 'undefined') {
            query['customer_id'] = data.customer_id;
        }

        var services_id = [];
        for (var i = 0; i < data.service_id.length; i++) {
            services_id.push(data.service_id[i].service_id);
        }

        query['service_id'] = { $in: services_id };
        // console.log("Query ",query)
        var customerUsagePackageServices = await CustomerUsagePackageService.getCustomerUsagePackageServices(query);
        for (var j = 0; j < customerUsagePackageServices.length; j++) {
            var service_id = customerUsagePackageServices[j].service_id;
            var q = { _id: { $in: service_id } };
            var service = await ServiceService.getServiceSpecific(q); // for replace service name
            for (var k = 0; k < service.length; k++) {
                customerUsagePackageServices[j].service_name = service[k].name; //replace service name
            }
        }

        // console.log("datas ",customerUsagePackageServices)
        // Return the AppVersions list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customerUsagePackageServices, message: "Customer usage package services received succesfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getClientCustomerUsagePackageServices = async function (req, res, next) {
    try {
        var page = Number(req.query?.page) || 1;
        var limit = Number(req.query?.limit) || 0;
        var sortBy = req.query?.sortBy || '_id';
        var sortOrder = req.query.sortOrder && JSON.parse(req.query.sortOrder) ? '1' : '-1';
        var pageIndex = 0;
        var startIndex = 0;
        var endIndex = 0;

        var customerPackage = null;
        var companyId = req.query?.company_id || "";
        var locationId = req.query?.location_id || "";
        var customerId = req.query?.customer_id || "";
        var customerPackageId = req.query?.customer_package_id || "";
        var serviceIds = req.query?.services_ids || null;
        if (serviceIds && isValidJson(serviceIds)) {
            serviceIds = JSON.parse(serviceIds);
        }

        if (customerPackageId) {
            customerPackage = await CustomerPackageService.getCustomerPackageOne({ _id: customerPackageId });
            if (!serviceIds || !serviceIds?.length) {
                if (customerPackage?.group_services && customerPackage.group_services?.length) {
                    serviceIds = customerPackage.package_id.group_services.map((item) => {
                        return item?.service_id || "";
                    })

                    serviceIds = serviceIds.filter((x) => x != "");
                }
            }
        }

        var throwError = false;
        var flag = false;
        var message = "Something went wrong!";

        if (!locationId) {
            flag = false;
            throwError = true;
            message = "Location id must be present!";
        } else if (!customerId) {
            flag = false;
            throwError = true;
            message = "Customer id must be present!";
        } else if (!customerPackageId) {
            flag = false;
            throwError = true;
            message = "Customer package id must be present!";
        } else if (!serviceIds) {
            flag = false;
            throwError = true;
            message = "Service ids must be present!";
        } else if (!Array.isArray(serviceIds)) {
            flag = false;
            throwError = true;
            message = "Service ids must be json stringify array!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: [],
                message: message
            })
        }

        var query = {};
        if (companyId) { query['company_id'] = companyId; }
        if (locationId) { query['location_id'] = locationId; }
        if (customerPackageId) { query['customer_package_id'] = customerPackageId; }
        if (customerId) { query['customer_id'] = customerId; }
        if (serviceIds) { query['service_id'] = { $in: serviceIds }; }

        var count = await CustomerUsagePackageService.getCustomerUsagePackageServicesCount(query);
        var customerUsagePackageServices = await CustomerUsagePackageService.getCustomerUsagePackageServicesOne(query, Number(page), Number(limit), sortBy, Number(sortOrder));
        if (!customerUsagePackageServices || !customerUsagePackageServices?.length) {
            if (Number(req.query?.page) && Number(req.query.page) > 0) {
                page = 1;
                customerUsagePackageServices = await CustomerUsagePackageService.getCustomerUsagePackageServicesOne(query, Number(page), Number(limit), sortBy, Number(sortOrder));
            }
        }

        if (customerUsagePackageServices && customerUsagePackageServices.length) {
            pageIndex = Number(page - 1);
            startIndex = (pageIndex * limit) + 1;
            endIndex = Math.min(startIndex - 1 + limit, count);
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            customerPackage: customerPackage,
            data: customerUsagePackageServices,
            pages: limit ? Math.ceil(count / limit) : 0,
            total: count,
            pageIndex: pageIndex,
            startIndex: startIndex,
            endIndex: endIndex,
            message: "Customer usage package services received succesfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCustomerUsagePackageService = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var customerUsagePackageService = await CustomerUsagePackageService.getCustomerUsagePackageService(id);

        // Return the AppVersion list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customerUsagePackageService, message: "Customer usage package service received succesfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomerUsagePackageServiceByCustomerPackageId = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var customerUsagePackageService = await CustomerUsagePackageService.getCustomerUsagePackageServiceByCustomerPackageId(id);

        // Return the AppVersion list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customerUsagePackageService, message: "Customer usage package service received succesfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCustomerUsagePackageByBooking = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var customer_package_id = req.query.customer_package_id ? req.query.customer_package_id.split(",") : [];
        //package_id:req.query.package_id,
        var query = { customer_package_id: { $in: customer_package_id }, appointment_id: req.query.appointment_id };
        var customerUsagePackageService = await CustomerUsagePackageService.getCustomerUsagePackageServices(query);

        // Return the AppVersion list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customerUsagePackageService, message: "Customer usage package service received succesfully!" });
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getUsageServiceSpecific = async function (req, res, next) {
    // console.log("req.body ",req.body)
    var data = req.body;
    try {
        var service_id = [];
        for (var i = 0; i < data.length; i++) {
            service_id.push(data[i].service_id);
        }

        var query = { _id: { $in: service_id } };
        var services = await ServiceService.getServiceforCustomerUsage(query);
        // console.log("Services ",services)

        // Calling the ServiceService function with the new object from the Request Body
        return res.status(200).json({ status: 200, flag: true, data: services, message: "Usage services received succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCountServiceUsage = async function (req, res, next) {
    try {
        var query = {
            location_id: req.body.location_id,
            customer_id: req.body.customer_id,
            package_id: req.body.package_id,
            customer_package_id: req.body.customer_package_id,
            //service_id: req.body.service_id
            //service_id: {$in:req.body.services}
        };

        // console.log("getCountServiceUsage ", query);
        var counting = await CustomerUsagePackageService.getCustomerUsagePackageServiceCount(query);
        counting = counting / req.body.services.length;
        counting = parseInt(counting);
        return res.status(200).json({ status: 200, flag: true, data: counting, message: "Usage counting succesfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createCustomerUsagePackageService = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var createdCustomerUsagePackageService = await CustomerUsagePackageService.createCustomerUsagePackageService(req.body);
        return res.status(200).json({ status: 200, flag: true, data: createdCustomerUsagePackageService, message: "Customer usage package service created succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createUsagePackageServices = async function (req, res, next) {
    // Calling the Service function with the new object from the Request Body
    try {
        // console.log("createUsagePackageServices ",req.body)
        var data = req.body;
        if (data.services && data.services.length) {
            for (var i = 0; i < data.services.length; i++) {
                data.service_id = data.services[i];
                var newData = {
                    _id: '',
                    location_id: data.location_id,
                    customer_id: data.customer_id,
                    employee_id: data.employee_id,
                    package_id: data.package_id,
                    customer_package_id: data.customer_package_id,
                    service_id: data.services[i],
                    total_session: data.total_session,
                    available_session: data.available_session,
                    session_available: data.session_available,
                    session: data.session,
                    old_session: data.old_session,
                    date: data.date,
                    customer_signature: data.customer_signature,
                    therapist_signature: data.therapist_signature,
                    therapist_comment: data.therapist_comment
                };

                var createdCustomerUsagePackageService = await CustomerUsagePackageService.createCustomerUsagePackageService(newData);
            }
        }
        return res.status(200).json({ status: 200, flag: true, message: "Customer usage package service created succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateCustomerUsagePackageService = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedCustomerUsagePackageService = await CustomerUsagePackageService.updateCustomerUsagePackageService(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedCustomerUsagePackageService, message: "Customer usage package service updated succesfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCustomerUsagePackageService = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await CustomerUsagePackageService.deleteCustomerUsagePackageService(id);
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
