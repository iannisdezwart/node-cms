"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.queryTable = exports.queryDatabase = void 0;
const apache_js_workers_1 = require("apache-js-workers");
const authenticate_su_token_1 = require("./authenticate-su-token");
const node_json_database_1 = require("node-json-database");
class QueryError extends Error {
    constructor(code, message = '') {
        super(message);
        this.code = code;
        this.name = 'QueryError';
    }
}
exports.queryDatabase = (dbName, queryCallback) => new Promise((resolve, reject) => {
    // Get the suToken from the request
    const suToken = apache_js_workers_1.req.body.suToken;
    authenticate_su_token_1.authenticateSuToken(suToken)
        .then(() => {
        // Authenticated, execute query
        const database = node_json_database_1.db(__dirname + '/../' + dbName, {
            safeAndFriendlyErrors: true
        });
        if (!database.exists) {
            reject(new QueryError(400, `Database '${dbName}' was not found`));
        }
        try {
            // Run the callback, which should contain the queries
            queryCallback(database);
        }
        catch (err) {
            reject(new QueryError(500, err.message));
        }
        // Query ran successfully
        resolve();
    })
        .catch(() => {
        reject(new QueryError(403));
    });
});
exports.queryTable = (dbName, tableName, queryCallback) => new Promise((resolve, reject) => {
    // Get the suToken from the request
    const suToken = apache_js_workers_1.req.body.suToken;
    authenticate_su_token_1.authenticateSuToken(suToken)
        .then(() => {
        // Authenticated, execute query
        const database = node_json_database_1.db(__dirname + '/../' + dbName, {
            safeAndFriendlyErrors: true
        });
        if (!database.exists) {
            reject(new QueryError(400, `Database '${dbName}' was not found`));
        }
        const table = database.table(tableName);
        if (!table.exists) {
            reject(new QueryError(400, `Table '${tableName}' was not found in database '${tableName}'`));
        }
        try {
            // Run the callback, which should contain the queries
            queryCallback(table);
        }
        catch (err) {
            reject(new QueryError(500, err.message));
        }
        // Query ran successfully
        resolve();
    })
        .catch(() => {
        reject(new QueryError(403));
    });
});
exports.handleError = (err) => {
    apache_js_workers_1.res.statusCode = err.code;
    apache_js_workers_1.log('e', err.toString());
    if (err.code == 400) {
        apache_js_workers_1.res.send('Bad Request: ' + err.message);
    }
    else if (err.code == 403) {
        apache_js_workers_1.res.send('Forbidden');
    }
    else if (err.code == 500) {
        apache_js_workers_1.res.send('Database Error: ' + err.message);
    }
    else {
        apache_js_workers_1.res.send('Unhandled Error: ' + err.message);
    }
};
