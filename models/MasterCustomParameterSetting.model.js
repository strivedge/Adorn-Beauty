var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterCustomParameterSettingSchema = new mongoose.Schema({
    title: String,
    category: String, // belong to which category -> like no show or cron job
    formData: Object,
    desc: String,
    status: Number
}, { timestamps: true })

MasterCustomParameterSettingSchema.plugin(mongoosePaginate);
const MasterCustomParameterSetting = mongoose.model('master_custom_parameter_settings', MasterCustomParameterSettingSchema);

module.exports = MasterCustomParameterSetting;
