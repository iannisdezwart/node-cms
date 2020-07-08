"use strict";
var fs = require("fs");
var jwt = require("jsonwebtoken");
var jwtSecret = fs.readFileSync(__dirname + '/../.jwtsecret', 'utf-8');
var authenticateSuToken = function (suToken) { return new Promise(function (resolve, reject) {
    if (suToken == undefined) {
        reject();
        return;
    }
    // Verify the token
    jwt.verify(suToken, jwtSecret, function (err, decoded) {
        if (!err) {
            if (decoded.tokenType == 'su-token') {
                // Authenticated
                resolve();
            }
            else {
                // Non-suToken
                reject();
            }
        }
        else {
            // Not authenticated
            reject();
        }
    });
}); };
module.exports = authenticateSuToken;
