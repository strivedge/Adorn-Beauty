var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var GiftCardSchema = new mongoose.Schema({
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' }, // company or organization_id
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // branch id
    name: String,
    desc: String,
    price: Number,
    type: String, // digital|physical
    delivery_charge: Number,
    start_date: Date,
    end_date: Date,
    allow_user_to_purchase: Number, //0|1
    status: Number
}, { timestamps: true })

GiftCardSchema.plugin(mongoosePaginate);
const GiftCard = mongoose.model('gift_cards', GiftCardSchema);

module.exports = GiftCard;
