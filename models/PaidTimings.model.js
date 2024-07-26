const mongoose = require('mongoose')
const {Schema} = mongoose;
const mongoosePaginate = require('mongoose-paginate')

const paidTimingSchema = new Schema({
    date: {
        type: Date
    },
    location_id: {
        type:Schema.Types.ObjectId,
        ref: 'locations'
    },
    slots:[{
        _id: false,
        start_time: {
            type: String
        },
        end_time: {
            type: String
        }
    }]
}, {timestamps: true})

paidTimingSchema.plugin(mongoosePaginate);
const PaidTiming = mongoose.model('paid_timings', paidTimingSchema)

module.exports = PaidTiming;

