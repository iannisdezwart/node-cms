"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_query_1 = require("../../../../private-workers/database-query");
const apache_js_workers_1 = require("apache-js-workers");
const dbName = apache_js_workers_1.req.body.dbName;
database_query_1.queryDatabase(dbName, db => {
    const tables = db.getTables();
    const info = {};
    for (let tableName of tables) {
        const table = db.table(tableName);
        info[tableName] = {
            rowCount: table.rowCount,
            colCount: table.colCount
        };
    }
    apache_js_workers_1.res.send(info);
})
    .catch(err => {
    database_query_1.handleError(err);
});
