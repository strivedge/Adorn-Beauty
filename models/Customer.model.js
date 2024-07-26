var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var customerSchema = new mongoose.Schema({
    company_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'companies' }],
    location_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'locations' }],
    first_name: String,
    last_name: String,
    name: String,
    email: String,
    password: { type: String, select: false },
    mobile: String,
    gender: String,
    dob: Date,
    anniversary_date: Date,
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'roles' },
    photo: String,
    is_customer: Number,
    device_token: String,
    customer_heart: String,
    customer_badge: String,
    customer_icon: String,
    customer_badges: [{
        _id: false,
        company_id: String,
        badge: String,
    }],
    customer_icons: [{
        _id: false,
        company_id: String,
        icon: String,
    }],
    notification_permission: Number,
    email_notification: Number, //booking
    sms_notification: Number, //booking
    session_email_notification: Number, //Treatment due email reminders (including treatment package booking reminders)
    session_sms_notification: Number, //Treatment due sms reminders (including treatment package booking reminders)
    birthday_email_notification: Number,
    birthday_sms_notification: Number,
    marketing_email_notification: Number, //Premium offers
    marketing_sms_notification: Number, //Premium offers
    forgot_password: Number,
    is_international_number: Number,
    reset_token: { type: String },
    code: String,
    age: Number,
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    is_blocked: Number,
    wa_verified: Number,//Whatsapp account verify
    status: Number,
    unsubscribe_submitted: Number,
    isUpdateToday: { type: Number, default: 0 },  // for check Mobile numer is update today
}, { timestamps: true })

customerSchema.index({ 'name': 1 });
customerSchema.index({ 'email': 1 });
customerSchema.index({ 'mobile': 1 });

customerSchema.plugin(mongoosePaginate);
const Customer = mongoose.model('customers', customerSchema);

module.exports = Customer;
