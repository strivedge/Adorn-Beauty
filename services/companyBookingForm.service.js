var CompanyBookingForm = require('../models/CompanyBookingForm.model');

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the Category List
exports.getCompanyBookingForms = async function (query={}, page, limit) {
    var skips = limit * (page - 1)

    // Try Catch the awaited promise to handle the error 
    try {
        var companyBookingForms = await CompanyBookingForm.find(query)
            .skip(skips)
            .limit(limit);

        return companyBookingForms;

    } catch (e) {
        throw Error('Error occurred while finding CompanyBookingForms');
    }
}

exports.getCompanyBookingForm = async function (id) {
    try {
        // Find the Data 
        var _details = await CompanyBookingForm.findOne({
            _id: id
        });
        if(_details._id) {
            return _details;
        } else {
            throw Error("CompanyBookingForm not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CompanyBookingForm not available");
    }

}

exports.getCompanySpecificColor = async function (query) {
    try {
        // Find the Data 
        var _details = await CompanyBookingForm.findOne(query).sort({ createdAt: -1 });
        if(_details._id) {
            return _details;
        } else {
            throw Error("CompanyBookingForm not available");
        }
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CompanyBookingForm not available");
    }

}

exports.createCompanyBookingForm = async function (companyBookingForm) {    
    var newCompanyBookingForm = new CompanyBookingForm({
        company_id: companyBookingForm.company_id ? companyBookingForm.company_id : "",
        main_title: companyBookingForm.main_title ? companyBookingForm.main_title : "",
        stepwizard_icon_active: companyBookingForm.stepwizard_icon_active ? companyBookingForm.stepwizard_icon_active : "",
        stepwizard_icon_inactive: companyBookingForm.stepwizard_icon_inactive ? companyBookingForm.stepwizard_icon_inactive : "",
        stepwizard_active: companyBookingForm.stepwizard_active ? companyBookingForm.stepwizard_active : "",
        stepwizard_inactive: companyBookingForm.stepwizard_inactive ? companyBookingForm.stepwizard_inactive : "",
        stepwizard_title: companyBookingForm.stepwizard_title ? companyBookingForm.stepwizard_title : "",
        step_title: companyBookingForm.step_title ? companyBookingForm.step_title : "",
        step_sub_title: companyBookingForm.step_sub_title ? companyBookingForm.step_sub_title : "",
        radio: companyBookingForm.radio ? companyBookingForm.radio : "",
        checkbox: companyBookingForm.checkbox ? companyBookingForm.checkbox : "",
        service_price: companyBookingForm.service_price ? companyBookingForm.service_price : "",
        friend_box_border: companyBookingForm.friend_box_border ? companyBookingForm.friend_box_border : "",
        friend_booking_button: companyBookingForm.friend_booking_button ? companyBookingForm.friend_booking_button : "",
        friend_booking_button_hover: companyBookingForm.friend_booking_button_hover ? companyBookingForm.friend_booking_button_hover : "",
        time_slot_hover: companyBookingForm.time_slot_hover ? companyBookingForm.time_slot_hover : "",
        time_slot_selection: companyBookingForm.time_slot_selection ? companyBookingForm.time_slot_selection : "",
        next_button: companyBookingForm.next_button ? companyBookingForm.next_button : "",
        next_button_hover: companyBookingForm.next_button_hover ? companyBookingForm.next_button_hover : "",
    })

    try {
        // Saving the CompanyBookingForm
        var savedCompanyBookingForm = await newCompanyBookingForm.save();
        return savedCompanyBookingForm;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error occurred while creating CompanyBookingForm")
    }
}

exports.updateCompanyBookingForm = async function (companyBookingForm) {
    var id = companyBookingForm._id
    try {
        //Find the old CompanyBookingForm Object by the Id
        var oldCompanyBookingForm = await CompanyBookingForm.findById(id);
    } catch (e) {
        throw Error("CompanyBookingForm not found")
    }
    // If no old CompanyBookingForm Object exists return false
    if (!oldCompanyBookingForm) {
        return false;
    }

    //Edit the CompanyBookingForm Object
    if(companyBookingForm.company_id) {
        oldCompanyBookingForm.company_id = companyBookingForm.company_id;
    }

    if(companyBookingForm.main_title) {
        oldCompanyBookingForm.main_title = companyBookingForm.main_title;
    }

    if(companyBookingForm.stepwizard_active) {
        oldCompanyBookingForm.stepwizard_active = companyBookingForm.stepwizard_active;
    }

    if(companyBookingForm.stepwizard_icon_active) {
        oldCompanyBookingForm.stepwizard_icon_active = companyBookingForm.stepwizard_icon_active;
    }

    if(companyBookingForm.stepwizard_icon_inactive) {
        oldCompanyBookingForm.stepwizard_icon_inactive = companyBookingForm.stepwizard_icon_inactive;
    }

    if(companyBookingForm.stepwizard_inactive) {
        oldCompanyBookingForm.stepwizard_inactive = companyBookingForm.stepwizard_inactive;
    }

    if(companyBookingForm.stepwizard_title) {
        oldCompanyBookingForm.stepwizard_title = companyBookingForm.stepwizard_title;
    }

    if(companyBookingForm.step_title) {
        oldCompanyBookingForm.step_title = companyBookingForm.step_title;
    }

    if(companyBookingForm.step_sub_title) {
        oldCompanyBookingForm.step_sub_title = companyBookingForm.step_sub_title;
    }

    if(companyBookingForm.radio) {
        oldCompanyBookingForm.radio = companyBookingForm.radio;
    }

    if(companyBookingForm.checkbox) {
        oldCompanyBookingForm.checkbox = companyBookingForm.checkbox;
    }

    if(companyBookingForm.service_price) {
        oldCompanyBookingForm.service_price = companyBookingForm.service_price;
    }

    if(companyBookingForm.friend_box_border) {
        oldCompanyBookingForm.friend_box_border = companyBookingForm.friend_box_border;
    }

    if(companyBookingForm.friend_booking_button) {
        oldCompanyBookingForm.friend_booking_button = companyBookingForm.friend_booking_button;
    }

    if(companyBookingForm.friend_booking_button_hover) {
        oldCompanyBookingForm.friend_booking_button_hover = companyBookingForm.friend_booking_button_hover;
    }

    if(companyBookingForm.time_slot_hover) {
        oldCompanyBookingForm.time_slot_hover = companyBookingForm.time_slot_hover;
    }

    if(companyBookingForm.time_slot_selection) {
        oldCompanyBookingForm.time_slot_selection = companyBookingForm.time_slot_selection;
    }

    if(companyBookingForm.next_button) {
        oldCompanyBookingForm.next_button = companyBookingForm.next_button;
    }

    if(companyBookingForm.next_button_hover) {
        oldCompanyBookingForm.next_button_hover = companyBookingForm.next_button_hover;
    }

    // oldCompanyBookingForm.status = companyBookingForm.status ? companyBookingForm.status: 0;

    try {
        var savedCompanyBookingForm = await oldCompanyBookingForm.save()
        return savedCompanyBookingForm;
    } catch (e) {
        // console.log(e)
        throw Error("Error occurred while updating the CompanyBookingForm");
    }
}

exports.deleteCompanyBookingForm = async function (id) {
    // Delete the CompanyBookingForm
    try {
        var deleted = await CompanyBookingForm.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CompanyBookingForm Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error occurred while Deleting the CompanyBookingForm")
    }
}