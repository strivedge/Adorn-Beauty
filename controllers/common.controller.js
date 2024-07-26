var CryptoJsService = require('../services/cryptoJs.service');

const { formatDate } = require('../helper');

exports.createCryptoToken = async function (req, res, next) {
    try {
        var brand = req.body?.brand || "";
        var originUrl = req.body?.origin_url || "";
        var periodType = req.body?.period_type || "";
        var date = req.body?.date || null;
        if (date) { formatDate(date, "YYYY-MM-DD"); }

        var required = false;
        var message = "Something went wrong!";

        if (!brand) {
            required = true
            message = "Brand name must be present!";
        } else if (!originUrl) {
            required = true
            message = "Original url must be present!";
        } else if (!periodType) {
            required = true
            message = "Period type must be present!";
        }

        if (required) {
            return res.status(200).json({
                status: 200,
                flag: false,
                message: message
            })
        }

        var payload = {
            brand,
            origin_url: originUrl,
            period_type: periodType,
            date,
            created_at: new Date()
        }
        var encrypt = await CryptoJsService.setEncryption(payload);

        return res.status(200).json({
            status: 200,
            flag: true,
            data: encrypt,
            message: "Crypto token generated successfully!"
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}

exports.testFunctionCommon = async function (req, res, next) {
    try {

        var data = null;

        return res.status(200).json({
            status: 200,
            flag: true,
            data: data,
            message: "Tested successfully!"
        });
    } catch (e) {
        // Return an Error Response Message with Code and the Error Message.
        return res.status(200).json({ status: 200, flag: false, message: e.message });
    }
}
