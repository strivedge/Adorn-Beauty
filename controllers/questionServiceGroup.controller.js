var QuestionServiceGroupService = require('../services/questionServiceGroup.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getQuestionServiceGroups = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 10;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if(req.query.searchText && req.query.searchText != 'undefined'){
       query['$or'] = [ { name: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }, { description: { $regex: '.*' + req.query.searchText + '.*' , $options: 'i'}  }];
    }

    try {
        var questionServiceGroups = await QuestionServiceGroupService.getQuestionServiceGroups(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText)
        // Return the QuestionGroups list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: questionServiceGroups, message: "Succesfully QuestionServiceGroups Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getQuestionServiceGroup = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var questionServiceGroup = await QuestionServiceGroupService.getQuestionServiceGroup(id)
        // Return the QuestionServiceGroup list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: questionServiceGroup, message: "Succesfully QuestionServiceGroup Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getQuestionServiceGroupSpecific = async function (req, res, next) {
    if (!req.query.location_id) {
        return res.status(200).json({status: 200, flag: false, message: "Location Id must be present"})
    }

    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        query['company_id' ] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id' ] = req.query.location_id;
    }
    if (req.query.status && req.query.status != 'undefined') {
        query['status' ] = parseInt(req.query.status);
    }
    // console.log("getQuestionServiceGroupSpecific ",query)
    try {
        var questionServiceGroup = await QuestionServiceGroupService.getQuestionServiceGroupSpecific(query)
        // Return the QuestionServiceGroup list with Code and Message.
        return res.status(200).json({status: 200, flag: true, data: questionServiceGroup, message: "Succesfully QuestionServiceGroup Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createQuestionServiceGroup = async function (req, res, next) {
    // console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdQuestionServiceGroup = await QuestionServiceGroupService.createQuestionServiceGroup(req.body)
        return res.status(200).json({status:200, flag: true,data: createdQuestionServiceGroup, message: "Succesfully Created QuestionServiceGroup"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: "QuestionServiceGroup Creation was Unsuccesfull"})
    }
}

exports.updateQuestionServiceGroup = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }

    try {
        var updatedQuestionServiceGroup = await QuestionServiceGroupService.updateQuestionServiceGroup(req.body)
        return res.status(200).json({status: 200, flag: true, data: updatedQuestionServiceGroup, message: "Succesfully Updated QuestionServiceGroup"})
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeQuestionServiceGroup = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    
    try {
        var deleted = await QuestionServiceGroupService.deleteQuestionServiceGroup(id);
        res.status(200).send({status: 200, flag: true, message: "Succesfully Deleted... "});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}