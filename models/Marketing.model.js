var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var MarketingSchema = new mongoose.Schema({
    location_id: String, 
    customer_arr:Array,
    all_customer:Number,
    title:String,
    name:String,
    logo:String,
    offer_image: String,
    footer_logo:String,
    email_template:String,
	email_subject:String,
    email_notification:Number,
    sms_notification:Number,
    email_title:String,
    email_desc:String,
    sms_text:String,
    status:Number,
},{ timestamps: true })

MarketingSchema.plugin(mongoosePaginate)
const Marketing = mongoose.model('Marketing', MarketingSchema)

module.exports = Marketing;