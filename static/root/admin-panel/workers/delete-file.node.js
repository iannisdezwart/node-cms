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
var authenticateSuToken = require("./../../../private-workers/authenticate-su-token");
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
    // Authenticated, try to delete the file
    try {
        var filePath = path_1.resolve(__dirname + "/../../content" + apache_js_workers_1.req.body.filePath);
        if (dotDotSlashAttack(filePath)) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn("POSSIBLE DOT-DOT-SLASH ATTACK! user tried to delete this file: " + filePath);
            return;
        }
        if (fs.existsSync(filePath)) {
            var stats = fs.statSync(filePath);
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
