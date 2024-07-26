var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var QuickSmsLogSchema = new mongoose.Schema({
    company_id: String, // organization-id
    location_id: String, // branch-id
    booking_id: String,
    user_id: String,
    client_id: String,
    date: Date,
    till_date: Date,
    booking_date: Date,
    mobile: String,
    content: String,
    sms_count: Number,
    sent_count: Number,
    client_name: String,
    user_name: String,
    sms_response: Object,
    response_status: String, // Pending|Sent|Received|Delivered|Queued|Failed
    status: String // initial|processed|pending|sent|delivered
}, { timestamps: true })

QuickSmsLogSchema.plugin(mongoosePaginate)
const QuickSmsLog = mongoose.model('QuickSmsLogs', QuickSmsLogSchema)

module.exports = QuickSmsLog;