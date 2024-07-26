var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CustomParameterSettingSchema = new mongoose.Schema({
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' }, // company or organization_id
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // branch id
    master_custom_parameter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_custom_parameters' },
    title: String,
    category: String, // belong to which category -> like no show or cron job
    formData: Object,
    desc: String,
    status: Number
}, { timestamps: true })

CustomParameterSettingSchema.plugin(mongoosePaginate)
const CustomParameter = mongoose.model('custom_parameter_setting', CustomParameterSettingSchema)

module.exports = CustomParameter;