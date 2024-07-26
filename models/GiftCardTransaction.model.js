var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var GiftCardTransactionSchema = new mongoose.Schema({
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' }, // Organization Id
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // Branch Id
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    customer_gift_card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customer_gift_cards' },
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'appointments' },
    credit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'gift_card_transactions' },
    debit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'gift_card_transactions' },
    date: Date,
    action: String, // credit|debit
    amount: Number,
    total_amount: Number,
    description: String,
    revert: Boolean,
    status: Number // 1|0
}, { timestamps: true })

GiftCardTransactionSchema.plugin(mongoosePaginate)
const GiftCardTransaction = mongoose.model('gift_card_transactions', GiftCardTransactionSchema)

module.exports = GiftCardTransaction;