var CronjobParameterService = require('../services/cronjobParameter.service');
var ServiceService = require('../services/service.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getCronjobParameters = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        //query = {company_id: req.query.company_id,status: 1};
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        //query = {location_id: req.query.location_id,status: 1};
        query['location_id'] = req.query.location_id;
    }

    if (searchText) {
        query['$or'] = [
            { name: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { desc: { $regex: '.*' + searchText + '.*', $options: 'i' } },
            { key: { $regex: '.*' + searchText + '.*', $options: 'i' } }
        ];
    }

    try {
        var cronjobParameters = await CronjobParameterService.getCronjobParameters(query, parseInt(page), parseInt(limit), order_name, Number(order))

        var cronjobPara = cronjobParameters[0].data;
        // console.log("discounts ",discounts)
        for (var i = 0; i < cronjobPara.length; i++) {
            var service_id = cronjobPara[i].service_id;
            // console.log('service_id ',service_id)
            var q = { _id: { $in: service_id } };
            var service = await ServiceService.getServiceSpecific(q, 1, 100); // for replace service name
            cronjobPara[i].service_id = service; //replace service name
            // console.log('res Service',service)
        }
        cronjobParameters[0].data = cronjobPara;

        // Return the CronjobParameters list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: cronjobParameters, message: "Cronjob parameters recieved successfully!" });
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getActiveCronjobParameters = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    // console.log("getActiveCronjobParameters ",req.query)
    var query = {};
    if (req.query.company_id && req.query.company_id != 'undefined') {
        //query = {company_id: req.query.company_id,status: 1};
        query['company_id'] = req.query.company_id;
    }
    if (req.query.location_id && req.query.location_id != 'undefined') {
        //query = {location_id: req.query.location_id,status: 1};
        query['location_id'] = req.query.location_id;
    }
    if (req.query.status == 1) {
        query['status'] = 1;
    }
    try {
        // console.log("query ",query)
        var CronjobParameters = await CronjobParameterService.getSpecificCronjobParameters(query)
        // Return the CronjobParameters list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: CronjobParameters, message: "Cronjob parameters recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCronjobParameter = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var CronjobParameter = await CronjobParameterService.getcronjobParameter(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: CronjobParameter, message: "Cronjob parameter recieved successfully!" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createCronjobParameter = async function (req, res, next) {
    // console.log('req body', req.body)
    try {
        var query = {
            key:req.body.key,
            location_id : req.body.location_id,
        }
        var isExistparameter    = await CronjobParameterService.getSpecificCronjobParameters(query);
        if(!isExistparameter){
        var getMasterCronjobId =await CronjobParameterService.getMasterCronJobParameterId(req.body)
            req.body.master_cronjob_parameter_id = getMasterCronjobId;
        // Calling the Service function with the new object from the Request Body
        var createdCronjobParameter = await CronjobParameterService.createCronjobParameter(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdCronjobParameter, message: "Cronjob parameter created successfully!" })
        }else{
            return res.status(200).json({ status: 200, flag: false, message: "Cronjob parameter all ready exist!" })
        }
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateCronjobParameter = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present!" })
    }

    try {
        var updatedCronjobParameter = await CronjobParameterService.updateCronjobParameter(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedCronjobParameter, message: "Cronjob parameter updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCronjobParameter = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }
    try {
        var deleted = await CronjobParameterService.deleteCronjobParameter(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}





