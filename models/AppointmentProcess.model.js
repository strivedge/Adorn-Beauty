var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var inprocessAppointmentSchema = new mongoose.Schema({
    user_id: String, // login user id
    employee_id: String, // staff_id
    client_id: Array,
    //category_id: String,
    service_id: { type: Array, index: 1 },
    company_id: String,
    location_id: String,
    date: Date,
    start_time: String,
    end_time: String,
    no_of_person: Number,
    is_group: Number, // 0,1
    comments: String,
    employee_comments: String,
    payment_type: String,
    payment_status: String, // 'pending', 'paid'
    status: Number, // values:1,2,3 // 1 for active
    booking_status: String, // booking status for no shows, complete,cancel val => no_shows, complete, cancel
    extended_time: String, // extended time in number (minutes)
    group_data: [], // friend's booking
    is_readed: Number, // for notification, 1 mean readed and 0 mean unreaded
    discount_id: String, // discount id if discount applied
    discount_code: String, // discount code if discount applied
    offer_discount_code: String,
    total_price: Number, // total price withount discount ex 100 total
    discounted_price: Number, // if discount applied discounted price ex 15 disconut
    price: Number, // Final Price with calculate dicount if discount applied 85 - need to pay
    paid_amount: Number, //
    remaining_amount: Number,
    total_amount: Number,
    grand_total: Number,
    locations: [], // only for storing location name,
    transaction_id: String,
    transaction: Array,
    app_datetime: Date,
    grand_total_price: Number,
    grand_discounted_price: Number,
    grand_final_price: Number,
    consultation: Array, // for assigning consultation data
    front_booking: String,
    employee_name: String, // for assigning emaployee name;
    consultation_user: Object, // for assigning consultation user data
    discount_slab_id: String,
    customer_package_id: Array,
    package_id: Array,
    package_service: Array,
    start_time_meridiem: String,
    end_time_meridiem: String,
    patch_test_booking: Number,
    stop_email_sms: Number,
    discount_code_type: String,
    loyalty_card_data: Array,
    categories: Array, // for assigning all category of services for consultation
    consultant_service_type: Array, // for assigning all customer consultation form service type question id according to category id
    consultant_status: Number, // 0-> pending, 1-> before completed, 2-> final completed.
    consultantform_id: String,
    group_booking_ids: Array,
    service_data: [{
        _id: false,
        service_id: Array,
        employee_id: { type: String, index: 1 },
        duration: Number,
        start_time: String,
        end_time: String,
        start_time_meridiem: String,
        end_time_meridiem: String,
        employee_name: String,
    }],
    reschedule_count: Number,
    is_reschedule_readed: Number,
    discount_type: String, //percentage|value|service
    reschedule_transaction: Array,
    reschedule_date: Date,
    reschedule_out_of_paid_percentage: Number,
    reschedule_out_of_paid_amount: Number,
    source_url: String, // customer-adorn-mobile|adorn-beauty|adorn.beauty|adorn-admin|adorn|calista|calista-admin|calista-beauty,
    customer_icon: String,
    used_gift_card_bal: Number,
    deposit_gift_card_bal: Number,
    gift_card_transaction_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gift_card_transactions' }],
    credit_gift_card_transaction_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gift_card_transactions' }],
    deposit_gift_card_transaction_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gift_card_transactions' }],
    expire_gift_card_transaction_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gift_card_transactions' }],
    removed_gift_card_transaction_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'gift_card_transactions' }],
    cancel_date: Date,
    cancel_msg: String,
    payment_response: Array,
    paypal_error: String,
    slot_status: String, // reserved|free
}, { timestamps: true })

inprocessAppointmentSchema.plugin(mongoosePaginate)
const Appointment = mongoose.model('inprocess-appointments', inprocessAppointmentSchema)

module.exports = Appointment;
