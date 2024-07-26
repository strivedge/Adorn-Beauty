var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterQuestionGroupSchema = new mongoose.Schema({
	name: String,
	description: String,
	status: Number
}, { timestamps: true })

MasterQuestionGroupSchema.plugin(mongoosePaginate);
const MasterQuestionGroup = mongoose.model('master_question_groups', MasterQuestionGroupSchema);

module.exports = MasterQuestionGroup;
