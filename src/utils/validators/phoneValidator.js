// =============================================
// FILE: src/utils/validators/phoneValidator.js
// Phone number validation with international support
// =============================================

import { parsePhoneNumber, isValidPhoneNumber, getCountries } from 'libphonenumber-js';

/**
 * Validate phone number with international support
 * @param {string} phoneNumber - Phone number to validate
 * @param {string} defaultCountry - Default country code (IT for Italy)
 * @returns {Object} Validation result
 */
export function validatePhone(phoneNumber, defaultCountry = 'IT') {
  const errors = [];

  // Required check
  if (!phoneNumber) {
    return {
      isValid: false,
      errors: ['Il numero di telefono è obbligatorio'],
      formatted: '',
      e164: '',
      country: null,
    };
  }

  // Clean whitespace
  phoneNumber = phoneNumber.trim();

  try {
    // Check if valid with libphonenumber-js
    if (!isValidPhoneNumber(phoneNumber, defaultCountry)) {
      errors.push('Numero di telefono non valido');
      
      return {
        isValid: false,
        errors,
        formatted: phoneNumber,
        e164: '',
        country: null,
      };
    }

    // Parse phone number
    const parsed = parsePhoneNumber(phoneNumber, defaultCountry);

    // Additional validation checks
    if (parsed.country !== defaultCountry && !phoneNumber.startsWith('+')) {
      errors.push(`Per numeri esteri usa il formato internazionale (es: +39...)`);
    }

    // Check if it's a valid Italian number (mobile or fixed-line)
    if (parsed.country === 'IT') {
      const type = parsed.getType();
      const validTypes = ['MOBILE', 'FIXED_LINE', 'FIXED_LINE_OR_MOBILE'];
      if (!validTypes.includes(type)) {
        errors.push('Numero di telefono non valido. Accettiamo numeri italiani mobili e fissi');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      formatted: parsed.formatInternational(), // +39 123 456 7890
      e164: parsed.format('E.164'), // +391234567890
      national: parsed.formatNational(), // 123 456 7890
      country: parsed.country,
      type: parsed.getType(),
    };

  } catch (error) {
    return {
      isValid: false,
      errors: ['Numero di telefono non valido o formato non riconosciuto'],
      formatted: phoneNumber,
      e164: '',
      country: null,
    };
  }
}

/**
 * Format phone number for display
 * @param {string} phoneNumber - Phone number to format
 * @param {string} defaultCountry - Default country code
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phoneNumber, defaultCountry = 'IT') {
  if (!phoneNumber) return '';

  try {
    const parsed = parsePhoneNumber(phoneNumber, defaultCountry);
    return parsed.formatInternational();
  } catch {
    return phoneNumber;
  }
}

/**
 * Get E.164 format for storage (best practice for international numbers)
 * @param {string} phoneNumber - Phone number to convert
 * @param {string} defaultCountry - Default country code
 * @returns {string} E.164 formatted number (+391234567890)
 */
export function getE164Format(phoneNumber, defaultCountry = 'IT') {
  if (!phoneNumber) return '';

  try {
    const parsed = parsePhoneNumber(phoneNumber, defaultCountry);
    return parsed.format('E.164');
  } catch {
    return phoneNumber;
  }
}

/**
 * Check if phone number is a mobile (required for SMS/WhatsApp)
 * @param {string} phoneNumber - Phone number to check
 * @param {string} defaultCountry - Default country code
 * @returns {boolean} True if mobile
 */
export function isMobileNumber(phoneNumber, defaultCountry = 'IT') {
  if (!phoneNumber) return false;

  try {
    const parsed = parsePhoneNumber(phoneNumber, defaultCountry);
    return parsed.getType() === 'MOBILE';
  } catch {
    return false;
  }
}

/**
 * Get phone validation requirements checklist
 * @param {string} phoneNumber - Current phone number
 * @returns {Array<Object>} Requirements with status
 */
export function getPhoneRequirements(phoneNumber = '', defaultCountry = 'IT') {
  const validation = validatePhone(phoneNumber, defaultCountry);
  
  return [
    {
      label: 'Numero valido',
      met: validation.isValid && validation.errors.length === 0,
      required: true,
    },
    {
      label: 'Numero di cellulare o fisso',
      met: validation.type === 'MOBILE' || validation.type === 'FIXED_LINE' || validation.type === 'FIXED_LINE_OR_MOBILE',
      required: true,
    },
    {
      label: defaultCountry === 'IT' ? 'Numero italiano o formato internazionale' : 'Formato internazionale valido',
      met: validation.country !== null,
      required: true,
    },
  ];
}

/**
 * Sanitize phone input (remove non-numeric characters except +)
 * @param {string} input - Raw input
 * @returns {string} Sanitized phone number
 */
export function sanitizePhoneInput(input) {
  if (!input) return '';
  
  // Keep only digits, + symbol, and spaces/dashes for readability
  return input.replace(/[^\d+\s-]/g, '');
}

/**
 * Get country code from phone number
 * @param {string} phoneNumber - Phone number
 * @returns {string|null} Country code (IT, US, etc.) or null
 */
export function getCountryCode(phoneNumber) {
  if (!phoneNumber) return null;

  try {
    const parsed = parsePhoneNumber(phoneNumber);
    return parsed.country;
  } catch {
    return null;
  }
}

/**
 * Check if two phone numbers are the same (normalized comparison)
 * @param {string} phone1 - First phone number
 * @param {string} phone2 - Second phone number
 * @returns {boolean} True if same number
 */
export function areSamePhoneNumbers(phone1, phone2, defaultCountry = 'IT') {
  if (!phone1 || !phone2) return false;

  try {
    const e164_1 = getE164Format(phone1, defaultCountry);
    const e164_2 = getE164Format(phone2, defaultCountry);
    return e164_1 === e164_2;
  } catch {
    return phone1.trim() === phone2.trim();
  }
}

/**
 * Get list of supported countries
 * @returns {Array<string>} Array of country codes
 */
export function getSupportedCountries() {
  return getCountries();
}

/**
 * Validate phone number for specific country
 * @param {string} phoneNumber - Phone number
 * @param {string} country - Country code
 * @returns {boolean} True if valid for that country
 */
export function isValidForCountry(phoneNumber, country) {
  try {
    return isValidPhoneNumber(phoneNumber, country);
  } catch {
    return false;
  }
}
