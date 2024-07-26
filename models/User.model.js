var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var userSchema = new mongoose.Schema({
    company_id: String, //organization-id
    location_id: String, //branch-id
    locations: Array, //Multiple branch-id
    first_name: String,
    last_name: String,
    name: String,
    email: String, //For username
    password: { type: String, select: false },
    personal_email: String,
    mobile: String,
    gender: String,
    dob: Date,
    anniversary_date: Date,
    role_id: String,
    photo: String,
    joining_date: Date,
    resignation_date: Date,
    relieving_date: Date,
    salary: Number,
    blood_group: String,
    emergency_contact_person: String,
    emergency_contact_number: String,
    emergency_contact_person_relation: String,
    services: Array,
    product_commission: String,
    service_commission: String,
    package_commission: String,
    status: Number,
    is_employee: Number, //for therapist only
    employee_priority: Number, //1 for normal, 2 for low 
    online_status: Number,
    is_customer: Number,
    device_token: String,
    customer_badge: String,
    permission: [], //for storing data
    subscription: {}, //for storing data
    timing: [], //for storing data
    domain: String, //for storing data,
    notification_permission: Number,
    customer_heart: String,
    customer_icon: String,
    email_notification: Number,
    sms_notification: Number,
    user_order: Number,
    updated_by: String,
    session_email_notification: Number,
    session_sms_notification: Number,
    marketing_notification: Number,
    is_super_admin: Number,
    forgot_password: Number,
    is_international_number: Number,
    shift_start_time: String,
    shift_end_time: String,
    sec_shift_start_time: String,
    sec_shift_end_time: String,
    is_blocked: Number,
    reset_token: String,
    code: String,
    age: Number,
}, { timestamps: true })

userSchema.index({ location_id: 1, name: 1 })
userSchema.index({ location_id: 1, email: 1 })

userSchema.plugin(mongoosePaginate)
const User = mongoose.model('users', userSchema)

module.exports = User
