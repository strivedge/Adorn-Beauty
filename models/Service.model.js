var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ServiceSchema = new mongoose.Schema({
    company_id: String, // organization-id
    location_id: String, // branch-id
    master_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_categories' },
    master_test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_tests' },
    master_service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_services' },
    category_id: String,
    test_id: String,
    name: String,
    desc: String,
    duration: Number,
    gender: String,
    reminder: Number,
    actual_price: Number,
    variable_price: Number,
    price: Number,
    special_price: Number,
    hide_strike_price: Number,
    deposite_type: String, // percentage | Amount
    deposite: String,
    min_deposite: Number,
    is_start_from: Number,
    start_from_title: String,
    is_price_range: Number,
    max_price: Number,
    commission: Number, //base price
    tax: Number,
    tax_type: String,
    online_status: Number,
    menu_order: Number,
    status: Number,
    price_list_status: Number,
    service_type_group_id: String,
    old_price: Number,
    category_name: String,
}, { timestamps: true })

// ServiceSchema.index({ name: 'text', desc: 'text', duration: 'text', reminder: 'text', gender: 'text', price: 'text', service_limit: 'text', })

ServiceSchema.plugin(mongoosePaginate)
ServiceSchema.index({ name: 'text' })
//ServiceSchema.index({ gender: 'text' })

const Service = mongoose.model('services', ServiceSchema)

module.exports = Service