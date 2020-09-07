"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const path_1 = require("path");
const fs = require("fs");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
const qcd = require("queued-copy-dir");
const security_1 = require("./../../../private-workers/security");
// Recursive rimraf
const rimraf = (parentPath) => {
    if (fs.existsSync(parentPath)) {
        const files = fs.readdirSync(parentPath);
        for (let file of files) {
            const childPath = parentPath + '/' + file;
            const stats = fs.statSync(childPath);
            if (stats.isDirectory()) {
                rimraf(childPath);
            }
            else {
                fs.unlinkSync(childPath);
            }
        }
        fs.rmdirSync(parentPath);
    }
};
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, move the file
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
            console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to move this file: ${sourcePath}`);
            return;
        }
        if (!security_1.filePathIsSafe(destinationPath, __dirname + '/../../')) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to move to this file: ${destinationPath}`);
            return;
        }
        if (fs.statSync(sourcePath).isDirectory()) {
            // Prevent circular moving
            // Get Destination directory path
            const destinationDirPath = path_1.resolve(destinationPath.substring(0, destinationPath.lastIndexOf('/') + 1));
            if (sourcePath == destinationDirPath) {
                throw new Error(`Cannot move a folder into itself. User tried to move ${sourcePath} into directory ${destinationDirPath}`);
            }
            qcd.async(sourcePath, destinationPath)
                .then(() => {
                // Recursively delete the source folder after it has been copied
                rimraf(sourcePath);
            })
                .catch(err => {
                throw err;
            });
        }
        else {
            fs.copyFileSync(sourcePath, destinationPath);
            // Delete the source file
            fs.unlinkSync(sourcePath);
        }
        apache_js_workers_1.res.send('Successfully moved file');
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
