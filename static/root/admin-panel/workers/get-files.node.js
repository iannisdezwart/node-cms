"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const path_1 = require("path");
const fs = require("fs");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
const security_1 = require("./../../../private-workers/security");
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
// Verify the suToken
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated
    const reqPath = apache_js_workers_1.req.body.path;
    const path = path_1.resolve(__dirname + '/../../content' + reqPath);
    if (!security_1.filePathIsSafe(path, __dirname + '/../../')) {
        // Send 403 error
        apache_js_workers_1.res.statusCode = 403;
        apache_js_workers_1.res.send('Forbidden');
        console.warn(`POSSIBLE DOT-DOT-SLASH ATTACK! user requested this path: ${path}`);
        return;
    }
    // Get files
    const fileNames = fs.readdirSync(path);
    const files = [];
    for (let fileName of fileNames) {
        const stats = fs.statSync(path + '/' + fileName);
        files.push({
            name: fileName,
            path: path_1.resolve(reqPath) + '/' + fileName,
            isDirectory: stats.isDirectory(),
            filesInside: stats.isDirectory() ? fs.readdirSync(path + '/' + fileName).length : 0,
            size: stats.isDirectory() ? 0 : stats.size,
            modified: stats.mtime
        });
    }
    apache_js_workers_1.res.send({ files });
})
    .catch(() => {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
