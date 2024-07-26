var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var EmailLogSchema = new mongoose.Schema({
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' }, // company or organization_id
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // branch id
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    name: String,
    subject: String, 
    type: String, // direct|cron
    date: Date,
    till_date: Date,
    to_email: String,
    temp_file: String,
    html: String,
    file_type: String,
    data: Object,
    response: Object,
    response_status: String, // Pending|Sent|Received|Delivered|Queued|Failed
    status: String, // initial|processed|pending|sent|delivered,
    email_type: String, // marketing|transaction
}, { timestamps: true })


EmailLogSchema.plugin(mongoosePaginate)
const EmailLog = mongoose.model('emaillogs', EmailLogSchema)

module.exports = EmailLog;