var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var DiscountSchema = new mongoose.Schema({
	company_id: String, //organization-id
	location_id: String, //branch-id
	name: String,
	discount_type: String,
	discount_value: String, // based on discount type
	days: Array, // based on discount type
	start_date: Date,
	end_date: Date,
	start_time: String,
	end_time: String,
	start_time_meridiem: String,
	end_time_meridiem: String,
	min_discount: String, // based on discount type
	max_discount: String, // based on discount type
	min_order_val: String,
	max_order_val: String,
	per_user_occurances: String,
	max_occurances: String,
	category_id: String,
	service_id: Array,
	paid_service_id: Array,
	discount_code: String,
	status: Number,
	weekend: String,
	holiday: String,
	description: String,
	customer_id: String, //discount assign to perticular customer
	discount_code_type: String,
	is_offer_module: Number,
	customer_arr: Array,
	email_notification: Number,
	sms_notification: Number,
	all_customer: Number,
	offer_email_template_id: String,
	offer_email_template_data: {},
	evening_start_time: String,
	evening_end_time: String,
	evening_start_time_meridiem: String,
	evening_end_time_meridiem: String,
	offer_email_template: String,
	offer_email_subject: String,
	email_title: String,
	email_desc: String,
	offer_image: String,
	all_online_services: Number,
	show_to_customer: Number,
	apply_on_all_services: Number,
	is_expired : { type: Number, default: 0 },
}, { timestamps: true })

DiscountSchema.plugin(mongoosePaginate)
const Discount = mongoose.model('discounts', DiscountSchema)

module.exports = Discount;