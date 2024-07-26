var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var LocationCloseDaysSchema = new mongoose.Schema({
    location_id: String,
    name: String,
    start_date: Date, //Date 
    end_date: Date, //Date 
    status: Number,
},{ timestamps: true })

LocationCloseDaysSchema.plugin(mongoosePaginate)
const LocationCloseDays = mongoose.model('LocationCloseDays', LocationCloseDaysSchema)

module.exports = LocationCloseDays;