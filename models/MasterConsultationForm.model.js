var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterConsultationFormSchema = new mongoose.Schema({
	master_category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'master_categories' }],
	master_service_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'master_services' }],
	masterGroupData: Array,
	name: String,
	desc: String,
	form_type: String,
	status: Number,
	category_id: Array,
	service_id: Array,
	groupData: Array,
}, { timestamps: true })

MasterConsultationFormSchema.plugin(mongoosePaginate);
const MasterConsultationForm = mongoose.model('master_consultation_forms', MasterConsultationFormSchema);

module.exports = MasterConsultationForm;
