/**
 * Secure form validation hook with comprehensive security features
 * Integrates input sanitization, rate limiting, and security validation
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  sanitizeHTML,
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  isValidEmail,
  validatePassword,
  isValidPhone,
  rateLimiter,
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken,
} from '../lib/security';

/**
 * Secure form validation hook
 * @param {object} initialValues - Initial form values
 * @param {object} validationRules - Validation rules for each field
 * @param {object} options - Additional options
 * @returns {object} Form state and handlers
 */
export const useSecureForm = (initialValues = {}, validationRules = {}, options = {}) => {
  const {
    enableRateLimit = true,
    maxSubmissions = 5,
    rateLimitWindow = 300000, // 5 minutes
    enableCSRF = true,
    sanitizeInputs = true,
    trackSecurityEvents = true,
  } = options;

  // Form state
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [securityWarnings, setSecurityWarnings] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');

  // Initialize CSRF token
  useEffect(() => {
    if (enableCSRF) {
      const token = generateCSRFToken();
      setCsrfToken(token);
      storeCSRFToken(token);
    }
  }, [enableCSRF]);

  // Generate unique identifier for rate limiting
  const rateLimitKey = useMemo(() => {
    return `form_${window.location.pathname}_${navigator.userAgent.substring(0, 50)}`;
  }, []);

  /**
   * Sanitize input value based on field type
   * @param {string} fieldName - Name of the field
   * @param {any} value - Input value
   * @returns {any} Sanitized value
   */
  const sanitizeValue = useCallback(
    (fieldName, value) => {
      if (!sanitizeInputs || typeof value !== 'string') return value;

      const rule = validationRules[fieldName];
      const fieldType = rule?.type || 'text';

      switch (fieldType) {
        case 'email':
          return sanitizeEmail(value);
        case 'phone':
          return sanitizePhone(value);
        case 'html':
          return sanitizeHTML(value);
        case 'text':
        default:
          return sanitizeText(value);
      }
    },
    [validationRules, sanitizeInputs]
  );

  /**
   * Validate a single field
   * @param {string} fieldName - Name of the field
   * @param {any} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  const validateField = useCallback(
    (fieldName, value) => {
      const rule = validationRules[fieldName];
      if (!rule) return null;

      const sanitizedValue = sanitizeValue(fieldName, value);

      // Required validation
      if (rule.required && (!sanitizedValue || sanitizedValue.toString().trim() === '')) {
        return rule.requiredMessage || `${fieldName} is required`;
      }

      // Skip other validations if field is empty and not required
      if (!sanitizedValue && !rule.required) return null;

      // Type-specific validations
      switch (rule.type) {
        case 'email':
          if (!isValidEmail(sanitizedValue)) {
            return rule.emailMessage || 'Please enter a valid email address';
          }
          break;

        case 'password':
          const passwordValidation = validatePassword(sanitizedValue);
          if (!passwordValidation.isValid) {
            const failedReqs = Object.entries(passwordValidation.requirements)
              .filter(([, passed]) => !passed)
              .map(([req]) => req);
            return rule.passwordMessage || `Password must meet: ${failedReqs.join(', ')}`;
          }
          break;

        case 'phone':
          if (!isValidPhone(sanitizedValue)) {
            return rule.phoneMessage || 'Please enter a valid phone number';
          }
          break;

        case 'number':
          const num = Number(sanitizedValue);
          if (isNaN(num)) {
            return rule.numberMessage || 'Please enter a valid number';
          }
          if (rule.min !== undefined && num < rule.min) {
            return `Value must be at least ${rule.min}`;
          }
          if (rule.max !== undefined && num > rule.max) {
            return `Value must be at most ${rule.max}`;
          }
          break;

        case 'text':
          if (rule.minLength && sanitizedValue.length < rule.minLength) {
            return `Minimum length is ${rule.minLength} characters`;
          }
          if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
            return `Maximum length is ${rule.maxLength} characters`;
          }
          break;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
        return rule.patternMessage || 'Invalid format';
      }

      // Custom validation function
      if (rule.validate && typeof rule.validate === 'function') {
        const customError = rule.validate(sanitizedValue, values);
        if (customError) return customError;
      }

      return null;
    },
    [validationRules, values, sanitizeValue]
  );

  /**
   * Validate all fields
   * @returns {object} Validation errors
   */
  const validateForm = useCallback(() => {
    const newErrors = {};

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    return newErrors;
  }, [values, validateField, validationRules]);

  /**
   * Handle input change with security measures
   * @param {string} fieldName - Name of the field
   * @param {any} value - New value
   */
  const handleChange = useCallback(
    (fieldName, value) => {
      // Sanitize input
      const sanitizedValue = sanitizeValue(fieldName, value);

      // Check for suspicious patterns
      const suspiciousPatterns = [/<script/i, /javascript:/i, /onload=/i, /onerror=/i, /onclick=/i];

      if (typeof sanitizedValue === 'string') {
        const hasSuspiciousContent = suspiciousPatterns.some((pattern) =>
          pattern.test(sanitizedValue)
        );

        if (hasSuspiciousContent && trackSecurityEvents) {
          setSecurityWarnings((prev) => [
            ...prev,
            {
              timestamp: Date.now(),
              field: fieldName,
              type: 'suspicious_input',
              value: value,
              sanitized: sanitizedValue,
            },
          ]);
        }
      }

      // Update form values
      setValues((prev) => ({
        ...prev,
        [fieldName]: sanitizedValue,
      }));

      // Clear field error if it exists
      if (errors[fieldName]) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: null,
        }));
      }
    },
    [sanitizeValue, errors, trackSecurityEvents]
  );

  /**
   * Handle field blur (validation on blur)
   * @param {string} fieldName - Name of the field
   */
  const handleBlur = useCallback(
    (fieldName) => {
      setTouched((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      const error = validateField(fieldName, values[fieldName]);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    },
    [validateField, values]
  );

  /**
   * Check rate limiting before submission
   * @returns {boolean} True if submission is allowed
   */
  const checkRateLimit = useCallback(() => {
    if (!enableRateLimit) return true;

    const isAllowed = rateLimiter.isAllowed(rateLimitKey, maxSubmissions, rateLimitWindow);

    if (!isAllowed && trackSecurityEvents) {
      setSecurityWarnings((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          type: 'rate_limit_exceeded',
          attempts: maxSubmissions,
          window: rateLimitWindow,
        },
      ]);
    }

    return isAllowed;
  }, [enableRateLimit, rateLimitKey, maxSubmissions, rateLimitWindow, trackSecurityEvents]);

  /**
   * Handle form submission with security checks
   * @param {function} onSubmit - Submission handler
   * @returns {Promise} Submission promise
   */
  const handleSubmit = useCallback(
    async (onSubmit) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      setSubmitAttempts((prev) => prev + 1);

      try {
        // Rate limiting check
        if (!checkRateLimit()) {
          throw new Error('Too many submission attempts. Please wait before trying again.');
        }

        // Form validation
        const formErrors = validateForm();
        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0) {
          throw new Error('Please fix validation errors before submitting');
        }

        // CSRF token validation
        if (enableCSRF) {
          const storedToken = getCSRFToken();
          if (!storedToken || storedToken !== csrfToken) {
            throw new Error('Security token invalid. Please refresh the page.');
          }
        }

        // Security audit before submission
        if (trackSecurityEvents && securityWarnings.length > 0) {
          console.warn('Security warnings detected:', securityWarnings);
        }

        // Prepare submission data with security headers
        const submissionData = {
          ...values,
          ...(enableCSRF && { _csrf: csrfToken }),
          _timestamp: Date.now(),
          _userAgent: navigator.userAgent.substring(0, 100),
        };

        // Call the actual submission handler
        await onSubmit(submissionData);

        // Reset form on successful submission
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setSubmitAttempts(0);
        setSecurityWarnings([]);

        // Generate new CSRF token
        if (enableCSRF) {
          const newToken = generateCSRFToken();
          setCsrfToken(newToken);
          storeCSRFToken(newToken);
        }
      } catch (error) {
        // Track security-related submission errors
        if (trackSecurityEvents) {
          setSecurityWarnings((prev) => [
            ...prev,
            {
              timestamp: Date.now(),
              type: 'submission_error',
              error: error.message,
              attempt: submitAttempts + 1,
            },
          ]);
        }

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      checkRateLimit,
      validateForm,
      enableCSRF,
      csrfToken,
      values,
      initialValues,
      trackSecurityEvents,
      securityWarnings,
      submitAttempts,
    ]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitAttempts(0);
    setSecurityWarnings([]);

    if (enableCSRF) {
      const newToken = generateCSRFToken();
      setCsrfToken(newToken);
      storeCSRFToken(newToken);
    }
  }, [initialValues, enableCSRF]);

  /**
   * Get field props for easy integration with input components
   * @param {string} fieldName - Name of the field
   * @returns {object} Field props
   */
  const getFieldProps = useCallback(
    (fieldName) => {
      return {
        value: values[fieldName] || '',
        onChange: (e) => handleChange(fieldName, e.target.value),
        onBlur: () => handleBlur(fieldName),
        error: touched[fieldName] ? errors[fieldName] : null,
        name: fieldName,
        'data-security-enabled': 'true',
      };
    },
    [values, handleChange, handleBlur, touched, errors]
  );

  /**
   * Get remaining submissions for rate limiting
   * @returns {number} Remaining submissions
   */
  const getRemainingSubmissions = useCallback(() => {
    if (!enableRateLimit) return Infinity;
    return rateLimiter.getRemaining(rateLimitKey, maxSubmissions, rateLimitWindow);
  }, [enableRateLimit, rateLimitKey, maxSubmissions, rateLimitWindow]);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    submitAttempts,

    // Security state
    securityWarnings,
    csrfToken,
    remainingSubmissions: getRemainingSubmissions(),

    // Form handlers
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    getFieldProps,

    // Validation
    validateField,
    validateForm,

    // Utilities
    isValid: Object.keys(validateForm()).length === 0,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
    hasSecurityWarnings: securityWarnings.length > 0,
  };
};

export default useSecureForm;
