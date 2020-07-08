"use strict";
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
    var path = apache_js_workers_1.req.body.path;
    try {
        for (var fileIndex in apache_js_workers_1.req.files) {
            var file = apache_js_workers_1.req.files[fileIndex];
            var i = 0;
            // Parse File Name and File Extension
            var fileName = file.name.split('.').slice(0, -1).join('.');
            var fileExtension = file.name.split('.').slice(-1).join('');
            // Loop until a non-existing file path is found
            while (true) {
                // Create suffix for copies
                var suffix = (i == 0) ? '' : '-' + i.toString();
                var filePath = __dirname + "/../../content" + path + "/" + fileName + suffix + "." + fileExtension;
                i++;
                // If the File Path exists, try again
                if (fs.existsSync(filePath)) {
                    continue;
                }
                if (dotDotSlashAttack(filePath)) {
                    // Send 403 error
                    apache_js_workers_1.res.statusCode = 403;
                    apache_js_workers_1.res.send('Forbidden');
                    console.warn("POSSIBLE DOT-DOT-SLASH ATTACK! user tried to upload to this path: " + filePath);
                    return;
                }
                // Write the file if the File Path does not exist, and break the loop
                fs.writeFileSync(filePath, file.data);
                break;
            }
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
