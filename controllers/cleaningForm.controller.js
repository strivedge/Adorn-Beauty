var UserService = require('../services/user.service')
var CleaningFormService = require('../services/cleaningForm.service')
var ConsultationFormService = require('../services/consultationForm.service')

const { isObjEmpty, isValidJson } = require('../helper')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getCleaningForms = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : '';

    var query = {};

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }

    if (req.query.employee_id && req.query.employee_id != 'undefined') {
        query['employee_id'] = req.query.employee_id;
    }

    if (req.query.date) {
        query['date'] = req.query.date;
    }

    try {
        var cleaningForms = await CleaningFormService.getCleaningForms(query, parseInt(page), parseInt(limit), order_name, Number(order), searchText);

        var data = cleaningForms[0].data;
        for (var i = 0; i < data.length; i++) {

            if (data[i].clening_form_id) {
                var form = await ConsultationFormService.getConsultationForm(data[i].clening_form_id);
                data[i].form_name = form.name;
            }

            if (data[i].employee_id) {
                var emp = await UserService.getUserById(data[i].employee_id);
                data[i].employee_name = emp.name;
            }

            if (data[i].verifier_id) {
                var user = await UserService.getUserById(data[i].verifier_id);
                data[i].verifier_name = user.name;
            }
        }
        cleaningForms[0].data = data;

        // Return the CleaningForms list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: cleaningForms, message: "Successfully CleaningForms Recieved" });
    } catch (e) {
        console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getCleaningForm = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var CleaningForm = await CleaningFormService.getCleaningForm(id)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: CleaningForm, message: "Successfully CleaningForm Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getSpecificCleaningForms = async function (req, res, next) {
    var query = {};

    if (req.query.location_id && req.query.location_id != 'undefined') {
        query['location_id'] = req.query.location_id;
    }
    if (req.query.employee_id && req.query.employee_id != 'undefined') {
        query['employee_id'] = req.query.employee_id;
    }
    if (req.query.verifier_id && req.query.verifier_id != 'undefined') {
        query['verifier_id'] = req.query.verifier_id;
    }
    if (req.query.date && req.query.date != 'undefined') {
        query['date'] = req.query.date;
    }
    if (req.query.status && req.query.status != 'undefined') {
        query['status'] = parseInt(req.query.status);
    }
    try {
        var CleaningForms = await CleaningFormService.getCleaningFormsSpecific(query)
        return res.status(200).json({ status: 200, flag: true, data: CleaningForms, message: "Successfully Categories Recieved" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createCleaningForm = async function (req, res, next) {
    try {
        var createdCleaningForm = await CleaningFormService.createCleaningForm(req.body);

        return res.status(200).json({ status: 200, flag: true, data: createdCleaningForm, message: "Successfully Created CleaningForm" })
    } catch (e) {
        console.log("Error ", e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: "CleaningForm Creation was Unsuccesfull" })
    }
}

exports.updateCleaningForm = async function (req, res, next) {
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }
    try {
        var updatedCleaningForm = await CleaningFormService.updateCleaningForm(req.body);

        return res.status(200).json({ status: 200, flag: true, data: updatedCleaningForm, message: "Successfully Updated CleaningForm" })
    } catch (e) {
        console.log("Error ", e)
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeCleaningForm = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }
    try {
        var deleted = await CleaningFormService.deleteCleaningForm(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

// This is only for dropdown
exports.getCleaningFormsDropdown = async function (req, res, next) {
    try {
        var orderName = req.query?.order_name ? req.query.order_name : ''
        var order = req.query?.order ? req.query.order : '1'
        var search = req.query?.searchText ? req.query.searchText : ""

        var query = {}
        var existQuery = {}
        if (req.query?.status == "active") {
            query['status'] = 1
        }

        if (req.query?.location_id) {
            query['location_id'] = req.query.location_id
        }

        if (req.query?.employee_id) {
            query['employee_id'] = req.query.employee_id
        }

        if (req.query?.date) {
            query['date'] = req.query.date
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
            query['$or'] = [
                { form_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { employee_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { verifier_name: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        }

        var existCleaningForms = []
        if (!isObjEmpty(existQuery)) {
            existCleaningForms = await CleaningFormService.getCleaningFormsDropdown(existQuery, orderName, order) || []
        }

        var cleaningForms = await CleaningFormService.getCleaningFormsDropdown(query, orderName, order) || []
        cleaningForms = existCleaningForms.concat(cleaningForms) || []

        return res.status(200).send({ status: 200, flag: true, data: cleaningForms, message: "Cleaning forms dropdown received successfully..." })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, data: [], message: e.message })
    }
}