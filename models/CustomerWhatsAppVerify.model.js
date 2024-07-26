var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CustomerWhatsAppVerifySchema = new mongoose.Schema({
	customer_id:String, //branch-id
    mobile:Number,
    wa_verified:Number,
},{ timestamps: true })

CustomerWhatsAppVerifySchema.plugin(mongoosePaginate)
const CustomerWhatsAppVerify = mongoose.model('customer_whatsapp_verify', CustomerWhatsAppVerifySchema)

module.exports = CustomerWhatsAppVerify;