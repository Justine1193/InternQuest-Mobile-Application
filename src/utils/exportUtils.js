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
    "Description": company.description || "",
    "Website": company.website || "",
    "Field": company.field || "",
    "Address": company.address || "",
    "Email": company.email || "",
    "Skills": Array.isArray(company.skills) ? company.skills.join("; ") : company.skills || "",
    "MOA": company.moa ? "Yes" : "No",
    "MOA Validity Years": company.moaValidityYears || "",
    "Mode of Work": Array.isArray(company.modeOfWork) ? company.modeOfWork.join(", ") : company.modeOfWork || "",
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
    const studentIdValue = student.studentId || "";
    return {
      "Student ID": studentIdValue,
      "Document ID": student.id || "",
      "Name": `${student.firstName || ""} ${student.lastName || ""}`.trim(),
      "Email": student.email || "",
      "Program": student.program || "",
      "Year Level": student.yearLevel || "",
      "Contact Number": student.contactNumber || student.contact || "",
      "Company": student.companyName || "",
      "Status": student.status || "",
      "Created": formatDateForCSV(student.createdAt),
      "Updated": formatDateForCSV(student.updatedAt),
    };
  });
};

