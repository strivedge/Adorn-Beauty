var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var UserDeviceTokenSchema = new mongoose.Schema({
	user_id: String,
	device_type:String, // androind|ios
    device_token: String,
    app_type: String, //customer|admin
    status: Number,
},{ timestamps: true })

UserDeviceTokenSchema.plugin(mongoosePaginate)
const UserDeviceToken = mongoose.model('UserDeviceTokens', UserDeviceTokenSchema)

module.exports = UserDeviceToken;