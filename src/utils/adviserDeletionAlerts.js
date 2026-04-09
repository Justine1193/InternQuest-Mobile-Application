/**
 * College routing for deleted OJT advisers — coordinator/admin in-app alerts.
 */

export const ADVISER_DELETION_ALERTS = "adviser_deletion_alerts";
export const ADVISER_DELETION_ALERT_STATES = "adviser_deletion_alert_states";

export const ADVISER_ALERT_VISIBLE_DAYS = 7;

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function extractProgramCodeFromSection(section) {
  if (!section || typeof section !== "string") return null;
  const match = section.match(/^\d+([A-Z]+)/i);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }
  const programMatch = section.match(/([A-Z]{2,})/i);
  if (programMatch && programMatch[1]) {
    return programMatch[1].toUpperCase();
  }
  return null;
}

export function getCollegeCodesForAdmin(admin, programToCollegeMap) {
  const codes = new Set();
  if (admin.college_code?.trim()) {
    codes.add(admin.college_code.trim().toUpperCase());
  }
  if (admin.createdByCollegeCode?.trim()) {
    codes.add(admin.createdByCollegeCode.trim().toUpperCase());
  }
  const sections =
    admin.sections || (admin.section ? [admin.section] : []);
  for (const sec of sections) {
    const pc = extractProgramCodeFromSection(sec);
    if (pc && programToCollegeMap?.[pc]) {
      codes.add(String(programToCollegeMap[pc]).trim().toUpperCase());
    }
  }
  return [...codes];
}

export function normalizeCollegeCodes(list) {
  if (!Array.isArray(list)) return [];
  return [
    ...new Set(
      list
        .map((c) => String(c || "").trim().toUpperCase())
        .filter(Boolean),
    ),
  ];
}

export function isAlertExpired(firstSeenAtIso) {
  if (!firstSeenAtIso) return false;
  const start = new Date(firstSeenAtIso).getTime();
  if (Number.isNaN(start)) return false;
  return Date.now() - start >= ADVISER_ALERT_VISIBLE_DAYS * MS_PER_DAY;
}
