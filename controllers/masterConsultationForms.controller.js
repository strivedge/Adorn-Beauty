var ServiceService = require('../services/service.service')
var CategoryService = require('../services/category.service')
var ConsultationFormService = require('../services/consultationForm.service')

var MasterCategoryService = require('../services/masterCategory.service')
var MasterConsultationFormService = require('../services/masterConsultationForm.service')
var MasterQuestionService = require('../services/masterQuestion.service')
var MasterQuestionGroupService = require('../services/masterQuestionGroup.service')
var MasterService = require('../services/masterService.service')
var ObjectId = require('mongodb').ObjectId

// Saving the context of this module inside the _the variable
_this = this

exports.getMasterConsultationForms = async function (req, res, next) {
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 10;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (searchText) {
        query['$or'] = [
            { name: { $regex: '.*' + searchText + '.*', $options: 'i' } }
        ]
    }

    try {
        var masterConsultantForms = await MasterConsultationFormService.getMasterConsultationForms(query, parseInt(page), parseInt(limit), order_name, Number(order));

        var data = masterConsultantForms[0].data;
        for (var i = 0; i < data.length; i++) {
            if (data[i].service_id && data[i].service_id.length > 0) {
                var q = { _id: { $in: data[i].service_id } };
                var service = await ServiceService.getServiceSpecific(q); // for replace service name
                data[i].service_id = service; //replace service name
            }

            if (data[i].category_id && data[i].category_id.length) {
                var cq = { _id: { $in: data[i].category_id } };
                var category = await CategoryService.getActiveCategories(cq);
                data[i].category_id = category;
            }
        }

        masterConsultantForms[0].data = data;

        return res.status(200).json({ status: 200, flag: true, data: masterConsultantForms, message: "Consultant forms recieved successfully!" });
    } catch (e) {
        console.log(e);
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getMasterConsultationForm = async function (req, res, next) {
    var id = req.params.id;
    try {
        var masterConsultationForm = await MasterConsultationFormService.getMasterConsultationForm(id)

        return res.status(200).json({ status: 200, flag: true, data: masterConsultationForm, message: "Consultation form recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createMasterConsultationForm = async function (req, res, next) {
    try {
        var createdData = await MasterConsultationFormService.createMasterConsultationForm(req.body);

        return res.status(200).json({ status: 200, flag: true, data: createdData, message: "Consultation form created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateMasterConsultationForm = async function (req, res, next) {
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedData = await MasterConsultationFormService.updateMasterConsultationForm(req.body);

        return res.status(200).json({ status: 200, flag: true, data: updatedData, message: "Consultation form updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMasterConsultationForm = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await MasterConsultationFormService.deleteMasterConsultationForm(id);

        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createDefaultMasterConsultationForms = async function (req, res, next) {
    try {
        var locationId = req.body?.location_id || ""
        if (!locationId) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: "Location Id must be present!"
            })
        }

        var query = { location_id: locationId, status: 1 };

        var masterCategories = await MasterCategoryService.getMasterCategoriesSimple({})
        var masterServices = await MasterService.getMasterServicesSimple({})
        var masterQuestions = await MasterQuestionService.getMasterQuestionsSimple({});
        var masterQuestionGroups = await MasterQuestionGroupService.getMasterQuestionGroupsSimple({});

        var consultationForms = await ConsultationFormService.getConsultationFormsOne(query)
        if (consultationForms && consultationForms?.length) {
            var masterConsultationForms = await MasterConsultationFormService.getMasterConsultationFormsOne({})
            if (masterConsultationForms && masterConsultationForms?.length) {
                var masterConsultationFormsIds = masterConsultationForms.map((item) => {
                    return item?._id || ""
                })
                masterConsultationFormsIds = masterConsultationFormsIds.filter((x) => x != "")
                await MasterConsultationFormService.deleteMultiple({ _id: { $in: masterConsultationFormsIds } })
            }

            for (let i = 0; i < consultationForms.length; i++) {
                const element = consultationForms[i];
                if (element?.category_id && element.category_id?.length) {
                    var masterCategoryIds = []
                    for (let j = 0; j < element.category_id.length; j++) {
                        var category = element.category_id[j]
                        var masterCategory = masterCategories.find((x) => x.name == category?.name) || null
                        if (masterCategory && masterCategory?._id) {
                            masterCategoryIds.push(masterCategory._id)
                        }
                    }

                    if (masterCategoryIds && masterCategoryIds?.length) {
                        masterCategoryIds = masterCategoryIds.filter((value, index, array) => array.indexOf(value) === index);
                        element.master_category_ids = masterCategoryIds
                    }
                }

                if (element?.service_id && element.service_id?.length) {
                    var masterServiceIds = []
                    for (let j = 0; j < element.service_id.length; j++) {
                        var service = element.service_id[j]
                        if (service?.category_id && service.category_id?.name) {
                            var masterCategory = masterCategories.find((x) => x.name == service.category_id.name) || null
                            if (masterCategory && masterCategory?._id) {
                                var masterService = masterServices.find((x) => x.master_category_id?.toString() == masterCategory._id.toString() && x.name == service?.name) || null
                                if (masterService && masterService?._id) {
                                    masterServiceIds.push(masterService._id)
                                }
                            }
                        }
                    }

                    if (masterServiceIds && masterServiceIds?.length) {
                        masterServiceIds = masterServiceIds.filter((value, index, array) => array.indexOf(value) === index);
                        element.master_service_ids = masterServiceIds
                    }
                }

                if (element?.groupData && element.groupData?.length) {
                    var masterGroupData = []
                    for (let j = 0; j < element.groupData.length; j++) {
                        var groupData = element.groupData[j];
                        if (groupData?.group_data && groupData.group_data?.name) {
                            var masterQuestionGroup = masterQuestionGroups.find((x) => x.name == groupData.group_data.name)
                            if (masterQuestionGroup && masterQuestionGroup?._id) {
                                var masterQuestionsData = masterQuestions.filter((x) => x.master_que_group_id?.toString() == masterQuestionGroup._id?.toString()) || []

                                masterGroupData.push({
                                    group_id: masterQuestionGroup._id,
                                    group_data: {
                                        _id: masterQuestionGroup._id,
                                        name: masterQuestionGroup?.name || "",
                                        description: masterQuestionGroup?.description || "",
                                    },
                                    question_data: masterQuestionsData
                                })
                            }
                        }
                    }

                    if (masterGroupData && masterGroupData?.length) {
                        element.masterGroupData = masterGroupData
                    }
                }

                var createdData = await MasterConsultationFormService.createMasterConsultationForm(element);
            }
        }

        var masterConsultationForms = await MasterConsultationFormService.getMasterConsultationFormsOne({});

        return res.status(200).json({ status: 200, flag: true, data: masterConsultationForms, message: "Default consultation forms created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
