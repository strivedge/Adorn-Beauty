var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CustomerReviewSchema = new mongoose.Schema({
	location_id: String,
	customer_id: String,
	name: String,
	email: String,
	mobile: String,
	rating: Number,
	review: String
}, { timestamps: true })

CustomerReviewSchema.plugin(mongoosePaginate)
const CustomerReview = mongoose.model('customerreviews', CustomerReviewSchema)

module.exports = CustomerReview