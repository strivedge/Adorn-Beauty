var UserService = require('../services/user.service')
var CustomerService = require('../services/customer.service')
var ServiceService = require('../services/service.service')
var CategoryService = require('../services/category.service')
var QuestionService = require('../services/question.service')
var QuestionGroupService = require('../services/questionGroup.service')
var ConsultantFormService = require('../services/consultantForm.service')
var MasterQuestionService = require('../services/masterQuestion.service')
const { isObjEmpty, isValidJson } = require('../helper')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getQuestions = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = { status: 1 }
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id
    }

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id
    }

    if (req.query.service_id && req.query.service_id != 'undefined') {
        query['service_id'] = { $elemMatch: { $eq: req.query.service_id.toString() } }
    }

    if (req.query.que_group_id && req.query.que_group_id != 'undefined') {
        query['que_group_id'] = req.query.que_group_id
    }

    if (req.query.before_after && req.query.before_after != 'undefined') {
        if (req.query.before_after == 'default') {
            query['is_default'] = 1
        }

        if (req.query.before_after == 'before') {
            query['is_default'] = 0
            query['before_after'] = 0
        }

        if (req.query.before_after == 'after') {
            query['is_default'] = 0
            query['before_after'] = 1
        }
        // query['before_after'] = parseInt(req.query.before_after);
    }

    if (req.query.searchText && req.query.searchText != 'undefined') {
        query['$or'] = [
            { question: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
        ]
    }

    try {
        var questions = await QuestionService.getQuestions(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText)

        var que = questions[0].data;
        var pagination = questions[0].pagination;
        for (var i = 0; i < que.length; i++) {
            var services = que[i].service_id;
            var q = { _id: { $in: services } };
            var service = await ServiceService.getServiceSpecific(q, 1, 1); // for replace service name
            que[i].service_id = service; //replace service name

            if (que[i].que_group_id) {
                var questionGroup = await QuestionGroupService.getQuestionGroup(que[i].que_group_id);
                if (questionGroup && questionGroup._id) {
                    que[i].que_group_name = questionGroup.name;
                }
            }

            if (que[i].category_id && que[i].category_id.length) {
                var cq = { _id: { $in: que[i].category_id } };
                var category = await CategoryService.getActiveCategories(cq);
                que[i].category_id = category;
            }
        }
        questions[0].data = que
        questions[0].pagination = pagination

        // Return the Questions list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: questions, message: "Successfully Questions Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getAllQuestions = async function (req, res, next) {
    var data = req.body;
    var pre_flag = req.body.pre_flag;

    // Default Question
    var dequery = { is_default: 1, status: 1 };
    var dgQuery = { is_default: 1, status: 1 };

    // Before Question
    var bequery = { is_default: 0, before_after: 0, status: 1 };
    var bgQuery = { is_default: 0, before_after: 0, status: 1 };

    // After Question
    var afquery = { is_default: 0, before_after: 1, status: 1 };
    var agQuery = { is_default: 0, before_after: 1, status: 1 };

    if (data.company_id && data.company_id != 'undefined') {
        dequery['company_id'] = data.company_id;
        dgQuery['company_id'] = data.company_id;

        bequery['company_id'] = data.company_id;
        bgQuery['company_id'] = data.company_id;

        afquery['company_id'] = data.company_id;
        agQuery['company_id'] = data.company_id;
    }
    if (data.location_id && data.location_id != 'undefined') {
        dequery['location_id'] = data.location_id;
        dgQuery['location_id'] = data.location_id;

        bequery['location_id'] = data.location_id;
        bgQuery['location_id'] = data.location_id;

        afquery['location_id'] = data.location_id;
        agQuery['location_id'] = data.location_id;
    }

    try {
        var category_id = [];
        var defaultQuestions = [];
        var beforeQuestions = [];
        var bsQuestionIndex = [];
        var afterQuestions = [];
        var gender = "other"; //other means unisex

        if (req.body.client_id) {
            var user = await CustomerService.getUser(req.body.client_id.toString());
            if (user) {
                gender = user.gender ? user.gender : "other";
            }
        }

        dequery['gender'] = { $in: [gender, 'other'] };
        dgQuery['gender'] = { $in: [gender, 'other'] };

        bequery['gender'] = { $in: [gender, 'other'] };
        bgQuery['gender'] = { $in: [gender, 'other'] };

        afquery['gender'] = { $in: [gender, 'other'] };
        agQuery['gender'] = { $in: [gender, 'other'] };

        if (data.service_id.length) {
            for (var c = 0; c < data.service_id.length; c++) {
                var service_category = await ServiceService.getService(data.service_id[c]);
                if (service_category && service_category._id && service_category.category_id) {
                    var cindex = category_id.indexOf(service_category.category_id);
                    if (cindex == -1) {
                        category_id.push(service_category.category_id);
                    }
                }
            }
        }


        // for Default Question
        var dgroups = await QuestionService.getQuestionDisctict('que_group_id', dequery);
        for (var i = 0; i < dgroups.length; i++) {
            dgQuery['que_group_id'] = dgroups[i];
            var dQuestions = await QuestionService.getQuestionsSpecific(dgQuery)
            if (dQuestions.length) {
                var dgroup_data = { _id: "", name: "", description: "" };
                if (dgroups[i]) {
                    var dg_query = { _id: dgroups[i] };
                    var dgroup_name = await QuestionGroupService.getQuestionGroupSpecific(dg_query);
                    if (dgroup_name.length) {
                        dgroup_data._id = dgroup_name[0]._id;
                        dgroup_data.name = dgroup_name[0].name;
                        dgroup_data.description = dgroup_name[0].description;
                    }
                }
                var groupQuestion = { group_data: dgroup_data, q_data: dQuestions };
                defaultQuestions.push(groupQuestion);
            }
        }

        // for Before Question

        if (data.type == 'customer') {
            bequery['category_id'] = { $elemMatch: { $in: [data.category_id] } };

            bgQuery['category_id'] = { $elemMatch: { $in: [data.category_id] } };
        } else {
            bequery['$or'] = [{ category_id: { $elemMatch: { $in: category_id } } },
            { service_id: { $elemMatch: { $in: data.service_id } } }
            ];

            bgQuery['$or'] = [{ category_id: { $elemMatch: { $in: category_id } } },
            { service_id: { $elemMatch: { $in: data.service_id } } }
            ];
        }

        var bgroups = await QuestionService.getQuestionDisctict('que_group_id', bequery);
        for (var k = 0; k < bgroups.length; k++) {
            bgQuery['que_group_id'] = bgroups[k];
            bsQuestionIndex = [];
            var bQuestions = await QuestionService.getQuestionsSpecific(bgQuery);
            if (bQuestions.length) {

                var bgroup_data = { _id: "", name: "", description: "" };
                if (bgroups[k]) {
                    var bg_query = { _id: bgroups[k] };
                    var bgroup_name = await QuestionGroupService.getQuestionGroupSpecific(bg_query);
                    if (bgroup_name.length) {
                        bgroup_data._id = bgroup_name[0]._id;
                        bgroup_data.name = bgroup_name[0].name;
                        bgroup_data.description = bgroup_name[0].description;
                    }
                }

                var bserviceQuestion = { group_data: bgroup_data, q_data: bQuestions };
                beforeQuestions.push(bserviceQuestion);
            }
        }
        //}

        if (data.type == 'customer') {
            afquery['category_id'] = { $elemMatch: { $in: [data.category_id] } };

            agQuery['category_id'] = { $elemMatch: { $in: [data.category_id] } };
        } else {
            afquery['$or'] = [{ category_id: { $elemMatch: { $in: category_id } } },
            { service_id: { $elemMatch: { $in: data.service_id } } }
            ];

            agQuery['$or'] = [{ category_id: { $elemMatch: { $in: category_id } } },
            { service_id: { $elemMatch: { $in: data.service_id } } }
            ];
        }

        var agroups = await QuestionService.getQuestionDisctict('que_group_id', afquery);
        for (var k = 0; k < agroups.length; k++) {
            agQuery['que_group_id'] = agroups[k];
            bsQuestionIndex = [];
            var aQuestions = await QuestionService.getQuestionsSpecific(agQuery);
            if (aQuestions.length) {

                var agroup_data = { _id: "", name: "", description: "" };
                if (agroups[k]) {
                    var ag_query = { _id: agroups[k] };
                    var bgroup_name = await QuestionGroupService.getQuestionGroupSpecific(ag_query);
                    if (bgroup_name.length) {
                        agroup_data._id = bgroup_name[0]._id;
                        agroup_data.name = bgroup_name[0].name;
                        agroup_data.description = bgroup_name[0].description;
                    }
                }

                var aserviceQuestion = { group_data: agroup_data, q_data: aQuestions };
                afterQuestions.push(aserviceQuestion);
            }
        }
        //}

        var bq = { client_id: { $elemMatch: { $eq: req.body.client_id.toString() } } }
        for (var b = 0; b < defaultQuestions.length; b++) {

            for (var q = 0; q < defaultQuestions[b].q_data.length; q++) {
                bq['default'] = { $elemMatch: { "q_id": { $eq: defaultQuestions[b].q_data[q]._id.toString() } } };

                if (defaultQuestions[b].q_data[q].options.length > 0) {
                    for (var oq = 0; oq < defaultQuestions[b].q_data[q].options.length; oq++) {
                        if (defaultQuestions[b].q_data[q].options[oq].question_ids && defaultQuestions[b].q_data[q].options[oq].question_ids.length > 0) {
                            var otp_q = { _id: { $in: defaultQuestions[b].q_data[q].options[oq].question_ids } };
                            var optQue = await QuestionService.getQuestionsSpecific(otp_q);
                            defaultQuestions[b].q_data[q].options[oq].question_ids = optQue;
                        } else {
                            defaultQuestions[b].q_data[q].options[oq].question_ids = [];
                        }
                    }
                }

                var consultantForms = await ConsultantFormService.getConsultantFormsSpecific(bq);

                if (consultantForms && consultantForms.length > 0 && !pre_flag) {
                    var setDefaultData = consultantForms[0].default.findIndex(x => x.q_id === defaultQuestions[b].q_data[q]._id.toString());

                    defaultQuestions[b].q_data[q].value = {};

                    if (setDefaultData != -1) {
                        defaultQuestions[b].q_data[q].value = consultantForms[0].default[setDefaultData];
                    }

                }
            }
        }

        var bq = { client_id: { $elemMatch: { $eq: req.body.client_id.toString() } } }
        for (var b = 0; b < beforeQuestions.length; b++) {
            for (var q = 0; q < beforeQuestions[b].q_data.length; q++) {
                bq['before'] = { $elemMatch: { "q_id": { $eq: beforeQuestions[b].q_data[q]._id.toString() } } };
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

                var consultantForms = await ConsultantFormService.getConsultantFormsSpecific(bq);

                if (consultantForms && consultantForms.length > 0 && !pre_flag) {
                    var setBeforeData = consultantForms[0].before.findIndex(x => x.q_id === beforeQuestions[b].q_data[q]._id.toString());
                    beforeQuestions[b].q_data[q].value = {};

                    if (setBeforeData != -1) {
                        beforeQuestions[b].q_data[q].value = consultantForms[0].before[setBeforeData];
                    }

                }
            }
        }

        var aq = { client_id: { $elemMatch: { $eq: req.body.client_id.toString() } } }
        for (var b = 0; b < afterQuestions.length; b++) {
            for (var q = 0; q < afterQuestions[b].q_data.length; q++) {

                aq['after'] = { $elemMatch: { "q_id": { $eq: afterQuestions[b].q_data[q]._id.toString() } } };

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

                var consultantForms = await ConsultantFormService.getConsultantFormsSpecific(aq);

                if (consultantForms && consultantForms.length > 0 && !pre_flag) {
                    var setAfterData = consultantForms[0].after.findIndex(x => x.q_id === afterQuestions[b].q_data[q]._id.toString());
                    afterQuestions[b].q_data[q].value = {};
                    if (setAfterData != -1) {
                        afterQuestions[b].q_data[q].value = consultantForms[0].after[setAfterData];
                    }

                }
            }
        }

        // Return the Questions list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, default: defaultQuestions, before: beforeQuestions, after: afterQuestions, message: "Successfully Questions Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getActiveQuestions = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var query = {}
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        if (req.query.status == 1) {
            query['status'] = 1
        }

        var Questions = await QuestionService.getActiveQuestions(query)
        // Return the Questions list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Questions, message: "Successfully Questions Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getQuestion = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var Question = await QuestionService.getQuestion(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Question, message: "Successfully Question Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.uploadQuestionImage = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var image = req.body.image;
    var old_path = req.body.old_path ?? ''
    try {
        var path = await QuestionService.updateQuestionImage(image,old_path)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: path, message: "Successfully Question Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

// getting all Questions for company copy
exports.getQuestionsSpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 1000;
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.que_group_id && req.query.que_group_id != 'undefined') {
        query['que_group_id'] = req.query.que_group_id;
    }
    if (req.query.status == 1) {
        query['status'] = 1;
    }
    try {
        var Questions = await QuestionService.getQuestionsSpecific(query, page, limit)
        // console.log("Questions len ",Questions.length)
        // Return the Services list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: Questions, message: "Successfully Services Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createQuestion = async function (req, res, next) {
    //req.body.service_id = ["608d1ab1558f442514a5a8ac"];
    //req.body.options = [{lable:"Yes",value:'yes'},{lable:"No",value:'no'}];
    try {
        
        var masterQuestion = await QuestionGroupService.getQuestionGroup(req.body.que_group_id)
        
        req.body.master_que_group_id = masterQuestion.master_question_group_id
        req.body.que_group_name = masterQuestion.name
        
        var getMasterQuestionId =await QuestionService.getMasterQuestionId(req.body)
        req.body.master_question_id = getMasterQuestionId;
        // Calling the Service function with the new object from the Request Body
        var createdQuestion = await QuestionService.createQuestion(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdQuestion, message: "Successfully Created Question" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "Question Creation was Unsuccesfull" })
    }
}

exports.updateQuestion = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedQuestion = await QuestionService.updateQuestion(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedQuestion, message: "Successfully Updated Question" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateMultiQuestion = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body.question_ids.length > 0) {
        return res.status(200).json({ status: 200, flag: false, message: "Question Ida must be present" })
    }
    try {
        var query = { _id: { $in: req.body.question_ids } };
        var questions = await QuestionService.getQuestionsSpecific(query);

        if (questions.length > 0) {
            for (var i = 0; i < questions.length; i++) {

                if (req.body.category_id.length > 0) {

                    for (var c = 0; c < req.body.category_id.length; c++) {
                        var c_ind = questions[i].category_id.findIndex(x => x == req.body.category_id[c]);
                        if (c_ind == -1) {
                            questions[i].category_id.push(req.body.category_id[c])
                        }
                    }
                }
                if (req.body.service_id.length > 0) {

                    for (var s = 0; s < req.body.service_id.length; s++) {
                        var s_ind = questions[i].service_id.findIndex(x => x == req.body.service_id[s]);
                        if (s_ind == -1) {
                            questions[i].service_id.push(req.body.service_id[s])
                        }
                    }
                }

                await QuestionService.updateQuestion(questions[i])

            }
        }



        return res.status(200).json({ status: 200, flag: true, data: questions, message: "Successfully Updated Questions" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeQuestion = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var deleted = await QuestionService.deleteQuestion(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeMultipleQuestion = async function (req, res, next) {
    var ids = req.body.ids;
    if (ids.length == 0) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await QuestionService.deleteMultipleQuestion(ids);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getQuestionsDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : ''
        var order = req.query?.order ? req.query.order : '1'
        var search = req.query?.searchText ? req.query.searchText : ""

        var query = {}
        var existQuery = {}
        if (req.query?.status == "active") {
            query['status'] = 1
        }

        if (req.query?.company_id) {
            query['company_id'] = req.query.company_id
        }

        if (req.query?.location_id) {
            query['location_id'] = req.query.location_id
        }

        if (req.query?.service_id) {
            query['service_id'] = { $elemMatch: { $eq: req.query.service_id.toString() } }
        }

        if (req.query?.que_group_id) {
            query['que_group_id'] = req.query.que_group_id
        }

        if (req.query?.before_after) {
            if (req.query?.before_after == 'default') {
                query['is_default'] = 1
            }

            if (req.query?.before_after == 'before') {
                query['is_default'] = 0
                query['before_after'] = 0
            }

            if (req.query?.before_after == 'after') {
                query['is_default'] = 0
                query['before_after'] = 1
            }
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
            search = search.replace(/[/\-\\^$*+?.{}()|[\]{}]/g, '\\$&')
            query['$or'] = [
                { question: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        }

        var existQuestions = []
        if (!isObjEmpty(existQuery)) {
            existQuestions = await QuestionService.getQuestionsDropdown(existQuery, orderName, order) || []
        }

        var questions = await QuestionService.getQuestionsDropdown(query, orderName, order) || []
        questions = existQuestions.concat(questions) || []

        return res.status(200).send({ status: 200, flag: true, data: questions, message: "Question dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}
