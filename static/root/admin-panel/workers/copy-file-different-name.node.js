"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const path_1 = require("path");
const fs = require("fs");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
const qcd = require("queued-copy-dir");
const security_1 = require("./../../../private-workers/security");
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, copy the file
    try {
        const source = apache_js_workers_1.req.body.source;
        const destination = apache_js_workers_1.req.body.destination;
        if (source == undefined || destination == undefined) {
            throw new Error(`body.source or body.destination was not provided`);
        }
        // Parse paths
        const sourcePath = path_1.resolve(__dirname + '/../../content' + source);
        const destinationPath = path_1.resolve(__dirname + '/../../content' + destination);
        // Security
        if (!security_1.filePathIsSafe(sourcePath, __dirname + '/../../')) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy this file: ${sourcePath}`);
            return;
        }
        if (!security_1.filePathIsSafe(destinationPath, __dirname + '/../../')) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy to this file: ${destinationPath}`);
            return;
        }
        if (fs.statSync(sourcePath).isDirectory()) {
            qcd.async(sourcePath, destinationPath)
                .catch(err => {
                throw err;
            });
        }
        else {
            fs.copyFileSync(sourcePath, destinationPath);
        }
        apache_js_workers_1.res.send('Successfully copied file');
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
