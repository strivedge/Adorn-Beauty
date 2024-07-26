var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterCustomParameterSchema = new mongoose.Schema({
    category: String, // belong to which category -> like no show or cron job
    key: String,
    key_url: String,
    value_type: String,
    value: String,
    custom_type: String,
    custom_options: Array,
    description: String,
    edit_flag: Number, // flag for edit
    status: Number
}, { timestamps: true })

MasterCustomParameterSchema.plugin(mongoosePaginate);
const MasterCustomParameter = mongoose.model('master_custom_parameters', MasterCustomParameterSchema);

module.exports = MasterCustomParameter;
