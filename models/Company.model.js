var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var CompanySchema = new mongoose.Schema({
    user_id: String,
    name: String,
    email: String,
    contact_number: String,
    domain: String,
    image: String,
    contact_link: String,
    brochure_footer: String,
    status: Number,
    brochure_image: String,
    brochure_background_image: String,
    brochure_background_color: String,
    brochure_heading_color: String,
    brochure_font_color: String,
    pixel_code: String,
    currency: Object,
    country_code: Number,
    booking_text: String,
    appopintgem_api_key: { type: String, select: false },
    whatsapp_access_token: { type: String, select: false },
    smtp_from: { type: String, select: false },
    smtp_host: { type: String, select: false },
    smtp_port: { type: Number, select: false },
    smtp_username: { type: String, select: false },
    smtp_password: { type: String, select: false },
    prefix: String,
    paypal_client_id: String,
    paypal_client_secret: { type: String, select: false },
    gift_card_setting_level: String, // company|location
    gift_card_delivery_charge: Number,
    gift_card_terms_condition: String,
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
    show_to_customer: Number,
}, { timestamps: true })

CompanySchema.plugin(mongoosePaginate)
const Company = mongoose.model('companies', CompanySchema);

module.exports = Company;
