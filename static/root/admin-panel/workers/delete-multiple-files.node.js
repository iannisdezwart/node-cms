"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const path_1 = require("path");
const fs = require("fs");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
// Dot-dot-slash attack prevention
const dotDotSlashAttack = (path) => {
    const resolvedPath = path_1.resolve(path);
    const rootPath = path_1.resolve(__dirname + '/../../content');
    if (!resolvedPath.startsWith(rootPath)) {
        return true;
    }
    return false;
};
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
    // Authenticated, try to delete the file
    try {
        const filePaths = apache_js_workers_1.req.body.filePaths;
        for (let filePath of filePaths) {
            filePath = path_1.resolve(`${__dirname}/../../content${filePath}`);
            if (dotDotSlashAttack(filePath)) {
                // Send 403 error
                apache_js_workers_1.res.statusCode = 403;
                apache_js_workers_1.res.send('Forbidden');
                console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user tried to delete this file: ${filePath}`);
                return;
            }
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    rimraf(filePath);
                    apache_js_workers_1.res.send('Sucesssfully deleted the directory');
                }
                else {
                    fs.unlinkSync(filePath);
                    apache_js_workers_1.res.send('Sucesssfully deleted the file');
                }
            }
            else {
                // Send 500 error
                apache_js_workers_1.res.statusCode = 500;
                apache_js_workers_1.res.send('File does not exist');
            }
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
