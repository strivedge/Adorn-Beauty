// Gettign the Newly created Mongoose Model we just created 
var GiftCardTransaction = require('../models/GiftCardTransaction.model');

// Saving the context of this module inside the _the variable
_this = this;

// Async function to get the GiftCardTransaction List
exports.getGiftCardTransactions = async function (query, page, limit, order_name, order) {
    // Try Catch the awaited promise to handle the error 
    try {
        var sort = {};
        sort[order_name] = order;

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
        ];

        var giftCardTransactions = await GiftCardTransaction.aggregate(facetedPipeline);
        if (giftCardTransactions && giftCardTransactions?.length) {
            if (giftCardTransactions[0]?.data && giftCardTransactions[0].data?.length) {
                giftCardTransactions[0].data = await GiftCardTransaction.populate(
                    giftCardTransactions[0].data, {
                    path: "customer_id",
                    select: "_id first_name last_name name email mobile photo"
                });

                giftCardTransactions[0].data = await GiftCardTransaction.populate(
                    giftCardTransactions[0].data, {
                    path: "customer_gift_card_id"
                });
            }
        }

        // Return the GiftCardTransactiond list that was retured by the mongoose promise
        return giftCardTransactions;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Gift Card Transactions');
    }
}

exports.getGiftCardTransactionsOne = async function (query = {}, page = 1, limit = 0, sort_field = "", sort_type = "-1") {
    try {
        var skips = limit * (page - 1);
        var sorts = {};
        if (sort_field) { sorts[sort_field] = sort_type; }

        var giftCardTransactions = await GiftCardTransaction.find(query)
            .populate({
                path: 'customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({ path: 'customer_gift_card_id' })
            .sort(sorts)
            .skip(skips)
            .limit(limit);

        return giftCardTransactions;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Error while Paginating Gift Card Transactions');
    }
}

exports.getGiftCardTransactionsCount = async function (query = {}) {
    try {
        var giftCardTransactionCount = await GiftCardTransaction.find(query).count();

        return giftCardTransactionCount || 0;
    } catch (e) {
        throw Error('Error while Counting Gift Card Transactions');
    }
}

exports.getGiftCardTransaction = async function (id) {
    try {
        // Find the Data 
        var giftCardTransaction = await GiftCardTransaction.findOne({ _id: id })
            .populate({
                path: 'customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({ path: 'customer_gift_card_id' });

        return giftCardTransaction;
    } catch (e) {
        // return a Error message describing the reason     
        // throw Error("Gift Card Transaction not available");
        return null;
    }
}

exports.getGiftCardTransactionOne = async function (query = {}) {
    try {
        // Find the Data 
        var giftCardTransaction = await GiftCardTransaction.findOne(query)
            .populate({
                path: 'customer_id',
                select: "_id first_name last_name name email mobile photo"
            })
            .populate({ path: 'customer_gift_card_id' });

        return giftCardTransaction;
    } catch (e) {
        // return a Error message describing the reason     
        // throw Error("Gift Card Transaction not available");
        return null;
    }
}

exports.createMultipleGiftCardTransactions = async function (data) {
    try {
        // Find the Data 
        var _details = await GiftCardTransaction.insertMany(data);

        return _details;
    } catch (e) {
        console.log(e)
        // return a Error message describing the reason     
        throw Error("Error while Creating Gift Card Transaction");
    }
}

exports.createGiftCardTransaction = async function (giftCardTransaction) {
    if (giftCardTransaction?.amount) {
        giftCardTransaction.amount = parseFloat(giftCardTransaction.amount).toFixed(2);
    }

    if (giftCardTransaction?.total_amount) {
        giftCardTransaction.total_amount = parseFloat(giftCardTransaction.total_amount).toFixed(2);
    }

    var newGiftCardTransaction = new GiftCardTransaction({
        company_id: giftCardTransaction.company_id ? giftCardTransaction.company_id : null,
        location_id: giftCardTransaction.location_id ? giftCardTransaction.location_id : null,
        customer_id: giftCardTransaction.customer_id ? giftCardTransaction.customer_id : null,
        customer_gift_card_id: giftCardTransaction.customer_gift_card_id ? giftCardTransaction.customer_gift_card_id : null,
        appointment_id: giftCardTransaction.appointment_id ? giftCardTransaction.appointment_id : null,
        credit_id: giftCardTransaction.credit_id ? giftCardTransaction.credit_id : null,
        debit_id: giftCardTransaction.debit_id ? giftCardTransaction.debit_id : null,
        date: giftCardTransaction.date ? giftCardTransaction.date : null,
        action: giftCardTransaction.action ? giftCardTransaction.action : "", // credit|debit
        amount: giftCardTransaction.amount ? giftCardTransaction.amount : 0,
        total_amount: giftCardTransaction.total_amount ? giftCardTransaction.total_amount : 0,
        description: giftCardTransaction.description ? giftCardTransaction.description : "",
        revert: giftCardTransaction.revert ? giftCardTransaction.revert : false,
        status: giftCardTransaction.status ? giftCardTransaction.status : 1 // 1|0
    });

    try {
        // Saving the GiftCardTransaction 
        var savedGiftCardTransaction = await newGiftCardTransaction.save();
        return savedGiftCardTransaction;
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Creating Gift Card Transaction");
    }
}

exports.updateGiftCardTransaction = async function (giftCardTransaction) {
    var id = giftCardTransaction._id
    try {
        //Find the old GiftCardTransaction Object by the Id
        var oldGiftCardTransaction = await GiftCardTransaction.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Gift Card Transaction")
    }

    // If no old GiftCardTransaction Object exists return false
    if (!oldGiftCardTransaction) { return false; }

    // Edit the GiftCardTransaction Object
    if (giftCardTransaction.company_id) {
        oldGiftCardTransaction.company_id = giftCardTransaction.company_id;
    }

    if (giftCardTransaction.location_id) {
        oldGiftCardTransaction.location_id = giftCardTransaction.location_id;
    }

    if (giftCardTransaction.customer_id) {
        oldGiftCardTransaction.customer_id = giftCardTransaction.customer_id;
    }

    if (giftCardTransaction.customer_gift_card_id) {
        oldGiftCardTransaction.customer_gift_card_id = giftCardTransaction.customer_gift_card_id;
    }

    if (giftCardTransaction.appointment_id) {
        oldGiftCardTransaction.appointment_id = giftCardTransaction.appointment_id;
    }

    if (giftCardTransaction?.credit_id || giftCardTransaction.credit_id == "") {
        oldGiftCardTransaction.credit_id = giftCardTransaction?.credit_id || null;
    }

    if (giftCardTransaction?.debit_id || giftCardTransaction.debit_id == "") {
        oldGiftCardTransaction.debit_id = giftCardTransaction?.debit_id || null;
    }

    if (giftCardTransaction.date) {
        oldGiftCardTransaction.date = giftCardTransaction.date
    }

    if (giftCardTransaction.action) {
        oldGiftCardTransaction.action = giftCardTransaction.action
    }

    if (giftCardTransaction.amount) {
        oldGiftCardTransaction.amount = parseFloat(giftCardTransaction.amount).toFixed(2);
    }

    if (giftCardTransaction.total_amount) {
        oldGiftCardTransaction.total_amount = parseFloat(giftCardTransaction.total_amount).toFixed(2);
    }

    if (giftCardTransaction.description) {
        oldGiftCardTransaction.description = giftCardTransaction.description;
    }

    if (giftCardTransaction?.revert || giftCardTransaction.revert == false) {
        oldGiftCardTransaction.revert = giftCardTransaction.revert || false;
    }

    if (giftCardTransaction.status || giftCardTransaction.status == 0) {
        oldGiftCardTransaction.status = giftCardTransaction.status ? giftCardTransaction.status : 0;
    }

    try {
        var savedGiftCardTransaction = await oldGiftCardTransaction.save()
        return savedGiftCardTransaction;
    } catch (e) {
        throw Error("Error occured while updating the Gift Card Transaction");
    }
}

exports.updateManyGiftCardTransaction = async function (query, update) {
    try {
        return await GiftCardTransaction.updateMany(query, update);
    } catch (e) {
        // return an Error message describing the reason
        throw Error("Error occured while updating the Gift Card Transaction");
    }
}

exports.deleteGiftCardTransaction = async function (id) {
    // Delete the GiftCardTransaction
    try {
        var deleted = await GiftCardTransaction.remove({ _id: id })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("GiftCardTransaction Could not be deleted")
        }

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the GiftCardTransaction")
    }
}

exports.deleteMultiple = async function (query) {
    // Delete the GiftCardTransaction
    try {
        var deleted = await GiftCardTransaction.remove(query)

        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the Gift Card Transaction")
    }
}

exports.getDistinctGiftCardTransactions = async function (field = "", query = {}) {
    try {
        var giftCardTransactions = await GiftCardTransaction.distinct(field, query);

        return giftCardTransactions;
    } catch (e) {
        // return a Error message describing the reason 
        throw Error('Issue with distinct field');
    }
}
