// =============================================
// FILE: src/components/registration/EmailValidator.jsx
// Real-time email validation with typo detection
// =============================================
import React, { useState, useEffect } from 'react';
import { validateAndNormalizeEmail } from '@utils/validators';
import { themeTokens } from '@lib/theme.js';

export default function EmailValidator({
  email,
  onChange,
  onValidationChange,
  label = 'Email *',
  placeholder = 'name@example.com',
  helpText = '',
  required = false,
  T = themeTokens(),
}) {
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!email) {
      setValidation(null);
      onValidationChange?.(null);
      return;
    }

    // Debounce validation (500ms)
    setIsValidating(true);
    const timer = setTimeout(() => {
      const result = validateAndNormalizeEmail(email);
      setValidation(result);
      onValidationChange?.(result);
      setIsValidating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [email, onValidationChange]);

  // Auto-apply normalization if valid
  useEffect(() => {
    if (validation?.isValid && validation.normalized !== email) {
      // Only auto-normalize if user hasn't typed for 1 second
      const timer = setTimeout(() => {
        onChange?.(validation.normalized);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [validation, email, onChange]);

  return (
    <div>
      {/* Email Input Field */}
      <label className={`block text-sm font-medium ${T.text} mb-2`}>
        {label}
      </label>
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => onChange?.(e.target.value)}
          required={required}
          placeholder={placeholder}
          className={`${T.input} w-full`}
        />
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className={`animate-spin h-4 w-4 border-2 ${T.subtext} border-t-transparent rounded-full`} />
          </div>
        )}
      </div>
      {helpText && <p className={`mt-1 text-xs ${T.subtext}`}>{helpText}</p>}

      {/* Validation feedback */}
      {!isValidating && validation && (
        <>
          {/* Success message */}
          {validation.isValid && !validation.isDisposable && (
            <div className={`flex items-start gap-2 text-xs ${T.accentGood} ${T.cardBg} border ${T.border} rounded-lg p-2`}>
              <span className="text-sm">✅</span>
              <div>
                <p className="font-medium">Email valida!</p>
                {validation.normalized !== email && (
                  <p className={`${T.accentGood} mt-1`}>
                    Formato normalizzato: {validation.normalized}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Disposable email warning */}
          {validation.isDisposable && (
            <div className={`flex items-start gap-2 text-xs ${T.accentBad} ${T.cardBg} border ${T.border} rounded-lg p-2`}>
              <span className="text-sm">⚠️</span>
              <div>
                <p className="font-medium">Email temporanea rilevata</p>
                <p className={`${T.accentBad} mt-1`}>
                  Non accettiamo indirizzi email temporanei. Usa un indirizzo permanente.
                </p>
              </div>
            </div>
          )}

          {/* Typo suggestion */}
          {validation.suggestion && (
            <div className={`flex items-start gap-2 text-xs ${T.text} ${T.cardBg} border ${T.border} rounded-lg p-2`}>
              <span className="text-sm">💡</span>
              <div>
                <p className="font-medium">Possibile errore di battitura</p>
                <p className={`${T.subtext} mt-1`}>{validation.suggestion}</p>
                <button
                  type="button"
                  onClick={() => {
                    const corrected = email.replace(
                      validation.domain,
                      validation.suggestion.split('@')[1]
                    );
                    onChange?.(corrected);
                  }}
                  className={`mt-1.5 text-xs font-medium ${T.link} hover:underline`}
                >
                  Correggi automaticamente
                </button>
              </div>
            </div>
          )}

          {/* Errors */}
          {validation.errors && validation.errors.length > 0 && (
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
        </>
      )}
    </div>
  );
}
