var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CleaningFormSchema = new mongoose.Schema({
	location_id: String, // branch-id
	employee_id: String,
	verifier_id: String,
	clening_form_id: String,
    before: Array, // question, ans
    after: Array, // question, ans
    date: Date,
    before_image: Array, // client before image
    after_image: Array, // client after image
    therapist_signature: String, // therapist signature
    verifier_signature: String, // client signature
    pdf: String, // consultation pdf
    status: Number,
    employee_name: String, // for assigning emaployee name;
    verifier_name: String,
    form_name: String,
},{ timestamps: true })

CleaningFormSchema.plugin(mongoosePaginate)
const CleaningForm = mongoose.model('CleaningForms', CleaningFormSchema)

module.exports = CleaningForm;