"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const path_1 = require("path");
const fs = require("fs");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
const security_1 = require("./../../../private-workers/security");
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, try to store all files
    const path = apache_js_workers_1.req.body.path;
    try {
        for (let file of apache_js_workers_1.req.files) {
            let i = 0;
            // Parse File Name and File Extension
            const fileName = file.name.split('.').slice(0, -1).join('.');
            const fileExtension = file.name.split('.').slice(-1).join('');
            // Loop until a non-existing file path is found
            while (true) {
                // Create suffix for copies
                const suffix = (i == 0) ? '' : '-' + i.toString();
                const filePath = path_1.resolve(`${__dirname}/../../content${path}/${fileName}${suffix}.${fileExtension}`);
                i++;
                // If the File Path exists, try again
                if (fs.existsSync(filePath)) {
                    continue;
                }
                if (!security_1.filePathIsSafe(filePath, __dirname + '/../../')) {
                    // Send 403 error
                    apache_js_workers_1.res.statusCode = 403;
                    apache_js_workers_1.res.send('Forbidden');
                    throw `POSSIBLE DOT-DOT-SLASH ATTACK! user tried to upload to this path: ${filePath}`;
                }
                // Write the file if the File Path does not exist, and break the loop
                fs.copyFileSync(file.tempPath, filePath);
                break;
            }
        }
        apache_js_workers_1.res.send('Files uploaded!');
    }
    catch (err) {
        // Send 500 error if anything goes wrong and throw the error
        apache_js_workers_1.res.statusCode = 500;
        apache_js_workers_1.res.send('An internal server error occured while uploading the files');
    }
})
    .catch(() => {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
