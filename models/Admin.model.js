var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')


var AdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    status: String,
    picture: String,
},{ timestamps: true })

AdminSchema.plugin(mongoosePaginate)
const Admin = mongoose.model('Admins', AdminSchema)

module.exports = Admin;