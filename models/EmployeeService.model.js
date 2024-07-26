var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var AppointmentGroupSchema = new mongoose.Schema({
	user_id:String, //staff_id
	service_type_id:String,
	service_id:String,
    location_id: String,
    status: Number, 
},{ timestamps: true })

AppointmentGroupSchema.plugin(mongoosePaginate)
const AppointmentGroup = mongoose.model('AppointmentGroups', AppointmentGroupSchema)

module.exports = AppointmentGroup;