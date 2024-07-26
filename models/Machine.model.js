var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var MachineSchema = new mongoose.Schema({
	location_id:String, //branch-id
    name: String,
    desc: String,
    limit:Number,
    //services:Array,
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'services' }],
    status: Number,
},{ timestamps: true })

MachineSchema.plugin(mongoosePaginate)
const Machine = mongoose.model('Machines', MachineSchema)

module.exports = Machine;