var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var OfferEmailTemplateSchema = new mongoose.Schema({
    location_id: String, // Organization id
    name: String,
    title: String,
    type: String,
    subject : String,
    contents: String,
    status:Number,
},{ timestamps: true })

OfferEmailTemplateSchema.plugin(mongoosePaginate)
const OfferEmailTemplate = mongoose.model('OfferEmailTemplates', OfferEmailTemplateSchema)

module.exports = OfferEmailTemplate;