// =============================================
// FILE: src/components/registration/PasswordStrengthMeter.jsx
// Visual password strength indicator with requirements checklist
// =============================================
import React from 'react';
import {
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  getPasswordRequirements,
} from '@utils/validators';

export default function PasswordStrengthMeter({ password }) {
  const strength = calculatePasswordStrength(password);
  const level = getPasswordStrengthLevel(strength);
  const requirements = getPasswordRequirements(password);

  // Color schemes based on strength level
  const getColorClasses = () => {
    switch (level) {
      case 'weak':
        return {
          bg: 'bg-red-500',
          text: 'text-red-600 dark:text-red-400',
          border: 'border-red-500',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-600 dark:text-yellow-400',
          border: 'border-yellow-500',
        };
      case 'strong':
        return {
          bg: 'bg-green-500',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-500',
        };
      default:
        return {
          bg: 'bg-gray-300',
          text: 'text-gray-500',
          border: 'border-gray-300',
        };
    }
  };

  const colors = getColorClasses();

  // Don't show if password is empty
  if (!password) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 dark:text-gray-400 font-medium">
            Sicurezza password
          </span>
          <span className={`font-semibold ${colors.text}`}>
            {level === 'weak' && '❌ Debole'}
            {level === 'medium' && '⚠️ Media'}
            {level === 'strong' && '✅ Forte'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bg} transition-all duration-300 ease-out`}
            style={{ width: `${strength}%` }}
          />
        </div>

        {/* Percentage */}
        <div className="text-xs text-right text-gray-500 dark:text-gray-400">{strength}%</div>
      </div>

      {/* Requirements Checklist */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1.5">
        <p className="text-xs font-semibold text-neutral-700 dark:text-gray-300 mb-2">
          Requisiti password:
        </p>
        {requirements.map((req, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-sm mt-0.5">{req.met ? '✅' : req.required ? '❌' : '⭕'}</span>
            <span
              className={`text-xs ${
                req.met
                  ? 'text-green-600 dark:text-green-400 font-medium'
                  : req.required
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {req.label}
              {!req.required && ' (opzionale)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
