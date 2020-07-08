"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apache_js_workers_1 = require("apache-js-workers");
var node_json_database_1 = require("node-json-database");
var authenticateSuToken = require("../../../private-workers/authenticate-su-token");
var compile = require("../../../private-workers/compile");
// Get the suToken from the request
var suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticateSuToken(suToken)
    .then(function () {
    // Authenticated, try to swap the pages
    try {
        var page1_1 = apache_js_workers_1.req.body.page1;
        var page2_1 = apache_js_workers_1.req.body.page2;
        var pagesDB = node_json_database_1.db(__dirname + '/../../../pages.json');
        var pagesTable = pagesDB.table('pages');
        // Get the page records from the database
        var page1Record = pagesTable.get().where(function (row) { return row.id == page1_1.id; }).rows[0];
        var page2Record = pagesTable.get().where(function (row) { return row.id == page2_1.id; }).rows[0];
        // Swap the IDs
        var page1ID = page1Record.id;
        page1Record.id = page2Record.id;
        page2Record.id = page1ID;
        // Update the page records
        pagesTable.update(page2Record, function (row) { return row.id == page1_1.id; });
        pagesTable.update(page1Record, function (row) { return row.id == page2_1.id; });
        // Compile the website
        compile()
            .then(function () {
            apache_js_workers_1.res.send('Succesfully swapped page order!');
        })
            .catch(function (err) {
            throw err;
        });
    }
    catch (err) {
        console.error("Error while swapping pages: " + err);
        // Send 500 error
        apache_js_workers_1.res.statusCode = 500;
        apache_js_workers_1.res.send('Forbidden');
    }
})
    .catch(function () {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
