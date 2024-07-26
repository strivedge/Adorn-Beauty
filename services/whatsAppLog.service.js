// Gettign the Newly created Mongoose Model we just created 
var WhatsAppLog = require('../models/WhatsAppLog.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the WhatsAppLog List
exports.getWhatsAppLogs = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

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
            { $sort: { createdAt: -1 } },
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
        ];

        var whatsAppLogs = await WhatsAppLog.aggregate(facetedPipeline);
        // Return the WhatsAppLogd list that was retured by the mongoose promise
        return whatsAppLogs;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating WhatsAppLogs');
    }
}

exports.getWhatsAppLogsOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var whatsAppLogs = await WhatsAppLog.find(query)
            .populate({
                path: 'company_id',
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'location_id',
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'client_id',
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        // Return the WhatsAppLogd list that was retured by the mongoose promise
        return whatsAppLogs || []
    } catch (e) {
        // return a Error message describing the reason 
        return []
    }
}

// getting all WhatsAppLogs for company copy
exports.getWhatsAppLogsSpecific = async function (query) {
    // Try Catch the awaited promise to handle the error 
    try {
        var whatsAppLogs = await WhatsAppLog.aggregate([
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
        ]);

        // Return the WhatsAppLog list that was retured by the mongoose promise
        return whatsAppLogs;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while getting whatsAppLogs');
    }
}

exports.updateManyLogClient = async function (query, client_id) {
    try {
        // Find the Data and replace booking status
        var whatsAppLogs = await WhatsAppLog.updateMany(query, { $set: { client_id: client_id } })

        return whatsAppLogs;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("whatsAppLogs not available");
    }
}

exports.getWhatsAppLog = async function (id) {
    try {
        // Find the Data 
        var _details = await WhatsAppLog.findOne({ _id: id })
            .populate({
                path: 'company_id',
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'location_id',
                select: {
                    _id: 1,
                    name: 1
                }
            })
            .populate({
                path: 'client_id',
                select: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    gender: 1,
                    photo: 1,
                    customer_heart: 1,
                    customer_icon: 1,
                    customer_badge: 1
                }
            })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("WhatsAppLog not available")
    }
}

exports.createWhatsAppLog = async function (whatsAppLog) {
    var newWhatsAppLog = new WhatsAppLog({
        company_id: whatsAppLog.company_id ? whatsAppLog.company_id : null,
        location_id: whatsAppLog.location_id ? whatsAppLog.location_id : null,
        client_id: whatsAppLog.client_id ? whatsAppLog.client_id : null,
        type: whatsAppLog.type ? whatsAppLog.type : "direct", // direct|cron
        msg_type: whatsAppLog.msg_type ? whatsAppLog.msg_type : "",
        date: whatsAppLog.date ? whatsAppLog.date : null,
        mobile: whatsAppLog.mobile ? whatsAppLog.mobile : "",
        content: whatsAppLog.content ? whatsAppLog.content : "",
        till_date: whatsAppLog.till_date ? whatsAppLog.till_date : null,
        msg_count: whatsAppLog.msg_count ? whatsAppLog.msg_count : 1,
        response: whatsAppLog.response ? whatsAppLog.response : null,
        sent_count: whatsAppLog.sent_count ? whatsAppLog.sent_count : 0,
        response_status: whatsAppLog.response_status ? whatsAppLog.response_status : "", // Pending|Sent|Received|Delivered|Queued|Failed
        status: whatsAppLog.status ? whatsAppLog.status : "initial" // initial|processed|pending|sent|delivered|success
    })

    try {
        // Saving the WhatsAppLog 
        var savedWhatsAppLog = await newWhatsAppLog.save()
        return savedWhatsAppLog
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating WhatsAppLog")
    }
}

exports.updateWhatsAppLog = async function (whatsAppLog) {
    try {
        //Find the old WhatsAppLog Object by the Id
        var id = whatsAppLog._id
        var oldWhatsAppLog = await WhatsAppLog.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the WhatsAppLog")
    }

    // If no old WhatsAppLog Object exists return false
    if (!oldWhatsAppLog) {
        return false
    }

    if (whatsAppLog.company_id) {
        oldWhatsAppLog.company_id = whatsAppLog.company_id
    }

    if (whatsAppLog.location_id) {
        oldWhatsAppLog.location_id = whatsAppLog.location_id
    }

    if (whatsAppLog.client_id) {
        oldWhatsAppLog.client_id = whatsAppLog.client_id
    }

    if (whatsAppLog.type) {
        oldWhatsAppLog.type = whatsAppLog.type
    }

    if (whatsAppLog.msg_type) {
        oldWhatsAppLog.msg_type = whatsAppLog.msg_type
    }

    if (whatsAppLog.date) {
        oldWhatsAppLog.date = whatsAppLog.date
    }

    if (whatsAppLog.mobile) {
        oldWhatsAppLog.mobile = whatsAppLog.mobile
    }

    if (whatsAppLog.content) {
        oldWhatsAppLog.content = whatsAppLog.content
    }

    if (whatsAppLog.till_date) {
        oldWhatsAppLog.till_date = whatsAppLog.till_date
    }

    if (whatsAppLog.msg_count || whatsAppLog.msg_count == 0) {
        oldWhatsAppLog.msg_count = whatsAppLog.msg_count
    }

    if (whatsAppLog.response) {
        oldWhatsAppLog.response = whatsAppLog.response
    }

    if (whatsAppLog.sent_count || whatsAppLog.sent_count == 0) {
        oldWhatsAppLog.sent_count = whatsAppLog.sent_count
    }

    if (whatsAppLog.response_status) {
        oldWhatsAppLog.response_status = whatsAppLog.response_status
    }

    if (whatsAppLog.status) {
        oldWhatsAppLog.status = whatsAppLog.status
    }

    try {
        var savedWhatsAppLog = await oldWhatsAppLog.save()
        return savedWhatsAppLog
    } catch (e) {
        throw Error("And Error occured while updating the WhatsAppLog")
    }
}

exports.deleteWhatsAppLog = async function (id) {
    // Delete the WhatsAppLog
    try {
        var deleted = await WhatsAppLog.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("WhatsAppLog Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the WhatsAppLog")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await WhatsAppLog.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the WhatsAppLog")
    }
}
