var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var LeaveSchema = new mongoose.Schema({
	company_id:String, //organization id
	location_id:String, //branch id
	employee_id:String, //employee id
	start_date: Date,
	end_date: Date,
	half_full_day: String,
	leave_type: String,
	description: String,
	status: Number,
},{ timestamps: true })

LeaveSchema.plugin(mongoosePaginate)
const Leave = mongoose.model('Leaves', LeaveSchema)

module.exports = Leave;