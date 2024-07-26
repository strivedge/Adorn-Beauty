var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CustomerPackageLogSchema = new mongoose.Schema({
	location_id: String, // branch id
	customer_id: String, // customer id
	customer_package_id: String,
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
	start_date: Date,
	end_date: Date,
	retail_price: String,
	sold_price: String,
	extension: Number,
	extended_date: Date,
	extension_charge: String,
	updated_by: String
}, { timestamps: true })

CustomerPackageLogSchema.plugin(mongoosePaginate)
const CustomerPackageLog = mongoose.model('customerpackagelog', CustomerPackageLogSchema)

module.exports = CustomerPackageLog