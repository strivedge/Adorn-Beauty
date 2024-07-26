var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var appListRefSchema = new mongoose.Schema({
    location_id:String,
    date: Date,
    employee: Array,
    tableData: Array,
    today_timing: Object,
    bookingData:Array,
    block_data:Array,
},{ timestamps: true })

appListRefSchema.index({location_id: 1, date: 1})

appListRefSchema.plugin(mongoosePaginate)
const AppListRef = mongoose.model('AppListRef', appListRefSchema)

module.exports = AppListRef;