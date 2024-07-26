var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var EmployeeFilterLogSchema = new mongoose.Schema({
	location_id:String, //branch-id
	employee_ids:Array,
    date: Date,
},{ timestamps: true })

EmployeeFilterLogSchema.plugin(mongoosePaginate)
const EmployeeFilterLog = mongoose.model('EmployeeFilterLogs', EmployeeFilterLogSchema)

module.exports = EmployeeFilterLog;

