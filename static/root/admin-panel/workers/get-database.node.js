"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const fs = require("fs");
const path_1 = require("path");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, send the user the database
    try {
        const dbName = apache_js_workers_1.req.body.dbName;
        const dbPath = path_1.resolve(__dirname + '/../../../' + dbName);
        const dbFile = fs.readFileSync(dbPath, 'utf8');
        const db = JSON.parse(dbFile);
        apache_js_workers_1.res.send(db);
    }
    catch (err) {
        // Send 500 error
        apache_js_workers_1.log('e', err);
        apache_js_workers_1.res.statusCode = 500;
        apache_js_workers_1.res.send('Internal Server Error');
    }
})
    .catch(() => {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
