var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CronjobParameterSchema = new mongoose.Schema({
    company_id: String, // organization-id
    location_id: String, // branch-id
    master_cronjob_parameter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_cronjob_parameters' },
    category_id: String,
    service_id: Array,
    name: String,
    desc: String,
    key: String,
    key_url: String,
    all_online_services: Number,
    apply_on_all_services:Number,
    status: Number,
    weekend: String,
	holiday: String
}, { timestamps: true })

CronjobParameterSchema.plugin(mongoosePaginate)
const CronjobParameter = mongoose.model('cronjobparameter', CronjobParameterSchema)

module.exports = CronjobParameter;
