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
var fs = require("fs");
var chalk = require("chalk");
var node_json_database_1 = require("node-json-database");
// Write the ./root directory if it does not exist
if (!fs.existsSync('root')) {
    fs.mkdirSync('root');
}
var pagesDB = node_json_database_1.db('pages.json');
// Create database if it does not exist
if (!pagesDB.exists) {
    pagesDB.create();
}
// Create pageTypes table if it does not exist
if (!pagesDB.table('pageTypes').exists) {
    var table = pagesDB.table('pageTypes');
    table.create();
    table.columns.add([
        {
            name: 'name',
            dataType: 'String',
            constraints: [
                'primaryKey'
            ]
        },
        {
            name: 'template',
            dataType: 'JSON',
            constraints: [
                'notNull'
            ]
        },
        {
            name: 'canAdd',
            dataType: 'Boolean'
        }
    ]);
}
// Create pages table if it does not exist
if (!pagesDB.table('pages').exists) {
    var table = pagesDB.table('pages');
    table.create();
    table.columns.add([
        {
            name: 'id',
            dataType: 'Int',
            constraints: [
                'primaryKey',
                'autoIncrement'
            ]
        },
        {
            name: 'pageType',
            dataType: 'String',
            foreignKey: {
                table: 'pageTypes',
                column: 'name'
            }
        },
        {
            name: 'pageContent',
            dataType: 'JSON',
            constraints: [
                'notNull'
            ]
        }
    ]);
}
var pageTypesTable = pagesDB.table('pageTypes').get();
var pagesTable = pagesDB.table('pages').get();
exports.compile = function (compilePage) {
    // Store start time
    var e_1, _a;
    var start = Date.now();
    var _loop_1 = function (pageType) {
        var pages = pagesTable.where(function (row) { return row.pageType == pageType.name; }).rows;
        for (var i = 0; i < pages.length; i++) {
            var pageCompiler = compilePage[pageType.name];
            var page = pageCompiler(pages[i].pageContent, pagesTable);
            // Create directory, if needed
            var directory = getDirectory('./root' + page.path);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory);
                console.log(chalk.green('✔') + " Created directory: " + chalk.yellow(directory));
            }
            // Write the file
            fs.writeFileSync('./root' + page.path, page.html);
            console.log(chalk.green('✔') + " Wrote file: " + chalk.yellow('./root' + page.path));
        }
    };
    try {
        // Compile all pages
        for (var _b = __values(pageTypesTable.rows), _c = _b.next(); !_c.done; _c = _b.next()) {
            var pageType = _c.value;
            _loop_1(pageType);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    console.log(chalk.green('✔') + " Finished compilation in " + (Date.now() - start) + "ms");
};
var getDirectory = function (path) {
    var currentChar = path.charAt(path.length - 1);
    while (currentChar != '/' && path.length > 0) {
        path = path.slice(0, path.length - 1);
        currentChar = path.charAt(path.length - 1);
    }
    return path;
};
