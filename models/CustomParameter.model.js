var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CustomParameterSchema = new mongoose.Schema({
    company_id: String, // Organization id
    location_id: String, // branch-id
    master_custom_parameter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_custom_parameters' },
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

CustomParameterSchema.plugin(mongoosePaginate)
const CustomParameter = mongoose.model('customparameters', CustomParameterSchema)

module.exports = CustomParameter;