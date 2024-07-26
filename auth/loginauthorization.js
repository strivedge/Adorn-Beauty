/**
 * @type {Module jsonwebtoken|Module jsonwebtoken}
 * @author | Strivedge
*/

var jwt = require('jsonwebtoken');
var config = require('../config');
var UserService = require('../services/user.service');

var loginauthorization = function (req, res, next) {
    var token = req.body['token'];
    var msg = { auth: false, flag: false, message: "No token provided!" };
    console.log("authorization token >>> ", token)
    if (!token) {
        return res.status(401).send(msg)
    } else {
        jwt.verify(token, config.SECRET, async function (err, decoded) {
            var msg = { auth: false, flag: false, message: "Failed to authenticate token!" }
            if (err) {
                return res.status(401).send(msg);
            } else {
                var userId = decoded?.id || "";
                var companyId = decoded?.company_id || "";
                var roleId = decoded?.role_id || "";
                var customerId = decoded?.customer_id || "";

                console.log('userId', userId)

                req.userId = userId;
                req.companyId = companyId;
                req.roleId = roleId;
                req.customerId = customerId;

                if (userId) {
                    var user = await UserService.getUserOne({ _id: userId });
                    if (user && user?.status == 0) {
                        return res.status(401).send(msg);
                    }
                }
            }

            next();
        })
    }
}

module.exports = loginauthorization;
