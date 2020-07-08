"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apache_js_workers_1 = require("apache-js-workers");
var path_1 = require("path");
var fs = require("fs");
var authenticateSuToken = require("../../../private-workers/authenticate-su-token");
var qcd = require("queued-copy-dir");
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
    // Authenticated, copy the file
    try {
        var source = apache_js_workers_1.req.body.source;
        var destination = apache_js_workers_1.req.body.destination;
        if (source == undefined || destination == undefined) {
            throw new Error("body.source or body.destination was not provided");
        }
        // Parse paths
        var sourcePath = path_1.resolve(__dirname + '/../../content' + source);
        var destinationPath = path_1.resolve(__dirname + '/../../content' + destination);
        // Security
        if (dotDotSlashAttack(sourcePath)) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn("POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy this file: " + sourcePath);
            return;
        }
        if (dotDotSlashAttack(destinationPath)) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn("POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy to this file: " + destinationPath);
            return;
        }
        if (fs.statSync(sourcePath).isDirectory()) {
            qcd.async(sourcePath, destinationPath)
                .catch(function (err) {
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
    .catch(function () {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
