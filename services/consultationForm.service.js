// Gettign the Newly created Mongoose Model we just created 
var Category = require('../models/Category.model')
var ConsultationForm = require('../models/ConsultationForm.model')
var Service = require('../models/Service.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the consultationForm List
exports.getConsultationForms = async function (query, page, limit, order_name, order, serachText) {
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
        ]

        var ConsultationForms = await ConsultationForm.aggregate(facetedPipeline)
        // Return the consultationFormd list that was retured by the mongoose promise
        return ConsultationForms
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating ConsultationForms')
    }
}

exports.getConsultationFormsOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var consultationForms = await ConsultationForm.find(query)
            .populate({
                path: 'category_id',
                select: "name"
            })
            .populate({
                path: 'service_id',
                select: "name category_id",
                populate: {
                    path: 'category_id',
                    model: Category,
                    select: 'name'
                }
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return consultationForms
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating ConsultationForms')
    }
}

// getting all type for company copy
exports.getConsultationFormsSpecific = async function (query) {
    try {
        var consultationForm = await ConsultationForm.find(query)
            .populate({
                path: 'service_id',
                model: Service,
                select: {
                    _id: 1,
                    name: 1,
                }
            })
            .populate({
                path: 'category_id',
                model: Category,
                select: {
                    _id: 1,
                    name: 1,
                }
            })

        // Return the Serviced list that was retured by the mongoose promise
        return consultationForm
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating ConsultationForms')
    }
}

exports.getConsultationForm = async function (id) {
    try {
        // Find the Data 
        var _details = await ConsultationForm.findOne({ _id: id })
            .populate({
                path: 'category_id',
                select: "name"
            })
            .populate({
                path: 'service_id',
                select: "name"
            });
        if (_details && _details?._id) {
            return _details;
        } else {
            throw Error("consultationForm not available");
        }
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("consultationForm not available");
    }
}

exports.checkConsultationFormExist = async function (query = {}) {
    try {
        // Find the Data 
        var _details = await ConsultationForm.findOne(query);

        return _details || null
    } catch (e) {
        return null
    }
}

exports.createConsultationForm = async function (consultationForm) {
    if (consultationForm.category_id) {
        consultationForm.category_id = consultationForm.category_id.filter(function (e) { return e });
    }

    if (consultationForm.service_id) {
        consultationForm.service_id = consultationForm.service_id.filter(function (e) { return e });
    }

    var newConsultationForm = new ConsultationForm({
        location_id: consultationForm.location_id ? consultationForm.location_id : null,
        master_consultation_form_id: consultationForm.master_consultation_form_id ? consultationForm.master_consultation_form_id : null,
        master_category_ids: consultationForm.master_category_ids?.length ? consultationForm.master_category_ids : null,
        master_service_ids: consultationForm.master_service_ids?.length ? consultationForm.master_service_ids : null,
        category_id: consultationForm?.category_id?.length ? consultationForm.category_id : null,
        service_id: consultationForm?.service_id?.length ? consultationForm.service_id : null,
        groupData: consultationForm?.groupData?.length ? consultationForm.groupData : null,
        name: consultationForm.name ? consultationForm.name : "",
        desc: consultationForm.desc ? consultationForm.desc : "",
        form_type: consultationForm.form_type ? consultationForm.form_type : '',
        status: consultationForm.status ? consultationForm.status : 1
    })

    try {
        // Saving the consultationForm 
        var savedconsultationForm = await newConsultationForm.save();
        return savedconsultationForm;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating consultationForm")
    }
}

exports.updateConsultationForm = async function (consultationForm) {
    try {
        //Find the old consultationForm Object by the Id
        var id = consultationForm._id
        var oldconsultationForm = await ConsultationForm.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the consultationForm")
    }

    // If no old consultationForm Object exists return false
    if (!oldconsultationForm) {
        return false
    }

    // Edit the consultationForm Object
    if (consultationForm.category_id) {
        consultationForm.category_id = consultationForm.category_id.filter(function (e) { return e });
        oldconsultationForm.category_id = consultationForm.category_id?.length ? consultationForm.category_id : null
    }

    if (consultationForm.service_id) {
        consultationForm.service_id = consultationForm.service_id.filter(function (e) { return e });
        oldconsultationForm.service_id = consultationForm.service_id?.length ? consultationForm.service_id : null
    }

    if (consultationForm.groupData) {
        oldconsultationForm.groupData = consultationForm.groupData?.length ? consultationForm.groupData : null
    }

    if (consultationForm.name) {
        oldconsultationForm.name = consultationForm.name
    }

    if (consultationForm.form_type) {
        oldconsultationForm.form_type = consultationForm.form_type
    }

    if (consultationForm.status || consultationForm.status == 0) {
        oldconsultationForm.status = consultationForm.status ? consultationForm.status : 0;
    }

    try {
        var savedconsultationForm = await oldconsultationForm.save()
        return savedconsultationForm
    } catch (e) {
        throw Error("And Error occured while updating the consultationForm")
    }
}

exports.deleteConsultationForm = async function (id) {
    // Delete the consultationForm
    try {
        var deleted = await ConsultationForm.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("consultationForm Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the consultationForm")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await consultationForm.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the consultationForm")
    }
}