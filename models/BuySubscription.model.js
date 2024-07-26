var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var BuySubscriptionSchema = new mongoose.Schema({
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' },
    subscription_id: { type: mongoose.Schema.Types.ObjectId, ref: 'subscriptions' },
    module_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'modules' }],
    max_location: Number,
    amount: Number,
    start_date: Date,
    end_date: Date,
    type: String,
    validity: String,
    response: Object,
    status: Number
}, { timestamps: true })

BuySubscriptionSchema.plugin(mongoosePaginate)
const BuySubscription = mongoose.model('buysubscriptions', BuySubscriptionSchema)

module.exports = BuySubscription;