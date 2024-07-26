var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CronjobActionSchema = new mongoose.Schema({
    company_id: String, // Organization id
    location_id: String, // branch-id
    master_cronjob_action_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_cronjob_actions' },
    name: String,
    key_url: String, // to identify
    status: Number,
}, { timestamps: true })

CronjobActionSchema.plugin(mongoosePaginate)
const CronjobAction = mongoose.model('cronjobactions', CronjobActionSchema)

module.exports = CronjobAction;