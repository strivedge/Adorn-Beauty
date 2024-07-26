var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
const { Schema } = mongoose;


const inventorySchema = new Schema({
    _id: false,
    // category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
    service:
        [{ type: mongoose.Schema.Types.ObjectId, ref: 'services' }],

    image: String,
    position: String,
    title: String

});



var catalogue_page = new mongoose.Schema({
    pageTitle: String,
    // status: {
    //     type: Boolean,
    // },
    content: [inventorySchema],
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'locations' },
    soft_delete: {
        type: Boolean,
    }
}, { timestamps: true })

catalogue_page.plugin(mongoosePaginate)
const Catalogue_Pages = mongoose.model('Catalogue_Pages', catalogue_page)

module.exports = Catalogue_Pages;