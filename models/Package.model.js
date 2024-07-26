var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var PackageSchema = new mongoose.Schema({
	company_id: String, // organization-id
	location_id: String, // branch-id
	group_services: [],
	services: [],
	name: String,
	gender: String,
	retail_price: String,
	note_for_therapist: String,
	description: String,
	no_of_days: Number,
	is_sale_online: Number,
	status: Number
}, { timestamps: true })

PackageSchema.plugin(mongoosePaginate);
const Package = mongoose.model('packages', PackageSchema);

module.exports = Package;
