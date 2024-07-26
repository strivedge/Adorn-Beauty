// Atria Watford
const LocationModel = require("../models/Location.model")





exports.getLocationsPages = async function (query) {
    try {
        return await LocationModel.find(query)
    } catch (e) {
        console.log('error in get Cataloge Pages service', e.message)
        throw Error('Error while getting Cataloge Pages')
    }
}