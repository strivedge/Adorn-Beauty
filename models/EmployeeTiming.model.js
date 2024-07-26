var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var employeeTimingSchema = new mongoose.Schema({
	location_id: String,
    employee_id: {type: String, index:1},
    day: String,
    shift_start_time: String,
  	shift_end_time: String,
  	sec_shift_start_time: String,
  	sec_shift_end_time: String,
  	days_off: Number,
  	repeat:String,
    everyday:String,
    date:Date,
  	end_repeat:String,
  	repeat_specific_date:Date,
    update_upcoming_shift:Number,
    update_specific_shift:Number,
    status: Number,
},{ timestamps: true })

employeeTimingSchema.index({location_id: 1, day:1, employee_id: 1})
employeeTimingSchema.index({location_id: 1, day:1})

employeeTimingSchema.plugin(mongoosePaginate)
const EmployeeTiming = mongoose.model('EmployeeTiming', employeeTimingSchema)

module.exports = EmployeeTiming;