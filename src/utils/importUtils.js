/**
 * Utility functions for importing data from CSV files
 */

/**
 * Parse CSV string into array of objects
 * @param {string} csvText - CSV text content
 * @param {Array} expectedHeaders - Optional array of expected header keys
 * @returns {Array} Array of objects with parsed data
 */
export const parseCSV = (csvText, expectedHeaders = null) => {
  if (!csvText || csvText.trim() === '') {
    throw new Error('CSV file is empty');
  }

  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]);
  const headerMap = {};
  headers.forEach((header, index) => {
    headerMap[header.trim()] = index;
  });

  // Validate headers if expected headers provided
  if (expectedHeaders) {
    const missingHeaders = expectedHeaders.filter(h => !headerMap[h]);
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
  }

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every(v => v.trim() === '')) {
      continue; // Skip empty rows
    }

    const row = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      value = value.trim();
      
      // Handle empty values
      if (value === '') {
        row[header.trim()] = '';
      } else {
        row[header.trim()] = value;
      }
    });
    data.push(row);
  }

  return data;
};

/**
 * Parse a single CSV line, handling quoted values
 * @param {string} line - CSV line
 * @returns {Array} Array of values
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current); // Add last field

  return values;
};

/**
 * Convert imported company CSV data to company objects
 * @param {Array} csvData - Parsed CSV data
 * @returns {Array} Array of company objects ready for Firestore
 */
export const convertCSVToCompanies = (csvData) => {
  const companies = [];
  const errors = [];

  csvData.forEach((row, index) => {
    try {
      const company = {
        companyName: row['Company Name'] || row['companyName'] || '',
        description: row['Description'] || row['description'] || '',
        companyWebsite: row['Website'] || row['Company Website'] || row['companyWebsite'] || '',
        fields: parseArrayField(row['Field'] || row['fields'] || ''),
        address: row['Address'] || row['address'] || '',
        email: row['Email'] || row['email'] || '',
        skills: parseArrayField(row['Skills'] || row['skills'] || '', ';'),
        moa: parseBooleanField(row['MOA'] || row['moa'] || ''),
        moaValidityYears: parseNumberField(row['MOA Validity Years'] || row['moaValidityYears'] || ''),
        modeOfWork: parseArrayField(row['Mode of Work'] || row['modeOfWork'] || '', ','),
        createdAt: row['Created'] ? parseDateField(row['Created']) : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Validation
      if (!company.companyName) {
        throw new Error('Company Name is required');
      }
      if (!company.email) {
        throw new Error('Email is required');
      }
      if (company.moa && !company.moaValidityYears) {
        throw new Error('MOA Validity Years is required when MOA is Yes');
      }

      companies.push(company);
    } catch (error) {
      errors.push({
        row: index + 2, // +2 because index starts at 0 and we skip header
        error: error.message,
        data: row,
      });
    }
  });

  return { companies, errors };
};

/**
 * Convert imported student CSV data to student objects
 * @param {Array} csvData - Parsed CSV data
 * @returns {Array} Array of student objects ready for Firestore
 */
export const convertCSVToStudents = (csvData) => {
  const students = [];
  const errors = [];

  csvData.forEach((row, index) => {
    try {
      // Parse name if full name is provided
      const fullName = row['Name'] || row['name'] || '';
      let firstName = row['First Name'] || row['firstName'] || '';
      let lastName = row['Last Name'] || row['lastName'] || '';

      if (fullName && !firstName && !lastName) {
        const nameParts = fullName.trim().split(/\s+/);
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      const studentIdValue = row['Student Number'] || row['studentNumber'] || 
                             row['Student ID'] || row['studentId'] || '';
      const student = {
        studentNumber: studentIdValue,
        studentId: studentIdValue, // Save to both fields for compatibility
        firstName: firstName || '',
        lastName: lastName || '',
        email: row['Email'] || row['email'] || '',
        program: row['Program'] || row['program'] || '',
        yearLevel: row['Year Level'] || row['yearLevel'] || '',
        contact: row['Contact Number'] || row['Contact'] || row['contact'] || '',
        companyName: row['Company'] || row['companyName'] || '',
        status: parseBooleanField(row['Status'] || row['status'] || ''),
        createdAt: row['Created'] ? parseDateField(row['Created']) : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Validation
      if (!student.studentNumber) {
        throw new Error('Student Number/ID is required');
      }
      if (!student.firstName || !student.lastName) {
        throw new Error('First Name and Last Name are required');
      }
      if (!student.email) {
        throw new Error('Email is required');
      }
      if (!student.program) {
        throw new Error('Program is required');
      }

      students.push(student);
    } catch (error) {
      errors.push({
        row: index + 2, // +2 because index starts at 0 and we skip header
        error: error.message,
        data: row,
      });
    }
  });

  return { students, errors };
};

/**
 * Parse array field from CSV (handles semicolon or comma separated)
 * @param {string} value - Field value
 * @param {string} separator - Separator character (default: ';')
 * @returns {Array} Array of values
 */
const parseArrayField = (value, separator = ';') => {
  if (!value || value.trim() === '') return [];
  return value.split(separator).map(item => item.trim()).filter(item => item !== '');
};

/**
 * Parse boolean field from CSV
 * @param {string} value - Field value
 * @returns {boolean} Boolean value
 */
const parseBooleanField = (value) => {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return lower === 'yes' || lower === 'true' || lower === '1' || lower === 'y';
};

/**
 * Parse number field from CSV
 * @param {string} value - Field value
 * @returns {number|null} Number value or null
 */
const parseNumberField = (value) => {
  if (!value || value.trim() === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

/**
 * Parse date field from CSV
 * @param {string} value - Date string
 * @returns {string} ISO date string
 */
const parseDateField = (value) => {
  if (!value) return new Date().toISOString();
  try {
    // Try to parse various date formats
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

/**
 * Read CSV file and return text content
 * @param {File} file - CSV file
 * @returns {Promise<string>} CSV text content
 */
export const readCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }

    if (!file.name.endsWith('.csv')) {
      reject(new Error('File must be a CSV file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
};

