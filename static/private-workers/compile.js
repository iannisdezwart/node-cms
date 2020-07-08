"use strict";
var child_process_1 = require("child_process");
var compile = function () { return new Promise(function (resolve, reject) {
    var child = child_process_1.execFile('node', [__dirname + '/../compiler'], {
        // Set cwd manually to the site directory, otherwise cwd will be ApacheJS's dir
        cwd: __dirname + '/../'
    });
    // Store stdout and stderr
    var stdout = '';
    var stderr = '';
    child.stdout.on('data', function (data) { return stdout += data; });
    child.stderr.on('data', function (data) { return stderr += data; });
    child.on('close', function (code) {
        if (code != 0) {
            reject({ stdout: stdout, stderr: stderr });
        }
        resolve(stdout);
    });
}); };
module.exports = compile;
