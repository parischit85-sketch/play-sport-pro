// =============================================
// FILE: src/components/registration/PhoneInput.jsx
// Phone input with real-time formatting and validation
// =============================================
import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { 
  validatePhone, 
  formatPhoneNumber, 
  sanitizePhoneInput,
  getPhoneRequirements 
} from '@utils/validators';

export default function PhoneInput({ 
  value, 
  onChange, 
  onValidationChange,
  label = 'Telefono *',
  placeholder = '+39 123 456 7890',
  helpText = '',
  required = false
}) {
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate phone on change (debounced)
  useEffect(() => {
    if (!value) {
      setValidation(null);
      onValidationChange?.(null);
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(() => {
      const result = validatePhone(value);
      setValidation(result);
      onValidationChange?.(result);
      setIsValidating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, onValidationChange]);

  const handleChange = (e) => {
    const raw = e.target.value;
    // Sanitize input (remove invalid characters)
    const sanitized = sanitizePhoneInput(raw);
    onChange?.(sanitized);
  };

  const handleBlur = () => {
    // Auto-format on blur if valid
    if (validation?.isValid && validation.formatted) {
      onChange?.(validation.formatted);
    }
  };

  const requirements = getPhoneRequirements(value);

  return (
    <div>
      {/* Phone Input Label */}
      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="tel"
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      {helpText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
      )}

      {/* Validation feedback */}

      {/* Validation feedback */}
      {value && (
        <div className="space-y-2">
          {/* Validating indicator */}
          {isValidating && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full" />
              <span>Verifica numero...</span>
            </div>
          )}

          {/* Validation status */}
          {!isValidating && validation && (
            <>
              {/* Success */}
              {validation.isValid && (
                <div className="flex items-start gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2">
                  <span className="text-sm">✅</span>
                  <div>
                    <p className="font-medium">Numero valido!</p>
                    <p className="text-green-600/80 dark:text-green-400/80 mt-1">
                      Formato: {validation.formatted}
                    </p>
                    {validation.country && (
                      <p className="text-green-600/80 dark:text-green-400/80">
                        Paese: {validation.country}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Errors */}
              {!validation.isValid && validation.errors && (
                <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                  <span className="text-sm">❌</span>
                  <div className="space-y-1">
                    {validation.errors.map((error, idx) => (
                      <p key={idx} className="font-medium">{error}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements checklist */}
              {requirements.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 space-y-1">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-gray-300">
                    Requisiti:
                  </p>
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs">
                        {req.met ? '✅' : '❌'}
                      </span>
                      <span className={`text-xs ${req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Help text */}
          {!validation && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Formato: +39 seguito dal numero (es: +39 123 456 7890 o +39 02 1234 5678)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
