"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apache_js_workers_1 = require("apache-js-workers");
var authenticate = require("./../../../private-workers/authenticate");
var fs = require("fs");
var jwt = require("jsonwebtoken");
// Get Login Data from the request
var loginData = apache_js_workers_1.req.body.loginData;
// Authenticate
authenticate(loginData)
    .then(function () {
    // Authenticated, send the user a token
    var jwtSecret = fs.readFileSync(__dirname + '/../../../.jwtsecret', 'utf-8');
    var suToken = jwt.sign({
        username: loginData.username,
        tokenType: 'su-token',
        aud: 'node-cms-admin-panel'
    }, jwtSecret, {
        expiresIn: '1h'
    });
    apache_js_workers_1.res.send(suToken);
})
    .catch(function () {
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Authentication Failure');
});
