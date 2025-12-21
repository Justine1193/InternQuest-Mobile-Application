/**
 * Input validation and sanitization utilities
 * Provides functions to validate and sanitize user inputs
 */

/**
 * Sanitizes a string input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone.trim()) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export const validatePasswordStrength = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
  } = options;

  const errors = [];

  if (!password || password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitizes HTML content
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  if (typeof html !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Validates and sanitizes a number input
 * @param {string|number} input - Input to validate
 * @param {object} options - Validation options
 * @returns {number|null} - Validated number or null
 */
export const validateNumber = (input, options = {}) => {
  const { min, max, integer = false } = options;
  
  if (input === '' || input === null || input === undefined) return null;
  
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num)) return null;
  
  if (integer && !Number.isInteger(num)) return null;
  
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;
  
  return num;
};

/**
 * Validates required field
 * @param {any} value - Value to check
 * @param {string} fieldName - Name of the field for error message
 * @returns {string} - Error message or empty string
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} is required`;
  }
  return '';
};

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }
  
  const trimmed = username.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Username must be less than 50 characters' };
  }
  
  if (!/^[a-zA-Z0-9_@.]+$/.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, _, @, and .' };
  }
  
  return { valid: true, error: '' };
};

