var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var HolidaySchema = new mongoose.Schema({
	company_id: String, //organization-id
	location_id: String, //branch-id
    name: String,
    date: Date,
    status: Number,
},{ timestamps: true })

HolidaySchema.plugin(mongoosePaginate)
const Holiday = mongoose.model('Holidays', HolidaySchema)

module.exports = Holiday;