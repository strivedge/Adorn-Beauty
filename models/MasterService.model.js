var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterServiceSchema = new mongoose.Schema({
    master_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_categories' },
    master_test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_tests' },
    name: String,
    desc: String,
    duration: Number,
    gender: String,
    reminder: Number,
    price: Number,
    special_price: Number,
    commission: Number,
    tax: Number,
    service_limit: Number, // Consultation Fee
    menu_order: Number,
    online_status: Number,
    price_list_status: Number,
    status: Number,
    category_name: String // Display purpose
}, { timestamps: true })

// MasterServiceSchema.index({ name: 'text', desc: 'text', duration: 'text', reminder: 'text', gender: 'text', price: 'text', service_limit: 'text', })

MasterServiceSchema.plugin(mongoosePaginate);
MasterServiceSchema.index({ name: 'text' });
// MasterServiceSchema.index({ gender: 'text' })

const MasterService = mongoose.model('master_services', MasterServiceSchema);

module.exports = MasterService;
