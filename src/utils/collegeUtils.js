/**
 * Utility functions for mapping programs to colleges
 * Fetches program-to-college mappings from Firestore
 */

import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import logger from "./logger.js";

let programToCollegeCache = null;
let collegesCache = null;

/**
 * Load all programs from Firestore and create a mapping of program_name -> college_code
 * Supports both:
 * 1. programs collection with program_name and college_code fields
 * 2. meta/programs document with college names as keys and program arrays as values
 * @returns {Promise<Object>} Object mapping program names to college codes
 */
export const loadProgramToCollegeMap = async () => {
  // Return cached data if available
  if (programToCollegeCache) {
    return programToCollegeCache;
  }

  try {
    const map = {};
    let collegeNameToCodeMap = {};

    // First, try to load college name to code mapping from colleges collection
    try {
      const collegesSnapshot = await getDocs(collection(db, "colleges"));
      collegesSnapshot.forEach((doc) => {
        const collegeData = doc.data();
        if (collegeData.college_name && collegeData.college_code) {
          collegeNameToCodeMap[collegeData.college_name] = collegeData.college_code;
        }
      });
    } catch (err) {
      logger.warn("Colleges collection not found, will use college names directly");
    }

    // Try to get programs from the programs collection first (if it exists)
    try {
      const programsSnapshot = await getDocs(collection(db, "programs"));
      programsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.program_name && data.college_code) {
          map[data.program_name] = data.college_code;
        }
        // Also map by program_code if available
        if (data.program_code && data.college_code) {
          map[data.program_code] = data.college_code;
        }
      });
    } catch (err) {
      // If programs collection doesn't exist, that's okay - we'll use meta/programs
      logger.warn("Programs collection not found, using meta/programs");
    }

    // Load from meta/programs document (college-organized structure)
    try {
      const metaProgramsDoc = await getDoc(doc(db, "meta", "programs"));
      if (metaProgramsDoc.exists()) {
        const data = metaProgramsDoc.data();

        // Check if data is organized by college (college names as keys, arrays as values)
        // Example: { "College of Accountancy": ["BS Accountancy", ...], ... }
        const isCollegeOrganized = Object.keys(data).some((key) => {
          const value = data[key];
          return Array.isArray(value) && value.length > 0 && typeof value[0] === "string";
        });

        if (isCollegeOrganized) {
          // Structure: { "College Name": ["Program 1", "Program 2", ...] }
          Object.keys(data).forEach((collegeName) => {
            const programs = data[collegeName];
            if (Array.isArray(programs)) {
              // Get college code (prefer from colleges collection, fallback to college name)
              const collegeCode = collegeNameToCodeMap[collegeName] || collegeName;

              programs.forEach((programName) => {
                if (typeof programName === "string" && programName.trim()) {
                  map[programName.trim()] = collegeCode;
                }
              });
            }
          });
        } else if (Array.isArray(data.list)) {
          // Fallback: flat array structure
          // This case would need college info from elsewhere
          logger.warn("meta/programs uses flat array structure - college mapping may be incomplete");
        } else {
          // Fallback: all values are programs (no college organization)
          logger.warn("meta/programs structure not recognized - college mapping may be incomplete");
        }
      }
    } catch (err) {
      logger.error("Could not load from meta/programs:", err);
    }

    // Cache the result
    programToCollegeCache = map;
    logger.log(`Loaded program to college map with ${Object.keys(map).length} programs`);
    return map;
  } catch (error) {
    logger.error("Error loading program to college map:", error);
    return {};
  }
};

/**
 * Get the college code for a given program name
 * @param {string} programName - The program name to look up
 * @returns {Promise<string|null>} The college code or null if not found
 */
export const getCollegeCodeForProgram = async (programName) => {
  if (!programName || typeof programName !== "string") {
    return null;
  }

  const map = await loadProgramToCollegeMap();
  return map[programName] || null;
};

/**
 * Load all colleges from Firestore
 * Supports both:
 * 1. colleges collection with college_name and college_code fields
 * 2. Extracting college names from meta/programs document structure
 * @returns {Promise<Array>} Array of college objects with {id, college_name, college_code}
 */
export const loadColleges = async () => {
  // Return cached data if available
  if (collegesCache) {
    return collegesCache;
  }

  try {
    const colleges = [];
    const collegeMap = new Map(); // Use Map to avoid duplicates

    // First, try to load from colleges collection
    try {
      const collegesSnapshot = await getDocs(collection(db, "colleges"));
      collegesSnapshot.forEach((doc) => {
        const collegeData = doc.data();
        const collegeName = collegeData.college_name || doc.id;
        const collegeCode = collegeData.college_code || doc.id;
        
        colleges.push({
          id: doc.id,
          college_name: collegeName,
          college_code: collegeCode,
          ...collegeData,
        });
        collegeMap.set(collegeName, collegeCode);
      });
    } catch (err) {
      // Colleges collection not found - this is expected if using meta/programs structure
      // Only log in development to reduce console noise
      if (process.env.NODE_ENV === 'development') {
        logger.log("Colleges collection not found, extracting from meta/programs");
      }
    }

    // If no colleges found, extract from meta/programs structure
    if (colleges.length === 0) {
      try {
        const metaProgramsDoc = await getDoc(doc(db, "meta", "programs"));
        if (metaProgramsDoc.exists()) {
          const data = metaProgramsDoc.data();

          // Check if data is organized by college
          const isCollegeOrganized = Object.keys(data).some((key) => {
            const value = data[key];
            return Array.isArray(value) && value.length > 0 && typeof value[0] === "string";
          });

          if (isCollegeOrganized) {
            // Extract college names from keys
            Object.keys(data).forEach((collegeName) => {
              if (!collegeMap.has(collegeName)) {
                // Generate a college code from the name (first letters of each word)
                const words = collegeName.split(" ").filter((w) => w.length > 0);
                const collegeCode = words
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase();

                colleges.push({
                  id: collegeName, // Use college name as unique ID to avoid duplicates
                  college_name: collegeName,
                  college_code: collegeCode,
                });
                collegeMap.set(collegeName, collegeCode);
              }
            });
          }
        }
      } catch (err) {
        logger.error("Could not extract colleges from meta/programs:", err);
      }
    }

    // Sort by college name
    colleges.sort((a, b) => {
      const nameA = a.college_name || "";
      const nameB = b.college_name || "";
      return nameA.localeCompare(nameB);
    });

    // Cache the result
    collegesCache = colleges;
    logger.log(`Loaded ${colleges.length} colleges`);
    return colleges;
  } catch (error) {
    logger.error("Error loading colleges:", error);
    return [];
  }
};

/**
 * Clear the cache (useful for testing or when data is updated)
 */
export const clearCollegeCache = () => {
  programToCollegeCache = null;
  collegesCache = null;
};

