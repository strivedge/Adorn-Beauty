/**
 * @type {Module jsonwebtoken|Module jsonwebtoken}
 * @author | Strivedge
*/

var jwt = require('jsonwebtoken');
var config = require('../config');
var UserService = require('../services/user.service');

var authorization = function (req, res, next) {
    var token = req.headers['x-access-token'];
    var msg = { auth: false, flag: false, message: "No token provided!" };
    if (!token) {
        return res.status(401).send(msg)
    } else {
        jwt.verify(token, config.SECRET, async function (err, decoded) {
            var msg = { auth: false, flag: false, message: "Failed to authenticate token!" }
            if (err) {
                return res.status(401).send(msg);
            } else {
                var userId = decoded?.id || "";
                req.userId = userId;

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

module.exports = authorization;
