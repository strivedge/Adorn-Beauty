var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')


var catalogue_content = new mongoose.Schema({
    title: String,
    images: [{
        type: String
    }],
    services:
        [{ type: mongoose.Schema.Types.ObjectId, ref: 'services' }],
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' },
    soft_delete: {
        type: Boolean,
    }
}, { timestamps: true })

catalogue_content.plugin(mongoosePaginate)
const catalogue_Content = mongoose.model('catalogue_contents', catalogue_content)

module.exports = catalogue_Content;