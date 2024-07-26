var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var RoleSchema = new mongoose.Schema({
    company_id: String, // organization-id
    location_id: String, // branch-id
    name: String,
    role_type: Number,
    check_all: Number,
    role_level: Number,
    is_default: Number,
    is_super_admin: Number,
    status: Number,
    permission: [] // only for assign array
}, { timestamps: true })

RoleSchema.plugin(mongoosePaginate)
const Role = mongoose.model('roles', RoleSchema)

module.exports = Role;
