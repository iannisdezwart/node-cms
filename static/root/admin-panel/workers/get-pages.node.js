"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apache_js_workers_1 = require("apache-js-workers");
var node_json_database_1 = require("node-json-database");
var fs = require("fs");
var jwt = require("jsonwebtoken");
// Get the token from the request
var token = apache_js_workers_1.req.body.token;
var jwtSecret = fs.readFileSync(__dirname + '/../../../.jwtsecret', 'utf-8');
// Verify the token
jwt.verify(token, jwtSecret, function (err) {
    if (!err) {
        // Authenticated, send the pages
        var pagesDB = node_json_database_1.db(__dirname + '/../../../pages.json');
        var pages = pagesDB.table('pages').get().rows;
        var pageTypes = pagesDB.table('pageTypes').get().rows;
        apache_js_workers_1.res.send({ pages: pages, pageTypes: pageTypes });
    }
    else {
        // Send 403 error
        apache_js_workers_1.res.statusCode = 403;
        apache_js_workers_1.res.send('Forbidden');
    }
});
