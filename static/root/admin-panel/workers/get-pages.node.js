"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const node_json_database_1 = require("node-json-database");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
// Get the token from the request
const suToken = apache_js_workers_1.req.body.suToken;
// Verify the suToken
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, send the pages
    const pagesDB = node_json_database_1.db(__dirname + '/../../../pages.json');
    const pages = pagesDB.table('pages').get().rows;
    const pageTypes = pagesDB.table('pageTypes').get().rows;
    apache_js_workers_1.res.send({ pages, pageTypes });
})
    .catch(() => {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
