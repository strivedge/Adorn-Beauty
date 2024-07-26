var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var WhatsAppLogSchema = new mongoose.Schema({
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' }, // company or organization_id
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // branch id
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    type: String, // direct|cron
    msg_type: String,
    date: Date,
    mobile: String,
    content: String,
    till_date: Date,
    msg_count: Number,
    response: Object,
    sent_count: Number,
    response_status: String, // success|error
    status: String // initial|processed|pending|sent|delivered||success
}, { timestamps: true })

WhatsAppLogSchema.plugin(mongoosePaginate)
const WhatsAppLog = mongoose.model('whatsapplogs', WhatsAppLogSchema)

module.exports = WhatsAppLog