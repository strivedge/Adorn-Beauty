var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var CustomerGiftCardSchema = new mongoose.Schema({
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' }, // Organization Id
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // Branch Id
    created_location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' },
    redeem_location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' }, // Receiver
    buyer_customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' }, // Buyer
    gift_card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'gift_cards' },
    added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    service_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'services' }],
    sr_no: String,
    gift_code: String,
    type: String, // digital|physical
    amount: Number,
    remaining: Number,
    delivery_charge: Number,
    billing_address: {
        name: { type: String },
        first_name: { type: String },
        last_name: { type: String },
        email: { type: String },
        contact: { type: String },
        address1: { type: String },
        address2: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: String }
    },
    shipping_address: {
        name: { type: String },
        first_name: { type: String },
        last_name: { type: String },
        email: { type: String },
        contact: { type: String },
        address1: { type: String },
        address2: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: String }
    },
    image: String,
    payment_mode: String,
    transaction_id: String,
    transaction_detail: Object,
    upto_months: Number,
    start_date: Date,
    end_date: Date,
    old_end_date: Date,
    extension_months: Number,
    extension_charge: Number,
    extension_date: Date,
    is_redeemed: Boolean,
    payment_source: String, // company|location
    source_url: String,
    status: Number // 0|1
}, { timestamps: true })

CustomerGiftCardSchema.plugin(mongoosePaginate);
const CustomerGiftCard = mongoose.model('customer_gift_cards', CustomerGiftCardSchema);

module.exports = CustomerGiftCard;
