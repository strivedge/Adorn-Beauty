var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')

var AppVersionSchema = new mongoose.Schema({
    android_version: String,
    ios_version: String,
    android_url: String,
    ios_url: String,
    main_url: String,
    maintenance: Number,
    limit: String,
    logo: String,
},{ timestamps: true })

AppVersionSchema.plugin(mongoosePaginate)
const AppVersion = mongoose.model('AppVersions', AppVersionSchema)

module.exports = AppVersion;