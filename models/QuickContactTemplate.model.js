var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')


var QuickContactTemplateSchema = new mongoose.Schema({
    company_id:String,
    location_id: String,
    name: String,
    desc: String,
    status: Number,
},{ timestamps: true })

QuickContactTemplateSchema.plugin(mongoosePaginate)
const QuickContactTemplate = mongoose.model('QuickContactTemplate', QuickContactTemplateSchema)

module.exports = QuickContactTemplate;