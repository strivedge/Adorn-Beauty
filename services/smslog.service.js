// Gettign the Newly created Mongoose Model we just created 
var SmsLog = require('../models/SmsLog.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the SmsLog List
exports.getSmsLogs = async function (query, page, limit, order_name, order, serachText) {
    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        // if(serachText && serachText != ''){
        //     query['$text'] = { $search: serachText, $language:'en',$caseSensitive:false};
        // }

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
            },
        ];

        var SmsLogs = await SmsLog.aggregate(facetedPipeline);
        // Return the SmsLogd list that was retured by the mongoose promise
        return SmsLogs;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating SmsLogs');
    }
}

exports.getSmsLogsOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }

        var smsLogs = await SmsLog.find(query)
            .sort(sorts)
            .skip(skips)
            .limit(limit)

        // Return the SmsLogd list that was retured by the mongoose promise
        return smsLogs || []
    } catch (e) {
        // return a Error message describing the reason 
        return []
    }
}

exports.getAllSmsLogs = async function (query, order_name, order, serachText) {
    // Options setup for the mongoose paginate

    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

        // if(serachText && serachText != ''){
        //     query['$text'] = { $search: serachText, $language:'en',$caseSensitive:false};
        // }

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
        ];

        var SmsLogs = await SmsLog.aggregate(facetedPipeline);
        // Return the SmsLogd list that was retured by the mongoose promise
        return SmsLogs;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating SmsLogs');
    }
}

// getting all SmsLogs for company copy
exports.getSmsLogsSpecific = async function (query) {

    // console.log('query',query)
    // Try Catch the awaited promise to handle the error 
    try {
        //var SmsLogs = await SmsLog.find(query);

        var SmsLogs = await SmsLog.aggregate([{
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
        ]);

        // Return the Serviced list that was retured by the mongoose promise
        return SmsLogs;

    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating SmsLogs');
    }
}

exports.updateManysmsLogClient = async function (query, client_id) {
    try {
        // Find the Data and replace booking status
        var smsLogs = await SmsLog.updateMany(query, { $set: { client_id: client_id } })

        return smsLogs;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("SmsLogs not available");
    }
}

exports.getSmsLog = async function (id) {
    try {
        // Find the Data 
        var _details = await SmsLog.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("SmsLog not available")
    }
}

exports.createSmsLog = async function (smsLog) {
    var newSmsLog = new SmsLog({
        company_id: smsLog.company_id ? smsLog.company_id : null,
        location_id: smsLog.location_id ? smsLog.location_id : null,
        client_id: smsLog.client_id ? smsLog.client_id : null,
        type: smsLog.type ? smsLog.type : "direct", // direct|cron
        sms_type: smsLog.sms_type ? smsLog.sms_type : "",
        date: smsLog.date ? smsLog.date : null,
        mobile: smsLog.mobile ? smsLog.mobile : "",
        content: smsLog.content ? smsLog.content : "",
        till_date: smsLog.till_date ? smsLog.till_date : null,
        sms_count: smsLog.sms_count ? smsLog.sms_count : 1,
        sms_setting: smsLog.sms_setting ? smsLog.sms_setting : "",
        sms_response: smsLog.sms_response ? smsLog.sms_response : null,
        twillio_response: smsLog.twillio_response ? smsLog.twillio_response : null,
        sent_count: smsLog.sent_count ? smsLog.sent_count : 0,
        response_status: smsLog.response_status ? smsLog.response_status : "", // Pending|Sent|Received|Delivered|Queued|Failed
        status: smsLog.status ? smsLog.status : "initial" // initial|processed|pending|sent|delivered
    })

    try {
        // Saving the SmsLog 
        var savedSmsLog = await newSmsLog.save()
        return savedSmsLog
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating SmsLog")
    }
}

exports.updateSmsLog = async function (smsLog) {
    try {
        //Find the old SmsLog Object by the Id
        var id = smsLog._id
        var oldSmsLog = await SmsLog.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the SmsLog")
    }

    // If no old SmsLog Object exists return false
    if (!oldSmsLog) {
        return false
    }

    if (smsLog.company_id) {
        oldSmsLog.company_id = smsLog.company_id
    }

    if (smsLog.location_id) {
        oldSmsLog.location_id = smsLog.location_id
    }

    if (smsLog.client_id) {
        oldSmsLog.client_id = smsLog.client_id
    }

    if (smsLog.type) {
        oldSmsLog.type = smsLog.type
    }

    if (smsLog.sms_type) {
        oldSmsLog.sms_type = smsLog.sms_type
    }

    if (smsLog.date) {
        oldSmsLog.date = smsLog.date
    }

    if (smsLog.mobile) {
        oldSmsLog.mobile = smsLog.mobile
    }

    if (smsLog.content) {
        oldSmsLog.content = smsLog.content
    }

    if (smsLog.till_date) {
        oldSmsLog.till_date = smsLog.till_date
    }

    if (smsLog.sms_count || smsLog.sms_count == 0) {
        oldSmsLog.sms_count = smsLog.sms_count
    }

    if (smsLog.sms_response) {
        oldSmsLog.sms_response = smsLog.sms_response
    }

    if (smsLog.twillio_response) {
        oldSmsLog.twillio_response = smsLog.twillio_response
    }

    if (smsLog.sms_setting) {
        oldSmsLog.sms_setting = smsLog.sms_setting
    }

    if (smsLog.sent_count || smsLog.sent_count == 0) {
        oldSmsLog.sent_count = smsLog.sent_count
    }

    if (smsLog.response_status) {
        oldSmsLog.response_status = smsLog.response_status
    }

    if (smsLog.status) {
        oldSmsLog.status = smsLog.status
    }

    try {
        var savedSmsLog = await oldSmsLog.save()
        return savedSmsLog
    } catch (e) {
        console.log("updateSmsLog Error >>> ", e)
        throw Error("And Error occured while updating the SmsLog")
    }
}

exports.deleteSmsLog = async function (id) {
    // Delete the SmsLog
    try {
        var deleted = await SmsLog.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("SmsLog Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the SmsLog")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await SmsLog.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the SmsLog")
    }
}
