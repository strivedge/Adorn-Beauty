var CustomerRewardService = require('../services/customerReward.service')
var DiscountSlabService = require('../services/discountSlab.service')
var ServiceService = require('../services/service.service')
var LocationService = require('../services/location.service')

// Saving the context of this module inside the _the variable
_this = this

// Async Controller function to get the To do List
exports.getDiscountSlabs = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var page = req.query.page ? req.query.page : 0 // Skip raw value
        var limit = req.query.limit ? req.query.limit : 1000
        var order_name = req.query.order_name ? req.query.order_name : 'createdAt'
        var order = req.query.order ? req.query.order : '-1'
        var serachText = req.query.serachText ? req.query.serachText : ''

        var query = { status: 1 }
        if (req.query.company_id && req.query.company_id != 'undefined') {
            query['company_id'] = req.query.company_id
        }

        if (req.query.location_id && req.query.location_id != 'undefined') {
            query['location_id'] = req.query.location_id
        }

        if (req.query.searchText && req.query.searchText != 'undefined') {
            query['$or'] = [
                { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } },
                { desc: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' } }
            ]
        }

        var discountSlabs = await DiscountSlabService.getDiscountSlabs(query, parseInt(page), parseInt(limit), order_name, Number(order), serachText)
        var discount = discountSlabs[0].data
        for (var i = 0; i < discount.length; i++) {
            var services = discount[i].services
            if (services && services.length > 0) {
                var q = { _id: { $in: services }, status: 1 }
                var service = await ServiceService.getServiceSpecific(q) // Replace service name
                for (var s = 0; s < service.length; s++) {
                    service[s].price = 0
                }

                discount[i].services = service // Replace service name
            }
        }

        discountSlabs[0].data = discount

        // Return the DiscountSlabs list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: discountSlabs, message: "Successfully DiscountSlabs Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getDiscountSlab = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var id = req.params.id
        var DiscountSlab = await DiscountSlabService.getDiscountSlab(id)

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: DiscountSlab, message: "Successfully DiscountSlab Recieved" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getDiscountSlabsSpecific = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var company_id = req.body.company_id ?? '';
        var query = { status: 1 }
        if (req.body.location_id && req.body.location_id != 'undefined') {
            query['location_id'] = req.body.location_id;
            if(!company_id){
                var location = await LocationService.getLocation(req.body.location_id);
                company_id = location?.company_id;
            }
        }

        var discountSlabs = await DiscountSlabService.getDiscountSlabsSpecific(query)
        if (discountSlabs && discountSlabs.length) {
            for (var i = 0; i < discountSlabs.length; i++) {
                var services = discountSlabs[i]?.services || null
                if (services && services.length) {
                    services = await ServiceService.getServiceSpecific({ _id: { $in: services }, status: 1 }) // for replace service name
                    for (var s = 0; s < services.length; s++) {
                        services[s].old_price = services[s].price
                        services[s].price = 0
                    }
                }

                discountSlabs[i].services = services // Replace service name
            }
        }

        var lastReward = []
        if (req.body.customer_reward) {
            var lastRewardQuery = { customer_id: req.body.client_id, company_id: company_id }
            lastReward = await CustomerRewardService.getCustomerLastRewards(lastRewardQuery)
        }

        // Return the Discount Slabs with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: discountSlabs,
            customer_reward: lastReward,
            message: "Discount slabs recieved successfully!"
        })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.getSpecificDiscountSlabs = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    try {
        var query = {}
        var hasStatus = req.query?.hasOwnProperty('status') || false
        var status = Number(req.query?.status || 0)
        var clientId = req.query?.client_id || ""
        var locationId = req.query?.location_id || "";
        var company_id = req.query?.company_id || "";
        var isLastReward = Number(req.query?.is_last_reward || 0)

        if (hasStatus) {
            query['status'] = status
        }

        if (locationId) {
            query['location_id'] = locationId;
            if(!company_id){
                var location = await LocationService.getLocation(locationId);
                company_id = location?.company_id;
            }
        }

        var lastReward = []
        var discountSlabs = await DiscountSlabService.getDiscountSlabsSpecific(query)
        if (discountSlabs && discountSlabs.length) {
            for (var i = 0; i < discountSlabs.length; i++) {
                var services = discountSlabs[i].services
                if (services && services.length) {
                    services = await ServiceService.getServiceSpecific({ _id: { $in: services } }) // replace service name

                    for (var s = 0; s < services.length; s++) {
                        services[s].old_price = services[s].price
                        services[s].price = 0
                    }
                }

                discountSlabs[i].services = services // Replace service name
            }
        }

        if (isLastReward && clientId) {
            var lastRewardQuery = { customer_id: clientId, company_id: company_id }
            lastReward = await CustomerRewardService.getCustomerLastRewards(lastRewardQuery)
        }

        // Return the Discount Slabs with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: discountSlabs,
            customer_reward: lastReward,
            message: "Discount slabs recieved successfully!"
        })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.createDiscountSlab = async function (req, res, next) {
    try {
        // Calling the Service function with the new object from the Request Body
        var createdDiscountSlab = await DiscountSlabService.createDiscountSlab(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdDiscountSlab, message: "Successfully Created DiscountSlab" })
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateDiscountSlab = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedDiscountSlab = await DiscountSlabService.updateDiscountSlab(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedDiscountSlab, message: "Successfully Updated DiscountSlab" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeDiscountSlab = async function (req, res, next) {
    var id = req.params.id
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present" })
    }

    try {
        var deleted = await DiscountSlabService.deleteDiscountSlab(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
