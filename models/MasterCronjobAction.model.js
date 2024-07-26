var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterCronjobActionSchema = new mongoose.Schema({
    name: String,
    key_url: String, // to identify
    status: Number
}, { timestamps: true })

MasterCronjobActionSchema.plugin(mongoosePaginate);
const MasterCronjobAction = mongoose.model('master_cronjob_actions', MasterCronjobActionSchema);

module.exports = MasterCronjobAction;
