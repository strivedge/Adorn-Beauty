var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var LocationSchema = new mongoose.Schema({
    user_id: String,
    role_id: String,
    company_id: String,
    name: String,
    contact_name: String,
    contact_number: String,
    email: String,
    full_address: String,
    latitude: String,
    longitude: String,
    admin_status: Number,
    online_status: Number,
    group_close_days: Array,
    group_special_hours: Array,
    status: Number,
    paypal_client_id: String,
    paypal_client_secret: { type: String, select: false },
    company_name: '',
    special_hour: [],
    domain: String,
    twilio_acc_sid: { type: String, select: false },
    twilio_auth_token: { type: String, select: false },
    twilio_phone_number: { type: String, select: false },
    appointmentgem_number: String,
    appopintgem_api_key: { type: String, select: false },
    sms_setting: String,
    whatsapp_access_token: { type: String, select: false },
    whatsapp_instance_id: { type: String, select: false },
    smtp_from: { type: String, select: false },
    smtp_host: { type: String, select: false },
    smtp_port: { type: Number, select: false },
    smtp_username: { type: String, select: false },
    smtp_password: { type: String, select: false },
    smtp_setting: [{
        _id: false,
        from: { type: String, select: false },
        host: { type: String, select: false },
        port: { type: Number, select: false },
        username: { type: String, select: false },
        password: { type: String, select: false },
        smtp_limit: { type: Number, select: false },
    }],
    whatsapp_setting: [{
        _id: false,
        access_token: { type: String, select: false },
        instance_id: { type: String, select: false },
    }],
    marketing_sms_setting: String,
    twilio_setting: [{
        _id: false,
        twilio_acc_sid: { type: String, select: false },
        twilio_auth_token: { type: String, select: false },
        twilio_phone_number: { type: String, select: false },
    }],
    sendapp_setting: [{
        _id: false,
        appopintgem_api_key: { type: String, select: false },
        appointmentgem_number: { type: String, select: false },
    }],
    soft_delete: Boolean,
    is_default_data: Boolean,
    setup_steps: Number,
    prefix: String,
    gift_card_delivery_charge: Number,
    gift_card_terms_condition: String
}, { timestamps: true })

LocationSchema.plugin(mongoosePaginate)
const Location = mongoose.model('locations', LocationSchema)

module.exports = Location;