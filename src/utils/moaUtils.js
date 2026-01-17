/**
 * Utility functions for MOA (Memorandum of Agreement) management
 */

/**
 * Checks if a company's MOA is expired
 * @param {Object} company - Company object with moaExpirationDate
 * @returns {Object} - { isExpired: boolean, daysExpired: number, status: 'valid' | 'expiring-soon' | 'expired' }
 */
export const checkMoaExpiration = (company) => {
  if (!company || company.moa !== "Yes" || !company.moaExpirationDate) {
    return {
      isExpired: false,
      daysExpired: null,
      status: "no-moa",
      message: "No MOA on file",
    };
  }

  try {
    const expirationDate = new Date(company.moaExpirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);

    const daysUntilExpiration = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return {
        isExpired: true,
        daysExpired: Math.abs(daysUntilExpiration),
        status: "expired",
        message: `MOA expired ${Math.abs(daysUntilExpiration)} day${Math.abs(daysUntilExpiration) !== 1 ? "s" : ""} ago`,
      };
    } else if (daysUntilExpiration <= 30) {
      return {
        isExpired: false,
        daysExpired: null,
        status: "expiring-soon",
        message: `MOA expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? "s" : ""}`,
      };
    } else {
      return {
        isExpired: false,
        daysExpired: null,
        status: "valid",
        message: `MOA valid for ${daysUntilExpiration} more day${daysUntilExpiration !== 1 ? "s" : ""}`,
      };
    }
  } catch (e) {
    return {
      isExpired: false,
      daysExpired: null,
      status: "unknown",
      message: "Unable to determine MOA status",
    };
  }
};

/**
 * Validates if a company can be used for student assignments
 * @param {Object} company - Company object
 * @returns {Object} - { canAssign: boolean, reason: string }
 */
export const canAssignStudentToCompany = (company) => {
  const moaStatus = checkMoaExpiration(company);

  if (moaStatus.status === "no-moa") {
    return {
      canAssign: false,
      reason: "This company does not have a valid MOA. Please ensure the MOA is set up before assigning students.",
    };
  }

  if (moaStatus.isExpired) {
    return {
      canAssign: false,
      reason: `This company's MOA expired ${moaStatus.daysExpired} day${moaStatus.daysExpired !== 1 ? "s" : ""} ago. Please renew the MOA before assigning students.`,
    };
  }

  if (moaStatus.status === "expiring-soon") {
    return {
      canAssign: true,
      reason: `Warning: This company's MOA expires soon (${moaStatus.message.split("in ")[1]}). Consider renewing it.`,
      warning: true,
    };
  }

  return {
    canAssign: true,
    reason: null,
  };
};





