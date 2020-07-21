"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
const node_json_database_1 = require("node-json-database");
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, update database
    const dbName = apache_js_workers_1.req.body.dbName;
    const tableName = apache_js_workers_1.req.body.tableName;
    const rowNum = apache_js_workers_1.req.body.rowNum;
    const newRow = apache_js_workers_1.req.body.row;
    const database = node_json_database_1.db(__dirname + '/../../../' + dbName);
    if (!database.exists) {
        // Send 400 error
        apache_js_workers_1.res.statusCode = 400;
        apache_js_workers_1.res.send(`Bad Request: Database '${dbName}' was not found`);
        return;
    }
    const table = database.table(tableName);
    if (!table.exists) {
        // Send 400 error
        apache_js_workers_1.res.statusCode = 400;
        apache_js_workers_1.res.send(`Bad Request: Table '${tableName}' was not found in database '${tableName}'`);
        return;
    }
    try {
        table.update(newRow, row => {
            console.log(row);
            return row.rowNum == rowNum;
        });
    }
    catch (err) {
        // Send 500 error
        apache_js_workers_1.res.statusCode = 500;
        apache_js_workers_1.res.send(`Internal Server Error`);
        apache_js_workers_1.log('e', err);
        return;
    }
    // Send 200
    apache_js_workers_1.res.send('Updated table row');
})
    .catch(() => {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
