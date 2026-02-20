/**
 * Utility functions for exporting data to CSV/Excel
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional array of header objects {key, label}
 * @returns {string} CSV string
 */
export const convertToCSV = (data, headers = null) => {
  if (!data || data.length === 0) {
    return "";
  }

  // If headers provided, use them; otherwise infer from first object
  const headerKeys = headers 
    ? headers.map(h => h.key)
    : Object.keys(data[0]);
  
  const headerLabels = headers
    ? headers.map(h => h.label || h.key)
    : headerKeys;

  // Create CSV header row
  const csvRows = [headerLabels.join(",")];

  // Create CSV data rows
  data.forEach((row) => {
    const values = headerKeys.map((key) => {
      const value = row[key];
      // Handle arrays, objects, and null/undefined
      if (value === null || value === undefined) {
        return "";
      }
      if (Array.isArray(value)) {
        return `"${value.join("; ")}"`;
      }
      if (typeof value === "object") {
        return `"${JSON.stringify(value)}"`;
      }
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
};

/**
 * Download data as CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Array} headers - Optional array of header objects {key, label}
 */
export const downloadCSV = (data, filename = "export", headers = null) => {
  const csv = convertToCSV(data, headers);
  if (!csv) {
    throw new Error("No data to export");
  }

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Format date for CSV export
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForCSV = (date) => {
  if (!date) return "";
  try {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(date);
  }
};

/**
 * Prepare company data for export
 * @param {Array} companies - Array of company objects
 * @returns {Array} Formatted company data
 */
export const prepareCompaniesForExport = (companies) => {
  return companies.map((company) => ({
    "Company Name": company.companyName || "",
    "Description": company.companyDescription || "",
    "Website": company.companyWeb || "",
    "Fields": Array.isArray(company.fields) ? company.fields.join("; ") : (company.fields || ""),
    "Address": company.companyAddress || "",
    "Email": company.companyEmail || "",
    "Skills": Array.isArray(company.skillsREq) ? company.skillsREq.join("; ") : (company.skillsREq || ""),
    "MOA": company.moa === "Yes" ? "Yes" : "No",
    "MOA Validity Years": company.moaValidityYears || "",
    "MOA Start Date": company.moaStartDate ? formatDateForCSV(company.moaStartDate) : "",
    "MOA Expiration Date": company.moaExpirationDate ? formatDateForCSV(company.moaExpirationDate) : "",
    "MOA File URL": company.moaFileUrl || "",
    "MOA File Name": company.moaFileName || "",
    "Mode of Work": Array.isArray(company.modeOfWork) ? company.modeOfWork.join(", ") : (company.modeOfWork || ""),
    "Endorsed by College": company.endorsedByCollege || "",
    "Contact Person Name": company.contactPersonName || "",
    "Contact Person Email": company.contactPersonEmail || "",
    "Contact Number": company.contactPersonPhone || "",
    "Created By": company.createdBy ? `${company.createdBy.username || "Unknown"}${company.createdBy.role ? ` (${company.createdBy.role})` : ""}` : "",
    "Created": formatDateForCSV(company.createdAt),
    "Updated": formatDateForCSV(company.updatedAt),
  }));
};

/**
 * Prepare student data for export
 * @param {Array} students - Array of student objects
 * @returns {Array} Formatted student data
 */
export const prepareStudentsForExport = (students) => {
  return students.map((student) => {
    const studentIdValue = student?.studentId || "";
    const firstName = student?.firstName || "";
    const lastName = student?.lastName || "";

    const fullName = `${firstName} ${lastName}`.trim();

    // Derive hired status (supports both boolean and string representations)
    const isHired =
      student?.status === true ||
      (typeof student?.status === "string" &&
        student.status.toLowerCase() === "hired");

    // Derive company name similar to student table rendering
    const getCompanyNameForExport = () => {
      if (!student) return "";
      if (typeof student.company === "string" && student.company.trim()) {
        return student.company;
      }
      if (
        typeof student.companyName === "string" &&
        student.companyName.trim()
      ) {
        return student.companyName;
      }
      if (
        typeof student.assignedCompany === "string" &&
        student.assignedCompany.trim()
      ) {
        return student.assignedCompany;
      }
      if (
        student.company &&
        typeof student.company === "object" &&
        student.company.name
      ) {
        return student.company.name;
      }
      return "";
    };

    // Normalize skills array to a readable string
    let skillsString = "";
    if (Array.isArray(student?.skills) && student.skills.length > 0) {
      skillsString = student.skills
        .map((skill) => {
          if (skill == null) return "";
          if (typeof skill === "string" || typeof skill === "number") {
            return String(skill);
          }
          if (typeof skill === "object") {
            if (
              Object.prototype.hasOwnProperty.call(skill, "id") &&
              (typeof skill.id === "string" || typeof skill.id === "number")
            ) {
              return String(skill.id);
            }
            if (Object.keys(skill).length > 0) {
              return JSON.stringify(skill);
            }
          }
          return String(skill);
        })
        .filter((v) => v && v.trim() !== "")
        .join("; ");
    }

    // Normalize location preference (object of flags) to a readable string
    let locationPreferenceString = "";
    const lp = student?.locationPreference;
    if (lp && typeof lp === "object") {
      const enabledKeys = Object.entries(lp)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key)
        .filter((key) => key && key.trim() !== "");
      locationPreferenceString = enabledKeys.join("; ");
    } else if (typeof lp === "string") {
      locationPreferenceString = lp;
    }

    // Created by (admin who created the student), if available
    const createdByString = student?.createdBy
      ? `${student.createdBy.username || "Unknown"}${
          student.createdBy.role ? ` (${student.createdBy.role})` : ""
        }`
      : "";

    return {
      "Student ID": studentIdValue,
      "Document ID": student?.id || "",
      "Name": fullName,
      "First Name": firstName,
      "Last Name": lastName,
      "Email": student?.email || "",
      "Section": student?.section || "",
      "College": student?.college || "",
      "Program": student?.program || "",
      "Year Level": student?.yearLevel || "",
      "Field": student?.field || "",
      "Contact Number": student?.contactNumber || student?.contact || "",
      "Company": getCompanyNameForExport(),
      "Hired": isHired ? "Yes" : "No",
      "Skills": skillsString,
      "Location Preference": locationPreferenceString,
      "Blocked": student?.is_blocked ? "Yes" : "No",
      "Created By": createdByString,
      "Created": formatDateForCSV(student?.createdAt),
      "Updated": formatDateForCSV(student?.updatedAt),
    };
  });
};

