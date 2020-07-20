"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_json_database_1 = require("node-json-database");
const bcrypt = require("bcrypt");
exports.authenticate = (loginData) => {
    return new Promise((resolve, reject) => {
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
        const adminTable = node_json_database_1.db(__dirname + '/../users.json').table('admins');
        const searchTable = adminTable.get().where(row => row.username == loginData.username);
        // Check if the Login Data exists in the database
        if (searchTable.length == 1) {
            const userRecord = searchTable.rows[0];
            // Check password
            const match = bcrypt.compareSync(loginData.password, userRecord.password);
            if (match) {
                // Password matches
                resolve();
            }
            else {
                // Password does not match 
                reject();
            }
        }
        else {
            // User does not exist
            reject();
        }
    });
};
