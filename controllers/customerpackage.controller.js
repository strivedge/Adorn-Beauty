var CustomerService = require('../services/customer.service')
var PackageService = require('../services/package.service')
var ServiceService = require('../services/service.service')
var AppointmentService = require('../services/appointment.service')
var CustomerPackageService = require('../services/customerpackage.service')
var CustomerPackageLogService = require('../services/customerPackageLog.service')
var CustomerUsagePackageService = require('../services/customerUsagePackageService.service')

const {
    isObjEmpty,
    formatDate,
    isValidJson,
    increaseDateDays,
    getDateAddMonths
} = require('../helper')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getCustomerPackages = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var page = req.query.page ? req.query.page : 0; //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000;
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        var order = req.query.order ? req.query.order : '-1';
        var searchText = req.query.searchText ? req.query.searchText : '';

        var query = {};
        if (req.query.status || req.query.status == 0) {
            query['status'] = parseInt(req.query.status);
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
        }

        if (req.query.package_id && req.query.package_id != 'undefined') {
            query['package_id'] = req.query.package_id;
        }

        if (req.query.customer_id && req.query.customer_id != 'undefined') {
            query['customer_id'] = req.query.customer_id;
        }

        if (searchText) {
            query['$or'] = [
                { 'package_data.name': { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { sold_price: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ];
        }

        var CustomerPackages = await CustomerPackageService.getCustomerPackages(query, parseInt(page), parseInt(limit), order_name, Number(order));

        // Return the CustomerPackages list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: CustomerPackages, message: "Customer packages received succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getClientCustomerPackages = async function (req, res, next) {
    try {
        var page = Number(req.query?.page) || 1;
        var limit = Number(req.query?.limit) || 0;
        var sortBy = req.query?.sortBy || '_id';
        var sortOrder = req.query.sortOrder && JSON.parse(req.query.sortOrder) ? '1' : '-1';
        var pageIndex = 0;
        var startIndex = 0;
        var endIndex = 0;

        var customerId = req.query?.customer_id || "";
        var locationId = req.query?.location_id || "";

        if (!customerId) {
            return res.status(200).json({ status: 200, flag: false, data: [], message: "Customer Id must be present!" });
        }

        if (!locationId) {
            return res.status(200).json({ status: 200, flag: false, data: [], message: "Location Id must be present!" });
        }

        var date = getDateAddMonths(null, -3, "YYYY-MM-DD");
        var todayDate = formatDate(null, "YYYY-MM-DD");

        var query = { status: 1 };
        if (date) {
            query.start_date = { $lte: todayDate };
            query.end_date = { $gte: date };
        }

        if (locationId) { query.location_id = locationId; }
        if (customerId) { query.customer_id = customerId; }

        var count = await CustomerPackageService.getCustomerPackagesCount(query);
        var customerPackages = await CustomerPackageService.getCustomerPackageList(query, Number(page), Number(limit), sortBy, Number(sortOrder));
        if (!customerPackages || !customerPackages?.length) {
            if (Number(req.query?.page) && Number(req.query.page) > 0) {
                page = 1;
                customerPackages = await CustomerPackageService.getCustomerPackageList(query, Number(page), Number(limit), sortBy, Number(sortOrder));
            }
        }

        if (customerPackages && customerPackages.length) {
            pageIndex = Number(page - 1);
            startIndex = (pageIndex * limit) + 1;
            endIndex = Math.min(startIndex - 1 + limit, count);
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: customerPackages,
            pages: limit ? Math.ceil(count / limit) : 0,
            total: count,
            pageIndex: pageIndex,
            startIndex: startIndex,
            endIndex: endIndex,
            message: "Customer packages received successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        // console.log("getClientCustomerPackages catch >>> ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCustomerPackage = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id;
        var customerPackage = await CustomerPackageService.getCustomerPackage(id);
        // Return the CustomerPackage list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customerPackage, message: "Customer package received succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCustomerAllPackages = async function (req, res, next) {
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        var date = req.query.date;
        var query = {
            location_id: req.query.location_id,
            customer_id: req.query.customer_id,
            status: 1,
            start_date: { $lte: date }, end_date: { $gte: date }
        };

        var cust_package = await CustomerPackageService.getCustomerPackageSpecific(query);
        var customer_package = [];
        if (cust_package && cust_package?.length > 0) {
            for (var cp = 0; cp < cust_package.length; cp++) {
                var package = cust_package[cp]?.package_data;
                var service_ids = [];
                for (var gs = 0; gs < package.group_services.length; gs++) {
                    var uQuery = {
                        location_id: req.query.location_id, customer_id: req.query.customer_id, service_id: package.group_services[gs].service_id,
                        customer_package_id: cust_package[cp]._id.toString()
                    };

                    if (req.query?.appointment_id) {
                        var appointment = await AppointmentService.getAppointment(req.query.appointment_id);
                        uQuery['appointment_id'] = { $ne: req.query.appointment_id };
                        if (appointment) {
                            uQuery['createdAt'] = { $lt: appointment.createdAt };
                        }
                    }

                    var counting = await CustomerUsagePackageService.getCustomerUsagePackageServiceCount(uQuery);

                    if (counting < package.group_services[gs].session_count) {
                        package.group_services[gs].current_use_session = parseInt(counting) + 1;
                        service_ids.push(package.group_services[gs].service_id);
                    }
                }

                var serviceQuery = { status: 1 };
                serviceQuery['_id'] = { $in: service_ids };
                var services = await ServiceService.getServiceSpecificWithCategory(serviceQuery);
                package.services = services;

                cust_package[cp].package_data = package;
                if (services && services?.length > 0) {
                    customer_package.push(cust_package[cp]);
                }

            }
        }

        // Return the CustomerPackage list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customer_package, message: "Customer package received succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.checkCustomerPackages = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var customer_id = req.query?.customer_id || "";
        if (!customer_id) {
            return res.status(200).json({ status: 200, flag: true, message: "Customer id must be present" })
        }

        var date = req.query?.date || "";
        if (!date) { date = dateFormat(new Date(), "yyyy-mm-dd"); }

        var pkgQuery = {
            location_id: req.query.location_id,
            customer_id: req.query.customer_id,
            status: 1,
            start_date: { $lte: date },
            end_date: { $gte: date }
        }

        var cust_package = await CustomerPackageService.getCustomerPackageSpecific(pkgQuery);
        var customer_package = [];
        if (cust_package && cust_package?.length > 0) {
            for (var cp = 0; cp < cust_package.length; cp++) {
                var package = cust_package[cp]?.package_data || null;
                var service_ids = [];
                if (package?.group_services?.length > 0) {
                    for (var gs = 0; gs < package.group_services.length; gs++) {
                        var uQuery = { location_id: req.query.location_id, customer_id: req.query.customer_id, package_id: cust_package[cp].package_id, service_id: package.group_services[gs].service_id };

                        var counting = await CustomerUsagePackageService.getCustomerUsagePackageServiceCount(uQuery);

                        if (counting < package.group_services[gs].session_count) {
                            service_ids.push(package.group_services[gs].service_id);
                        }
                    }
                }

                var serviceQuery = { status: 1 };
                serviceQuery['_id'] = { $in: service_ids };
                var services = await ServiceService.getServiceSpecificWithCategory(serviceQuery);
                package.services = services;
                cust_package[cp].package_data = package;

                if (services && services?.length > 0) {
                    customer_package.push(cust_package[cp]);
                }
            }
        }

        // Return the CustomerPackage list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: customer_package, message: "Customer package received succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createCustomerPackage = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var packageId = req.body?.package_id || "";
        if (packageId) {
            var package = await PackageService.getPackageOne({ _id: packageId });
            req.body.name = package?.name || "";
            req.body.package_data = package || null;
            var groupServices = package?.group_services || [];
            var serviceIds = [];
            if (groupServices && groupServices?.length) {
                for (let i = 0; i < groupServices.length; i++) {
                    var serviceId = groupServices[i]?.service_id || "";
                    if (serviceId) { serviceIds.push(serviceId); }
                }

                req.body.group_services = groupServices;
            }

            if (serviceIds && serviceIds?.length) {
                req.body.service_id = serviceIds;
            }
        }

        var createdCustomerPackage = await CustomerPackageService.createCustomerPackage(req.body)
        req.body.customer_package_id = createdCustomerPackage?._id || "";
        await CustomerPackageLogService.createCustomerPackageLog(req.body);
        var client = {};
        if (createdCustomerPackage && createdCustomerPackage.customer_id) {
            client = await CustomerService.getCustomerById(createdCustomerPackage.customer_id);
        }

        var pkgQuery = {
            location_id: req.body.location_id,
            customer_id: req.body.customer_id,
            status: 1,
            start_date: { $lte: req.body.date },
            end_date: { $gte: req.body.date }
        }
        var cust_package = await CustomerPackageService.getCustomerPackageSpecific(pkgQuery);
        var customer_package = [];
        if (cust_package && cust_package?.length > 0) {
            for (var cp = 0; cp < cust_package.length; cp++) {
                var package = await PackageService.getPackage(cust_package[cp].package_id);
                var service_ids = [];
                for (var gs = 0; gs < package.group_services.length; gs++) {
                    var uQuery = { location_id: req.body.location_id, customer_id: req.body.customer_id, package_id: cust_package[cp].package_id, service_id: package.group_services[gs].service_id };

                    var counting = await CustomerUsagePackageService.getCustomerUsagePackageServiceCount(uQuery);
                    if (counting < package.group_services[gs].session_count) {
                        package.group_services[gs].current_use_session = parseInt(counting) + 1;
                        service_ids.push(package.group_services[gs].service_id);
                    }
                }

                var serviceQuery = {};
                serviceQuery['_id'] = { $in: service_ids };
                var services = await ServiceService.getServiceSpecificWithCategory(serviceQuery);
                package.services = services;
                cust_package[cp].package_data = package;
                if (services && services?.length > 0) {
                    customer_package.push(cust_package[cp]);
                }
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: createdCustomerPackage,
            client: client,
            customer_package: customer_package,
            message: "Customer package created succesfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateCustomerPackage = async function (req, res, next) {
    try {
        // Id is necessary for the update
        if (!req.body._id) {
            return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
        }
        if (req.body.package_id) {
            var package = await PackageService.getPackageOne({ _id: req.body.package_id });
            req.body.name = package?.name || "";
            req.body.package_data = package || null;
            var groupServices = package?.group_services || [];
            var serviceIds = [];
            if (groupServices && groupServices?.length) {
                for (let i = 0; i < groupServices.length; i++) {
                    var serviceId = groupServices[i]?.service_id || "";
                    if (serviceId) { serviceIds.push(serviceId); }
                }

                req.body.group_services = groupServices;
            }

            if (serviceIds && serviceIds?.length) {
                req.body.service_id = serviceIds;
            }
        }

        var updatedCustomerPackage = await CustomerPackageService.updateCustomerPackage(req.body);
        req.body.customer_package_id = req.body._id;
        await CustomerPackageLogService.createCustomerPackageLog(req.body);
        return res.status(200).json({ status: 200, flag: true, data: updatedCustomerPackage, message: "Customer package updated succesfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCustomerPackage = async function (req, res, next) {
    try {
        var id = req.params.id
        if (!id) {
            return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
        }

        var deleted = await CustomerPackageService.deleteCustomerPackage(id);
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getCustomerPackagesDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : '';
        var order = req.query?.order ? req.query.order : '1';
        var search = req.query?.searchText ? req.query.searchText : "";

        var query = {};
        var pckgQuery = {};
        var existQuery = {};
        if (req.query?.status == "active") {
            query['status'] = 1;
            pckgQuery['status'] = 1;
        }

        if (req.query?.location_id) {
            query['location_id'] = req.query.location_id;
            pckgQuery['location_id'] = req.query.location_id;
        }

        if (req.query?.package_id) { query['package_id'] = req.query.package_id; }
        if (req.query?.customer_id) { query['customer_id'] = req.query.customer_id; }
        if (req.query?.id) { query['_id'] = req.query.id; }

        if (req.query?.ids && isValidJson(req.query.ids)) {
            var ids = JSON.parse(req.query.ids);
            query['_id'] = { $nin: ids };
            existQuery['_id'] = { $in: ids };
        }

        if (search) {
            if (!isNaN(search)) {
                pckgQuery['retail_price'] = { $eq: Number(search), $exists: true };
            } else {
                search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
                pckgQuery['$or'] = [
                    { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { note_for_therapist: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { description: { $regex: '.*' + search + '.*', $options: 'i' } }
                ];
            }

            var packageIds = await PackageService.getPackagesIds(pckgQuery) || []
            if (packageIds && packageIds.length) {
                query['package_id'] = { $in: packageIds };
            }
        }

        var existCustomerPackages = [];
        if (!isObjEmpty(existQuery)) {
            existCustomerPackages = await CustomerPackageService.getCustomerPackagesDropdown(existQuery, orderName, order) || [];
        }

        var customerPackages = await CustomerPackageService.getCustomerPackagesDropdown(query, orderName, order) || [];
        customerPackages = existCustomerPackages.concat(customerPackages) || [];

        return res.status(200).send({ status: 200, flag: true, data: customerPackages, message: "Customer packages dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

// New create customer package based package service
exports.buyCustomerPackage = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var companyId = req.body?.company_id || "";
        var locationId = req.body?.location_id || "";
        var customerId = req.body?.customer_id || "";
        var packageId = req.body?.package_id || "";
        var employeeId = req.body?.employee_id || "";
        var transactionId = req.body?.transaction_id || "";
        var transaction = req.body?.transaction || null;
        var startDate = req.body?.start_date || "";
        var retailPrice = req.body?.retail_price || 0;
        var soldPrice = req.body?.sold_price || 0;
        var comment = req.body?.comment || "";
        var noteForTherapist = req.body?.note_for_therapist || "";
        var customerSignature = req.body?.customer_signature || "";
        var therapistSignature = req.body?.therapist_signature || "";
        var agreeFact = req.body?.agree_fact || 0;

        var throwError = false;
        var message = "Something went wrong!";

        if (!locationId) {
            throwError = true;
            message = "Location id must be present!";
        } else if (!customerId) {
            throwError = true;
            message = "Customer id must be present!";
        } else if (!packageId) {
            throwError = true;
            message = "Package id must be present!";
        } else if (!startDate) {
            throwError = true;
            message = "Start date must be present!";
        }

        var package = null;
        if (packageId) {
            package = await PackageService.getPackageOne({ _id: packageId });
            if (!package || !package._id) {
                throwError = true;
                message = "Package id is not valid!";
            }
        }

        var groupServices = package?.group_services || [];
        if (!groupServices?.length) {
            throwError = true;
            message = "Package not have any services!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: null,
                message: message
            })
        }

        if (startDate) { startDate = formatDate(startDate, "YYYY-MM-DD"); }

        if (!comment) { noteForTherapist = package?.description || ""; }
        if (!noteForTherapist) { noteForTherapist = package?.note_for_therapist || ""; }

        retailPrice = package?.retail_price || 0;
        if (!soldPrice) { soldPrice = retailPrice; }

        var customerPackageData = null;
        var serviceIds = [];
        var sessionCounts = [];
        var serviceIntervals = [];
        if (groupServices && groupServices?.length) {
            for (let i = 0; i < groupServices.length; i++) {
                var serviceId = groupServices[i]?.service_id || "";
                var sessionCount = groupServices[i]?.session_count || 0;
                var serviceInterval = groupServices[i]?.service_interval || 0;
                if (serviceId) {
                    serviceIds.push(serviceId);
                    sessionCounts.push(sessionCount);
                    serviceIntervals.push(serviceInterval);
                }
            }
        }

        if (serviceIds && serviceIds?.length) {
            let maxSessionCount = 0;
            let maxServiceInterval = 0;
            if (sessionCounts && sessionCounts?.length) {
                maxSessionCount = Math.max(...sessionCounts);
            }

            if (serviceIntervals && serviceIntervals?.length) {
                maxServiceInterval = Math.max(...serviceIntervals);
            }

            var noOfDays = Number(maxSessionCount) * Number(maxServiceInterval);
            if (package?.no_of_days) { noOfDays = package.no_of_days; }
            var endDate = increaseDateDays(startDate, noOfDays, "YYYY-MM-DD");

            var cstPackageData = {
                company_id: companyId,
                location_id: locationId,
                customer_id: customerId,
                employee_id: employeeId,
                package_id: packageId,
                package_data: package,
                name: package?.name || "",
                gender: package?.gender || "",
                service_id: serviceIds,
                group_services: groupServices,
                start_date: startDate,
                retail_price: retailPrice,
                sold_price: soldPrice,
                end_date: endDate,
                comment: comment,
                no_of_days: package?.no_of_days || 0,
                note_for_therapist: noteForTherapist,
                agree_fact: agreeFact,
                customer_signature: customerSignature,
                therapist_signature: therapistSignature,
                transaction_id: transactionId,
                transaction: transaction,
                status: 1
            }

            var createdCustPackage = await CustomerPackageService.createCustomerPackage(cstPackageData);
            if (createdCustPackage && createdCustPackage?._id) {
                customerPackageData = createdCustPackage;
                cstPackageData.customer_package_id = createdCustPackage._id;
                await CustomerPackageLogService.createCustomerPackageLog(cstPackageData);
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: customerPackageData,
            message: "Customer package created succesfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.restructureCustomerPackages = async function (req, res, next) {
    try {
        var query = { name: { $eq: "" } };

        var packages = await PackageService.getPackagesOne({});
        var customerPackages = await CustomerPackageService.getCustomerPackageList(query);
        if (customerPackages && customerPackages?.length) {
            for (let i = 0; i < customerPackages.length; i++) {
                let customerPackage = customerPackages[i];
                var packageId = customerPackage?.package_id?._id ? customerPackage.package_id._id : customerPackage?.package_id || "";
                if (customerPackage && customerPackage?._id && packageId) {
                    var payload = { _id: customerPackage._id }
                    var package = packages.find((x) => x._id?.toString() == packageId?.toString()) || null;
                    var serviceIds = [];
                    if (package?.group_services && package?.group_services?.length) {
                        for (let j = 0; j < package.group_services.length; j++) {
                            let groupService = package.group_services[j];
                            var serviceId = groupService?.service_id || "";
                            if (serviceId) { serviceIds.push(serviceId); }
                        }
                    }

                    var companyId = customerPackage?.location_id?.company_id || "";
                    if (companyId) { payload.company_id = companyId; }

                    payload.name = package?.name || "";
                    payload.gender = package?.gender || "";
                    payload.no_of_days = package?.no_of_days || 0;
                    payload.service_id = serviceIds;
                    payload.group_services = package?.group_services || [];
                    payload.package_data = package;

                    await CustomerPackageService.updateCustomerPackage(payload);
                }
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            data: customerPackages,
            message: "Restructured customer package succesfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
