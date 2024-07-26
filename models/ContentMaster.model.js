var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ContentMasterSchema = new mongoose.Schema({
    company_id: String, // Organization id
    location_id: String, // branch-id
    master_content_master_id: { type: mongoose.Schema.Types.ObjectId, ref: 'master_content_masters' },
    name: String,
    last_publish_date: Date,
    content: String,
}, { timestamps: true })

ContentMasterSchema.plugin(mongoosePaginate)
const ContentMaster = mongoose.model('contentmasters', ContentMasterSchema)

module.exports = ContentMaster;