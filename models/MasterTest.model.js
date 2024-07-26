var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var MasterTestSchema = new mongoose.Schema({
    name: String,
    desc: String,
    status: Number
}, { timestamps: true })

MasterTestSchema.plugin(mongoosePaginate);
const MasterTest = mongoose.model('master_tests', MasterTestSchema);

module.exports = MasterTest;
