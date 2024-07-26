var GiftCardTransactionService = require('../services/giftCardTransaction.service');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getGiftCardTransactions = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 0; //skip raw value
    var limit = req.query.limit ? req.query.limit : 1000;
    var order_name = req.query.order_name ? req.query.order_name : '_id';
    var order = req.query.order ? req.query.order : '-1';
    var searchText = req.query.searchText ? req.query.searchText : "";

    var query = {};
    if (req.query?.company_id) {
        query.company_id = req.query.company_id;
    }

    if (req.query?.location_id) {
        query.location_id = req.query.location_id;
    }

    if (searchText) {
        if (!isNaN(searchText)) {
            query.amount = { $eq: Number(searchText), $exists: true }
        } else {
            query['$or'] = [
                { action: { $regex: '.*' + searchText + '.*', $options: 'i' } }
            ];
        }
    }

    try {
        var giftCardTransactions = await GiftCardTransactionService.getGiftCardTransactions(query, parseInt(page), parseInt(limit), order_name, Number(order));

        // Return the GiftCardTransactions list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: giftCardTransactions, message: "Gift card transactions received successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.getGiftCardTransactionsOne = async function (req, res, next) {
    try {
        var page = Number(req.query?.page) || 1;
        var limit = Number(req.query?.limit) || 0;
        var sortBy = req.query?.sortBy || '_id';
        var sortOrder = req.query.sortOrder && JSON.parse(req.query.sortOrder) ? '1' : '-1';
        var pageIndex = 0;
        var startIndex = 0;
        var endIndex = 0;

        var companyId = req.query?.company_id || "";
        var locationId = req.query?.location_id || "";
        var customerId = req.query?.customer_id || "";
        var customerGiftCardId = req.query?.customer_gift_card_id || "";
        var search = req.query?.searchText || "";

        var throwError = false;
        var message = "Something went wrong!";

        if (!companyId) {
            throwError = true;
            message = "Company Id must be present!";
        } else if (!locationId) {
            throwError = true;
            message = "Location Id must be present!";
        } else if (!customerId) {
            throwError = true;
            message = "Customer Id must be present!";
        }

        if (throwError) {
            return res.status(200).json({
                status: 200,
                flag: false,
                data: [],
                message: message
            });
        }

        var query = {};
        if (companyId) { query.company_id = companyId; }
        if (locationId) { query.location_id = { $in: [locationId, null] } }
        if (customerGiftCardId) { query.customer_gift_card_id = customerGiftCardId; }

        if (search) {
            if (!isNaN(search)) {
                query.amount = { $eq: Number(search), $exists: true }
            } else {
                query['$or'] = [
                    { action: { $regex: '.*' + search + '.*', $options: 'i' } },
                    { description: { $regex: '.*' + search + '.*', $options: 'i' } }
                ];
            }
        }

        var count = await GiftCardTransactionService.getGiftCardTransactionsCount(query);
        var giftCardTransactions = await GiftCardTransactionService.getGiftCardTransactionsOne(query, Number(page), Number(limit), sortBy, Number(sortOrder));
        if (!giftCardTransactions || !giftCardTransactions?.length) {
            if (Number(req.query?.page) && Number(req.query.page) > 0) {
                page = 1;
                giftCardTransactions = await GiftCardTransactionService.getGiftCardTransactionsOne(query, Number(page), Number(limit), sortBy, Number(sortOrder));
            }
        }

        if (giftCardTransactions && giftCardTransactions.length) {
            pageIndex = Number(page - 1);
            startIndex = (pageIndex * limit) + 1;
            endIndex = Math.min(startIndex - 1 + limit, count);
        }

        // Return the Customer Gift Cards list with the appropriate HTTP password Code and Message.
        return res.status(200).json({
            status: 200,
            flag: true,
            data: giftCardTransactions,
            pages: limit ? Math.ceil(count / limit) : 0,
            total: count,
            pageIndex: pageIndex,
            startIndex: startIndex,
            endIndex: endIndex,
            message: "Customer gift cards received successfully!"
        });
    } catch (error) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: error.message });
    }
}

exports.getGiftCardTransaction = async function (req, res, next) {
    // Check the existence of the query parameters, If doesn't exists assign a default value
    var id = req.params.id;
    try {
        var GiftCardTransaction = await GiftCardTransactionService.getGiftCardTransaction(id);

        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({ status: 200, flag: true, data: GiftCardTransaction, message: "Gift card transaction received successfully!" });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.createGiftCardTransaction = async function (req, res, next) {
    //console.log('req body',req.body)
    try {
        // Calling the Service function with the new object from the Request Body
        var createdGiftCardTransaction = await GiftCardTransactionService.createGiftCardTransaction(req.body)
        return res.status(200).json({ status: 200, flag: true, data: createdGiftCardTransaction, message: "Gift card transaction created successfully!" })
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.updateGiftCardTransaction = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body._id) {
        return res.status(200).json({ status: 200, flag: false, message: "Id must be present" })
    }

    try {
        var updatedGiftCardTransaction = await GiftCardTransactionService.updateGiftCardTransaction(req.body)
        return res.status(200).json({ status: 200, flag: true, data: updatedGiftCardTransaction, message: "Gift card transaction updated successfully!" })
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}

exports.removeGiftCardTransaction = async function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        return res.status(200).json({ status: 200, flag: true, message: "Id must be present!" })
    }

    try {
        var deleted = await GiftCardTransactionService.deleteGiftCardTransaction(id);
        res.status(200).send({ status: 200, flag: true, message: "Successfully Deleted... " });
    } catch (e) {
        return res.status(200).json({ status: 200, flag: false, message: e.message })
    }
}
