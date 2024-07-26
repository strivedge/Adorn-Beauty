var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var blockTimeSchema = new mongoose.Schema({
    company_id: String,
    location_id: String,
    employee_id: Array,
    employee_all: Number,
    desc: String,
    repeat: String, //1,7,15,0 (Every day,week,alternate week,none)
    alternate_day: Array,
    alternate_day: Array,
    every_week: Array,
    start_time: String,
    end_time: String,
    start_date: Date,
    end_date: Date,
    end: String, //end on On/Always
    status: Number,
}, { timestamps: true })

blockTimeSchema.index({location_id: 1, employee_id: 1, start_date:1, end_time:1})

blockTimeSchema.plugin(mongoosePaginate)
const BlockTime = mongoose.model('BlockTime', blockTimeSchema)

module.exports = BlockTime;