/**
 * Activity Logger - Tracks admin actions for audit trail
 */

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { getAdminSession } from "./auth";
import logger from "./logger";

const ACTIVITY_COLLECTION = "activity_logs";

/**
 * Log an admin activity
 * @param {string} action - Action performed (e.g., "create_company", "delete_student")
 * @param {string} entityType - Type of entity (e.g., "company", "student", "admin")
 * @param {string} entityId - ID of the entity
 * @param {object} details - Additional details about the action
 * @param {string} status - Status of the action ("success" or "error")
 */
export const logActivity = async (action, entityType, entityId = null, details = {}, status = "success") => {
  try {
    const session = getAdminSession();
    if (!session) {
      logger.warn("Cannot log activity: No admin session found");
      return;
    }

    const activityData = {
      action,
      entityType,
      entityId,
      details,
      status,
      adminId: session.adminId || null,
      adminUsername: session.username || "unknown",
      adminRole: session.role || "unknown",
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, ACTIVITY_COLLECTION), activityData);
    logger.debug("Activity logged:", activityData);
  } catch (error) {
    // Don't throw - logging failures shouldn't break the app
    logger.error("Failed to log activity:", error);
  }
};

/**
 * Helper functions for common actions
 */
export const activityLoggers = {
  createCompany: (companyId, companyName) =>
    logActivity("create_company", "company", companyId, { companyName }),

  updateCompany: (companyId, companyName, changes) =>
    logActivity("update_company", "company", companyId, { companyName, changes }),

  deleteCompany: (companyId, companyName) =>
    logActivity("delete_company", "company", companyId, { companyName }),

  bulkDeleteCompanies: (count, companyIds) =>
    logActivity("bulk_delete_companies", "company", null, { count, companyIds }),

  createStudent: (studentId, studentName) =>
    logActivity("create_student", "student", studentId, { studentName }),

  deleteStudent: (studentId, studentName) =>
    logActivity("delete_student", "student", studentId, { studentName }),

  bulkDeleteStudents: (count, studentIds) =>
    logActivity("bulk_delete_students", "student", null, { count, studentIds }),

  approveRequirement: (studentId, requirementType) =>
    logActivity("approve_requirement", "student", studentId, { requirementType }),

  denyRequirement: (studentId, requirementType, reason) =>
    logActivity("deny_requirement", "student", studentId, { requirementType, reason }),

  sendNotification: (message, recipientCount) =>
    logActivity("send_notification", "notification", null, { message, recipientCount }),

  createAdmin: (adminId, username, role) =>
    logActivity("create_admin", "admin", adminId, { username, role }),

  exportData: (dataType, recordCount) =>
    logActivity("export_data", dataType, null, { recordCount }),

  uploadResourceFile: (fileName, category) =>
    logActivity("upload_resource_file", "resource_management", null, { fileName, category }),

  deleteResourceFile: (fileName) =>
    logActivity("delete_resource_file", "resource_management", null, { fileName }),

  restoreCompany: (companyId, companyName) =>
    logActivity("restore_company", "company", companyId, { companyName }),

  restoreStudent: (studentId, studentName) =>
    logActivity("restore_student", "student", studentId, { studentName }),

  blockStudent: (studentId, studentName) =>
    logActivity("block_student", "student", studentId, { studentName }),

  unblockStudent: (studentId, studentName) =>
    logActivity("unblock_student", "student", studentId, { studentName }),
};

export default activityLoggers;

