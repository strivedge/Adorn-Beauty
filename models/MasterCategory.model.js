var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterCategorySchema = new mongoose.Schema({
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
    url_name: String
}, { timestamps: true })

MasterCategorySchema.plugin(mongoosePaginate);
const MasterCategory = mongoose.model('master_categories', MasterCategorySchema);

module.exports = MasterCategory;
