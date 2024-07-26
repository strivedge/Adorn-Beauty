var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

// this is only for colors
var CompanyBookingFormSchema = new mongoose.Schema({
	company_id: String,
    main_title: String,
    stepwizard_icon_active: String,
    stepwizard_icon_inactive: String,
    stepwizard_active: String,
    stepwizard_inactive: String,
    stepwizard_title: String,
    step_title: String,
    step_sub_title: String,
    radio: String,
    checkbox: String,
    service_price: String,
    friend_box_border: String,
    friend_booking_button: String,
    friend_booking_button_hover: String,
    time_slot_hover: String,
    time_slot_selection: String,
    next_button: String,
    next_button_hover: String,
},{ timestamps: true })

CompanyBookingFormSchema.plugin(mongoosePaginate)
const CompanyBookingForm = mongoose.model('CompanyBookingForms', CompanyBookingFormSchema)

module.exports = CompanyBookingForm;