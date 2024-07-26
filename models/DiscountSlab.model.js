var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var DiscountSlabSchema = new mongoose.Schema({
	company_id: String,
	location_id: String,
    no_of_points: Number,
    offer_type: String, //(free_service, percentage, amount)
    offer_value: Number, //val of percentage or amount
    services: Array, //val of free_service
    title: String,
    desc: String, //before total_points (+ newly gained points OR - redeem points)
    image: String, //(gain or redeem)
    status: Number,
},{ timestamps: true })

DiscountSlabSchema.plugin(mongoosePaginate)
const DiscountSlab = mongoose.model('DiscountSlabs', DiscountSlabSchema)

module.exports = DiscountSlab;