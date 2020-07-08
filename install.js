"use strict";
/*

    ======= Info =======

    " This file will install and create
        the directory tree of NodeCMS.
        It is run when NodeCMS gets installed
        by NPM (`npm install @iannisz/node-cms`).

    ======= Table of Contents =======

    1. Imports and functions
        1.1 Recursive rimraf
        1.2 Random String

    2. Creation of directory tree

*/
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
/* ===================
    1. Imports and functions
=================== */
var fs = require("fs");
var qcd = require("queued-copy-dir");
var node_json_database_1 = require("node-json-database");
/*
    1.1 Recursive rimraf
*/
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
var randomCharSets = {
    lowerCaseAlphabetical: 'abcdefghijklmnopqrstuvwxyz',
    upperCaseAlphabetical: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    underscore: '_',
    dash: '-',
    numbers: '0123456789',
    upperKeyboardRowSymbols: '!@#$%^&*()+=',
    rightSideKeyboardSymbolsExclQuotes: '[{]}|\\;:,<.>/?',
    quotes: '\'"'
};
var randomString = function (length, sets) {
    sets = __assign({
        lowerCaseAlphabetical: true,
        upperCaseAlphabetical: true,
        underscore: true,
        dash: true,
        numbers: true,
        upperKeyboardRowSymbols: false,
        rightSideKeyboardSymbolsExclQuotes: false,
        quotes: false
    }, sets);
    var chars = '';
    for (var set in sets) {
        if (sets[set]) {
            chars += randomCharSets[set];
        }
    }
    var string = '';
    for (var i = 0; i < length; i++) {
        string += chars.charAt(randomIntBetween(0, chars.length - 1));
    }
    return string;
};
var randomIntBetween = function (min, max) { return Math.floor(Math.random() * (max - min + 1) + min); };
/* ===================
    2. Creation of directory tree
=================== */
// Create ./root directory
if (!fs.existsSync('root')) {
    fs.mkdirSync('root');
}
// Overwrite ./root/admin-panel directory
if (fs.existsSync('root/admin-panel')) {
    rimraf('root/admin-panel');
}
qcd.sync(__dirname + '/static/root/admin-panel', 'root/admin-panel');
// Create ./root/content directory
if (!fs.existsSync('root/content')) {
    fs.mkdirSync('root/content');
}
// Overwrite ./private-workers directory
if (fs.existsSync('private-workers')) {
    rimraf('private-workers');
}
qcd.sync(__dirname + '/static/private-workers', 'private-workers');
// Create User Database
var usersDB = node_json_database_1.db('users.json');
if (!usersDB.exists) {
    usersDB.create();
}
var adminsTable = usersDB.table('admins');
if (!adminsTable.exists) {
    adminsTable.create();
    adminsTable.columns.add([
        {
            name: 'userID',
            dataType: 'Int',
            constraints: [
                'autoIncrement',
                'primaryKey'
            ]
        },
        {
            name: 'username',
            dataType: 'String',
            constraints: [
                'unique',
                'notNull'
            ]
        },
        {
            name: 'password',
            dataType: 'String',
            constraints: [
                'notNull'
            ]
        },
        {
            name: 'passwordSalt',
            dataType: 'String',
            constraints: [
                'notNull'
            ]
        }
    ]);
}
// Create Pages Database
var pagesDB = node_json_database_1.db('pages.json');
if (!pagesDB.exists) {
    pagesDB.create();
}
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
            dataType: 'Boolean',
            constraints: [
                'notNull'
            ]
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
// Create .jwtsecret
if (!fs.existsSync('.jwtsecret')) {
    fs.writeFileSync('.jwtsecret', randomString(128, {
        lowerCaseAlphabetical: true,
        upperCaseAlphabetical: true,
        underscore: true,
        dash: true,
        numbers: true,
        upperKeyboardRowSymbols: true,
        rightSideKeyboardSymbolsExclQuotes: true,
        quotes: true
    }));
}
