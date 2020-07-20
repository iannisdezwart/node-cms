"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const authenticate_1 = require("./../../../private-workers/authenticate");
// Get Login Data from the request
const loginData = apache_js_workers_1.req.body;
// Authenticate
authenticate_1.authenticate(loginData)
    .then(() => {
    // Authenticated, send the user a token
    const jwtSecret = fs.readFileSync(__dirname + '/../../../.jwtsecret', 'utf-8');
    const token = jwt.sign({ username: loginData.username }, jwtSecret, {
        expiresIn: '1d'
    });
    apache_js_workers_1.res.send(token);
})
    .catch(() => {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
