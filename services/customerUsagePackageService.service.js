// Gettign the Newly created Mongoose Model we just created 
var CustomerUsagePackageService = require('../models/CustomerUsagePackageService.model')
var Service = require('../models/Service.model')
var User = require('../models/User.model')
var ImageService = require('./image.service')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the CustomerUsagePackageServices List
exports.getCustomerUsagePackageServices = async function (query) {
    // Options setup for the mongoose paginate
    // Try Catch the awaited promise to handle the error 
    try {
        var customerUsagePackageServices = await CustomerUsagePackageService.find(query)
        // Return the CustomerUsagePackageServices list that was retured by the mongoose promise
        return customerUsagePackageServices;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerUsagePackageServices');
    }
}

exports.getCustomerUsagePackageServicesCount = async function (query = {}) {
    try {
        var customerUsagePackageServices = await CustomerUsagePackageService.find(query)
            .count()

        return customerUsagePackageServices || 0
    } catch (e) {
        throw Error('Error while Counting CustomerUsagePackageServices')
    }
}

exports.getCustomerUsagePackageServicesOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var customerUsagePackageServices = await CustomerUsagePackageService.find(query)
            .populate({
                path: 'customer_id',
                model: User,
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
                path: 'service_id',
                model: Service,
                select: {
                    _id: 1,
                    category_id: 1,
                    name: 1,
                    duration: 1,
                    gender: 1,
                    reminder: 1,
                    online_status: 1,
                    price: 1,
                    special_price: 1,
                    commission: 1,
                    tax: 1,
                    service_limit: 1,
                    status: 1
                }
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return customerUsagePackageServices || []
    } catch (e) {
        // return a Error message describing the reason     
        throw Error('Error while Paginating CustomerUsagePackageServices')
    }
}

exports.getCustomerUsagePackageService = async function (id) {
    try {
        // Find the CustomerUsagePackageService 
        var _details = await CustomerUsagePackageService.findOne({
            _id: id
        });
        if (_details._id) {
            return _details;
        } else {
            throw Error("CustomerUsagePackageService not available");
        }

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerUsagePackageService not available");
    }
}

exports.getCustomerUsagePackageServiceByCustomerPackageId = async function (id) {
    try {
        // Find the CustomerUsagePackageService 
        var _details = await CustomerUsagePackageService.findOne({
            customer_package_id: id
        });
        if (_details._id) {
            return _details;
        } else {
            throw Error("CustomerUsagePackage not available");
        }

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerUsagePackageService not available");
    }
}

exports.getCustomerUsagePackageServiceSpecific = async function (query, page, limit) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // console.log('query ',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var customerUsagePackageService = await CustomerUsagePackageService.find(query);
        // Return the CustomerUsagePackageService list that was retured by the mongoose promise
        return customerUsagePackageService;

    } catch (e) {
        console.log('e ', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerUsagePackageService');
    }
}

exports.updateManyPackagesClient = async function (query, customer_id) {
    try {
        // Find the Data and replace booking status
        var customerUsagePackageService = await CustomerUsagePackageService.updateMany(query, { $set: { customer_id: customer_id } })

        return customerUsagePackageService;

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("customerUsagePackageService not available");
    }

}

exports.updateManyPackagesSession = async function (query, available_session) {
    try {
        // Find the Data and replace booking status
        var customerUsagePackageService = await CustomerUsagePackageService.updateMany(query, { $inc: { available_session: 1 } });

        return customerUsagePackageService;

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("customerUsagePackageService not available");
    }

}

exports.getCustomerUsageLastPackageService = async function (query) {
    // console.log('query ',query)
    // Try Catch the awaited promise to handle the error 
    try {
        var customerUsagePackageService = await CustomerUsagePackageService.find(query).limit(1).sort({ "createdAt": -1 });
        // Return the CustomerRewards list that was retured by the mongoose promise
        return customerUsagePackageService;

    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerUsagePackageService');
    }
}

exports.getCustomerUsagePackageServiceCount = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var customerUsagePackageService = await CustomerUsagePackageService.aggregate([
            { $match: query },
            {
                $project: {
                    _id: 1,
                    customer_id: 1,
                    service_id: 1,
                    serviceTotalCount: { $cond: [{ $gt: ['$session', 0] }, '$session', 0] },
                }
            },
            {
                $group: {
                    _id: null,
                    SumTotalCount: { $sum: '$serviceTotalCount' },
                }
            }

        ]);
        var total_count = 0;
        if (customerUsagePackageService.length > 0) {
            total_count = customerUsagePackageService[0].SumTotalCount;
        }
        //console.log('customerUsagePackageService',customerUsagePackageService)
        //var customerUsagePackageService = await CustomerUsagePackageService.count(query);
        // Return the CustomerUsagePackageService list that was retured by the mongoose promise
        return total_count;

    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerUsagePackageService');
    }
}

exports.createCustomerUsagePackageService = async function (customerUsagePackageService) {
    if (customerUsagePackageService.customer_signature) {
        var isImage = await ImageService.saveImage(customerUsagePackageService.customer_signature, "/images/signatures/customers/usageService/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            customerUsagePackageService.customer_signature = isImage;
        }
    }

    if (customerUsagePackageService.therapist_signature) {
        var isImage = await ImageService.saveImage(customerUsagePackageService.therapist_signature, "/images/signatures/therapists/usageService/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            customerUsagePackageService.therapist_signature = isImage;
        }
    }

    var newCustomerUsagePackageService = new CustomerUsagePackageService({
        location_id: customerUsagePackageService.location_id ? customerUsagePackageService.location_id : null,
        customer_id: customerUsagePackageService.customer_id ? customerUsagePackageService.customer_id : null,
        package_id: customerUsagePackageService.package_id ? customerUsagePackageService.package_id : null,
        customer_package_id: customerUsagePackageService.customer_package_id ? customerUsagePackageService.customer_package_id : null,
        service_id: customerUsagePackageService.service_id ? customerUsagePackageService.service_id : null,
        employee_id: customerUsagePackageService.employee_id ? customerUsagePackageService.employee_id : null,
        appointment_id: customerUsagePackageService.appointment_id ? customerUsagePackageService.appointment_id : null,
        total_session: customerUsagePackageService.total_session ? customerUsagePackageService.total_session : 0,
        available_session: customerUsagePackageService.available_session ? customerUsagePackageService.available_session : 0,
        session: customerUsagePackageService.session ? customerUsagePackageService.session : 0,
        date: customerUsagePackageService.date ? customerUsagePackageService.date : "",
        customer_signature: customerUsagePackageService.customer_signature ? customerUsagePackageService.customer_signature : "",
        therapist_signature: customerUsagePackageService.therapist_signature ? customerUsagePackageService.therapist_signature : "",
        therapist_comment: customerUsagePackageService.therapist_comment ? customerUsagePackageService.therapist_comment : ""
    })

    try {
        // Saving the CustomerUsagePackageService 
        var savedCustomerUsagePackageService = await newCustomerUsagePackageService.save();
        return savedCustomerUsagePackageService;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomerUsagePackageService")
    }
}

exports.updateCustomerUsagePackageService = async function (customerUsagePackageService) {
    var id = customerUsagePackageService._id
    // console.log("Id ",customerUsagePackageService)
    try {
        //Find the old CustomerUsagePackageService Object by the Id
        var oldCustomerUsagePackageService = await CustomerUsagePackageService.findById(id);
        // console.log('oldCustomerUsagePackageService ',oldCustomerUsagePackageService)
    } catch (e) {
        throw Error("Error occured while Finding the CustomerUsagePackageService")
    }
    // If no old CustomerUsagePackageService Object exists return false
    if (!oldCustomerUsagePackageService) {
        return false;
    }

    //Edit the CustomerUsagePackageService Object 
    if (customerUsagePackageService.location_id) {
        oldCustomerUsagePackageService.location_id = customerUsagePackageService.location_id;
    }

    if (customerUsagePackageService.customer_id) {
        oldCustomerUsagePackageService.customer_id = customerUsagePackageService.customer_id;
    }

    if (customerUsagePackageService.package_id) {
        oldCustomerUsagePackageService.package_id = customerUsagePackageService.package_id;
    }

    if (oldCustomerUsagePackageService.customer_package_id) {
        oldCustomerUsagePackageService.customer_package_id = customerUsagePackageService.customer_package_id;
    }

    if (customerUsagePackageService.service_id) {
        oldCustomerUsagePackageService.service_id = customerUsagePackageService.service_id;
    }

    if (customerUsagePackageService.employee_id) {
        oldCustomerUsagePackageService.employee_id = customerUsagePackageService.employee_id;
    }

    if (customerUsagePackageService.appointment_id) {
        oldCustomerUsagePackageService.appointment_id = customerUsagePackageService.appointment_id;
    }

    if (customerUsagePackageService.total_session) {
        oldCustomerUsagePackageService.total_session = customerUsagePackageService.total_session;
    }

    if (customerUsagePackageService.available_session || customerUsagePackageService.available_session == 0) {
        oldCustomerUsagePackageService.available_session = customerUsagePackageService.available_session ? customerUsagePackageService.available_session : 0;
    }

    if (customerUsagePackageService.session) {
        oldCustomerUsagePackageService.session = customerUsagePackageService.session;
    }

    if (customerUsagePackageService.date) {
        oldCustomerUsagePackageService.date = customerUsagePackageService.date;
    }

    if (customerUsagePackageService.therapist_comment) {
        oldCustomerUsagePackageService.therapist_comment = customerUsagePackageService.therapist_comment;
    }

    if (customerUsagePackageService.customer_signature) {
        var isImage = await ImageService.saveImage(customerUsagePackageService.customer_signature, "/images/signatures/customers/usageService/").then(data => {
            return data;
        });
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            // console.log("\n signatures customers Info >>>>>>",isImage,"\n");

            //Remove Previous App Logo 
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldCustomerUsagePackageService.customer_signature;
                // console.log("\n filePath >>>>>>",filePath,"\n");
                if (oldCustomerUsagePackageService.customer_signature && fs.existsSync(filePath)) {

                    fs.unlinkSync(filePath);
                }

            } catch (e) {
                // console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n");
            }
            //Update customer_signature
            oldCustomerUsagePackageService.customer_signature = isImage;
        }
    }

    if (customerUsagePackageService.therapist_signature) {
        var isImage = await ImageService.saveImage(customerUsagePackageService.therapist_signature, "/images/signatures/therapists/usageService/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            // console.log("\n signatures customers Info >>>>>>",isImage,"\n");

            //Remove Previous App Logo 
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldCustomerUsagePackageService.therapist_signature;
                if (oldCustomerUsagePackageService.therapist_signature && fs.existsSync(filePath)) {

                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                // console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n");
            }
            //Update therapist_signature
            oldCustomerUsagePackageService.therapist_signature = isImage;
        }
    }

    try {
        var savedCustomerUsagePackageService = await oldCustomerUsagePackageService.save()
        return savedCustomerUsagePackageService;
    } catch (e) {
        throw Error("And Error occured while updating the CustomerUsagePackageService");
    }
}

exports.deleteCustomerUsagePackageServiceByFileds = async function (query) {
    // Delete the CustomerUsagePackageService
    try {
        var deleted = await CustomerUsagePackageService.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the AppVersion")
    }
}

exports.deleteCustomerUsagePackageService = async function (id) {
    // Delete the CustomerUsagePackageService
    try {
        var deleted = await CustomerUsagePackageService.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CustomerUsagePackageService Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the AppVersion")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await CustomerUsagePackageService.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerUsagePackageService")
    }
}