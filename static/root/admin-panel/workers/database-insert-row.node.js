"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_query_1 = require("./../../../private-workers/database-query");
const apache_js_workers_1 = require("apache-js-workers");
const dbName = apache_js_workers_1.req.body.dbName;
const tableName = apache_js_workers_1.req.body.tableName;
const newRow = apache_js_workers_1.req.body.newRow;
database_query_1.queryTable(dbName, tableName, table => table.insert([newRow]))
    .then(() => {
    apache_js_workers_1.res.send('Row inserted');
})
    .catch(err => {
    database_query_1.handleError(err);
});
