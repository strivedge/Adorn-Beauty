var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var QuestionServiceGroupSchema = new mongoose.Schema({
	company_id: String, // company or organization_id
	location_id: String, // branch id
	name: String,
	description: String,
	status: Number,
},{ timestamps: true })

QuestionServiceGroupSchema.plugin(mongoosePaginate)
const QuestionServiceGroup = mongoose.model('QuestionServiceGroups', QuestionServiceGroupSchema)

module.exports = QuestionServiceGroup;