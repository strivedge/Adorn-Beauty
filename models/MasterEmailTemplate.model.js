var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterEmailTemplateSchema = new mongoose.Schema({
    name: String,
    type: String,
    contents: String,
    title: String,
    desc: String
}, { timestamps: true })

MasterEmailTemplateSchema.plugin(mongoosePaginate);
const MasterEmailTemplate = mongoose.model('master_email_templates', MasterEmailTemplateSchema);

module.exports = MasterEmailTemplate;
