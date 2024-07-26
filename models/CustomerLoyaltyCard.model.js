var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var CustomerLoyaltyCardSchema = new mongoose.Schema({
    company_id: String, // organization-id
    location_id: String, // branch-id
    customer_id: String,
    loyalty_card_id: String,
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'services' },
    name: String,
    customer_signature: String,
    start_date: Date,
    end_date: Date,
    comment: String,
    loyalty_card_data: Object,
    status: Number
}, { timestamps: true })

CustomerLoyaltyCardSchema.plugin(mongoosePaginate);
const CustomerLoyaltyCard = mongoose.model('customerloyaltycards', CustomerLoyaltyCardSchema);

module.exports = CustomerLoyaltyCard;
