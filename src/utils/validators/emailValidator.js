// =============================================
// FILE: src/utils/validators/emailValidator.js
// Email validation and normalization
// =============================================

/**
 * Normalize email address to prevent duplicates
 * @param {string} email - Email address to normalize
 * @returns {string} Normalized email
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';

  // Convert to lowercase and trim whitespace
  let normalized = email.toLowerCase().trim();

  // Remove dots from Gmail addresses (gmail ignores dots)
  // example: john.doe@gmail.com === johndoe@gmail.com
  const [localPart, domain] = normalized.split('@');
  
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Remove dots from local part
    const cleanedLocal = localPart.replace(/\./g, '');
    
    // Remove plus addressing (everything after +)
    // example: john+test@gmail.com === john@gmail.com
    const [baseName] = cleanedLocal.split('+');
    
    normalized = `${baseName}@gmail.com`;
  }

  return normalized;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export function validateEmail(email) {
  const errors = [];

  // Required check
  if (!email) {
    return {
      isValid: false,
      errors: ['L\'email è obbligatoria'],
      normalized: '',
    };
  }

  // Trim and check again
  email = email.trim();
  if (!email) {
    return {
      isValid: false,
      errors: ['L\'email è obbligatoria'],
      normalized: '',
    };
  }

  // Basic format check with comprehensive regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    errors.push('Formato email non valido');
  }

  // Check for double @
  if ((email.match(/@/g) || []).length !== 1) {
    errors.push('L\'email deve contenere una sola @');
  }

  // Check email length
  if (email.length > 254) {
    errors.push('L\'email è troppo lunga (max 254 caratteri)');
  }

  // Check local part length (before @)
  const [localPart, domain] = email.split('@');
  if (localPart && localPart.length > 64) {
    errors.push('La parte prima di @ è troppo lunga (max 64 caratteri)');
  }

  // Check domain
  if (domain) {
    // Domain should have at least one dot
    if (!domain.includes('.')) {
      errors.push('Il dominio deve includere un punto (es: .com, .it)');
    }

    // Domain should not start or end with dot or hyphen
    if (domain.startsWith('.') || domain.startsWith('-') || domain.endsWith('.') || domain.endsWith('-')) {
      errors.push('Dominio non valido');
    }

    // TLD (Top Level Domain) should be at least 2 characters
    const tld = domain.split('.').pop();
    if (tld && tld.length < 2) {
      errors.push('Estensione dominio non valida');
    }
  }

  // Check for common typos in popular domains
  const commonTypos = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
  };

  let suggestion = null;
  if (domain && commonTypos[domain.toLowerCase()]) {
    suggestion = `Forse intendevi: ${localPart}@${commonTypos[domain.toLowerCase()]}?`;
  }

  const normalized = normalizeEmail(email);

  return {
    isValid: errors.length === 0,
    errors,
    normalized,
    suggestion,
    domain: domain || '',
  };
}

/**
 * Check if email is from a disposable/temporary email provider
 * @param {string} email - Email to check
 * @returns {boolean} True if disposable
 */
export function isDisposableEmail(email) {
  if (!email) return false;

  const disposableDomains = [
    'tempmail.com',
    'guerrillamail.com',
    '10minutemail.com',
    'mailinator.com',
    'throwaway.email',
    'temp-mail.org',
    'getnada.com',
    'maildrop.cc',
    'sharklasers.com',
    'guerrillamail.info',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}

/**
 * Check if email already exists in Firestore
 * @param {string} email - Email to check
 * @param {Object} db - Firestore database instance
 * @param {string} excludeUserId - Optional user ID to exclude from check (for profile updates)
 * @returns {Promise<boolean>} True if email exists
 */
export async function checkEmailExists(email, db, excludeUserId = null) {
  if (!email || !db) return false;

  const normalized = normalizeEmail(email);
  
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    // Check in users collection
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', normalized));
    const snapshot = await getDocs(q);

    // If excluding a user (for profile updates), check if any other user has this email
    if (excludeUserId) {
      return snapshot.docs.some(doc => doc.id !== excludeUserId);
    }

    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking email existence:', error);
    // On error, assume email doesn't exist (fail open for better UX)
    return false;
  }
}

/**
 * Get email validation requirements checklist
 * @param {string} email - Current email
 * @returns {Array<Object>} Requirements with status
 */
export function getEmailRequirements(email = '') {
  const validation = validateEmail(email);
  
  return [
    {
      label: 'Formato valido (es: nome@dominio.com)',
      met: validation.isValid,
      required: true,
    },
    {
      label: 'Non un indirizzo temporaneo',
      met: !isDisposableEmail(email),
      required: true,
    },
  ];
}

/**
 * Validate and normalize email (combined function for convenience)
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with normalized email
 */
export function validateAndNormalizeEmail(email) {
  const validation = validateEmail(email);
  
  return {
    ...validation,
    isDisposable: isDisposableEmail(email),
  };
}
