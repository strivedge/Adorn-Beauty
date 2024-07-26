var CryptoJsService = require('../services/cryptoJs.service');

const { isObjEmpty } = require('../helper');

var cryptoTokenAuth = async function (req, res, next) {
    var token = req.headers['y-access-token'] || ""; // Crypto Token
    var origin = req.get('origin') || "";
    var msg = { auth: false, flag: false, message: "No token provided!" };
    if (!origin) {
        msg.message = "Origin url not found!";
        return res.status(401).send(msg);
    }

    if (!token) {
        return res.status(401).send(msg);
    } else {
        var decrypted = await CryptoJsService.getDecryption(token);
        if (!decrypted) {
            return res.status(401).send(msg);
        } else if (decrypted && isObjEmpty(decrypted)) {
            return res.status(401).send(msg);
        } else {
            if (!decrypted?.origin_url?.includes(origin)) {
                msg.message = "Invalid token provided!";
                return res.status(401).send(msg);
            }
        }

        next();
    }
}

module.exports = cryptoTokenAuth;
