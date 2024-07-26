var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ConsultantServiceTypeQuestionSchema = new mongoose.Schema({
    company_id: String, // Organization id
    location_id: String, // branch-id
    customer_id: String, // customer-id
    category_id: String, // category-id
},{ timestamps: true })

ConsultantServiceTypeQuestionSchema.plugin(mongoosePaginate)
const ConsultantServiceTypeQuestion = mongoose.model('ConsultantServiceTypeQuestions', ConsultantServiceTypeQuestionSchema)

module.exports = ConsultantServiceTypeQuestion;