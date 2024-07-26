var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsultationFormSchema = new mongoose.Schema({
	location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // branch-id
	master_consultation_form_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_consultation_forms' }, // master_consultation_form-id
	master_category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'master_categories' }],
	master_service_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'master_services' }],
	category_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'categories' }],
	service_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'services' }],
	groupData: Array,
	name: String,
	desc: String,
	form_type: String,
	status: Number
}, { timestamps: true })

ConsultationFormSchema.plugin(mongoosePaginate)
const consultationForms = mongoose.model('consultationforms', ConsultationFormSchema)

module.exports = consultationForms