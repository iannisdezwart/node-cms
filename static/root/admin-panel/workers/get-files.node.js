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
var jwt = require("jsonwebtoken");
// Dot-dot-slash attack prevention
var dotDotSlashAttack = function (path) {
    var resolvedPath = path_1.resolve(path);
    var rootPath = path_1.resolve(__dirname + '/../../content');
    if (!resolvedPath.startsWith(rootPath)) {
        return true;
    }
    return false;
};
// Get the token from the request
var token = apache_js_workers_1.req.body.token;
var jwtSecret = fs.readFileSync(__dirname + '/../../../.jwtsecret', 'utf-8');
// Verify the token
jwt.verify(token, jwtSecret, function (err) {
    var e_1, _a;
    if (!err) {
        // Authenticated
        var reqPath = apache_js_workers_1.req.body.path;
        var path = path_1.resolve(__dirname + '/../../content' + reqPath);
        if (dotDotSlashAttack(path)) {
            // Send 403 error
            apache_js_workers_1.res.statusCode = 403;
            apache_js_workers_1.res.send('Forbidden');
            console.warn("POSSIBLE DOT-DOT-SLASH ATTACK! user requested this path: " + path);
            return;
        }
        // Get files
        var fileNames = fs.readdirSync(path);
        var files = [];
        try {
            for (var fileNames_1 = __values(fileNames), fileNames_1_1 = fileNames_1.next(); !fileNames_1_1.done; fileNames_1_1 = fileNames_1.next()) {
                var fileName = fileNames_1_1.value;
                var stats = fs.statSync(path + '/' + fileName);
                files.push({
                    name: fileName,
                    path: path_1.resolve(reqPath) + '/' + fileName,
                    isDirectory: stats.isDirectory(),
                    filesInside: stats.isDirectory() ? fs.readdirSync(path + '/' + fileName).length : 0,
                    size: stats.isDirectory() ? 0 : stats.size,
                    modified: stats.mtime
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (fileNames_1_1 && !fileNames_1_1.done && (_a = fileNames_1.return)) _a.call(fileNames_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        apache_js_workers_1.res.send({ files: files });
    }
    else {
        // Send 403 error
        apache_js_workers_1.res.statusCode = 403;
        apache_js_workers_1.res.send('Forbidden');
    }
});
