"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apache_js_workers_1 = require("apache-js-workers");
var fs = require("fs");
var jwt = require("jsonwebtoken");
var authenticate = require("./../../../private-workers/authenticate");
// Get Login Data from the request
var loginData = apache_js_workers_1.req.body;
// Authenticate
authenticate(loginData)
    .then(function () {
    // Authenticated, send the user a token
    var jwtSecret = fs.readFileSync(__dirname + '/../../../.jwtsecret', 'utf-8');
    var token = jwt.sign({ username: loginData.username }, jwtSecret, {
        expiresIn: '1d'
    });
    apache_js_workers_1.res.send(token);
})
    .catch(function () {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
