var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CustomerRewardSchema = new mongoose.Schema({
    company_id: String,
    location_id: String,
    customer_id: String,
    appoitment_id: String,
    amount: Number,
    gain_points: Number, //newly gained points
    redeem_points: Number,
    total_points: Number, //before total_points (+ newly gained points OR - redeem points)
    date: Date,
    action: String, //(gain or redeem)
    added_by: String,
    added_user_id: String,
    discount_slab_id: String
}, { timestamps: true })

CustomerRewardSchema.plugin(mongoosePaginate)
const CustomerReward = mongoose.model('customerrewards', CustomerRewardSchema)

module.exports = CustomerReward