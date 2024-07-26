var config = require('../config');
var SEC_KEY = config?.CRYPTO_SECRET_KEY || "";

var CryptoJS = require("crypto-js");

const { isValidJson } = require('../helper');

// ** Encrypt
exports.setEncryption = async function (data = "") {
    try {
        var encrypt = CryptoJS.AES.encrypt(JSON.stringify(data), SEC_KEY).toString();

        return encrypt;
    } catch (e) {
        throw Error('Error while encription data');
    }
}

// ** Decrypt
exports.getDecryption = async function (data = "") {
    try {
        var bytes = CryptoJS.AES.decrypt(data, SEC_KEY);
        var decrypt = bytes.toString(CryptoJS.enc.Utf8);

        if (isValidJson(decrypt)) { decrypt = JSON.parse(decrypt); }

        return decrypt;
    } catch (e) {
        throw Error('Error while decription data');
    }
}
