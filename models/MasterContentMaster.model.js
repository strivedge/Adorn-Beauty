var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterContentMasterSchema = new mongoose.Schema({
    name: String,
    last_publish_date: Date,
    content: String
}, { timestamps: true })

MasterContentMasterSchema.plugin(mongoosePaginate);
const MasterContentMaster = mongoose.model('master_content_masters', MasterContentMasterSchema);

module.exports = MasterContentMaster;
