"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const fs = require("fs");
const chalk = require("chalk");
const node_json_database_1 = require("node-json-database");
const child_process_1 = require("child_process");
exports.compile = async (pageCompilers) => {
    // Store start time
    const start = Date.now();
    // Write the ./root directory if it does not exist
    if (!fs.existsSync('root')) {
        fs.mkdirSync('root');
    }
    // Create database if it does not exist
    const pagesDB = node_json_database_1.db('pages.json');
    if (!pagesDB.exists) {
        await install();
    }
    else {
        // Create pageTypes table if it does not exist
        if (!pagesDB.table('pageTypes').exists || !pagesDB.table('pages').exists) {
            await install();
        }
    }
    // Get tables
    const pageTypesTable = pagesDB.table('pageTypes').get();
    const pagesTable = pagesDB.table('pages').get();
    // Compile all pages
    const compilePage = (page) => {
        // Create directory, if needed
        const directory = getDirectory('./root' + page.path);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
            console.log(`${chalk.green('✔')} Created directory: ${chalk.yellow(directory)}`);
        }
        // Write the file
        fs.writeFileSync('./root' + page.path, page.html);
        console.log(`${chalk.green('✔')} Wrote file: ${chalk.yellow('./root' + page.path)}`);
    };
    for (let pageType of pageTypesTable.rows) {
        const pageCompiler = pageCompilers[pageType.name];
        if (!pageType.canAdd || pageType.compileSubPages) {
            // Compile all subpages
            const pages = pagesTable.where(row => row.pageType == pageType.name).rows;
            for (let i = 0; i < pages.length; i++) {
                const page = pageCompiler(pages[i].pageContent, pagesTable);
                compilePage(page);
            }
        }
        else {
            // Compile as one page
            const page = pageCompiler({}, pagesTable);
            compilePage(page);
        }
    }
    console.log(`${chalk.green('✔')} Finished compilation in ${Date.now() - start}ms`);
};
const getDirectory = (path) => {
    let currentChar = path.charAt(path.length - 1);
    while (currentChar != '/' && path.length > 0) {
        path = path.slice(0, path.length - 1);
        currentChar = path.charAt(path.length - 1);
    }
    return path;
};
const install = () => new Promise(resolve => {
    const installer = child_process_1.spawn('node', ['./install']);
    installer.on('close', resolve);
});
