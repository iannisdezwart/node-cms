"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const node_json_database_1 = require("node-json-database");
const authenticate_su_token_1 = require("./../../../../private-workers/authenticate-su-token");
const bcrypt = require("bcrypt");
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
const userID = apache_js_workers_1.req.body.userID;
const oldPassword = apache_js_workers_1.req.body.oldPassword;
const newPassword = apache_js_workers_1.req.body.newPassword;
// Authenticate
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, try to change the user's password
    try {
        const userDB = node_json_database_1.db(__dirname + '/../../../../users.json');
        const adminTable = userDB.table('admins');
        const entries = adminTable.get().where(row => row.userID == userID);
        if (entries.length == 1
            && bcrypt.compareSync(oldPassword, entries.rows[0].password)) {
            adminTable.update({
                password: bcrypt.hashSync(newPassword, 12)
            }, row => row.userID == userID);
            apache_js_workers_1.res.send('Updated Password!');
        }
        else {
            apache_js_workers_1.res.statusCode = 409;
            apache_js_workers_1.res.send('The given current password was incorrect. Please Try again.');
        }
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
