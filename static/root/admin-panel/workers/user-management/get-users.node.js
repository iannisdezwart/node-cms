"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const node_json_database_1 = require("node-json-database");
const authenticate_su_token_1 = require("./../../../../private-workers/authenticate-su-token");
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, try to get the users
    try {
        const userDB = node_json_database_1.db(__dirname + '/../../../../users.json');
        const adminTable = userDB.table('admins');
        const users = [];
        for (let user of adminTable.get().rows) {
            users.push({
                id: user.userID,
                name: user.username
            });
        }
        apache_js_workers_1.res.send(JSON.stringify(users));
    }
    catch (err) {
        apache_js_workers_1.res.statusCode = 500;
        apache_js_workers_1.res.send('Internal Server Error');
        apache_js_workers_1.log('e', err);
    }
})
    .catch(() => {
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
