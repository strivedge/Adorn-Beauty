var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var EmailCountSchema = new mongoose.Schema({
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' }, // organization_id
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' }, // branchid
    date: Date,
    from_email: String,
    count: Number,
}, { timestamps: true })


EmailCountSchema.plugin(mongoosePaginate)
const EmailCount = mongoose.model('email_count', EmailCountSchema)

module.exports = EmailCount;