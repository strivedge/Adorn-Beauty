var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var EmailTemplateSchema = new mongoose.Schema({
    company_id: String, // Organization id
    location_id: String, // branch-id
    master_email_template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_email_templates' },
    name: String,
    type: String,
    path: String,
    contents: String,
    title: String,
    desc: String
}, { timestamps: true })

EmailTemplateSchema.plugin(mongoosePaginate)
const EmailTemplate = mongoose.model('EmailTemplates', EmailTemplateSchema)

module.exports = EmailTemplate;