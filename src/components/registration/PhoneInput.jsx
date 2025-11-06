// =============================================
// FILE: src/components/registration/PhoneInput.jsx
// Phone input with real-time formatting and validation
// =============================================
import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { themeTokens } from '@lib/theme.js';
import {
  validatePhone,
  formatPhoneNumber,
  sanitizePhoneInput,
  getPhoneRequirements,
} from '@utils/validators';

export default function PhoneInput({
  value,
  onChange,
  onValidationChange,
  label = 'Telefono *',
  placeholder = '+39 123 456 7890',
  helpText = '',
  required = false,
  T = themeTokens(),
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
      <label className={`block text-sm font-medium ${T.text} mb-2`}>
        {label}
      </label>
      <div className="relative">
        <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${T.subtext}`} />
        <input
          type="tel"
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`${T.input} w-full pl-12 pr-4`}
        />
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className={`animate-spin h-4 w-4 border-2 ${T.subtext} border-t-transparent rounded-full`} />
          </div>
        )}
      </div>
      {helpText && <p className={`mt-1 text-xs ${T.subtext}`}>{helpText}</p>}

      {/* Validation feedback */}
      {value && (
        <div className="space-y-2">
          {/* Validating indicator */}
          {isValidating && (
            <div className={`flex items-center gap-2 text-xs ${T.subtext}`}>
              <div className={`animate-spin h-3 w-3 border-2 ${T.subtext} border-t-transparent rounded-full`} />
              <span>Verifica numero...</span>
            </div>
          )}

          {/* Validation status */}
          {!isValidating && validation && (
            <>
              {/* Success */}
              {validation.isValid && (
                <div className={`flex items-start gap-2 text-xs ${T.accentGood} ${T.cardBg} border ${T.border} rounded-lg p-2`}>
                  <span className="text-sm">✅</span>
                  <div>
                    <p className="font-medium">Numero valido!</p>
                    <p className={`${T.accentGood} mt-1`}>
                      Formato: {validation.formatted}
                    </p>
                    {validation.country && (
                      <p className={`${T.accentGood}`}>
                        Paese: {validation.country}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Errors */}
              {!validation.isValid && validation.errors && (
                <div className={`flex items-start gap-2 text-xs ${T.accentBad} ${T.cardBg} border ${T.border} rounded-lg p-2`}>
                  <span className="text-sm">❌</span>
                  <div className="space-y-1">
                    {validation.errors.map((error, idx) => (
                      <p key={idx} className="font-medium">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements checklist */}
              {requirements.length > 0 && (
                <div className={`${T.cardBg} rounded-lg p-2 space-y-1`}>
                  <p className={`text-xs font-semibold ${T.text}`}>Requisiti:</p>
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs">{req.met ? '✅' : '❌'}</span>
                      <span
                        className={`text-xs ${req.met ? T.accentGood : T.subtext}`}
                      >
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
            <p className={`text-xs ${T.subtext}`}>
              💡 Formato: +39 seguito dal numero (es: +39 123 456 7890 o +39 02 1234 5678)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
