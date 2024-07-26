var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var PushNotificationLogSchema = new mongoose.Schema({
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // branch id
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    type: String, // direct|cron
    noti_type: String,
    notification: Object,
    data: Object,
    token: String,
    response: Object,
    response_status: String, // success|error
    status: String // initial|sent
}, { timestamps: true })

PushNotificationLogSchema.plugin(mongoosePaginate)
const PushNotificationLog = mongoose.model('PushNotificationLogs', PushNotificationLogSchema)

module.exports = PushNotificationLog