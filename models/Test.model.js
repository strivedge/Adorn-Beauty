var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var TestSchema = new mongoose.Schema({
    company_id: String, // organization-id
    location_id: String, // branch-id
    master_test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_tests' },
    name: String,
    desc: String,
    status: Number,
}, { timestamps: true })

TestSchema.plugin(mongoosePaginate)
const Test = mongoose.model('tests', TestSchema)

module.exports = Test;