var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var CustomerPackageSchema = new mongoose.Schema({
	company_id: String, // Organization id
	location_id: String, // Branch id
	customer_id: String, // Customer id
	employee_id: String, // Therapist id
	package_id: String,
	service_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'services' }],
	group_services: [{
		_id: false,
		category_id: String,
		service_id: String,
		session_count: String,
		service_interval: String,
		current_session: String,
		current_use_session: String,
		remaining_session: String,
	}],
	name: String,
	gender: String,
	note_for_therapist: String,
	start_date: Date,
	end_date: Date,
	old_end_date: Date,
	retail_price: String,
	sold_price: String,
	comment: String,
	no_of_days: Number,
	customer_signature: String, // Signature of client
	therapist_signature: String, // Signature of employee
	extension: Number,
	extended_date: Date,
	extension_charge: String,
	status: Number,
	agree_fact: Number,
	package_data: Object,
	transaction_id: String,
	transaction: Array
}, { timestamps: true })

CustomerPackageSchema.plugin(mongoosePaginate);
const CustomerPackage = mongoose.model('customerpackages', CustomerPackageSchema);

module.exports = CustomerPackage;
