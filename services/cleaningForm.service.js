// Gettign the Newly created Mongoose Model we just created 
var CleaningForm = require('../models/CleaningForm.model');
var ImageService = require('./image.service');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the CleaningForm List
exports.getCleaningForms = async function (query, page, limit, order_name, order, searchText) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        const facetedPipeline = [
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
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
            },
        ];

        var CleaningForms = await CleaningForm.aggregate(facetedPipeline);
        // Return the CleaningFormd list that was retured by the mongoose promise
        return CleaningForms;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CleaningForms');
    }
}

exports.getActiveCleaningForms = async function (query) {

    // Try Catch the awaited promise to handle the error 
    try {
        var CleaningForms = await CleaningForm.find(query)
        // Return the CleaningFormd list that was retured by the mongoose promise
        return CleaningForms;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CleaningForms');
    }
}

exports.getCleaningForm = async function (id) {
    try {
        // Find the Data 
        var _details = await CleaningForm.findOne({
            _id: id
        });
        if (_details._id) {
            return _details;
        } else {
            throw Error("CleaningForm not available");
        }

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CleaningForm not available");
    }
}

// find form with client id
exports.getClientCleaningForm = async function (client_id) {
    try {
        // Find the Data 
        var _details = await CleaningForm.findOne({
            client_id: client_id
        })
            .sort({ updatedAt: -1 });
        return _details;

    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CleaningForm not available");
    }
}

// getting all CleaningForms for company copy
exports.getCleaningFormsSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CleaningForms = await CleaningForm.find(query).sort({ createdAt: -1 });
        // Return the Serviced list that was retured by the mongoose promise
        return CleaningForms;

    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating Location');
    }
}

exports.createCleaningForm = async function (cleaningForm) {
    if (cleaningForm.before_image && cleaningForm.before_image.length > 0) {
        for (var i = 0; i < cleaningForm.before_image.length; i++) {
            if (cleaningForm.before_image[i].full_path && cleaningForm.before_image[i].full_path.startsWith("data:")) {
                var isImage = await ImageService.saveImage(cleaningForm.before_image[i].full_path, "/images/cleaning/before/").then(data => {
                    return data;
                });
                if (isImage && typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
                    cleaningForm.before_image[i] = isImage;
                }
            } else {
                if (cleaningForm.before_image[i].path) {
                    cleaningForm.before_image[i] = cleaningForm.before_image[i].path;
                } else {
                    cleaningForm.before_image.splice(i, 1);
                }

            }
        }
    }

    if (cleaningForm.after_image && ccleaningForm.after_image.length > 0) {
        for (var i = 0; i < cleaningForm.after_image.length; i++) {
            if (cleaningForm.after_image[i].full_path && cleaningForm.after_image[i].full_path.startsWith("data:")) {
                var isImage = await ImageService.saveImage(cleaningForm.after_image[i].full_path, "/images/cleaning/after/").then(data => {
                    return data;
                });
                if (isImage && typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
                    cleaningForm.after_image[i] = isImage;
                }
            } else {
                if (cleaningForm.after_image[i].path) {
                    cleaningForm.after_image[i] = cleaningForm.after_image[i].path;
                } else {
                    cleaningForm.after_image.splice(i, 1);
                }

            }
        }
    }

    if (cleaningForm.verifier_signature) {
        var isImage = await ImageService.saveImage(cleaningForm.verifier_signature, "/images/cleaning/verifier_signature/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            cleaningForm.verifier_signature = isImage;
        }
    }

    if (cleaningForm.therapist_signature) {
        var isImage = await ImageService.saveImage(cleaningForm.therapist_signature, "/images/cleaning/therapist_signature/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            cleaningForm.therapist_signature = isImage;
        }
    }

    var newCleaningForm = new CleaningForm({
        location_id: cleaningForm.location_id ? cleaningForm.location_id : "",
        employee_id: cleaningForm.employee_id ? cleaningForm.employee_id : "",
        verifier_id: cleaningForm.verifier_id ? cleaningForm.verifier_id : "",
        clening_form_id: cleaningForm.clening_form_id ? cleaningForm.clening_form_id : "",
        before: cleaningForm.before ? cleaningForm.before : [],
        after: cleaningForm.after ? cleaningForm.after : [],
        date: cleaningForm.date ? cleaningForm.date : "",
        before_image: cleaningForm.before_image ? cleaningForm.before_image : [],
        after_image: cleaningForm.after_image ? cleaningForm.after_image : [],
        verifier_signature: cleaningForm.verifier_signature ? cleaningForm.verifier_signature : "",
        therapist_signature: cleaningForm.therapist_signature ? cleaningForm.therapist_signature : "",
        pdf: cleaningForm.pdf ? cleaningForm.pdf : "",
        status: cleaningForm.status ? cleaningForm.status : 0
    })

    try {
        // Saving the CleaningForm 
        var savedCleaningForm = await newCleaningForm.save();
        return savedCleaningForm;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating CleaningForm")
    }
}

exports.updateCleaningForm = async function (cleaningForm) {
    var id = cleaningForm._id;
    try {
        //Find the old CleaningForm Object by the Id
        var oldCleaningForm = await CleaningForm.findById(id);
        //console.log('OldCleaningForm ',oldCleaningForm)
    } catch (e) {
        throw Error("Error occured while Finding the CleaningForm")
    }
    // If no old CleaningForm Object exists return false
    if (!oldCleaningForm) {
        return false;
    }
    //Edit the CleaningForm Object

    if (cleaningForm.location_id) {
        oldCleaningForm.location_id = cleaningForm.location_id;
    }
    if (cleaningForm.employee_id) {
        oldCleaningForm.employee_id = cleaningForm.employee_id
    }
    if (cleaningForm.verifier_id) {
        oldCleaningForm.verifier_id = cleaningForm.verifier_id;
    }
    if (cleaningForm.clening_form_id) {
        oldCleaningForm.clening_form_id = cleaningForm.clening_form_id;
    }
    if (cleaningForm.before) {
        oldCleaningForm.before = cleaningForm.before;
    }
    if (cleaningForm.after) {
        oldCleaningForm.after = cleaningForm.after;
    }
    if (cleaningForm.date) {
        oldCleaningForm.date = cleaningForm.date
    }
    if (cleaningForm.before_image && cleaningForm.before_image.length > 0) {
        for (var i = 0; i < cleaningForm.before_image.length; i++) {
            if (cleaningForm.before_image[i].full_path && cleaningForm.before_image[i].full_path.startsWith("data:")) {
                var isImage = await ImageService.saveImage(cleaningForm.before_image[i].full_path, "/images/cleaning/before/").then(data => {
                    return data;
                });
                if (isImage && typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
                    cleaningForm.before_image[i] = isImage;
                }
            } else {
                if (cleaningForm.before_image[i].path) {
                    cleaningForm.before_image[i] = cleaningForm.before_image[i].path;
                } else {
                    cleaningForm.before_image.splice(i, 1);
                }

            }
        }
        oldCleaningForm.before_image = cleaningForm.before_image;
    }

    if (cleaningForm.after_image && cleaningForm.after_image.length > 0) {
        for (var i = 0; i < cleaningForm.after_image.length; i++) {
            if (cleaningForm.after_image[i].full_path && cleaningForm.after_image[i].full_path.startsWith("data:")) {
                var isImage = await ImageService.saveImage(cleaningForm.after_image[i].full_path, "/images/cleaning/after/").then(data => {
                    return data;
                });
                if (isImage && typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
                    cleaningForm.after_image[i] = isImage;
                }
            } else {
                if (cleaningForm.after_image[i].path) {
                    cleaningForm.after_image[i] = cleaningForm.after_image[i].path;
                } else {
                    cleaningForm.after_image.splice(i, 1);
                }
            }
        }
        oldCleaningForm.after_image = cleaningForm.after_image;
    }

    if (cleaningForm.deleted_before_image && cleaningForm.deleted_before_image.length > 0) {
        for (var i = 0; i < cleaningForm.deleted_before_image.length; i++) {
            if (cleaningForm.deleted_before_image[i] && cleaningForm.deleted_before_image[i].full_path && !cleaningForm.deleted_before_image[i].full_path.startsWith("data:")) {
                var root_path = require('path').resolve('public');
                try {
                    var fs = require('fs');
                    var filePath = root_path + "/" + cleaningForm.deleted_before_image[i].path;
                    if (cleaningForm.deleted_before_image[i].path && fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (e) {
                    console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n");
                }
            }
        }
    }

    if (cleaningForm.deleted_after_image && cleaningForm.deleted_after_image.length > 0) {
        for (var i = 0; i < cleaningForm.deleted_after_image.length; i++) {
            if (cleaningForm.deleted_after_image[i] && cleaningForm.deleted_after_image[i].full_path && !cleaningForm.deleted_after_image[i].full_path.startsWith("data:")) {
                var root_path = require('path').resolve('public');
                try {
                    var fs = require('fs');
                    var filePath = root_path + "/" + cleaningForm.deleted_after_image[i].path;
                    if (cleaningForm.deleted_after_image[i].path && fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (e) {
                    console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n");
                }
            }
        }
    }

    if (cleaningForm.verifier_signature) {
        var isImage = await ImageService.saveImage(cleaningForm.verifier_signature, "/images/cleaning/verifier_signature/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            //Remove Previous App Logo 
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldCleaningForm.verifier_signature;
                if (oldCleaningForm.verifier_signature && fs.existsSync(filePath)) {

                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n");
            }
            //Update verifier_signature
            oldCleaningForm.verifier_signature = isImage;
        }
    }

    if (cleaningForm.therapist_signature) {
        var isImage = await ImageService.saveImage(cleaningForm.therapist_signature, "/images/cleaning/therapist_signature/").then(data => {
            return data;
        });

        if (typeof (isImage) != 'undefined' && isImage != null && isImage != "") {
            var root_path = require('path').resolve('public');
            //Remove Previous App Logo 
            try {
                var fs = require('fs');
                var filePath = root_path + "/" + oldCleaningForm.therapist_signature;
                if (oldCleaningForm.therapist_signature && fs.existsSync(filePath)) {

                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                console.log("\n\nImage Remove Issaues >>>>>>>>>>>>>>\n\n");
            }
            //Update therapist_signature
            oldCleaningForm.therapist_signature = isImage;
        }
    }

    if (cleaningForm.location_id) {
        oldCleaningForm.location_id = cleaningForm.location_id;
    }
    if (cleaningForm.employee_id) {
        oldCleaningForm.employee_id = cleaningForm.employee_id
    }

    if (cleaningForm.verifier_id) {
        oldCleaningForm.verifier_id = cleaningForm.verifier_id;
    }

    if (cleaningForm.before) {
        oldCleaningForm.before = cleaningForm.before;
    }
    if (cleaningForm.after) {
        oldCleaningForm.after = cleaningForm.after;
    }
    if (cleaningForm.date) {
        oldCleaningForm.date = cleaningForm.date
    }

    oldCleaningForm.status = cleaningForm.status ? cleaningForm.status : 0;

    try {
        var savedCleaningForm = await oldCleaningForm.save()
        return savedCleaningForm;
    } catch (e) {
        console.log(e)
        throw Error("And Error occured while updating the CleaningForm");
    }
}

exports.updateCleaningFormPdf = async function (cleaningForm) {
    var id = cleaningForm._id;
    try {
        //Find the old CleaningForm Object by the Id
        var oldCleaningForm = await CleaningForm.findById(id);
        // console.log('OldCleaningForm ',oldCleaningForm)
    } catch (e) {
        throw Error("Error occured while Finding the CleaningForm")
    }
    // If no old CleaningForm Object exists return false
    if (!oldCleaningForm) {
        return false;
    }

    if (cleaningForm.pdf) {
        // oldCleaningForm.pdf = CleaningForm.pdf;
        var root_path = require('path').resolve('public');
        try {
            var fs = require('fs');
            var filePath = root_path + "/" + oldCleaningForm.pdf;
            if (oldCleaningForm.pdf && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            // console.log("\n\nPdf Remove Issaues >>>>>>>>>>>>>>\n\n");
        }

        oldCleaningForm.pdf = cleaningForm.pdf;
    }

    try {
        var savedCleaningForm = await oldCleaningForm.save()
        return savedCleaningForm;
    } catch (e) {
        throw Error("And Error occured while updating the CleaningForm");
    }
}

exports.deleteCleaningForm = async function (id) {
    // Delete the CleaningForm
    try {
        var deleted = await CleaningForm.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CleaningForm Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CleaningForm")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await CleaningForm.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the CleaningForm")
    }
}

// This is only for dropdown
exports.getCleaningFormsDropdown = async function (query = {}, sort_field = "", sort_type = "-1") {
    try {
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var cleaningForms = await CleaningForm.find(query)
            .select("_id form_name")
            .sort(sorts)

        return cleaningForms
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting dropdown cleaning forms')
    }
}