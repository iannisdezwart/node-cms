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
var ncp = require("ncp");
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
    // Authenticated, move the files
    var e_2, _a;
    try {
        var sources = apache_js_workers_1.req.body.sources;
        var destination = apache_js_workers_1.req.body.destination;
        if (sources == undefined || destination == undefined) {
            throw new Error("body.sources or body.destination was not provided");
        }
        // Parse destination path
        var destinationDirPath = path_1.resolve(__dirname + '/../../content' + destination);
        if (dotDotSlashAttack(destinationDirPath)) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn("POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy to this file: " + destinationDirPath);
            return;
        }
        var _loop_1 = function (source) {
            // Parse paths
            var sourcePath = path_1.resolve(__dirname + '/../../content' + source);
            var sourceFileName = source.substring(source.lastIndexOf('/') + 1);
            var destinationFilePath = path_1.resolve(destinationDirPath + '/' + sourceFileName);
            if (dotDotSlashAttack(sourcePath)) {
                // Send 403 error
                apache_js_workers_1.res.statusCode = 403;
                apache_js_workers_1.res.send('Forbidden');
                console.warn("POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy this file: " + sourcePath);
                return { value: void 0 };
            }
            if (dotDotSlashAttack(destinationFilePath)) {
                // Send 403 error
                apache_js_workers_1.res.statusCode = 403;
                apache_js_workers_1.res.send('Forbidden');
                console.warn("POSSIBLE DOT-DOT-SLASH ATTACK! user tried to copy to this file: " + destinationFilePath);
                return { value: void 0 };
            }
            if (fs.statSync(sourcePath).isDirectory()) {
                // Prevent circular copying
                // Todo: fix circular copying in a better way
                if (sourcePath == destinationDirPath) {
                    throw new Error("Cannot move a folder into itself. User tried to move " + sourcePath + " into directory " + destinationDirPath);
                }
                ncp(sourcePath, destinationFilePath, function (errors) {
                    var e_3, _a;
                    if (errors != undefined) {
                        try {
                            for (var errors_1 = (e_3 = void 0, __values(errors)), errors_1_1 = errors_1.next(); !errors_1_1.done; errors_1_1 = errors_1.next()) {
                                var err = errors_1_1.value;
                                throw err;
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (errors_1_1 && !errors_1_1.done && (_a = errors_1.return)) _a.call(errors_1);
                            }
                            finally { if (e_3) throw e_3.error; }
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
        };
        try {
            // Copy each source file
            for (var sources_1 = __values(sources), sources_1_1 = sources_1.next(); !sources_1_1.done; sources_1_1 = sources_1.next()) {
                var source = sources_1_1.value;
                var state_1 = _loop_1(source);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (sources_1_1 && !sources_1_1.done && (_a = sources_1.return)) _a.call(sources_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
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
