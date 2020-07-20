"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const authenticate_1 = require("./../../../private-workers/authenticate");
const fs = require("fs");
const jwt = require("jsonwebtoken");
// Get Login Data from the request
const loginData = apache_js_workers_1.req.body.loginData;
// Authenticate
authenticate_1.authenticate(loginData)
    .then(() => {
    // Authenticated, send the user a token
    const jwtSecret = fs.readFileSync(__dirname + '/../../../.jwtsecret', 'utf-8');
    const suToken = jwt.sign({
        username: loginData.username,
        tokenType: 'su-token',
        aud: 'node-cms-admin-panel'
    }, jwtSecret, {
        expiresIn: '1h'
    });
    apache_js_workers_1.res.send(suToken);
})
    .catch(() => {
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Authentication Failure');
});
