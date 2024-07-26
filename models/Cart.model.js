var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var CartSchema = new mongoose.Schema({
	location_id:String, //branch-id
    browser_id:String,
    service_id:String,
    status: Number,
},{ timestamps: true })

CartSchema.plugin(mongoosePaginate)
const Cart = mongoose.model('Carts', CartSchema)

module.exports = Cart;