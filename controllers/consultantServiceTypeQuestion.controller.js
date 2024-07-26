var ConsultantServiceTypeQuestionService = require('../services/consultantServiceTypeQuestion.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getConsultantServiceTypeQuestions = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';
    
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id' ] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    // console.log('ConsultantServiceTypeQuestion',query)
    try {
        var cronjobActions = await ConsultantServiceTypeQuestionService.getConsultantServiceTypeQuestions(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText);
        // Return the ConsultantServiceTypeQuestions list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: cronjobActions, message: "Successfully ConsultantServiceTypeQuestions Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getConsultantServiceTypeQuestion = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var consultantServiceTypeQuestion = await ConsultantServiceTypeQuestionService.getConsultantServiceTypeQuestion(id)
        // Return the ConsultantServiceTypeQuestion list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: consultantServiceTypeQuestion, message: "Successfully ConsultantServiceTypeQuestion Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createConsultantServiceTypeQuestion = async function (req, res, next) {
    // console.log('ConsultantServiceTypeQuestion ',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdConsultantServiceTypeQuestion = await ConsultantServiceTypeQuestionService.createConsultantServiceTypeQuestion(req.body)
        return res.status(200).json({status:200, flag: true,data: createdConsultantServiceTypeQuestion, message: "Successfully Created ConsultantServiceTypeQuestion"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "ConsultantServiceTypeQuestion Creation was Unsuccesfull"})
    } 
}

exports.updateConsultantServiceTypeQuestion = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedConsultantServiceTypeQuestion = await ConsultantServiceTypeQuestionService.updateConsultantServiceTypeQuestion(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedConsultantServiceTypeQuestion, message: "Successfully Updated ConsultantServiceTypeQuestion"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeConsultantServiceTypeQuestion = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    try {
        var deleted = await ConsultantServiceTypeQuestionService.deleteConsultantServiceTypeQuestion(id);
        res.status(200).send({status: 200, flag: true, message: "Successfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}