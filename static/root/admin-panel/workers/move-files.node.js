"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const path_1 = require("path");
const fs = require("fs");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
const ncp = require("ncp");
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
    // Authenticated, move the files
    try {
        const sources = apache_js_workers_1.req.body.sources;
        const destination = apache_js_workers_1.req.body.destination;
        if (sources == undefined || destination == undefined) {
            throw new Error(`body.sources or body.destination was not provided`);
        }
        // Parse destination path
        const destinationDirPath = path_1.resolve(__dirname + '/../../content' + destination);
        if (!security_1.filePathIsSafe(destinationDirPath, __dirname + '/../../')) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy to this file: ${destinationDirPath}`);
            return;
        }
        // Copy each source file
        for (let source of sources) {
            // Parse paths
            const sourcePath = path_1.resolve(__dirname + '/../../content' + source);
            const sourceFileName = source.substring(source.lastIndexOf('/') + 1);
            const destinationFilePath = path_1.resolve(destinationDirPath + '/' + sourceFileName);
            if (!security_1.filePathIsSafe(sourcePath, __dirname + '/../../')) {
                // Send 403 error
                apache_js_workers_1.res.statusCode = 403;
                apache_js_workers_1.res.send('Forbidden');
                console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy this file: ${sourcePath}`);
                return;
            }
            if (!security_1.filePathIsSafe(destinationFilePath, __dirname + '/../../')) {
                // Send 403 error
                apache_js_workers_1.res.statusCode = 403;
                apache_js_workers_1.res.send('Forbidden');
                console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy to this file: ${destinationFilePath}`);
                return;
            }
            if (fs.statSync(sourcePath).isDirectory()) {
                // Prevent circular copying
                // Todo: fix circular copying in a better way
                if (sourcePath == destinationDirPath) {
                    throw new Error(`Cannot move a folder into itself. User tried to move ${sourcePath} into directory ${destinationDirPath}`);
                }
                ncp(sourcePath, destinationFilePath, errors => {
                    if (errors != undefined) {
                        for (let err of errors) {
                            throw err;
                        }
                    }
                    // Recursively delete the source folder after it has been copied
                    rimraf(sourcePath);
                });
            }
            else {
                fs.copyFileSync(sourcePath, destinationFilePath);
                // Delete the source file
                fs.unlinkSync(sourcePath);
            }
            apache_js_workers_1.res.send('Successfully copied files');
        }
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
