var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsultantFormSchema = new mongoose.Schema({
    company_id: String, // organization-id
    location_id: String, // branch-id
    booking_id: String, // Appointment booking id
    employee_id: String,
    client_id: Array,
    service_id: Array,
    default: Array, // question, ans
    before: Array, // question, ans
    after: Array, // question, ans
    date: Date,
    name: String,
    first_name: String,
    last_name: String,
    mobile: String,
    email: String,
    dob: Date,
    age: Number,
    residential_address: String,
    surgery_name: String,
    doctor_name: String,
    before_image: Array, // client before image
    customer_signature: String, // client signature
    after_image: Array, // client after image
    therapist_signature: String, // therapist signature
    pdf: String, // consultation pdf
    status: Number,
    employee_name: String, // for assigning emaployee name;
    category_id: Array,
    type: String,
    booking_data: Object,
    consultation: Array,
    is_international_number: Number
}, { timestamps: true })

ConsultantFormSchema.plugin(mongoosePaginate)
const ConsultantForm = mongoose.model('consultantforms', ConsultantFormSchema)

module.exports = ConsultantForm;