var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var SmsLogSchema = new mongoose.Schema({
    company_id: String, // organization-id
    location_id: String, // branch-id
    client_id: String,
    type: String, // direct|cron
    sms_type: String,
    date: Date,
    mobile: String,
    content: String,
    till_date: Date,
    sms_count: Number,
    sms_setting: String,
    sms_response: String,
    twillio_response: String,
    sent_count: Number,
    response_status: String, // Pending|Sent|Received|Delivered|Queued|Failed
    status: String // initial|processed|pending|sent|delivered
}, { timestamps: true })

SmsLogSchema.plugin(mongoosePaginate)
const SmsLog = mongoose.model('smslogs', SmsLogSchema)

module.exports = SmsLog;