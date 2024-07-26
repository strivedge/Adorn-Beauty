var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CustomerLoyaltyCardLogSchema = new mongoose.Schema({
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' }, // organization id
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // branch id
    loyalty_card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'loyaltycards' },
    customer_loyalty_card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customerloyaltycards' },
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'appointments' },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    consume: Number,
    date: Date,
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true })

CustomerLoyaltyCardLogSchema.plugin(mongoosePaginate)
const CustomerLoyaltyCardLog = mongoose.model('CustomerLoyaltyCardLogs', CustomerLoyaltyCardLogSchema)

module.exports = CustomerLoyaltyCardLog;