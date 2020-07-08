"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apache_js_workers_1 = require("apache-js-workers");
var path_1 = require("path");
var fs = require("fs");
var authenticateSuToken = require("../../../private-workers/authenticate-su-token");
// Dot-dot-slash attack prevention
var dotDotSlashAttack = function (path) {
    var resolvedPath = path_1.resolve(path);
    var rootPath = path_1.resolve(__dirname + '/../../content');
    if (!resolvedPath.startsWith(rootPath)) {
        return true;
    }
    return false;
};
// Get the suToken from the request
var suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticateSuToken(suToken)
    .then(function () {
    // Authenticated, create directory
    try {
        var newDirectoryPathIn = apache_js_workers_1.req.body.newDirectoryPath;
        var newDirectoryPath = path_1.resolve(__dirname + '/../../content' + newDirectoryPathIn);
        // Security
        if (dotDotSlashAttack(newDirectoryPath)) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn("POSSIBLE DOT-DOT-SLASH ATTACK! user tried to create this directory: " + newDirectoryPath);
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
    .catch(function () {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
