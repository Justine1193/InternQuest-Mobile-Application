/**
 * Firebase Cloud Functions
 * Main entry point for all Cloud Functions
 */

const deleteUser = require("./deleteUser");
const createUserWithRole = require("./createUserWithRole");
const listManagedUsers = require("./listManagedUsers");

// Export all functions
exports.deleteUser = deleteUser.deleteUser;
exports.createUserWithRole = createUserWithRole.createUserWithRole;
exports.listManagedUsers = listManagedUsers.listManagedUsers;

