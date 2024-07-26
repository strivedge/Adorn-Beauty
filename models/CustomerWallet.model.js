var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CustomerWalletSchema = new mongoose.Schema({
	company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' }, // company or organization_id
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // branch id
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    customer_giftcard_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customer_giftcards' },
    appointment_id: String,
    desc: String,
    credit_balance: Number,
    debit_balance: Number,
    total_balance: Number,
    transaction_type : String, //gift_card | reward | admin
    balance_type: String,
    reward_points: Number,
    added_by: Date,
    status: Number,
},{ timestamps: true })

CustomerWalletSchema.plugin(mongoosePaginate)
const CustomerWallet = mongoose.model('customer_wallet', CustomerWalletSchema)

module.exports = CustomerWallet;