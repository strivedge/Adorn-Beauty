var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterQuestionSchema = new mongoose.Schema({
	master_que_group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_question_groups' }, // QuestionGroup id
	question: String,
	option_type: String, //radio or checkbox
	other_text_check: Number,
	other_text_value: String,
	options: Array,  // all option list
	is_mandatory: Number,
	before_after: Number,
	gender: String,
	que_group_name: String, // for assigning question group name
	value: Array, // for assigning question group name
	image: String,
	order_no: Number,
	flag_minor: Number,
	no_of_column: Number,
	is_show_to_customer: Number,
	is_show_to_therapist: Number,
	is_show_in_preview: Number,
	in_same_row: Number,
	is_default: Number, // for default question
	status: Number
}, { timestamps: true })

MasterQuestionSchema.plugin(mongoosePaginate);
const MasterQuestion = mongoose.model('master_questions', MasterQuestionSchema);

module.exports = MasterQuestion;
