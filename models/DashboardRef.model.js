var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var dashboardRefSchema = new mongoose.Schema({
    location_id:String,
    date: Date,
    data: Object,
    re_bookings: Array,
    
},{ timestamps: true })

dashboardRefSchema.index({location_id: 1, date: 1})

dashboardRefSchema.plugin(mongoosePaginate)
const DashboardRef = mongoose.model('DashboardRef', dashboardRefSchema)

module.exports = DashboardRef;