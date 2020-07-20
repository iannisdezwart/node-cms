"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const jwt = require("jsonwebtoken");
const jwtSecret = fs.readFileSync(__dirname + '/../.jwtsecret', 'utf-8');
exports.authenticateSuToken = (suToken) => new Promise((resolve, reject) => {
    if (suToken == undefined) {
        reject();
        return;
    }
    // Verify the token
    jwt.verify(suToken, jwtSecret, (err, decoded) => {
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
});
