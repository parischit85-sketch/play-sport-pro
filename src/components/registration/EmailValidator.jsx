// =============================================
// FILE: src/components/registration/EmailValidator.jsx
// Real-time email validation with typo detection
// =============================================
import React, { useState, useEffect } from 'react';
import { validateAndNormalizeEmail } from '@utils/validators';

export default function EmailValidator({
  email,
  onChange,
  onValidationChange,
  label = 'Email *',
  placeholder = 'name@example.com',
  helpText = '',
  required = false,
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
      <label className="block text-sm font-medium text-neutral-700 text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => onChange?.(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 border-gray-600 bg-white bg-gray-700 text-neutral-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      {helpText && <p className="mt-1 text-xs text-gray-500 text-gray-400">{helpText}</p>}

      {/* Validation feedback */}
      {!isValidating && validation && (
        <>
          {/* Success message */}
          {validation.isValid && !validation.isDisposable && (
            <div className="flex items-start gap-2 text-xs text-green-600 text-green-400 bg-green-50 bg-green-900/20 border border-green-200 border-green-800 rounded-lg p-2">
              <span className="text-sm">✅</span>
              <div>
                <p className="font-medium">Email valida!</p>
                {validation.normalized !== email && (
                  <p className="text-green-600/80 text-green-400/80 mt-1">
                    Formato normalizzato: {validation.normalized}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Disposable email warning */}
          {validation.isDisposable && (
            <div className="flex items-start gap-2 text-xs text-orange-600 text-orange-400 bg-orange-50 bg-orange-900/20 border border-orange-200 border-orange-800 rounded-lg p-2">
              <span className="text-sm">⚠️</span>
              <div>
                <p className="font-medium">Email temporanea rilevata</p>
                <p className="text-orange-600/80 text-orange-400/80 mt-1">
                  Non accettiamo indirizzi email temporanei. Usa un indirizzo permanente.
                </p>
              </div>
            </div>
          )}

          {/* Typo suggestion */}
          {validation.suggestion && (
            <div className="flex items-start gap-2 text-xs text-blue-600 text-blue-400 bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-800 rounded-lg p-2">
              <span className="text-sm">💡</span>
              <div>
                <p className="font-medium">Possibile errore di battitura</p>
                <p className="text-blue-600/80 text-blue-400/80 mt-1">{validation.suggestion}</p>
                <button
                  type="button"
                  onClick={() => {
                    const corrected = email.replace(
                      validation.domain,
                      validation.suggestion.split('@')[1]
                    );
                    onChange?.(corrected);
                  }}
                  className="mt-1.5 text-xs font-medium text-blue-600 text-blue-400 hover:underline"
                >
                  Correggi automaticamente
                </button>
              </div>
            </div>
          )}

          {/* Errors */}
          {validation.errors && validation.errors.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-red-600 text-red-400 bg-red-50 bg-red-900/20 border border-red-200 border-red-800 rounded-lg p-2">
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
