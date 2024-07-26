var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CustomerUsagePackageServiceSchema = new mongoose.Schema({
	location_id: String, //branch id
	customer_id: String, //customer id
	package_id: String,
	customer_package_id: String,
	service_id: String,
	employee_id: String,
	appointment_id: String,
	total_session: Number,
	available_session: Number,
	session_available: Number, // session record counting from table
	session: Number, //current use 
	date: Date,
	customer_signature: String, // Client signature
	therapist_comment: String, // Employee comment
	therapist_signature: String, // Employee signature
	service_name: String // only for getting service name on listing,
}, { timestamps: true })

CustomerUsagePackageServiceSchema.plugin(mongoosePaginate)
const CustomerUsagePackageService = mongoose.model('customerusagepackageservices', CustomerUsagePackageServiceSchema)

module.exports = CustomerUsagePackageService