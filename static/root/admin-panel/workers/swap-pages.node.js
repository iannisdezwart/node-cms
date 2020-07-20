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
    // Authenticated, try to swap the pages
    try {
        const page1 = apache_js_workers_1.req.body.page1;
        const page2 = apache_js_workers_1.req.body.page2;
        const pagesDB = node_json_database_1.db(__dirname + '/../../../pages.json');
        const pagesTable = pagesDB.table('pages');
        // Get the page records from the database
        const page1Record = pagesTable.get().where(row => row.id == page1.id).rows[0];
        const page2Record = pagesTable.get().where(row => row.id == page2.id).rows[0];
        // Swap the IDs
        const page1ID = page1Record.id;
        page1Record.id = page2Record.id;
        page2Record.id = page1ID;
        // Update the page records
        pagesTable.update(page2Record, row => row.id == page1.id);
        pagesTable.update(page1Record, row => row.id == page2.id);
        // Compile the website
        compile_1.compile()
            .then(() => {
            apache_js_workers_1.res.send('Succesfully swapped page order!');
        })
            .catch(err => {
            throw err;
        });
    }
    catch (err) {
        console.error(`Error while swapping pages: ${err}`);
        // Send 500 error
        apache_js_workers_1.res.statusCode = 500;
        apache_js_workers_1.res.send('Forbidden');
    }
})
    .catch(() => {
    // Send 403 error
    apache_js_workers_1.res.statusCode = 403;
    apache_js_workers_1.res.send('Forbidden');
});
