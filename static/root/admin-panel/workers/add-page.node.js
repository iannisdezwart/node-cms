"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apache_js_workers_1 = require("apache-js-workers");
var node_json_database_1 = require("node-json-database");
var authenticateSuToken = require("./../../../private-workers/authenticate-su-token");
var compile = require("./../../../private-workers/compile");
// Get the suToken from the request
var suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticateSuToken(suToken)
    .then(function () {
    // Authenticated, try to add the page to the database
    try {
        var pageType = apache_js_workers_1.req.body.pageType;
        var pageContent = apache_js_workers_1.req.body.pageContent;
        var pagesDB = node_json_database_1.db(__dirname + '/../../../pages.json');
        var pagesTable = pagesDB.table('pages');
        // Add the page to the database
        pagesTable.insert([{ pageType: pageType, pageContent: pageContent }]);
        // Compile the website
        compile()
            .then(function () {
            apache_js_workers_1.res.send('Succesfully stored page!');
        })
            .catch(function (err) {
            throw err;
        });
    }
    catch (err) {
        // Send 500 error
        apache_js_workers_1.res.statusCode = 500;
        apache_js_workers_1.res.send('An internal server error occured while updating the page');
        throw err;
    }
})
    .catch(function (err) {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
    throw err;
});
