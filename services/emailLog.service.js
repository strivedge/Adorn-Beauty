// Gettign the Newly created Mongoose Model we just created 
var EmailLog = require('../models/EmailLog.model')

// Saving the context of this module inside the _the variable
_this = this

// Async function to get the EmailLog List
exports.getEmailLogs = async function (query, page, limit, order_name, order, serachText) {
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

        var EmailLogs = await EmailLog.aggregate(facetedPipeline).allowDiskUse(true);
        // Return the EmailLogd list that was retured by the mongoose promise
        return EmailLogs;

    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating EmailLogs');
    }
}

exports.getEmailLogsOne = async function (query = {}, page = 1, limit = 0, sort_field = "_id", sort_type = "-1") {
    try {
        var skips = limit * (page - 1)
        var sorts = {}
        if (sort_field) {
            sorts[sort_field] = sort_type
        }
        var emailLogs = await EmailLog.find(query)
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

        // Return the emailLogd list that was retured by the mongoose promise
        return emailLogs || []
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason 
        return []
    }
}


exports.getAllEmailLogs = async function (query, order_name, order, serachText) {
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

        var EmailLogs = await EmailLog.aggregate(facetedPipeline);
        // Return the EmailLogd list that was retured by the mongoose promise
        return EmailLogs;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating EmailLogs');
    }
}

// getting all EmailLogs for company copy
exports.getEmailLogsSpecific = async function (query) {

    // console.log('query',query)
    // Try Catch the awaited promise to handle the error 
    try {
        //var EmailLogs = await EmailLog.find(query);

        var EmailLogs = await EmailLog.aggregate([{
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
        return EmailLogs;

    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating EmailLogs');
    }
}

exports.updateManyLogClient = async function (query, client_id) {
    try {
        // Find the Data and replace booking status
        var emailLogs = await EmailLog.updateMany(query, { $set: { client_id: client_id } })

        return emailLogs;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("EmailLogs not available");
    }
}

exports.getEmailLog = async function (id) {
    try {
        // Find the Data 
        var _details = await EmailLog.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("EmailLog not available")
    }
}

exports.createEmailLog = async function (emailLog) {
    var newEmailLog = new EmailLog({
        company_id: emailLog.company_id ? emailLog.company_id : null,
        location_id: emailLog.location_id ? emailLog.location_id : null,
        client_id: emailLog.client_id ? emailLog.client_id : null,
        name: emailLog.name ? emailLog.name : "",
        to_email: emailLog.to_email ? emailLog.to_email : "",
        subject: emailLog.subject ? emailLog.subject : "",
        type: emailLog.type ? emailLog.type : "",
        date: emailLog.date ? emailLog.date : null,
        till_date: emailLog.till_date ? emailLog.till_date : null,
        temp_file: emailLog.temp_file ? emailLog.temp_file : "",
        html: emailLog.html ? emailLog.html : "",
        file_type: emailLog.file_type ? emailLog.file_type : "",
        data: emailLog.data ? emailLog.data : null,
        response: emailLog.response ? emailLog.response : null,
        response_status: emailLog.response_status ? emailLog.response_status : "",
        status: emailLog.status ? emailLog.status : null,
        email_type: emailLog.email_type ? emailLog.email_type : "",
    })

    try {
        // Saving the EmailLog 
        var savedEmailLog = await newEmailLog.save()
        return savedEmailLog
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating EmailLog")
    }
}

exports.updateEmailLog = async function (emailLog) {
    try {
        //Find the old EmailLog Object by the Id
        var id = emailLog._id
        var oldEmailLog = await EmailLog.findById(id)
    } catch (e) {
        throw Error("Error occured while Finding the EmailLog")
    }

    // If no old EmailLog Object exists return false
    if (!oldEmailLog) {
        return false
    }

    if (emailLog.type) {
        oldEmailLog.type = emailLog.type
    }

    if (emailLog.till_date) {
        oldEmailLog.till_date = emailLog.till_date
    }
    if (emailLog.response) {
        oldEmailLog.response = emailLog.response
    }

    if (emailLog.response_status) {
        oldEmailLog.response_status = emailLog.response_status
    }

    if (emailLog.status) {
        oldEmailLog.status = emailLog.status
    }

    try {
        var savedEmailLog = await oldEmailLog.save()
        return savedEmailLog
    } catch (e) {
        console.log("updateEmailLog Error >>> ", e)
        throw Error("And Error occured while updating the EmailLog")
    }
}

exports.deleteEmailLog = async function (id) {
    // Delete the EmailLog
    try {
        var deleted = await EmailLog.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("EmailLog Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the EmailLog")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await EmailLog.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the EmailLog")
    }
}
