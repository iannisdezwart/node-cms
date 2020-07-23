"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_query_1 = require("./../../../../../private-workers/database-query");
const apache_js_workers_1 = require("apache-js-workers");
const dbName = apache_js_workers_1.req.body.dbName;
const tableName = apache_js_workers_1.req.body.tableName;
let orderArr = apache_js_workers_1.req.body.orderArr;
if (orderArr == undefined)
    orderArr = [];
database_query_1.queryTable(dbName, tableName, tableFn => {
    const table = tableFn.get();
    const orderedTable = table.orderBy(orderArr);
    const { rows, cols } = orderedTable;
    const { data } = tableFn;
    apache_js_workers_1.res.send({ rows, cols, data });
})
    .catch(err => {
    database_query_1.handleError(err);
});
