"use strict";
var node_json_database_1 = require("node-json-database");
var authenticate = function (loginData) {
    return new Promise(function (resolve, reject) {
        // Handle null data
        if (loginData == undefined) {
            reject();
            return;
        }
        if (loginData.username == undefined || loginData.password == undefined) {
            reject();
            return;
        }
        // Search for the Login Data in the database
        var adminTable = node_json_database_1.db(__dirname + '/../users.json').table('admins');
        var searchTable = adminTable.get().where(function (row) { return row.username == loginData.username && row.password == loginData.password; });
        // Check if the Login Data exists in the database
        if (searchTable.length == 1) {
            // Authenticated
            resolve();
        }
        else {
            // Not authenticated
            reject();
        }
    });
};
module.exports = authenticate;
