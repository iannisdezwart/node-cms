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
// Get the suToken from the request
var suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticateSuToken(suToken)
    .then(function () {
    // Authenticated, try to store all files
    var e_1, _a;
    var path = apache_js_workers_1.req.body.path;
    try {
        try {
            for (var _b = __values(apache_js_workers_1.req.files), _c = _b.next(); !_c.done; _c = _b.next()) {
                var file = _c.value;
                var i = 0;
                // Parse File Name and File Extension
                var fileName = file.name.split('.').slice(0, -1).join('.');
                var fileExtension = file.name.split('.').slice(-1).join('');
                // Loop until a non-existing file path is found
                while (true) {
                    // Create suffix for copies
                    var suffix = (i == 0) ? '' : '-' + i.toString();
                    var filePath = path_1.resolve(__dirname + "/../../content" + path + "/" + fileName + suffix + "." + fileExtension);
                    i++;
                    // If the File Path exists, try again
                    if (fs.existsSync(filePath)) {
                        continue;
                    }
                    if (dotDotSlashAttack(filePath)) {
                        // Send 403 error
                        apache_js_workers_1.res.statusCode = 403;
                        apache_js_workers_1.res.send('Forbidden');
                        throw "POSSIBLE DOT-DOT-SLASH ATTACK! user tried to upload to this path: " + filePath;
                    }
                    // Write the file if the File Path does not exist, and break the loop
                    fs.writeFileSync(filePath, file.data);
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        apache_js_workers_1.res.send('Files uploaded!');
    }
    catch (err) {
        // Send 500 error if anything goes wrong and throw the error
        apache_js_workers_1.res.statusCode = 500;
        apache_js_workers_1.res.send('An internal server error occured while uploading the files');
        throw err;
    }
})
    .catch(function () {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
