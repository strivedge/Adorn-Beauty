var ServiceService = require('../services/service.service')
var CategoryService = require('../services/category.service')
var QuestionService = require('../services/question.service')
var AppointmentService = require('../services/appointment.service')
var QuestionGroupService = require('../services/questionGroup.service')
var ConsultantFormService = require('../services/consultantForm.service')
var ConsultationFormService = require('../services/consultationForm.service')
var LocationService = require('../services/location.service')
var MasterConsultationFormService = require('../services/masterConsultationForm.service')
var MasterCategoryService = require('../services/masterCategory.service')
var MasterQuestionService = require('../services/masterQuestion.service')
var MasterQuestionGroupService = require('../services/masterQuestionGroup.service')
var MasterService = require('../services/masterService.service')

var ObjectId = require('mongodb').ObjectID

// Saving the context of this module inside the _the variable
_this = this

exports.getConsultationForms = async function (req, res, next) {
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 10;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = ObjectId(req.query.location_id)
    }

    if (searchText) {
        query['$or'] = [
            { name: { $regex: '.*' + searchText + '.*', $options: 'i' } }
        ]
    }

    try {
        var consultantForms = await ConsultationFormService.getConsultationForms(query, parseInt(page), parseInt(limit), order_name, Number(order));

        var data = consultantForms[0].data;
        for (var i = 0; i < data.length; i++) {
            if (data[i].service_id && data[i].service_id.length > 0) {
                var q = { _id: { $in: data[i].service_id } };
                var service = await ServiceService.getServiceSpecific(q, 1, 1); // for replace service name
                data[i].service_id = service; //replace service name
            }

            if (data[i].category_id && data[i].category_id.length) {
                var cq = { _id: { $in: data[i].category_id } };
                var category = await CategoryService.getActiveCategories(cq);
                data[i].category_id = category;
            }
        }
        consultantForms[0].data = data;

        return res.status(200).json({ status: 200, flag: true, data: consultantForms, message: "Consultant forms recieved successfully!" });
    } catch (e) {
        console.log(e);
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getConsultationForm = async function (req, res, next) {
    var id = req.params.id;
    try {
        var Question = await ConsultationFormService.getConsultationForm(id)

        return res.status(200).json({ status: 200, flag: true, data: Question, message: "Question recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getConsultationFormsSpecific = async function (req, res, next) {
    try {
        var query = {};
        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
        }

        if (req.query.form_type && req.query.form_type != 'undefined') {
            query['form_type'] = req.query.form_type;
        }

        if (req.query.status == 1) {
            query['status'] = 1;
        }

        var consultationForms = await ConsultationFormService.getConsultationFormsSpecific(query);

        return res.status(200).json({ status: 200, flag: true, data: consultationForms, message: "Services recieved successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createConsultationForm = async function (req, res, next) {
    try {
        var createdData = await ConsultationFormService.createConsultationForm(req.body);

        return res.status(200).json({ status: 200, flag: true, data: createdData, message: "Consultation form created successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateConsultationForm = async function (req, res, next) {
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedData = await ConsultationFormService.updateConsultationForm(req.body);

        return res.status(200).json({ status: 200, flag: true, data: updatedData, message: "Consultation form updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeConsultationForm = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {

        var deleted = await ConsultationFormService.deleteConsultationForm(id);

        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getCleaningFormQuestion = async function (req, res, next) {
    try {
        var query = { status: 1 }
        if (req.query.form_id && req.query.form_id != 'undefined') {
            query['_id'] = req.query.form_id;
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id;
        }

        if (req.query.form_type && req.query.form_type != 'undefined') {
            query['form_type'] = req.query.form_type;
        }

        var consultationForms = await ConsultationFormService.getConsultationFormsSpecific(query);
        var queData = consultationForms.map(s => s.groupData);
        queData = [].concat.apply([], queData);

        const result = queData.map(({ group_id, index, ...rest }) => ({ ...rest })); //merge all groupdata

        const queAllData = result.map(({
            question_data: q_data,
            ...rest
        }) => ({
            q_data,
            ...rest
        })); // rename question_data to q_data key

        let beforeQue = queAllData.map(({ ...el }) => {
            el.q_data = el.q_data.filter(function (o) { return o["before_after"] == 0; })
            return el;
        }); // Filter before questions 

        var beforeQuestions = beforeQue.filter(function (obj) {
            return obj.q_data.length > 1;
        }); // Remove emplty question group

        let afterQue = queAllData.map(({ ...el }) => {
            el.q_data = el.q_data.filter(function (o) { return o["before_after"] == 1; })
            return el;
        }); // Filter after questions 

        var afterQuestions = afterQue.filter(function (obj) {
            return obj.q_data.length > 1;
        }); // Remove emplty question group

        for (var b = 0; b < beforeQuestions.length; b++) {
            for (var q = 0; q < beforeQuestions[b].q_data.length; q++) {
                if (beforeQuestions[b].q_data[q].options.length > 0) {
                    for (var oq = 0; oq < beforeQuestions[b].q_data[q].options.length; oq++) {
                        if (beforeQuestions[b].q_data[q].options[oq].question_ids && beforeQuestions[b].q_data[q].options[oq].question_ids.length > 0) {
                            var otp_q = { _id: { $in: beforeQuestions[b].q_data[q].options[oq].question_ids } };
                            var optQue = await QuestionService.getQuestionsSpecific(otp_q);
                            beforeQuestions[b].q_data[q].options[oq].question_ids = optQue;
                        } else {
                            beforeQuestions[b].q_data[q].options[oq].question_ids = [];
                        }
                    }
                }

            }
        }

        for (var b = 0; b < afterQuestions.length; b++) {
            for (var q = 0; q < afterQuestions[b].q_data.length; q++) {

                if (afterQuestions[b].q_data[q].options.length > 0) {
                    for (var oq = 0; oq < afterQuestions[b].q_data[q].options.length; oq++) {
                        if (afterQuestions[b].q_data[q].options[oq].question_ids && afterQuestions[b].q_data[q].options[oq].question_ids.length > 0) {
                            var otp_q = { _id: { $in: afterQuestions[b].q_data[q].options[oq].question_ids } };
                            var optQue = await QuestionService.getQuestionsSpecific(otp_q);
                            afterQuestions[b].q_data[q].options[oq].question_ids = optQue;
                        } else {
                            afterQuestions[b].q_data[q].options[oq].question_ids = [];
                        }
                    }
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: queAllData, before: beforeQuestions, after: afterQuestions, message: "Questions recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getConsultationFormQuestion = async function (req, res, next) {
    try {
        var query = { status: 1 }
        var service_id = req.body.service_id
        var pre_flag = req.body.pre_flag

        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id
        }

        if (req.body.form_type && req.body.form_type != 'undefined') {
            query['form_type'] = req.body.form_type
        }

        var service_query = { _id: { $in: service_id } }
        var service = await ServiceService.getServiceSpecificWithCategory(service_query)
        var category_id = []
        if (service && service.length > 0) {
            category_id = service.map(s => s.category_id)
        }

        if (req.body.type && req.body.type == 'customer') {
            query['category_id'] = { $elemMatch: { $in: [req.body.category_id] } }
        } else {
            query['$or'] = [
                { category_id: { $elemMatch: { $in: category_id } } },
                { service_id: { $elemMatch: { $in: service_id } } }
            ]
        }

        var consultationForms = await ConsultationFormService.getConsultationFormsSpecific(query)
        var queData = consultationForms.map(s => s.groupData)
        queData = [].concat.apply([], queData)

        const result = queData.map(({ group_id, index, ...rest }) => ({ ...rest })) // merge all groupdata

        const queAllData = result.map(({
            question_data: q_data,
            ...rest
        }) => ({ q_data, ...rest })) // rename question_data to q_data key

        let beforeQue = queAllData.map(({ ...el }) => {
            el.q_data.sort((a, b) => a.order_no - b.order_no)
            el.q_data = el.q_data.filter(function (o) { return o["before_after"] == 0 })
            return el
        }) // Filter before questions 

        var beforeQuestions = beforeQue.filter(function (obj) { return obj.q_data.length > 0 }) // Remove emplty question group

        let afterQue = queAllData.map(({ ...el }) => {
            el.q_data.sort((a, b) => a.order_no - b.order_no)
            el.q_data = el.q_data.filter(function (o) { return o["before_after"] == 1 })
            return el
        }) // Filter after questions 

        var afterQuestions = afterQue.filter(function (obj) { return obj.q_data.length > 0 }) // Remove emplty question group

        var bq = { client_id: { $elemMatch: { $eq: req.body.client_id.toString() } } }
        for (var b = 0; b < beforeQuestions.length; b++) {
            for (var q = 0; q < beforeQuestions[b].q_data.length; q++) {
                bq['before'] = { $elemMatch: { "q_id": { $eq: beforeQuestions[b].q_data[q]._id.toString() } } }
                if (beforeQuestions[b].q_data[q].options?.length > 0) {
                    for (var oq = 0; oq < beforeQuestions[b].q_data[q].options.length; oq++) {
                        if (beforeQuestions[b].q_data[q].options[oq].question_ids && beforeQuestions[b].q_data[q].options[oq].question_ids.length > 0) {
                            var otp_q = { _id: { $in: beforeQuestions[b].q_data[q].options[oq].question_ids } }
                            var optQue = await QuestionService.getQuestionsSpecific(otp_q)
                            beforeQuestions[b].q_data[q].options[oq].question_ids = optQue
                        } else {
                            beforeQuestions[b].q_data[q].options[oq].question_ids = []
                        }
                    }
                }

                var consultantForms = await ConsultantFormService.getConsultantFormsSpecific(bq)
                if (consultantForms && consultantForms.length > 0 && !pre_flag) {
                    var setBeforeData = consultantForms[0].before.findIndex(x => x.q_id === beforeQuestions[b].q_data[q]._id.toString())
                    beforeQuestions[b].q_data[q].value = []

                    if (setBeforeData != -1) {
                        beforeQuestions[b].q_data[q].value.push(consultantForms[0].before[setBeforeData])
                    }
                }
            }
        }

        var aq = { client_id: { $elemMatch: { $eq: req.body.client_id.toString() } } }
        for (var b = 0; b < afterQuestions.length; b++) {
            for (var q = 0; q < afterQuestions[b].q_data.length; q++) {
                aq['after'] = { $elemMatch: { "q_id": { $eq: afterQuestions[b].q_data[q]._id.toString() } } }
                if (afterQuestions[b].q_data[q].options?.length > 0) {
                    for (var oq = 0; oq < afterQuestions[b].q_data[q].options.length; oq++) {
                        if (afterQuestions[b].q_data[q].options[oq].question_ids && afterQuestions[b].q_data[q].options[oq].question_ids.length > 0) {
                            var otp_q = { _id: { $in: afterQuestions[b].q_data[q].options[oq].question_ids } }
                            var optQue = await QuestionService.getQuestionsSpecific(otp_q)
                            afterQuestions[b].q_data[q].options[oq].question_ids = optQue
                        } else {
                            afterQuestions[b].q_data[q].options[oq].question_ids = []
                        }
                    }
                }

                var consultantForms = await ConsultantFormService.getConsultantFormsSpecific(aq)
                if (consultantForms && consultantForms.length > 0 && !pre_flag) {
                    var setAfterData = consultantForms[0].after.findIndex(x => x.q_id === afterQuestions[b].q_data[q]._id.toString())
                    afterQuestions[b].q_data[q].value = []
                    if (setAfterData != -1) {
                        afterQuestions[b].q_data[q].value.push(consultantForms[0].after[setAfterData])
                    }
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, consultationForms: consultationForms, data: queAllData, before: beforeQuestions, after: afterQuestions, message: "Consultation question recieved successfully!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getBookingConsultantBlankNullScript = async function (req, res, next) {
    try {
        var query = { booking_id: { $ne: "" } }
        var type = req.query?.type || "null"
        var fieldType = req.query?.field_type || "client"
        if (fieldType == "client") {
            query['client_id'] = { $exists: true, $eq: null }
            if (type == "blank") {
                query['client_id'] = { $exists: true, $eq: [] }
            }
        } else if (fieldType == "service") {
            query['service_id'] = { $exists: true, $eq: null }
            if (type == "blank") {
                query['service_id'] = { $exists: true, $eq: [] }
            }
        }

        var consultants = await ConsultantFormService.getConsultantFormsSpecific(query)
        if (consultants && consultants.length) {
            for (let index = 0; index < consultants.length; index++) {
                const element = consultants[index]
                if (element && element?._id && element?.booking_id) {
                    const bookingId = element.booking_id
                    var bookingData = await AppointmentService.getAppointment(bookingId)
                    if (bookingData && bookingData._id) {
                        const clientIds = bookingData?.client_id?.map((item, ind) => {
                            let clientId = item
                            if (item && item._id) {
                                clientId = item._id
                            }

                            return clientId
                        }) || []

                        const serviceIds = bookingData?.service_id?.map((item, ind) => {
                            let serviceId = item
                            if (item && item._id) {
                                serviceId = item._id
                            }

                            return serviceId
                        }) || []

                        var categoryIds = await ServiceService.getServiceDisctict("category_id", { _id: { $in: serviceIds } })

                        await ConsultantFormService.updateConsultantForm({
                            _id: element._id,
                            client_id: clientIds,
                            service_id: serviceIds,
                            service_id: categoryIds
                        })
                    }
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: null, message: "Booking consultant blank null fixed!" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getQuestionGroupToConsultationForm = async function (req, res, next) {
    try {
        var query = {}
        var id = req.query?.id || ""
        var locationId = req.query?.location_id || ""
        var formType = "service"

        if (id) {
            query['_id'] = id
        }

        if (locationId) {
            query['location_id'] = ObjectId(locationId)
        }

        var questionGroups = await QuestionGroupService.getQuestionGroupsOne(query)
        if (questionGroups && questionGroups.length) {
            for (let index = 0; index < questionGroups.length; index++) {
                var questionGroup = questionGroups[index]
                var queGroupId = questionGroup?._id || ""
                if (queGroupId) {
                    var location_id = questionGroup?.location_id || null
                    var categoryIds = null
                    var serviceIds = null
                    var groupData = []
                    var name = questionGroup?.name || ""
                    var desc = questionGroup?.description || ""
                    var questions = await QuestionService.getQuestionsSimple({ que_group_id: queGroupId }, 1, 0, "_id", 1)
                    var questionCategoryIds = await QuestionService.getQuestionDisctict("category_id", { que_group_id: queGroupId })
                    if (questionCategoryIds && questionCategoryIds.length) {
                        categoryIds = questionCategoryIds.filter(elm => elm)
                    }

                    var questionServiceIds = await QuestionService.getQuestionDisctict("service_id", { que_group_id: queGroupId })
                    if (questionServiceIds && questionServiceIds.length) {
                        serviceIds = questionServiceIds.filter(elm => elm)
                    }

                    groupData.push({
                        group_id: queGroupId,
                        group_data: { _id: queGroupId, name: name, description: desc },
                        question_data: questions
                    })

                    var formData = {
                        location_id: location_id,
                        category_id: categoryIds,
                        service_id: serviceIds,
                        groupData: groupData,
                        name: name,
                        desc: desc,
                        form_type: formType,
                        status: 1
                    }

                    await ConsultationFormService.createConsultationForm(formData)
                }
            }
        }

        return res.status(200).json({
            status: 200,
            flag: true,
            count: questionGroups?.length || 0,
            message: "Question group to consultation group converted data successfully!"
        })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.copyConsultationFormData = async function (req, res, next) {
    var id = req.params.id;
    try {
        var location_id = "60ba7674e0f95f94d2c2e36a";
        var query = { location_id: "60ba7674e0f95f94d2c2e36a", name: { $in: ["Million Dollar Facial", "MD Peels", "Dermapen"] } }
        var conData = await ConsultationFormService.getConsultationFormsSpecific(query);
        var locations = await LocationService.getActiveLocations({ _id: { $ne: ObjectId("60ba7674e0f95f94d2c2e36a") }, status: 1 });
        for (var l = 0; l < locations.length; l++) {
            for (var i = 0; i < conData.length; i++) {
                var con_q = { name: conData[i].name, location_id: locations[l]._id.toString() }
                var con_exist = await ConsultationFormService.checkConsultationFormExist(con_q);

                if (!con_exist) {
                    var service_arr = [];
                    conData[i].category_id = null;
                    if (conData[i].service_id) {
                        for (var s = 0; s < conData[i].service_id.length; s++) {
                            var ser = await ServiceService.getServiceId(conData[i].service_id[s])
                            if (ser && ser.name && ser.category_id) {
                                var ser_q = { name: ser.name, location_id: locations[l]._id.toString() };
                                var ser_exist = await ServiceService.checkServiceExist(ser_q);

                                if (!ser_exist) {

                                    var cat = await CategoryService.getCategory(ser.category_id)
                                    if (cat && cat.name) {
                                        var cat_q = { name: cat.name, location_id: locations[l]._id.toString() };
                                        var cat_exist = await CategoryService.checkCategoryExist(cat_q);

                                        if (!cat_exist) {
                                            cat._id = "";
                                            cat.location_id = locations[l]._id;

                                            var newCategory = await CategoryService.createCategory(cat);
                                            ser.category_id = newCategory._id;
                                        } else {
                                            ser.category_id = cat_exist._id;
                                        }
                                    }
                                    ser._id = "";
                                    ser.location_id = locations[l]._id;

                                    var newService = await ServiceService.createService(ser)
                                    service_arr.push(newService._id);
                                } else {
                                    service_arr.push(ser_exist._id);
                                }
                            }
                        }
                        conData[i].service_id = null;
                        if (service_arr && service_arr.length > 0) {
                            service_arr = service_arr.map(x => ObjectId(x));
                            conData[i].service_id = service_arr;
                        }
                    }

                    for (var g = 0; g < conData[i].groupData.length; g++) {
                        var group_id = '';
                        var group_data;
                        if (conData[i].groupData[g].group_data && conData[i].groupData[g].group_data.name) {
                            var groupData = conData[i].groupData[g].group_data;

                            var grp_q = { name: conData[i].groupData[g].group_data.name, location_id: locations[l]._id.toString() };

                            var grp_exist = await QuestionGroupService.checkGroupExist(grp_q)

                            if (!grp_exist) {
                                groupData._id = "";
                                groupData.location_id = ObjectId(locations[l]._id);

                                var newGroup = await QuestionGroupService.createQuestionGroup(groupData);
                                group_id = newGroup._id;
                                group_data = { _id: newGroup._id, name: newGroup.name, description: newGroup.description };
                            } else {
                                group_id = grp_exist._id;
                                group_data = { _id: grp_exist._id, name: grp_exist.name, description: grp_exist.description };
                            }
                            conData[i].groupData[g].group_id = group_id;
                            conData[i].groupData[g].group_data = group_data;
                        }
                        var que_arr = [];
                        for (var q = 0; q < conData[i].groupData[g].question_data.length; q++) {
                            if (conData[i].groupData[g].question_data[q] && conData[i].groupData[g].question_data[q].question) {

                                var queData = conData[i].groupData[g].question_data[q];
                                var que_q = { question: queData.question, location_id: locations[l]._id.toString(), before_after: queData.before_after, status: 1 };
                                var que_exist = await QuestionService.checkQuestionExist(que_q);

                                if (!que_exist) {
                                    queData._id = "";
                                    queData.location_id = locations[l]._id;
                                    queData.que_group_id = group_id;
                                    queData.service_id = null;
                                    queData.category_id = null;

                                    var newQue = await QuestionService.createQuestion(queData);
                                    que_arr.push(newQue);
                                } else {
                                    que_arr.push(que_exist);
                                }
                            }
                            //conData[i].groupData[g].question_data[q]
                        }
                        conData[i].groupData[g].question_data = que_arr;
                    }
                    conData[i]._id = "";
                    conData[i].location_id = locations[l]._id;
                    var createdData = await ConsultationFormService.createConsultationForm(conData[i]);
                }
            }
        }

        return res.status(200).json({ status: 200, flag: true, data: conData, locations: locations, message: "Question recieved successfully!" });
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}


exports.copyMasterConsultationFormToLocationData = async function (req, res, next) {
    var id = req.body.master_con_form_id;
    try {
        var to_location_id = req.body.to_location;

        if (!to_location_id && to_location_id?.length == 0) {
            return res.status(200).json({ status: 200, flag: false, data: conData, locations: locations, message: "To location is required!" });
        }

        var conData = await MasterConsultationFormService.getMasterConsultationForm(id);

        var formData = {
            master_consultation_form_id: '',
            master_category_ids: null,
            master_service_ids: null,
            category_id: null,
            service_id: null,
            groupData: [],
            location_id: null,
            name: '',
            desc: '',
            form_type: 'service',
            status: 1
        }

        if (conData) {

            if (to_location_id?.length > 0) {
                for (let l = 0; l < to_location_id.length; l++) {

                    var con_q = { name: conData?.name, location_id: to_location_id[l] }
                    var con_exist = await ConsultationFormService.checkConsultationFormExist(con_q);

                    if (!con_exist) {
                        var cat_arr = [];
                        var service_arr = [];
                        formData.master_consultation_form_id = conData._id;
                        formData.name = conData.name;
                        formData.desc = conData.desc;
                        formData.master_category_ids = null;
                        formData.master_service_ids = null;
                        // if (conData.master_category_ids && conData.master_category_ids.length > 0) {
                        //     for (var c = 0; c < conData.master_category_ids.length; c++) {
                        //         var cat_q = { name: conData.master_category_ids[c].name, location_id: to_location_id };
                        //         var cat_exist = await CategoryService.checkCategoryExist(cat_q);
                        //         if (!cat_exist) {
                        //             var cat = await MasterCategoryService.getMasterCategory(conData.master_category_ids[c]._id)
                        //             cat._id = "";
                        //             cat.location_id = to_location_id;
                        //             cat.status = 1;
                        //             var newCategory = await CategoryService.createCategory(cat);
                        //             cat_arr.push(newCategory._id);
                        //         } else {
                        //             cat_arr.push(cat_exist._id);
                        //         }
                        //     }
                        //     formData.category_id = null;
                        //     if (cat_arr && cat_arr.length > 0) {
                        //         cat_arr = cat_arr.map(x => ObjectId(x));
                        //         formData.category_id = cat_arr;
                        //     }
                        // }

                        // if (conData.master_service_ids && conData.master_service_ids.length > 0) {
                        //     for (var s = 0; s < conData.master_service_ids.length; s++) {
                        //         var ser = await MasterService.getMasterService(conData.master_service_ids[s]._id)
                        //         if (ser && ser.name && ser.master_category_id) {
                        //             var ser_q = { name: ser.name, location_id: to_location_id };
                        //             var ser_exist = await ServiceService.checkServiceExist(ser_q);
                        //             if (!ser_exist) {
                        //                 var cat = await MasterCategoryService.getMasterCategory(ser?.master_category_id?._id)
                        //                 if (cat && cat.name) {
                        //                     var cat_q = { name: cat.name, location_id: to_location_id };
                        //                     var cat_exist = await CategoryService.checkCategoryExist(cat_q);

                        //                     if (!cat_exist) {
                        //                         cat._id = "";
                        //                         cat.location_id = to_location_id;
                        //                         var newCategory = await CategoryService.createCategory(cat);
                        //                         ser.category_id = ObjectId(newCategory._id);
                        //                     } else {
                        //                         ser.category_id = ObjectId(cat_exist._id);
                        //                     }
                        //                 }
                        //                 ser._id = "";
                        //                 ser.location_id = to_location_id;
                        //                 ser.status = 1;

                        //                 var newService = await ServiceService.createService(ser)
                        //                 service_arr.push(newService._id);
                        //             } else {
                        //                 service_arr.push(ser_exist._id);
                        //             }
                        //         }
                        //     }
                        //     formData.service_id = null;
                        //     if (service_arr && service_arr.length > 0) {
                        //         service_arr = service_arr.map(x => ObjectId(x));
                        //         formData.service_id = service_arr;
                        //     }
                        // }
                        if (conData.masterGroupData && conData.masterGroupData.length > 0) {
                            for (var g = 0; g < conData.masterGroupData.length; g++) {
                                var group_id = '';
                                var group_data;
                                formData.groupData.push({ group_id: '', group_data: {}, question_data: [] })
                                if (conData.masterGroupData[g].group_data && conData.masterGroupData[g].group_data.name) {
                                    var groupData = conData.masterGroupData[g].group_data;

                                    var grp_q = { name: conData.masterGroupData[g].group_data.name, location_id: to_location_id[l] };

                                    var grp_exist = await QuestionGroupService.checkGroupExist(grp_q)

                                    if (!grp_exist) {
                                        groupData._id = "";
                                        groupData.location_id = ObjectId(to_location_id[l]);
                                        groupData.status = 1;
                                        var newGroup = await QuestionGroupService.createQuestionGroup(groupData);
                                        group_id = newGroup._id;
                                        group_data = { _id: newGroup._id, name: newGroup.name, description: newGroup.description };
                                    } else {
                                        group_id = grp_exist._id;
                                        group_data = { _id: grp_exist._id, name: grp_exist.name, description: grp_exist.description };
                                    }
                                    formData.groupData[g].group_id = group_id;
                                    formData.groupData[g].group_data = group_data;
                                }
                                var que_arr = [];

                                for (var q = 0; q < conData.masterGroupData[g].question_data.length; q++) {
                                    if (conData.masterGroupData[g].question_data[q] && conData.masterGroupData[g].question_data[q].question) {

                                        var queData = conData.masterGroupData[g].question_data[q];
                                        var que_q = { question: queData.question, location_id: to_location_id[l], before_after: queData.before_after, status: 1, que_group_id: group_id.toString() };
                                        var que_exist = await QuestionService.checkQuestionExist(que_q);
                                        if (!que_exist) {
                                            queData._id = "";
                                            queData.location_id = to_location_id[l];
                                            queData.que_group_id = group_id;
                                            queData.service_id = null;
                                            queData.category_id = null;
                                            queData.status = 1;
                                            var newQue = await QuestionService.createQuestion(queData);
                                            que_arr.push(newQue);
                                        } else {
                                            que_arr.push(que_exist);
                                        }
                                    }
                                }
                                formData.groupData[g].question_data = que_arr;
                            }
                            formData._id = "";
                            formData.location_id = to_location_id[l];

                            var createdData = await ConsultationFormService.createConsultationForm(formData);
                        }
                    }
                }
            }

            //  else {

            //     return res.status(200).json({ status: 200, flag: true, data: conData, message: "Consultation form (" + conData.name + ") already exist with same name!" });
            // }
        } else {
            return res.status(200).json({ status: 200, flag: true, data: conData, message: "Master Consultation form detail not found" });
        }

        return res.status(200).json({ status: 200, flag: true, data: conData, message: "Consultation form copy successfully!" });
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.copyConsultationFormToLocationData = async function (req, res, next) {
    var id = req.body.consultataion_form_id;
    try {
        var location_id = req.body.from_location_id;
        var to_location_id = req.body.to_location;

        if (!location_id || !to_location_id) {
            return res.status(200).json({ status: 200, flag: false, data: conData, locations: locations, message: "To and From location is required!" });
        }

        var conData = await ConsultationFormService.getConsultationForm(id);
        if (conData) {
            var con_q = { name: conData.name, location_id: to_location_id }
            var con_exist = await ConsultationFormService.checkConsultationFormExist(con_q);
            if (!con_exist) {
                var cat_arr = [];
                var service_arr = [];
                if (conData.category_id && conData.category_id.length > 0) {
                    for (var c = 0; c < conData.category_id.length; c++) {
                        var cat_q = { name: conData.category_id[c].name, location_id: to_location_id };
                        var cat_exist = await CategoryService.checkCategoryExist(cat_q);
                        if (!cat_exist) {
                            var cat = await CategoryService.getCategory(conData.category_id[c]._id)
                            cat._id = "";
                            cat.location_id = to_location_id;
                            cat.status = 1;
                            var newCategory = await CategoryService.createCategory(cat);
                            cat_arr.push(newCategory._id);
                        } else {
                            cat_arr.push(cat_exist._id);
                        }
                    }
                    conData.category_id = null;
                    if (cat_arr && cat_arr.length > 0) {
                        cat_arr = cat_arr.map(x => ObjectId(x));
                        conData.category_id = cat_arr;
                    }
                }

                if (conData.service_id && conData.service_id.length > 0) {
                    for (var s = 0; s < conData.service_id.length; s++) {
                        var ser = await ServiceService.getServiceId(conData.service_id[s]._id)
                        if (ser && ser.name && ser.category_id) {
                            var ser_q = { name: ser.name, location_id: to_location_id };
                            var ser_exist = await ServiceService.checkServiceExist(ser_q);
                            if (!ser_exist) {
                                var cat = await CategoryService.getCategory(ser.category_id)
                                if (cat && cat.name) {
                                    var cat_q = { name: cat.name, location_id: to_location_id };
                                    var cat_exist = await CategoryService.checkCategoryExist(cat_q);

                                    if (!cat_exist) {
                                        cat._id = "";
                                        cat.location_id = to_location_id;
                                        var newCategory = await CategoryService.createCategory(cat);
                                        ser.category_id = newCategory._id;
                                    } else {
                                        ser.category_id = cat_exist._id;
                                    }
                                }
                                ser._id = "";
                                ser.location_id = to_location_id;
                                ser.status = 1;
                                var newService = await ServiceService.createService(ser)
                                service_arr.push(newService._id);
                            } else {
                                service_arr.push(ser_exist._id);
                            }
                        }
                    }
                    conData.service_id = null;
                    if (service_arr && service_arr.length > 0) {
                        service_arr = service_arr.map(x => ObjectId(x));
                        conData.service_id = service_arr;
                    }
                }

                for (var g = 0; g < conData.groupData.length; g++) {
                    var group_id = '';
                    var group_data;
                    if (conData.groupData[g].group_data && conData.groupData[g].group_data.name) {
                        var groupData = conData.groupData[g].group_data;

                        var grp_q = { name: conData.groupData[g].group_data.name, location_id: to_location_id };

                        var grp_exist = await QuestionGroupService.checkGroupExist(grp_q)

                        if (!grp_exist) {
                            groupData._id = "";
                            groupData.location_id = ObjectId(to_location_id);
                            groupData.status = 1;
                            var newGroup = await QuestionGroupService.createQuestionGroup(groupData);
                            group_id = newGroup._id;
                            group_data = { _id: newGroup._id, name: newGroup.name, description: newGroup.description };
                        } else {
                            group_id = grp_exist._id;
                            group_data = { _id: grp_exist._id, name: grp_exist.name, description: grp_exist.description };
                        }
                        conData.groupData[g].group_id = group_id;
                        conData.groupData[g].group_data = group_data;
                    }
                    var que_arr = [];
                    for (var q = 0; q < conData.groupData[g].question_data.length; q++) {
                        if (conData.groupData[g].question_data[q] && conData.groupData[g].question_data[q].question) {

                            var queData = conData.groupData[g].question_data[q];
                            var que_q = { question: queData.question, location_id: to_location_id, before_after: queData.before_after, status: 1, que_group_id: group_id.toString() };
                            var que_exist = await QuestionService.checkQuestionExist(que_q);
                            if (!que_exist) {
                                queData._id = "";
                                queData.location_id = to_location_id;
                                queData.que_group_id = group_id;
                                queData.service_id = null;
                                queData.category_id = null;
                                queData.status = 1;
                                var newQue = await QuestionService.createQuestion(queData);
                                que_arr.push(newQue);
                            } else {
                                que_arr.push(que_exist);
                            }
                        }
                    }
                    conData.groupData[g].question_data = que_arr;
                }
                conData._id = "";
                conData.location_id = to_location_id;
                var createdData = await ConsultationFormService.createConsultationForm(conData);
            } else {
                return res.status(200).json({ status: 200, flag: true, data: conData, message: "Consultation form (" + conData.name + ") already exist with same name!" });
            }
        } else {
            return res.status(200).json({ status: 200, flag: true, data: conData, message: "Consultation form detail not found" });
        }

        return res.status(200).json({ status: 200, flag: true, data: conData, message: "Consultation form copy successfully!" });
    } catch (e) {
        console.log(e)
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}