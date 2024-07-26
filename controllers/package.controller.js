var PackageService = require('../services/package.service')
var ServiceService = require('../services/service.service')
var CustomerPackageService = require('../services/customerpackage.service')

const { isObjEmpty, isValidJson } = require('../helper')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getPackages = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 0 //skip raw value
        var limit = req.query.limit ? req.query.limit : 1000
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt'
        var order = req.query.order ? req.query.order : '-1'
        var searchText = req.query.searchText ? req.query.searchText : ''

        var query = { status: 1 }
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        if (searchText) {
            query['$or'] = [
                { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
                { retail_price: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ]
        }

        var Packages = await PackageService.getPackages(query, parseInt(page), parseInt(limit), order_name, Number(order))

        // Return the Packages list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Packages, message: "Packages recieved succesfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getActivePackages = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 1;
        var limit = req.query.limit ? req.query.limit : 1000;
        var query = { status: 1 };
        if (req.query.company_id) {
            query['company_id'] = req.query.company_id;
        }

        if (req.query.location_id) {
            query['location_id'] = req.query.location_id;
        }

        if (req.query.is_sale_online) {
            query['is_sale_online'] = req.query.is_sale_online;
        }

        var Packages = await PackageService.getActivePackages(query, page, limit)

        // Return the Packages list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Packages, message: "Packages recieved succesfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getPackage = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Package = await PackageService.getPackage(id)
        // Return the Package list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Package, message: "Package recieved succesfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getPackageOne = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var package = await PackageService.getPackageOne({ _id: id })
        if (package && package?._id) {
            if (package?.group_services && package.group_services?.length) {
                var serviceIds = package.group_services.map((item) => {
                    return item?.service_id || ""
                })

                if (serviceIds && serviceIds?.length) {
                    serviceIds = serviceIds.filter((x) => x != "")
                }

                var services = await ServiceService.getServicesDropdown({ _id: { $in: serviceIds } }) || []
                package.services = services
            }
        }

        // Return the Package list with Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: package, message: "Package recieved succesfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createPackage = async function (req, res, next) {
    try {
        // console.log('req body',req.body)
        // Calling the Service function with the new object from the Request Body
        var createdPackage = await PackageService.createPackage(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdPackage, message: "Package created succesfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updatePackage = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedPackage = await PackageService.updatePackage(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedPackage, message: "Package updated succesfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removePackage = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await PackageService.deletePackage(id);
        res.status(200).send({ status: 200, flag: true, message: "Succesfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getPackagesDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : ""
        var order = req.query?.order ? req.query.order : "1"
        var search = req.query?.searchText ? req.query.searchText : ""

        var query = {}
        var existQuery = {}
        if (req.query?.status == "active") {
            query['status'] = 1
        }

        if (req.query?.location_id) {
            query['location_id'] = req.query.location_id
        }

        if (req.query?.is_sale_online) {
            query['is_sale_online'] = req.query.is_sale_online
        }

        if (req.query?.id) {
            query['_id'] = req.query.id
        }

        if (req.query?.ids && isValidJson(req.query.ids)) {
            var ids = JSON.parse(req.query.ids)
            query['_id'] = { $nin: ids }
            existQuery['_id'] = { $in: ids }
        }

        if (search) {
            if (!isNaN(search)) {
                query['retail_price'] = { $eq: Number(search), $exists: true }
            } else {
                search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
                query['$or'] = [
                    { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { note_for_therapist: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { description: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }
        }

        var existPackages = []
        if (!isObjEmpty(existQuery)) {
            existPackages = await PackageService.getPackagesDropdown(existQuery, orderName, order) || []
        }

        var packages = await PackageService.getPackagesDropdown(query, orderName, order) || []
        packages = existPackages.concat(packages) || []

        return res.status(200).send({ status: 200, flag: true, data: packages, message: "Packages dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

// ** Active public online packages list
exports.getPublicOnlinePackges = async function (req, res, next) {
    try {
        var page = Number(req.query?.page) || 1
        var limit = Number(req.query?.limit) || 0
        var sortBy = req.query?.sortBy || '_id'
        var sortOrder = req.query.sortOrder && JSON.parse(req.query.sortOrder) ? '1' : '-1'
        var search = req.query?.searchText ? req.query.searchText : ""
        var pageIndex = 0
        var startIndex = 0
        var endIndex = 0

        var query = { is_sale_online: 1, status: 1 }
        if (req.query?.status == "active") {
            query['status'] = 1
        }

        if (req.query?.company_id) {
            query['company_id'] = req.query.company_id
        }

        if (req.query?.location_id) {
            query['location_id'] = req.query.location_id
        }

        if (search) {
            if (!isNaN(search)) {
                query['retail_price'] = { $eq: Number(search), $exists: true }
            } else {
                search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
                query['$or'] = [
                    { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { note_for_therapist: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { description: { $regex: '.*' + search + '.*', $options: 'i' } }
                ]
            }
        }

        var count = await PackageService.getPackagesCount(query)
        var packages = await PackageService.getPackagesOne(query, Number(page), Number(limit), sortBy, Number(sortOrder))
        if (!packages || !packages?.length) {
            if (Number(req.query?.page) && Number(req.query.page) > 0) {
                page = 1
                packages = await PackageService.getPackagesOne(query, Number(page), Number(limit), sortBy, Number(sortOrder))
            }
        }

        if (packages && packages.length) {
            pageIndex = Number(page - 1)
            startIndex = (pageIndex * limit) + 1
            endIndex = Math.min(startIndex - 1 + limit, count)
        }

        return res.status(200).send({
            status: 200,
            flag: true,
            data: packages,
            pages: limit ? Math.ceil(count / limit) : 0,
            total: count,
            pageIndex: pageIndex,
            startIndex: startIndex,
            endIndex: endIndex,
            message: "Online public packages received successfully!"
        })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}

// Get multi service package
exports.getMultiServicePackages = async function (req, res, next) {
    try {

        var query = { "$expr": { $gt: [{ $size: "$group_services" }, 1] }, status: 1 }

        var packages = await PackageService.getPackagesDropdown(query) || [];
        var cust_pack = [];
        var cust_pack_ids = ['64394d2b70d17a4a0af3f9a6', '648d882b1217a00e3886d07b']

        var date = "2023-12-13"

        var query2 = {
            status: 1,
            start_date: { $lte: date }, end_date: { $gte: date }
        }

        for (var i = 0; i < packages.length; i++) {
            query2['package_id'] = packages[i]._id;
            var cust_package = await CustomerPackageService.getCustomerPackageSpecific(query2)
            if (cust_package && cust_package.length > 0) {
                cust_pack.push({ package: packages[i].group_services, cust_package: cust_package.length, customer_packge_id: cust_package[0]._id })
            }

        }

        return res.status(200).send({ status: 200, flag: true, data: packages.length, cust_pack: cust_pack, message: "Packages dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}