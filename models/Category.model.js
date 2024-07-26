var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CategorySchema = new mongoose.Schema({
    company_id: String, // organization-id
    location_id: String, // branch-id
    master_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_categories' },
    name: String,
    gender: String,
    desc: String,
    before_procedure: String,
    after_procedure: String,
    online_status: Number,
    status: Number,
    menu_order: Number,
    price_list_status: Number,
    brochure_background_image: String,
    brochure_background_color: String,
    brochure_heading_color: String,
    brochure_font_color: String,
    url_name: String,
    show_to_mobile_app: Number,
    thumbnail : String,
}, { timestamps: true })

CategorySchema.plugin(mongoosePaginate)
const Category = mongoose.model('categories', CategorySchema)

module.exports = Category;