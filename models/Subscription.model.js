var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SubscriptionSchema = new mongoose.Schema({
    name: String,
    module: [],
    check_all: Boolean, // for maximum location
    max_location: Number, // for maximum location
    price: Number,
    validity: String,
    online_status: Number,
    status: Number
}, { timestamps: true })

SubscriptionSchema.plugin(mongoosePaginate)
const Subscription = mongoose.model('subscriptions', SubscriptionSchema)

module.exports = Subscription;