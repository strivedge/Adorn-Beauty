var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var AppliedDiscountSchema = new mongoose.Schema({
	appointment_id: String, // appointment id
	user_id: String, // user id
	location_id: String, // branch id
	discount_id: String, // discount id
	discount_code: String,
},{ timestamps: true })

AppliedDiscountSchema.plugin(mongoosePaginate)
const AppliedDiscount = mongoose.model('AppliedDiscounts', AppliedDiscountSchema)

module.exports = AppliedDiscount;