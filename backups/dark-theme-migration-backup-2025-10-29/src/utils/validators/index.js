// =============================================
// FILE: src/utils/validators/index.js
// Central export for all validators
// =============================================

// Import functions that are used internally in this file
import { validateAndNormalizeEmail } from './emailValidator';
import { validatePassword } from './passwordValidator';
import { validatePhone, getE164Format } from './phoneValidator';

// Password validation
export {
  validatePassword,
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  passwordMeetsMinimumRequirements,
  getPasswordRequirements,
} from './passwordValidator';

// Email validation
export {
  validateEmail,
  normalizeEmail,
  isDisposableEmail,
  checkEmailExists,
  getEmailRequirements,
  validateAndNormalizeEmail,
} from './emailValidator';

// Phone validation
export {
  validatePhone,
  formatPhoneNumber,
  getE164Format,
  isMobileNumber,
  getPhoneRequirements,
  sanitizePhoneInput,
  getCountryCode,
  areSamePhoneNumbers,
  getSupportedCountries,
  isValidForCountry,
} from './phoneValidator';

/**
 * Validate all registration fields at once
 * @param {Object} data - Registration data
 * @returns {Object} Validation results
 */
export function validateRegistrationData(data) {
  const {
    email = '',
    password = '',
    confirmPassword = '',
    phone = '',
    firstName = '',
    lastName = '',
  } = data;

  const errors = {};
  let isValid = true;

  // Email validation
  const emailValidation = validateAndNormalizeEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.errors;
    isValid = false;
  } else if (emailValidation.isDisposable) {
    errors.email = ['Non sono accettati indirizzi email temporanei'];
    isValid = false;
  }

  // Password validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors;
    isValid = false;
  }

  // Confirm password
  if (password !== confirmPassword) {
    errors.confirmPassword = ['Le password non coincidono'];
    isValid = false;
  }

  // Phone validation
  if (phone) {
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.errors;
      isValid = false;
    }
  }

  // First name
  if (!firstName || firstName.trim().length < 2) {
    errors.firstName = ['Il nome deve contenere almeno 2 caratteri'];
    isValid = false;
  }

  // Last name
  if (!lastName || lastName.trim().length < 2) {
    errors.lastName = ['Il cognome deve contenere almeno 2 caratteri'];
    isValid = false;
  }

  return {
    isValid,
    errors,
    normalizedData: {
      email: emailValidation.normalized,
      phone: phone ? getE164Format(phone) : '',
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    },
  };
}

/**
 * Validate club registration data
 * @param {Object} data - Club registration data
 * @returns {Object} Validation results
 */
export function validateClubRegistrationData(data) {
  const {
    email = '',
    password = '',
    confirmPassword = '',
    phone = '',
    firstName = '',
    lastName = '',
    clubName = '',
    clubAddress = '',
    clubCity = '',
    clubPostalCode = '',
  } = data;

  const errors = {};
  let isValid = true;

  // First validate personal data (reuse user validation)
  const userValidation = validateRegistrationData({
    email,
    password,
    confirmPassword,
    phone,
    firstName,
    lastName,
  });

  if (!userValidation.isValid) {
    Object.assign(errors, userValidation.errors);
    isValid = false;
  }

  // Club-specific validations
  if (!clubName || clubName.trim().length < 3) {
    errors.clubName = ['Il nome del circolo deve contenere almeno 3 caratteri'];
    isValid = false;
  }

  if (!clubAddress || clubAddress.trim().length < 5) {
    errors.clubAddress = ["L'indirizzo deve essere valido"];
    isValid = false;
  }

  if (!clubCity || clubCity.trim().length < 2) {
    errors.clubCity = ['La città è obbligatoria'];
    isValid = false;
  }

  if (!clubPostalCode || !/^\d{5}$/.test(clubPostalCode.trim())) {
    errors.clubPostalCode = ['Il CAP deve essere di 5 cifre'];
    isValid = false;
  }

  return {
    isValid,
    errors,
    normalizedData: {
      ...userValidation.normalizedData,
      clubName: clubName.trim(),
      clubAddress: clubAddress.trim(),
      clubCity: clubCity.trim(),
      clubPostalCode: clubPostalCode.trim(),
    },
  };
}

/**
 * Sanitize error messages to remove sensitive data
 * @param {Error|string} error - Error to sanitize
 * @param {Array<string>} sensitiveFields - Fields to remove (default: password)
 * @returns {string} Sanitized error message
 */
export function sanitizeError(error, sensitiveFields = ['password', 'pwd', 'pass']) {
  let message = typeof error === 'string' ? error : error.message || 'Unknown error';

  // Remove sensitive field values from error messages
  sensitiveFields.forEach((field) => {
    // Remove field=value patterns
    const regex1 = new RegExp(`${field}[=:]\\s*[^\\s,;]+`, 'gi');
    message = message.replace(regex1, `${field}=***`);

    // Remove "field": "value" patterns (JSON)
    const regex2 = new RegExp(`"${field}"\\s*:\\s*"[^"]*"`, 'gi');
    message = message.replace(regex2, `"${field}":"***"`);
  });

  return message;
}
