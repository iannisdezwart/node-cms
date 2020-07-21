"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_query_1 = require("./../../../private-workers/database-query");
const apache_js_workers_1 = require("apache-js-workers");
const dbName = apache_js_workers_1.req.body.dbName;
const tableName = apache_js_workers_1.req.body.tableName;
const rowNum = apache_js_workers_1.req.body.rowNum;
const newRow = apache_js_workers_1.req.body.newRow;
database_query_1.queryTable(dbName, tableName, table => table.update(newRow, row => row.rowNum == rowNum))
    .then(() => {
    apache_js_workers_1.res.send('Row updated');
})
    .catch(err => {
    database_query_1.handleError(err);
});
