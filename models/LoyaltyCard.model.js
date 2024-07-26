var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var LoyaltyCardSchema = new mongoose.Schema({
    company_id: String, //organization-id
    location_id: String, //branch-id
    category_id: String,
    service_id: String,
    name: String,
    desc: String,
    paid_count: Number, //paid service count
    free_count: Number, //free service count
    recurring_count: Number, //recurring times
    start_date: Date,
    end_date: Date,
    online_status: Number,
    auto_assign: Number,
    status: Number
}, { timestamps: true })

LoyaltyCardSchema.plugin(mongoosePaginate);
const LoyaltyCard = mongoose.model('loyaltycards', LoyaltyCardSchema);

module.exports = LoyaltyCard;
