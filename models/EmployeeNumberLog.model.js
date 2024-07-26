var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var EmployeeNumberLogSchema = new mongoose.Schema({
	location_id:String, //branch-id
	employee_id:String,
    date: Date,
    user_order:Number,
},{ timestamps: true })

EmployeeNumberLogSchema.plugin(mongoosePaginate)
const EmployeeNumberLog = mongoose.model('EmployeeNumberLogs', EmployeeNumberLogSchema)

module.exports = EmployeeNumberLog;