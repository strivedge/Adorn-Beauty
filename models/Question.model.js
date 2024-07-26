var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var QuestionSchema = new mongoose.Schema({
	company_id: String, //organization-id
	location_id: String, //branch-id
	master_que_group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_question_groups' }, // QuestionGroup id
	master_question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_questions' },
	category_id: Array,
	service_id: Array,
	que_group_id: String, // QuestionGroup id
	is_default: Number, // for default question
	question: String,
	option_type: String, //radio or checkbox
	other_text_check: Number,
	other_text_value: String,
	options: Array,  // all option list
	is_mandatory: Number,
	before_after: Number,
	flag_minor: Number,
	status: Number,
	que_group_name: String, // for assigning question group name
	value: Array,
	gender: String,
	no_of_column: Number,
	image: String,
	is_show_to_customer: Number,
	is_show_to_therapist: Number,
	is_show_in_preview: Number,
	order_no: Number,
	in_same_row: Number
}, { timestamps: true })

QuestionSchema.plugin(mongoosePaginate)
const Question = mongoose.model('questions', QuestionSchema)

module.exports = Question;