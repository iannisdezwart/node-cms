"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const node_json_database_1 = require("node-json-database");
const authenticate_su_token_1 = require("./../../../../private-workers/authenticate-su-token");
const bcrypt = require("bcrypt");
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
const username = apache_js_workers_1.req.body.username;
const password = apache_js_workers_1.req.body.password;
// Authenticate
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, try to delete the user
    try {
        const userDB = node_json_database_1.db(__dirname + '/../../../../users.json');
        const adminTable = userDB.table('admins');
        adminTable.insert([{
                username,
                password: bcrypt.hashSync(password, 12),
                adminLevel: 'normal'
            }]);
        apache_js_workers_1.res.send('Added user!');
    }
    catch (err) {
        apache_js_workers_1.res.statusCode = 500;
        apache_js_workers_1.res.send('Internal Server Error');
        console.log(err);
        apache_js_workers_1.log('e', err);
    }
})
    .catch(() => {
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
