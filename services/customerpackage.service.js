// Gettign the Newly created Mongoose Model we just created 
var CustomerPackage = require('../models/CustomerPackage.model');
var Location = require('../models/Location.model');
var Package = require('../models/Package.model');
var User = require('../models/User.model');
var Customer = require('../models/Customer.model');
var ImageService = require('./image.service');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Customer Packages List
exports.getCustomerPackages = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        // var customerpackages = await CustomerPackage.paginate(query, options)
        var sort = {};
        sort[order_name] = order;

        var customerpackages = await CustomerPackage.aggregate([
            { $match: query },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    service_id: 1,
                    group_services: 1,
                    package_data: 1,
                    name: 1,
                    note_for_therapist: 1,
                    start_date: 1,
                    end_date: 1,
                    old_end_date: 1,
                    retail_price: 1,
                    sold_price: 1,
                    comment: 1,
                    customer_signature: 1,
                    therapist_signature: 1,
                    extension: 1,
                    extended_date: 1,
                    extension_charge: 1,
                    status: 1,
                    agree_fact: 1,
                    createdAt: 1,
                    customer_id: {
                        $toObjectId: "$customer_id"
                    },
                    package_id: {
                        $toObjectId: "$package_id"
                    },
                    employee_id: {
                        $toObjectId: "$employee_id"
                    }
                }
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customer_id',
                    foreignField: '_id',
                    as: 'customer_data'
                }
            },
            // {
            //     $lookup: {
            //         from: 'users',
            //         localField: 'employee_id',
            //         foreignField: '_id',
            //         as: 'employee_data'
            //     }
            // },
            // {
            //     $lookup: {
            //         from: 'packages',
            //         localField: 'package_id',
            //         foreignField: '_id',
            //         as: 'package_data'
            //     }
            // },
            { $unwind: "$customer_data" },
            //{ $unwind: "$employee_data" },
            // { $unwind: "$package_data" },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    service_id: 1,
                    group_services: 1,
                    package_data: 1,
                    name: 1,
                    note_for_therapist: 1,
                    start_date: 1,
                    end_date: 1,
                    old_end_date: 1,
                    retail_price: 1,
                    sold_price: 1,
                    comment: 1,
                    customer_signature: 1,
                    therapist_signature: 1,
                    extension: 1,
                    extended_date: 1,
                    extension_charge: 1,
                    status: 1,
                    agree_fact: 1,
                    createdAt: 1,
                    customer_id: 1,
                    customer_name: "$customer_data.name",
                    employee_id: 1,
                    //employee_name: "$employee_data.name",
                    package_id: 1,
                    // package_name: "$package_data.name",
                    package_group_services: "$group_services"
                }
            },
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
        ]);

        // Return the Userd list that was retured by the mongoose promise
        return customerpackages;
    } catch (e) {
        // console.log("Error ",e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerPackages');
    }
}

exports.getCustomerPackagesCount = async function (query = {}) {
    try {
        var customerPackages = await CustomerPackage.find(query).count()

        return customerPackages
    } catch (e) {
        throw Error('Error while Counting CustomerPackages')
    }
}

exports.getCustomerPackageList = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    // Try Catch the awaited promise to handle the error 
    try {
        var skips = limit * (page - 1);
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var customerPackages = await CustomerPackage.find(query)
            .populate({
                path: 'location_id',
                model: Location,
                select: {
                    _id: 1,
                    company_id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'customer_id',
                model: Customer,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    dob: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })
            .populate({
                path: 'employee_id',
                model: User,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1
                }
            })
            .populate({
                path: 'package_id',
                model: Package,
                select: {
                    _id: 1,
                    name: 1,
                    group_services: 1
                }
            })
            .populate({
                path: 'service_id',
                select: {
                    _id:1,
                    service_limit: 1,
                    name:1,
                    price:1,
                    actual_price:1,
                    variable_price:1,
                    special_price:1,
                    hide_strike_price: 1, 
                    deposite_type: 1, 
                    deposite: 1, 
                    min_deposite: 1, 
                    is_start_from: 1, 
                    start_from_title: 1, 
                    is_price_range: 1, 
                    max_price: 1, 
                    commission:1,
                    tax:1,
                    duration:1,
                    category_id:1,
                    gender:1,
                    reminder: 1,
                    online_status:1,
                    status:1,
                    test_id:1,
                    old_price:1
                }
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit);

        return customerPackages || [];
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomerPackages');
    }
}

exports.getCustomerPackagesOne = async function (query = {}, sort_field = "", sort_type = "-1") {
    // Try Catch the awaited promise to handle the error 
    try {
        var sorts = {};
        if (sort_field) {
            sorts[sort_field] = sort_type;
        }

        var customerPackages = await CustomerPackage.find(query)
            .populate({
                path: 'package_id',
                model: Package,
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .sort(sorts);

        return customerPackages || [];
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomerPackages');
    }
}

exports.getCustomerPackagesWithPackageData = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {

        var customerpackages = await CustomerPackage.aggregate([
            { $match: query },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    service_id: 1,
                    group_services: 1,
                    package_data: 1,
                    name: 1,
                    note_for_therapist: 1,
                    start_date: 1,
                    end_date: 1,
                    old_end_date: 1,
                    retail_price: 1,
                    sold_price: 1,
                    comment: 1,
                    customer_signature: 1,
                    therapist_signature: 1,
                    extension: 1,
                    extended_date: 1,
                    extension_charge: 1,
                    status: 1,
                    agree_fact: 1,
                    createdAt: 1,
                    package_id: {
                        $toObjectId: "$package_id"
                    }
                }
            },
            // {
            //     $lookup: {
            //         from: 'packages',
            //         localField: 'package_id',
            //         foreignField: '_id',
            //         as: 'package_data'
            //     }
            // },
            // { $unwind: "$package_data" },
            {
                $project: {
                    _id: 1,
                    company_id: 1,
                    location_id: 1,
                    service_id: 1,
                    group_services: 1,
                    package_data: 1,
                    name: 1,
                    note_for_therapist: 1,
                    start_date: 1,
                    end_date: 1,
                    old_end_date: 1,
                    retail_price: 1,
                    sold_price: 1,
                    comment: 1,
                    customer_signature: 1,
                    therapist_signature: 1,
                    extension: 1,
                    extended_date: 1,
                    extension_charge: 1,
                    status: 1,
                    agree_fact: 1,
                    createdAt: 1,
                    customer_id: 1,
                    employee_id: 1,
                    package_id: 1,
                    package_name: "$name",
                    package_group_services: "$group_services"
                }
            }
        ]);

        // Return the Userd list that was retured by the mongoose promise
        return customerpackages;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerPackages');
    }
}

exports.getCustomerPackageSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        // Find the CustomerPackage 
        var customerpackages = await CustomerPackage.find(query)
            .select({
                _id: 1,
                customer_id: 1,
                employee_id: 1,
                package_id: 1,
                start_date: 1,
                end_date: 1,
                retail_price: 1,
                sold_price: 1,
                comment: 1,
                extension: 1,
                extended_date: 1,
                extension_charge: 1,
                location_id: 1,
                note_for_therapist: 1,
                group_services: 1,
                service_id: 1,
                package_data: 1
            });

        return customerpackages;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerPackage not available");
    }
}

exports.getCustomerPackageCount = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        // Find the CustomerPackage 
        var customerpackages = await CustomerPackage.find(query).count();

        return customerpackages;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerPackage not available");
    }
}

exports.updateManyPackagesClient = async function (query, customer_id) {
    try {
        // Find the Data and replace booking status
        var customerpackages = await CustomerPackage.updateMany(query, { $set: { customer_id: customer_id } });

        return customerpackages;
    } catch (e) {
        // return a Error message describing the reason
        throw Error("customerpackages not available");
    }
}

exports.getCustomerPackageByFields = async function (id) {
    try {
        // Find the CustomerPackage 
        var _details = await CustomerPackage.findOne({ _id: id })
            .select({ _id: 1, group_services: 1, name: 1, retail_price: 1, note_for_therapist: 1, description: 1 });
        if (_details._id) {
            return _details;
        } else {
            throw Error("CustomerPackage not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerPackage not available");
    }
}

exports.getCustomerPackage = async function (id) {
    try {
        // Find the CustomerPackage 
        var _details = await CustomerPackage.findOne({ _id: id });
        if (_details._id) {
            return _details;
        } else {
            throw Error("CustomerPackage not available");
        }
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("CustomerPackage not available");
    }
}

exports.getCustomerPackageOne = async function (query = {}) {
    try {
        // Find the CustomerPackage 
        var _details = await CustomerPackage.findOne(query)
            .populate({
                path: 'package_id',
                model: Package,
                select: {
                    _id: 1,
                    name: 1,
                    group_services: 1
                }
            });

        return _details || null;
    } catch (e) {
        // console.log(e)
        // return a Error message describing the reason     
        // throw Error("CustomerPackage not available");
        return null;
    }
}

exports.getCustomerPackageBased = async function (query) {
    try {
        // Find the CustomerPackage 
        var _details = await CustomerPackage.findOne(query);
        return _details || null;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerPackage not available");
    }
}

exports.createCustomerPackage = async function (customerpackage) {
    if (customerpackage.customer_signature) {
        var isImage = await ImageService.saveImage(customerpackage.customer_signature, "/images/signatures/customers/").then(data => {
            return data;
        })

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            customerpackage.customer_signature = isImage;
        }
    }

    if (customerpackage.therapist_signature) {
        var isImage = await ImageService.saveImage(customerpackage.therapist_signature, "/images/signatures/therapists/").then(data => {
            return data;
        })

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            customerpackage.therapist_signature = isImage;
        }
    }

    var newCustomerPackage = new CustomerPackage({
        company_id: customerpackage.company_id ? customerpackage.company_id : null,
        location_id: customerpackage.location_id ? customerpackage.location_id : null,
        customer_id: customerpackage.customer_id ? customerpackage.customer_id : null,
        employee_id: customerpackage.employee_id ? customerpackage.employee_id : null,
        package_id: customerpackage.package_id ? customerpackage.package_id : null,
        service_id: customerpackage.service_id?.length ? customerpackage.service_id : null,
        group_services: customerpackage.group_services?.length ? customerpackage.group_services : null,
        name: customerpackage.name ? customerpackage.name : "",
        gender: customerpackage.gender ? customerpackage.gender : "",
        note_for_therapist: customerpackage.note_for_therapist ? customerpackage.note_for_therapist : "",
        start_date: customerpackage.start_date ? customerpackage.start_date : "",
        end_date: customerpackage.end_date ? customerpackage.end_date : "",
        old_end_date: customerpackage.old_end_date ? customerpackage.old_end_date : "",
        retail_price: customerpackage.retail_price ? customerpackage.retail_price : "",
        sold_price: customerpackage.sold_price ? customerpackage.sold_price : "",
        comment: customerpackage.comment ? customerpackage.comment : "",
        no_of_days: customerpackage.no_of_days ? customerpackage.no_of_days : 0,
        customer_signature: customerpackage.customer_signature ? customerpackage.customer_signature : "",
        therapist_signature: customerpackage.therapist_signature ? customerpackage.therapist_signature : "",
        extension: customerpackage.extension ? 1 : 0,
        extended_date: customerpackage.extended_date ? customerpackage.extended_date : "",
        extension_charge: customerpackage.extension_charge ? customerpackage.extension_charge : "",
        status: customerpackage.status ? customerpackage.status : 0,
        agree_fact: customerpackage.agree_fact ? 1 : 0,
        package_data: customerpackage.package_data ? customerpackage.package_data : null,
        transaction_id: customerpackage.transaction_id ? customerpackage.transaction_id : null,
        transaction: customerpackage.transaction ? customerpackage.transaction : null
    });

    try {
        // Saving the CustomerPackage 
        var savedCustomerPackage = await newCustomerPackage.save();
        return savedCustomerPackage;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomerPackage");
    }
}

exports.updateCustomerPackage = async function (customerpackage) {
    try {
        var id = customerpackage._id;
        //Find the old CustomerPackage Object by the Id
        var oldCustomerPackage = await CustomerPackage.findById(id);
        //console.log('oldCustomerPackage ',oldCustomerPackage)
    } catch (e) {
        throw Error("Error occured while Finding the CustomerPackage");
    }

    // If no old CustomerPackage Object exists return false
    if (!oldCustomerPackage) { return false; }

    // Edit the CustomerPackage Object
    if (customerpackage.company_id) {
        oldCustomerPackage.company_id = customerpackage.company_id;
    }

    if (customerpackage.location_id) {
        oldCustomerPackage.location_id = customerpackage.location_id;
    }

    if (customerpackage.customer_id) {
        oldCustomerPackage.customer_id = customerpackage.customer_id;
    }

    if (customerpackage.employee_id) {
        oldCustomerPackage.employee_id = customerpackage.employee_id;
    }

    if (customerpackage.package_id) {
        oldCustomerPackage.package_id = customerpackage.package_id;
    }

    if (customerpackage.service_id) {
        oldCustomerPackage.service_id = customerpackage.service_id;
    }

    if (customerpackage.group_services) {
        oldCustomerPackage.group_services = customerpackage.group_services;
    }

    if (customerpackage.name) {
        oldCustomerPackage.name = customerpackage.name;
    }

    if (customerpackage.gender) {
        oldCustomerPackage.gender = customerpackage.gender;
    }

    if (customerpackage.start_date) {
        oldCustomerPackage.start_date = customerpackage.start_date;
    }

    if (customerpackage.end_date) {
        oldCustomerPackage.end_date = customerpackage.end_date;
    }

    if (customerpackage.old_end_date && customerpackage.extension && !oldCustomerPackage.extended_date) {
        oldCustomerPackage.old_end_date = customerpackage.old_end_date;
    }

    if (customerpackage.retail_price) {
        oldCustomerPackage.retail_price = customerpackage.retail_price;
    }

    if (customerpackage.sold_price) {
        oldCustomerPackage.sold_price = customerpackage.sold_price;
    }

    if (customerpackage.no_of_days) {
        oldCustomerPackage.no_of_days = customerpackage.no_of_days;
    }

    if (customerpackage.customer_signature) {
        var isImage = await ImageService.saveImage(customerpackage.customer_signature, "/images/signatures/customers/").then(data => {
            return data
        })

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public')
            // console.log("\n signatures customers Info >>>>>>", isImage, "\n");
            // Remove Previous App Logo 
            try {
                var fs = require('fs')
                var filePath = root_path + "/" + oldCustomerPackage.customer_signature;
                // console.log("\n filePath >>>>>>", filePath, "\n")
                fs.unlinkSync(filePath)
            } catch (e) {
                // console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n")
            }
            //Update customer_signature
            oldCustomerPackage.customer_signature = isImage
        }
    }

    if (customerpackage.therapist_signature) {
        var isImage = await ImageService.saveImage(customerpackage.therapist_signature, "/images/signatures/therapists/").then(data => {
            return data
        })

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public')
            // console.log("\n signatures customers Info >>>>>>", isImage, "\n")
            // Remove Previous App Logo 
            try {
                var fs = require('fs')
                var filePath = root_path + "/" + oldCustomerPackage.therapist_signature
                // console.log("\n filePath >>>>>>", filePath, "\n")
                fs.unlinkSync(filePath)
            } catch (e) {
                // console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n")
            }
            //Update therapist_signature
            oldCustomerPackage.therapist_signature = isImage
        }
    }

    if (customerpackage.extended_date) {
        oldCustomerPackage.extended_date = customerpackage.extended_date;
    }

    if (customerpackage.extension_charge) {
        oldCustomerPackage.extension_charge = customerpackage.extension_charge;
    }

    if (customerpackage.extension || customerpackage.extension == false) {
        oldCustomerPackage.extension = customerpackage.extension ? 1 : 0;
    }

    if (customerpackage.agree_fact || customerpackage.agree_fact == false) {
        oldCustomerPackage.agree_fact = customerpackage.agree_fact ? 1 : 0;
    }

    if (customerpackage.package_data) {
        oldCustomerPackage.package_data = customerpackage.package_data;
    }

    if (customerpackage.transaction_id) {
        oldCustomerPackage.transaction_id = customerpackage.transaction_id;
    }

    if (customerpackage.transaction) {
        oldCustomerPackage.transaction = customerpackage.transaction;
    }

    if (customerpackage.note_for_therapist || customerpackage.note_for_therapist == "") {
        oldCustomerPackage.note_for_therapist = customerpackage.note_for_therapist ? customerpackage.note_for_therapist : "";
    }

    if (customerpackage.comment || customerpackage.comment == "") {
        oldCustomerPackage.comment = customerpackage.comment ? customerpackage.comment : "";
    }

    if (customerpackage.status || customerpackage.status == 0) {
        oldCustomerPackage.status = customerpackage.status ? customerpackage.status : 0;
    }

    try {
        var savedCustomerPackage = await oldCustomerPackage.save();
        return savedCustomerPackage;
    } catch (e) {
        throw Error("And Error occured while updating the CustomerPackage");
    }
}

exports.deleteCustomerPackage = async function (id) {
    // Delete the CustomerPackage
    try {
        var deleted = await CustomerPackage.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CustomerPackage Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerPackage")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await CustomerPackage.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerPackage")
    }
}

// This is only for dropdown
exports.getCustomerPackagesDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var customerPackages = await CustomerPackage.find(query)
            .populate({
                path: 'package_id',
                model: Package,
                select: {
                    _id: 1,
                    group_services: 1,
                    name: 1,
                    retail_price: 1,
                    note_for_therapist: 1,
                    description: 1,
                }
            })
            .sort(sorts);

        return customerPackages;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown customerPackages');
    }
}
