var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var LocationTimingSchema = new mongoose.Schema({
    location_id: String,
    day: String,
    start_time: String,
    end_time: String,
    status: Number,
},{ timestamps: true })

LocationTimingSchema.plugin(mongoosePaginate)
const LocationTiming = mongoose.model('LocationTiming', LocationTimingSchema)

module.exports = LocationTiming;