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
    // Authenticated, send the user the database list
    try {
        const dbPathListFilePath = path_1.resolve(__dirname + '/../../../databases.json');
        const dbPathListFile = fs.readFileSync(dbPathListFilePath, 'utf8');
        const dbPathList = JSON.parse(dbPathListFile);
        const dbList = [];
        for (let dbPath of dbPathList) {
            const dbFilePath = path_1.resolve(__dirname + '/../../../' + dbPath);
            const dbFileStats = fs.statSync(dbFilePath);
            dbList.push({
                name: dbPath,
                size: dbFileStats.size,
                modified: dbFileStats.mtime
            });
        }
        apache_js_workers_1.res.send(dbList);
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
