var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var ModuleSchema = new mongoose.Schema({
    name: String,
    title: String,
    order_no: Number
})

ModuleSchema.plugin(mongoosePaginate)
const Module = mongoose.model('modules', ModuleSchema)

module.exports = Module;