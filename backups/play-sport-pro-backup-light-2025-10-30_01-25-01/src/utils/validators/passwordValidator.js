// =============================================
// FILE: src/utils/validators/passwordValidator.js
// Password validation - Simple and user-friendly
// =============================================

/**
 * Calculate password strength score (0-100)
 * @param {string} password - Password to evaluate
 * @returns {number} Strength score (0-100)
 */
export function calculatePasswordStrength(password) {
  if (!password) return 0;

  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;

  // Character variety scoring
  if (/[A-Z]/.test(password)) score += 15; // Uppercase
  if (/[a-z]/.test(password)) score += 15; // Lowercase
  if (/[0-9]/.test(password)) score += 10; // Numbers
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10; // Special chars

  // Deductions
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated chars (aaa, 111)
  if (/^[0-9]+$/.test(password)) score -= 20; // Only numbers
  if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Only letters

  return Math.max(0, Math.min(100, score));
}

/**
 * Get password strength level
 * @param {number} score - Password strength score
 * @returns {'weak' | 'medium' | 'strong'} Strength level
 */
export function getPasswordStrengthLevel(score) {
  if (score < 40) return 'weak';
  if (score < 70) return 'medium';
  return 'strong';
}

/**
 * Validate password with simple checks
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export function validatePassword(password) {
  const errors = [];

  // Required checks
  if (!password) {
    return {
      isValid: false,
      errors: ['La password è obbligatoria'],
      strength: 0,
      strengthLevel: 'weak',
    };
  }

  // Simple length check: minimum 6 characters
  if (password.length < 6) {
    errors.push('La password deve contenere almeno 6 caratteri');
  }

  const strength = calculatePasswordStrength(password);
  const strengthLevel = getPasswordStrengthLevel(strength);

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    strengthLevel,
    suggestions: errors.length === 0 ? [] : ['💡 Usa almeno 6 caratteri'],
  };
}

/**
 * Generate helpful suggestions based on validation errors
 * @param {string} password - Password being validated
 * @param {Array<string>} errors - Current errors
 * @returns {Array<string>} Suggestions
 */
function generateSuggestions(password, errors) {
  const suggestions = [];

  if (password.length < 12) {
    suggestions.push('💡 Usa almeno 12 caratteri per maggiore sicurezza');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    suggestions.push('💡 Aggiungi caratteri speciali come !@#$%^&*');
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    suggestions.push('💡 Combina lettere maiuscole e minuscole');
  }

  if (!/[0-9]/.test(password)) {
    suggestions.push('💡 Inserisci almeno un numero');
  }

  return suggestions;
}

/**
 * Check if password meets minimum requirements (for form submission)
 * @param {string} password - Password to check
 * @returns {boolean} True if meets minimum requirements
 */
export function passwordMeetsMinimumRequirements(password) {
  if (!password || password.length < 6) return false;

  const validation = validatePassword(password);
  return validation.isValid;
}

/**
 * Get password requirements checklist
 * @param {string} password - Current password
 * @returns {Array<Object>} Requirements with status
 */
export function getPasswordRequirements(password = '') {
  return [
    {
      label: 'Almeno 8 caratteri',
      met: password.length >= 8,
      required: true,
    },
    {
      label: 'Contiene carattere speciale (!@#$%^&*...)',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      required: true,
    },
  ];
}
