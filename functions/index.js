/**
 * Firebase Cloud Functions
 * Main entry point for all Cloud Functions
 */

const deleteUser = require("./deleteUser");
const updateUserPassword = require("./updateUserPassword");

// Export all functions
exports.deleteUser = deleteUser.deleteUser;
exports.updateUserPassword = updateUserPassword.updateUserPassword;

