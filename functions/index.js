/**
 * Firebase Cloud Functions
 * Main entry point for all Cloud Functions
 */

const deleteUser = require("./deleteUser");

// Export all functions
exports.deleteUser = deleteUser.deleteUser;

