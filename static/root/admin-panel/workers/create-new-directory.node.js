"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const path_1 = require("path");
const fs = require("fs");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
const security_1 = require("./../../../private-workers/security");
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, create directory
    try {
        const newDirectoryPathIn = apache_js_workers_1.req.body.newDirectoryPath;
        const newDirectoryPath = path_1.resolve(__dirname + '/../../content' + newDirectoryPathIn);
        // Security
        if (!security_1.filePathIsSafe(newDirectoryPath, __dirname + '/../../')) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to create this directory: ${newDirectoryPath}`);
            return;
        }
        fs.mkdirSync(newDirectoryPath);
        apache_js_workers_1.res.send('Succesfully created new directory');
    }
    catch (err) {
        // Send 500 error
        apache_js_workers_1.res.statusCode = 500;
        apache_js_workers_1.res.send('Internal server error');
        console.error(err);
    }
})
    .catch(() => {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
