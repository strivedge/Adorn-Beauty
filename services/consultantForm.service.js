// Gettign the Newly created Mongoose Model we just created 
var ImageService = require('./image.service')
var User = require('../models/User.model')
var Customer = require('../models/Customer.model')
var Service = require('../models/Service.model')
var Category = require('../models/Category.model')
var ConsultantForm = require('../models/ConsultantForm.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the ConsultantForm List
exports.getConsultantForms = async function (query, page, limit, order_name, order, searchText) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {}
        sort[order_name] = order

        // if(searchText && searchText != ''){
        //     query['$text'] = { $search: searchText, $language:'en',$caseSensitive:false};
        // }

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
        ]

        var ConsultantForms = await ConsultantForm.aggregate(facetedPipeline)

        // Return the ConsultantFormd list that was retured by the mongoose promise
        return ConsultantForms
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating ConsultantForms')
    }
}

exports.getActiveConsultantForms = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var ConsultantForms = await ConsultantForm.find(query)

        // Return the ConsultantFormd list that was retured by the mongoose promise
        return ConsultantForms
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding ConsultantForms')
    }
}

exports.getConsultantForm = async function (id) {
    try {
        // Find the Data 
        var _details = await ConsultantForm.findOne({ _id: id })
        if (_details._id) {
            return _details
        } else {
            throw Error("ConsultantForm not available")
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("ConsultantForm not available")
    }
}

exports.getConsultantFormOne = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await ConsultantForm.findOne(query)
            .populate({
                path: 'client_id',
                model: Customer,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
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
            .populate({
                path: 'category_id',
                model: Category,
                select: {
                    _id: 1,
                    name: 1,
                    gender: 1,
                    desc: 1,
                    before_procedure: 1,
                    after_procedure: 1,
                    online_status: 1,
                    price_list_status: 1,
                    status: 1
                }
            })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        return null
    }
}

// find form with client id
exports.getClientConsultantForm = async function (client_id) {
    try {
        // Find the Data 
        var _details = await ConsultantForm.findOne({
            client_id: { $elemMatch: { $eq: client_id.toString() } }
        }).sort({ updatedAt: -1 })

        return _details
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("ConsultantForm not available")
    }
}

// finding client according to question id
exports.getConsultantFormQuestion = async function (query) {
    try {
        // Find the Data 
        var _details = await ConsultantForm.findOne(query).sort({ createdAt: -1 })

        return _details
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("ConsultantForm not available")
    }
}

exports.updateManyAppointmentClient = async function (query, client_id) {
    try {
        // Find the Data and replace booking status
        var consultantForms = await ConsultantForm.updateMany(query, { $set: { client_id: client_id } })

        return consultantForms
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("ConsultantForm not available");
    }

}

// getting all ConsultantForms for company copy
exports.getConsultantFormsSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var ConsultantForms = await ConsultantForm.find(query)
            .sort({ createdAt: -1 })

        // Return the Serviced list that was retured by the mongoose promise
        return ConsultantForms
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Location')
    }
}

// getting all ConsultantForms for company copy
exports.getConsultantFormsOne = async function (query, sort_field = "", sort_type = "-1") {
    // Try Catch the awaited promise to handle the error 
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var ConsultantForms = await ConsultantForm.find(query)
            .populate({
                path: 'client_id',
                model: Customer,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
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
            .populate({
                path: 'category_id',
                model: Category,
                select: {
                    _id: 1,
                    name: 1,
                    gender: 1,
                    desc: 1,
                    before_procedure: 1,
                    after_procedure: 1,
                    online_status: 1,
                    price_list_status: 1,
                    status: 1
                }
            })
            .populate({
                path: 'employee_id',
                model: User,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    gender: 1,
                    photo: 1,
                    user_order: 1
                }
            })
            .sort(sorts)

        // Return the Serviced list that was retured by the mongoose promise
        return ConsultantForms || []
    } catch (e) {
        // return a Error message describing the reason
        return []
        // throw Error('Getting error while finding consultant!')
    }
}

exports.createConsultantForm = async function (consultantForm) {
    if (consultantForm.before_image && consultantForm.before_image.length > 0) {
        for (var i = 0; i < consultantForm.before_image.length; i++) {
            if (consultantForm.before_image[i].full_path && consultantForm.before_image[i].full_path.startsWith("data:")) {
                var isImage = await ImageService.saveImage(consultantForm.before_image[i].full_path, "/images/consultation/before/").then(data => { return data })
                if (isImage && typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
                    consultantForm.before_image[i] = isImage
                }
            } else {
                if (consultantForm.before_image[i].path) {
                    consultantForm.before_image[i] = consultantForm.before_image[i].path
                } else {
                    consultantForm.before_image.splice(i, 1)
                }
            }
        }
    }

    if (consultantForm.after_image && consultantForm.after_image.length > 0) {
        for (var i = 0; i < consultantForm.after_image.length; i++) {
            if (consultantForm.after_image[i].full_path && consultantForm.after_image[i].full_path.startsWith("data:")) {
                var isImage = await ImageService.saveImage(consultantForm.after_image[i].full_path, "/images/consultation/after/").then(data => { return data })
                if (isImage && typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
                    consultantForm.after_image[i] = isImage
                }
            } else {
                if (consultantForm.after_image[i].path) {
                    consultantForm.after_image[i] = consultantForm.after_image[i].path
                } else {
                    consultantForm.after_image.splice(i, 1)
                }
            }
        }
    }

    if (consultantForm.customer_signature) {
        var fs = require('fs')
        var root_path = require('path').resolve('public');
        fs.mkdir(root_path + "/images/consultation/customer_signature/", (err) => {
            if (err) {
                // console.log(err);
                // return console.error(err);
            }
            // console.log('Directory created successfully!');
        })

        var isImage = await ImageService.saveImage(consultantForm.customer_signature, "/images/consultation/customer_signature/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            consultantForm.customer_signature = isImage
        }
    }

    if (consultantForm.therapist_signature) {
        var fs = require('fs')
        var root_path = require('path').resolve('public');
        fs.mkdir(root_path + "/images/consultation/therapist_signature/", (err) => {
            if (err) {
                // console.log(err);
                // return console.error(err);
            }
            // console.log('Directory created successfully!');
        })

        var isImage = await ImageService.saveImage(consultantForm.therapist_signature, "/images/consultation/therapist_signature/").then(data => { return data })

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            consultantForm.therapist_signature = isImage
        }
    }

    // if(!consultantForm.type || consultantForm.type != 'customer'){
    //     consultantForm.category_id = '';
    // }

    var newConsultantForm = new ConsultantForm({
        company_id: consultantForm.company_id ? consultantForm.company_id : null,
        location_id: consultantForm.location_id ? consultantForm.location_id : null,
        booking_id: consultantForm.booking_id ? consultantForm.booking_id : null,
        employee_id: consultantForm.employee_id ? consultantForm.employee_id : null,
        client_id: consultantForm?.client_id?.length ? consultantForm.client_id : null,
        service_id: consultantForm?.service_id?.length ? consultantForm.service_id : null,
        default: consultantForm.default ? consultantForm.default : [],
        before: consultantForm.before ? consultantForm.before : [],
        after: consultantForm.after ? consultantForm.after : [],
        date: consultantForm.date ? consultantForm.date : "",
        name: consultantForm.name ? consultantForm.name : "",
        first_name: consultantForm.first_name ? consultantForm.first_name : "",
        last_name: consultantForm.last_name ? consultantForm.last_name : "",
        mobile: consultantForm.mobile ? consultantForm.mobile : "",
        email: consultantForm.email ? consultantForm.email : "",
        dob: consultantForm.dob ? consultantForm.dob : "",
        age: consultantForm.age ? consultantForm.age : 0,
        residential_address: consultantForm.residential_address ? consultantForm.residential_address : "",
        surgery_name: consultantForm.surgery_name ? consultantForm.surgery_name : "",
        doctor_name: consultantForm.doctor_name ? consultantForm.doctor_name : "",
        before_image: consultantForm.before_image ? consultantForm.before_image : [],
        after_image: consultantForm.after_image ? consultantForm.after_image : [],
        customer_signature: consultantForm.customer_signature ? consultantForm.customer_signature : "",
        therapist_signature: consultantForm.therapist_signature ? consultantForm.therapist_signature : "",
        pdf: consultantForm.pdf ? consultantForm.pdf : "",
        status: consultantForm.status ? consultantForm.status : 0,
        employee_name: consultantForm.employee_name ? consultantForm.employee_name : "",
        category_id: consultantForm?.category_id?.length ? consultantForm.category_id : null,
        type: consultantForm.type ? consultantForm.type : "booking", // customer or booking
        is_international_number: consultantForm.is_international_number ? consultantForm.is_international_number : 0
    })

    try {
        // Saving the ConsultantForm 
        var savedConsultantForm = await newConsultantForm.save()
        return savedConsultantForm
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating ConsultantForm")
    }
}

exports.updateConsultantFormPdf = async function (consultantForm) {
    try {
        var id = consultantForm._id
        //Find the old ConsultantForm Object by the Id
        var oldConsultantForm = await ConsultantForm.findById(id)
        // console.log('OldConsultantForm ',oldConsultantForm)
    } catch (e) {
        throw Error("Error occured while Finding the ConsultantForm")
    }

    // If no old ConsultantForm Object exists return false
    if (!oldConsultantForm) {
        return false
    }

    if (consultantForm.pdf) {
        // oldConsultantForm.pdf = consultantForm.pdf;
        var root_path = require('path').resolve('public')
        try {
            var fs = require('fs')
            var filePath = root_path + "/" + oldConsultantForm.pdf
            if (oldConsultantForm.pdf && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        } catch (e) {
            // console.log("\n\nPdf Remove Issaues >>>>>>>>>>>>>>\n\n");
        }

        oldConsultantForm.pdf = consultantForm.pdf
    }

    try {
        var savedConsultantForm = await oldConsultantForm.save()
        return savedConsultantForm
    } catch (e) {
        throw Error("And Error occured while updating the ConsultantForm")
    }
}

exports.updateConsultantForm = async function (consultantForm) {
    try {
        var id = consultantForm._id
        // Find the old ConsultantForm Object by the Id
        var oldConsultantForm = await ConsultantForm.findById(id)
        //console.log('OldConsultantForm ',oldConsultantForm)
    } catch (e) {
        throw Error("Error occured while Finding the ConsultantForm")
    }

    // If no old ConsultantForm Object exists return false
    if (!oldConsultantForm) {
        return false
    }
    //Edit the ConsultantForm Object

    if (consultantForm.company_id) {
        oldConsultantForm.company_id = consultantForm.company_id
    }

    if (consultantForm.location_id) {
        oldConsultantForm.location_id = consultantForm.location_id
    }

    if (consultantForm.booking_id) {
        oldConsultantForm.booking_id = consultantForm.booking_id
    }

    if (consultantForm.employee_id) {
        oldConsultantForm.employee_id = consultantForm.employee_id
    }

    if (consultantForm.client_id && consultantForm.client_id.length > 0) {
        oldConsultantForm.client_id = consultantForm.client_id
    }

    if (consultantForm.service_id) {
        oldConsultantForm.service_id = consultantForm.service_id
    }

    if (consultantForm.category_id) {
        oldConsultantForm.category_id = consultantForm.category_id
    }

    if (consultantForm.type) {
        oldConsultantForm.type = consultantForm.type
    }

    if (consultantForm.default) {
        oldConsultantForm.default = consultantForm.default;
    }

    if (consultantForm.before) {
        oldConsultantForm.before = consultantForm.before;
    }

    if (consultantForm.after) {
        oldConsultantForm.after = consultantForm.after;
    }

    if (consultantForm.date) {
        oldConsultantForm.date = consultantForm.date
    }

    if (consultantForm.date) {
        oldConsultantForm.date = consultantForm.date
    }

    if (consultantForm.name) {
        oldConsultantForm.name = consultantForm.name;
    }

    if (consultantForm.first_name) {
        oldConsultantForm.first_name = consultantForm.first_name;
    }

    if (consultantForm.last_name) {
        oldConsultantForm.last_name = consultantForm.last_name
    }

    if (consultantForm.mobile) {
        oldConsultantForm.mobile = consultantForm.mobile;
    }

    if (consultantForm.email || consultantForm.email == '') {
        oldConsultantForm.email = consultantForm.email
    }

    if (consultantForm.dob) {
        oldConsultantForm.dob = consultantForm.dob;
    }
    if (consultantForm.age) {
        oldConsultantForm.age = consultantForm.age;
    }

    if (consultantForm.employee_name) {
        oldConsultantForm.employee_name = consultantForm.employee_name;
    }

    if (consultantForm.before_image && consultantForm.before_image.length > 0) {
        for (var i = 0; i < consultantForm.before_image.length; i++) {
            if (consultantForm.before_image[i].full_path && consultantForm.before_image[i].full_path.startsWith("data:")) {
                var isImage = await ImageService.saveImage(consultantForm.before_image[i].full_path, "/images/consultation/before/").then(data => { return data })
                if (isImage && typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
                    consultantForm.before_image[i] = isImage
                }
            } else {
                if (consultantForm.before_image[i].path) {
                    consultantForm.before_image[i] = consultantForm.before_image[i].path
                } else {
                    consultantForm.before_image.splice(i, 1)
                }
            }
        }

        oldConsultantForm.before_image = consultantForm.before_image
    }

    if (consultantForm.after_image && consultantForm.after_image.length > 0) {
        for (var i = 0; i < consultantForm.after_image.length; i++) {
            if (consultantForm.after_image[i].full_path && consultantForm.after_image[i].full_path.startsWith("data:")) {
                var isImage = await ImageService.saveImage(consultantForm.after_image[i].full_path, "/images/consultation/after/").then(data => { return data })
                if (isImage && typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
                    consultantForm.after_image[i] = isImage
                }
            } else {
                if (consultantForm.after_image[i].path) {
                    consultantForm.after_image[i] = consultantForm.after_image[i].path
                } else {
                    consultantForm.after_image.splice(i, 1)
                }
            }
        }

        oldConsultantForm.after_image = consultantForm.after_image
    }

    if (consultantForm.deleted_before_image && consultantForm.deleted_before_image.length > 0) {
        for (var i = 0; i < consultantForm.deleted_before_image.length; i++) {
            if (consultantForm.deleted_before_image[i] && consultantForm.deleted_before_image[i].full_path && !consultantForm.deleted_before_image[i].full_path.startsWith("data:")) {
                var root_path = require('path').resolve('public')
                try {
                    var fs = require('fs')
                    var filePath = root_path + "/" + consultantForm.deleted_before_image[i].path
                    if (consultantForm.deleted_before_image[i].path && fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath)
                    }
                } catch (e) {
                    console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n")
                }
            }
        }
    }

    if (consultantForm.deleted_after_image && consultantForm.deleted_after_image.length > 0) {
        for (var i = 0; i < consultantForm.deleted_after_image.length; i++) {
            if (consultantForm.deleted_after_image[i] && consultantForm.deleted_after_image[i].full_path && !consultantForm.deleted_after_image[i].full_path.startsWith("data:")) {
                var root_path = require('path').resolve('public')
                try {
                    var fs = require('fs')
                    var filePath = root_path + "/" + consultantForm.deleted_after_image[i].path
                    if (consultantForm.deleted_after_image[i].path && fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath)
                    }
                } catch (e) {
                    console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n")
                }
            }
        }
    }

    if (consultantForm.customer_signature) {
        var fs = require('fs')
        var root_path = require('path').resolve('public');
        fs.mkdir(root_path + "/images/consultation/customer_signature/", (err) => {
            if (err) {
                // console.log(err);
                // return console.error(err);
            }
            // console.log('Directory created successfully!');
        })

        var isImage = await ImageService.saveImage(consultantForm.customer_signature, "/images/consultation/customer_signature/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            //Remove Previous App Logo 
            try {
                var filePath = root_path + "/" + oldConsultantForm.customer_signature
                if (oldConsultantForm.customer_signature && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
            } catch (e) {
                console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n")
            }

            // Update customer_signature
            oldConsultantForm.customer_signature = isImage
        }
    }

    if (consultantForm.therapist_signature) {
        var fs = require('fs')
        var root_path = require('path').resolve('public');
        fs.mkdir(root_path + "/images/consultation/therapist_signature/", (err) => {
            if (err) {
                // console.log(err);
                // return console.error(err);
            }
            // console.log('Directory created successfully!');
        })

        var isImage = await ImageService.saveImage(consultantForm.therapist_signature, "/images/consultation/therapist_signature/").then(data => { return data })
        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            //Remove Previous App Logo 
            try {
                var filePath = root_path + "/" + oldConsultantForm.therapist_signature
                if (oldConsultantForm.therapist_signature && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
            } catch (e) {
                console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n")
            }

            // Update therapist_signature
            oldConsultantForm.therapist_signature = isImage
        }
    }

    if (consultantForm.name) {
        oldConsultantForm.residential_address = consultantForm.residential_address ? consultantForm.residential_address : ""
        oldConsultantForm.surgery_name = consultantForm.surgery_name ? consultantForm.surgery_name : ""
        oldConsultantForm.doctor_name = consultantForm.doctor_name ? consultantForm.doctor_name : ""
        oldConsultantForm.is_international_number = consultantForm.is_international_number ? consultantForm.is_international_number : ""
    }

    if (oldConsultantForm.status != 2 || consultantForm.status == 4 || consultantForm.status == 0) {
        oldConsultantForm.status = consultantForm.status ? consultantForm.status : 0
    }

    try {
        var savedConsultantForm = await oldConsultantForm.save()
        return savedConsultantForm
    } catch (e) {
        throw Error("And Error occured while updating the ConsultantForm")
    }
}

exports.deleteConsultantForm = async function (id) {
    // Delete the ConsultantForm
    try {
        var deleted = await ConsultantForm.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("ConsultantForm Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the ConsultantForm")
    }
}


exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await ConsultantForm.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the ConsultantForm")
    }
}