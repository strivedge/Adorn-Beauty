// Gettign the Newly created Mongoose Model we just created 
var EmailCount = require('../models/EmailCount.model')

// Saving the context of this module inside the _the variable
_this = this



exports.getAllEmailCounts = async function (query, order_name, order, serachText) {
    // Options setup for the mongoose paginate

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
            { $sort: sort },
        ];

        var EmailCounts = await EmailCount.aggregate(facetedPipeline);
        // Return the EmailCountd list that was retured by the mongoose promise
        return EmailCounts;

    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating EmailCounts');
    }
}

// getting all EmailCounts for company copy
exports.getEmailCountsSpecific = async function (query) {
    try {
        var _details = await EmailCount.find(query)
        // Return the Serviced list that was retured by the mongoose promise
        return _details || null;

    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating EmailCounts');
    }
}

exports.getLimitExceedEmail = async function (query) {
    try {
       var _details =  await EmailCount.find(query).select('from_email');
       if(_details && _details.length > 0){
            _details = _details.map(m => m.from_email);
       }
        // Return the Serviced list that was retured by the mongoose promise
        return _details || null;

    } catch (e) {
        console.log('e', e)
        // return a Error message describing the reason 
        throw Error('Error while Paginating EmailCounts');
    }
}

exports.getEmailCount = async function (id) {
    try {
        // Find the Data 
        var _details = await EmailCount.findOne({ _id: id })

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("EmailCount not available")
    }
}

exports.increaseEmailCount = async function (query) {
    try {
        // Find the Data 
        var _details = await EmailCount.update(query,{ $inc: { count: 1 }})

        return _details || null
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("EmailCount not available")
    }
}

exports.createEmailCount = async function (data) {
    var newEmailCount = new EmailCount({
        company_id: data.company_id ? data.company_id : null,
        location_id: data.location_id ? data.location_id : null,
        from_email: data.from_email ? data.from_email : "",
        date: data.date ? data.date : null,
        count: data.count ? data.count : 0
    })

    try {
        // Saving the EmailCount 
        var savedEmailCount = await newEmailCount.save()
        return savedEmailCount
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating EmailCount")
    }
}


exports.deleteEmailCount = async function (id) {
    // Delete the EmailCount
    try {
        var deleted = await EmailCount.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("EmailCount Could not be deleted")
        }

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the EmailCount")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the AppliedDiscount
    try {
        var deleted = await EmailCount.remove(query)

        return deleted
    } catch (e) {
        throw Error("Error Occured while Deleting the EmailCount")
    }
}
