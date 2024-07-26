// Gettign the Newly created Mongoose Model we just created 
var MasterConsultationForm = require('../models/MasterConsultationForm.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the masterConsultationForm List
exports.getMasterConsultationForms = async function (query, page, limit, order_name, order) {
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

        var MasterConsultationForms = await MasterConsultationForm.aggregate(facetedPipeline)
        // Return the masterConsultationFormd list that was retured by the mongoose promise
        return MasterConsultationForms
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterConsultationForms')
    }
}

exports.getMasterConsultationFormsOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterConsultationForms = await MasterConsultationForm.find(query)
            .populate({
                path: 'master_category_ids',
                select: {
                    _id: 1,
                    name: 1,
                }
            })
            .populate({
                path: 'master_service_ids',
                select: {
                    _id: 1,
                    name: 1,
                    master_category_id: 1
                },
                populate: {
                    path: 'master_category_id',
                    select: "name"
                }
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterConsultationForms
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterConsultationForms')
    }
}

exports.getMasterConsultationFormsSimple = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var masterConsultationForms = await MasterConsultationForm.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return masterConsultationForms
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating MasterConsultationForms')
    }
}

exports.getMasterConsultationForm = async function (id) {
    try {
        // Find the Data 
        var _details = await MasterConsultationForm.findOne({ _id: id })
            .populate({
                path: 'master_category_ids',
                select: {
                    _id: 1,
                    name: 1,
                }
            })
            .populate({
                path: 'master_service_ids',
                select: {
                    _id: 1,
                    name: 1,
                }
            });
        if (_details._id) {
            return _details;
        } else {
            throw Error("MasterConsultationForm not available");
        }
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("MasterConsultationForm not available");
    }
}

exports.createMasterConsultationForm = async function (masterConsultationForm) {
    if (masterConsultationForm.master_category_ids) {
        masterConsultationForm.master_category_ids = masterConsultationForm.master_category_ids.filter(function (e) { return e });
    }

    if (masterConsultationForm.master_service_ids) {
        masterConsultationForm.master_service_ids = masterConsultationForm.master_service_ids.filter(function (e) { return e });
    }

    var newMasterConsultationForm = new MasterConsultationForm({
        master_category_ids: masterConsultationForm?.master_category_ids?.length ? masterConsultationForm.master_category_ids : null,
        master_service_ids: masterConsultationForm?.master_service_ids?.length ? masterConsultationForm.master_service_ids : null,
        masterGroupData: masterConsultationForm?.masterGroupData?.length ? masterConsultationForm.masterGroupData : null,
        name: masterConsultationForm.name ? masterConsultationForm.name : "",
        desc: masterConsultationForm.desc ? masterConsultationForm.desc : "",
        form_type: masterConsultationForm.form_type ? masterConsultationForm.form_type : '',
        status: masterConsultationForm.status ? masterConsultationForm.status : 1
    })

    try {
        // Saving the masterConsultationForm 
        var savedmasterConsultationForm = await newMasterConsultationForm.save();
        return savedmasterConsultationForm;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating MasterConsultationForm")
    }
}

exports.updateMasterConsultationForm = async function (masterConsultationForm) {
    try {
        // Find the old MasterConsultationForm Object by the Id
        var id = masterConsultationForm._id
        var oldMasterConsultationForm = await MasterConsultationForm.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the MasterConsultationForm")
    }

    // If no old MasterConsultationForm Object exists return false
    if (!oldMasterConsultationForm) { return false }

    // Edit the MasterConsultationForm Object
    if (masterConsultationForm.master_category_ids) {
        masterConsultationForm.master_category_ids = masterConsultationForm.master_category_ids.filter(function (e) { return e });
        oldMasterConsultationForm.master_category_ids = masterConsultationForm.master_category_ids?.length ? masterConsultationForm.master_category_ids : null
    }

    if (masterConsultationForm.master_service_ids) {
        masterConsultationForm.master_service_ids = masterConsultationForm.master_service_ids.filter(function (e) { return e });
        oldMasterConsultationForm.master_service_ids = masterConsultationForm.master_service_ids?.length ? masterConsultationForm.master_service_ids : null
    }

    if (masterConsultationForm.masterGroupData) {
        oldMasterConsultationForm.masterGroupData = masterConsultationForm.masterGroupData?.length ? masterConsultationForm.masterGroupData : null
    }

    if (masterConsultationForm.name) {
        oldMasterConsultationForm.name = masterConsultationForm.name
    }

    if (masterConsultationForm.form_type) {
        oldMasterConsultationForm.form_type = masterConsultationForm.form_type
    }

    if (masterConsultationForm.status || masterConsultationForm.status == 0) {
        oldMasterConsultationForm.status = masterConsultationForm.status ? masterConsultationForm.status : 0;
    }

    try {
        var savedmasterConsultationForm = await oldMasterConsultationForm.save()
        return savedmasterConsultationForm
    } catch (e) {
        throw Error("And Error occured while updating the MasterConsultationForm")
    }
}

exports.deleteMasterConsultationForm = async function (id) {
    // Delete the MasterConsultationForm
    try {
        var deleted = await MasterConsultationForm.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("MasterConsultationForm Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterConsultationForm")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the MasterConsultationForm
    try {
        var deleted = await MasterConsultationForm.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the MasterConsultationForm")
    }
}
