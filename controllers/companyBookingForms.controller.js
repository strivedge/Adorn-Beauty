var CompanyBookingFormService = require('../services/companyBookingForm.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getCompanyBookingForms = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 100;
    try {
        var companyBookingForms = await CompanyBookingFormService.getCompanyBookingForms({}, page, limit)
        // Return the CompanyBookingForms list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: companyBookingForms, message: "CompanyBookingForms received successfully."});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getCompanyBookingForm = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var companyBookingForm = await CompanyBookingFormService.getCompanyBookingForm(id);
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: companyBookingForm, message: "CompanyBookingForm received successfully."});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.getCompanySpecificColor = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var company_id = req.params.company_id;
    var query = {company_id: company_id};
    try {
        var companyBookingForm = await CompanyBookingFormService.getCompanySpecificColor(query);
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, flag: true, data: companyBookingForm, message: "CompanyBookingForm received successfully."});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message});
    }
}

exports.createCompanyBookingForm = async function (req, res, next) {
    try {
        // console.log(req.body);
        // Calling the Service function with the new object from the Request Body
        var createdCompanyBookingForm = await CompanyBookingFormService.createCompanyBookingForm(req.body);
        return res.status(200).json({status:200, flag: true,data: createdCompanyBookingForm, message: "CompanyBookingForm created successfully."})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.updateCompanyBookingForm = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({status: 200, flag: false, message: "Id must be present"})
    }
    try {
        var updatedCompanyBookingForm = await CompanyBookingFormService.updateCompanyBookingForm(req.body);
        return res.status(200).json({status: 200, flag: true, data: updatedCompanyBookingForm, message: "CompanyBookingForm updated successfully."})
    } catch (e) {
        // console.log('e',e)
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}

exports.removeCompanyBookingForm = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({status: 200, flag: true, message: "Id must be present"})
    }
    try {
        var deleted = await CompanyBookingFormService.deleteCompanyBookingForm(id);
        res.status(200).send({status: 200, flag: true,message: "CompanyBookingForm deleted successfully."});
    } catch (e) {
        return res.status(200).json({status: 200, flag: false, message: e.message})
    }
}