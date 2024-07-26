var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var QuestionGroupSchema = new mongoose.Schema({
	company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' }, // company or organization_id
	location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // branch id
	master_question_group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_question_groups' }, // master_question_groups id
	name: String,
	description: String,
	status: Number
}, { timestamps: true })

QuestionGroupSchema.plugin(mongoosePaginate)
const QuestionGroup = mongoose.model('questiongroups', QuestionGroupSchema)

module.exports = QuestionGroup