// Gettign the Newly created Mongoose Model we just created 
var CustomerReward = require('../models/CustomerReward.model')
var DiscountSlab = require('../models/DiscountSlab.model')
var Location = require('../models/Location.model')
var User = require('../models/User.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the CustomerReward List
exports.getCustomerRewards = async function (query, page, limit, order_name, order, serachText) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {}
        sort[order_name] = order

        if (serachText && serachText != '') {
            query['$text'] = { $search: serachText, $language: 'en', $caseSensitive: false }
        }

        const facetedPipeline = [
            { $match: query },
            { $sort: sort },
            {
                "$facet": {
                    "data": [
                        { "$skip": page },
                        { "$limit": limit }
                    ],
                    "pagination": [
                        { "$count": "total" }
                    ]
                }
            }
        ]

        var CustomerRewards = await CustomerReward.aggregate(facetedPipeline)

        // Return the CustomerRewardd list that was retured by the mongoose promise
        return CustomerRewards
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating CustomerRewards')
    }
}

exports.getCustomerRewardsCount = async function (query = {}) {
    try {
        var customerRewards = await CustomerReward.find(query).count()

        return customerRewards
    } catch (e) {
        throw Error('Error while Counting CustomerRewards')
    }
}

exports.getCustomerRewardsOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var customerRewards = await CustomerReward.find(query)
            .populate({
                path: 'location_id',
                model: Location,
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'customer_id',
                model: User,
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    dob: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })
            .populate({
                path: 'added_user_id',
                model: User,
                select: {
                    _id: 1,
                    name: 1,
                }
            })
            .populate({
                path: 'discount_slab_id',
                model: DiscountSlab
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        return customerRewards || []
    } catch (e) {
        // return a Error message describing the reason     
        throw Error('Error while Paginating CustomerRewards')
    }
}

exports.getSpecificCustomerRewards = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var CustomerRewards = await CustomerReward.find(query)
        var CustomerRewards = await CustomerReward.aggregate([
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
            { $match: query }
        ])

        // Return the CustomerRewardd list that was retured by the mongoose promise
        return CustomerRewards
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomerRewards')
    }
}

exports.getCustomerRewardsSortByDate = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var CustomerRewards = await CustomerReward.find(query)
        var CustomerRewards = await CustomerReward.aggregate([
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
            { $match: query },
            { $sort : { _id : -1 } }
        ])

        // Return the CustomerRewardd list that was retured by the mongoose promise
        return CustomerRewards
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while finding CustomerRewards')
    }
}

exports.getCustomerReward = async function (id) {
    try {
        // Find the Data 
        var _details = await CustomerReward.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerReward not available")
    }
}

exports.getCustomerLastRewards = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerRewards = await CustomerReward.find(query)
            .limit(1)
            .sort({ $natural: -1 })

        // Return the CustomerRewards list that was retured by the mongoose promise
        return CustomerRewards
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories')
    }
}

exports.getCustomerLastRewardData = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerRewards = await CustomerReward.findOne(query)
            .limit(1)
            .sort({ $natural: -1 })

        // Return the CustomerRewards list that was retured by the mongoose promise
        return CustomerRewards
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories')
    }
}

exports.getCustomerAllLastRewards = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerRewards = await CustomerReward.find(query)
            .sort({ $natural: -1 })

        // Return the CustomerRewards list that was retured by the mongoose promise
        return CustomerRewards
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories')
    }
}


exports.getLastNRewards = async function (query, limit) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerRewards = await CustomerReward.find(query)
            .limit(limit)
            .sort({ $natural: -1 })

        // Return the CustomerRewards list that was retured by the mongoose promise
        return CustomerRewards
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories')
    }
}

exports.getCustomerRewardsByDate = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerRewards = await CustomerReward.aggregate([
            {
                $addFields: {
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    }
                }
            },
            { $match: query },
            {
                $project: {
                    _id: 1,
                    customer_id: 1,
                    PosTotal_points: { $cond: [{ $gt: ['$gain_points', 0] }, '$gain_points', 0] }
                }
            },
            {
                $group: {
                    _id: null,
                    SumTotalPoints: { $sum: '$PosTotal_points' },
                }
            }
        ])

        // Return the CustomerRewards list that was retured by the mongoose promise
        return CustomerRewards
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories')
    }
}

exports.getCustomerRewardsSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var CustomerRewards = await CustomerReward.find(query).sort({ createdAt:1 })

        // Return the CustomerRewards list that was retured by the mongoose promise
        return CustomerRewards
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Categories')
    }
}

exports.updateManyPackagesClient = async function (query, customer_id) {
    try {
        // Find the Data and replace booking status
        var customerRewards = await CustomerReward.updateMany(query, { $set: { customer_id: customer_id } })

        return customerRewards
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerReward not available")
    }

}

exports.updateRecordById = async function (query, fields) {
    try {
        // Find the Data and replace booking status
        var customerRewards = await CustomerReward.updateMany(query, { $set: fields })

        return customerRewards
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerReward not available")
    }

}

exports.updateManyClientLocation = async function (query, customer_id) {
    try {
        // Find the Data and replace booking status
        var customerRewards = await CustomerReward.updateMany(query, { $set: { deleted: 1 } })

        return customerRewards
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("CustomerReward not available")
    }

}

exports.createCustomerReward = async function (customerReward) {

    var newCustomerReward = new CustomerReward({
        company_id: customerReward.company_id ? customerReward.company_id : null,
        location_id: customerReward.location_id ? customerReward.location_id : null,
        customer_id: customerReward.customer_id ? customerReward.customer_id : null,
        appoitment_id: customerReward.appoitment_id ? customerReward.appoitment_id : null,
        amount: customerReward.amount ? customerReward.amount : 0,
        gain_points: customerReward.gain_points ? customerReward.gain_points : 0,
        redeem_points: customerReward.redeem_points ? customerReward.redeem_points : 0,
        total_points: customerReward.total_points ? customerReward.total_points : 0,
        date: customerReward.date ? customerReward.date : Date(),
        action: customerReward.action ? customerReward.action : '',
        added_by: customerReward.added_by ? customerReward.added_by : '',
        added_user_id: customerReward.added_user_id ? customerReward.added_user_id : null,
        discount_slab_id: customerReward.discount_slab_id ? customerReward.discount_slab_id : null
    })

    try {
        // Saving the CustomerReward 
        var savedCustomerReward = await newCustomerReward.save()
        return savedCustomerReward
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating CustomerReward")
    }
}

exports.updateCustomerReward = async function (customerReward) {
    try {
        //Find the old CustomerReward Object by the Id
        var id = customerReward._id
        var oldCustomerReward = await CustomerReward.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the CustomerReward")
    }

    // If no old CustomerReward Object exists return false
    if (!oldCustomerReward) {
        return false
    }

    //Edit the CustomerReward Object
    if (customerReward.company_id) {
        oldCustomerReward.company_id = customerReward.company_id
    }

    if (customerReward.location_id) {
        oldCustomerReward.location_id = customerReward.location_id
    }

    if (customerReward.customer_id) {
        oldCustomerReward.customer_id = customerReward.customer_id
    }

    oldCustomerReward.appoitment_id = customerReward?.appoitment_id ? customerReward.appoitment_id : null
    if (customerReward.amount) {
        oldCustomerReward.amount = customerReward.amount
    }

    if (customerReward.gain_points) {
        oldCustomerReward.gain_points = customerReward.gain_points
    }

    if (customerReward.redeem_points) {
        oldCustomerReward.redeem_points = customerReward.redeem_points
    }

    if (customerReward.total_points) {
        oldCustomerReward.total_points = customerReward.total_points
    }

    if (customerReward.date) {
        oldCustomerReward.date = customerReward.date
    }

    oldCustomerReward.action = customerReward.action ? customerReward.action : ''
    oldCustomerReward.discount_slab_id = customerReward?.discount_slab_id ? customerReward.discount_slab_id : null

    try {
        var savedCustomerReward = await oldCustomerReward.save()
        return savedCustomerReward
    } catch (e) {
        throw Error("And Error occured while updating the CustomerReward")
    }
}

exports.deleteCustomerReward = async function (id) {
    // Delete the CustomerReward
    try {
        var deleted = await CustomerReward.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("CustomerReward Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerReward")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await CustomerReward.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the CustomerReward")
    }
}