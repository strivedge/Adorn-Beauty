const LocationService = require('../services/location_cataloge.service')
var ObjectId = require('mongodb').ObjectId

exports.getLocations = async function (req, res, next) {
    console.log('all locations')
    try {
        // Check the existence of the query parameters, If doesn't exists assign a default value
        // var page = req.query.page ? req.query.page : 0; //skip raw value
        // var limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
        // var order_name = req.query.order_name ? req.query.order_name : 'createdAt';
        // var order = req.query.order ? req.query.order : '-1';
        // var searchText = req.query.searchText ? req.query.searchText : '';
        var location_ids = req.query.location_ids ? req.query.location_ids : [];

        var query = {};
        let LocationIds = []
        if (location_ids && location_ids?.length > 0) {
            LocationIds = location_ids.split(',')
        }
        // if (req.query.status == 1) {
        //     query['status'] = 1;
        // }

        // if (req.query.online_status == 1) {
        //     query['online_status'] = 1;
        // }

        // if (req.query.admin_status == 1) {
        //     query['admin_status'] = 1;
        // }

        if (req.query.company_id && req.query.company_id != 'undefined') {
            console.log('go to companies field')
            query['company_id'] = req.query.company_id;
        }
        console.log(' after go to companies field')
        // if (req.query.searchText && req.query.searchText != 'undefined') {
        //     query['$or'] = [{ name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { email: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }, { contact_number: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }];
        // }
        if (LocationIds && LocationIds?.length > 0) {
            location_ids = LocationIds.map(x => ObjectId(x));
            query['_id'] = { $in: location_ids };
        }
        console.log(' LocationIds after go to companies field')

        if (req.query.user_id && req.query.user_id != 'undefined') {
            query['user_id'] = req.query.user_id;
        }
        console.log('user_id after go to companies field')

        console.log(query, 'query')

        var locations = await LocationService.getLocationsPages(query)

        // Return the Locations list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: locations, message: "Locations received successfully!" })
    } catch (e) {
        // console.log(e)
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}