var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var RotaSchema = new mongoose.Schema({
	company_id:String, //organization-id
	location_id:String, //branch-id
	name: String,
	start_date: Date,
	end_date: Date,
	opening_hours: String,
	shift_start_time: String,
	shift_end_time: String,
	break_start_time: String,
	break_end_time: String,
	break_time_duration: Number,
	status: Number,
	days_off: [],
},{ timestamps: true })

RotaSchema.plugin(mongoosePaginate)
const Rota = mongoose.model('Rotas', RotaSchema)

module.exports = Rota;