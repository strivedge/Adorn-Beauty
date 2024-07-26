var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ServiceTypeGroupSchema = new mongoose.Schema({
	location_id:String, //branch-id
    category_id:String,
    name: String,
    desc: String,
    status: Number,
    menu_order: Number,
},{ timestamps: true })

ServiceTypeGroupSchema.plugin(mongoosePaginate)
const ServiceTypeGroup = mongoose.model('servicetypegroups', ServiceTypeGroupSchema)

module.exports = ServiceTypeGroup;