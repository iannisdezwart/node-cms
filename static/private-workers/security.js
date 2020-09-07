"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filePathIsSafe = exports.dotDotSlashAttack = void 0;
const path_1 = require("path");
// Dot-dot-slash attack prevention
exports.dotDotSlashAttack = (path, root) => {
    const resolvedPath = path_1.resolve(path);
    const rootPath = path_1.resolve(root);
    if (!resolvedPath.startsWith(rootPath)) {
        return true;
    }
    return false;
};
exports.filePathIsSafe = (path, root) => {
    if (exports.dotDotSlashAttack(path, root)) {
        return false;
    }
    const resolvedPath = path_1.resolve(path);
    // Prevent user from creating .node.js or .node.ts files
    if (resolvedPath.endsWith('.node.js') || resolvedPath.endsWith('.node.ts')) {
        return false;
    }
    return true;
};
