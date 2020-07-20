"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const fs = require("fs");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, send the user the databases
    try {
        const dbListFile = fs.readFileSync(__dirname + '/../../../databases.json', 'utf8');
        const dbList = JSON.parse(dbListFile);
        const dbs = [];
        for (let dbName of dbList) {
            const dbFile = fs.readFileSync(__dirname + '/../../../' + dbName, 'utf-8');
            const db = JSON.parse(dbFile);
            dbs.push(db);
        }
        apache_js_workers_1.res.send(dbs);
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
