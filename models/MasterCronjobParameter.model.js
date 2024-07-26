var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterCronjobParameterSchema = new mongoose.Schema({
    master_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_categories' },
    master_service_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'master_services' }],
    name: String,
    desc: String,
    key: String,
    key_url: String,
    all_online_services: Number,
    status: Number
}, { timestamps: true })

MasterCronjobParameterSchema.plugin(mongoosePaginate);
const MasterCronjobParameter = mongoose.model('master_cronjob_parameters', MasterCronjobParameterSchema);

module.exports = MasterCronjobParameter;
