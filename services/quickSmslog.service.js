// Gettign the Newly created Mongoose Model we just created 
var CustomerService = require('../services/customer.service')
var UserService = require('../services/user.service')
var QuickSmsLog = require('../models/QuickSmsLog.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the QuickSmsLog List
exports.getQuickSmsLogs = async function (query, page, limit, order_name, order, serachText) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {}
        sort[order_name] = order

        const facetedPipeline = [
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

        var quickSmsLogs = await QuickSmsLog.aggregate(facetedPipeline)
        if (quickSmsLogs[0]?.data && quickSmsLogs[0].data?.length > 0) {
            for (var i = 0; i < quickSmsLogs[0].data.length; i++) {
                var client = await CustomerService.getCustomer(quickSmsLogs[0].data[i].client_id)
                quickSmsLogs[0].data[i].client_name = client?.name
                var user = await UserService.getUser(quickSmsLogs[0].data[i].user_id)
                quickSmsLogs[0].data[i].user_name = user?.name
            }
        }

        // Return the QuickSmsLogd list that was retured by the mongoose promise
        return quickSmsLogs
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating QuickSmsLogs')
    }
}

exports.getAllQuickSmsLogs = async function (query, order_name, order, serachText) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {}
        sort[order_name] = order

        const facetedPipeline = [
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
            { $sort: sort }
        ]

        var QuickSmsLogs = await QuickSmsLog.aggregate(facetedPipeline)

        // Return the QuickSmsLogd list that was retured by the mongoose promise
        return QuickSmsLogs
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating QuickSmsLogs')
    }
}

// getting all QuickSmsLogs for company copy
exports.getQuickSmsLogsSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        //var QuickSmsLogs = await QuickSmsLog.find(query)
        var QuickSmsLogs = await QuickSmsLog.aggregate([
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

        // Return the Serviced list that was retured by the mongoose promise
        return QuickSmsLogs
    } catch (e) {
        // return a Error message describing the reason
        throw Error('Error while Paginating Location')
    }
}

exports.getQuickSmsLog = async function (id) {
    try {
        // Find the Data 
        var _details = await QuickSmsLog.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("QuickSmsLog not available")
    }
}

exports.createQuickSmsLog = async function (quickSmsLog) {
    var newQuickSmsLog = new QuickSmsLog({
        company_id: quickSmsLog.company_id ? quickSmsLog.company_id : "",
        location_id: quickSmsLog.location_id ? quickSmsLog.location_id : "",
        booking_id: quickSmsLog.booking_id ? quickSmsLog.booking_id : "",
        user_id: quickSmsLog.user_id ? quickSmsLog.user_id : "",
        client_id: quickSmsLog.client_id ? quickSmsLog.client_id : "",
        sms_type: quickSmsLog.sms_type ? quickSmsLog.sms_type : "",
        date: quickSmsLog.date ? quickSmsLog.date : "",
        till_date: quickSmsLog.till_date ? quickSmsLog.till_date : null,
        booking_date: quickSmsLog.booking_date ? quickSmsLog.booking_date : "",
        mobile: quickSmsLog.mobile ? quickSmsLog.mobile : "",
        content: quickSmsLog.content ? quickSmsLog.content : "",
        sms_count: quickSmsLog.sms_count ? quickSmsLog.sms_count : 1,
        sent_count: quickSmsLog.sent_count ? quickSmsLog.sent_count : 0,
        sms_response: quickSmsLog.sms_response ? quickSmsLog.sms_response : null,
        response_status: quickSmsLog.response_status ? quickSmsLog.response_status : "", // Pending|Sent|Received|Delivered|Queued|Failed
        status: quickSmsLog.status ? quickSmsLog.status : "initial" // initial|processed|pending|sent|delivered
    })

    try {
        // Saving the QuickSmsLog 
        var savedQuickSmsLog = await newQuickSmsLog.save()
        return savedQuickSmsLog
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating QuickSmsLog")
    }
}

exports.updateQuickSmsLog = async function (quickSmsLog) {
    try {
        //Find the old SmsLog Object by the Id
        var id = quickSmsLog._id
        var oldQuickSmsLog = await QuickSmsLog.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the QuickSmsLog")
    }

    // If no old QuickSmsLog Object exists return false
    if (!oldQuickSmsLog) {
        return false
    }

    if (quickSmsLog.company_id) {
        oldQuickSmsLog.company_id = quickSmsLog.company_id
    }

    if (quickSmsLog.location_id) {
        oldQuickSmsLog.location_id = quickSmsLog.location_id
    }

    if (quickSmsLog.booking_id) {
        oldQuickSmsLog.booking_id = quickSmsLog.booking_id
    }

    if (quickSmsLog.user_id) {
        oldQuickSmsLog.user_id = quickSmsLog.user_id
    }

    if (quickSmsLog.client_id) {
        oldQuickSmsLog.client_id = quickSmsLog.client_id
    }

    if (quickSmsLog.date) {
        oldQuickSmsLog.date = quickSmsLog.date
    }

    if (quickSmsLog.till_date) {
        oldQuickSmsLog.till_date = quickSmsLog.till_date
    }

    if (quickSmsLog.booking_date) {
        oldQuickSmsLog.booking_date = quickSmsLog.booking_date
    }

    if (quickSmsLog.mobile) {
        oldQuickSmsLog.mobile = quickSmsLog.mobile
    }

    if (quickSmsLog.content) {
        oldQuickSmsLog.content = quickSmsLog.content
    }

    if (quickSmsLog.sms_count || quickSmsLog.sms_count == 0) {
        oldQuickSmsLog.sms_count = quickSmsLog.sms_count
    }

    if (quickSmsLog.sent_count || quickSmsLog.sent_count == 0) {
        oldQuickSmsLog.sent_count = quickSmsLog.sent_count
    }

    if (quickSmsLog.sms_response) {
        oldQuickSmsLog.sms_response = quickSmsLog.sms_response
    }

    if (quickSmsLog.response_status) {
        oldQuickSmsLog.response_status = quickSmsLog.response_status
    }

    if (quickSmsLog.status) {
        oldQuickSmsLog.status = quickSmsLog.status
    }

    try {
        var savedQuickSmsLog = await oldQuickSmsLog.save()
        return savedQuickSmsLog
    } catch (e) {
        throw Error("And Error occured while updating the QuickSmsLog")
    }
}

exports.deleteQuickSmsLog = async function (id) {
    // Delete the QuickSmsLog
    try {
        var deleted = await QuickSmsLog.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("QuickSmsLog Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the QuickSmsLog")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await QuickSmsLog.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the QuickSmsLog")
    }
}