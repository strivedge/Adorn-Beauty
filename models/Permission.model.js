var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var PermissionSchema = new mongoose.Schema({
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'companies' }, // organization-id
    role_id: String,
    module_id: String,
    module_name: String,
    can_read: Number,
    can_create: Number,
    can_update: Number,
    can_delete: Number,
    status: Number,
    module_title: String // Only got assigning name for display
}, { timestamps: true })

PermissionSchema.plugin(mongoosePaginate)
const Permission = mongoose.model('permissions', PermissionSchema)

module.exports = Permission;