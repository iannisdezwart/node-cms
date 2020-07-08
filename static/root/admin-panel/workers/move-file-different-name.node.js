"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
// Recursive rimraf
var rimraf = function (parentPath) {
    var e_1, _a;
    if (fs.existsSync(parentPath)) {
        var files = fs.readdirSync(parentPath);
        try {
            for (var files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                var file = files_1_1.value;
                var childPath = parentPath + '/' + file;
                var stats = fs.statSync(childPath);
                if (stats.isDirectory()) {
                    rimraf(childPath);
                }
                else {
                    fs.unlinkSync(childPath);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        fs.rmdirSync(parentPath);
    }
};
// Get the suToken from the request
var suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticateSuToken(suToken)
    .then(function () {
    // Authenticated, move the file
    try {
        var source = apache_js_workers_1.req.body.source;
        var destination = apache_js_workers_1.req.body.destination;
        if (source == undefined || destination == undefined) {
            throw new Error("body.source or body.destination was not provided");
        }
        // Parse paths
        var sourcePath_1 = path_1.resolve(__dirname + '/../../content' + source);
        var destinationPath = path_1.resolve(__dirname + '/../../content' + destination);
        // Security
        if (dotDotSlashAttack(sourcePath_1)) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn("POSSIBLE DOT-DOT-SLASH ATTACK! user tried to move this file: " + sourcePath_1);
            return;
        }
        if (dotDotSlashAttack(destinationPath)) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn("POSSIBLE DOT-DOT-SLASH ATTACK! user tried to move to this file: " + destinationPath);
            return;
        }
        if (fs.statSync(sourcePath_1).isDirectory()) {
            // Prevent circular moving
            // Get Destination directory path
            var destinationDirPath = path_1.resolve(destinationPath.substring(0, destinationPath.lastIndexOf('/') + 1));
            if (sourcePath_1 == destinationDirPath) {
                throw new Error("Cannot move a folder into itself. User tried to move " + sourcePath_1 + " into directory " + destinationDirPath);
            }
            qcd.async(sourcePath_1, destinationPath)
                .then(function () {
                // Recursively delete the source folder after it has been copied
                rimraf(sourcePath_1);
            })
                .catch(function (err) {
                throw err;
            });
        }
        else {
            fs.copyFileSync(sourcePath_1, destinationPath);
            // Delete the source file
            fs.unlinkSync(sourcePath_1);
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
    .catch(function () {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
