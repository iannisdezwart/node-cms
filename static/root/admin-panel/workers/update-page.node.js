"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apache_js_workers_1 = require("apache-js-workers");
const node_json_database_1 = require("node-json-database");
const authenticate_su_token_1 = require("./../../../private-workers/authenticate-su-token");
const compile_1 = require("./../../../private-workers/compile");
// Get the suToken from the request
const suToken = apache_js_workers_1.req.body.suToken;
// Authenticate
authenticate_su_token_1.authenticateSuToken(suToken)
    .then(() => {
    // Authenticated, try to update the page in the database
    try {
        const pageId = apache_js_workers_1.req.body.pageId;
        const pageContent = apache_js_workers_1.req.body.pageContent;
        const pagesDB = node_json_database_1.db(__dirname + '/../../../pages.json');
        const pagesTable = pagesDB.table('pages');
        // Get the current page from the database
        const page = pagesTable.get().where(row => row.id == pageId).rows[0];
        page.pageContent = pageContent;
        // Update the record
        pagesTable.update(page, row => row.id == pageId);
        // Compile the website
        compile_1.compile()
            .then(() => {
            apache_js_workers_1.res.send('Succesfully stored page!');
        })
            .catch(err => {
            console.log(err);
            throw err;
        });
    }
    catch (err) {
        // Send 500 error
        apache_js_workers_1.res.statusCode = 500;
        apache_js_workers_1.res.send('An internal server error occured while updating the page');
        throw err;
    }
})
    .catch(() => {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
